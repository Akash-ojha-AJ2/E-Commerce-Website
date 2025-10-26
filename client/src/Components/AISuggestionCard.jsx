// import { Card, Button, Badge, Row, Col } from "react-bootstrap";
// import { useNavigate } from "react-router-dom";
// import { useContext } from "react";
// import { Context } from "../store/Context";

// function ProductCard({ product }) {
//   const { isLoggedIn, refreshCartCount , backend} = useContext(Context);
//   const navigate = useNavigate();
//   const defaultImage = "https://via.placeholder.com/150";

//   const handleAddToCart = async (product) => {
//     if (isLoggedIn) {
//       try {
//         const res = await fetch(`${backend}/api/v1/userproduct/products/add-card`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           credentials: 'include',
//           body: JSON.stringify({ productId: product._id }),
//         });
//         if (res.ok) {
//           refreshCartCount();
//         } else {
//           const data = await res.json();
//           toast.error(data.message || 'Failed to add product');
//         }
//       } catch (err) {
//         console.error('Error adding to cart', err);
//         toast.error('An error occurred. Please try again.');
//       }
//     } else {
//       try {
//         const currentCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
//         if (!currentCart.some(item => item._id === product._id)) {
//           const updatedCart = [...currentCart, product];
//           localStorage.setItem('cartItems', JSON.stringify(updatedCart));
//         } else {
//           toast.info('Product is already in the cart.');
//         }
//       } catch (error) {
//         console.error("Error updating localStorage cart:", error);
//         toast.error('Could not add product to cart.');
//       }
//     }
//   };

//   const handleBuyNow = (id) => {
//     navigate(`/product/${id}`)
//   };

//   const calculateAverageRating = (ratings) => {
//     if (!ratings || ratings.length === 0) return 4;
//     const total = ratings.reduce((sum, r) => sum + (r.rating || 0), 0);
//     return (total / ratings.length).toFixed(1);
//   };

//   const avgRating = product.avgRating || calculateAverageRating(product.ratings);

//   const StarRating = ({ rating }) => (
//     <div className="star-rating">
//       {[...Array(5)].map((_, i) => (
//         <span key={i} className={i < Math.floor(rating) ? "text-warning" : "text-muted"}>
//           ★
//         </span>
//       ))}
//       <small className="text-muted ms-1">({rating})</small>
//     </div>
//   );

//   return (
//     <Card
//       className="tablet-combo-card shadow-sm border-0 mx-auto"
//       style={{
//         width: "95%",
//         maxWidth: "380px",
//         borderRadius: "12px",
//         transition: "transform 0.2s ease",
//         height: "180px", 
//       }}
//     >
//       <Row className="g-0 h-100">
//         <Col xs={5} className="h-100">
//           <div className="h-100 d-flex align-items-center justify-content-center p-2">
//             <img
//               src={product.images?.[0]?.url || defaultImage}
//               alt={product.name}
//               className="rounded-3"
//               style={{
//                 width: "100%",
//                 height: "100%",
//                 maxHeight: "140px",
//                 objectFit: "contain",
//                 backgroundColor: "#f8f9fa",
//                 padding: "4px",
//               }}
//             />
//           </div>
//         </Col>

       
//         <Col xs={7} className="h-100">
//           <div className="h-100 d-flex flex-column p-2">
//             <div className="flex-grow-1">
//               <div 
//                 className="fw-semibold mb-1"
//                 style={{ 
//                   fontSize: "0.85rem", 
//                   lineHeight: "1.1em",
//                   height: "2.2em",
//                   overflow: "hidden",
//                   display: "-webkit-box",
//                   WebkitLineClamp: 2,
//                   WebkitBoxOrient: "vertical"
//                 }}
//                 title={product.name}
//               >
//                 {product.name}
//               </div>

//               <div 
//                 className="mb-2"
//                 style={{ 
//                   height: "1.8em",
//                   overflow: "hidden"
//                 }}
//               >
//                 <div className="d-flex flex-wrap gap-1">
//                   {product.specifications?.slice(0, 2).map((spec, idx) => (
//                     <Badge key={idx} bg="light" text="dark" style={{ fontSize: "0.65rem" }}>
//                       {spec.value}
//                     </Badge>
//                   ))}
//                 </div>
//               </div>
//             </div>

            
//             <div className="mt-auto">
            
