import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import './Checkout.css';

function CartCheckout() {
  const { cart, dispatch } = useCart();
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
    if (cart.length === 0 && !submitted) {
      navigate('/cart');
    }
  }, [cart.length, submitted, navigate]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare order items
      const orderItems = cart.map(item => ({
        product_id: item.id,
        product_name: item.title,
        product_price: Number(item.price),
        product_quantity: item.quantity
      }));

      // Calculate total
      const total = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

      // Create order document
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

      // Add to Firestore
      await addDoc(collection(db, 'orders'), orderData);

      // Clear cart and show success
      setSubmitted(true);
      dispatch({ type: 'CLEAR_CART' });
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

  if (cart.length === 0) {
    return (
      <div className="checkout__empty">
        <h2>Your cart is empty</h2>
        <Link to="/products" className="checkout__continue-shopping">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  return (
    <div className="checkout">
      <h2>Cart Checkout</h2>
      {error && <div className="checkout__error">{error}</div>}
      <div className="checkout__summary">
        {cart.map(item => (
          <div className="checkout__item" key={item.id}>
            <img src={item.image} alt={item.title} />
            <div className="checkout__item-details">
              <h3>{item.title}</h3>
              <div className="checkout__item-meta">
                <span>Quantity: {item.quantity}</span>
                <span>Price: {!isNaN(Number(item.price)) ? Number(item.price).toFixed(2) : '0.00'} DH</span>
              </div>
              <div className="checkout__item-subtotal">
                Subtotal: {!isNaN(Number(item.price) * item.quantity) ? (Number(item.price) * item.quantity).toFixed(2) : '0.00'} DH
              </div>
            </div>
          </div>
        ))}
        <div className="checkout__total">
          Total: <strong>{!isNaN(Number(total)) ? Number(total).toFixed(2) : '0.00'} DH</strong>
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

export default CartCheckout; 