import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../store/Context";
import { Link, useNavigate } from "react-router-dom";
import './Login.css'; // 👈 Add this file

const Login = () => {
  const { setIsAuthenticated, setUser, setToken, backend } = useContext(Context);
  const navigateTo = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${backend}/api/v1/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      toast.success(result.message);
      setIsAuthenticated(true);
      setUser(result.user);
      setToken(result.token);

      setTimeout(() => {
        navigateTo("/");
      }, 1000);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <form className="login-form" onSubmit={handleLogin}>
          <div className="login-header">
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">Sign in to your ShopKart account</p>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              value={formData.email}
              onChange={handleChange}
              className="login-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              required
              value={formData.password}
              onChange={handleChange}
              className="login-input"
            />
          </div>

          <div className="login-options">
            <p className="forgot-password">
              <Link to={"/password/forgot"} className="forgot-link">
                Forgot your password?
              </Link>
            </p>
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="login-spinner"></span>
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          <div className="login-footer">
            <p className="signup-text">
              Don't have an account?{" "}
              <Link to="/register" className="signup-link">
                Create Account
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;