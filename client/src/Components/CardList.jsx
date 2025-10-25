// import React, { useEffect, useState, useContext } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { Context } from "../store/Context";
// import { toast } from "react-toastify";
// import { Form, Button, Row, Col, Card } from "react-bootstrap";


// // Helper Component for Star Rating
// const StarRating = ({ rating = 0 }) => {
//   const fullStars = Math.round(rating);
//   return (
//     <div>
//       {[...Array(5)].map((_, i) => (
//         <span key={i} className={i < fullStars ? "text-warning" : "text-secondary opacity-50"}>★</span>
//       ))}
//     </div>
//   );
// };

// // Helper Component for Address Form
// const AddressForm = ({ shippingInfo, handleInputChange }) => (
//   <>
//     <h5 className="fw-semibold mb-3">Add Delivery Address</h5>
//     <Row>
//       <Col md={6}><Form.Group className="mb-3"><Form.Label>First Name*</Form.Label><Form.Control type="text" name="firstName" value={shippingInfo.firstName} onChange={handleInputChange} required /></Form.Group></Col>
//       <Col md={6}><Form.Group className="mb-3"><Form.Label>Last Name*</Form.Label><Form.Control type="text" name="lastName" value={shippingInfo.lastName} onChange={handleInputChange} /></Form.Group></Col>
//     </Row>
//     <Form.Group className="mb-3"><Form.Label>Address*</Form.Label><Form.Control as="textarea" rows={3} name="address" value={shippingInfo.address} onChange={handleInputChange} required /></Form.Group>
//     <Row>
//       <Col md={6}><Form.Group className="mb-3"><Form.Label>City*</Form.Label><Form.Control type="text" name="city" value={shippingInfo.city} onChange={handleInputChange} required /></Form.Group></Col>
//       <Col md={6}><Form.Group className="mb-3"><Form.Label>State*</Form.Label><Form.Control type="text" name="state" value={shippingInfo.state} onChange={handleInputChange} required /></Form.Group></Col>
//     </Row>
//     <Row>
//       <Col md={6}><Form.Group className="mb-3"><Form.Label>Zip / Postal code*</Form.Label><Form.Control type="number" name="pinCode" value={shippingInfo.pinCode} onChange={handleInputChange} required /></Form.Group></Col>
//       <Col md={6}><Form.Group className="mb-3"><Form.Label>Phone Number*</Form.Label><Form.Control type="number" name="phoneNumber" value={shippingInfo.phoneNumber} onChange={handleInputChange} required /></Form.Group></Col>
//     </Row>
//   </>
// );

// function CartPage() {
//   const { isLoggedIn, user ,refreshCartCount, backend} = useContext(Context);
//   const navigate = useNavigate();
//   const [cartItems, setCartItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showCheckout, setShowCheckout] = useState(false);
//   const [shippingInfo, setShippingInfo] = useState({
//     firstName: "", lastName: "", address: "", city: "", state: "", pinCode: "", phoneNumber: "",
//   });
//   const [paymentMethod, setPaymentMethod] = useState("razorpay");
//   const [razorpayLoaded, setRazorpayLoaded] = useState(false);
//     const [isProcessingPayment, setIsProcessingPayment] = useState(false);
//   const [isPlacingCODOrder, setIsPlacingCODOrder] = useState(false);

//   // Load Razorpay SDK
//   useEffect(() => {
//     const loadRazorpay = () => {
//       return new Promise((resolve) => {
//         const script = document.createElement('script');
//         script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//         script.onload = () => {
//           setRazorpayLoaded(true);
//           resolve(true);
//         };
//         script.onerror = () => {
//           console.error('❌ Failed to load Razorpay SDK');
//           resolve(false);
//         };
//         document.body.appendChild(script);
//       });
//     };

//     loadRazorpay();
//   }, []);

//   // Fetch cart items
//   useEffect(() => {
//     const fetchCartItems = async () => {
//       setLoading(true);
//       try {
//         if (isLoggedIn) {
//           const res = await axios.get(`${backend}/api/v1/userproduct/cart`, { withCredentials: true });
          
//           if (res.data.success) {
//             setCartItems(res.data.cartItems || []);
//           } else {
//             toast.error(res.data.message || "Failed to load cart.");
//           }
//         } else {
//           const localCart = JSON.parse(localStorage.getItem("cartItems")) || [];
//           setCartItems(localCart);
//         }
//       } catch (err) {
//         console.error("❌ Error fetching cart:", err);
//         toast.error("Failed to load cart.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCartItems();
//   }, [isLoggedIn, backend]);

//   // Update quantity
//   const handleQuantityChange = async (productId, newQuantity) => {
//     if (newQuantity < 1) return;
    
//     const originalCart = [...cartItems];
//     const updatedCart = cartItems.map(item => 
//       item._id === productId ? { ...item, quantity: newQuantity } : item
//     );
//     setCartItems(updatedCart);

