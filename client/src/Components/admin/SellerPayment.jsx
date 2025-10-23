import React, { useState, useEffect, useContext } from 'react';
import { Context } from '../../store/Context';
import { toast } from 'react-toastify';
import AdminLayout from './AdminLayout';

const SellerPayment = () => {
  const { backend } = useContext(Context);
  const [sellers, setSellers] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchAllPendingPayments();
  }, []);

  const fetchAllPendingPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${backend}/api/admin/payments/all-pending-payments`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await res.json();
      
      if (result.success) {
        setSellers(result.sellers || []);
        setSummary(result.summary);
      } else {
        toast.error(result.message || 'Failed to fetch pending payments');
      }
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      toast.error('Failed to load pending payments');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSelect = (sellerId, orderId) => {
    setSelectedOrders(prev => {
      const sellerOrders = prev[sellerId] || [];
      const updatedOrders = sellerOrders.includes(orderId)
        ? sellerOrders.filter(id => id !== orderId)
        : [...sellerOrders, orderId];
      
      return {
        ...prev,
        [sellerId]: updatedOrders
      };
    });
  };

  const handleSelectAllSellerOrders = (sellerId) => {
    const seller = sellers.find(s => s.sellerId === sellerId);
    if (!seller) return;

    const allOrderIds = seller.pendingOrders.map(order => order.orderId);
    const currentSelected = selectedOrders[sellerId] || [];

    if (currentSelected.length === allOrderIds.length) {
      // Deselect all
      const { [sellerId]: removed, ...rest } = selectedOrders;
      setSelectedOrders(rest);
    } else {
      // Select all
      setSelectedOrders(prev => ({
        ...prev,
        [sellerId]: allOrderIds
      }));
    }
  };

  const handleProcessPayment = async (sellerId) => {
    const orderIds = selectedOrders[sellerId];
    
    if (!orderIds || orderIds.length === 0) {
      toast.error('Please select at least one order for this seller');
      return;
    }

    try {
      setProcessing(true);
      const res = await fetch(`${backend}/api/admin/payments/process-payment-to-seller`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          sellerId, 
          orderIds 
        }),
      });

      const result = await res.json();
      
      if (result.success) {
        toast.success(
          `Payment of ₹${result.payment.amount} processed to ${result.payment.sellerName} for ${result.payment.orderCount} delivered orders`
        );
        // Refresh the list
        fetchAllPendingPayments();
        // Remove from selected orders
        const { [sellerId]: removed, ...rest } = selectedOrders;
        setSelectedOrders(rest);
      } else {
        toast.error(result.message || 'Failed to process payment');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    } finally {
      setProcessing(false);
    }
  };

  const getSelectedOrdersCount = (sellerId) => {
    return (selectedOrders[sellerId] || []).length;
  };

  const getSelectedOrdersAmount = (sellerId) => {
    const seller = sellers.find(s => s.sellerId === sellerId);
    if (!seller) return 0;

    const selectedOrderData = seller.pendingOrders.filter(order => 
      (selectedOrders[sellerId] || []).includes(order.orderId)
    );

    return selectedOrderData.reduce((sum, order) => 
      sum + order.calculations.finalAmount, 0
    );
  };

  const getProductCount = (order) => {
    return order.productDetails.reduce((sum, product) => sum + product.quantity, 0);
  };

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
                  <p className="text-muted">Loading delivered orders for payment...</p>
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
                <h2 className="h4 fw-bold text-dark mb-1">Seller Payments - Delivered Orders</h2>
                <p className="text-muted mb-0">
                  Manage payments for delivered products only
                </p>
              </div>
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={fetchAllPendingPayments}
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
                  <h6 className="card-title">Sellers with Payments</h6>
                  <h3 className="mb-0">{summary.totalSellers}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-info text-white">
                <div className="card-body">
                  <h6 className="card-title">Delivered Orders</h6>
                  <h3 className="mb-0">{summary.totalPendingOrders}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-warning text-white">
                <div className="card-body">
                  <h6 className="card-title">Total Payable</h6>
                  <h3 className="mb-0">₹{summary.totalAmount?.toFixed(2) || 0}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <h6 className="card-title">Platform Earnings</h6>
                  <h3 className="mb-0">₹{(summary.totalAmount * 0.10)?.toFixed(2) || 0}</h3>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {sellers.length === 0 && (
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-body text-center py-5">
                  <div className="mb-3">
                    <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
                  </div>
                  <h5 className="text-muted mb-2">No Pending Payments</h5>
                  <p className="text-muted">All delivered orders have been paid to sellers.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sellers List */}
        {sellers.map(seller => (
          <div className="card shadow-sm border-0 mb-4" key={seller.sellerId}>
            <div className="card-header bg-light">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <h6 className="fw-bold mb-1">{seller.businessName}</h6>
                  <small className="text-muted">
                    {seller.sellerName} • {seller.sellerEmail}
                  </small>
                </div>
                <div className="col-md-6 text-end">
                  <div className="d-flex justify-content-end align-items-center gap-3">
                    <div className="text-end">
                      <small className="text-muted d-block">Payable Amount</small>
                      <strong className="text-warning">₹{seller.calculations.finalAmount.toFixed(2)}</strong>
                    </div>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => handleSelectAllSellerOrders(seller.sellerId)}
                    >
                      {getSelectedOrdersCount(seller.sellerId) === seller.pendingOrders.length ? 
                        'Deselect All' : 'Select All'
                      }
                    </button>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleProcessPayment(seller.sellerId)}
                      disabled={processing || getSelectedOrdersCount(seller.sellerId) === 0}
                    >
                      {processing ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          Pay ₹{getSelectedOrdersAmount(seller.sellerId).toFixed(2)}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th width="50">
                        <input
                          type="checkbox"
                          checked={getSelectedOrdersCount(seller.sellerId) === seller.pendingOrders.length}
                          onChange={() => handleSelectAllSellerOrders(seller.sellerId)}
                        />
                      </th>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Delivered On</th>
                      <th>Products</th>
                      <th>Original</th>
                      <th>Platform Fee (10%)</th>
                      <th>Shipping (₹100/item)</th>
                      <th>Final Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seller.pendingOrders.map(order => (
                      <tr key={order.orderId}>
                        <td>
                          <input
                            type="checkbox"
                            checked={(selectedOrders[seller.sellerId] || []).includes(order.orderId)}
                            onChange={() => handleOrderSelect(seller.sellerId, order.orderId)}
                          />
                        </td>
                        <td>
                          <small className="font-monospace">{order.orderId.slice(-8)}</small>
                        </td>
                        <td>
                          <div>
                            <div>{order.shippingInfo.firstName} {order.shippingInfo.lastName}</div>
                            <small className="text-muted">{order.shippingInfo.city}</small>
                          </div>
                        </td>
                        <td>
                          {order.deliveredAt ? 
                            new Date(order.deliveredAt).toLocaleDateString() : 
                            'N/A'
                          }
                        </td>
                        <td>
                          <div>
                            <small className="fw-bold">{getProductCount(order)} items</small>
                            <br/>
                            <small className="text-muted">
                              {order.productDetails.map(p => p.productName).join(', ')}
                            </small>
                          </div>
                        </td>
                        <td>₹{order.calculations.originalAmount.toFixed(2)}</td>
                        <td className="text-danger">-₹{order.calculations.platformFee.toFixed(2)}</td>
                        <td className="text-danger">-₹{order.calculations.shippingCharge.toFixed(2)}</td>
                        <td className="text-success fw-bold">
                          ₹{order.calculations.finalAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default SellerPayment;