import React, { useState, useContext, useEffect } from 'react';
import { Context } from '../../store/Context';
import AdminLayout from './AdminLayout';
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
  FaShoppingBag,
  FaStore,
  FaTrophy,
  FaEnvelope
} from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user,backend } = useContext(Context);

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCompletedOrders: 0,
    totalSellers: 0
  });

  const [topSellers, setTopSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch admin stats from backend
  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${backend}/api/admin/admin-dashboard-stats`, {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStats(data.stats);
            setTopSellers(data.topSellers || []);
          }
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        // Fallback mock data
        setStats({
          totalOrders: 1256,
          totalRevenue: 1258000,
          totalCompletedOrders: 980,
          totalSellers: 45
        });
        setTopSellers([
          {
            sellerId: '1',
            businessName: 'Tech Gadgets Store',
            userName: 'Rahul Sharma',
            userEmail: 'rahul@techgadgets.com',
            userPhone: '9876543210',
            totalRevenue: 285000,
            totalOrders: 156,
            profit: 242250
          },
          {
            sellerId: '2',
            businessName: 'Fashion Hub',
            userName: 'Priya Patel',
            userEmail: 'priya@fashionhub.com',
            userPhone: '9876543211',
            totalRevenue: 198500,
            totalOrders: 124,
            profit: 168725
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  // Loading Spinner Component
  const LoadingSpinner = () => (
    <AdminLayout>
      <div className="admin-dashboard-main-content">
        <div className="admin-dashboard-loading-container">
          <div className="admin-dashboard-spinner">
            <div className="admin-dashboard-spinner-circle"></div>
          </div>
          <p className="admin-dashboard-loading-text">Loading admin dashboard...</p>
        </div>
      </div>
    </AdminLayout>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <AdminLayout>
      {/* Main Content */}
      <div className="admin-dashboard-main-content">
        {/* Top Header */}
        <header className="admin-dashboard-top-header">
          <div className="admin-dashboard-header-left">
            <h1>Admin Dashboard</h1>
            <p className="admin-dashboard-welcome-text">Welcome back, {user?.name || 'Admin'}! 👋</p>
          </div>
          <div className="admin-dashboard-header-right">
            <div className="admin-dashboard-search-box">
              <FaSearch className="admin-dashboard-search-icon" />
              <input type="text" placeholder="Search sellers..." />
            </div>
          
            <button className="admin-dashboard-icon-btn">
              <FaCog />
            </button>
            <div className="admin-dashboard-user-menu">
              <FaUserCircle />
              <span>{user?.name || 'Admin'}</span>
              <FaChevronDown />
            </div>
          </div>
        </header>

        {/* Stats Cards Section */}
        <div className="admin-dashboard-stats-section">
          <div className="row g-4">
            <div className="col-xl-3 col-md-6">
              <div className="admin-dashboard-stat-card admin-dashboard-orders">
                <div className="admin-dashboard-stat-content">
                  <h3 className="admin-dashboard-stat-value">{stats.totalOrders.toLocaleString()}</h3>
                  <h5 className="admin-dashboard-stat-title">Total Orders</h5>
                  <p className="admin-dashboard-stat-change admin-dashboard-up">
                    <FaShoppingBag className="me-1" />
                    All time orders
                  </p>
                </div>
                <div className="admin-dashboard-stat-icon">
                  <FaShoppingBag />
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="admin-dashboard-stat-card admin-dashboard-revenue">
                <div className="admin-dashboard-stat-content">
                  <h3 className="admin-dashboard-stat-value">₹{stats.totalRevenue.toLocaleString()}</h3>
                  <h5 className="admin-dashboard-stat-title">Total Revenue</h5>
                  <p className="admin-dashboard-stat-change admin-dashboard-up">
                    <FaRupeeSign className="me-1" />
                    Platform revenue
                  </p>
                </div>
                <div className="admin-dashboard-stat-icon">
                  <FaRupeeSign />
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="admin-dashboard-stat-card admin-dashboard-completed">
                <div className="admin-dashboard-stat-content">
                  <h3 className="admin-dashboard-stat-value">{stats.totalCompletedOrders.toLocaleString()}</h3>
                  <h5 className="admin-dashboard-stat-title">Completed Orders</h5>
                  <p className="admin-dashboard-stat-change admin-dashboard-up">
                    <FaBox className="me-1" />
                    Successfully delivered
                  </p>
                </div>
                <div className="admin-dashboard-stat-icon">
                  <FaBox />
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="admin-dashboard-stat-card admin-dashboard-sellers">
                <div className="admin-dashboard-stat-content">
                  <h3 className="admin-dashboard-stat-value">{stats.totalSellers}</h3>
                  <h5 className="admin-dashboard-stat-title">Total Sellers</h5>
                  <p className="admin-dashboard-stat-change admin-dashboard-up">
                    <FaStore className="me-1" />
                    Active sellers
                  </p>
                </div>
                <div className="admin-dashboard-stat-icon">
                  <FaStore />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Sellers Section */}
       <div className="admin-dashboard-content-section">
  <div className="admin-dashboard-section-header">
    <h2>
      <FaTrophy className="me-2 text-warning" />
      Top 10 Sellers
    </h2>
    <div className="admin-dashboard-section-actions">
      <button className="admin-dashboard-filter-btn">
        <FaFilter />
        Filter
      </button>
      <button className="admin-dashboard-export-btn">Export Report</button>
    </div>
  </div>

  {topSellers.length === 0 ? (
    <div className="admin-dashboard-no-data">
      <FaStore className="admin-dashboard-no-data-icon" />
      <h4>No Seller Data Available</h4>
      <p>Seller performance data will appear here</p>
    </div>
  ) : (
    <div className="admin-dashboard-table-container">
      <table className="admin-dashboard-sellers-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Seller Name</th>
            <th>Business Name</th>
            <th>Contact</th>
            <th>Total Orders</th>
            <th>Total Revenue</th>
            <th>Profit</th>
          </tr>
        </thead>
        <tbody>
          {topSellers.map((seller, index) => (
            <tr key={seller.sellerId || index}>
              <td>
                <div className={`admin-dashboard-rank admin-dashboard-rank-${index + 1}`}>
                  #{index + 1}
                </div>
              </td>
              <td>
                <div className="admin-dashboard-seller-info">
                  <strong>{seller.userName}</strong>
                  <small className="admin-dashboard-text-muted">
                    <FaEnvelope className="me-1" />
                    {seller.userEmail}
                  </small>
                </div>
              </td>
              <td>
                <div className="admin-dashboard-business-name">
                  {seller.businessName}
                </div>
              </td>
              <td>
                <div className="admin-dashboard-contact-info">
                  <FaPhone className="me-1" />
                  {seller.userPhone}
                </div>
              </td>
              <td>
                <strong className="admin-dashboard-order-count">
                  {seller.totalOrders}
                </strong>
              </td>
              <td>
                <strong className="admin-dashboard-text-success">
                  ₹{seller.totalRevenue?.toLocaleString()}
                </strong>
              </td>
              <td>
                <strong className="admin-dashboard-text-primary">
                  ₹{seller.profit?.toLocaleString()}
                </strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>

        {/* Quick Stats Section */}
        <div className="admin-dashboard-quick-stats-section">
          <div className="row">
            <div className="col-md-6">
              <div className="admin-dashboard-quick-stat-card">
                <h5>Average Order Value</h5>
                <h3>₹{stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders) : 0}</h3>
                <p>Per order</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="admin-dashboard-quick-stat-card">
                <h5>Completion Rate</h5>
                <h3>
                  {stats.totalOrders > 0 
                    ? Math.round((stats.totalCompletedOrders / stats.totalOrders) * 100) 
                    : 0}%
                </h3>
                <p>Orders successfully delivered</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;