//     try {
//       if (isLoggedIn) {
//         await axios.put(
//           `${backend}/api/v1/userproduct/cart/update`,
//           { productId, quantity: newQuantity },
//           { withCredentials: true }
//         );
//       } else {
//         localStorage.setItem("cartItems", JSON.stringify(updatedCart));
//       }
//     } catch (error) {
//       setCartItems(originalCart);
//       console.error("❌ Update quantity error:", error);
//       toast.error("Failed to update quantity.");
//     }
//   };

//   // Remove item from cart
//   const handleRemove = async (productId) => {
//     const originalCart = [...cartItems];
//     const updatedCart = originalCart.filter(item => item._id !== productId);
//     setCartItems(updatedCart);

//     try {
//       if (isLoggedIn) {
//         const res = await axios.delete(`${backend}/api/v1/userproduct/cart/remove`, {
//           data: { productId }, withCredentials: true
//         });
        
//         if (res.data.success) {
//           refreshCartCount();
//         } else {
//           setCartItems(originalCart);
//           toast.error("Failed to remove item.");
//         }
//       } else {
//         localStorage.setItem("cartItems", JSON.stringify(updatedCart));
      
//       }
//     } catch (error) {
//       setCartItems(originalCart);
//       console.error("❌ Remove from cart error:", error);
//       toast.error("An error occurred while removing the item.");
//     }
//   };

//   const handleCheckoutClick = () => {
//     if (!isLoggedIn) {
//       toast.info("Please log in to proceed with your order.");
//       navigate('/login');
//       return;
//     }

//     setShowCheckout(true);
//     setTimeout(() => {
//       document.getElementById("checkout-form-section")?.scrollIntoView({ behavior: "smooth" });
//     }, 100);
//   };
  
//   const handleInputChange = (e) => {
//     setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
//   };

//   // Calculate totals
//   const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
//   const totalPrice = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

//   const handleProceedToPayment = async (e) => {
//     e.preventDefault();
    
//     if (!shippingInfo.firstName || !shippingInfo.address || !shippingInfo.city || !shippingInfo.state || !shippingInfo.pinCode || !shippingInfo.phoneNumber) {
//       return toast.error("Please fill all the required address fields.");
//     }

//     if (shippingInfo.phoneNumber.length !== 10) {
//       return toast.error("Please enter a valid 10-digit phone number.");
//     }

//     try {
//       if (paymentMethod === 'cod') {
//         const res = await axios.post(`${backend}/api/v1/userproduct/order/new-from-cart`, {
//           shippingInfo, 
//           paymentMethod: "COD", 
//           paymentInfo: { status: "Pending" }
//         }, { withCredentials: true });
        
//         if (res.data.success) {
//           toast.success("Order placed successfully!");
//           setCartItems([]);
//           navigate('/orders');
//         }
//       } else {
//         // Check if Razorpay is loaded
//         if (!razorpayLoaded || !window.Razorpay) {
//           toast.error("Payment system is loading. Please wait a moment and try again.");
//           return;
//         }
//          setIsProcessingPayment(true);

//         const { data: { key } } = await axios.get(`${backend}/api/v1/userproduct/payment/key`, { withCredentials: true });
//         const { data: { order } } = await axios.post(
//           `${backend}/payment/create`, 
//           { amount: Math.round(totalPrice * 100) },
//           { withCredentials: true }
//         );
        
//         const options = {
//           key, 
//           amount: order.amount, 
//           currency: "INR", 
//           name: "Your Store", 
//           description: "Cart Payment", 
//           order_id: order.id,
//           handler: async function (response) {
//             try {
//               const verification = await axios.post(`${backend}/api/v1/userproduct/payment/verify`, response, { withCredentials: true });
              
//               if (verification.data.success) {
//                 const orderRes = await axios.post(`${backend}/api/v1/userproduct/order/new-from-cart`, {
//                   shippingInfo, 
//                   paymentMethod: "Razorpay",
//                   paymentInfo: { 
//                     id: response.razorpay_payment_id, 
//                     orderId: response.razorpay_order_id, 
//                     signature: response.razorpay_signature, 
//                     status: "Paid" 
//                   },
//                 }, { withCredentials: true });
                
//                 if (orderRes.data.success) {
//                   toast.success("Payment successful & Order placed!");
//                   setCartItems([]);
//                   navigate('/orders');
//                 }
//               } else {
//                 toast.error("Payment verification failed.");
//               }
//             } catch (error) {
//               console.error("❌ Order creation after payment error:", error);
//               toast.error("Order creation failed after payment.");
//             }finally {
//               setIsProcessingPayment(false);
//             }
//           },
//           prefill: { 
//             name: user?.name || shippingInfo.firstName, 
//             email: user?.email || "", 
//             contact: shippingInfo.phoneNumber 
//           },
//           theme: { color: "#f08804" },
//           modal: {
//             ondismiss: function() {
//               toast.info("Payment cancelled by user");
//               setIsProcessingPayment(false);
//             }
//           }
//         };
        
