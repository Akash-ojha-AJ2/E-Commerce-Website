import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Context } from "../../store/Context";
import { Container, Row, Col, Card, Button, Carousel, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

import CategoryBar from "./CategoryBar";
import MainCarousel from "./MainCarousel";

import "./HomePage.css";

function HomePage() {
  const [smartphones, setSmartphones] = useState([]);
  const [laptops, setLaptops] = useState([]);
  const [mensClothing, setMensClothing] = useState([]);
  const [watches, setWatches] = useState([]);
  const [tablets, setTablets] = useState([]);
  const [headphones, setHeadphones] = useState([]);
  const [washing_machine, setWashing_machine] = useState([]);
  const [gym_essentials, setGym_essentials] = useState([]);
  const { isLoggedIn,backend } = useContext(Context);
  const navigate = useNavigate();
  const { refreshCartCount, isAuthenticated } = useContext(Context);
  const [bannerProducts, setBannerProducts] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Loading state management
  const [isLoading, setIsLoading] = useState({
    smartphones: true,
    laptops: true,
    headphones: true,
    watches: true,
    clothing: true,
    tablets: true,
    washing_machine: true,
    gym_essentials: true
  });

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

  const handleBuyNow = (id) => {
    navigate(`/product/${id}`)
  }

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoadingBanners(true);
        const res = await axios.get(`${backend}/api/v1/userproduct/product/bannner`);
        
        if (res.data.success) {
          setBannerProducts(res.data.products);
        } else {
          toast.error("Failed to load banners");
          setBannerProducts([]);
        }
      } catch (err) {
        console.error("Failed to fetch products with banners", err);
        toast.error("Could not load featured products");
        setBannerProducts([]);
      } finally {
        setLoadingBanners(false);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        setLoadingProducts(true);
        const res = await axios.get(`${backend}/api/v1/userproduct/products`);
        
        // Update products
        setSmartphones(res.data.smartphone || []);
        setLaptops(res.data.laptop || []);
        setMensClothing(res.data.kurta || []);
        setWatches(res.data.smartwatch || []);
        setTablets(res.data.tablet || []);
        setHeadphones(res.data.earbuds || []);
        setWashing_machine(res.data.washing_machine || []);
        setGym_essentials(res.data.gym_essentials || []);

        // Update loading states
        setIsLoading({
          smartphones: false,
          laptops: false,
          headphones: false,
          watches: false,
          clothing: false,
          tablets: false,
          washing_machine: false,
          gym_essentials: false
        });
      } catch (err) {
        console.error("Failed to fetch home products", err);
        setIsLoading({
          smartphones: false,
          laptops: false,
          headphones: false,
          watches: false,
          clothing: false,
          tablets: false,
          washing_machine: false,
          gym_essentials: false
        });
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchHomeProducts();
  }, []);

  const defaultImage = "https://placehold.co/300x300/007bff/ffffff?text=Product+Image";

  const StarRating = ({ rating }) => {
    return (
      <div className="star-rating">
        {[...Array(5)].map((_, index) => (
          <span key={index} className={index < Math.floor(rating || 4) ? "text-warning" : "text-muted"}>
            ★
          </span>
        ))}
        <small className="text-muted ms-1">({rating || 4}.0)</small>
      </div>
    );
  };

  // Loading Skeleton Component
  const ProductCardSkeleton = ({ count = 4 }) => {
    return (
      <Row className="g-3">
        {Array.from({ length: count }).map((_, index) => (
          <Col key={index} xs={12} md={6} lg={3}>
            <Card className="product-card-skeleton">
              <div className="skeleton-image"></div>
              <Card.Body>
                <div className="skeleton-line skeleton-title"></div>
                <div className="skeleton-line skeleton-spec"></div>
                <div className="skeleton-line skeleton-spec"></div>
                <div className="skeleton-line skeleton-spec"></div>
                <div className="d-flex justify-content-between mt-3">
                  <div className="skeleton-line skeleton-price"></div>
                  <div className="skeleton-line skeleton-rating"></div>
                </div>
                <div className="skeleton-line skeleton-button mt-3"></div>
                <div className="skeleton-line skeleton-button mt-2"></div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <div className="homepage-main bg-light">
      <CategoryBar />
      <MainCarousel bannerProducts={bannerProducts} loading={loadingBanners} />

      <Container fluid className="mt-4 px-4">
        
        {/* ===== SMARTPHONES - Improved Glass Cards ===== */}
        <section className="mb-5 smartphone-section">
          <div className="section-header text-center mb-4">
            <h2 className="section-title">Premium Smartphones</h2>
            <p className="section-subtitle">Latest technology in your hands</p>
          </div>

          {isLoading.smartphones ? (
            <ProductCardSkeleton count={4} />
          ) : (
            <Row className="g-3">
              {smartphones.slice(0, 4).map((phone, index) => (
                <Col key={phone._id} xs={12} md={6} lg={3}>
                  <Card className="smartphone-tech-card-hover">
                    
                    {/* 🔹 Badge */}
                    <div className="position-absolute top-0 start-0 m-2 px-2 py-1 bg-primary text-white rounded-pill small fw-semibold">
                      {index === 0 ? '🔥 HOT' : '🆕 NEW'}
                    </div>

                    {/* 🔹 Image Section */}
                    <Card.Img 
                      variant="top" 
                      src={phone.images?.[0]?.url || defaultImage} 
                      className="smartphone-image"
                    />
                    
                    <Card.Body>
                      {/* 🔹 Phone Name */}
                      <Card.Title className="smartphone-name">{phone.name}</Card.Title>
                      
                      {/* 🔹 Specifications */} 
                      <div className="smartphone-specs">
                         <div className="spec-item">
                          <strong>🧠 RAM:</strong> {phone.specifications[2].value || '8GB'}
                        </div>
                        <div className="spec-item">
                          <strong>💾 Storage:</strong> {phone.specifications[3].value || '128GB'}
                        </div>
                        <div className="spec-item">
                          <strong>📸 Camera:</strong> {phone.specifications[5].value || '48MP + 12MP'}
                        </div>
                      </div>

                      {/* 🔹 Rating & Price Section */}
                      <div className="smartphone-price-section">
                        <div className="smartphone-price">₹{phone.price?.toLocaleString()}</div>
                        <div className="star-rating">
                          {[...Array(5)].map((_, starIndex) => (
                            <span 
                              key={starIndex} 
                              className={starIndex < Math.floor(phone.avgRating || 4) ? "text-warning" : "text-muted"}
                            >
                              ★
                            </span>
                          ))}
                          <small className="text-muted ms-1">({phone.avgRating || 4}.0)</small>
                        </div>
                      </div>

                      {/* 🔹 Action Buttons */}
                      <div className="smartphone-buttons">
                        <Button variant="outline-primary" size="sm" className="w-100 mb-2" onClick={() => handleAddToCart(phone)}>
                          <i className="bi bi-cart-plus me-2"></i>
                          Add to Cart
                        </Button>
                        <Button style={{ backgroundColor: '#6f42c1', borderColor: '#6f42c1' }} size="sm" className="w-100" onClick={() => handleBuyNow(phone._id)}>
                          <i className="bi bi-lightning-fill me-2"></i>
                          Buy Now
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </section>

        {/* ===== LAPTOPS - Tech Spec Cards ===== */}
        <section className="mb-5 laptop-section">
          <div className="section-header text-center mb-4">
            <h2 className="section-title">Powerful Laptops</h2>
            <p className="section-subtitle">For work, gaming, and creativity</p>
          </div>
          
          {isLoading.laptops ? (
            <ProductCardSkeleton count={4} />
          ) : (
            <Row className="g-3">
              {laptops.slice(0, 4).map((laptop, index) => (
                <Col key={laptop._id} xs={12} md={6} lg={3}>
                  <Card className="laptop-tech-card-hover">
                    
                    {/* 🔹 Badge */}
                    <div className="position-absolute top-0 start-0 m-2 px-2 py-1 bg-primary text-white rounded-pill small fw-semibold">
                      {index === 0 ? '🔥 HOT' : '🆕 NEW'}
                    </div>

                    <Card.Img 
                      variant="top" 
                      src={laptop.images?.[0]?.url || defaultImage} 
                      className="laptop-image"
                    />
                    <Card.Body>
                      <Card.Title className="laptop-name">{laptop.name}</Card.Title>
                      <div className="laptop-specs">
                        <div className="spec-item">
                          <strong>💻 CPU:</strong> {laptop.specifications[1].value  || 'Intel i5'}
                        </div>
                        <div className="spec-item">
                          <strong>🧠 RAM:</strong> {laptop.specifications[2].value || '8GB'}
                        </div>
                        <div className="spec-item">
                          <strong>💾 SSD:</strong> {laptop.specifications[3].value || '512GB'}
                        </div>
                      </div>
                      <div className="laptop-price-section">
                        <div className="laptop-price">₹{laptop.price?.toLocaleString()}</div>
                        <div className="star-rating">
                          {[...Array(5)].map((_, starIndex) => (
                            <span 
                              key={starIndex} 
                              className={starIndex < Math.floor(laptop.avgRating || 4) ? "text-warning" : "text-muted"}
                            >
                              ★
                            </span>
                          ))}
                          <small className="text-muted ms-1">({laptop.avgRating || 4}.0)</small>
                        </div>
                      </div>
                      <div className="laptop-buttons">
                        <Button variant="outline-primary" size="sm" className="w-100 mb-2" onClick={() => handleAddToCart(laptop)}>
                          <i className="bi bi-cart-plus me-2"></i>
                          Add to Cart
                        </Button>
                        <Button style={{ backgroundColor: '#6f42c1', borderColor: '#6f42c1' }} size="sm" className="w-100" onClick={() => handleBuyNow(laptop._id)}>
                          <i className="bi bi-lightning-fill me-2"></i>
                          Buy Now
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </section>
      
        {/* ===== HEADPHONES - Carousel Section ===== */}
        <section className="mb-5 headphone-section">
          <div className="section-header text-center mb-4">
            <h2 className="section-title">Premium Audio</h2>
            <p className="section-subtitle">Immerse yourself in crystal clear sound</p>
          </div>
          
          {isLoading.headphones ? (
            <div className="headphone-skeleton-carousel">
              <Card className="headphone-feature-card-improved skeleton">
                <Row className="g-0 align-items-center h-100">
                  <Col md={6}>
                    <div className="skeleton-image-large"></div>
                  </Col>
                  <Col md={6}>
                    <Card.Body className="headphone-feature-body-improved">
                      <div className="skeleton-line skeleton-title-large mb-3"></div>
                      <div className="skeleton-line skeleton-spec mb-2"></div>
                      <div className="skeleton-line skeleton-spec mb-2"></div>
                      <div className="skeleton-line skeleton-spec mb-4"></div>
                      <div className="skeleton-line skeleton-price-large mb-4"></div>
                      <div className="d-flex gap-3">
                        <div className="skeleton-line skeleton-button-large"></div>
                        <div className="skeleton-line skeleton-button-large"></div>
                      </div>
                    </Card.Body>
                  </Col>
                </Row>
              </Card>
            </div>
          ) : (
            <Carousel indicators={false} className="headphone-feature-carousel-improved">
              {headphones.slice(0, 6).map((headphone, index) => (
                <Carousel.Item key={headphone._id}>
                  <Card className="headphone-feature-card-improved">
                    
                    {/* 🔹 Badge */}
                    <div className="position-absolute top-0 start-0 m-3 px-3 py-1 bg-primary text-white rounded-pill small fw-semibold">
                      {index === 0 ? '🔥 HOT' : index === 1 ? '🆕 NEW' : '💎 PREMIUM'}
                    </div>

                    <Row className="g-0 align-items-center h-100">
                      <Col md={6}>
                        <div className="headphone-image-container-improved">
                          <Card.Img 
                            src={headphone.images?.[0]?.url || defaultImage} 
                            className="headphone-feature-image-centered"
                          />
                        </div>
                      </Col>
                      <Col md={6}>
                        <Card.Body className="headphone-feature-body-improved">
                          <Card.Title className="headphone-feature-name-improved">{headphone.name}</Card.Title>
                          
                          {/* 🔹 Specifications */}
                          <div className="headphone-specs-improved">
                            <div className="spec-item">
                              <strong>Brand:</strong> {headphone.specifications[0].value || 'Sony'}
                            </div>
                            <div className="spec-item">
                              <strong>Battery:</strong> {headphone.specifications[4].value  || '30hrs'}
                            </div>
                            <div className="spec-item">
                              <strong>Bluetooth Version:</strong> {headphone.specifications[2].value || 'Bluetooth 5.2'}
                            </div>
                          </div>

                          {/* 🔹 Rating & Price */}
                          <div className="headphone-rating-price-improved">
                            <div className="star-rating-large">
                              {[...Array(5)].map((_, starIndex) => (
                                <span 
                                  key={starIndex} 
                                  className={starIndex < Math.floor(headphone.avgRating || 3) ? "text-warning" : "text-muted"}
                                  style={{ fontSize: '1.3rem' }}
                                >
                                  ★
                                </span>
                              ))}
                              <strong className="rating-value ms-2">
                                ({headphone.avgRating || 3}.0)
                              </strong>
                            </div>
                            <div className="headphone-feature-price-improved">
                              ₹{headphone.price?.toLocaleString() || '32,000'}
                            </div>
                          </div>

                          {/* 🔹 Action Buttons */}
                          <div className="headphone-feature-buttons-improved">
                            <Button variant="outline-primary" size="lg" className="me-3 px-4" onClick={() => handleAddToCart(headphone)}>
                              <i className="bi bi-cart-plus me-2"></i>
                              Add to Cart
                            </Button>
                            <Button style={{ backgroundColor: '#6f42c1', borderColor: '#6f42c1' }} size="lg" className="px-4" onClick={() => handleBuyNow(headphone._id)}>
                              <i className="bi bi-lightning-fill me-2"></i>
                              Buy Now
                            </Button>
                          </div>
                        </Card.Body>
                      </Col>
                    </Row>
                  </Card>
                </Carousel.Item>
              ))}
            </Carousel>
          )}
        </section>

        {/* ===== WATCHES - Consistent Size Luxury Cards ===== */}
        <section className="mb-5 watch-section">
          <div className="section-header text-center mb-4">
            <h2 className="section-title">Elegant Watches</h2>
            <p className="section-subtitle">Timeless pieces for every occasion</p>
          </div>
          
          {isLoading.watches ? (
            <ProductCardSkeleton count={4} />
          ) : (
            <Row className="g-3">
              {watches.slice(0, 4).map((watch) => (
                <Col key={watch._id} xs={6} md={4} lg={3}>
                  <Card className="watch-luxury-card-consistent text-center h-100">
                    <div className="watch-circle-bg-consistent">
                      <Card.Img 
                        variant="top" 
                        src={watch.images?.[0]?.url || defaultImage} 
                        className="watch-image-consistent"
                      />
                    </div>
                    <Card.Body className="d-flex flex-column">
                      <div className="watch-brand-consistent">{watch.brand || 'Premium'}</div>
                      <Card.Title className="watch-model-consistent">{watch.name}</Card.Title>
                      
                      {/* This div now has a min-height from your CSS */}
                      <div className="watch-details-consistent">
                        {/* We use slice to safely render specifications */}
                        {watch.specifications?.slice(2, 4).map(spec => (
                          <span key={spec.key}>{spec.value}</span>
                        ))}
                      </div>

                      <div className="smartphone-price-section">
                        <div className="shoe-price-consistent">₹{watch.price?.toLocaleString()}</div>
                        <div className="star-rating">
                          {[...Array(5)].map((_, starIndex) => (
                            <span 
                              key={starIndex} 
                              className={starIndex < Math.floor(watch.avgRating || 4) ? "text-warning" : "text-muted"}
                            >
                              ★
                            </span>
                          ))}
                          <small className="text-muted ms-1">({watch.avgRating || 4}.0)</small>
                        </div>
                      </div>
                      
                      <div className="watch-buttons-consistent mt-auto">
                        <Button variant="outline-secondary" size="sm" className="w-100 mb-2" onClick={() => handleAddToCart(watch)}>
                          Add to Cart
                        </Button>
                        <Button style={{ backgroundColor: '#6f42c1', borderColor: '#6f42c1' }} size="sm" className="w-100" onClick={() => handleBuyNow(watch._id)}>
                          Buy Now
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </section>

        {/* ===== FASHION SECTION ===== */}
        <section className="mb-5 fashion-section-v2">
          <div className="section-header text-center mb-5">
            <h2 className="section-title" style={{ fontFamily: 'serif', fontWeight: 'normal' }}>The Style Edit</h2>
            <p className="section-subtitle">Curated looks for the modern wardrobe</p>
          </div>
          
          {isLoading.clothing ? (
            <Row className="g-3 row-cols-2 row-cols-md-3 row-cols-lg-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Col key={index}>
                  <div className="fashion-card-editorial skeleton">
                    <div className="skeleton-image"></div>
                    <div className="fashion-content-overlay">
                      <div className="skeleton-line skeleton-title mb-2"></div>
                      <div className="skeleton-line skeleton-spec mb-3"></div>
                      <div className="skeleton-line skeleton-price mb-3"></div>
                      <div className="d-grid gap-2">
                        <div className="skeleton-line skeleton-button"></div>
                        <div className="skeleton-line skeleton-button"></div>
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          ) : (
            <Row className="g-3 row-cols-2 row-cols-md-3 row-cols-lg-5"> 
              {mensClothing.slice(0, 5).map((product) => (
                <Col key={product._id}> 
                  <div className="fashion-card-editorial">
                    <img 
                      src={product.images?.[0]?.url || defaultImage} 
                      alt={product.name}
                      className="fashion-image-editorial"
                    />
                    <div className="fashion-brand-vertical">
                      {product.brand || 'PREMIUM'}
                    </div>
                    <div className="fashion-content-overlay">
                      <h4 className="fashion-name-editorial">{product.name}</h4>
                      <p className="fashion-spec-editorial">
                        {product.specifications?.slice(0, 2).map(spec => spec.value).join(' / ')}
                      </p>
                      <div className="fashion-rating mb-2">
                        {[...Array(5)].map((_, starIndex) => (
                          <span 
                            key={starIndex} 
                            className={starIndex < Math.floor(product.avgRating || 0) ? "text-warning" : "text-light"}
                          >★</span>
                        ))}
                        {product.avgRating > 0 && (
                          <small className="ms-2 opacity-75">({product.avgRating.toFixed(1)})</small>
                        )}
                      </div>
                      <div className="fashion-price-area mt-3">
                        <p className="fashion-price-editorial">₹{product.price?.toLocaleString()}</p>
                      </div>
                      
                      <div className="fashion-buttons-area d-grid gap-2">
                        <Button variant="outline-light" size="sm" onClick={() => handleAddToCart(product)}>Add to Cart</Button>
                        <Button variant="light" size="sm" onClick={() => handleBuyNow(product._id)}>Buy Now</Button>
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </section>

        {/* ===== TABLETS - Side by Side Layout ===== */}
        <section className="mb-5 tablet-section">
          <div className="section-header text-center mb-4">
            <h2 className="section-title">Smart Tablets</h2>
            <p className="section-subtitle">Perfect for entertainment and productivity</p>
          </div>
          
          {isLoading.tablets ? (
            <Row className="g-4">
              {Array.from({ length: 2 }).map((_, index) => (
                <Col key={index} xs={12} md={6}>
                  <Card className="tablet-combo-card h-100 skeleton">
                    <Row className="g-0 align-items-center h-100">
                      <Col md={5}>
                        <div className="skeleton-image"></div>
                      </Col>
                      <Col md={7}>
                        <Card.Body className="d-flex flex-column h-100 p-4">
                          <div>
                            <div className="skeleton-line skeleton-title mb-3"></div>
                            <div className="d-flex flex-wrap gap-2 mb-3">
                              <div className="skeleton-badge"></div>
                              <div className="skeleton-badge"></div>
                              <div className="skeleton-badge"></div>
                            </div>
                          </div>
                          <div className="mt-auto">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <div className="skeleton-line skeleton-rating"></div>
                              <div className="skeleton-line skeleton-price"></div>
                            </div>
                            <div className="tablet-buttons d-flex">
                              <div className="skeleton-line skeleton-button me-2"></div>
                              <div className="skeleton-line skeleton-button"></div>
                            </div>
                          </div>
                        </Card.Body>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Row className="g-4">
              {tablets.slice(2, 6).map((tablet) => (
                <Col key={tablet._id} xs={12} md={6}>
                  <Card className="tablet-combo-card h-100">
                    <Row className="g-0 align-items-center h-100">
                      <Col md={5}>
                        <Card.Img 
                          src={tablet.images?.[0]?.url || defaultImage} 
                          className="tablet-side-image"
                        />
                      </Col>
                      <Col md={7}>
                        <Card.Body className="d-flex flex-column h-100 p-4">
                          <div>
                            <Card.Title className="tablet-name">{tablet.name}</Card.Title>
                            <div className="tablet-specs d-flex flex-wrap gap-2 mb-3">
                              {tablet.specifications?.[0] && <Badge bg="light" text="dark">💻 {tablet.specifications[0].value}</Badge>}
                              {tablet.specifications?.[1] && <Badge bg="light" text="dark">📺 {tablet.specifications[1].value}</Badge>}
                              {tablet.specifications?.[2] && <Badge bg="light" text="dark">💾 {tablet.specifications[2].value}</Badge>}
                            </div>
                          </div>
                          <div className="mt-auto">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <StarRating rating={tablet.avgRating} />
                              <div className="tablet-price">₹{tablet.price?.toLocaleString()}</div>
                            </div>
                            <div className="tablet-buttons d-flex">
                              <Button variant="outline-primary" className="w-100 me-2" onClick={() => handleAddToCart(tablet)}>
                                Add to Cart
                              </Button>
                              <Button style={{ backgroundColor: '#6f42c1', borderColor: '#6f42c1' }} className="w-100" onClick={() => handleBuyNow(tablet._id)}>
                                Buy Now
                              </Button>
                            </div>
                          </div>
                        </Card.Body>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </section>

        {/* ===== KITCHEN APPLIANCES - With Images ===== */}
        <section className="mb-5 kitchen-section">
          <div className="section-header text-center mb-4">
            <h2 className="section-title">Washing Machine</h2>
            <p className="section-subtitle">Modern appliances for modern homes</p>
          </div>
          
          {isLoading.washing_machine ? (
            <ProductCardSkeleton count={4} />
          ) : (
            <Row className="g-4">
              {washing_machine.slice(0, 4).map((product) => (
                <Col key={product._id} xs={12} sm={6} lg={3}>
                  <Card className="h-100 text-center">
                    <Card.Img 
                      variant="top"
                      src={product.images?.[0]?.url || defaultImage}
                      style={{ height: '200px', objectFit: 'contain', padding: '1rem' }}
                    />
                    <Card.Body className="d-flex flex-column">
                      <div>
                        <Card.Title as="h6" className="fw-bold">{product.name}</Card.Title>
                        <div className="kitchen-product-specs px-2">
                          {product.specifications && product.specifications.length > 0
                            ? product.specifications.slice(0, 2).map(spec => spec.value).join(' • ')
                            : 'High-quality kitchen appliance'
                          }
                        </div>
                      </div>
                      
                      <div className="smartphone-price-section">
                        <div className="smartphone-price">₹{product.price?.toLocaleString()}</div>
                        <div className="star-rating">
                          {[...Array(5)].map((_, starIndex) => (
                            <span 
                              key={starIndex} 
                              className={starIndex < Math.floor(product.avgRating || 4) ? "text-warning" : "text-muted"}
                            >
                              ★
                            </span>
                          ))}
                          <small className="text-muted ms-1">({product.avgRating || 4}.0)</small>
                        </div>
                      </div>

                      <div className="d-grid gap-2">
                        <Button variant="outline-success" onClick={() => handleAddToCart(product)}>
                          Add to Cart
                        </Button>
                        <Button style={{ backgroundColor: '#6f42c1', borderColor: '#6f42c1' }} onClick={() => handleBuyNow(product._id)}>
                          Buy Now
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </section>

        {/* ===== FOOTWEAR - Consistent Size Brand Cards ===== */}
        <section className="mb-5 footwear-section">
          <div className="section-header text-center mb-4">
            <h2 className="section-title">Gym Essentials</h2>
            <p className="section-subtitle">Step out in comfort and style</p>
          </div>
          
          {isLoading.gym_essentials ? (
            <ProductCardSkeleton count={4} />
          ) : (
            <Row className="g-3">
              {gym_essentials.slice(0, 4).map((gym) => (
                <Col key={gym._id} xs={6} md={3}>
                  <Card className="footwear-brand-card-consistent">
                    <Card.Img 
                      variant="top" 
                      src={gym.images?.[0]?.url || defaultImage} 
                      className="footwear-image-consistent"
                    />
                    <Card.Body>
                      <div className="shoe-brand-consistent">{gym.brand || 'Premium'}</div>
                      <Card.Title className="shoe-model-consistent">{gym.name}</Card.Title>
                      <div className="shoe-type-consistent">
                        <Badge bg="light" text="dark">{gym.specifications[2].value || 'Casual'}</Badge>
                        <Badge bg="light" text="dark">{gym.specifications[3].value || 'Leather'}</Badge>
                      </div>
                      
                      <div className="smartphone-price-section">
                        <div className="shoe-price-consistent">₹{gym.price?.toLocaleString()}</div>
                        <div className="star-rating">
                          {[...Array(5)].map((_, starIndex) => (
                            <span 
                              key={starIndex} 
                              className={starIndex < Math.floor(gym.avgRating || 4) ? "text-warning" : "text-muted"}
                            >
                              ★
                            </span>
                          ))}
                          <small className="text-muted ms-1">({gym.avgRating || 4}.0)</small>
                        </div>
                      </div>

                      <div className="smartphone-buttons">
                        <Button variant="outline-primary" size="sm" className="w-100 mb-2" onClick={() => handleAddToCart(gym)}>
                          <i className="bi bi-cart-plus me-2"></i>
                          Add to Cart
                        </Button>
                        <Button style={{ backgroundColor: '#6f42c1', borderColor: '#6f42c1' }} size="sm" className="w-100" onClick={() => handleBuyNow(gym._id)}>
                          <i className="bi bi-lightning-fill me-2"></i>
                          Buy Now
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </section>

      </Container>
    </div>
  );
}

export default HomePage;