import React, { useContext, useState, useEffect } from 'react';
import { Context } from '../../store/Context';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import SellerLayout from "./SellerLayout";

const BecomeSeller = () => {
  const { backend } = useContext(Context);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sellerStatus, setSellerStatus] = useState("none");
  const [submitting, setSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  const [formData, setFormData] = useState({
    businessName: '',
    gstNumber: '',
    shopAddress: '',
    panCardNumber: '',
    aadhaarNumber: '',
  });

  const [panCardFile, setPanCardFile] = useState(null);
  const [aadhaarFile, setAadhaarFile] = useState(null);

  const fetchSellerStatus = async () => {
    try {
      const res = await fetch(`${backend}/api/v1/user/me`, {
        method: 'GET',
        credentials: 'include',
      });
      const result = await res.json();

      if (res.ok && result.user?.sellerInfo) {
        const seller = result.user.sellerInfo;
        if (seller.approved) {
          setSellerStatus("approved");
        } else {
          setSellerStatus("pending");
        }
      } else {
        setSellerStatus("none");
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load seller status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerStatus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    if (type === 'pan') setPanCardFile(e.target.files[0]);
    if (type === 'aadhaar') setAadhaarFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!panCardFile || !aadhaarFile) {
      toast.error("Please upload PAN and Aadhaar images.");
      return;
    }

    setSubmitting(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    data.append('panCardImage', panCardFile);
    data.append('aadhaarImage', aadhaarFile);

    try {
      const res = await fetch(`${backend}/api/v1/user/become-seller`, {
        method: 'POST',
        credentials: 'include',
        body: data,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      toast.success('Seller request submitted successfully!');
      setSellerStatus("pending");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    if (activeStep === 1) {
      if (!formData.businessName || !formData.gstNumber || !formData.shopAddress) {
        toast.error("Please fill all business details");
        return;
      }
    }
    setActiveStep(activeStep + 1);
  };

  const prevStep = () => {
    setActiveStep(activeStep - 1);
  };

  // Loading state for initial page load
  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6">
            <div className="card shadow-sm border-0">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h5 className="text-muted">Checking seller status...</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (sellerStatus === "approved") {
    return null;
  }

  if (sellerStatus === "pending") {
    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6">
            <div className="card shadow-sm border-0">
              <div className="card-body text-center py-5">
                <div className="mb-4">
                  <i className="bi bi-clock-history text-primary" style={{ fontSize: '3rem' }}></i>
                </div>
                <h4 className="text-primary mb-3">Seller Request Pending</h4>
                <p className="text-muted mb-4">
                  Your seller application is under review. Our team will verify your documents 
                  and notify you once your account is approved.
                </p>
                <div className="alert alert-info border-0">
                  <small>
                    <i className="bi bi-info-circle me-2"></i>
                    This process usually takes 24-48 hours. You'll receive an email once approved.
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 w-100">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8 col-xl-6">
          
          {/* Progress Steps */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div className={`step-item ${activeStep >= 1 ? 'active' : ''}`}>
                  <div className="step-number">1</div>
                  <small className="step-label">Business Info</small>
                </div>
                <div className="step-connector"></div>
                <div className={`step-item ${activeStep >= 2 ? 'active' : ''}`}>
                  <div className="step-number">2</div>
                  <small className="step-label">Documents</small>
                </div>
                <div className="step-connector"></div>
                <div className={`step-item ${activeStep >= 3 ? 'active' : ''}`}>
                  <div className="step-number">3</div>
                  <small className="step-label">Submit</small>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-4 border-0">
              <div className="text-center">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                  <i className="bi bi-person-plus-fill text-primary" style={{ fontSize: '1.5rem' }}></i>
                </div>
                <h2 className="h4 fw-bold text-dark mb-2">Become a Seller</h2>
                <p className="text-muted mb-0">Complete your seller profile in simple steps</p>
              </div>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                
                {/* Step 1: Business Information */}
                {activeStep === 1 && (
                  <div className="step-content">
                    <div className="mb-4">
                      <h6 className="fw-semibold text-dark mb-3">
                        <i className="bi bi-building me-2 text-primary"></i>
                        Business Information
                      </h6>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium">Business Name</label>
                      <input
                        type="text"
                        name="businessName"
                        className="form-control"
                        value={formData.businessName}
                        onChange={handleChange}
                        required
                        placeholder="Enter your business name"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium">GST Number</label>
                      <input
                        type="text"
                        name="gstNumber"
                        className="form-control"
                        value={formData.gstNumber}
                        onChange={handleChange}
                        required
                        placeholder="e.g., 07AABCU9603R1ZM"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-medium">Shop Address</label>
                      <textarea
                        name="shopAddress"
                        className="form-control"
                        rows="3"
                        value={formData.shopAddress}
                        onChange={handleChange}
                        required
                        placeholder="Enter your complete business address"
                      ></textarea>
                    </div>

                    <div className="d-flex justify-content-end">
                      <button type="button" className="btn btn-primary" onClick={nextStep}>
                        Next <i className="bi bi-arrow-right ms-2"></i>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Document Information */}
                {activeStep === 2 && (
                  <div className="step-content">
                    <div className="mb-4">
                      <h6 className="fw-semibold text-dark mb-3">
                        <i className="bi bi-file-earmark-text me-2 text-primary"></i>
                        Document Verification
                      </h6>
                    </div>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-medium">PAN Card Number</label>
                        <input
                          type="text"
                          name="panCardNumber"
                          className="form-control"
                          value={formData.panCardNumber}
                          onChange={handleChange}
                          required
                          placeholder="e.g., ABCDE1234F"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-medium">Aadhaar Number</label>
                        <input
                          type="text"
                          name="aadhaarNumber"
                          className="form-control"
                          value={formData.aadhaarNumber}
                          onChange={handleChange}
                          required
                          placeholder="e.g., 1234 5678 9012"
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-medium">
                          Upload PAN Card Image
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'pan')}
                          required
                        />
                        <div className="form-text text-muted">
                          Clear image of PAN card (JPEG, PNG)
                        </div>
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-medium">
                          Upload Aadhaar Card Image
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'aadhaar')}
                          required
                        />
                        <div className="form-text text-muted">
                          Clear image of Aadhaar card (JPEG, PNG)
                        </div>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between mt-4">
                      <button type="button" className="btn btn-outline-secondary" onClick={prevStep}>
                        <i className="bi bi-arrow-left me-2"></i>Back
                      </button>
                      <button type="button" className="btn btn-primary" onClick={nextStep}>
                        Next <i className="bi bi-arrow-right ms-2"></i>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Review and Submit */}
                {activeStep === 3 && (
  <div className="step-content">
    <div className="mb-4">
      <h6 className="fw-semibold text-dark mb-3">
        <i className="bi bi-check-circle me-2 text-primary"></i>
        Review & Submit
      </h6>
    </div>

    <div className="card bg-light border-0 mb-4">
      <div className="card-body">
        <h6 className="fw-medium mb-3">Business Details</h6>
        <div className="row small text-muted">
          <div className="col-6 mb-2">
            <strong>Business Name:</strong><br/>
            {formData.businessName}
          </div>
          <div className="col-6 mb-2">
            <strong>GST Number:</strong><br/>
            {formData.gstNumber}
          </div>
          <div className="col-12 mb-2">
            <strong>Address:</strong><br/>
            {formData.shopAddress}
          </div>
          <div className="col-6">
            <strong>PAN:</strong><br/>
            {formData.panCardNumber}
          </div>
          <div className="col-6">
            <strong>Aadhaar:</strong><br/>
            {formData.aadhaarNumber}
          </div>
        </div>
      </div>
    </div>

    <div className="alert alert-info border-0 small">
      <i className="bi bi-info-circle me-2"></i>
      Please verify all information before submitting. You'll receive confirmation within 24-48 hours.
    </div>

    <div className="d-flex justify-content-between mt-4">
      <button type="button" className="btn btn-outline-secondary" onClick={prevStep}>
        <i className="bi bi-arrow-left me-2"></i>Back
      </button>
      <button 
        type="submit" 
        className="btn btn-success position-relative"
        disabled={submitting}
        style={{ minWidth: '140px' }}
      >
        {submitting ? (
          <div className="d-flex align-items-center justify-content-center">
            <div className="seller-submit-spinner me-2"></div>
            Submitting...
          </div>
        ) : (
          <>
            <i className="bi bi-send-check me-2"></i>
            Submit Request
          </>
        )}
      </button>
    </div>
  </div>
)}
              </form>
            </div>
          </div>

          {/* Information Card */}
          <div className="card shadow-sm border-0 mt-4">
            <div className="card-body py-3">
              <div className="row align-items-center">
                <div className="col-auto">
                  <i className="bi bi-shield-check text-primary fs-5"></i>
                </div>
                <div className="col">
                  <small className="text-muted">
                    Your documents are securely encrypted. Verification takes 24-48 hours.
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
       .step-item {
    text-align: center;
    position: relative;
    flex: 1;
  }
  .step-number {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #e9ecef;
    color: #6c757d;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 8px;
    font-weight: 600;
    border: 2px solid #e9ecef;
    transition: all 0.3s ease;
  }
  .step-item.active .step-number {
    background: #0d6efd;
    color: white;
    border-color: #0d6efd;
  }
  .step-label {
    color: #6c757d;
    font-weight: 500;
  }
  .step-item.active .step-label {
    color: #0d6efd;
    font-weight: 600;
  }
  .step-connector {
    flex: 1;
    height: 2px;
    background: #e9ecef;
    margin: 0 10px;
    position: relative;
    top: -12px;
  }
  .step-content {
    animation: fadeIn 0.3s ease-in;
  }
  
  /* Custom Seller Submit Spinner */
  .seller-submit-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-right: 2px solid currentColor;
    border-radius: 50%;
    animation: seller-spin 0.8s linear infinite;
  }
  
  @keyframes seller-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
      `}</style>
    </div>
  );
};

export default BecomeSeller;