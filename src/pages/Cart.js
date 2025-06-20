import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import '../pages/Cart.css';

function Cart() {
  const { cart, dispatch } = useCart();
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleQuantity = (id, quantity) => {
    if (quantity < 1) return;
    dispatch({ type: 'UPDATE_QUANTITY', id, quantity });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  // Fetch first 3 popular products from Firestore
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, 'products'), where('feature_product', '==', true));
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFeatured(products.slice(0, 3));
      } catch (err) {
        setFeatured([]);
      }
      setLoadingFeatured(false);
    };
    fetchFeatured();
  }, []);

  return (
    <div className="cart">
      <div className="cart__header">
        <Link to="/products" className="cart__back-btn">
          <i className="fas fa-arrow-left"></i> Back to Products
        </Link>
        <h2>Shopping Cart</h2>
        {cart.length > 0 && (
          <button className="cart__clear-btn" onClick={clearCart}>
            <i className="fas fa-trash"></i> Clear Cart
          </button>
        )}
      </div>
      {cart.length === 0 ? (
        <div className="cart-empty">
          <div className="cart-empty__icon">
            <svg width="80" height="80" fill="none" viewBox="0 0 48 48" stroke="currentColor">
              <rect x="7" y="16" width="34" height="20" rx="4" fill="#e3f2fd" stroke="#1976d2" strokeWidth="2"/>
              <path d="M16 16V12a8 8 0 0 1 16 0v4" stroke="#1976d2" strokeWidth="2"/>
              <circle cx="17" cy="38" r="2.5" fill="#1976d2" />
              <circle cx="31" cy="38" r="2.5" fill="#1976d2" />
            </svg>
          </div>
          <div className="cart-empty__msg">Your cart is empty! Start shopping now.</div>
          <Link to="/products" className="cart-empty__shop-btn">Shop Now</Link>
          <div className="cart-empty__suggestions-title">Popular Products</div>
          <div className="cart-empty__suggestion-list">
            {loadingFeatured ? (
              <div>Loading popular products...</div>
            ) : featured.length === 0 ? (
              <div>No popular products found.</div>
            ) : (
              featured.map(product => (
                <div className="cart-empty__suggestion-card" key={product.id}>
                  <Link to={`/products/${product.id}`} className="cart-empty__suggestion-img-wrap">
                    <img src={product.product_img_url} alt={product.product_name} />
                  </Link>
                  <div className="cart-empty__suggestion-info">
                    <Link to={`/products/${product.id}`}>{product.product_name}</Link>
                    <div className="cart-empty__suggestion-price">
                      {!isNaN(Number(product.product_price)) ? Number(product.product_price).toFixed(2) : '0.00'} DH
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="cart__list">
            {cart.map(item => (
              <div className="cart__item" key={item.id}>
                <img src={item.image} alt={item.title} />
                <div className="cart__info">
                  <h3>{item.title}</h3>
                  <p>{!isNaN(Number(item.price)) ? Number(item.price).toFixed(2) : '0.00'} DH</p>
                  <div className="cart__qty">
                    <button onClick={() => handleQuantity(item.id, item.quantity - 1)}>-</button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => handleQuantity(item.id, Number(e.target.value))}
                    />
                    <button onClick={() => handleQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <button className="cart__remove" onClick={() => dispatch({ type: 'REMOVE_FROM_CART', id: item.id })}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart__summary">
            <div className="cart__summary-item">
              <span>Total:</span>
              <span>{!isNaN(Number(total)) ? Number(total).toFixed(2) : '0.00'} DH</span>
            </div>
            <button className="cart__checkout" onClick={() => navigate('/cart-checkout')}>Checkout</button>
            <Link to="/products" className="cart__continue-shopping">Continue Shopping</Link>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart; 