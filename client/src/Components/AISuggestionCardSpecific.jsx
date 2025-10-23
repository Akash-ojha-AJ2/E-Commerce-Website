
import React, { useState } from "react";
import { Container, Row, Col, Badge, Button, Accordion } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { Context } from "../store/Context";

const AISuggestionCardSpecific = ({ product }) => {
  console.log("Re-rendering component, selectedProduct is:", product);
  const [preview, setPreview] = useState(product.images?.[0]?.url || "");
  const [activeThumb, setActiveThumb] = useState(0);
    const { isLoggedIn , refreshCartCount,backend } = useContext(Context);
  const navigate = useNavigate();


  
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
                           
                       } else {
                           toast.info('Product is already in the cart.');
                       }
                   } catch (error) {
                       console.error("Error updating localStorage cart:", error);
                       toast.error('Could not add product to cart.');
                   }
               }
           };

  const handleThumbClick = (img, index) => {
    setPreview(img.url);
    setActiveThumb(index);
  };


   const handleBuyNow = (id) =>{
            navigate(`/product/${id}`)
           }
           
  // Fallback for missing data
  const productName = product.name || "Product Name Not Available";
  const productBrand = product.brand || "Unknown Brand";
  const productDescription = product.description || "No description available for this product.";
  const productPrice = product.price ? `₹${product.price.toLocaleString()}` : "Price Not Available";
  const specifications = product.specifications || [];

  return (
    <Container className="my-4" fluid>
      <div className="bg-white rounded-4 shadow-lg overflow-hidden">
        <Row className="g-0">
          <Col lg={6} className="p-4 border-end">
            <div className="d-flex flex-column h-100">
              <div className="flex-grow-1 d-flex align-items-center justify-content-center bg-light rounded-3 mb-3 p-4">
                <img
                  src={preview}
                  alt={productName}
                  className="img-fluid"
                  style={{ 
                    maxHeight: "400px", 
                    objectFit: "contain",
                    transition: "transform 0.3s ease"
                  }}
                  onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
                  onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                />
              </div>

              <div className="thumbnail-gallery">
                <h6 className="text-muted mb-3">More Views</h6>
                <div className="d-flex gap-2 flex-wrap">
                  {product.images?.map((img, index) => (
                    <div
                      key={index}
                      className={`thumbnail-item ${activeThumb === index ? 'active' : ''}`}
                      onClick={() => handleThumbClick(img, index)}
                      style={{
                        width: "60px",
                        height: "60px",
                        border: activeThumb === index ? "3px solid #007bff" : "2px solid #e9ecef",
                        borderRadius: "8px",
                        cursor: "pointer",
                        padding: "2px",
                        transition: "all 0.2s ease",
                        backgroundColor: "white"
                      }}
                    >
                      <img
                        src={img.url}
                        alt={`Thumb ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          borderRadius: "6px"
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Col>

          <Col lg={6} className="p-4">
            <div className="d-flex flex-column h-100">
              <div className="mb-3">
                <Badge bg="light" text="dark" className="mb-2">
                  {productBrand}
                </Badge>
                <h1 className="h2 fw-bold text-dark mb-2" style={{ lineHeight: "1.2" }}>
                  {productName}
                </h1>
                
                <div className="d-flex align-items-center mb-3">
                  <span className="h3 text-danger fw-bold me-2">{productPrice}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-muted text-decoration-line-through h5">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {product.avgRating && (
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-warning text-dark px-2 py-1 rounded d-flex align-items-center">
                      <span className="fw-bold me-1">{product.avgRating}</span>
                      <span>★</span>
                    </div>
                    <small className="text-muted ms-2">
                      {product.reviewCount ? `(${product.reviewCount} reviews)` : ''}
                    </small>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <div className="d-grid gap-2 d-md-flex">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="flex-grow-1 me-md-2"
                    onClick={() => handleBuyNow(product._id)}
                  >
                    Buy Now
                  </Button>
                  <Button 
                    variant="outline-primary" 
                    size="lg"
                    className="flex-grow-1"
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h5 className="fw-semibold mb-3 text-dark">Product Description</h5>
                <p 
                  className="text-muted" 
                  style={{ 
                    lineHeight: "1.6",
                    fontSize: "0.95rem"
                  }}
                >
                  {productDescription}
                </p>
              </div>

              {/* Specifications */}
              {specifications.length > 0 && (
                <div className="mt-auto">
                  <Accordion defaultActiveKey="0" flush>
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>
                        <h5 className="mb-0 fw-semibold">Specifications</h5>
                      </Accordion.Header>
                      <Accordion.Body className="p-0">
                        <div className="specs-table">
                          {specifications.map((spec, index) => (
                            <div 
                              key={index}
                              className={`d-flex border-bottom ${index % 2 === 0 ? 'bg-light' : ''}`}
                              style={{ padding: "12px 16px" }}
                            >
                              <div className="flex-shrink-0" style={{ width: "200px", fontWeight: "500" }}>
                                {spec.key}
                              </div>
                              <div className="flex-grow-1 text-muted">
                                {spec.value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </div>

      {/* Additional Features Section */}
      {product.features && product.features.length > 0 && (
        <Row className="mt-4">
          <Col>
            <div className="bg-white rounded-4 shadow-sm p-4">
              <h5 className="fw-semibold mb-3">Key Features</h5>
              <Row>
                {product.features.map((feature, index) => (
                  <Col md={6} key={index} className="mb-2">
                    <div className="d-flex align-items-center">
                      <span className="text-success me-2">✓</span>
                      <span>{feature}</span>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          </Col>
        </Row>
      )}

      <style jsx>{`
        .thumbnail-item.active {
          border-color: #007bff !important;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }
        
        .thumbnail-item:hover {
          border-color: #007bff !important;
          transform: translateY(-2px);
        }
        
        .specs-table div:last-child {
          border-bottom: none !important;
        }
      `}</style>
    </Container>
  );


};

export default AISuggestionCardSpecific;
