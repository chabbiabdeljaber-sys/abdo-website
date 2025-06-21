import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import './Checkout.css';

function CartCheckout() {
  const { cart, dispatch } = useCart();
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
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart.length, navigate]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const orderItems = cart.map(item => ({
        product_id: item.id,
        product_name: item.title,
        product_price: Number(item.price),
        product_quantity: item.quantity
      }));

      const total = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

      const orderData = {
        full_name: form.name,
        phone_number: form.phone,
        city: form.city,
        address: form.address,
        orders: orderItems,
        status: 'new',
        created_date: serverTimestamp(),
        updated_date: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);

      dispatch({ type: 'CLEAR_CART' });
      navigate('/thank-you', { state: { orderId: docRef.id, total } });
    } catch (err) {
      console.error('Error creating order:', err);
      setError(t('error'));
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="checkout__empty">
        <h2>{t('yourCart')}</h2>
        <Link to="/products" className="checkout__continue-shopping">
          {t('continueShopping')}
        </Link>
      </div>
    );
  }

  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  return (
    <div className="checkout">
      <h2>{t('cartCheckout')}</h2>
      {error && <div className="checkout__error">{error}</div>}
      <div className="checkout__summary">
        {cart.map(item => (
          <div className="checkout__item" key={item.id}>
            <img src={item.image} alt={item.title} />
            <div className="checkout__item-details">
              <h3>{item.title}</h3>
              <div className="checkout__item-meta">
                <span>{t('quantity')}: {item.quantity}</span>
                <span>{t('price')}: {!isNaN(Number(item.price)) ? Number(item.price).toFixed(2) : '0.00'} DH</span>
              </div>
              <div className="checkout__item-subtotal">
                {t('subtotal')}: {!isNaN(Number(item.price) * item.quantity) ? (Number(item.price) * item.quantity).toFixed(2) : '0.00'} DH
              </div>
            </div>
          </div>
        ))}
        <div className="checkout__total">
          {t('total')}: <strong>{!isNaN(Number(total)) ? Number(total).toFixed(2) : '0.00'} DH</strong>
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

export default CartCheckout; 