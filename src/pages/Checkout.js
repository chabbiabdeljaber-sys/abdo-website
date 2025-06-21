import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import '../pages/Checkout.css';

function Checkout() {
  const { buyNowProduct, dispatch } = useCart();
  const { t } = useLanguage();
  const [form, setForm] = useState({ 
    name: '', 
    phone: '', 
    city: '', 
    address: '' 
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!buyNowProduct) {
      navigate('/products');
    }
  }, [buyNowProduct, navigate]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const orderItem = {
        product_id: buyNowProduct.id,
        product_name: buyNowProduct.title,
        product_price: Number(buyNowProduct.price),
        product_quantity: buyNowProduct.quantity
      };

      const orderData = {
        full_name: form.name,
        phone_number: form.phone,
        city: form.city,
        address: form.address,
        orders: [orderItem],
        status: 'new',
        created_date: serverTimestamp(),
        updated_date: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      const total = (!isNaN(Number(buyNowProduct.product_price)) ? Number(buyNowProduct.product_price) : Number(buyNowProduct.price)) * buyNowProduct.quantity;

      dispatch({ type: 'CLEAR_BUY_NOW' });
      navigate('/thank-you', { state: { orderId: docRef.id, total } });
    } catch (err) {
      console.error('Error creating order:', err);
      setError(t('error'));
      setLoading(false);
    }
  };

  if (!buyNowProduct) {
    return (
      <div className="checkout__empty">
        <h2>{t('noProductSelected')}</h2>
        <Link to="/products" className="checkout__continue-shopping">
          {t('continueShopping')}
        </Link>
      </div>
    );
  }

  // Use product_price and product_img_url if available, fallback to price and image
  const price = !isNaN(Number(buyNowProduct.product_price)) ? Number(buyNowProduct.product_price) : Number(buyNowProduct.price);
  const image = buyNowProduct.product_img_url || buyNowProduct.image;
  const title = buyNowProduct.product_name || buyNowProduct.title;
  const total = price * buyNowProduct.quantity;

  return (
    <div className="checkout">
      <h2>{t('quickCheckout')}</h2>
      {error && <div className="checkout__error">{error}</div>}
      <div className="checkout__summary">
        <div className="checkout__item">
          <img src={image} alt={title} />
          <div className="checkout__item-details">
            <h3>{title}</h3>
            <div className="checkout__item-meta">
              <span>{t('quantity')}: {buyNowProduct.quantity}</span>
              <span>{t('price')}: {!isNaN(price) ? price.toFixed(2) : '0.00'} DH</span>
            </div>
            <div className="checkout__item-subtotal">
              {t('subtotal')}: {!isNaN(total) ? total.toFixed(2) : '0.00'} DH
            </div>
          </div>
        </div>
        <div className="checkout__total">
          {t('total')}: <strong>{!isNaN(total) ? total.toFixed(2) : '0.00'} DH</strong>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="checkout__form">
        <h3>{t('shippingInfo')}</h3>
        <label>
          {t('fullName')}
          <input 
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            required 
            placeholder={t('enterFullName')}
          />
        </label>
        <label>
          {t('phone')}
          <input 
            name="phone" 
            value={form.phone} 
            onChange={handleChange} 
            required 
            placeholder={t('enterPhone')}
            pattern="[0-9\s+()-]{10,}"
            type="tel"
          />
        </label>
        <label>
          {t('city')}
          <input 
            name="city" 
            value={form.city} 
            onChange={handleChange} 
            required 
            placeholder={t('enterCity')}
          />
        </label>
        <label>
          {t('address')}
          <input 
            name="address" 
            value={form.address} 
            onChange={handleChange} 
            required 
            placeholder={t('enterAddress')}
          />
        </label>
        <div className="checkout__payment-note">
          <p>{t('paymentMethod')}</p>
          <p>{t('paymentNote')}</p>
        </div>
        <button type="submit" className="checkout__submit" disabled={loading}>
          {loading ? t('placingOrder') : t('placeOrder')}
        </button>
      </form>
    </div>
  );
}

export default Checkout; 