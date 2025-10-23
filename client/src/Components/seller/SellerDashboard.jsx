import React, { useState, useContext, useEffect } from 'react';
import { Context } from '../../store/Context';
import SellerLayout from './SellerLayout';
import { 
  FaSearch,

  FaCog,
  FaUserCircle,
  FaChevronDown,
  FaFilter,
  FaEye,
  FaBox,
  FaRupeeSign,
  FaMapMarkerAlt,
  FaPhone,
  FaShoppingBag
} from 'react-icons/fa';
import './SellerDashboard.css';

const SellerDashboard = () => {
  const { user , backend} = useContext(Context);

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch stats from backend
  useEffect(() => {
    const fetchSellerStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${backend}/api/seller/getSellerStats`, {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Set stats
            setStats({
              totalRevenue: data.stats.totalRevenue || 0,
              totalProducts: data.stats.totalProducts || 0,
              totalOrders: data.stats.totalOrders || 0,
              pendingOrders: data.stats.pendingOrders || 0
            });

            // Set recent orders
            setRecentOrders(data.recentOrders || []);
          }
        }
      } catch (error) {
        console.error('Error fetching seller stats:', error);
        // Fallback mock data
        setStats({
          totalRevenue: 28450,
          totalProducts: 42,
          totalOrders: 156,
          pendingOrders: 8
        });
        setRecentOrders([
          {
            _id: '1',
            orderId: 'ORD-001234',
            customer: {
              name: 'Rahul Sharma',
              email: 'rahul@example.com',
              phone: '9876543210'
            },
            items: [
              {
                name: 'Wireless Headphones',
                price: 2499,
                quantity: 1,
                image: 'headphones.jpg'
              }
            ],
            totalAmount: 2499,
            status: 'Processing',
            paymentMethod: 'razorpay',
            paymentStatus: 'Paid',
            orderDate: '2024-01-15T10:30:00.000Z',
            shippingInfo: {
              firstName: 'Rahul',
              lastName: 'Sharma',
              address: '123 Main Street, Andheri East',
              city: 'Mumbai',
              state: 'Maharashtra',
              pinCode: '400001',
              phoneNumber: '9876543210'
            }
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerStats();
  }, []);

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Processing': { class: 'seller-dashboard-status-processing', text: 'Processing' },
      'Confirmed': { class: 'seller-dashboard-status-confirmed', text: 'Confirmed' },
      'Shipped': { class: 'seller-dashboard-status-shipped', text: 'Shipped' },
      'Delivered': { class: 'seller-dashboard-status-delivered', text: 'Delivered' },
      'Cancelled': { class: 'seller-dashboard-status-cancelled', text: 'Cancelled' },
      'Pending': { class: 'seller-dashboard-status-pending', text: 'Pending' }
    };

    const config = statusConfig[status] || { class: 'seller-dashboard-status-processing', text: status };
    return <span className={`seller-dashboard-status-badge ${config.class}`}>{config.text}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatAddress = (shippingInfo) => {
    return `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} - ${shippingInfo.pinCode}`;
  };

  // Loading Spinner Component
  const LoadingSpinner = () => (
    <SellerLayout>
      <div className="seller-dashboard-main-content">
        <div className="seller-dashboard-loading-container">
          <div className="seller-dashboard-spinner">
            <div className="seller-dashboard-spinner-circle"></div>
          </div>
          <p className="seller-dashboard-loading-text">Loading your dashboard...</p>
        </div>
      </div>
    </SellerLayout>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SellerLayout>
      {/* Main Content */}
      <div className="seller-dashboard-main-content">
        {/* Top Header */}
        <header className="seller-dashboard-top-header">
          <div className="seller-dashboard-header-left">
            <h1>Dashboard Overview</h1>
            <p className="seller-dashboard-welcome-text">Welcome back, {user?.name || 'Seller'}! 👋</p>
          </div>
          <div className="seller-dashboard-header-right">
            <div className="seller-dashboard-search-box">
              <FaSearch className="seller-dashboard-search-icon" />
              <input type="text" placeholder="Search orders..." />
            </div>
           
            <button className="seller-dashboard-icon-btn">
              <FaCog />
            </button>
            <div className="seller-dashboard-user-menu">
              <FaUserCircle />
              <span>{user?.name || 'Seller'}</span>
              <FaChevronDown />
            </div>
          </div>
        </header>

        {/* Stats Cards Section */}
        <div className="seller-dashboard-stats-section">
          <div className="row g-4">
            <div className="col-xl-3 col-md-6">
              <div className="seller-dashboard-stat-card seller-dashboard-revenue">
                <div className="seller-dashboard-stat-content">
                  <h3 className="seller-dashboard-stat-value">₹{stats.totalRevenue.toLocaleString()}</h3>
                  <h5 className="seller-dashboard-stat-title">Total Revenue</h5>
                  <p className="seller-dashboard-stat-change seller-dashboard-up">
                    <FaRupeeSign className="me-1" />
                    All time earnings
                  </p>
                </div>
                <div className="seller-dashboard-stat-icon">
                  <FaRupeeSign />
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="seller-dashboard-stat-card seller-dashboard-products">
                <div className="seller-dashboard-stat-content">
                  <h3 className="seller-dashboard-stat-value">{stats.totalProducts}</h3>
                  <h5 className="seller-dashboard-stat-title">Total Products</h5>
                  <p className="seller-dashboard-stat-change seller-dashboard-up">
                    <FaBox className="me-1" />
                    Active listings
                  </p>
                </div>
                <div className="seller-dashboard-stat-icon">
                  <FaBox />
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="seller-dashboard-stat-card seller-dashboard-orders">
                <div className="seller-dashboard-stat-content">
                  <h3 className="seller-dashboard-stat-value">{stats.totalOrders}</h3>
                  <h5 className="seller-dashboard-stat-title">Total Orders</h5>
                  <p className="seller-dashboard-stat-change seller-dashboard-up">
                    <FaShoppingBag className="me-1" />
                    All orders
                  </p>
                </div>
                <div className="seller-dashboard-stat-icon">
                  <FaShoppingBag />
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="seller-dashboard-stat-card seller-dashboard-pending">
                <div className="seller-dashboard-stat-content">
                  <h3 className="seller-dashboard-stat-value">{stats.pendingOrders}</h3>
                  <h5 className="seller-dashboard-stat-title">Pending Orders</h5>
                  <p className="seller-dashboard-stat-change seller-dashboard-neutral">
                    <FaEye className="me-1" />
                    Need attention
                  </p>
                </div>
                <div className="seller-dashboard-stat-icon">
                  <FaEye />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="seller-dashboard-content-section">
          <div className="seller-dashboard-section-header">
            <h2>Recent Orders</h2>
            <div className="seller-dashboard-section-actions">
              <button className="seller-dashboard-filter-btn">
                <FaFilter />
                Filter
              </button>
              <button className="seller-dashboard-export-btn">View All Orders</button>
            </div>
          </div>

          {recentOrders.length === 0 ? (
            <div className="seller-dashboard-no-orders">
              <FaBox className="seller-dashboard-no-orders-icon" />
              <h4>No Orders Yet</h4>
              <p>Your recent orders will appear here</p>
            </div>
          ) : (
            <div className="seller-dashboard-table-container">
              <table className="seller-dashboard-orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Product</th>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Address</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order._id}>
                      <td>
                        <strong className="seller-dashboard-order-id">{order.orderId}</strong>
                      </td>
                      <td>
                        <div className="seller-dashboard-product-info">
                          <div className="seller-dashboard-product-name">
                            {order.items[0]?.name || 'Product'}
                          </div>
                          {order.items.length > 1 && (
                            <small className="seller-dashboard-text-muted">
                              +{order.items.length - 1} more items
                            </small>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="seller-dashboard-customer-info">
                          <strong>{order.customer.name}</strong>
                        </div>
                      </td>
                      <td>
                        <div className="seller-dashboard-contact-info">
                          <FaPhone className="me-1" />
                          {order.shippingInfo.phoneNumber}
                        </div>
                      </td>
                      <td>
                        <div className="seller-dashboard-address-info">
                          <FaMapMarkerAlt className="me-1" />
                          <span title={formatAddress(order.shippingInfo)}>
                            {order.shippingInfo.city}, {order.shippingInfo.state}
                          </span>
                        </div>
                      </td>
                      <td>
                        <strong className="seller-dashboard-text-success">
                          ₹{order.totalAmount}
                        </strong>
                      </td>
                      <td>
                        {getStatusBadge(order.status)}
                      </td>
                      <td>
                        <div className="seller-dashboard-order-date">
                          {formatDate(order.orderDate)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Stats Section */}
        <div className="seller-dashboard-quick-stats-section">
          <div className="row">
            <div className="col-md-6">
              <div className="seller-dashboard-quick-stat-card">
                <h5>Average Order Value</h5>
                <h3>₹{stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders) : 0}</h3>
                <p>Per order</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="seller-dashboard-quick-stat-card">
                <h5>Completion Rate</h5>
                <h3>
                  {stats.totalOrders > 0 
                    ? Math.round(((stats.totalOrders - stats.pendingOrders) / stats.totalOrders) * 100) 
                    : 0}%
                </h3>
                <p>Orders delivered</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
};

export default SellerDashboard;