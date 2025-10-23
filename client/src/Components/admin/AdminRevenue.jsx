import React, { useState, useEffect, useContext } from 'react';
import { Context } from '../../store/Context';
import { toast } from 'react-toastify';
import AdminLayout from './AdminLayout';

const AdminRevenue = () => {
  const { backend } = useContext(Context);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [revenueByPeriod, setRevenueByPeriod] = useState([]);

  useEffect(() => {
    fetchRevenueStats();
    fetchRevenueByPeriod();
  }, [selectedPeriod]);

  const fetchRevenueStats = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${backend}/api/admin/revenue/stats?period=${selectedPeriod}`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await res.json();
      
      if (result.success) {
        setStats(result.stats);
      } else {
        toast.error(result.message || 'Failed to fetch revenue stats');
      }
    } catch (error) {
      console.error('Error fetching revenue stats:', error);
      toast.error('Failed to load revenue statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueByPeriod = async () => {
    try {
      const res = await fetch(`${backend}/api/admin/revenue/period`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await res.json();
      
      if (result.success) {
        setRevenueByPeriod(result.revenueByPeriod);
      }
    } catch (error) {
      console.error('Error fetching revenue by period:', error);
    }
  };

  const exportReport = async () => {
    try {
      const res = await fetch(`${backend}/api/admin/revenue/export`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await res.json();
      
      if (result.success) {
        // In a real app, you would download the file
        toast.success('Revenue report generated successfully');
        console.log('Report data:', result.report);
      } else {
        toast.error(result.message || 'Failed to export report');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export revenue report');
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
      <AdminLayout>
        <div className="container-fluid py-4">
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-body text-center py-5">
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-muted">Loading revenue analytics...</p>
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
                <h2 className="h4 fw-bold text-dark mb-1">Revenue Analytics</h2>
                <p className="text-muted mb-0">Platform earnings and performance metrics</p>
              </div>
              <div className="d-flex gap-2">
                <select 
                  className="form-select form-select-sm"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  style={{ width: '120px' }}
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                  <option value="all">All Time</option>
                </select>
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={fetchRevenueStats}
                >
                  <i className="bi bi-arrow-clockwise"></i>
                </button>
                <button 
                  className="btn btn-success btn-sm"
                  onClick={exportReport}
                >
                  <i className="bi bi-download me-2"></i>
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>

        {stats && (
          <>
            {/* Key Metrics */}
            <div className="row mb-4">
              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card border-left-primary shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                          Total Revenue
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">
                          {formatCurrency(stats.revenue.totalAdminRevenue)}
                        </div>
                        <div className="text-xs text-muted mt-1">
                          {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
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
                          Platform Commission
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">
                          {formatCurrency(stats.revenue.platformRevenue)}
                        </div>
                        <div className="text-xs text-muted mt-1">
                          {formatPercentage(stats.revenue.breakdown.platformPercentage)} of total
                        </div>
                      </div>
                      <div className="col-auto">
                        <i className="bi bi-percent text-success fs-2"></i>
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
                          Shipping Revenue
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">
                          {formatCurrency(stats.revenue.shippingRevenue)}
                        </div>
                        <div className="text-xs text-muted mt-1">
                          {formatPercentage(stats.revenue.breakdown.shippingPercentage)} of total
                        </div>
                      </div>
                      <div className="col-auto">
                        <i className="bi bi-truck text-info fs-2"></i>
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
                          Completed Orders
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">
                          {stats.orders.completedOrders}
                        </div>
                        <div className="text-xs text-muted mt-1">
                          {stats.products.totalProductsSold} products sold
                        </div>
                      </div>
                      <div className="col-auto">
                        <i className="bi bi-cart-check text-warning fs-2"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="row mb-4">
              <div className="col-lg-8">
                <div className="card shadow-sm border-0">
                  <div className="card-header bg-light">
                    <h6 className="fw-bold mb-0">Revenue Breakdown</h6>
                  </div>
                  <div className="card-body">
                    <div className="row text-center">
                      <div className="col-md-6 mb-3">
                        <div className="p-3 border rounded">
                          <div className="text-primary fw-bold fs-4">
                            {formatCurrency(stats.revenue.platformRevenue)}
                          </div>
                          <div className="text-muted">Platform Commission (10%)</div>
                          <div className="small text-success">
                            {formatPercentage(stats.revenue.breakdown.platformPercentage)} of total
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div className="p-3 border rounded">
                          <div className="text-info fw-bold fs-4">
                            {formatCurrency(stats.revenue.shippingRevenue)}
                          </div>
                          <div className="text-muted">Shipping Charges (₹100/item)</div>
                          <div className="small text-success">
                            {formatPercentage(stats.revenue.breakdown.shippingPercentage)} of total
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="d-flex justify-content-between mb-1">
                        <small>Platform Commission</small>
                        <small>Shipping Charges</small>
                      </div>
                      <div className="progress" style={{ height: '20px' }}>
                        <div 
                          className="progress-bar bg-primary" 
                          style={{ width: `${stats.revenue.breakdown.platformPercentage}%` }}
                        >
                          {formatPercentage(stats.revenue.breakdown.platformPercentage)}
                        </div>
                        <div 
                          className="progress-bar bg-info" 
                          style={{ width: `${stats.revenue.breakdown.shippingPercentage}%` }}
                        >
                          {formatPercentage(stats.revenue.breakdown.shippingPercentage)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card shadow-sm border-0">
                  <div className="card-header bg-light">
                    <h6 className="fw-bold mb-0">Performance Summary</h6>
                  </div>
                  <div className="card-body">
                    <div className="list-group list-group-flush">
                      <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                        <span>Total Orders</span>
                        <span className="badge bg-primary rounded-pill">{stats.orders.totalOrders}</span>
                      </div>
                      <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                        <span>Completed Orders</span>
                        <span className="badge bg-success rounded-pill">{stats.orders.completedOrders}</span>
                      </div>
                      <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                        <span>Active Sellers</span>
                        <span className="badge bg-info rounded-pill">{stats.sellers.totalSellers}</span>
                      </div>
                      <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                        <span>Products Sold</span>
                        <span className="badge bg-warning rounded-pill">{stats.products.totalProductsSold}</span>
                      </div>
                      <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                        <span>Total Order Value</span>
                        <span className="fw-bold text-success">{formatCurrency(stats.orders.totalOrderValue)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="row">
              <div className="col-12">
                <div className="card shadow-sm border-0">
                  <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <h6 className="fw-bold mb-0">Recent Transactions</h6>
                    <small className="text-muted">Showing last 10 orders</small>
                  </div>
                  <div className="card-body">
                    {stats.recentTransactions.length === 0 ? (
                      <div className="text-center py-4">
                        <i className="bi bi-receipt text-muted fs-1"></i>
                        <p className="text-muted mt-2">No transactions found</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Order ID</th>
                              <th>Customer</th>
                              <th>Date</th>
                              <th>Order Value</th>
                              <th>Platform Fee</th>
                              <th>Shipping</th>
                              <th>Total Revenue</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.recentTransactions.map((transaction, index) => (
                              <tr key={index}>
                                <td>
                                  <small className="font-monospace">{transaction.orderId.toString().slice(-8)}</small>
                                </td>
                                <td>{transaction.customerName}</td>
                                <td>{new Date(transaction.orderDate).toLocaleDateString()}</td>
                                <td>{formatCurrency(transaction.totalOrderValue)}</td>
                                <td className="text-primary">{formatCurrency(transaction.platformRevenue)}</td>
                                <td className="text-info">{formatCurrency(transaction.shippingRevenue)}</td>
                                <td className="fw-bold text-success">{formatCurrency(transaction.totalAdminRevenue)}</td>
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

            {/* Revenue by Period Comparison */}
            {revenueByPeriod.length > 0 && (
              <div className="row mt-4">
                <div className="col-12">
                  <div className="card shadow-sm border-0">
                    <div className="card-header bg-light">
                      <h6 className="fw-bold mb-0">Revenue Comparison</h6>
                    </div>
                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="table table-bordered">
                          <thead className="table-light">
                            <tr>
                              <th>Period</th>
                              <th>Platform Revenue</th>
                              <th>Shipping Revenue</th>
                              <th>Total Revenue</th>
                              <th>Orders</th>
                              <th>Products</th>
                            </tr>
                          </thead>
                          <tbody>
                            {revenueByPeriod.map((periodData, index) => (
                              <tr key={index} className={periodData.period === selectedPeriod ? 'table-active' : ''}>
                                <td>
                                  <span className="text-capitalize fw-medium">{periodData.period}</span>
                                  {periodData.period === selectedPeriod && (
                                    <span className="badge bg-primary ms-2">Current</span>
                                  )}
                                </td>
                                <td className="text-primary">{formatCurrency(periodData.platformRevenue)}</td>
                                <td className="text-info">{formatCurrency(periodData.shippingRevenue)}</td>
                                <td className="fw-bold text-success">{formatCurrency(periodData.totalRevenue)}</td>
                                <td>{periodData.orderCount}</td>
                                <td>{periodData.productCount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminRevenue;