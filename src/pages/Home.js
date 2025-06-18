import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import LoadingScreen from '../components/LoadingScreen';
import '../pages/Home.css';

function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { dispatch } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, 'products'), where('feature_product', '==', true));
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFeatured(products);
        setLoading(false);
      } catch (err) {
        setError('Failed to load featured products.');
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleBuyNow = (product) => {
    dispatch({
      type: 'BUY_NOW',
      product: {
        ...product,
        title: product.product_name || product.title,
        price: product.product_price || product.price,
        image: product.product_img_url || product.image,
      }
    });
    navigate('/checkout');
  };

  const handleAddToCart = (product) => {
    dispatch({
      type: 'ADD_TO_CART',
      product: {
        ...product,
        title: product.product_name || product.title,
        price: product.product_price || product.price,
        image: product.product_img_url || product.image,
      }
    });
  };

  return (
    <div className="home">
      <section className="hero">
        <h1>Welcome to ArbibStore</h1>
        <p>Fast shipping, great quality, and unbeatable prices on products you love.</p>
        <Link to="/products" className="hero__cta">Shop Now</Link>
      </section>
      <section className="featured">
        <h2>Featured Products</h2>
        {loading ? (
          <div className="featured__loading">
            <LoadingScreen 
              message="Loading Featured Products" 
              subMessage="Please wait while we fetch our eco-friendly highlights..."
            />
          </div>
        ) : error ? (
          <div>{error}</div>
        ) : (
          <div className="featured__list">
            {featured.length === 0 && <div>No featured products found.</div>}
            {featured.map(product => (
              <div className="featured__item" key={product.id}>
                <Link to={`/products/${product.id}`} className="featured__media-link">
                  <div className="featured__img-container">
                    <img src={product.product_img_url} alt={product.product_name} className="featured__img" />
                  </div>
                  <h3 className="featured__title">{product.product_name}</h3>
                </Link>
                <p className="featured__price">
                  ${!isNaN(Number(product.product_price)) ? Number(product.product_price).toFixed(2) : '0.00'}
                </p>
                <div className="featured__actions">
                  <button className="featured__add-to-cart-btn" onClick={() => handleAddToCart(product)}>Add to Cart</button>
                </div>
                <button className="featured__buy-now-btn" onClick={() => handleBuyNow(product)}>Buy Now</button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home; 