//               <div className="d-flex justify-content-between align-items-center mb-2">
//                 <StarRating rating={avgRating} />
//                 <div className="fw-bold text-primary" style={{ fontSize: "0.85rem" }}>
//                   ₹{product.price?.toLocaleString()}
//                 </div>
//               </div>

//               <div className="d-flex gap-2">
//                 <Button
//                   variant="outline-primary"
//                   size="sm"
//                   className="w-50"
//                   style={{ fontSize: "0.7rem", padding: "4px 8px" }}
//                   onClick={() => handleAddToCart(product)}
//                 >
//                   Add
//                 </Button>
//                 <Button
//                   size="sm"
//                   className="w-50"
//                   style={{
//                     backgroundColor: "#6f42c1",
//                     borderColor: "#6f42c1",
//                     fontSize: "0.7rem",
//                     padding: "4px 8px"
//                   }}
//                   onClick={() => handleBuyNow(product._id)}
//                 >
//                   Buy
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </Col>
//       </Row>
//     </Card>
//   );
// }

// export default ProductCard;







import React, { useState, useContext } from "react";
import { Card, Button, Badge, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Context } from "../store/Context";
import { toast } from 'react-toastify';

// ----- STYLE COMPONENT -----
const ProductCardStyles = () => (
  <style>{`
    /* 1. Default (Desktop) styles */
    .pc-mobile-card-wrapper {
      display: none;
    }

    .pc-desktop-card-wrapper {
      display: block;
      width: 100%;
    }

    /* 2. Mobile styles */
    @media (max-width: 768px) {
      /* Desktop card ko mobile par hide karein */
      .pc-desktop-card-wrapper {
        display: none;
        x-overflow: scroll;
      }

      /* Mobile card ko dikhayein */
      .pc-mobile-card-wrapper {
        display: block;
        width: 100%;
      }

      /* --- MOBILE CARD DESIGN --- */
      .pc-mobile-card {
        background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
        border-radius: 16px;
        padding: 16px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        border: 1px solid #e2e8f0;
        position: relative;
        cursor: pointer;
        transition: all 0.3s ease;
        width: 280px; /* Fixed width for scroll items */
        flex-shrink: 0; /* Prevent shrinking in flex container */
      }

      .pc-mobile-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
      }

      .pc-badge {
        position: absolute;
        top: 12px;
        left: 12px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 10px;
        font-weight: 700;
        z-index: 2;
        text-transform: uppercase;
      }

      .pc-wishlist-btn {
        position: absolute;
        top: 12px;
        right: 12px;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        cursor: pointer;
        z-index: 3;
        transition: all 0.3s ease;
      }

      .pc-wishlist-btn:hover {
        background: rgba(255, 255, 255, 1);
        transform: scale(1.1);
      }

      .pc-wishlist-icon {
        font-size: 16px;
        color: #64748b;
        transition: all 0.3s ease;
      }

      .pc-wishlist-icon.active {
        color: #ef4444;
      }

      .pc-image-container {
        width: 100%;
        height: 140px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
        background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
        border-radius: 12px;
        padding: 16px;
      }

      .pc-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
        transition: transform 0.3s ease;
      }

      .pc-brand {
        font-size: 11px;
        color: #64748b;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .pc-name {
        font-size: 14px;
        font-weight: 700;
        color: #1e293b;
        line-height: 1.3;
        margin-bottom: 12px;
        height: 2.6em;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .pc-specs-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 16px;
      }

      .pc-spec-item {
        display: flex;
        align-items: center;
        gap: 6px;
        overflow: hidden;
      }

      .pc-spec-icon {
        width: 16px;
        height: 16px;
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 8px;
        color: white;
        flex-shrink: 0;
      }

      .pc-spec-text {
        font-size: 10px;
        color: #475569;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .pc-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 12px;
        border-top: 1px solid #f1f5f9;
      }

      .pc-price {
        font-size: 18px;
        font-weight: 800;
        color: #dc2626;
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .pc-rating {
        display: flex;
        align-items: center;
        gap: 4px;
        background: rgba(34, 197, 94, 0.1);
        padding: 4px 8px;
        border-radius: 8px;
      }

      .pc-rating-number {
        font-size: 11px;
        font-weight: 800;
        color: #000;
      }

      .pc-rating-star {
        font-size: 11px;
        color: #22c55e;
      }

      /* HORIZONTAL SCROLL CONTAINER STYLES */
      .product-scroll-container {
        display: flex;
        overflow-x: auto;
        gap: 16px;
        padding: 16px 8px;
        scroll-snap-type: x mandatory;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .product-scroll-container::-webkit-scrollbar {
        display: none;
      }

      /* Individual scroll item */
      .product-scroll-item {
        flex: 0 0 280px;
        width: 280px;
        scroll-snap-align: start;
      }

      /* Ensure only mobile card shows in scroll container */
      .product-scroll-item .pc-desktop-card-wrapper {
        display: none !important;
      }
      
      .product-scroll-item .pc-mobile-card-wrapper {
        display: block !important;
        width: 100%;
      }

      /* Regular grid view (non-scroll) */
      .pc-mobile-card-wrapper:not(.product-scroll-item .pc-mobile-card-wrapper) {
        width: 100%;
      }

      .pc-mobile-card-wrapper:not(.product-scroll-item .pc-mobile-card-wrapper) .pc-mobile-card {
        width: 100%;
      }
    }
  `}</style>
);

