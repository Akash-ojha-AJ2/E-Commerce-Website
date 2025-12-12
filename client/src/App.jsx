
import React, { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Navbar from './Layouts/Navbar';
import CardList from "./Components/CardList"
import Order from "./Components/Oder"
import Login from './Auth/Login';
import SignUp from './Auth/SignUp';
import HomePage from './Components/homepage/HomePage';
import Profile from './Components/Profile';
import EditProfile from './Components/EditProfile';
import BecomeSeller from './Components/seller/BecomeSeller';
import OTPVerification from './Auth/OtpVerification';
import ForgotPassword from './Auth/ForgotPassword';
import ResetPassword from './Auth/ResetPassword';
import { Context } from './store/Context';
import AdminDashboard from './Components/admin/AdminDashboard';
import AdminRevenue from './Components/admin/AdminRevenue';
import ManageSellerRequests from './Components/admin/MaganeSellerRequests';
import SellerInfo from './Components/admin/SellerInfo';
import Notifications from './Components/Notifications';
import SellerDashboard from './Components/seller/SellerDashboard';
import SellProduct from './Components/seller/SellProduct'
import SellerAllProduct from "./Components/seller/SellerAllProduct"
import EditProduct from './Components/seller/EditProduct';
import ProductDetail from './Components/productdetail';
import AISuggestion from './Components/AISuggestion';
import Footer from './Layouts/Footer';
import ProductListPage from './Components/ProductListPage/ProductListPage';
import MyOrder from './Components/seller/MyOrder';
import SearchProduct from './Components/SearchProduct';
import ProfitSummary from './Components/seller/ProfitSummary'
import SellerPayment from './Components/admin/SellerPayment';
import SellerOrders from './Components/admin/SellerOrders';

// Main App Component
function App() {
  const { isLoggedIn, user } = useContext(Context);
  const isAdmin = user?.role === 'admin';
  const isseller = user?.role === 'seller';
  const isUser = user?.role === 'user';

  return (
    <Router>
      <AppContent 
        isLoggedIn={isLoggedIn} 
        isAdmin={isAdmin} 
        isseller={isseller} 
        isUser={isUser} 
      />
    </Router>
  );
}

// Separate component to use useLocation hook
function AppContent({ isLoggedIn, isAdmin, isseller, isUser }) {
  const location = useLocation();
  
  // Check if current route is admin dashboard or seller dashboard
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isSellerRoute = location.pathname.startsWith('/seller');
  
  // Show navbar and footer only if NOT on admin or seller routes
  const showLayout = !isAdminRoute && !isSellerRoute;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Conditionally render Navbar */}
      {showLayout && <Navbar isLoggedIn={isLoggedIn} />}
      
      <div 
        className={showLayout ? "mt-4 px-2" : ""} 
        style={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          // Remove margin/padding for admin/seller routes
          ...(isAdminRoute || isSellerRoute ? { margin: 0, padding: 0 } : {})
        }}
      >
        <Routes>
          {/* Public Routes */}
          {!isLoggedIn && (
            <>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login isLoggedIn={isLoggedIn} />} />
              <Route path="/signup" element={<SignUp isLoggedIn={isLoggedIn} />} />
              <Route path="/otp-verification/:email/:phone/:method" element={<OTPVerification />} />
              <Route path="/password/forgot" element={<ForgotPassword />} />
              <Route path="/password/reset/:token" element={<ResetPassword />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<CardList />} />
              <Route path="/category/:categoryPath" element={<ProductListPage />} />
              <Route path="/searchproduct" element={<SearchProduct />} />
            </>
          )}

          {/* Admin Routes - No Navbar/Footer */}
{isLoggedIn && isAdmin && (
  <>
    <Route path="/admin/dashboard" element={
   
        <AdminDashboard />

    } />
    <Route path="/admin/seller-request" element={
     
        <ManageSellerRequests />
    
    } />
    <Route path="/admin/seller-info/all-sellers" element={
     
        <SellerInfo />
    
    } />
    <Route path="/admin/profit-summary" element={
     
        <AdminRevenue />
    
    } />

    <Route path="/admin/sell-pay" element={
      <SellerPayment/>
    }/>
        <Route path="/admin/seller-info/seller-orders/:sellerId" element={
      <SellerOrders/>
    }/>

  
    <Route path="*" element={<Navigate to="/admin/dashboard" />} />
  </>
)}

          {/* User Routes */}
          {isLoggedIn && isUser && (
            <>
              <Route path="/" element={<HomePage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/become-seller" element={<BecomeSeller />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/orders" element={<Order />} />
              <Route path="/cart" element={<CardList />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/ai-suggestion" element={<AISuggestion />} />
              <Route path="/category/:categoryPath" element={<ProductListPage />} />
              <Route path="/searchproduct" element={<SearchProduct />} />
            </>
          )}

          {/* Seller Routes - No Navbar/Footer */}
{isLoggedIn && isseller && (
  <>
    <Route path="/seller/dashboard" element={
   
        <SellerDashboard />

    } />
    <Route path="/seller/sellproduct" element={
     
        <SellProduct />
    
    } />
    <Route path="/seller/my-products" element={
     
        <SellerAllProduct />
    
    } />
    <Route path="/seller/edit-product/:id" element={
     
        <EditProduct />
    
    } />
    <Route path="/seller/dashboard/orders" element={
     
        <MyOrder />
    
    } />
    <Route path="/seller/profit-summary" element={
     
        <ProfitSummary />
    
    } />
  
    <Route path="*" element={<Navigate to="/seller/dashboard" />} />
  </>
)}

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      
      {/* Conditionally render Footer */}
      {showLayout && <Footer />}
    </div>
  );
}

export default App;
