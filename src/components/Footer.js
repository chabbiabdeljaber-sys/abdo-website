import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';
import './Footer.css';

function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="container footer__content">
        <div className="footer__brand">
          <img src="/images/logo.png" alt="ArbibStore Logo" className="footer__logo-img" />
          <span className="footer__logo">ArbibStore</span>
        </div>
        <div className="footer__links">
          <Link to="/">{t('home')}</Link>
          <Link to="/products">{t('products')}</Link>
          <Link to="/cart">{t('cart')}</Link>
          <Link to="/contact">{t('contact')}</Link>
        </div>
        <div className="footer__language">
          <LanguageSelector />
        </div>
        <div className="footer__copyright">
          © {new Date().getFullYear()} ArbibStore. {t('allRightsReserved')}
        </div>
      </div>
    </footer>
  );
}

export default Footer; 