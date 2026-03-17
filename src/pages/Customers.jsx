import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Search, Edit2, History, Users as UsersIcon } from 'lucide-react';
import { db } from '../db/db';
import Swal from 'sweetalert2';
import './Customers.css';

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    address: '',
    pendingBalance: ''
  });

  const customers = useLiveQuery(
    () => db.customers
      .filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.mobile.includes(searchTerm)
      )
      .reverse()
      .sortBy('createdAt'),
    [searchTerm]
  );

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setCurrentCustomer(customer);
      setFormData({ ...customer });
    } else {
      setCurrentCustomer(null);
      setFormData({ name: '', mobile: '', address: '', pendingBalance: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCustomer(null);
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        pendingBalance: formData.pendingBalance ? Number(formData.pendingBalance) : 0,
        createdAt: currentCustomer ? currentCustomer.createdAt : Date.now()
      };

      if (currentCustomer) {
        await db.customers.update(currentCustomer.id, dataToSave);
        Swal.fire('Updated!', 'Customer details updated.', 'success');
      } else {
        await db.customers.add(dataToSave);
        Swal.fire('Added!', 'New customer registered.', 'success');
      }
      handleCloseModal();
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to save customer.', 'error');
    }
  };

  const handleReceivePayment = async (customer) => {
    if (!customer.pendingBalance || customer.pendingBalance <= 0) return;

    const { value: amount } = await Swal.fire({
      title: 'Receive Pending Payment',
      input: 'number',
      inputLabel: 'Current Udhari: ₹' + customer.pendingBalance,
      inputPlaceholder: 'Enter amount received',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value || value <= 0) {
          return 'Please enter a valid amount!';
        }
        if (value > customer.pendingBalance) {
          return 'Amount cannot be greater than pending balance!';
        }
      }
    });

    if (amount) {
      try {
        await db.customers.update(customer.id, {
          pendingBalance: customer.pendingBalance - Number(amount)
        });
        Swal.fire('Success', '₹' + amount + ' received from ' + customer.name, 'success');
      } catch (err) {
        Swal.fire('Error', 'Failed to update balance', 'error');
      }
    }
  };


  return (
    <div className="customers-page products-page">
      <div className="page-header flex justify-between items-center mb-4">
        <div>
          <h2>Customers Directory</h2>
          <p className="text-muted">Manage clients and track their Udhari (Credit)</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          <Plus size={18} /> Add Customer
        </button>
      </div>

      <div className="card filters-card mb-4">
        <div className="search-box mx-auto" style={{ maxWidth: '500px' }}>
          <Search size={18} className="search-icon text-muted" />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search by name or mobile number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card table-card table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Contact Info</th>
              <th>Pending Udhari (₹)</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers?.length === 0 ? (
              <tr>
                 <td colSpan="4" className="text-center p-6 text-muted">
                    <UsersIcon size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No customers found.</p>
                 </td>
              </tr>
            ) : (
              customers?.map(customer => (
                <tr key={customer.id}>
                  <td>
                    <div className="font-bold text-lg">{customer.name}</div>
                  </td>
                  <td>
                    <div>{customer.mobile}</div>
                    <div className="text-muted text-sm">{customer.address || 'No Address'}</div>
                  </td>
                  <td>
                    <span className={'badge text-sm ' + (customer.pendingBalance > 0 ? 'badge-danger' : 'badge-success')}>
                      ₹{customer.pendingBalance || 0}
                    </span>
                  </td>
                  <td className="text-right">
                    {customer.pendingBalance > 0 && (
                       <button onClick={() => handleReceivePayment(customer)} className="btn btn-success action-btn mr-2" style={{ backgroundColor: '#10B981', color: 'white', border: 'none' }} title="Receive Payment">
                         Clear Udhari
                       </button>
                    )}
                    <button onClick={() => handleOpenModal(customer)} className="btn btn-secondary action-btn mr-2" title="Edit Customer">
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-secondary action-btn" title="View History (Coming soon)">
                      <History size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <div className="modal-header">
              <h3>{currentCustomer ? 'Edit Customer' : 'Register Customer'}</h3>
              <button onClick={handleCloseModal} className="close-btn">&times;</button>
            </div>
            
            <form onSubmit={handleSaveCustomer} className="modal-body">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input type="text" className="form-control" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Customer Name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <input type="tel" className="form-control" required pattern="[0-9]{10}" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} placeholder="10 digit number" title="Please enter a valid 10-digit mobile number" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address (Optional)</label>
                <textarea className="form-control" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Customer address..."></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Previous Pending Balance (Udhari) ₹</label>
                <input type="number" step="0.01" className="form-control" value={formData.pendingBalance} onChange={e => setFormData({...formData, pendingBalance: e.target.value})} placeholder="e.g. 500" disabled={!!currentCustomer} title={currentCustomer ? "Use 'Clear Udhari' button to update balance" : ""} />
                {currentCustomer && <small className="text-muted">Use the 'Clear Udhari' button on the table to update existing balances.</small>}
              </div>

              <div className="modal-footer mt-4 flex justify-between">
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {currentCustomer ? 'Update Profile' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
