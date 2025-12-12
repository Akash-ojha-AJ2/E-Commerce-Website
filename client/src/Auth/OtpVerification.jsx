import React, { useContext, useState } from "react";
import "./OtpVerification.css";
import { Navigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../store/Context";

const OtpVerification = () => {
  const { isAuthenticated, setIsAuthenticated, setUser, setToken, backend } = useContext(Context);
  const { email, phone, method } = useParams(); // method will be 'email' or 'phone'
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  // determine which contact to show based on method param
  const verificationMethod = method || "email";
  const contactToShow = verificationMethod === "phone" ? phone : email;

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < otp.length - 1) {
      const next = document.getElementById(`otp-input-${index + 1}`);
      if (next) next.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      const prev = document.getElementById(`otp-input-${index - 1}`);
      if (prev) prev.focus();
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    
    if (enteredOtp.length !== 5) {
      toast.error("Please enter complete 5-digit OTP");
      return;
    }

    const data = { email, otp: enteredOtp, phone };

    try {
      setLoading(true);
      const response = await fetch(`${backend}/api/v1/user/otp-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || "OTP verification failed");

      toast.success(result.message);
      setIsAuthenticated(true);
      setUser(result.user);
      setToken(result.token);
    } catch (err) {
      toast.error(err.message);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) return <Navigate to={"/"} />;

  return (
    <div className="otp-verification-page">
      <div className="otp-card">
        <div className="otp-header">
          <h1 className="otp-title">Verify Your Account</h1>
          <p className="otp-subtitle">
            We've sent a 5-digit verification code to your {verificationMethod === 'phone' ? 'phone' : 'email'}
          </p>
          <div className="otp-contact-info">
            {contactToShow}
          </div>
        </div>

        <form onSubmit={handleOtpVerification} className="otp-form">
          <div className="otp-inputs-container">
            {otp.map((digit, index) => (
              <input
                id={`otp-input-${index}`}
                type="text"
                maxLength="1"
                key={index}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="otp-input"
                placeholder="•"
              />
            ))}
          </div>

          <button 
            type="submit" 
            className="otp-verify-button" 
            disabled={loading || otp.join("").length !== 5}
          >
            {loading ? (
              <>
                <span className="otp-spinner"></span>
                Verifying...
              </>
            ) : (
              "Verify & Continue"
            )}
          </button>
        </form>

        <div className="otp-footer">
          <p className="otp-resend-text">
            Didn't receive the code?{" "}
            <button className="otp-resend-link">
              Resend OTP
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
