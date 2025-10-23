import React, { useContext, useState } from "react";
import "./ResetPassword.css";
import { Navigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../store/Context";

const ResetPassword = () => {
  const { isAuthenticated, setIsAuthenticated, setUser, setToken,backend } = useContext(Context);
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${backend}/api/v1/user/password/reset/${token}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", 
        body: JSON.stringify({ password, confirmPassword }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Password reset failed");
      }

      toast.success(result.message);
      setIsAuthenticated(true);
      setUser(result.user);
      setToken(result.token);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-card">
        <div className="reset-password-header">
          <h2 className="reset-password-title">Create New Password</h2>
          <p className="reset-password-subtitle">
            Your new password must be different from previously used passwords
          </p>
        </div>

        <form className="reset-password-form" onSubmit={handleResetPassword}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              placeholder="Enter your new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="reset-input"
            />
            <div className="password-requirements">
              <span className={password.length >= 6 ? "requirement-met" : "requirement"}>
                • At least 6 characters
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="reset-input"
            />
            <div className="password-match">
              {confirmPassword && (
                <span className={password === confirmPassword ? "match-success" : "match-error"}>
                  {password === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                </span>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            className="reset-password-btn"
            disabled={loading || password !== confirmPassword || password.length < 6}
          >
            {loading ? (
              <>
                <span className="reset-spinner"></span>
                Resetting Password...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>

        <div className="reset-password-footer">
          <p className="security-note">
            🔒 Make sure your password is strong and unique
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;