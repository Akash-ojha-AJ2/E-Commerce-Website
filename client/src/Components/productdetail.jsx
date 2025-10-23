import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button, Row, Col, Card } from "react-bootstrap";
import { Context } from "../store/Context";
import axios from "axios";
import { toast } from "react-toastify"; // Make sure to import toast

// ⭐ Helper Component for Average Star Rating
const ProductRating = ({ avgRating, reviewCount }) => {

  
  if (!reviewCount || reviewCount === 0) {
    return <p className="text-muted mb-3">No reviews yet.</p>;
  }

  const renderStars = () => {
    let stars = [];
    const fullStars = Math.round(avgRating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= fullStars ? "text-warning" : "text-secondary opacity-50"}>
          {i <= fullStars ? "★" : "☆"}
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="d-flex align-items-center mb-3">
      {renderStars()}
      <span className="ms-2 text-muted">
        {avgRating.toFixed(1)} out of 5 ({reviewCount} ratings)
      </span>
    </div>
  );
};




// 📝 Helper Component for Individual Reviews List
const ReviewsSection = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  const renderSingleReviewStars = (rating) => {
    let stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "text-warning" : "text-secondary opacity-50"}>
          {i <= rating ? "★" : "☆"}
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="shadow-lg bg-white rounded-4 p-4 mb-5">
      <h3 className="fw-bold mb-4">Customer Reviews</h3>
      {reviews.map((review) => (
        <div key={review._id} className="border-bottom pb-3 mb-3">
          <div className="d-flex align-items-center mb-2">
            <strong className="me-3">{review.user?.name || "Anonymous"}</strong>
            <div>{renderSingleReviewStars(review.rating)}</div>
          </div>
          <p className="mb-1">{review.comment}</p>
          <small className="text-muted">
            Reviewed on {new Date(review.createdAt).toLocaleDateString("en-IN", {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </small>
        </div>
      ))}
    </div>
  );
};

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn , refreshCartCount , backend} = useContext(Context);
  const [product, setProduct] = useState(null);
  const [preview, setPreview] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "", lastName: "", address: "", city: "", state: "", pinCode: "", phoneNumber: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [purchasePurpose, setPurchasePurpose] = useState("personal");

  useEffect(() => {
    const loadRazorpayScript = () => {
      if (window.Razorpay) {
        setRazorpayLoaded(true);
        return;
      }
      if (document.getElementById("razorpay-checkout-js")) return;
      
      const script = document.createElement("script");
      script.id = "razorpay-checkout-js";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => setRazorpayLoaded(true);
      script.onerror = () => {
        console.error("Failed to load Razorpay script");
        toast.error("Failed to load payment system");
      };
      document.body.appendChild(script);
    };

    const fetchData = async () => {
      try {
        const res = await fetch(`${backend}/api/v1/userproduct/productsdeatil/${id}`, {
          credentials: "include",
        });
        const data = await res.json();
        setProduct(data);
        setPreview(data.images?.[0]?.url);
        loadRazorpayScript();
      } catch (err) {
        console.error("Product fetch failed:", err);
        toast.error("Failed to load product details");
      }
    };
    fetchData();
  }, [id]);


        let localCartIds = [];
           if (!isLoggedIn) {
               try {
                   const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
                   localCartIds = cartItems.map(item => item._id);
               } catch (error) {
                   console.error("Error parsing cart items from localStorage:", error);
                   localCartIds = [];
               }
           }
       
           const handleAddToCart = async (product) => {
               // This function remains unchanged
               if (isLoggedIn) {
                   try {
                       const res = await fetch(`${backend}/api/v1/userproduct/products/add-card`, {
                           method: 'POST',
                           headers: { 'Content-Type': 'application/json' },
                           credentials: 'include',
                           body: JSON.stringify({ productId: product._id }),
                       });
                       if (res.ok) {
                          //  toast.success('Product added successfully');
                           refreshCartCount();
                       } else {
                           const data = await res.json();
                           toast.error(data.message || 'Failed to add product');
                       }
                   } catch (err) {
                       console.error('Error adding to cart', err);
                       toast.error('An error occurred. Please try again.');
                   }
               } else {
                   try {
                       const currentCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
                       if (!currentCart.some(item => item._id === product._id)) {
                           const updatedCart = [...currentCart, product];
                           localStorage.setItem('cartItems', JSON.stringify(updatedCart));
                           
                       } else {
                           toast.info('Product is already in the cart.');
                       }
                   } catch (error) {
                       console.error("Error updating localStorage cart:", error);
                       toast.error('Could not add product to cart.');
                   }
               }
           };

  // Quantity handlers (वही रहेंगे)
  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) setQuantity(value);
  };

  const totalPrice = product ? product.price * quantity : 0;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo({ ...shippingInfo, [name]: value });
  };

  const handleBuyNowClick = () => {
    if (!isLoggedIn) {
      toast.error("Please login to proceed with the order.");
      navigate("/login");
      return;
    }
    setShowForm(true);
    document.getElementById("checkout-form-section")?.scrollIntoView({ behavior: "smooth" });
  };

  // ✅ FIXED: Payment Handler
  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!shippingInfo.firstName || !shippingInfo.address || !shippingInfo.city || 
        !shippingInfo.state || !shippingInfo.pinCode || !shippingInfo.phoneNumber) {
      return toast.error("Please fill all the required address fields.");
    }

    if (shippingInfo.phoneNumber.length !== 10) {
      return toast.error("Please enter a valid 10-digit phone number.");
    }

    try {
      if (paymentMethod === 'cod') {
        // COD Order
        await handleCODOrder();
      } else {
        // Razorpay Payment
        await handleRazorpayPayment();
      }
    } catch (error) {
      console.error("❌ Checkout error:", error);
      toast.error(error.response?.data?.message || "An error occurred during checkout.");
    }
  };

  // ✅ FIXED: COD Order Handler
  const handleCODOrder = async () => {
    const orderData = {
      shippingInfo,
      orderItems: [{
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.images[0]?.url,
        product: product._id,
        seller: product.seller,
      }],
      totalPrice: totalPrice,
      paymentMethod: "COD",
      purchasePurpose: purchasePurpose,
      paymentInfo: { status: "Pending" }
    };

    const res = await axios.post(`${backend}/api/v1/singleOrder/order/new-from-cart`, orderData, { 
      withCredentials: true 
    });
    
    if (res.data.success) {
      toast.success("Order placed successfully!");
      navigate('/orders');
    } else {
      toast.error(res.data.message || "Failed to place order");
    }
  };

  // ✅ FIXED: Razorpay Payment Handler
  const handleRazorpayPayment = async () => {
    if (!razorpayLoaded || !window.Razorpay) {
      toast.error("Payment system is loading. Please wait a moment and try again.");
      return;
    }

    // Get Razorpay key
    const { data: { key } } = await axios.get(`${backend}/api/v1/singleOrder/payment/key`, { 
      withCredentials: true 
    });

    // Create order in Razorpay (amount in paise)
    const amountInPaise = Math.round(totalPrice * 100);
    const { data: { order: razorpayOrder } } = await axios.post(
      `${backend}/api/v1/singleOrder/payment/create`, 
      { amount: amountInPaise },
      { withCredentials: true }
    );

    const options = {
      key, 
      amount: razorpayOrder.amount, // ✅ FIXED: No need to multiply by 100 again
      currency: "INR", 
      name: "Your Store", 
      description: `Payment for ${product.name}`, 
      order_id: razorpayOrder.id,
      handler: async function (response) {
        try {
          console.log("🔄 Payment successful, verifying...", response);
          
          // Verify payment
          const verification = await axios.post(
            `${backend}/api/v1/singleOrder/payment/verify`, 
            response, 
            { withCredentials: true }
          );
          
          if (verification.data.success) {
            await createOrderAfterPayment(response);
          } else {
            toast.error("Payment verification failed.");
          }
        } catch (error) {
          console.error("❌ Payment verification error:", error);
          toast.error("Payment verification failed.");
        }
      },
      prefill: { 
        name: user?.name || `${shippingInfo.firstName} ${shippingInfo.lastName}`, 
        email: user?.email || "", 
        contact: shippingInfo.phoneNumber 
      },
      theme: { color: "#f08804" },
      modal: {
        ondismiss: function() {
          toast.info("Payment cancelled by user");
        }
      }
    };

    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  };

  // ✅ FIXED: Create Order After Successful Payment
  const createOrderAfterPayment = async (paymentResponse) => {
    try {
      const orderData = {
        shippingInfo,
        orderItems: [{
          name: product.name,
          price: product.price,
          quantity: quantity,
          image: product.images[0]?.url,
          product: product._id,
          seller: product.seller,
        }],
        totalPrice: totalPrice,
        paymentMethod: "Razorpay",
        purchasePurpose: purchasePurpose,
        paymentInfo: { 
          id: paymentResponse.razorpay_payment_id, 
          orderId: paymentResponse.razorpay_order_id, 
          signature: paymentResponse.razorpay_signature, 
          status: "Paid" 
        }
      };

      const orderRes = await axios.post(
        `${backend}/api/v1/singleOrder/order/singleOrder`, 
        orderData, 
        { withCredentials: true }
      );
      
      if (orderRes.data.success) {
        toast.success("Payment successful & Order placed!");
        navigate('/orders');
      } else {
        toast.error(orderRes.data.message || "Order creation failed after payment.");
      }
    } catch (error) {
      console.error("❌ Order creation after payment error:", error);
      toast.error("Order creation failed after payment.");
      
      // If order creation fails but payment is successful, show warning
      toast.warning("Payment was successful but order creation failed. Please contact support.");
    }
  };

  if (!product) return <div className="p-5 text-center">Loading...</div>;

  return (
    <div className="container my-5">
      <div className="row g-4 shadow-lg bg-white rounded-4 p-4 mb-5">
        {/* Left Product Gallery */}
        <div className="col-md-5 d-flex">
          <div className="me-3 d-flex flex-column gap-2">
            {product.images?.map((img, i) => (
              <img key={i} src={img.url} alt={`Thumb ${i}`} style={{ width: "50px", height: "50px", objectFit: "contain", border: preview === img.url ? "2px solid #f08804" : "1px solid #ccc", cursor: "pointer", }} onClick={() => setPreview(img.url)} />
            ))}
          </div>
          <div className="flex-grow-1 d-flex align-items-center justify-content-center bg-light rounded">
            <img src={preview} alt={product.name} className="img-fluid" style={{ maxHeight: "400px", objectFit: "contain", padding: "10px" }} />
          </div>
        </div>

        {/* Right Product Info */}
        <div className="col-md-7">
          <h2 className="fw-bold">{product.name}</h2>

          <ProductRating avgRating={product.avgRating} reviewCount={product.reviewCount} />
          
          <p className="text-muted">Brand: {product.brand || "Unknown"}</p>
          <h3 className="text-danger fw-bold mb-3">
            ₹{product.price?.toLocaleString()}
          </h3>

          {/* Quantity Selector */}
          <div className="mb-4">
            <h5 className="fw-semibold">Quantity:</h5>
            <div className="d-flex align-items-center gap-3">
              <div className="input-group" style={{ width: "150px" }}>
                <button 
                  className="btn btn-outline-secondary" 
                  type="button" 
                  onClick={decreaseQuantity}
                >
                  -
                </button>
                <input 
                  type="number" 
                  className="form-control text-center" 
                  value={quantity} 
                  onChange={handleQuantityChange}
                  min="1"
                />
                <button 
                  className="btn btn-outline-secondary" 
                  type="button" 
                  onClick={increaseQuantity}
                >
                  +
                </button>
              </div>
              <div className="fw-semibold">
                Total: ₹{(totalPrice).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h5 className="fw-semibold">About this item:</h5>
            <p style={{ lineHeight: "1.6" }}>{product.description || "..."}</p>
          </div>
          <div className="mb-4">
            <h5 className="fw-semibold">Specifications:</h5>
            <table className="table table-bordered">
              <tbody>
                {(product.specifications || []).map((spec) => (
                  <tr key={spec._id}>
                    <th style={{ width: '40%' }}>{spec.key}</th>
                    <td>{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="d-flex gap-3">
            <button className="btn btn-warning fw-semibold px-4" onClick={()=> {handleAddToCart(product)}}>Add to Cart</button>
            <button onClick={handleBuyNowClick} className="btn text-white fw-semibold px-4" style={{ backgroundColor: "#f08804" }}>Buy Now</button>
          </div>
        </div>
      </div>
      
     <ReviewsSection reviews={product.reviews} />

      {/* Checkout Form */}
      {showForm && (
        <Card id="checkout-form-section" className="p-4 shadow-lg mb-5">
          <Card.Title className="mb-4 fw-bold text-center" style={{ color: "#f08804" }} >
            <div className="d-flex justify-content-center align-items-center gap-2">
              <span className="h4 m-0">3. Delivery & Payment Details</span>
            </div>
          </Card.Title>
          
          {/* Order Summary */}
          <div className="mb-4 p-3 bg-light rounded">
            <h5 className="fw-semibold mb-3">Order Summary</h5>
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3">
                <img 
                  src={product.images?.[0]?.url} 
                  alt={product.name} 
                  style={{ width: "60px", height: "60px", objectFit: "contain" }}
                />
                <div>
                  <h6 className="mb-1">{product.name}</h6>
                  <p className="mb-0 text-muted">Quantity: {quantity}</p>
                </div>
              </div>
              <div className="text-end">
                <p className="mb-1">₹{product.price?.toLocaleString()} × {quantity}</p>
                <h6 className="mb-0 text-danger">Total: ₹{totalPrice.toLocaleString()}</h6>
              </div>
            </div>
          </div>

          <Form onSubmit={handleProceedToPayment}>
            <Row className="mb-4">
              {user?.address ? (
                <>
                  <Col md={5} className="border-end pe-4">
                    <h5 className="fw-semibold mb-3">Saved Addresses</h5>
                    <div className="card p-3 mb-2 bg-light border-orange">
                      <p className="mb-1 fw-bold">{user.name}</p>
                      <p className="mb-1 text-muted">{user.address}</p>
                      <p className="mb-1 text-muted"> Phone Number: {user.phone} </p>
                      <Button size="sm" variant="outline-success" className="mt-2" onClick={() => setShippingInfo({ ...shippingInfo, firstName: user.name?.split(" ")[0] || "", lastName: user.name?.split(" ")[1] || "", address: user.address, phoneNumber: user.phone, }) } > DELIVER HERE </Button>
                    </div>
                    <div className="text-center mt-3 text-muted"> ...Or use new address on the right. </div>
                  </Col>
                  <Col md={7} className="ps-4">
                    <AddressForm shippingInfo={shippingInfo} handleInputChange={handleInputChange} />
                  </Col>
                </>
              ) : (
                <Col md={12}>
                  <AddressForm shippingInfo={shippingInfo} handleInputChange={handleInputChange} />
                </Col>
              )}
            </Row>
            <hr className="my-4" />
            <div className="p-3 bg-light rounded">
              <h5 className="fw-semibold mb-3"> Payment Method & Purchase Purpose </h5>
              <Row>
                <Col md={6}>
                  <Form.Label className="fw-bold">Payment Method</Form.Label>
                  <div className="d-flex gap-4">
                    <Form.Check type="radio" id="radio-razorpay" name="paymentMethod" label="Online Payment (Razorpay)" value="razorpay" checked={paymentMethod === "razorpay"} onChange={(e) => setPaymentMethod(e.target.value)} />
                    <Form.Check type="radio" id="radio-cod" name="paymentMethod" label="Cash on Delivery (COD)" value="cod" checked={paymentMethod === "cod"} onChange={(e) => setPaymentMethod(e.target.value)} />
                  </div>
                </Col>
                <Col md={6}>
                  <Form.Label className="fw-bold">Purchase Purpose</Form.Label>
                  <div className="d-flex gap-4">
                    <Form.Check type="radio" id="radio-personal" name="purchasePurpose" label="Personal Use" value="personal" checked={purchasePurpose === "personal"} onChange={(e) => setPurchasePurpose(e.target.value)} />
                    <Form.Check type="radio" id="radio-gift" name="purchasePurpose" label="Gift (Send to someone)" value="gift" checked={purchasePurpose === "gift"} onChange={(e) => setPurchasePurpose(e.target.value)} />
                  </div>
                </Col>
              </Row>
            </div>
            <div className="text-center mt-4">
              <Button type="submit" className="fw-bold px-5" style={{ backgroundColor: "#f08804", border: "none" }} > 
                {paymentMethod === "cod" ? `Place Order (₹${totalPrice.toLocaleString()}) & Pay on Delivery` : `PROCEED TO PAY ₹${totalPrice.toLocaleString()}`} 
              </Button>
            </div>
          </Form>
        </Card>
      )}
    </div>
  );
}

// This helper component remains unchanged
const AddressForm = ({ shippingInfo, handleInputChange }) => (
  <>
    <h5 className="fw-semibold mb-3">Add Delivery Address</h5>
    <Row>
      <Col md={6}><Form.Group className="mb-3" controlId="firstName"><Form.Label>First Name*</Form.Label><Form.Control type="text" name="firstName" value={shippingInfo.firstName} onChange={handleInputChange} required /></Form.Group></Col>
      <Col md={6}><Form.Group className="mb-3" controlId="lastName"><Form.Label>Last Name*</Form.Label><Form.Control type="text" name="lastName" value={shippingInfo.lastName} onChange={handleInputChange} required /></Form.Group></Col>
    </Row>
    <Form.Group className="mb-3" controlId="address"><Form.Label>Address*</Form.Label><Form.Control as="textarea" rows={3} name="address" value={shippingInfo.address} onChange={handleInputChange} required /></Form.Group>
    <Row>
      <Col md={6}><Form.Group className="mb-3" controlId="city"><Form.Label>City*</Form.Label><Form.Control type="text" name="city" value={shippingInfo.city} onChange={handleInputChange} required /></Form.Group></Col>
      <Col md={6}><Form.Group className="mb-3" controlId="state"><Form.Label>State*</Form.Label><Form.Control type="text" name="state" value={shippingInfo.state} onChange={handleInputChange} required /></Form.Group></Col>
    </Row>
    <Row>
      <Col md={6}><Form.Group className="mb-3" controlId="pinCode"><Form.Label>Zip / Postal code*</Form.Label><Form.Control type="number" name="pinCode" value={shippingInfo.pinCode} onChange={handleInputChange} required /></Form.Group></Col>
      <Col md={6}><Form.Group className="mb-3" controlId="phoneNumber"><Form.Label>Phone Number*</Form.Label><Form.Control type="number" name="phoneNumber" value={shippingInfo.phoneNumber} onChange={handleInputChange} required /></Form.Group></Col>
    </Row>
  </>
);

export default ProductDetail;