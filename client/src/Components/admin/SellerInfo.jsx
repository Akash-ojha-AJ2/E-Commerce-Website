import React, { useState, useEffect, useContext } from 'react';
import { Context } from '../../store/Context';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';

const SellerInfo = () => {
  const { backend } = useContext(Context);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [filter, setFilter] = useState('all'); // all, approved, pending

  useEffect(() => {
    fetchAllSellers();
  }, []);

  const fetchAllSellers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${backend}/api/admin/sellers/all-sellers`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await res.json();
      
      if (result.success) {
        setSellers(result.sellers || []);
        setSummary(result.summary);
      } else {
        toast.error(result.message || 'Failed to fetch sellers');
      }
    } catch (error) {
      console.error('Error fetching sellers:', error);
      toast.error('Failed to load sellers information');
    } finally {
      setLoading(false);
    }
  };

  const filteredSellers = sellers.filter(seller => {
    if (filter === 'all') return true;
    if (filter === 'approved') return seller.status === 'Approved';
    if (filter === 'pending') return seller.status === 'Pending';
    return true;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="container-fluid py-4">
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-body text-center py-5">
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-muted">Loading sellers information...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
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
                <h2 className="h4 fw-bold text-dark mb-1">Sellers Information</h2>
                <p className="text-muted mb-0">
                  Manage and view all seller accounts
                </p>
              </div>
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={fetchAllSellers}
                disabled={loading}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <h6 className="card-title">Total Sellers</h6>
                  <h3 className="mb-0">{summary.totalSellers}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <h6 className="card-title">Approved</h6>
                  <h3 className="mb-0">{summary.approvedSellers}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-warning text-white">
                <div className="card-body">
                  <h6 className="card-title">Pending</h6>
                  <h3 className="mb-0">{summary.pendingSellers}</h3>
                </div>
              </div>
            </div>
       
          </div>
        )}

        {/* Filter Buttons */}
        <div className="row mb-3">
          <div className="col-12">
            <div className="btn-group" role="group">
              <button
                type="button"
                className={`btn btn-outline-primary ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Sellers
              </button>
              <button
                type="button"
                className={`btn btn-outline-success ${filter === 'approved' ? 'active' : ''}`}
                onClick={() => setFilter('approved')}
              >
                Approved
              </button>
              <button
                type="button"
                className={`btn btn-outline-warning ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
              >
                Pending
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredSellers.length === 0 && (
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-body text-center py-5">
                  <div className="mb-3">
                    <i className="bi bi-people text-muted" style={{ fontSize: '3rem' }}></i>
                  </div>
                  <h5 className="text-muted mb-2">No Sellers Found</h5>
                  <p className="text-muted">No sellers match the current filter.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sellers List */}
        <div className="row">
          {filteredSellers.map(seller => (
            <div className="col-xl-4 col-lg-6 col-md-6 mb-4" key={seller._id}>
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="fw-bold mb-0 text-truncate">{seller.businessName}</h6>
                    <span className={`badge ${seller.status === 'Approved' ? 'bg-success' : 'bg-warning'}`}>
                      {seller.status}
                    </span>
                  </div>
                </div>
                
                <div className="card-body">
                  {/* Seller Info */}
                  <div className="mb-3">
                    <h6 className="fw-semibold text-muted mb-2">Seller Details</h6>
                    <p className="mb-1">
                      <i className="bi bi-person me-2 text-primary"></i>
                      {seller.sellerInfo.name}
                    </p>
                    <p className="mb-1">
                      <i className="bi bi-envelope me-2 text-primary"></i>
                      {seller.contactInfo.email}
                    </p>
                    <p className="mb-0">
                      <i className="bi bi-telephone me-2 text-primary"></i>
                      {seller.contactInfo.phone || 'Not provided'}
                    </p>
                  </div>

                  {/* Business Info */}
                  <div className="mb-3">
                    <h6 className="fw-semibold text-muted mb-2">Business Info</h6>
                    <p className="mb-1">
                      <strong>GST:</strong> {seller.businessDetails.gstNumber || 'Not provided'}
                    </p>
                    <p className="mb-0 small text-muted">
                      {seller.businessDetails.shopAddress ? 
                        seller.businessDetails.shopAddress.substring(0, 50) + '...' : 
                        'Address not provided'
                      }
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="mb-3">
                    <h6 className="fw-semibold text-muted mb-2">Performance</h6>
                    <div className="row text-center">
                      <div className="col-4">
                        <div className="border rounded p-2">
                          <div className="fw-bold text-primary">{seller.stats.totalOrders}</div>
                          <small className="text-muted">Orders</small>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="border rounded p-2">
                          <div className="fw-bold text-success">{seller.stats.completedOrders}</div>
                          <small className="text-muted">Delivered</small>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="border rounded p-2">
                          <div className="fw-bold text-warning">₹{seller.stats.totalEarnings.toFixed(0)}</div>
                          <small className="text-muted">Earnings</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="mb-3">
                    <h6 className="fw-semibold text-muted mb-2">Documents</h6>
                    <div className="d-flex gap-2">
                      <span className={`badge ${seller.documents.hasPanCard ? 'bg-success' : 'bg-danger'}`}>
                        PAN {seller.documents.hasPanCard ? '✓' : '✗'}
                      </span>
                      <span className={`badge ${seller.documents.hasAadhaar ? 'bg-success' : 'bg-danger'}`}>
                        Aadhaar {seller.documents.hasAadhaar ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card-footer bg-transparent">
                  <div className="d-grid gap-2">
                    <Link 
                      to={`/admin/seller-info/seller-orders/${seller._id}`}
                      className="btn btn-primary btn-sm"
                    >
                      <i className="bi bi-list-ul me-2"></i>
                      View All Orders
                    </Link>
                    <small className="text-muted text-center">
                      Joined: {new Date(seller.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default SellerInfo;