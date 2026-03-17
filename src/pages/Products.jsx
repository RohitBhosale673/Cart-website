import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';
import { db } from '../db/db';
import Swal from 'sweetalert2';
import './Products.css';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    marathiName: '',
    category: '',
    price: '',
    stock: ''
  });

  // Fetch products from Dexie
  const products = useLiveQuery(
    () => {
      let collection = db.products.toCollection();
      
      if (categoryFilter) {
        collection = db.products.where('category').equals(categoryFilter);
      }
      
      return collection.toArray().then(arr => 
        arr.filter(p => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          p.marathiName.includes(searchTerm)
        )
      );
    },
    [searchTerm, categoryFilter]
  );

  const categories = ['Grocery', 'Spices', 'Oils', 'Snacks', 'Personal Care', 'Cleaning', 'Other'];

  const handleOpenModal = (product = null) => {
    if (product) {
      setCurrentProduct(product);
      setFormData({ ...product });
    } else {
      setCurrentProduct(null);
      setFormData({ name: '', marathiName: '', category: '', price: '', stock: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        price: Number(formData.price),
        stock: formData.stock ? Number(formData.stock) : 0
      };

      if (currentProduct) {
        await db.products.update(currentProduct.id, dataToSave);
        Swal.fire('Updated!', 'Product has been updated.', 'success');
      } else {
        await db.products.add(dataToSave);
        Swal.fire('Added!', 'New product added successfully.', 'success');
      }
      handleCloseModal();
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to save product.', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      await db.products.delete(id);
      Swal.fire('Deleted!', 'Product has been deleted.', 'success');
    }
  };

  return (
    <div className="products-page">
      <div className="page-header flex justify-between items-center mb-4">
        <div>
          <h2>Product Inventory</h2>
          <p className="text-muted">Manage all store items and prices</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          <Plus size={18} /> Add New Product
        </button>
      </div>

      <div className="card filters-card mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="search-box">
            <Search size={18} className="search-icon text-muted" />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search by English or Marathi name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-box">
            <select 
              className="form-control" 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card table-card table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price (₹)</th>
              <th>Stock</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products?.length === 0 ? (
              <tr>
                 <td colSpan="5" className="text-center p-6 text-muted">
                    <Package size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No products found. Start by adding some inventory!</p>
                 </td>
              </tr>
            ) : (
              products?.map(product => (
                <tr key={product.id}>
                  <td>
                    <div className="font-bold">{product.name}</div>
                    <div className="text-muted text-sm">{product.marathiName}</div>
                  </td>
                  <td><span className="badge badge-success">{product.category || 'N/A'}</span></td>
                  <td className="font-bold text-lg">₹{product.price}</td>
                  <td>
                    <span className={'badge ' + (product.stock > 10 ? 'badge-success' : 'badge-danger')}>
                      {product.stock} units
                    </span>
                  </td>
                  <td className="text-right">
                    <button onClick={() => handleOpenModal(product)} className="btn btn-secondary action-btn mr-2" title="Edit Price / Details">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="btn btn-danger action-btn" title="Delete">
                      <Trash2 size={16} />
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
              <h3>{currentProduct ? 'Edit / Update Product' : 'Add New Product'}</h3>
              <button onClick={handleCloseModal} className="close-btn">&times;</button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="modal-body">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">English Name *</label>
                  <input type="text" className="form-control" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Sugar" />
                </div>
                <div className="form-group">
                  <label className="form-label">Marathi Name *</label>
                  <input type="text" className="form-control" required value={formData.marathiName} onChange={e => setFormData({...formData, marathiName: e.target.value})} placeholder="e.g. साखर" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-control" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                     <option value="">Select Category</option>
                     {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input type="number" step="0.01" className="form-control" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="e.g. 40" />
                  <small className="text-muted">Will apply to new bills only</small>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Stock Quantity</label>
                <input type="number" className="form-control" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} placeholder="e.g. 50" />
              </div>

              <div className="modal-footer mt-4 flex justify-between">
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {currentProduct ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
