import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import LoadingScreen from '../../components/LoadingScreen';
import './OrderManager.css';

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatedStatus, setUpdatedStatus] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Check if user is authenticated
        if (!auth.currentUser) {
          console.error('User is not authenticated');
          setError('Authentication required. Please log in again.');
          setLoading(false);
          return;
        }

        console.log('Fetching orders...');
        const ordersCol = collection(db, 'orders');
        const snapshot = await getDocs(ordersCol);
        
        if (snapshot.empty) {
          console.log('No orders found in the collection');
          setOrders([]);
          setLoading(false);
          return;
        }

        console.log(`Found ${snapshot.size} orders`);
        const ordersList = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Processing order:', doc.id, data);
          
          // Ensure orders is an array before using reduce
          const orderItems = Array.isArray(data.orders) ? data.orders : [];
          
          // Calculate total from order items
          const total = orderItems.reduce((sum, item) => {
            // Ensure item is an object and has required properties
            if (!item || typeof item !== 'object') return sum;
            
            const price = Number(item.product_price) || 0;
            const quantity = Number(item.product_quantity) || 0;
            return sum + (price * quantity);
          }, 0);

          return {
            id: doc.id,
            customerName: data.full_name || 'N/A',
            phoneNumber: data.phone_number || 'N/A',
            address: data.address || 'N/A',
            city: data.city || 'N/A',
            date: data.created_date?.toDate() || new Date(),
            updatedAt: data.updated_date?.toDate() || new Date(),
            total: total || 0,
            status: data.status || 'new',
            items: orderItems.map(item => {
              if (!item || typeof item !== 'object') {
                return {
                  name: 'Invalid Product',
                  quantity: 0,
                  price: 0
                };
              }
              return {
                name: item.product_name || 'Unknown Product',
                quantity: Number(item.product_quantity) || 0,
                price: Number(item.product_price) || 0
              };
            })
          };
        });
        
        console.log('Successfully processed orders data');
        setOrders(ordersList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching orders:', err);
        let errorMessage = 'Failed to load orders. ';
        
        if (err.code === 'permission-denied') {
          errorMessage += 'You do not have permission to access orders.';
        } else if (err.code === 'not-found') {
          errorMessage += 'Orders collection not found.';
        } else {
          errorMessage += err.message || 'Please try again later.';
        }
        
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };

  const handlePriceFilter = (e) => {
    setPriceFilter(e.target.value);
  };

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  const handleDeleteClick = (order) => {
    setSelectedOrder(order);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const orderRef = doc(db, 'orders', selectedOrder.id);
      await deleteDoc(orderRef);
      
      // Update local state
      setOrders(orders.filter(order => order.id !== selectedOrder.id));
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order. Please try again.');
    }
  };

  const handleUpdateClick = (order) => {
    setSelectedOrder(order);
    setUpdatedStatus(order.status);
    setShowUpdateModal(true);
  };

  const handleUpdateConfirm = async () => {
    try {
      const orderRef = doc(db, 'orders', selectedOrder.id);
      await updateDoc(orderRef, {
        status: updatedStatus,
        updated_date: new Date()
      });
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, status: updatedStatus, updatedAt: new Date() }
          : order
      ));
      
      setShowUpdateModal(false);
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();

    let matchesPrice = true;
    if (priceFilter !== 'all') {
      const price = order.total;
      switch (priceFilter) {
        case '0-50':
          matchesPrice = price >= 0 && price <= 50;
          break;
        case '51-100':
          matchesPrice = price > 50 && price <= 100;
          break;
        case '101-200':
          matchesPrice = price > 100 && price <= 200;
          break;
        case '200+':
          matchesPrice = price > 200;
          break;
        default:
          matchesPrice = true;
      }
    }

    return matchesSearch && matchesStatus && matchesPrice;
  });

  const getSortedOrders = () => {
    const sorted = [...filteredOrders];
    sorted.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'date' || sortConfig.key === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  };

  const statusOptions = ['all', 'pending', 'new', 'processing', 'shipped', 'delivered', 'cancelled'];
  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-50', label: '0 - 50 DH' },
    { value: '51-100', label: '51 - 100 DH' },
    { value: '101-200', label: '101 - 200 DH' },
    { value: '200+', label: 'Over 200 DH' }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <LoadingScreen 
          message="Loading Orders" 
          subMessage="Please wait while we fetch your orders..."
        />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="order-manager">
          <div className="error-message">{error}</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="order-manager">
        <div className="order-manager__header">
          <h1>Order Management</h1>
          <div className="order-manager__filters">
            <div className="order-manager__search-wrapper">
              <i className="fas fa-search order-manager__search-icon"></i>
              <input
                type="text"
                placeholder="Search by order ID or customer name..."
                value={searchTerm}
                onChange={handleSearch}
                className="order-manager__search"
              />
            </div>
            <select
              value={statusFilter}
              onChange={handleStatusFilter}
              className="order-manager__filter"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={priceFilter}
              onChange={handlePriceFilter}
              className="order-manager__filter"
            >
              {priceRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="order-manager__table-container">
          <div className="order-manager__table-wrapper">
            <table className="order-manager__table">
              <thead>
                <tr>
                  <th 
                    className="order-manager__th order-manager__th--sortable"
                    onClick={() => handleSort('id')}
                    data-sort={sortConfig.key === 'id' ? sortConfig.direction : undefined}
                  >
                    Order ID
                  </th>
                  <th 
                    className="order-manager__th order-manager__th--sortable"
                    onClick={() => handleSort('customerName')}
                    data-sort={sortConfig.key === 'customerName' ? sortConfig.direction : undefined}
                  >
                    Customer Name
                  </th>
                  <th 
                    className="order-manager__th order-manager__th--sortable"
                    onClick={() => handleSort('phoneNumber')}
                    data-sort={sortConfig.key === 'phoneNumber' ? sortConfig.direction : undefined}
                  >
                    Phone Number
                  </th>
                  <th 
                    className="order-manager__th order-manager__th--sortable"
                    onClick={() => handleSort('city')}
                    data-sort={sortConfig.key === 'city' ? sortConfig.direction : undefined}
                  >
                    City
                  </th>
                  <th 
                    className="order-manager__th order-manager__th--sortable"
                    onClick={() => handleSort('date')}
                    data-sort={sortConfig.key === 'date' ? sortConfig.direction : undefined}
                  >
                    Date
                  </th>
                  <th 
                    className="order-manager__th order-manager__th--sortable"
                    onClick={() => handleSort('total')}
                    data-sort={sortConfig.key === 'total' ? sortConfig.direction : undefined}
                  >
                    Total
                  </th>
                  <th 
                    className="order-manager__th order-manager__th--sortable"
                    onClick={() => handleSort('status')}
                    data-sort={sortConfig.key === 'status' ? sortConfig.direction : undefined}
                  >
                    Status
                  </th>
                  <th className="order-manager__th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {getSortedOrders().map(order => (
                  <tr key={order.id} className="order-manager__tr">
                    <td className="order-manager__td order-id">{order.id}</td>
                    <td className="order-manager__td">{order.customerName}</td>
                    <td className="order-manager__td">{order.phoneNumber}</td>
                    <td className="order-manager__td">{order.city}</td>
                    <td className="order-manager__td">{order.date.toLocaleDateString()}</td>
                    <td className="order-manager__td">{order.total.toFixed(2)} DH</td>
                    <td className="order-manager__td">
                      <span className={`status-badge status-badge--${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="order-manager__td">
                      <div className="order-actions">
                        <button
                          className="action-button view-button"
                          onClick={() => handleViewDetails(order)}
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="action-button update-button"
                          onClick={() => handleUpdateClick(order)}
                          title="Update Status"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="action-button delete-button"
                          onClick={() => handleDeleteClick(order)}
                          title="Delete Order"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Order Modal */}
        {showViewModal && selectedOrder && (
          <div className="modal">
            <div className="modal__overlay" onClick={() => setShowViewModal(false)}></div>
            <div className="modal__content">
              <div className="modal__header">
                <h2>Order Details</h2>
                <button className="modal__close" onClick={() => setShowViewModal(false)}>×</button>
              </div>
              <div className="modal__body">
                <div className="order-details">
                  <div className="order-details__section">
                    <h3>Order Information</h3>
                    <div className="order-details__row">
                      <span className="order-details__label">Order ID:</span>
                      <span className="order-details__value">{selectedOrder.id}</span>
                    </div>
                    <div className="order-details__row">
                      <span className="order-details__label">Customer Name:</span>
                      <span className="order-details__value">{selectedOrder.customerName}</span>
                    </div>
                    <div className="order-details__row">
                      <span className="order-details__label">Phone Number:</span>
                      <span className="order-details__value">{selectedOrder.phoneNumber}</span>
                    </div>
                    <div className="order-details__row">
                      <span className="order-details__label">Address:</span>
                      <span className="order-details__value">{selectedOrder.address}</span>
                    </div>
                    <div className="order-details__row">
                      <span className="order-details__label">City:</span>
                      <span className="order-details__value">{selectedOrder.city}</span>
                    </div>
                    <div className="order-details__row">
                      <span className="order-details__label">Order Date:</span>
                      <span className="order-details__value">{selectedOrder.date.toLocaleString()}</span>
                    </div>
                    <div className="order-details__row">
                      <span className="order-details__label">Last Updated:</span>
                      <span className="order-details__value">{selectedOrder.updatedAt.toLocaleString()}</span>
                    </div>
                    <div className="order-details__row">
                      <span className="order-details__label">Status:</span>
                      <span className={`status-badge status-badge--${selectedOrder.status.toLowerCase()}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                  </div>

                  <div className="order-details__section">
                    <h3>Order Items</h3>
                    <div className="order-details__items">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="order-details__item">
                          <span className="order-details__item-quantity">{item.quantity}x</span>
                          <span className="order-details__item-name">{item.name}</span>
                          <span className="order-details__item-price">{(item.price * item.quantity).toFixed(2)} DH</span>
                        </div>
                      ))}
                    </div>
                    <div className="order-details__total">
                      <span>Total Amount:</span>
                      <span>{selectedOrder.total.toFixed(2)} DH</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Update Order Modal */}
        {showUpdateModal && selectedOrder && (
          <div className="modal">
            <div className="modal__overlay" onClick={() => setShowUpdateModal(false)}></div>
            <div className="modal__content">
              <div className="modal__header">
                <h2>Update Order Status</h2>
                <button className="modal__close" onClick={() => setShowUpdateModal(false)}>×</button>
              </div>
              <div className="modal__body">
                <div className="update-status">
                  <div className="update-status__info">
                    <div className="update-status__row">
                      <span className="update-status__label">Order ID</span>
                      <span className="update-status__value">{selectedOrder.id}</span>
                    </div>
                    <div className="update-status__row">
                      <span className="update-status__label">Customer</span>
                      <span className="update-status__value">{selectedOrder.customerName}</span>
                    </div>
                    <div className="update-status__row">
                      <span className="update-status__label">Current Status</span>
                      <span className={`status-badge status-badge--${selectedOrder.status.toLowerCase()}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                  </div>
                  <select
                    value={updatedStatus}
                    onChange={(e) => setUpdatedStatus(e.target.value)}
                    className="update-status__select"
                  >
                    {statusOptions.filter(status => status !== 'all').map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal__actions">
                <button 
                  className="modal__btn modal__btn--cancel" 
                  onClick={() => setShowUpdateModal(false)}
                >
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
                <button 
                  className="modal__btn modal__btn--update"
                  onClick={handleUpdateConfirm}
                >
                  <i className="fas fa-check"></i>
                  Update Status
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Order Modal */}
        {showDeleteModal && selectedOrder && (
          <div className="modal">
            <div className="modal__overlay" onClick={() => setShowDeleteModal(false)}></div>
            <div className="modal__content">
              <div className="modal__header">
                <h2>Delete Order</h2>
                <button className="modal__close" onClick={() => setShowDeleteModal(false)}>×</button>
              </div>
              <div className="modal__body">
                <div className="delete-order">
                  <div className="delete-order__icon">
                    <i className="fas fa-exclamation-triangle fa-3x"></i>
                  </div>
                  <h3 className="delete-order__title">Are you sure you want to delete this order?</h3>
                  <p className="delete-order__message">This action cannot be undone.</p>
                  <div className="delete-order__info">
                    <div className="update-status__row">
                      <span className="update-status__label">Order ID</span>
                      <span className="update-status__value">{selectedOrder.id}</span>
                    </div>
                    <div className="update-status__row">
                      <span className="update-status__label">Customer</span>
                      <span className="update-status__value">{selectedOrder.customerName}</span>
                    </div>
                    <div className="update-status__row">
                      <span className="update-status__label">Total Amount</span>
                      <span className="update-status__value">{selectedOrder.total.toFixed(2)} DH</span>
                    </div>
                    <div className="update-status__row">
                      <span className="update-status__label">Status</span>
                      <span className={`status-badge status-badge--${selectedOrder.status.toLowerCase()}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal__actions">
                <button 
                  className="modal__btn modal__btn--cancel"
                  onClick={() => setShowDeleteModal(false)}
                >
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
                <button 
                  className="modal__btn modal__btn--delete"
                  onClick={handleDeleteConfirm}
                >
                  <i className="fas fa-trash-alt"></i>
                  Delete Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default OrderManager; 