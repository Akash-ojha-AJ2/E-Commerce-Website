import React, { useEffect, useState, useContext } from "react";
import { Card, Badge, Button, Row, Col, Modal, Form } from "react-bootstrap";
import axios from "axios";
import { Context } from "../../store/Context";
import OrderCardSkeleton from "../spinner/OrderCardSkeleton";
import SellerLayout from "./SellerLayout";

const statusColors = {
  Processing: "warning",
  Packed: "info",
  Shipped: "primary",
  Delivered: "success",
  Cancelled: "danger",
};

const MyOrder = () => {
  const { user, isLoggedIn, backend } = useContext(Context);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");


  useEffect(() => {
    if (!isLoggedIn) return;
    fetchOrders();
  }, [isLoggedIn]);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${backend}/api/seller/myorders`, { withCredentials: true });
      
      // ✅ SAFE DATA HANDLING
      if (data.success && Array.isArray(data.orders)) {
        console.log(data.orders)
        setOrders(data.orders);
      } else {
        console.error('Invalid orders data:', data);
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setShowModal(true);
  };

  const updateStatus = async () => {
    if (!selectedOrder) return;
    
    try {
      await axios.put(
         `${backend}/api/seller/status/${selectedOrder._id}`,
        { status: newStatus },
        { withCredentials: true }
      );
      setShowModal(false);
      fetchOrders(); // Refresh orders
    } catch (err) {
      console.error('Status update error:', err);
      alert("Failed to update status");
    }
  };

  // ✅ RENDER ORDER ITEMS SAFELY
  const renderOrderItems = (order) => {
    // Check if we have sellerItems (new backend) or orderItems (old backend)
    const items = order.sellerItems || order.orderItems || [];
    
    if (!Array.isArray(items) || items.length === 0) {
      return <div className="text-muted">No products found</div>;
    }

    return items.map((item, idx) => (
      <div key={idx} className="d-flex align-items-center gap-3 mb-2 p-2 border rounded bg-light">
        <img 
          src={item.product?.images?.[0]?.url || '/default-image.png'} 
          alt={item.product?.name || 'Product'} 
          width="50" 
          height="50" 
          style={{objectFit: 'contain'}}
        />
        <div className="w-100">
          <div className="fw-bold small">{item.product?.name || item.name || 'Product'}</div>
          <div className="d-flex justify-content-between">
            <small className="text-muted">Qty: {item.quantity || 1}</small>
            <small className="fw-semibold">₹{(item.price || 0).toLocaleString()}</small>
          </div>
        </div>
      </div>
    ));
  };

  // ✅ CALCULATE TOTAL SAFELY
  const calculateTotal = (order) => {
    // Use sellerTotal if available, otherwise calculate from items
    if (order.sellerTotal !== undefined) {
      return order.sellerTotal;
    }
    
    const items = order.sellerItems || order.orderItems || [];
    return items.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 1)), 0);
  };

  return (
       <SellerLayout>
    <div className="container my-5">
      <h2 className="mb-4 text-center">My Orders</h2>
      
      {!loading && orders.length === 0 && (
        <div className="text-center py-5">
          <h4>No orders found</h4>
          <p className="text-muted">You haven't received any orders yet.</p>
        </div>
      )}

      <Row className="g-4">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, index) => (
            <OrderCardSkeleton key={index} />
          ))
        ) : (
          // ✅ SAFE ORDERS RENDERING
          orders.map((order) => (
            <Col md={12} key={order._id}>
              <Card className="shadow-lg">
                <Card.Body className="p-sm-4 p-3">
                  <Row>
                    {/* Left Side – Customer & Shipping Info */}
                    <Col md={4} className="border-md-end pb-3 pb-md-0 mb-3 mb-md-0 border-bottom border-md-0">
                      <h5 className="mb-2">Customer Info</h5>
                      <p className="mb-1 small">
                        <strong>Name:</strong> {order.user?.name || 'N/A'}
                      </p>
                      <p className="mb-1 small">
                        <strong>Email:</strong> {order.user?.email || 'N/A'}
                      </p>
                      <p className="mb-1 small">
                        <strong>Phone:</strong> {order.user?.phoneNumber || 'N/A'}
                      </p>
                      
                      <h5 className="mt-3 mb-2">Shipping Info</h5>
                      <address className="small mb-0">
                        {order.shippingInfo?.address || 'N/A'}<br/>
                        {order.shippingInfo?.city || 'N/A'}, {order.shippingInfo?.state || 'N/A'}<br/>
                        PIN: {order.shippingInfo?.pinCode || 'N/A'}
                      </address>

                      <h5 className="mt-3 mb-2">Payment Method</h5>
                      <Badge bg="secondary">{order.paymentMethod || 'N/A'}</Badge>
                    </Col>

                    {/* Right Side – Products + Total + Status */}
                    <Col md={8} className="ps-md-4">
                      <div className="d-flex flex-column flex-sm-row justify-content-sm-between align-items-sm-start gap-2 mb-3">
                        <div className="text-center text-sm-start">
                          <h6 className="mb-0">Order ID</h6>
                          <small className="text-muted">{order._id}</small>
                        </div>
                        <div className="d-flex align-items-center gap-2 align-self-center align-self-sm-end mt-2 mt-sm-0">
                          <Badge bg={statusColors[order.orderStatus] || 'secondary'} style={{ fontSize: '0.8rem' }}>
                            {order.orderStatus}
                          </Badge>
                          <Button size="sm" onClick={() => handleStatusChange(order)}>
                            Update Status
                          </Button>
                        </div>
                      </div>

                      <hr />

                      <div className="mb-3">
                        <h6>Products ({order.sellerItemsCount || (order.sellerItems || order.orderItems || []).length})</h6>
                        {renderOrderItems(order)}
                      </div>

                      <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                        <h5 className="mb-0">
                          Total: ₹{calculateTotal(order).toLocaleString()}
                        </h5>
                        <Badge bg="dark">{order.purchasePurpose || 'personal'}</Badge>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Status Update Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Order Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
            <option value="Processing">Processing</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </Form.Select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={updateStatus}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
    </SellerLayout>
  );
};

export default MyOrder;
