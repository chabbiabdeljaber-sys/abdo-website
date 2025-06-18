import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import '../pages/Checkout.css';

function Checkout() {
  const { buyNowProduct, dispatch } = useCart();
  const [form, setForm] = useState({ 
    name: '', 
    phone: '', 
    city: '', 
    address: '' 
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if there's no product and we're not in the submitted state
    if (!buyNowProduct && !submitted) {
      navigate('/products');
    }
    
    // Clear buyNowProduct after successful submission
    return () => {
      if (submitted) {
        dispatch({ type: 'CLEAR_BUY_NOW' });
      }
    };
  }, [dispatch, buyNowProduct, submitted, navigate]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare order item
      const orderItem = {
        product_id: buyNowProduct.id,
        product_name: buyNowProduct.title,
        product_price: Number(buyNowProduct.price),
        product_quantity: buyNowProduct.quantity
      };

      // Create order document
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

      // Add to Firestore
      await addDoc(collection(db, 'orders'), orderData);

      // Show success and clear buy now product
      setSubmitted(true);
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Failed to place order. Please try again.');
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="checkout__confirmation">
        <h2>Thank you for your order!</h2>
        <p>Your order has been placed successfully.</p>
        <p className="checkout__payment-note">Payment will be collected on delivery.</p>
        <Link to="/products" className="checkout__continue-shopping">
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (!buyNowProduct) {
    return (
      <div className="checkout__empty">
        <h2>No product selected</h2>
        <Link to="/products" className="checkout__continue-shopping">
          Continue Shopping
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
      <h2>Quick Checkout</h2>
      {error && <div className="checkout__error">{error}</div>}
      <div className="checkout__summary">
        <div className="checkout__item">
          <img src={image} alt={title} />
          <div className="checkout__item-details">
            <h3>{title}</h3>
            <div className="checkout__item-meta">
              <span>Quantity: {buyNowProduct.quantity}</span>
              <span>Price: {!isNaN(price) ? price.toFixed(2) : '0.00'} DH</span>
            </div>
            <div className="checkout__item-subtotal">
              Subtotal: {!isNaN(total) ? total.toFixed(2) : '0.00'} DH
            </div>
          </div>
        </div>
        <div className="checkout__total">
          Total: <strong>{!isNaN(total) ? total.toFixed(2) : '0.00'} DH</strong>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="checkout__form">
        <h3>Shipping Information</h3>
        <label>
          Full Name
          <input 
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            required 
            placeholder="Enter your full name"
          />
        </label>
        <label>
          Phone Number
          <input 
            name="phone" 
            value={form.phone} 
            onChange={handleChange} 
            required 
            placeholder="Enter your phone number"
            pattern="[0-9\s+()-]{10,}"
            type="tel"
          />
        </label>
        <label>
          City
          <input 
            name="city" 
            value={form.city} 
            onChange={handleChange} 
            required 
            placeholder="Enter your city"
          />
        </label>
        <label>
          Address
          <input 
            name="address" 
            value={form.address} 
            onChange={handleChange} 
            required 
            placeholder="Enter your full address"
          />
        </label>
        <div className="checkout__payment-note">
          <p>Payment Method: Cash on Delivery</p>
          <p>Total amount will be collected when your order is delivered.</p>
        </div>
        <button type="submit" className="checkout__submit" disabled={loading}>
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}

export default Checkout; 