//         console.log('🔄 Opening Razorpay checkout...');
//         const rzp1 = new window.Razorpay(options);
//         rzp1.open();
//       }
//     } catch (error) {
//       console.error("❌ Checkout error:", error);
//       toast.error(error.response?.data?.message || "An error occurred during checkout.");
//     }finally {
//       setIsProcessingPayment(false);
//       setIsPlacingCODOrder(false);
//     }
//   };

//   return (
//    <div className="container py-5" style={{ marginTop: "80px" }}>
//       <div className="row">
//         {/* Shopping Cart Section - Left Side */}
//         <div className="col-lg-8">
//           <h2 className="mb-4 fw-bold">🛒 Your Shopping Cart</h2>
//           <div className="card shadow-sm">
//             {loading ? (
//               <div className="text-center p-5">
//                 <div className="spinner-border text-primary" role="status">
//                   <span className="visually-hidden">Loading...</span>
//                 </div>
//                 <p className="mt-2">Loading your cart...</p>
//               </div>
//             ) : cartItems.length === 0 ? (
//               <div className="text-center p-5">
//                 <p className="text-muted">Your cart is empty.</p>
//                 <Link to="/" className="btn btn-primary mt-3">Explore Products</Link>
//               </div>
//             ) : (
//               cartItems.map((product) => (
//                 <div key={product._id} className="d-flex align-items-center justify-content-between p-3 border-bottom">
//                   <div className="d-flex align-items-center">
//                     <img 
//                       src={product.images?.[0]?.url || "https://placehold.co/100x100"} 
//                       alt={product.name} 
//                       className="img-thumbnail me-3" 
//                       style={{ width: "80px", height: "80px", objectFit: "contain" }}
//                     />
//                     <div>
//                       <h5 className="mb-1">{product.name}</h5>
//                       {product.avgRating && <StarRating rating={product.avgRating} />}
//                       <p className="fw-bold text-primary mb-0">₹{product.price?.toLocaleString()}</p>
                      
