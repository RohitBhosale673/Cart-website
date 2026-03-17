import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { FileText, Download, Filter, IndianRupee } from 'lucide-react';
import { db } from '../db/db';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Reports.css';

const Reports = () => {
  const today = new Date();
  const [startDate, setStartDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  const customers = useLiveQuery(() => db.customers.toArray(), []) || [];

  const bills = useLiveQuery(async () => {
    const start = new Date(startDate).setHours(0, 0, 0, 0);
    const end = new Date(endDate).setHours(23, 59, 59, 999);
    return db.bills
      .where('date')
      .between(start, end, true, true)
      .reverse()
      .sortBy('date');
  }, [startDate, endDate]) || [];

  const totalSales = useMemo(() => bills.reduce((sum, b) => sum + b.totalAmount, 0), [bills]);
  const totalPaid = useMemo(() => bills.reduce((sum, b) => sum + b.amountPaid, 0), [bills]);
  const totalUdhariGiven = useMemo(() => bills.reduce((sum, b) => sum + Math.max(0, b.totalAmount - b.amountPaid), 0), [bills]);

  const getCustomerName = (id) => {
    const c = customers.find(c => c.id === id);
    return c ? c.name : 'Unknown';
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(16, 185, 129);
    doc.text('KiranaShop - Sales Report', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Period: ' + startDate + ' to ' + endDate, 105, 28, { align: 'center' });

    const rows = bills.map(b => [
      '#' + b.id,
      new Date(b.date).toLocaleDateString('en-IN'),
      getCustomerName(b.customerId),
      'Rs. ' + b.subtotal,
      'Rs. ' + b.totalAmount,
      b.paymentMethod,
      b.status,
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Bill#', 'Date', 'Customer', 'Subtotal', 'Total', 'Payment', 'Status']],
      body: rows,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] },
    });

    const finalY = doc.lastAutoTable.finalY + 14;
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('Total Sales: Rs. ' + totalSales.toFixed(2), 14, finalY);
    doc.text('Total Paid: Rs. ' + totalPaid.toFixed(2), 14, finalY + 8);
    doc.text('Total Udhari Given: Rs. ' + totalUdhariGiven.toFixed(2), 14, finalY + 16);

    doc.save('SalesReport_' + startDate + '_' + endDate + '.pdf');
  };

  return (
    <div className="reports-page animation-fade-in">
      <div className="page-header flex justify-between items-center mb-4">
        <div>
          <h2>Sales Reports</h2>
          <p className="text-muted">Filter and export your billing history</p>
        </div>
        <button onClick={exportPDF} className="btn btn-primary">
          <Download size={18} /> Export PDF
        </button>
      </div>

      {/* Filters */}
      <div className="card filters-card mb-4">
        <div className="flex items-center gap-4 flex-wrap">
          <Filter size={18} className="text-muted" />
          <div className="form-group" style={{ margin: 0, flexGrow: 1 }}>
            <label className="form-label">From Date</label>
            <input type="date" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="form-group" style={{ margin: 0, flexGrow: 1 }}>
            <label className="form-label">To Date</label>
            <input type="date" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card stat-card" style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white' }}>
          <div className="stat-icon" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <IndianRupee size={24} color="white" />
          </div>
          <div className="stat-details">
            <p className="stat-label" style={{ color: 'rgba(255,255,255,0.8)' }}>Total Sales</p>
            <h3 className="stat-value" style={{ color: 'white' }}>₹{totalSales.toFixed(2)}</h3>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon bg-blue-light"><IndianRupee size={24} className="text-blue" /></div>
          <div className="stat-details">
            <p className="stat-label">Paid Amount</p>
            <h3 className="stat-value">₹{totalPaid.toFixed(2)}</h3>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon bg-red-light"><IndianRupee size={24} className="text-red" /></div>
          <div className="stat-details">
            <p className="stat-label">Udhari Given</p>
            <h3 className="stat-value" style={{ color: 'var(--color-danger)' }}>₹{totalUdhariGiven.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="card table-card table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Bill #</th>
              <th>Date & Time</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Method</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bills.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center p-6 text-muted">
                  <FileText size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No bills found for selected period.</p>
                </td>
              </tr>
            ) : (
              bills.map(bill => (
                <tr key={bill.id}>
                  <td className="font-bold text-muted">#{bill.id}</td>
                  <td>{new Date(bill.date).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td className="font-bold">{getCustomerName(bill.customerId)}</td>
                  <td><span className="badge badge-warning">{bill.items?.length || 0} items</span></td>
                  <td className="font-bold text-lg">₹{bill.totalAmount}</td>
                  <td>₹{bill.amountPaid}</td>
                  <td><span className="badge badge-success">{bill.paymentMethod}</span></td>
                  <td>
                    <span className={'badge ' + (bill.status === 'Paid' ? 'badge-success' : 'badge-danger')}>
                      {bill.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
