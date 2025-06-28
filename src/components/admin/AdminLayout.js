import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [location.pathname, isMobile]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/admingate');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="admin-layout">
      {/* Mobile Menu Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="admin-mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar__header">
          <h2>Admin Portal</h2>
          {isMobile && (
            <button 
              className="admin-sidebar__close-btn"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
        <nav className="admin-sidebar__nav">
          <Link 
            to="/admin/dashboard" 
            className={`admin-sidebar__link ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}
            onClick={() => isMobile && setIsMobileMenuOpen(false)}
          >
            <i className="fas fa-chart-line"></i>
            <span>Dashboard</span>
          </Link>
          <Link 
            to="/admin/orders" 
            className={`admin-sidebar__link ${location.pathname === '/admin/orders' ? 'active' : ''}`}
            onClick={() => isMobile && setIsMobileMenuOpen(false)}
          >
            <i className="fas fa-shopping-cart"></i>
            <span>Orders</span>
          </Link>
          <Link 
            to="/admin/products" 
            className={`admin-sidebar__link ${location.pathname === '/admin/products' ? 'active' : ''}`}
            onClick={() => isMobile && setIsMobileMenuOpen(false)}
          >
            <i className="fas fa-box"></i>
            <span>Products</span>
          </Link>
          <Link 
            to="/admin/contact" 
            className={`admin-sidebar__link ${location.pathname === '/admin/contact' ? 'active' : ''}`}
            onClick={() => isMobile && setIsMobileMenuOpen(false)}
          >
            <i className="fas fa-address-book"></i>
            <span>Contact Info</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar__content">
            <div className="admin-topbar__left">
              {isMobile && (
                <button 
                  className="admin-topbar__menu-btn"
                  onClick={toggleMobileMenu}
                >
                  <i className="fas fa-bars"></i>
                </button>
              )}
              <h1 className="admin-topbar__title">
                <i className="fas fa-leaf"></i>
                {location.pathname === '/admin/dashboard' && 'Dashboard'}
                {location.pathname === '/admin/orders' && 'Order Manager'}
                {location.pathname === '/admin/products' && 'Product Manager'}
                {location.pathname === '/admin/contact' && 'Contact Info'}
              </h1>
            </div>
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