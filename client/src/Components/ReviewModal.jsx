import React, { useState, useContext } from 'react';
import { Modal, Button, Form } from 'react-bootstrap'; // Spinner को यहाँ से हटा दें
import { Context } from '../store/Context'; 
import axios from 'axios';
import { toast } from 'react-toastify';
import './ReviewModal.css'; 

// ... StarRating कॉम्पोनेंट (जैसा पहले था) ...
const StarRating = ({ rating, setRating }) => {
    return (
        <div className="star-rating">
            {[...Array(5)].map((star, index) => {
                const ratingValue = index + 1;
                return (
                    <label key={index}>
                        <input
                            type="radio"
                            name="rating"
                            value={ratingValue}
                            onClick={() => setRating(ratingValue)}
                        />
                        <span className={`star ${ratingValue <= rating ? 'on' : 'off'}`}>
                            &#9733;
                        </span>
                    </label>
                );
            })}
        </div>
    );
};


const ReviewModal = ({ item, show, onClose, onReviewSubmit }) => {
    const { user ,backend} = useContext(Context);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const productId = item?.product?._id;
    const productName = item?.name || "Product";
    const productImage = item?.image || item?.product?.images?.[0]?.url || 'https://via.placeholder.com/80';

    const handleSubmit = async (e) => {
        // ... handleSubmit फ़ंक्शन (जैसा पहले था, कोई बदलाव नहीं) ...
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please provide a star rating.");
            return;
        }
        if (!comment.trim()) {
            toast.error("Please write a comment.");
            return;
        }
        if (!productId) {
            toast.error("Product ID not found. Cannot submit review.");
            return;
        }

        setIsSubmitting(true);

        try {
            const reviewData = {
                rating,
                comment,
                product: productId,
                user: user._id 
            };
            
            const { data } = await axios.post(
                `${backend}/api/review/create`,
                reviewData,
                { withCredentials: true }
            );

            if (data.success) {
                onReviewSubmit(productId); 
                onClose(); 
            } else {
                toast.error(data.message || "Failed to submit review.");
            }

        } catch (err) {
            console.error("Review submission error:", err);
            toast.error(err.response?.data?.message || "An error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Write a Review</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* ... प्रोडक्ट इमेज और नाम (जैसा पहले था) ... */}
                <div className="d-flex align-items-center mb-3">
                    <img src={productImage} alt={productName} className="order-item-image" />
                    <h5 className="ms-3 mb-0">{productName}</h5>
                </div>

                <Form onSubmit={handleSubmit}>
                    {/* ... रेटिंग और कमेंट फॉर्म (जैसा पहले था) ... */}
                    <Form.Group className="mb-3" controlId="reviewRating">
                        <Form.Label>Your Rating</Form.Label>
                        <StarRating rating={rating} setRating={setRating} />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="reviewComment">
                        <Form.Label>Your Review</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            placeholder="Tell us what you thought about this product..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <div className="d-grid">
                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    {/* ==== यह है नया कस्टम लोडर ==== */}
                                    <span className="btn-loading-spinner">
                                        <span className="dot dot1"></span>
                                        <span className="dot dot2"></span>
                                        <span className="dot dot3"></span>
                                    </span>
                                    {/* ============================== */}
                                    Submitting...
                                </>
                            ) : (
                                "Submit Review"
                            )}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ReviewModal;