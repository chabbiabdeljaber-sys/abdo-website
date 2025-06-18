import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useCart } from '../context/CartContext';
import LoadingScreen from '../components/LoadingScreen';
import '../pages/ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { dispatch } = useCart();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        setError('Failed to load product.');
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) return (
    <LoadingScreen 
      message="Loading Product Details" 
      subMessage="Please wait while we fetch the product information..."
    />
  );
  if (error) return <div className="product-detail__error">{error}</div>;
  if (!product) return <div>Product not found.</div>;

  const handleBuyNow = () => {
    dispatch({ 
      type: 'BUY_NOW', 
      product: {
        ...product,
        quantity,
        title: product.product_name || product.title,
        price: product.product_price || product.price,
        image: product.product_img_url || product.image,
      }
    });
    navigate('/checkout');
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  return (
    <div className="product-detail">
      <Link to="/products" className="product-list__back-btn">
        <i className="fas fa-arrow-left"></i> Back to Products
      </Link>
      <div className="product-detail__card">
        <div className="product-detail__img-col">
          <div className="product-detail__img-container">
            <img src={product.product_img_url} alt={product.product_name} className="product-detail__img" />
          </div>
        </div>
        <div className="product-detail__info-col">
          <h2 className="product-detail__title">{product.product_name}</h2>
          <p className="product-detail__price-simple">
            {!isNaN(Number(product.product_price)) ? Number(product.product_price).toFixed(2) : '0.00'} DH
          </p>
          <div className="product-detail__meta">
            <span className="product-detail__category"><i className="fas fa-cube"></i> {product.category}</span>
            <span className="product-detail__stock"><i className="fas fa-box"></i> Stock: {product.product_stock}</span>
          </div>
          <p className="product-detail__desc">{product.product_description}</p>
          <div className="product-detail__quantity">
            <label htmlFor="quantity">Quantity:</label>
            <input
              type="number"
              id="quantity"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              className="product-detail__quantity-input"
            />
          </div>
          <div className="product-detail__actions">
            <button
              className="product-detail__add"
              onClick={() => dispatch({
                type: 'ADD_TO_CART',
                product: {
                  ...product,
                  title: product.product_name || product.title,
                  price: product.product_price || product.price,
                  image: product.product_img_url || product.image,
                }
              })}
            >
              <i className="fas fa-cart-plus"></i> Add to Cart
            </button>
            <button
              className="buy-now-btn"
              onClick={handleBuyNow}
            >
              <i className="fas fa-bolt"></i> Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail; 