import React, { useEffect, useState,useContext } from 'react';
import AdminLayout from './AdminLayout';
import { Context } from '../../store/Context';

function ManageSellerRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
 const [actionLoading, setActionLoading] = useState({});
  const { backend } = useContext(Context);

  useEffect(() => {
    fetchSellerRequests();
  }, []);

  const fetchSellerRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${backend}/api/admin/seller-requests`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Not authorized');
      }
      
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err) {
      console.error('Failed to load seller requests', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (userId, action) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: action }));
      const res = await fetch(`${backend}/api/admin/seller-requests/${userId}/${action}`, {
        method: 'PATCH',
        credentials: 'include',
      });
      
      const result = await res.json();
      if (result.success) {
        setRequests(prev => prev.filter(req => req.user._id !== userId));
      }
    } catch (error) {
      console.error('Approval failed:', error);
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[userId]; // Remove specific user from loading state
        return newState;
      });
    }
  };

  const openImageModal = (request, imageType) => {
    setSelectedRequest({ ...request, imageType });
  };

  const closeImageModal = () => {
    setSelectedRequest(null);
  };

  // Loading state ko AdminLayout ke bahar rakhen
  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted">Loading seller requests...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="h4 fw-bold text-dark mb-1">Seller Verification Requests</h2>
                <p className="text-muted mb-0">
                  {requests.length} pending request{requests.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={fetchSellerRequests}
                disabled={loading}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {requests.length === 0 && (
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-body text-center py-5">
                  <div className="mb-3">
                    <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
                  </div>
                  <h5 className="text-muted mb-2">No Pending Requests</h5>
                  <p className="text-muted">All seller verification requests have been processed.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Requests List */}
 {requests.length > 0 && (
          <div className="row g-4">
            {requests.map((req, index) => (
              <div className="col-12" key={req._id}>
                <div className="card shadow-sm border-0 hover-shadow">
                  <div className="card-body p-4">
                    <div className="row g-4 align-items-start">
                      
                      {/* User & Business Information */}
                      <div className="col-lg-4">
                        <div className="d-flex align-items-center mb-3">
                          <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                            <i className="bi bi-person-check text-primary"></i>
                          </div>
                          <div>
                            <h6 className="fw-bold mb-0">{req.user?.name || 'N/A'}</h6>
                            <small className="text-muted">User ID: {req.user?._id}</small>
                          </div>
                        </div>
                        
                        <div className="ms-5">
                          <div className="mb-2">
                            <i className="bi bi-envelope text-muted me-2"></i>
                            <span className="text-dark">{req.user?.email}</span>
                          </div>
                          <div className="mb-2">
                            <i className="bi bi-telephone text-muted me-2"></i>
                            <span className="text-dark">{req.user?.phone || 'Not provided'}</span>
                          </div>
                          <div className="mb-2">
                            <i className="bi bi-building text-muted me-2"></i>
                            <span className="text-dark">{req.businessName}</span>
                          </div>
                          
                          <div className="mt-3 p-3 bg-light rounded">
                            <small className="text-muted d-block mb-1">GST: {req.gstNumber}</small>
                            <small className="text-muted d-block mb-1">PAN: {req.panCardNumber}</small>
                            <small className="text-muted d-block">Aadhaar: {req.aadhaarNumber}</small>
                          </div>
                        </div>
                      </div>

                      {/* Document Images */}
                      <div className="col-lg-4">
                        <div className="row g-3">
                          {/* Aadhaar Card */}
                          <div className="col-12">
                            <label className="form-label small fw-semibold text-muted mb-2">
                              AADHAAR CARD
                            </label>
                            <div 
                              className="document-preview border rounded cursor-pointer"
                              onClick={() => openImageModal(req, 'aadhaar')}
                            >
                              {req.aadhaarImage ? (
                                <img
                                  src={req.aadhaarImage}
                                  alt="Aadhaar Card"
                                  className="img-fluid rounded"
                                  style={{ maxHeight: '140px', width: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <div className="text-center py-4 text-muted">
                                  <i className="bi bi-image me-2"></i>
                                  No Image Available
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-lg-4">
                        <div className="row g-3">
                          {/* PAN Card */}
                          <div className="col-12">
                            <label className="form-label small fw-semibold text-muted mb-2">
                              PAN CARD
                            </label>
                            <div 
                              className="document-preview border rounded cursor-pointer"
                              onClick={() => openImageModal(req, 'pan')}
                            >
                              {req.panCardImage ? (
                                <img
                                  src={req.panCardImage}
                                  alt="PAN Card"
                                  className="img-fluid rounded"
                                  style={{ maxHeight: '140px', width: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <div className="text-center py-4 text-muted">
                                  <i className="bi bi-image me-2"></i>
                                  No Image Available
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                     
 <div className="col-12 border-top pt-3">
                        <div className="d-flex justify-content-end gap-2">
     <button 
                            className="btn btn-outline-danger btn-sm position-relative"
                            onClick={() => handleApproval(req.user._id, 'reject')}
                            disabled={actionLoading[req.user._id]} // Disable if any action is loading for this user
                            style={{ minWidth: '80px' }}
                          >
                            {actionLoading[req.user._id] === 'reject' ? (
                              <div className="d-flex align-items-center justify-content-center">
                                <div className="mini-spinner me-1"></div>
                                <span>Rejecting</span>
                              </div>
                            ) : (
                              <>
                                <i className="bi bi-x-circle me-1"></i>
                                Reject
                              </>
                            )}
                          </button>

                          {/* Approve Button */}
                          <button 
                            className="btn btn-success btn-sm position-relative"
                            onClick={() => handleApproval(req.user._id, 'approve')}
                            disabled={actionLoading[req.user._id]} // Disable if any action is loading for this user
                            style={{ minWidth: '80px' }}
                          >
                            {actionLoading[req.user._id] === 'approve' ? (
                              <div className="d-flex align-items-center justify-content-center">
                                <div className="mini-spinner me-1"></div>
                                <span>Approving</span>
                              </div>
                            ) : (
                              <>
                                <i className="bi bi-check-circle me-1"></i>
                                Approve
                              </>
                            )}
                          </button>
  </div>
</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image Modal */}
        {selectedRequest && (
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {selectedRequest.imageType === 'aadhaar' ? 'Aadhaar Card' : 'PAN Card'} - {selectedRequest.user?.name}
                  </h5>
                  <button type="button" className="btn-close" onClick={closeImageModal}></button>
                </div>
                <div className="modal-body text-center">
                  <img
                    src={selectedRequest.imageType === 'aadhaar' ? selectedRequest.aadhaarImage : selectedRequest.panCardImage}
                    alt={selectedRequest.imageType === 'aadhaar' ? 'Aadhaar Card' : 'PAN Card'}
                    className="img-fluid rounded"
                    style={{ maxHeight: '70vh' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

       
       <style jsx>{`
          .hover-shadow:hover {
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
            transition: box-shadow 0.2s ease-in-out;
          }
          .document-preview:hover {
            border-color: #0d6efd !important;
            transition: border-color 0.2s ease-in-out;
          }
          .cursor-pointer {
            cursor: pointer;
          }
          
          /* Custom Mini Spinner */
          .mini-spinner {
            width: 14px;
            height: 14px;
            border: 2px solid transparent;
            border-top: 2px solid currentColor;
            border-radius: 50%;
            animation: mini-spin 0.6s linear infinite;
          }
          
          @keyframes mini-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
        `}</style>
       
      </div>
    </AdminLayout>
  );
}

export default ManageSellerRequests;