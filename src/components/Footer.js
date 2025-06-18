import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__content">
        <div className="footer__brand">
          <img src="/images/logo.png" alt="ArbibStore Logo" className="footer__logo-img" />
          <span className="footer__logo">ArbibStore</span>
        </div>
        <div className="footer__links">
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div className="footer__copyright">
          © {new Date().getFullYear()} ArbibStore. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer; 