//                       {/* Quantity Controls */}
//                       <div className="d-flex align-items-center mt-2">
//                         <span className="me-2 fw-semibold">Qty:</span>
//                         <Button 
//                           variant="outline-secondary" 
//                           size="sm"
//                           onClick={() => handleQuantityChange(product._id, (product.quantity || 1) - 1)}
//                           disabled={(product.quantity || 1) <= 1}
//                           style={{ width: "30px", height: "30px" }}
//                         >
//                           -
//                         </Button>
//                         <span className="mx-3 fw-bold">{product.quantity || 1}</span>
//                         <Button 
//                           variant="outline-secondary" 
//                           size="sm"
//                           onClick={() => handleQuantityChange(product._id, (product.quantity || 1) + 1)}
//                           disabled={(product.quantity || 1) >= (product.stock || 99)}
//                           style={{ width: "30px", height: "30px" }}
//                         >
//                           +
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="d-flex align-items-center gap-2">
//                     <div className="text-end me-3">
//                       <p className="fw-bold text-success mb-0">
//                         ₹{((product.price || 0) * (product.quantity || 1)).toLocaleString()}
//                       </p>
//                       <small className="text-muted">
//                         {product.quantity || 1} × ₹{product.price?.toLocaleString()}
//                       </small>
//                     </div>
//                     <Link to={`/product/${product._id}`} className="btn btn-outline-secondary btn-sm">View</Link>
//                     <button 
//                       onClick={() => handleRemove(product._id)} 
//                       className="btn btn-outline-danger btn-sm"
//                     >
//                       Remove
//                     </button>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//         {/* Summary Section - Right Side */}
//         {cartItems.length > 0 && (
//           <div className="col-lg-4">
//             <div className="card shadow-sm p-4 h-100" style={{ position: "sticky", top: "100px" }}>
//               <h4 className="fw-bold border-bottom pb-3">Order Summary</h4>
//               <div className="d-flex justify-content-between mt-3">
//                 <span>Total Items</span>
//                 <span className="fw-bold">{totalItems}</span>
//               </div>
//               <div className="d-flex justify-content-between mt-3">
//                 <span>Subtotal</span>
//                 <span>₹{totalPrice.toLocaleString()}</span>
//               </div>
//               <div className="d-flex justify-content-between mt-3">
//                 <span>Shipping</span>
//                 <span className="text-success">FREE</span>
//               </div>
//               <hr />
//               <div className="d-flex justify-content-between mt-3 fs-5 fw-bold">
//                 <span>Total Amount</span>
//                 <span className="text-primary">₹{totalPrice.toLocaleString()}</span>
//               </div>
//               <Button 
//                 onClick={handleCheckoutClick} 
//                 variant="primary" 
//                 className="w-100 mt-4 fw-bold py-2 cart-checkout-btn"
//                 style={{ backgroundColor: "#f08804", border: "none" }}
//                 disabled={!razorpayLoaded && paymentMethod === "razorpay"}
//               >
//                 {!razorpayLoaded && paymentMethod === "razorpay" ? (
//                   <>
//                     <span className="cart-checkout-spinner spinner-border spinner-border-sm me-2" role="status"></span>
//                     Loading Payment...
//                   </>
//                 ) : (
//                   'Proceed to Checkout'
//                 )}
//               </Button>
//               {!razorpayLoaded && paymentMethod === "razorpay" && (
//                 <small className="text-muted text-center mt-2">
//                   Please wait while we load the payment system...
//                 </small>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Checkout Form Section */}
//       {showCheckout && (
//         <Card id="checkout-form-section" className="p-4 shadow-lg mt-5">
//           <Card.Title className="mb-4 fw-bold text-center h4" style={{ color: "#f08804" }}>
//             Delivery & Payment Details
//           </Card.Title>
//           <Form onSubmit={handleProceedToPayment}>
//             <Row className="mb-4">
//               {user?.address ? (
//                 <>
//                   <Col md={5} className="border-end pe-4">
//                     <h5 className="fw-semibold mb-3">Saved Addresses</h5>
//                     <div className="card p-3 mb-2 bg-light">
//                       <p className="mb-1 fw-bold">{user.name}</p>
//                       <p className="mb-1 text-muted small">{user.address}</p>
//                       <p className="mb-1 text-muted small">Phone: {user.phone}</p>
//                       <Button 
//                         size="sm" 
//                         variant="outline-success" 
//                         className="mt-2" 
//                         onClick={() => setShippingInfo({ 
//                           firstName: user.name?.split(" ")[0] || "", 
//                           lastName: user.name?.split(" ")[1] || "", 
//                           address: user.address, 
//                           phoneNumber: user.phone, 
//                           city: '', 
//                           state: '', 
//                           pinCode: '' 
//                         })}
//                       >
//                         DELIVER HERE
//                       </Button>
//                     </div>
//                     <div className="text-center mt-3 text-muted small">...Or use new address on the right.</div>
//                   </Col>
//                   <Col md={7} className="ps-4">
//                     <AddressForm shippingInfo={shippingInfo} handleInputChange={handleInputChange} />
//                   </Col>
//                 </>
//               ) : (
//                 <Col md={12}>
//                   <AddressForm shippingInfo={shippingInfo} handleInputChange={handleInputChange} />
//                 </Col>
//               )}
//             </Row>
//             <hr className="my-4"/>
//             <div className="p-3 bg-light rounded">
//               <h5 className="fw-semibold mb-3">Payment Method</h5>
//               <div className="d-flex gap-4">
//                 <Form.Check 
//                   type="radio" 
//                   id="radio-razorpay" 
//                   name="paymentMethod" 
//                   label="💳 Online Payment (Razorpay)" 
//                   value="razorpay" 
//                   checked={paymentMethod === "razorpay"} 
//                   onChange={(e) => setPaymentMethod(e.target.value)} 
//                   disabled={!razorpayLoaded}
//                 />
//                 <Form.Check 
//                   type="radio" 
//                   id="radio-cod" 
//                   name="paymentMethod" 
//                   label="💰 Cash on Delivery" 
//                   value="cod" 
//                   checked={paymentMethod === "cod"} 
//                   onChange={(e) => setPaymentMethod(e.target.value)} 
//                 />
//               </div>
//               {!razorpayLoaded && paymentMethod === "razorpay" && (
//                 <div className="alert alert-warning mt-2 mb-0">
//                   <small>Payment system is loading. Please wait or choose Cash on Delivery.</small>
//                 </div>
//               )}
//             </div>
//             <div className="text-center mt-4">
//               <Button 
//                 type="submit" 
//                 className="fw-bold px-5 py-2 cart-payment-btn" 
//                 style={{ backgroundColor: "#f08804", border: "none" }}
//                 disabled={(!razorpayLoaded && paymentMethod === "razorpay") || isProcessingPayment || isPlacingCODOrder}
//               >
//                 {isProcessingPayment ? (
//                   <>
//                     <span className="cart-payment-spinner spinner-border spinner-border-sm me-2" role="status"></span>
//                     Processing Payment...
//                   </>
//                 ) : isPlacingCODOrder ? (
//                   <>
//                     <span className="cart-cod-spinner spinner-border spinner-border-sm me-2" role="status"></span>
//                     Placing Order...
//                   </>
//                 ) : paymentMethod === 'cod' ? (
//                   '💰 Place Order (COD)'
//                 ) : !razorpayLoaded ? (
//                   '⏳ Loading Payment...'
//                 ) : (
//                   '💳 Proceed to Payment'
//                 )}
//               </Button>
//             </div>
//           </Form>
//         </Card>
//       )}

//       {/* Add CSS for unique spinner styling */}
//       <style jsx>{`
//         .cart-checkout-spinner,
//         .cart-payment-spinner,
//         .cart-cod-spinner {
//           width: 1rem;
//           height: 1rem;
//           border-width: 2px;
//         }
        
