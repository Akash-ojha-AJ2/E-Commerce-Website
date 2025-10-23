import React, { useContext, useState } from "react";
import "./ForgotPassword.css";
import { Context } from "../store/Context";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const { isAuthenticated, backend } = useContext(Context);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${backend}/api/v1/user/password/forgot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to send reset link.");
      }

      toast.success(result.message);
      setEmail(""); // Clear email after successful submission
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <h2 className="forgot-password-title">Reset Your Password</h2>
          <p className="forgot-password-subtitle">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <form onSubmit={handleForgotPassword} className="forgot-password-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="Enter your registered email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="forgot-input"
            />
          </div>

          <button 
            type="submit" 
            className="forgot-password-btn"
            disabled={loading || !email}
          >
            {loading ? (
              <>
                <span className="forgot-spinner"></span>
                Sending Reset Link...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        <div className="forgot-password-footer">
          <p className="forgot-password-note">
            📧 You'll receive an email with a password reset link that expires in 1 hour
          </p>
          <p className="back-to-login">
            Remember your password?{" "}
            <a href="/login" className="login-link">Back to Login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;