// components/seller/SellerLayout.js
import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaChartLine,
  FaShoppingBag,
  FaListAlt,
  FaPlusCircle,
  FaMoneyBillWave,
  FaSignOutAlt,
  FaUserCircle
} from 'react-icons/fa';
import { Context } from '../../store/Context';
import './SellerLayout.css';

const SellerLayout = ({ children }) => {
  const { logout, user } = useContext(Context);
  const location = useLocation();
  const navigate = useNavigate();

  const sidebarItems = [
    { id: 1, name: 'Dashboard', icon: <FaChartLine />, path: '/seller/dashboard' },
    { id: 2, name: 'My Orders', icon: <FaShoppingBag />, path: '/seller/dashboard/orders' },
    { id: 3, name: 'My Products', icon: <FaListAlt />, path: '/seller/my-products' },
    { id: 4, name: 'Add Product', icon: <FaPlusCircle />, path: '/seller/sellproduct' },
    { id: 5, name: 'My Profit', icon: <FaMoneyBillWave />, path: '/seller/profit-summary' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="seller-layout">
      {/* Sidebar */}
      <div className="seller-sidebar">
        <div className="sidebar-header">
          <h2>Seller Dashboard</h2>
        </div>
        
        <div className="user-welcome">
          <div className="user-avatar">
            <FaUserCircle />
          </div>
          <div className="user-info">
            <h4>Hello {user?.name || 'Seller'}</h4>
            <p>Welcome back!</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {sidebarItems.map(item => (
            <Link
              key={item.id}
              to={item.path}
              className={`nav-item ${isActiveLink(item.path) ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
              {isActiveLink(item.path) && <div className="active-indicator"></div>}
            </Link>
          ))}
        </nav>

        {/* Logout Section */}
        <div className="logout-section">
          <div className="nav-item logout-item" onClick={handleLogout}>
            <span className="nav-icon"><FaSignOutAlt /></span>
            <span className="nav-text">Logout</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="seller-main-content">
        {children}
      </div>
    </div>
  );
};

export default SellerLayout;