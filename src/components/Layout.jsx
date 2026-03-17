import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Users, PackageSearch, FileText, LogOut } from 'lucide-react';
import './Layout.css';

const Layout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Kirana<span className="text-primary">Sys</span></h2>
          <p className="sidebar-subtitle">Shop Management</p>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => 'nav-item ' + (isActive ? 'active' : '')}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/billing" className={({ isActive }) => 'nav-item ' + (isActive ? 'active' : '')}>
            <ShoppingCart size={20} />
            <span>Billing (POS)</span>
          </NavLink>
          
          <NavLink to="/products" className={({ isActive }) => 'nav-item ' + (isActive ? 'active' : '')}>
            <PackageSearch size={20} />
            <span>Products</span>
          </NavLink>
          
          <NavLink to="/customers" className={({ isActive }) => 'nav-item ' + (isActive ? 'active' : '')}>
            <Users size={20} />
            <span>Customers</span>
          </NavLink>

          <NavLink to="/reports" className={({ isActive }) => 'nav-item ' + (isActive ? 'active' : '')}>
            <FileText size={20} />
            <span>Reports</span>
          </NavLink>
        </nav>
        
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn btn-secondary logout-btn">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-date">
             {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="topbar-user">
             <div className="avatar">A</div>
             <span>Admin</span>
          </div>
        </header>

        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