// MAIN PRODUCT CARD COMPONENT
function ProductCard({ product, isScrollItem = false }) {
  const { isLoggedIn, refreshCartCount, backend } = useContext(Context);
  const navigate = useNavigate();
  const defaultImage = "https://via.placeholder.com/150";
  const [isWishlisted, setIsWishlisted] = useState(false);

  // --- Add to Cart Logic ---
  const handleAddToCart = async (product) => {
    if (isLoggedIn) {
      try {
        const res = await fetch(`${backend}/api/v1/userproduct/products/add-card`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ productId: product._id }),
        });
        if (res.ok) {
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
          toast.success('Added to cart!');
        } else {
          toast.info('Product is already in the cart.');
        }
      } catch (error) {
        console.error("Error updating localStorage cart:", error);
        toast.error('Could not add product to cart.');
      }
    }
  };

  const handleBuyNow = (id) => {
    navigate(`/product/${id}`)
  };

  // --- Mobile Wishlist Click ---
  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    handleAddToCart(product);
  };

  // --- Mobile Card Click ---
  const handleCardClick = (e) => {
    if (!e.target.closest('.pc-wishlist-btn')) {
      handleBuyNow(product._id);
    }
  };

  // --- Helpers ---
  const calculateAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 4;
    const total = ratings.reduce((sum, r) => sum + (r.rating || 0), 0);
    return (total / ratings.length).toFixed(1);
  };

  const avgRating = product.avgRating || calculateAverageRating(product.ratings);
  const ratingNum = parseFloat(avgRating).toFixed(1);

  // Mobile specs ke liye helper
  const getProductSpecs = () => {
    const specs = product.specifications || [];
    return {
      spec1: specs[0]?.value || product.category || 'N/A',
      spec2: specs[1]?.value || 'N/A',
      spec3: specs[2]?.value || 'N/A',
      spec4: specs[3]?.value || 'N/A',
    };
  };
  const specs = getProductSpecs();

  // Desktop StarRating
  const StarRating = ({ rating }) => (
    <div className="star-rating">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={i < Math.floor(rating) ? "text-warning" : "text-muted"}>
          ★
        </span>
      ))}
      <small className="text-muted ms-1">({rating})</small>
    </div>
  );

  return (
    <>
      {/* CSS STYLES RENDER KAREIN */}
      <ProductCardStyles />

      {/* ===== 1. DESKTOP VIEW (Original Horizontal Card) ===== */}
      <div className="pc-desktop-card-wrapper">
        <Card
          className="tablet-combo-card shadow-sm border-0 mx-auto"
          style={{
            width: "95%",
            maxWidth: "380px",
            borderRadius: "12px",
            transition: "transform 0.2s ease",
            height: "180px",
          }}
        >
          <Row className="g-0 h-100">
            <Col xs={5} className="h-100">
              <div className="h-100 d-flex align-items-center justify-content-center p-2">
                <img
                  src={product.images?.[0]?.url || defaultImage}
                  alt={product.name}
                  className="rounded-3"
                  style={{
                    width: "100%",
                    height: "100%",
                    maxHeight: "140px",
                    objectFit: "contain",
                    backgroundColor: "#f8f9fa",
                    padding: "4px",
                  }}
                />
              </div>
            </Col>
            <Col xs={7} className="h-100">
              <div className="h-100 d-flex flex-column p-2">
                <div className="flex-grow-1">
                  <div
                    className="fw-semibold mb-1"
                    style={{
                      fontSize: "0.85rem",
                      lineHeight: "1.1em",
                      height: "2.2em",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical"
                    }}
                    title={product.name}
                  >
                    {product.name}
                  </div>
                  <div
                    className="mb-2"
                    style={{ height: "1.8em", overflow: "hidden" }}
                  >
                    <div className="d-flex flex-wrap gap-1">
                      {product.specifications?.slice(0, 2).map((spec, idx) => (
                        <Badge key={idx} bg="light" text="dark" style={{ fontSize: "0.65rem" }}>
                          {spec.value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <StarRating rating={avgRating} />
                    <div className="fw-bold text-primary" style={{ fontSize: "0.85rem" }}>
                      ₹{product.price?.toLocaleString()}
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="w-50"
                      style={{ fontSize: "0.7rem", padding: "4px 8px" }}
                      onClick={() => handleAddToCart(product)}
                    >
                      Add
                    </Button>
                    <Button
                      size="sm"
                      className="w-50"
                      style={{
                        backgroundColor: "#6f42c1",
                        borderColor: "#6f42c1",
                        fontSize: "0.7rem",
                        padding: "4px 8px"
                      }}
                      onClick={() => handleBuyNow(product._id)}
                    >
                      Buy
                    </Button>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </div>

      {/* ===== 2. MOBILE VIEW (New Vertical Card) ===== */}
      <div className={`pc-mobile-card-wrapper ${isScrollItem ? 'product-scroll-item' : ''}`}>
        <div
          className="pc-mobile-card"
          onClick={handleCardClick}
        >
          <div className="pc-badge">
            {product.category || 'FEATURED'}
          </div>

          <button
            className="pc-wishlist-btn"
            onClick={handleWishlistClick}
          >
            <span className={`pc-wishlist-icon ${isWishlisted ? 'active' : ''}`}>
              {isWishlisted ? '❤️' : '🤍'}
            </span>
          </button>

          <div className="pc-image-container">
            <img
              src={product.images?.[0]?.url || defaultImage}
              alt={product.name}
              className="pc-image"
            />
          </div>

          <div className="pc-brand">
            {product.brand || 'ShopKart'}
          </div>

          <div className="pc-name">
            {product.name}
          </div>

          <div className="pc-specs-grid">
            <div className="pc-spec-item">
              <div className="pc-spec-icon">⚡</div>
              <span className="pc-spec-text">{specs.spec1}</span>
            </div>
            <div className="pc-spec-item">
              <div className="pc-spec-icon">💾</div>
              <span className="pc-spec-text">{specs.spec2}</span>
            </div>
            <div className="pc-spec-item">
              <div className="pc-spec-icon">🖥️</div>
              <span className="pc-spec-text">{specs.spec3}</span>
            </div>
            <div className="pc-spec-item">
              <div className="pc-spec-icon">📦</div>
              <span className="pc-spec-text">{specs.spec4}</span>
            </div>
          </div>

          <div className="pc-footer">
            <div className="pc-price">
              ₹{product.price?.toLocaleString()}
            </div>
            <div className="pc-rating">
              <span className="pc-rating-number">{ratingNum}</span>
              <span className="pc-rating-star">★</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductCard;