import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import AdminLayout from '../../components/admin/AdminLayout';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    ordersByStatus: {},
    recentOrders: [],
    dailyRevenue: {},
    deliveredOrders: 0
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersCollection = collection(db, 'orders');
        const ordersSnapshot = await getDocs(ordersCollection);
        const ordersData = ordersSnapshot.docs.map(doc => {
          const data = doc.data();
          
          // Calculate total from order items
          const orderItems = Array.isArray(data.orders) ? data.orders : [];
          const total = orderItems.reduce((sum, item) => {
            if (!item || typeof item !== 'object') return sum;
            const price = Number(item.product_price) || 0;
            const quantity = Number(item.product_quantity) || 0;
            return sum + (price * quantity);
          }, 0);

          // Safely handle date conversion
          let date = null;
          let updatedAt = null;
          try {
            date = data.created_date?.toDate() || new Date();
            updatedAt = data.updated_date?.toDate() || date; // Use created_date as fallback
          } catch (e) {
            console.warn('Invalid date for order:', doc.id);
            date = new Date();
            updatedAt = date;
          }
          
          return {
            id: doc.id,
            customerName: data.full_name || 'Unknown Customer',
            total: total,
            date: date,
            updatedAt: updatedAt,
            status: data.status || 'pending',
            items: orderItems.map(item => ({
              name: item.product_name || 'Unknown Product',
              quantity: Number(item.product_quantity) || 0,
              price: Number(item.product_price) || 0
            }))
          };
        });
        
        setOrders(ordersData);
        calculateStats(ordersData);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(`Failed to load dashboard data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const calculateStats = (ordersData) => {
    try {
      if (!Array.isArray(ordersData)) {
        throw new Error('Orders data is not an array');
      }

      // Filter delivered orders for revenue calculations
      const deliveredOrders = ordersData.filter(order => order.status.toLowerCase() === 'delivered');

      // Total orders and revenue (only from delivered orders)
      const totalOrders = ordersData.length;
      const deliveredOrdersCount = deliveredOrders.length;

      const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.total, 0);

      const averageOrderValue = deliveredOrdersCount > 0 ? totalRevenue / deliveredOrdersCount : 0;

      // Orders by status
      const ordersByStatus = ordersData.reduce((acc, order) => {
        const status = order.status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      // Recent orders (last 5)
      const recentOrders = [...ordersData]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 5);

      // Daily revenue for the last 7 days (only from delivered orders)
      const last7Days = {};
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
        last7Days[dateStr] = 0;
      }

      deliveredOrders.forEach(order => {
        if (order.updatedAt && order.updatedAt instanceof Date) {
          const orderDate = order.updatedAt;
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          
          if (orderDate >= sevenDaysAgo) {
            const dateStr = orderDate.toLocaleDateString('en-US', { weekday: 'short' });
            last7Days[dateStr] = (last7Days[dateStr] || 0) + order.total;
          }
        }
      });

      setStats({
        totalOrders,
        totalRevenue,
        averageOrderValue,
        ordersByStatus,
        recentOrders,
        dailyRevenue: last7Days,
        deliveredOrders: deliveredOrdersCount
      });
    } catch (err) {
      console.error('Error calculating stats:', err);
      setError(`Error calculating statistics: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading Dashboard Data</div>
          <div className="loading-subtext">Please wait while we fetch your analytics...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="admin-dashboard">
          <div className="error-message">
            <h3>Error</h3>
            <p>{error}</p>
            <p>Please try refreshing the page. If the problem persists, contact support.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <h1 className="dashboard-title">Dashboard</h1>
        
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Orders</h3>
            <p className="stat-value">{stats.totalOrders}</p>
            <p className="stat-subtitle">({stats.deliveredOrders} delivered)</p>
          </div>
          <div className="stat-card">
            <h3>Revenue (Delivered Orders)</h3>
            <p className="stat-value">{stats.totalRevenue.toFixed(2)} DH</p>
          </div>
          <div className="stat-card">
            <h3>Average Order Value</h3>
            <p className="stat-value">{stats.averageOrderValue.toFixed(2)} DH</p>
            <p className="stat-subtitle">(based on delivered orders)</p>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card orders-by-status">
            <h2>Orders by Status</h2>
            <div className="status-grid">
              {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                <div key={status} className="status-item">
                  <span className={`status-badge status-badge--${status.toLowerCase()}`}>
                    {status}
                  </span>
                  <span className="status-count">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-card daily-revenue">
            <h2>Revenue from Delivered Orders (Last 7 Days by Delivery Date)</h2>
            <div className="chart-container">
              {Object.entries(stats.dailyRevenue).map(([day, revenue]) => {
                const maxRevenue = Math.max(...Object.values(stats.dailyRevenue));
                
                // Ensure minimum height for visibility when there's revenue
                let height = 0;
                if (maxRevenue > 0) {
                  height = Math.max((revenue / maxRevenue) * 100, revenue > 0 ? 5 : 0);
                }

                return (
                  <div key={day} className="chart-bar-wrapper">
                    <div 
                      className="chart-bar" 
                      style={{ height: `${height}%` }}
                    >
                      <span className="chart-value">{revenue.toFixed(0)} DH</span>
                    </div>
                    <span className="chart-label">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="dashboard-card recent-orders">
            <h2>Recent Orders</h2>
            <div className="recent-orders-list">
              {stats.recentOrders.map(order => (
                <div key={order.id} className="recent-order-item">
                  <div className="recent-order-info">
                    <span className="order-id">{order.id}</span>
                    <span className="customer-name">{order.customerName}</span>
                  </div>
                  <div className="recent-order-details">
                    <span className={`status-badge status-badge--${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                    <span className="order-total">{order.total.toFixed(2)} DH</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard; 