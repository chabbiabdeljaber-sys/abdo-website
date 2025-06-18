import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import LoadingScreen from '../components/LoadingScreen';
import '../pages/ProductList.css';

function getCategories(products) {
  return ['All', ...Array.from(new Set(products.map(p => p.category))).filter(Boolean).sort()];
}

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const { dispatch } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollection = collection(db, 'products');
        const productsSnapshot = await getDocs(productsCollection);
        const productsList = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = getCategories(products);

  const filtered = products.filter(p => {
    const matchesCategory = category === 'All' || p.category === category;
    const searchLower = search.toLowerCase();
    const matchesSearch = (
      (p.product_name && p.product_name.toLowerCase().includes(searchLower)) ||
      (p.product_description && p.product_description.toLowerCase().includes(searchLower)) ||
      (p.category && p.category.toLowerCase().includes(searchLower))
    );
    return matchesCategory && matchesSearch;
  });

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

  if (loading) {
    return (
      <LoadingScreen 
        message="Loading Products" 
        subMessage="Please wait while we fetch our eco-friendly products..."
      />
    );
  }

  if (error) {
    return <div className="product-list__error">{error}</div>;
  }

  return (
    <div className="product-list" style={{ marginBottom: '3.5rem' }}>
      <h2 className="product-list__title">
        <i className="fas fa-shopping-bag" style={{ marginRight: '0.7rem', color: '#2e7d32' }}></i>
        Products
      </h2>
      <div className="product-list__controls">
        <div className="product-list__controls-input-wrapper">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by name, description, or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)}>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="product-list__grid">
        {filtered.length === 0 && <div>No products found.</div>}
        {filtered.map(product => (
          <div className="product-card" key={product.id}>
            <Link to={`/products/${product.id}`} className="product-card__media-link">
              <div className="product-card__img-container">
                <img src={product.product_img_url} alt={product.product_name} className="product-card__img" />
              </div>
              <div className="product-card__info">
                <h3 className="product-card__title">{product.product_name}</h3>
                <p className="product-card__price">
                  {!isNaN(Number(product.product_price)) ? Number(product.product_price).toFixed(2) : '0.00'} DH
                </p>
              </div>
            </Link>
            <div className="product-card__actions">
              <button className="add-to-cart-btn" onClick={() => handleAddToCart(product)}>Add to Cart</button>
            </div>
            <button className="buy-now-btn" onClick={() => handleBuyNow(product)}>Buy Now</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList; 