//         .cart-checkout-btn:disabled,
//         .cart-payment-btn:disabled {
//           opacity: 0.7;
//           cursor: not-allowed;
//         }
//       `}</style>
//     </div>
//   );
// }


// export default CartPage;


















import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Context } from "../store/Context";
import { toast } from "react-toastify";
import { Form, Button, Row, Col, Card } from "react-bootstrap";

// Helper Component for Star Rating
const StarRating = ({ rating = 0 }) => {
  const fullStars = Math.round(rating);
  return (
    <div>
      {[...Array(5)].map((_, i) => (
        <span key={i} className={i < fullStars ? "text-warning" : "text-secondary opacity-50"}>★</span>
      ))}
    </div>
  );
};

// Helper Component for Address Form
const AddressForm = ({ shippingInfo, handleInputChange }) => (
  <>
    <h5 className="fw-semibold mb-3">Add Delivery Address</h5>
    <Row>
      <Col md={6}><Form.Group className="mb-3"><Form.Label>First Name*</Form.Label><Form.Control type="text" name="firstName" value={shippingInfo.firstName} onChange={handleInputChange} required /></Form.Group></Col>
      <Col md={6}><Form.Group className="mb-3"><Form.Label>Last Name*</Form.Label><Form.Control type="text" name="lastName" value={shippingInfo.lastName} onChange={handleInputChange} /></Form.Group></Col>
    </Row>
    <Form.Group className="mb-3"><Form.Label>Address*</Form.Label><Form.Control as="textarea" rows={3} name="address" value={shippingInfo.address} onChange={handleInputChange} required /></Form.Group>
    <Row>
      <Col md={6}><Form.Group className="mb-3"><Form.Label>City*</Form.Label><Form.Control type="text" name="city" value={shippingInfo.city} onChange={handleInputChange} required /></Form.Group></Col>
      <Col md={6}><Form.Group className="mb-3"><Form.Label>State*</Form.Label><Form.Control type="text" name="state" value={shippingInfo.state} onChange={handleInputChange} required /></Form.Group></Col>
    </Row>
    <Row>
      <Col md={6}><Form.Group className="mb-3"><Form.Label>Zip / Postal code*</Form.Label><Form.Control type="number" name="pinCode" value={shippingInfo.pinCode} onChange={handleInputChange} required /></Form.Group></Col>
      <Col md={6}><Form.Group className="mb-3"><Form.Label>Phone Number*</Form.Label><Form.Control type="number" name="phoneNumber" value={shippingInfo.phoneNumber} onChange={handleInputChange} required /></Form.Group></Col>
    </Row>
  </>
);

// Cart Item Component for better mobile layout
const CartItem = ({ product, handleQuantityChange, handleRemove }) => {
  return (
    <div className="cart-item p-3 border-bottom">
      {/* Mobile Layout */}
      <div className="d-block d-md-none">
        <div className="d-flex align-items-start mb-3">
          <img 
            src={product.images?.[0]?.url || "https://placehold.co/100x100"} 
            alt={product.name} 
            className="img-thumbnail me-3 flex-shrink-0" 
            style={{ width: "80px", height: "80px", objectFit: "contain" }}
          />
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <h6 className="mb-1 fw-bold text-truncate">{product.name}</h6>
            {product.avgRating && <StarRating rating={product.avgRating} />}
            <p className="fw-bold text-primary mb-2">₹{product.price?.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="d-flex justify-content-between align-items-center">
          {/* Quantity Controls */}
          <div className="d-flex align-items-center">
            <span className="me-2 fw-semibold small">Qty:</span>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => handleQuantityChange(product._id, (product.quantity || 1) - 1)}
              disabled={(product.quantity || 1) <= 1}
              style={{ width: "32px", height: "32px" }}
            >
              -
            </Button>
            <span className="mx-2 fw-bold">{product.quantity || 1}</span>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => handleQuantityChange(product._id, (product.quantity || 1) + 1)}
              disabled={(product.quantity || 1) >= (product.stock || 99)}
              style={{ width: "32px", height: "32px" }}
            >
              +
            </Button>
          </div>
          
          {/* Price and Actions */}
          <div className="text-end">
            <p className="fw-bold text-success mb-1">
              ₹{((product.price || 0) * (product.quantity || 1)).toLocaleString()}
            </p>
            <small className="text-muted d-block">
              {product.quantity || 1} × ₹{product.price?.toLocaleString()}
            </small>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="d-flex gap-2 mt-3">
          <Link to={`/product/${product._id}`} className="btn btn-outline-secondary btn-sm flex-fill">
            View
          </Link>
          <button 
            onClick={() => handleRemove(product._id)} 
            className="btn btn-outline-danger btn-sm flex-fill"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="d-none d-md-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <img 
            src={product.images?.[0]?.url || "https://placehold.co/100x100"} 
            alt={product.name} 
            className="img-thumbnail me-3" 
            style={{ width: "80px", height: "80px", objectFit: "contain" }}
          />
          <div>
            <h5 className="mb-1">{product.name}</h5>
            {product.avgRating && <StarRating rating={product.avgRating} />}
            <p className="fw-bold text-primary mb-0">₹{product.price?.toLocaleString()}</p>
            
            {/* Quantity Controls */}
            <div className="d-flex align-items-center mt-2">
              <span className="me-2 fw-semibold">Qty:</span>
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => handleQuantityChange(product._id, (product.quantity || 1) - 1)}
                disabled={(product.quantity || 1) <= 1}
                style={{ width: "30px", height: "30px" }}
              >
                -
              </Button>
              <span className="mx-3 fw-bold">{product.quantity || 1}</span>
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => handleQuantityChange(product._id, (product.quantity || 1) + 1)}
                disabled={(product.quantity || 1) >= (product.stock || 99)}
                style={{ width: "30px", height: "30px" }}
              >
                +
              </Button>
            </div>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="text-end me-3">
            <p className="fw-bold text-success mb-0">
              ₹{((product.price || 0) * (product.quantity || 1)).toLocaleString()}
            </p>
            <small className="text-muted">
              {product.quantity || 1} × ₹{product.price?.toLocaleString()}
            </small>
          </div>
          <Link to={`/product/${product._id}`} className="btn btn-outline-secondary btn-sm">View</Link>
          <button 
            onClick={() => handleRemove(product._id)} 
            className="btn btn-outline-danger btn-sm"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

