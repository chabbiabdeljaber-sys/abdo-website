import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/admingate');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__header">
          <h2>Admin Portal</h2>
        </div>
        <nav className="admin-sidebar__nav">
          <Link 
            to="/admin/dashboard" 
            className={`admin-sidebar__link ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}
          >
            <i className="fas fa-chart-line"></i>
            Dashboard
          </Link>
          <Link 
            to="/admin/orders" 
            className={`admin-sidebar__link ${location.pathname === '/admin/orders' ? 'active' : ''}`}
          >
            <i className="fas fa-shopping-cart"></i>
            Orders
          </Link>
          <Link 
            to="/admin/products" 
            className={`admin-sidebar__link ${location.pathname === '/admin/products' ? 'active' : ''}`}
          >
            <i className="fas fa-box"></i>
            Products
          </Link>
          <Link 
            to="/admin/contact" 
            className={`admin-sidebar__link ${location.pathname === '/admin/contact' ? 'active' : ''}`}
          >
            <i className="fas fa-address-book"></i>
            Contact Info
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar__content">
            <h1 className="admin-topbar__title">
              <i className="fas fa-leaf"></i>
              {location.pathname === '/admin/dashboard' && 'Dashboard'}
              {location.pathname === '/admin/orders' && 'Order Manager'}
              {location.pathname === '/admin/products' && 'Product Manager'}
            </h1>
            <div className="admin-topbar__user">
              <div className="admin-topbar__user-info">
                <p className="admin-topbar__user-name">Admin User</p>
                <p className="admin-topbar__user-role">
                  <i className="fas fa-circle"></i>
                  Administrator
                </p>
              </div>
              <button className="admin-topbar__logout" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout; 