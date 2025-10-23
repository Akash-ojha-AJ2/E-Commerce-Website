import React, { useState, useEffect, useContext } from 'react';
import { Context } from '../../store/Context';
import { toast } from 'react-toastify';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';

const SellerOrders = () => {
  const { backend } = useContext(Context);
  const { sellerId } = useParams();
  const [sellerInfo, setSellerInfo] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (sellerId) {
      fetchSellerOrders();
    }
  }, [sellerId]);

  const fetchSellerOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching seller orders for:', sellerId);
      
      const res = await fetch(`${backend}/api/admin/sellerInfo/sellerOrders/${sellerId}`, {
        method: 'GET',
        credentials: 'include',
      });

      console.log('📡 Response status:', res.status);
      
      const result = await res.json();
      console.log('📦 API Response:', result);
      
      if (result.success) {
        setSellerInfo(result.sellerInfo);
        setOrders(result.orders || []);
        setSummary(result.summary);
        console.log('✅ Data loaded successfully');
      } else {
        const errorMsg = result.message || 'Failed to fetch seller orders';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('❌ Error fetching seller orders:', error);
      const errorMsg = 'Failed to load seller orders: ' + error.message;
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Delivered': 'bg-success',
      'Shipped': 'bg-info',
      'Confirmed': 'bg-primary',
      'Processing': 'bg-warning',
      'Pending': 'bg-secondary',
      'Cancelled': 'bg-danger',
      'Returned': 'bg-dark'
    };
    return statusConfig[status] || 'bg-secondary';
  };

  // Debug information
  console.log('📊 Component State:', {
    loading,
    error,
    sellerInfo: !!sellerInfo,
    ordersCount: orders.length,
    summary: !!summary
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
                  <p className="text-muted">Loading seller orders...</p>
                  <small className="text-muted">Seller ID: {sellerId}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="container-fluid py-4">
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-body text-center py-5">
                  <div className="mb-3">
                    <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '3rem' }}></i>
                  </div>
                  <h5 className="text-danger mb-2">Error Loading Data</h5>
                  <p className="text-muted mb-3">{error}</p>
                  <div className="d-flex justify-content-center gap-2">
                    <button 
                      className="btn btn-primary"
                      onClick={fetchSellerOrders}
                    >
                      Try Again
                    </button>
                    <Link to="/admin/sellers" className="btn btn-outline-secondary">
                      Back to Sellers
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!sellerInfo) {
    return (
      <AdminLayout>
        <div className="container-fluid py-4">
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-body text-center py-5">
                  <div className="mb-3">
                    <i className="bi bi-person-x text-muted" style={{ fontSize: '3rem' }}></i>
                  </div>
                  <h5 className="text-muted mb-2">Seller Not Found</h5>
                  <p className="text-muted mb-3">The seller with ID {sellerId} was not found.</p>
                  <Link to="/admin/sellers" className="btn btn-primary">
                    Back to Sellers List
                  </Link>
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
                <div className="d-flex align-items-center gap-3">
                  <Link to="/admin/sellers" className="btn btn-outline-secondary btn-sm">
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Sellers
                  </Link>
                  <div>
                    <h2 className="h4 fw-bold text-dark mb-1">{sellerInfo.businessName}</h2>
                    <p className="text-muted mb-0">
                      {sellerInfo.sellerName} • {sellerInfo.email}
                    </p>
                  </div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={fetchSellerOrders}
                >
                  <i className="bi bi-arrow-clockwise"></i>
                </button>
                <span className={`badge ${sellerInfo.approved ? 'bg-success' : 'bg-warning'}`}>
                  {sellerInfo.approved ? 'Approved Seller' : 'Pending Approval'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Seller Info Card */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="fw-semibold text-muted mb-3">Business Information</h6>
                    <p><strong>Business Name:</strong> {sellerInfo.businessName}</p>
                    <p><strong>GST Number:</strong> {sellerInfo.gstNumber || 'Not provided'}</p>
                    <p><strong>Shop Address:</strong> {sellerInfo.shopAddress || 'Not provided'}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-semibold text-muted mb-3">Contact Information</h6>
                    <p><strong>Seller Name:</strong> {sellerInfo.sellerName}</p>
                    <p><strong>Email:</strong> {sellerInfo.email}</p>
                    <p><strong>Phone:</strong> {sellerInfo.phone || 'Not provided'}</p>
                    <p><strong>Joined:</strong> {new Date(sellerInfo.joinedDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="row mb-4">
            <div className="col-md-2">
              <div className="card bg-primary text-white">
                <div className="card-body text-center p-3">
                  <h6 className="card-title mb-1">Total Orders</h6>
                  <h4 className="mb-0">{summary.totalOrders}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="card bg-success text-white">
                <div className="card-body text-center p-3">
                  <h6 className="card-title mb-1">Completed</h6>
                  <h4 className="mb-0">{summary.completedOrders}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="card bg-warning text-white">
                <div className="card-body text-center p-3">
                  <h6 className="card-title mb-1">Pending</h6>
                  <h4 className="mb-0">{summary.pendingOrders}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="card bg-info text-white">
                <div className="card-body text-center p-3">
                  <h6 className="card-title mb-1">Total Revenue</h6>
                  <h4 className="mb-0">₹{summary.totalRevenue?.toFixed(0) || 0}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="card bg-secondary text-white">
                <div className="card-body text-center p-3">
                  <h6 className="card-title mb-1">Paid Orders</h6>
                  <h4 className="mb-0">{summary.paidOrders}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="card bg-danger text-white">
                <div className="card-body text-center p-3">
                  <h6 className="card-title mb-1">Unpaid</h6>
                  <h4 className="mb-0">{summary.unpaidOrders}</h4>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div className="card shadow-sm border-0">
          <div className="card-header bg-light d-flex justify-content-between align-items-center">
            <h6 className="fw-bold mb-0">All Orders ({orders.length})</h6>
            <small className="text-muted">Seller ID: {sellerId}</small>
          </div>
          <div className="card-body">
            {orders.length === 0 ? (
              <div className="text-center py-4">
                <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                <h5 className="text-muted mt-3">No Orders Found</h5>
                <p className="text-muted">This seller doesn't have any orders yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Order Date</th>
                      <th>Status</th>
                      <th>Items</th>
                      <th>Order Value</th>
                      <th>Seller Earnings</th>
                      <th>Payment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order._id}>
                        <td>
                          <small className="font-monospace">{order.orderId?.toString().slice(-8) || 'N/A'}</small>
                        </td>
                        <td>
                          <div>
                            <div className="fw-medium">{order.customer.name}</div>
                            <small className="text-muted">{order.customer.email}</small>
                          </div>
                        </td>
                        <td>{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <span className={`badge ${getStatusBadge(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td>
                          <div>
                            <span className="fw-medium">{order.financials?.itemCount || 0} items</span>
                            <br/>
                            <small className="text-muted">
                              {order.items?.slice(0, 2).map(item => item.productName).join(', ') || 'No items'}
                              {order.items?.length > 2 && '...'}
                            </small>
                          </div>
                        </td>
                        <td className="fw-bold">₹{order.financials?.orderValue?.toFixed(2) || '0.00'}</td>
                        <td className="text-success fw-bold">
                          ₹{order.financials?.sellerEarnings?.toFixed(2) || '0.00'}
                        </td>
                        <td>
                          <span className={`badge ${order.isPaid ? 'bg-success' : 'bg-warning'}`}>
                            {order.isPaid ? 'Paid' : 'Unpaid'}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-outline-primary btn-sm">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SellerOrders;