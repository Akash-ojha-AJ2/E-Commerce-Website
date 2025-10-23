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
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const { logout, user } = useContext(Context);
    const { darkMode, toggleDarkMode } = useContext(Context);
  const location = useLocation();
  const navigate = useNavigate();


    const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  const sidebarItems = [
    { id: 1, name: 'Dashboard', icon: <FaChartLine />, path: '/admin/dashboard' },
    { id: 2, name: 'Seller-Request', icon: <FaShoppingBag />, path: '/admin/seller-request' },
    { id: 3, name: 'Seller-Info', icon: <FaListAlt />, path: '/admin/seller-info/all-sellers' },
    { id: 4, name: 'Seller-pay', icon: <FaPlusCircle />, path: '/admin/sell-pay' },
    { id: 5, name: 'My Profit', icon: <FaMoneyBillWave />, path: '/admin/profit-summary' }
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
          <h2>Admin Dashboard</h2>
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

export default AdminLayout;















