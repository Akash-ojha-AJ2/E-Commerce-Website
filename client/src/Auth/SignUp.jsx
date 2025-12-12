import React, { useContext, useState } from "react";
import { Context } from '../store/Context';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Register.css'; // 👈 Create this CSS file

const Register = () => {
  const navigateTo = useNavigate();
  const { backend } = useContext(Context);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    verificationMethod: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const dataToSend = { ...formData, phone: `+91${formData.phone}` };

    try {
      const response = await fetch(`${backend}/api/v1/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Registration failed");

      toast.success(result.message);
      navigateTo(`/otp-verification/${encodeURIComponent(formData.email)}/${encodeURIComponent(dataToSend.phone)}/${formData.verificationMethod}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card shadow-lg p-4">
        <h3 className="text-center mb-4 fw-bold register-title">Create Your Account</h3>

        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Full Name</label>
            <input
              type="text"
              className="form-control custom-input"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input
              type="email"
              className="form-control custom-input"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="example@mail.com"
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Phone</label>
            <div className="input-group">
              <span className="input-group-text">+91</span>
              <input
                type="number"
                className="form-control custom-input"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="9876543210"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <input
              type="password"
              className="form-control custom-input"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Verify using</label>
            <div className="d-flex gap-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="verificationMethod"
                  value="email"
                  checked={formData.verificationMethod === "email"}
                  onChange={handleChange}
                  required
                />
                <label className="form-check-label">Email</label>
              </div>

              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="verificationMethod"
                  value="phone"
                  checked={formData.verificationMethod === "phone"}
                  onChange={handleChange}
                  required
                />
                <label className="form-check-label">Phone</label>
              </div>
            </div>
          </div>

          <div className="d-grid">
            <button 
              type="submit" 
              className="btn custom-btn fw-semibold register-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="register-spinner"></span>
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </button>
          </div>
        </form>

        <p className="text-center mt-3 mb-0 small">
          Already have an account?{" "}
          <a href="/login" className="text-decoration-none register-link">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
