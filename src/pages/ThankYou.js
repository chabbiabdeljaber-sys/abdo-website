import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './ThankYou.css';

function ThankYou() {
  const location = useLocation();
  const { t } = useLanguage();
  const { orderId, total } = location.state || {};

  return (
    <div className="thank-you-page">
      <div className="thank-you-card">
        <div className="thank-you-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="25" fill="#4CAF50"/>
            <path fill="#FFF" d="M14.1 27.2l7.1 7.2 16.7-16.8L36.6 16l-15.4 15.5-5.8-5.9z"/>
          </svg>
        </div>
        <h1>{t('thankYou')}</h1>
        <p className="thank-you-subtitle">{t('orderSuccess')}</p>
        
        {orderId && (
          <div className="order-details">
            <p>{t('orderNumber')}: <strong>{orderId}</strong></p>
          </div>
        )}
        
        <div className="payment-info">
          <p>{t('paymentOnDelivery')}</p>
          {total && <p>{t('totalAmount')}: <strong>{Number(total).toFixed(2)} DH</strong></p>}
          <p className="thank-you-note">{t('expectACall')}</p>
        </div>
        
        <Link to="/products" className="thank-you-button">
          {t('continueShopping')}
        </Link>
      </div>
    </div>
  );
}

export default ThankYou; 