import React, { useState, useEffect, useContext } from 'react';
import { Context } from '../store/Context';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert, Badge, Modal } from 'react-bootstrap';
import './Order.css'; // We'll create this custom CSS file next
import { toast } from 'react-toastify';

// This can be your existing ReviewModal, just make sure it's styled with react-bootstrap components
// For example, use <Modal>, <Modal.Header>, <Modal.Body>, <Modal.Footer>, <Form>, <Button>
import ReviewModal from './ReviewModal'; 

const statusConfig = {
    Processing: { color: 'warning', step: 1 },
    Confirmed: { color: 'primary', step: 2 },
    Packed: { color: 'info', step: 3 },
    Shipped: { color: 'dark', step: 4 },
    Delivered: { color: 'success', step: 5 },
    Cancelled: { color: 'danger', step: 0 },
    Returned: { color: 'secondary', step: 0 },
};

const orderSteps = ['Processing', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

// Component for a single Order Card
const MyOrderCard = ({ order, onReviewClick }) => {
    const isDelivered = order.orderStatus === 'Delivered';
    const canReviewAnyItem = order.orderItems.some(item => isDelivered && !item.isReviewed);
    const currentStatusInfo = statusConfig[order.orderStatus] || { color: 'light', step: 0 };
    const currentStep = currentStatusInfo.step;

    return (
        <Card className="mb-4 shadow-sm order-card">
            <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                <div>
                    <h5 className="mb-0">Order #{order.orderNumber}</h5>
                    <small className="text-muted">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </small>
                </div>
                <div className="text-end">
                    <h5 className="mb-0">₹{order.totalPrice.toLocaleString()}</h5>
                    <small className="text-muted">{order.paymentMethod}</small>
                </div>
            </Card.Header>
            <Card.Body>
                <Row>
                    {/* Items List */}
                    <Col md={8} className="order-items-section">
                        {order.orderItems.map((item) => (
                            <div key={item._id} className="d-flex align-items-center mb-3">
                                <img
                                    src={item.image || item.product?.images?.[0]?.url || 'https://via.placeholder.com/60'}
                                    alt={item.name}
                                    className="order-item-image"
                                />
                                <div className="ms-3">
                                    <p className="fw-bold mb-0">{item.name}</p>
                                    <p className="text-muted mb-0">Qty: {item.quantity}</p>
                                </div>
                            </div>
                        ))}
                    </Col>
                    {/* Shipping Info */}
                    <Col md={4} className="shipping-info-section">
                        <h6>Delivery Address</h6>
                        <p className="mb-1">{order.shippingInfo.address}, {order.shippingInfo.city}</p>
                        <p className="mb-1">{order.shippingInfo.state} - {order.shippingInfo.pinCode}</p>
                        <p className="mb-0 text-muted">📞 {order.shippingInfo.phoneNumber}</p>
                    </Col>
                </Row>

                {/* Status Tracker */}
                {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Returned' && (
                    <div className="status-tracker-container mt-4">
                        <div className="status-tracker">
                            {orderSteps.map((status, index) => (
                                <div 
                                    key={status} 
                                    className={`step-item ${index + 1 <= currentStep ? 'completed' : ''}`}
                                >
                                    <div className="step-circle"></div>
                                    <div className="step-label">{status}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Card.Body>
            <Card.Footer className="d-flex justify-content-between align-items-center">
                <div>
                    <strong>Status: </strong>
                    <Badge bg={currentStatusInfo.color} pill>
                        {order.orderStatus}
                    </Badge>
                </div>
                {canReviewAnyItem && (
                    <Button
                        variant="primary"
                        onClick={() => onReviewClick(order.orderItems.find(item => !item.isReviewed))}
                    >
                        Write a Review
                    </Button>
                )}
            </Card.Footer>
        </Card>
    );
};


// Main Page Component
const Order = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const { user,refreshCartCount,backend } = useContext(Context);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axios.get(
                `${backend}/api/order/user/${user._id}`, { withCredentials: true }
            );
            if (data.success) {
                // Sort orders by most recent first
                const sortedOrders = data.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setOrders(sortedOrders);
                refreshCartCount();
            } else {
                setError("Failed to load orders.");
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError("An error occurred. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?._id) {
            fetchOrders();
        }
    }, [user]);

    const handleOpenModal = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    const handleReviewSubmitted = (reviewedProductId) => {
        setOrders(prevOrders =>
            prevOrders.map(order => ({
                ...order,
                orderItems: order.orderItems.map(item =>
                    item.product?._id === reviewedProductId ? { ...item, isReviewed: true } : item
                )
            }))
        );
        toast.success("Thank you for your review!");
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = searchTerm === "" ||
            order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.orderItems.some(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        const matchesStatus = filterStatus === "all" || order.orderStatus === filterStatus;
        return matchesSearch && matchesStatus;
    });
    
    return (
        <Container className="my-5">
            <Row className="mb-4">
                <Col>
                    <h1 className="display-5">My Orders</h1>
                    <p className="text-muted">Track, review, and manage your past and current orders.</p>
                </Col>
            </Row>

            {/* Search and Filter Controls */}
            <Row className="mb-4 g-3">
                <Col md={8}>
                    <Form.Control
                        type="text"
                        placeholder="Search by Order # or Product Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Col>
                <Col md={4}>
                    <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">All Statuses</option>
                        {Object.keys(statusConfig).map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </Form.Select>
                </Col>
            </Row>

            {/* Orders List */}
            <div>
                {loading && (
                    <div className="text-center py-5">
                        <Spinner animation="border" role="status" variant="primary">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                        <p className="mt-2">Fetching your orders...</p>
                    </div>
                )}

                {error && (
                    <Alert variant="danger" className="text-center">
                        <Alert.Heading>Oops! Something went wrong.</Alert.Heading>
                        <p>{error}</p>
                        <Button onClick={fetchOrders} variant="outline-danger">Try Again</Button>
                    </Alert>
                )}

                {!loading && !error && filteredOrders.length === 0 && (
                    <div className="text-center py-5 empty-state">
                        <h3 className="mb-3">📦</h3>
                        <h4>No Orders Found</h4>
                        <p className="text-muted">
                            {searchTerm || filterStatus !== "all"
                                ? "Try adjusting your search or filter."
                                : "You haven't placed any orders yet."}
                        </p>
                    </div>
                )}

                {!loading && !error && (
                    <div>
                        {filteredOrders.map(order => (
                            <MyOrderCard key={order._id} order={order} onReviewClick={handleOpenModal} />
                        ))}
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {isModalOpen && selectedItem && (
                <ReviewModal
                    item={selectedItem}
                    show={isModalOpen} // pass show prop for react-bootstrap modal
                    onClose={handleCloseModal}
                    onReviewSubmit={handleReviewSubmitted}
                />
            )}
        </Container>
    );
};

export default Order;