function CartPage() {
  const { isLoggedIn, user ,refreshCartCount, backend} = useContext(Context);
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "", lastName: "", address: "", city: "", state: "", pinCode: "", phoneNumber: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isPlacingCODOrder, setIsPlacingCODOrder] = useState(false);

  // Load Razorpay SDK
  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          setRazorpayLoaded(true);
          resolve(true);
        };
        script.onerror = () => {
          console.error('❌ Failed to load Razorpay SDK');
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpay();
  }, []);

  // Fetch cart items
  useEffect(() => {
    const fetchCartItems = async () => {
      setLoading(true);
      try {
        if (isLoggedIn) {
          const res = await axios.get(`${backend}/api/v1/userproduct/cart`, { withCredentials: true });
          
          if (res.data.success) {
            setCartItems(res.data.cartItems || []);
          } else {
            toast.error(res.data.message || "Failed to load cart.");
          }
        } else {
          const localCart = JSON.parse(localStorage.getItem("cartItems")) || [];
          setCartItems(localCart);
        }
      } catch (err) {
        console.error("❌ Error fetching cart:", err);
        toast.error("Failed to load cart.");
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [isLoggedIn, backend]);

  // Update quantity
  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const originalCart = [...cartItems];
    const updatedCart = cartItems.map(item => 
      item._id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);

    try {
      if (isLoggedIn) {
        await axios.put(
          `${backend}/api/v1/userproduct/cart/update`,
          { productId, quantity: newQuantity },
          { withCredentials: true }
        );
      } else {
        localStorage.setItem("cartItems", JSON.stringify(updatedCart));
      }
    } catch (error) {
      setCartItems(originalCart);
      console.error("❌ Update quantity error:", error);
      toast.error("Failed to update quantity.");
    }
  };

  // Remove item from cart
  const handleRemove = async (productId) => {
    const originalCart = [...cartItems];
    const updatedCart = originalCart.filter(item => item._id !== productId);
    setCartItems(updatedCart);

    try {
      if (isLoggedIn) {
        const res = await axios.delete(`${backend}/api/v1/userproduct/cart/remove`, {
          data: { productId }, withCredentials: true
        });
        
        if (res.data.success) {
          refreshCartCount();
        } else {
          setCartItems(originalCart);
          toast.error("Failed to remove item.");
        }
      } else {
        localStorage.setItem("cartItems", JSON.stringify(updatedCart));
      }
    } catch (error) {
      setCartItems(originalCart);
      console.error("❌ Remove from cart error:", error);
      toast.error("An error occurred while removing the item.");
    }
  };

  const handleCheckoutClick = () => {
    if (!isLoggedIn) {
      toast.info("Please log in to proceed with your order.");
      navigate('/login');
      return;
    }

    setShowCheckout(true);
    setTimeout(() => {
      document.getElementById("checkout-form-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };
  
  const handleInputChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  // Calculate totals
  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    
    if (!shippingInfo.firstName || !shippingInfo.address || !shippingInfo.city || !shippingInfo.state || !shippingInfo.pinCode || !shippingInfo.phoneNumber) {
      return toast.error("Please fill all the required address fields.");
    }

    if (shippingInfo.phoneNumber.length !== 10) {
      return toast.error("Please enter a valid 10-digit phone number.");
    }

    try {
      if (paymentMethod === 'cod') {
        setIsPlacingCODOrder(true);
        const res = await axios.post(`${backend}/api/v1/userproduct/order/new-from-cart`, {
          shippingInfo, 
          paymentMethod: "COD", 
          paymentInfo: { status: "Pending" }
        }, { withCredentials: true });
        
        if (res.data.success) {
          toast.success("Order placed successfully!");
          setCartItems([]);
          navigate('/orders');
        }
      } else {
        // Check if Razorpay is loaded
        if (!razorpayLoaded || !window.Razorpay) {
          toast.error("Payment system is loading. Please wait a moment and try again.");
          return;
        }
        setIsProcessingPayment(true);

        const { data: { key } } = await axios.get(`${backend}/api/v1/userproduct/payment/key`, { withCredentials: true });
        const { data: { order } } = await axios.post(
          `${backend}/payment/create`, 
          { amount: Math.round(totalPrice * 100) },
          { withCredentials: true }
        );
        
        const options = {
          key, 
          amount: order.amount, 
          currency: "INR", 
          name: "Your Store", 
          description: "Cart Payment", 
          order_id: order.id,
          handler: async function (response) {
            try {
              const verification = await axios.post(`${backend}/api/v1/userproduct/payment/verify`, response, { withCredentials: true });
              
              if (verification.data.success) {
                const orderRes = await axios.post(`${backend}/api/v1/userproduct/order/new-from-cart`, {
                  shippingInfo, 
                  paymentMethod: "Razorpay",
                  paymentInfo: { 
                    id: response.razorpay_payment_id, 
                    orderId: response.razorpay_order_id, 
                    signature: response.razorpay_signature, 
                    status: "Paid" 
                  },
                }, { withCredentials: true });
                
                if (orderRes.data.success) {
                  toast.success("Payment successful & Order placed!");
                  setCartItems([]);
                  navigate('/orders');
                }
              } else {
                toast.error("Payment verification failed.");
              }
            } catch (error) {
              console.error("❌ Order creation after payment error:", error);
              toast.error("Order creation failed after payment.");
            } finally {
              setIsProcessingPayment(false);
            }
          },
          prefill: { 
            name: user?.name || shippingInfo.firstName, 
            email: user?.email || "", 
            contact: shippingInfo.phoneNumber 
          },
          theme: { color: "#f08804" },
          modal: {
            ondismiss: function() {
              toast.info("Payment cancelled by user");
              setIsProcessingPayment(false);
            }
          }
        };
        
        console.log('🔄 Opening Razorpay checkout...');
        const rzp1 = new window.Razorpay(options);
        rzp1.open();
      }
    } catch (error) {
      console.error("❌ Checkout error:", error);
      toast.error(error.response?.data?.message || "An error occurred during checkout.");
    } finally {
      setIsProcessingPayment(false);
      setIsPlacingCODOrder(false);
    }
  };

  return (
    <div className="container py-4" style={{ marginTop: "80px" }}>
      <div className="row">
        {/* Shopping Cart Section - Left Side */}
        <div className="col-lg-8 mb-4">
          <h2 className="mb-4 fw-bold">🛒 Your Shopping Cart</h2>
          <div className="card shadow-sm">
            {loading ? (
              <div className="text-center p-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading your cart...</p>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center p-5">
                <p className="text-muted">Your cart is empty.</p>
                <Link to="/" className="btn btn-primary mt-3">Explore Products</Link>
              </div>
            ) : (
              cartItems.map((product) => (
                <CartItem 
                  key={product._id} 
                  product={product}
                  handleQuantityChange={handleQuantityChange}
                  handleRemove={handleRemove}
                />
              ))
            )}
          </div>
        </div>

        {/* Summary Section - Right Side */}
        {cartItems.length > 0 && (
          <div className="col-lg-4">
            <div className="card shadow-sm p-3 p-md-4 h-100" style={{ position: "sticky", top: "100px" }}>
              <h4 className="fw-bold border-bottom pb-3">Order Summary</h4>
              <div className="d-flex justify-content-between mt-3">
                <span>Total Items</span>
                <span className="fw-bold">{totalItems}</span>
              </div>
              <div className="d-flex justify-content-between mt-3">
                <span>Subtotal</span>
                <span>₹{totalPrice.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between mt-3">
                <span>Shipping</span>
                <span className="text-success">FREE</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mt-3 fs-5 fw-bold">
                <span>Total Amount</span>
                <span className="text-primary">₹{totalPrice.toLocaleString()}</span>
              </div>
              <Button 
                onClick={handleCheckoutClick} 
                variant="primary" 
                className="w-100 mt-4 fw-bold py-2 cart-checkout-btn"
                style={{ backgroundColor: "#f08804", border: "none" }}
                disabled={!razorpayLoaded && paymentMethod === "razorpay"}
              >
                {!razorpayLoaded && paymentMethod === "razorpay" ? (
                  <>
                    <span className="cart-checkout-spinner spinner-border spinner-border-sm me-2" role="status"></span>
                    Loading Payment...
                  </>
                ) : (
                  'Proceed to Checkout'
                )}
              </Button>
              {!razorpayLoaded && paymentMethod === "razorpay" && (
                <small className="text-muted text-center mt-2">
                  Please wait while we load the payment system...
                </small>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Checkout Form Section */}
      {showCheckout && (
        <Card id="checkout-form-section" className="p-3 p-md-4 shadow-lg mt-4">
          <Card.Title className="mb-4 fw-bold text-center h4" style={{ color: "#f08804" }}>
            Delivery & Payment Details
          </Card.Title>
          <Form onSubmit={handleProceedToPayment}>
            <Row className="mb-4">
              {user?.address ? (
                <>
                  <Col md={5} className="border-end pe-md-4 mb-4 mb-md-0">
                    <h5 className="fw-semibold mb-3">Saved Addresses</h5>
                    <div className="card p-3 mb-2 bg-light">
                      <p className="mb-1 fw-bold">{user.name}</p>
                      <p className="mb-1 text-muted small">{user.address}</p>
                      <p className="mb-1 text-muted small">Phone: {user.phone}</p>
                      <Button 
                        size="sm" 
                        variant="outline-success" 
                        className="mt-2" 
                        onClick={() => setShippingInfo({ 
                          firstName: user.name?.split(" ")[0] || "", 
                          lastName: user.name?.split(" ")[1] || "", 
                          address: user.address, 
                          phoneNumber: user.phone, 
                          city: '', 
                          state: '', 
                          pinCode: '' 
                        })}
                      >
                        DELIVER HERE
                      </Button>
                    </div>
                    <div className="text-center mt-3 text-muted small">...Or use new address on the right.</div>
                  </Col>
                  <Col md={7} className="ps-md-4">
                    <AddressForm shippingInfo={shippingInfo} handleInputChange={handleInputChange} />
                  </Col>
                </>
              ) : (
                <Col md={12}>
                  <AddressForm shippingInfo={shippingInfo} handleInputChange={handleInputChange} />
                </Col>
              )}
            </Row>
            <hr className="my-4"/>
            <div className="p-3 bg-light rounded">
              <h5 className="fw-semibold mb-3">Payment Method</h5>
              <div className="d-flex flex-column flex-md-row gap-3 gap-md-4">
                <Form.Check 
                  type="radio" 
                  id="radio-razorpay" 
                  name="paymentMethod" 
                  label="💳 Online Payment (Razorpay)" 
                  value="razorpay" 
                  checked={paymentMethod === "razorpay"} 
                  onChange={(e) => setPaymentMethod(e.target.value)} 
                  disabled={!razorpayLoaded}
                />
                <Form.Check 
                  type="radio" 
                  id="radio-cod" 
                  name="paymentMethod" 
                  label="💰 Cash on Delivery" 
                  value="cod" 
                  checked={paymentMethod === "cod"} 
                  onChange={(e) => setPaymentMethod(e.target.value)} 
                />
              </div>
              {!razorpayLoaded && paymentMethod === "razorpay" && (
                <div className="alert alert-warning mt-2 mb-0">
                  <small>Payment system is loading. Please wait or choose Cash on Delivery.</small>
                </div>
              )}
            </div>
            <div className="text-center mt-4">
              <Button 
                type="submit" 
                className="fw-bold px-4 px-md-5 py-2 cart-payment-btn" 
                style={{ backgroundColor: "#f08804", border: "none" }}
                disabled={(!razorpayLoaded && paymentMethod === "razorpay") || isProcessingPayment || isPlacingCODOrder}
              >
                {isProcessingPayment ? (
                  <>
                    <span className="cart-payment-spinner spinner-border spinner-border-sm me-2" role="status"></span>
                    Processing Payment...
                  </>
                ) : isPlacingCODOrder ? (
                  <>
                    <span className="cart-cod-spinner spinner-border spinner-border-sm me-2" role="status"></span>
                    Placing Order...
                  </>
                ) : paymentMethod === 'cod' ? (
                  '💰 Place Order (COD)'
                ) : !razorpayLoaded ? (
                  '⏳ Loading Payment...'
                ) : (
                  '💳 Proceed to Payment'
                )}
              </Button>
            </div>
          </Form>
        </Card>
      )}

      {/* Add CSS for better mobile responsiveness */}
      <style jsx>{`
        .cart-checkout-spinner,
        .cart-payment-spinner,
        .cart-cod-spinner {
          width: 1rem;
          height: 1rem;
          border-width: 2px;
        }
        
        .cart-checkout-btn:disabled,
        .cart-payment-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        /* Mobile-specific improvements */
        @media (max-width: 768px) {
          .cart-item {
            padding: 1rem !important;
          }
          
          .container {
            padding-left: 12px;
            padding-right: 12px;
          }
        }
      `}</style>
    </div>
  );
}

export default CartPage;
