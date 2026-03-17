import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { IndianRupee, Users, Package, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { db } from '../db/db';
import Swal from 'sweetalert2';
import './Dashboard.css';

const Dashboard = () => {
  const productsCount = useLiveQuery(() => db.products.count()) || 0;
  const customersCount = useLiveQuery(() => db.customers.count()) || 0;

  // Calculate total pending Udhari from all customers
  const totalUdhari = useLiveQuery(
    async () => {
      const customers = await db.customers.toArray();
      return customers.reduce((sum, c) => sum + (c.pendingBalance || 0), 0);
    }
  ) || 0;

  // Calculate Today's Sales
  const todaySales = useLiveQuery(
    async () => {
      const today = new Date().setHours(0, 0, 0, 0);
      const bills = await db.bills.where('date').aboveOrEqual(today).toArray();
      return bills.reduce((sum, b) => sum + b.totalAmount, 0);
    }
  ) || 0;

  // Weekly Chart Data (Mock data for initial state since we have no real bills yet)
  const chartData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 5000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 6890 },
    { name: 'Sat', sales: 8390 },
    { name: 'Sun', sales: 10490 },
  ];

  const seedDemoData = async () => {
    const result = await Swal.fire({
      title: 'Seed Demo Data?',
      text: "This will add sample products and customers to help you test the system. Existing data won't be deleted.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, seed data'
    });

    if (result.isConfirmed) {
      try {
        await db.products.bulkAdd([
          { name: 'Sugar', marathiName: 'साखर', category: 'Grocery', price: 42, stock: 100 },
          { name: 'Peanuts', marathiName: 'शेंगदाणे', category: 'Grocery', price: 120, stock: 50 },
          { name: 'Sunflower Oil', marathiName: 'तेल', category: 'Oils', price: 155, stock: 40 },
          { name: 'Parle-G Biscuit', marathiName: 'बिस्किट', category: 'Snacks', price: 10, stock: 150 },
          { name: 'Chana Dal', marathiName: 'डाळ', category: 'Grocery', price: 80, stock: 80 }
        ]);
        await db.customers.bulkAdd([
          { name: 'Rahul Patil', mobile: '9876543210', address: 'Shivaji Nagar, Pune', pendingBalance: 250, createdAt: Date.now() },
          { name: 'Sunita Deshmukh', mobile: '9123456789', address: 'Kothrud, Pune', pendingBalance: 0, createdAt: Date.now() }
        ]);
        Swal.fire('Success', 'Sample data added!', 'success');
      } catch (err) {
        Swal.fire('Error', 'Failed to seed data', 'error');
      }
    }
  };

  return (
    <div className="dashboard-page animation-fade-in">
      <div className="page-header mb-6 flex justify-between items-center">
        <div>
          <h2>Store Overview</h2>
          <p className="text-muted">Welcome back. Here's what's happening today.</p>
        </div>
        {productsCount === 0 && (
          <button onClick={seedDemoData} className="btn btn-secondary">
            🚀 Seed Demo Data
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6 stat-grid">
        <div className="card stat-card">
          <div className="stat-icon bg-blue-light">
            <IndianRupee size={24} className="text-blue" />
          </div>
          <div className="stat-details">
            <p className="stat-label">Today's Sales</p>
            <h3 className="stat-value">₹{todaySales.toLocaleString()}</h3>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon bg-red-light">
            <TrendingUp size={24} className="text-red" />
          </div>
          <div className="stat-details">
            <p className="stat-label">Total Udhari Market</p>
            <h3 className="stat-value">₹{totalUdhari.toLocaleString()}</h3>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon bg-green-light">
            <Users size={24} className="text-green" />
          </div>
          <div className="stat-details">
            <p className="stat-label">Total Customers</p>
            <h3 className="stat-value">{customersCount}</h3>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon bg-purple-light">
            <Package size={24} className="text-purple" />
          </div>
          <div className="stat-details">
            <p className="stat-label">Total Products</p>
            <h3 className="stat-value">{productsCount}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="card col-span-2 chart-container">
          <h3 className="mb-4 text-lg">Weekly Sales Performance</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(value) => '₹' + value} />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="sales" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity / Quick Actions widget */}
        <div className="card side-widget">
          <h3 className="mb-4 text-lg">Quick Actions</h3>
          <div className="flex flex-col gap-2">
            <a href="/billing" className="btn btn-primary" style={{ justifyContent: 'center', padding: '1rem' }}>
              New Bill (POS)
            </a>
            <a href="/products" className="btn btn-secondary mt-2" style={{ justifyContent: 'center' }}>
              Add New Product
            </a>
            <a href="/customers" className="btn btn-secondary mt-2" style={{ justifyContent: 'center' }}>
              Register Customer
            </a>
          </div>

          <div className="mt-8">
            <h4 className="text-muted text-sm uppercase font-bold mb-3">System Status</h4>
            <div className="status-item flex items-center gap-2 mb-2">
              <div className="status-indicator online"></div>
              <span className="text-sm">Database Sync (Offline Mode)</span>
            </div>
            <div className="status-item flex items-center gap-2">
              <div className="status-indicator online"></div>
              <span className="text-sm">Local Storage Initialized</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
