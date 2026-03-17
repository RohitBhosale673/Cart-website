import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Search, Plus, Minus, Trash2, ShoppingCart, Send, Printer, ShieldCheck } from 'lucide-react';
import { db } from '../db/db';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Billing.css';

const Billing = () => {
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [productSearch, setProductSearch] = useState('');

  // Payment State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountReceived, setAmountReceived] = useState('');

  const products = useLiveQuery(() => db.products.toArray(), []) || [];
  const customers = useLiveQuery(() => db.customers.toArray(), []) || [];

  const filteredProducts = useMemo(() => {
    if (!productSearch) return products;
    return products.filter(p =>
      p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.marathiName?.includes(productSearch)
    );
  }, [productSearch, products]);

  const activeCustomer = useMemo(() => {
    return customers.find(c => c.id === Number(selectedCustomer)) || null;
  }, [selectedCustomer, customers]);

  // Cart Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * (Number(item.quantity) || 0)), 0);
  const previousBalance = activeCustomer ? activeCustomer.pendingBalance : 0;
  const grandTotal = subtotal + previousBalance;

  // Actions
  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: (Number(item.quantity) || 0) + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setProductSearch('');
  };

  const updateQuantity = (id, change) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQ = Math.max(0, (Number(item.quantity) || 0) + change);
        return newQ >= 0 ? { ...item, quantity: parseFloat(newQ.toFixed(3)) } : item;
      }
      return item;
    }));
  };

  const handleQuantityChange = (id, value) => {
    // Keep it as a string while typing to allow decimal points
    setCart(cart.map(item =>
      item.id === id ? { ...item, quantity: value } : item
    ));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };


  const handleProcessPayment = async () => {
    if (cart.length === 0) {
      Swal.fire('Empty Cart', 'Please add items to the cart.', 'warning');
      return;
    }
    if (!activeCustomer) {
      Swal.fire('No Customer', 'Please select a customer first.', 'warning');
      return;
    }

    setShowPaymentModal(true);
    setAmountReceived(grandTotal.toString());
  };

  const finalizeBill = async (e) => {
    e.preventDefault();
    try {
      const receivedNum = Number(amountReceived) || 0;
      let newPendingBalance = 0;

      // Calculate new Udhari logic
      if (paymentMethod === 'Udhari') {
        newPendingBalance = grandTotal; // Completely unpaid
      } else {
        // Partial or full payment
        newPendingBalance = grandTotal - receivedNum;
        if (newPendingBalance < 0) newPendingBalance = 0; // Prevent negative udhari for simplicity
      }

      const billData = {
        customerId: activeCustomer.id,
        date: Date.now(),
        items: cart,
        subtotal,
        previousBalance,
        totalAmount: grandTotal,
        amountPaid: receivedNum,
        paymentMethod,
        status: newPendingBalance > 0 ? 'Pending' : 'Paid'
      };

      // 1. Save Bill
      const billId = await db.bills.add(billData);

      // 2. Update Customer Balance
      await db.customers.update(activeCustomer.id, {
        pendingBalance: newPendingBalance
      });

      // 3. Decrease Product Stock
      for (const item of cart) {
        const product = await db.products.get(item.id);
        if (product && product.stock > 0) {
          await db.products.update(item.id, { stock: Math.max(0, product.stock - (Number(item.quantity) || 0)) });
        }
      }

      Swal.fire('Success', 'Bill created successfully!', 'success');

      generatePDF(billData, billId);

      // Reset
      setCart([]);
      setSelectedCustomer('');
      setShowPaymentModal(false);

    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to process bill', 'error');
    }
  };

  const generatePDF = (billData, billId) => {
    const doc = new jsPDF();

    // Shop Header
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129); // Primary color
    doc.text('KiranaShop', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Your Trusted Local Store', 105, 27, { align: 'center' });
    doc.text('Date: ' + new Date(billData.date).toLocaleString(), 105, 33, { align: 'center' });
    doc.text('Bill No: #' + billId, 105, 39, { align: 'center' });

    // Customer Info
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('Customer: ' + activeCustomer.name, 14, 55);
    doc.text('Mobile: ' + activeCustomer.mobile, 14, 62);

    // Items Table
    const tableColumn = ["Item", "Unit Price", "Qty", "Total"];
    const tableRows = [];

    billData.items.forEach(item => {
      const itemData = [
        item.name,
        'Rs. ' + item.price,
        item.quantity,
        'Rs. ' + (item.price * item.quantity).toFixed(2)
      ];
      tableRows.push(itemData);
    });

    autoTable(doc, {
      startY: 70,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] },
      margin: { top: 10 }
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    // Totals
    doc.setFontSize(11);
    doc.text('Subtotal: Rs. ' + billData.subtotal.toFixed(2), 140, finalY);
    doc.text('Previous Udhari: Rs. ' + billData.previousBalance.toFixed(2), 140, finalY + 7);

    doc.setFontSize(14);
    doc.setTextColor(16, 185, 129);
    doc.text('Grand Total: Rs. ' + billData.totalAmount.toFixed(2), 140, finalY + 17);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Payment Mode: ' + billData.paymentMethod, 14, finalY + 17);
    doc.text('Amount Paid: Rs. ' + billData.amountPaid.toFixed(2), 14, finalY + 24);
    doc.text('Remaining Balance: Rs. ' + Math.max(0, billData.totalAmount - billData.amountPaid).toFixed(2), 14, finalY + 31);

    // Footer
    doc.setFontSize(10);
    doc.text('Thank you for shopping with us!', 105, 280, { align: 'center' });

    // For Web View
    doc.save('Bill_' + activeCustomer.name.replace(/ /g, '_') + '_' + billId + '.pdf');
  };

  return (
    <div className="billing-page flex h-full gap-4">
      {/* LEFT PANEL: Selection */}
      <div className="billing-left card flex flex-col h-full bg-white">
        <h3 className="mb-4 flex items-center gap-2"><ShoppingCart size={20} /> Point of Sale</h3>

        {/* Customer Select */}
        <div className="form-group mb-4">
          <label className="form-label">Select Customer / Vykati *</label>
          <select
            className="form-control"
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
          >
            <option value="">-- Choose Customer --</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.mobile})</option>
            ))}
          </select>
        </div>

        {activeCustomer && (
          <div className="customer-alert mb-4">
            <ShieldCheck size={16} className="text-green" />
            <span className="text-sm font-bold ml-1 text-green">Active: {activeCustomer.name}</span>
            <span className="text-sm float-right">Prev Balance: <strong className="text-red">₹{activeCustomer.pendingBalance || 0}</strong></span>
          </div>
        )}

        {/* Product Search */}
        <div className="form-group mb-4">
          <div className="search-box">
            <Search size={18} className="search-icon text-muted" />
            <input
              type="text"
              className="form-control"
              placeholder="Search products to add..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="products-grid flex-1 overflow-y-auto pr-2">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="product-card"
              onClick={() => addToCart(product)}
            >
              <div className="product-name">{product.name}</div>
              <div className="product-marathi">{product.marathiName}</div>
              <div className="product-price">₹{product.price}</div>
              <div className="add-overlay"><Plus size={24} /></div>
            </div>
          ))}
          {filteredProducts.length === 0 && <p className="text-center text-muted col-span-full pt-8">No products found.</p>}
        </div>
      </div>

      {/* RIGHT PANEL: Cart */}
      <div className="billing-right card flex flex-col h-full bg-white">
        <div className="cart-header border-b pb-3 mb-3">
          <h3 className="flex items-center gap-2">Current Bill</h3>
        </div>

        <div className="cart-items flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="empty-cart flex flex-col items-center justify-center h-full text-muted opacity-50">
              <ShoppingCart size={48} className="mb-2" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item border-b pb-3 mb-3">
                <div className="flex justify-between font-bold mb-1">
                  <span>{item.name}</span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted text-marathi">{item.marathiName}  (₹{item.price}/ea)</span>
                    <div className="flex flex-col items-end gap-2">
                       <div className="flex items-center gap-1 qty-controls">
                          <button onClick={() => updateQuantity(item.id, -1)} className="qty-btn" title="Decrease 1"><Minus size={12} /></button>
                          <input 
                            type="number" 
                            step="0.001"
                            className="qty-input font-bold w-16 text-center border rounded px-1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          />
                          <button onClick={() => updateQuantity(item.id, 1)} className="qty-btn" title="Increase 1"><Plus size={12} /></button>
                          <button onClick={() => removeFromCart(item.id)} className="text-red ml-2" title="Remove"><Trash2 size={16} /></button>
                       </div>
                       <div className="weight-chips">
                          <button onClick={() => updateQuantity(item.id, 0.25)} className="weight-chip">+250g</button>
                          <button onClick={() => updateQuantity(item.id, 0.5)} className="weight-chip">+500g</button>
                       </div>
                    </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Totals */}
        <div className="cart-totals border-t pt-4 mt-auto">
          <div className="flex justify-between mb-2 text-sm text-muted">
            <span>Subtotal (Items: {cart.length})</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>

          {activeCustomer && (
            <div className="flex justify-between mb-2 text-sm text-red font-bold">
              <span>Previous Udhari (Credit)</span>
              <span>+ ₹{previousBalance.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between mb-4 text-xl font-bold pt-2 border-t text-primary">
            <span>Grand Total</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>

          <button
            onClick={handleProcessPayment}
            className="btn btn-primary w-full py-3 text-lg flex justify-center gap-2 items-center"
            disabled={cart.length === 0 || !activeCustomer}
          >
            Process Payment <Send size={20} />
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="modal-content card" style={{ maxWidth: '450px' }}>
            <div className="modal-header bg-slate-50 -mx-6 -mt-6 p-6 border-b rounded-t-lg">
              <h3 className="m-0 text-xl font-bold">Complete Bill</h3>
              <button onClick={() => setShowPaymentModal(false)} className="close-btn">&times;</button>
            </div>

            <form onSubmit={finalizeBill} className="modal-body pt-6">
              <div className="text-center mb-6">
                <p className="text-sm text-muted mb-1">Total Payable Amount</p>
                <h2 className="text-4xl text-primary font-bold">₹{grandTotal.toFixed(2)}</h2>
              </div>

              <div className="form-group mb-6">
                <label className="form-label font-bold mb-3">Payment Method</label>
                <div className="grid grid-cols-3 gap-2 payment-methods">
                  {['Cash', 'Online (UPI)', 'Udhari'].map(method => (
                    <div
                      key={method}
                      className={'method-card ' + (paymentMethod === method ? 'active' : '')}
                      onClick={() => setPaymentMethod(method)}
                    >
                      {method}
                    </div>
                  ))}
                </div>
              </div>

              {paymentMethod !== 'Udhari' && (
                <div className="form-group bg-slate-50 p-4 rounded-lg border">
                  <label className="form-label font-bold">Amount Received (₹)</label>
                  <input
                    type="number"
                    className="form-control text-lg text-center font-bold"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    required
                    min="0"
                  />
                  {Number(amountReceived) < grandTotal && (
                    <p className="text-sm text-red mt-2 flex items-center gap-1 font-bold">
                      <Trash2 size={14} className="opacity-0" />
                      Remaining ₹{(grandTotal - Number(amountReceived)).toFixed(2)} will be added to Udhari.
                    </p>
                  )}
                </div>
              )}

              <div className="modal-footer mt-6 flex gap-3">
                <button type="submit" className="btn btn-primary flex-1 py-3 text-lg flex justify-center items-center gap-2">
                  <Printer size={20} /> Generate Bill & Print
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
