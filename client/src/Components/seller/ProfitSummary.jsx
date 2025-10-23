import React, { useState, useEffect, useContext } from 'react';
import { Context } from '../../store/Context';
import { toast } from 'react-toastify';
import SellerLayout from "./SellerLayout";

const ProfitSummary = () => {
  const { backend } = useContext(Context);
  const [summary, setSummary] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [earningsByPeriod, setEarningsByPeriod] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProfitSummary();
    fetchEarningsByPeriod();
  }, [selectedPeriod]);

  const fetchProfitSummary = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${backend}/api/seller/profit/summary?period=${selectedPeriod}`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await res.json();
      
      if (result.success) {
        setSummary(result.summary);
        setSeller(result.seller);
      } else {
        toast.error(result.message || 'Failed to fetch profit summary');
      }
    } catch (error) {
      console.error('Error fetching profit summary:', error);
      toast.error('Failed to load profit summary');
    } finally {
      setLoading(false);
    }
  };

  const fetchEarningsByPeriod = async () => {
    try {
      const res = await fetch(`${backend}/api/seller/profit/period`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await res.json();
      
      if (result.success) {
        setEarningsByPeriod(result.earningsByPeriod);
      }
    } catch (error) {
      console.error('Error fetching earnings by period:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${parseFloat(value).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <SellerLayout>
        <div className="container-fluid py-4">
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-body text-center py-5">
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-muted">Loading your profit summary...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="h4 fw-bold text-dark mb-1">Profit & Earnings</h2>
                <p className="text-muted mb-0">
                  Track your sales, deductions, and net earnings
                  {seller && ` • ${seller.businessName}`}
                </p>
              </div>
              <div className="d-flex gap-2">
                <select 
                  className="form-select form-select-sm"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  style={{ width: '140px' }}
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                  <option value="all">All Time</option>
                </select>
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={fetchProfitSummary}
                >
                  <i className="bi bi-arrow-clockwise"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {summary && (
          <>
            {/* Navigation Tabs */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card shadow-sm border-0">
                  <div className="card-body p-0">
                    <ul className="nav nav-pills nav-justified">
                      <li className="nav-item">
                        <button 
                          className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                          onClick={() => setActiveTab('overview')}
                        >
                          <i className="bi bi-graph-up me-2"></i>
                          Overview
                        </button>
                      </li>
                      <li className="nav-item">
                        <button 
                          className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
                          onClick={() => setActiveTab('orders')}
                        >
                          <i className="bi bi-receipt me-2"></i>
                          Recent Orders
                        </button>
                      </li>
                      <li className="nav-item">
                        <button 
                          className={`nav-link ${activeTab === 'payments' ? 'active' : ''}`}
                          onClick={() => setActiveTab('payments')}
                        >
                          <i className="bi bi-credit-card me-2"></i>
                          Payment History
                        </button>
                      </li>
                      <li className="nav-item">
                        <button 
                          className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
                          onClick={() => setActiveTab('analytics')}
                        >
                          <i className="bi bi-bar-chart me-2"></i>
                          Analytics
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="row">
                {/* Key Metrics */}
                <div className="col-xl-3 col-md-6 mb-4">
                  <div className="card border-left-primary shadow h-100 py-2">
                    <div className="card-body">
                      <div className="row no-gutters align-items-center">
                        <div className="col mr-2">
                          <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                            Total Sales
                          </div>
                          <div className="h5 mb-0 font-weight-bold text-gray-800">
                            {formatCurrency(summary.overview.totalSales)}
                          </div>
                          <div className="text-xs text-muted mt-1">
                            Gross revenue before deductions
                          </div>
                        </div>
                        <div className="col-auto">
                          <i className="bi bi-currency-rupee text-primary fs-2"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                  <div className="card border-left-success shadow h-100 py-2">
                    <div className="card-body">
                      <div className="row no-gutters align-items-center">
                        <div className="col mr-2">
                          <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                            Net Earnings
                          </div>
                          <div className="h5 mb-0 font-weight-bold text-gray-800">
                            {formatCurrency(summary.overview.totalEarnings)}
                          </div>
                          <div className="text-xs text-muted mt-1">
                            After platform & shipping fees
                          </div>
                        </div>
                        <div className="col-auto">
                          <i className="bi bi-wallet2 text-success fs-2"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                  <div className="card border-left-warning shadow h-100 py-2">
                    <div className="card-body">
                      <div className="row no-gutters align-items-center">
                        <div className="col mr-2">
                          <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                            Pending Payment
                          </div>
                          <div className="h5 mb-0 font-weight-bold text-gray-800">
                            {formatCurrency(summary.overview.pendingAmount)}
                          </div>
                          <div className="text-xs text-muted mt-1">
                            Awaiting admin processing
                          </div>
                        </div>
                        <div className="col-auto">
                          <i className="bi bi-clock text-warning fs-2"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                  <div className="card border-left-info shadow h-100 py-2">
                    <div className="card-body">
                      <div className="row no-gutters align-items-center">
                        <div className="col mr-2">
                          <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                            Total Orders
                          </div>
                          <div className="h5 mb-0 font-weight-bold text-gray-800">
                            {summary.overview.totalOrders}
                          </div>
                          <div className="text-xs text-muted mt-1">
                            {summary.overview.totalProducts} products sold
                          </div>
                        </div>
                        <div className="col-auto">
                          <i className="bi bi-cart-check text-info fs-2"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Revenue Breakdown */}
                <div className="col-lg-8">
                  <div className="card shadow-sm border-0">
                    <div className="card-header bg-light">
                      <h6 className="fw-bold mb-0">Revenue Breakdown</h6>
                    </div>
                    <div className="card-body">
                      <div className="row text-center mb-4">
                        <div className="col-md-4 mb-3">
                          <div className="p-3 border rounded bg-light">
                            <div className="text-primary fw-bold fs-5">
                              {formatCurrency(summary.overview.totalSales)}
                            </div>
                            <div className="text-muted small">Total Sales</div>
                            <div className="small text-success">100%</div>
                          </div>
                        </div>
                        <div className="col-md-4 mb-3">
                          <div className="p-3 border rounded bg-light">
                            <div className="text-danger fw-bold fs-5">
                              -{formatCurrency(summary.overview.totalPlatformFee + summary.overview.totalShippingFee)}
                            </div>
                            <div className="text-muted small">Total Deductions</div>
                            <div className="small text-danger">
                              {formatPercentage(summary.breakdown.platformFeePercentage + summary.breakdown.shippingFeePercentage)}%
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4 mb-3">
                          <div className="p-3 border rounded bg-success text-white">
                            <div className="fw-bold fs-5">
                              {formatCurrency(summary.overview.totalEarnings)}
                            </div>
                            <div className="small">Net Earnings</div>
                            <div className="small">
                              {formatPercentage(summary.breakdown.earningsPercentage)}%
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Deductions Breakdown */}
                      <div className="row">
                        <div className="col-md-6">
                          <h6 className="fw-semibold mb-3">Deductions Breakdown</h6>
                          <div className="list-group list-group-flush">
                            <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                              <span className="text-danger">
                                <i className="bi bi-percent me-2"></i>
                                Platform Fee (10%)
                              </span>
                              <span className="text-danger fw-bold">
                                -{formatCurrency(summary.overview.totalPlatformFee)}
                              </span>
                            </div>
                            <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                              <span className="text-danger">
                                <i className="bi bi-truck me-2"></i>
                                Shipping Fee (₹100/item)
                              </span>
                              <span className="text-danger fw-bold">
                                -{formatCurrency(summary.overview.totalShippingFee)}
                              </span>
                            </div>
                            <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                              <span className="fw-bold">Total Deductions</span>
                              <span className="text-danger fw-bold">
                                -{formatCurrency(summary.overview.totalPlatformFee + summary.overview.totalShippingFee)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <h6 className="fw-semibold mb-3">Performance</h6>
                          <div className="list-group list-group-flush">
                            <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                              <span>Average Order Value</span>
                              <span className="fw-bold text-primary">
                                {formatCurrency(summary.performance.averageOrderValue)}
                              </span>
                            </div>
                            <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                              <span>Products per Order</span>
                              <span className="fw-bold text-info">
                                {summary.performance.productsPerOrder.toFixed(1)}
                              </span>
                            </div>
                            <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                              <span>Conversion Rate</span>
                              <span className="fw-bold text-success">
                                {summary.performance.conversionRate}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="col-lg-4">
                  <div className="card shadow-sm border-0">
                    <div className="card-header bg-light">
                      <h6 className="fw-bold mb-0">Quick Stats</h6>
                    </div>
                    <div className="card-body">
                      <div className="list-group list-group-flush">
                        <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                          <span>Period</span>
                          <span className="badge bg-primary text-capitalize">
                            {selectedPeriod}
                          </span>
                        </div>
                        <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                          <span>Platform Fee Rate</span>
                          <span className="text-danger">10%</span>
                        </div>
                        <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                          <span>Shipping Fee</span>
                          <span className="text-danger">₹100 per item</span>
                        </div>
                        <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                          <span>Net Margin</span>
                          <span className="text-success fw-bold">
                            {formatPercentage(summary.breakdown.earningsPercentage)}
                          </span>
                        </div>
                        <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                          <span>Lifetime Earnings</span>
                          <span className="fw-bold text-success">
                            {formatCurrency(summary.overview.netEarnings)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Earnings by Period */}
                  {earningsByPeriod.length > 0 && (
                    <div className="card shadow-sm border-0 mt-4">
                      <div className="card-header bg-light">
                        <h6 className="fw-bold mb-0">Earnings Comparison</h6>
                      </div>
                      <div className="card-body">
                        <div className="list-group list-group-flush">
                          {earningsByPeriod.map((periodData, index) => (
                            <div 
                              key={index}
                              className={`list-group-item d-flex justify-content-between align-items-center px-0 ${
                                periodData.period === selectedPeriod ? 'bg-light' : ''
                              }`}
                            >
                              <span className="text-capitalize">{periodData.period}</span>
                              <div className="text-end">
                                <div className="fw-bold text-success">
                                  {formatCurrency(periodData.totalEarnings)}
                                </div>
                                <small className="text-muted">
                                  {periodData.orderCount} orders
                                </small>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent Orders Tab */}
            {activeTab === 'orders' && (
              <div className="row">
                <div className="col-12">
                  <div className="card shadow-sm border-0">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                      <h6 className="fw-bold mb-0">Recent Orders</h6>
                      <small className="text-muted">Showing last 10 orders</small>
                    </div>
                    <div className="card-body">
                      {summary.recentOrders.length === 0 ? (
                        <div className="text-center py-4">
                          <i className="bi bi-receipt text-muted fs-1"></i>
                          <p className="text-muted mt-2">No orders found for this period</p>
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead>
                              <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Items</th>
                                <th>Sales</th>
                                <th>Deductions</th>
                                <th>Earnings</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {summary.recentOrders.map((order, index) => (
                                <tr key={index}>
                                  <td>
                                    <small className="font-monospace">
                                      {order.orderId.toString().slice(-8)}
                                    </small>
                                  </td>
                                  <td>
                                    <div>
                                      <div className="fw-medium">{order.customer.name}</div>
                                      <small className="text-muted">{order.customer.email}</small>
                                    </div>
                                  </td>
                                  <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                  <td>
                                    <span className="badge bg-secondary">
                                      {order.productCount} items
                                    </span>
                                  </td>
                                  <td className="fw-bold">{formatCurrency(order.sales)}</td>
                                  <td className="text-danger">
                                    -{formatCurrency(order.deductions.totalDeductions)}
                                  </td>
                                  <td className="fw-bold text-success">
                                    {formatCurrency(order.earnings)}
                                  </td>
                                  <td>
                                    <span className={`badge ${
                                      order.isPaid ? 'bg-success' : 
                                      order.orderStatus === 'Delivered' ? 'bg-warning' : 'bg-info'
                                    }`}>
                                      {order.isPaid ? 'Paid' : order.orderStatus}
                                    </span>
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
              </div>
            )}

            {/* Payment History Tab */}
            {activeTab === 'payments' && (
              <div className="row">
                <div className="col-12">
                  <div className="card shadow-sm border-0">
                    <div className="card-header bg-light">
                      <h6 className="fw-bold mb-0">Payment History</h6>
                    </div>
                    <div className="card-body">
                      {summary.paymentHistory.length === 0 ? (
                        <div className="text-center py-4">
                          <i className="bi bi-credit-card text-muted fs-1"></i>
                          <p className="text-muted mt-2">No payment history found</p>
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead>
                              <tr>
                                <th>Payment ID</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Orders</th>
                                <th>Status</th>
                                <th>Details</th>
                              </tr>
                            </thead>
                            <tbody>
                              {summary.paymentHistory.map((payment, index) => (
                                <tr key={index}>
                                  <td>
                                    <small className="font-monospace">{payment.paymentId}</small>
                                  </td>
                                  <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                                  <td className="fw-bold text-success">
                                    {formatCurrency(payment.amount)}
                                  </td>
                                  <td>
                                    <span className="badge bg-primary">{payment.orderCount}</span>
                                  </td>
                                  <td>
                                    <span className={`badge ${
                                      payment.status === 'completed' ? 'bg-success' : 
                                      payment.status === 'pending' ? 'bg-warning' : 'bg-danger'
                                    }`}>
                                      {payment.status}
                                    </span>
                                  </td>
                                  <td>
                                    <button className="btn btn-outline-primary btn-sm">
                                      View
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
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="row">
                <div className="col-12">
                  <div className="card shadow-sm border-0">
                    <div className="card-header bg-light">
                      <h6 className="fw-bold mb-0">Performance Analytics</h6>
                    </div>
                    <div className="card-body">
                      <div className="row text-center">
                        <div className="col-md-3 mb-3">
                          <div className="p-3 border rounded">
                            <div className="text-primary fw-bold fs-4">
                              {formatCurrency(summary.performance.averageOrderValue)}
                            </div>
                            <div className="text-muted">Average Order Value</div>
                          </div>
                        </div>
                        <div className="col-md-3 mb-3">
                          <div className="p-3 border rounded">
                            <div className="text-info fw-bold fs-4">
                              {summary.performance.productsPerOrder.toFixed(1)}
                            </div>
                            <div className="text-muted">Products per Order</div>
                          </div>
                        </div>
                        <div className="col-md-3 mb-3">
                          <div className="p-3 border rounded">
                            <div className="text-success fw-bold fs-4">
                              {summary.performance.conversionRate}%
                            </div>
                            <div className="text-muted">Conversion Rate</div>
                          </div>
                        </div>
                        <div className="col-md-3 mb-3">
                          <div className="p-3 border rounded">
                            <div className="text-warning fw-bold fs-4">
                              {formatPercentage(summary.breakdown.earningsPercentage)}
                            </div>
                            <div className="text-muted">Net Margin</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Additional analytics can be added here */}
                      <div className="alert alert-info mt-3">
                        <i className="bi bi-info-circle me-2"></i>
                        <strong>Tip:</strong> Increase your average order value by creating product bundles 
                        and offering complementary items to boost your earnings.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </SellerLayout>
  );
};

export default ProfitSummary;