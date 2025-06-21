import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import LoadingScreen from '../components/LoadingScreen';
import '../pages/ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { dispatch } = useCart();
  const { t } = useLanguage();
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
          setError(t('noProductsFound'));
        }
      } catch (err) {
        setError(t('error'));
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id, t]);

  if (loading) return (
    <LoadingScreen 
      message={`${t('loading')} ${t('products')}`} 
      subMessage={t('loadingSubMessage')}
    />
  );
  if (error) return <div className="product-detail__error">{error}</div>;
  if (!product) return <div>{t('noProductsFound')}</div>;

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
        <i className="fas fa-arrow-left"></i> {t('back')} {t('to')} {t('products')}
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
            <span className="product-detail__stock"><i className="fas fa-box"></i> {t('inStock')}: {product.product_stock}</span>
          </div>
          <p className="product-detail__desc">{product.product_description}</p>
          <div className="product-detail__quantity">
            <label htmlFor="quantity">{t('quantity')}:</label>
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
                  quantity,
                  title: product.product_name || product.title,
                  price: product.product_price || product.price,
                  image: product.product_img_url || product.image,
                }
              })}
            >
              <i className="fas fa-cart-plus"></i> {t('addToCart')}
            </button>
            <button
              className="buy-now-btn"
              onClick={handleBuyNow}
            >
              <i className="fas fa-bolt"></i> {t('buyNow')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail; 