import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import LoadingScreen from '../../components/LoadingScreen';
import './ProductManager.css';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [formData, setFormData] = useState({
    product_name: '',
    product_price: '',
    category: '',
    product_description: '',
    product_img_url: '',
    feature_product: false,
    product_stock: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [categories, setCategories] = useState(['all']);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [featuredFilter, setFeaturedFilter] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

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
      // Extract unique categories from products
      const uniqueCategories = Array.from(new Set(productsList.map(p => p.category).filter(Boolean)));
      setCategories(['all', ...uniqueCategories]);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.product_name.trim()) errors.product_name = 'Name is required';
    if (!formData.product_price || formData.product_price <= 0) errors.product_price = 'Price must be greater than 0';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.product_stock || formData.product_stock < 0) errors.product_stock = 'Stock must be 0 or greater';
    if (!formData.product_description.trim()) errors.product_description = 'Description is required';
    if (!formData.product_img_url.trim()) errors.product_img_url = 'Image URL is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCategoryChange = (e) => {
    if (e.target.value === '__new__') {
      setShowNewCategoryInput(true);
      setFormData(prev => ({ ...prev, category: '' }));
    } else {
      setShowNewCategoryInput(false);
      setFormData(prev => ({ ...prev, category: e.target.value }));
    }
    if (formErrors.category) {
      setFormErrors(prev => ({ ...prev, category: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Prepare data with correct types
    const productData = {
      ...formData,
      product_price: Number(formData.product_price),
      product_stock: Number(formData.product_stock),
    };

    if (editingProduct) {
      // Update existing product in Firestore
      try {
        const productRef = doc(db, 'products', editingProduct.id);
        await updateDoc(productRef, productData);
        await fetchProducts();
      } catch (err) {
        setError('Failed to update product');
      }
    } else {
      // Add new product to Firestore with created_date
      try {
        await addDoc(collection(db, 'products'), {
          ...productData,
          created_date: new Date().toISOString(),
        });
        await fetchProducts();
      } catch (err) {
        setError('Failed to add product');
      }
    }
    handleCloseModal();
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData(product);
    setShowModal(true);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      try {
        await deleteDoc(doc(db, 'products', productToDelete.id));
        await fetchProducts();
      } catch (err) {
        setError('Failed to delete product');
      }
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      product_name: '',
      product_price: '',
      category: '',
      product_description: '',
      product_img_url: '',
      feature_product: false,
      product_stock: ''
    });
    setFormErrors({});
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesFeatured = featuredFilter === 'all' || (featuredFilter === 'featured' && product.feature_product) || (featuredFilter === 'not-featured' && !product.feature_product);
    return matchesSearch && matchesCategory && matchesFeatured;
  });

  return (
    <AdminLayout>
      <div className="product-manager">
        <div className="product-manager__header">
          <div className="product-manager__filters">
            <div className="product-manager__search-wrapper">
              <i className="fas fa-search product-manager__search-icon"></i>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="product-manager__search"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="product-manager__category-filter"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value)}
              className="product-manager__featured-filter"
            >
              <option value="all">All Products</option>
              <option value="featured">Popular Products</option>
              <option value="not-featured">Not Popular</option>
            </select>
          </div>
          <button 
            className="product-manager__add-button"
            onClick={() => setShowModal(true)}
          >
            <i className="fas fa-plus"></i> Add Product
          </button>
        </div>

        <div className="product-manager__content">
          {loading ? (
            <LoadingScreen 
              message="Loading Products" 
              subMessage="Please wait while we fetch the product catalog..."
            />
          ) : error ? (
            <div className="product-manager__error">{error}</div>
          ) : (
            <div className="product-manager__grid">
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-card__image">
                    <img src={product.product_img_url} alt={product.product_name} />
                    <div className="product-card__category-badge">
                      {product.category}
                    </div>
                  </div>
                  <div className="product-card__content">
                    <h3>{product.product_name}</h3>
                    <p className="product-card__price">${product.product_price}</p>
                    <p className="product-card__stock">
                      <i className="fas fa-box"></i> Stock: {product.product_stock}
                    </p>
                    <div className="product-card__actions">
                      <button 
                        className="product-card__edit"
                        onClick={() => handleEdit(product)}
                        title="Edit Product"
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button 
                        className="product-card__delete"
                        onClick={() => handleDeleteClick(product)}
                        title="Delete Product"
                      >
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal">
            <div className="modal__overlay" onClick={handleCloseModal}></div>
            <div className="modal__content">
              <div className="modal__header">
                <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button className="modal__close" onClick={handleCloseModal}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="modal__form">
                <div className="form-group">
                  <label htmlFor="product_name">Name</label>
                  <input
                    type="text"
                    id="product_name"
                    name="product_name"
                    value={formData.product_name}
                    onChange={handleInputChange}
                    className={formErrors.product_name ? 'error' : ''}
                  />
                  {formErrors.product_name && <span className="error-message">{formErrors.product_name}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="product_price">Price</label>
                  <div className="input-with-icon">
                    <i className="fas fa-dollar-sign"></i>
                    <input
                      type="number"
                      id="product_price"
                      name="product_price"
                      value={formData.product_price}
                      onChange={handleInputChange}
                      step="0.01"
                      className={formErrors.product_price ? 'error' : ''}
                    />
                  </div>
                  {formErrors.product_price && <span className="error-message">{formErrors.product_price}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={showNewCategoryInput ? '__new__' : formData.category}
                    onChange={handleCategoryChange}
                    className={formErrors.category ? 'error' : ''}
                  >
                    <option value="">Select a category</option>
                    {categories.filter(cat => cat !== 'all').map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                    <option value="__new__">+ Add new category</option>
                  </select>
                  {showNewCategoryInput && (
                    <input
                      type="text"
                      placeholder="Enter new category"
                      value={formData.category}
                      onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className={formErrors.category ? 'error' : ''}
                      style={{ marginTop: '0.5rem' }}
                    />
                  )}
                  {formErrors.category && <span className="error-message">{formErrors.category}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="product_stock">Stock</label>
                  <div className="input-with-icon">
                    <i className="fas fa-box"></i>
                    <input
                      type="number"
                      id="product_stock"
                      name="product_stock"
                      value={formData.product_stock}
                      onChange={handleInputChange}
                      className={formErrors.product_stock ? 'error' : ''}
                    />
                  </div>
                  {formErrors.product_stock && <span className="error-message">{formErrors.product_stock}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="product_description">Description</label>
                  <textarea
                    id="product_description"
                    name="product_description"
                    value={formData.product_description}
                    onChange={handleInputChange}
                    className={formErrors.product_description ? 'error' : ''}
                  />
                  {formErrors.product_description && <span className="error-message">{formErrors.product_description}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="product_img_url">Image URL</label>
                  <input
                    type="text"
                    id="product_img_url"
                    name="product_img_url"
                    value={formData.product_img_url}
                    onChange={handleInputChange}
                    className={formErrors.product_img_url ? 'error' : ''}
                  />
                  {formErrors.product_img_url && <span className="error-message">{formErrors.product_img_url}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="feature_product" style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', cursor: 'pointer' }}>
                    <span style={{ fontWeight: 500 }}>Make this product popular</span>
                    <span className="feature-toggle">
                      <input
                        type="checkbox"
                        id="feature_product"
                        name="feature_product"
                        checked={formData.feature_product}
                        onChange={handleInputChange}
                        style={{ display: 'none' }}
                      />
                      <span className={`toggle-slider${formData.feature_product ? ' checked' : ''}`}></span>
                      <i className={`fas fa-thumbtack${formData.feature_product ? ' checked' : ''}`} style={{ marginLeft: '0.5rem', color: formData.feature_product ? '#4CAF50' : '#bdbdbd', transition: 'color 0.2s' }}></i>
                    </span>
                  </label>
                </div>
                <div className="modal__actions">
                  <button type="button" className="modal__cancel" onClick={handleCloseModal}>Cancel</button>
                  <button type="submit" className="modal__submit">{editingProduct ? 'Update Product' : 'Add Product'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="modal">
            <div className="modal__overlay" onClick={() => setShowDeleteModal(false)}></div>
            <div className="modal__content modal__content--delete">
              <div className="modal__header">
                <i className="fas fa-exclamation-triangle modal__warning-icon"></i>
                <h2>Delete Product</h2>
              </div>
              <p>Are you sure you want to delete "{productToDelete?.product_name}"? This action cannot be undone.</p>
              <div className="modal__actions">
                <button 
                  type="button" 
                  onClick={() => setShowDeleteModal(false)} 
                  className="modal__cancel"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleDeleteConfirm} 
                  className="modal__delete"
                >
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ProductManager; 