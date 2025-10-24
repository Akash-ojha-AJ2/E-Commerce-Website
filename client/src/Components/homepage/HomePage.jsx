// import React, { useEffect, useState, useContext } from "react";
// import axios from "axios";
// import { Context } from "../../store/Context";
// import { Container, Row, Col, Card, Button, Carousel, Badge } from "react-bootstrap";
// import { useNavigate } from "react-router-dom";
// import { toast } from 'react-toastify';

// import CategoryBar from "./CategoryBar";
// import MainCarousel from "./MainCarousel";

// import "./HomePage.css";

// function HomePage() {
//   const [smartphones, setSmartphones] = useState([]);
//   const [laptops, setLaptops] = useState([]);
//   const [mensClothing, setMensClothing] = useState([]);
//   const [watches, setWatches] = useState([]);
//   const [tablets, setTablets] = useState([]);
//   const [headphones, setHeadphones] = useState([]);
//   const [washing_machine, setWashing_machine] = useState([]);
//   const [gym_essentials, setGym_essentials] = useState([]);
//   const { isLoggedIn,backend } = useContext(Context);
//   const navigate = useNavigate();
//   const { refreshCartCount, isAuthenticated } = useContext(Context);
//   const [bannerProducts, setBannerProducts] = useState([]);
//   const [loadingBanners, setLoadingBanners] = useState(true);
//   const [loadingProducts, setLoadingProducts] = useState(true);

//   // Loading state management
//   const [isLoading, setIsLoading] = useState({
//     smartphones: true,
//     laptops: true,
//     headphones: true,
//     watches: true,
//     clothing: true,
//     tablets: true,
//     washing_machine: true,
//     gym_essentials: true
//   });

//   let localCartIds = [];
//   if (!isLoggedIn) {
//     try {
//       const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
//       localCartIds = cartItems.map(item => item._id);
//     } catch (error) {
//       console.error("Error parsing cart items from localStorage:", error);
//       localCartIds = [];
//     }
//   }

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
//   }

//   useEffect(() => {
//     const fetchBanners = async () => {
//       try {
//         setLoadingBanners(true);
//         const res = await axios.get(`${backend}/api/v1/userproduct/product/bannner`);
        
//         if (res.data.success) {
//           setBannerProducts(res.data.products);
//         } else {
//           toast.error("Failed to load banners");
//           setBannerProducts([]);
//         }
//       } catch (err) {
//         console.error("Failed to fetch products with banners", err);
//         toast.error("Could not load featured products");
//         setBannerProducts([]);
//       } finally {
//         setLoadingBanners(false);
//       }
//     };

//     fetchBanners();
//   }, []);

//   useEffect(() => {
//     const fetchHomeProducts = async () => {
//       try {
//         setLoadingProducts(true);
//         const res = await axios.get(`${backend}/api/v1/userproduct/products`);
        
//         // Update products
//         setSmartphones(res.data.smartphone || []);
//         setLaptops(res.data.laptop || []);
//         setMensClothing(res.data.kurta || []);
//         setWatches(res.data.smartwatch || []);
//         setTablets(res.data.tablet || []);
//         setHeadphones(res.data.earbuds || []);
//         setWashing_machine(res.data.washing_machine || []);
//         setGym_essentials(res.data.gym_essentials || []);

//         // Update loading states
//         setIsLoading({
//           smartphones: false,
//           laptops: false,
//           headphones: false,
//           watches: false,
//           clothing: false,
//           tablets: false,
//           washing_machine: false,
//           gym_essentials: false
//         });
//       } catch (err) {
//         console.error("Failed to fetch home products", err);
//         setIsLoading({
//           smartphones: false,
//           laptops: false,
//           headphones: false,
//           watches: false,
//           clothing: false,
//           tablets: false,
//           washing_machine: false,
//           gym_essentials: false
//         });
//       } finally {
//         setLoadingProducts(false);
//       }
//     };
//     fetchHomeProducts();
//   }, []);

//   const defaultImage = "https://placehold.co/300x300/007bff/ffffff?text=Product+Image";

//   const StarRating = ({ rating }) => {
//     return (
//       <div className="star-rating">
//         {[...Array(5)].map((_, index) => (
//           <span key={index} className={index < Math.floor(rating || 4) ? "text-warning" : "text-muted"}>
//             ★
//           </span>
//         ))}
//         <small className="text-muted ms-1">({rating || 4}.0)</small>
//       </div>
//     );
//   };

//   // Loading Skeleton Component
//   const ProductCardSkeleton = ({ count = 4 }) => {
//     return (
//       <Row className="g-3">
//         {Array.from({ length: count }).map((_, index) => (
//           <Col key={index} xs={12} md={6} lg={3}>
//             <Card className="product-card-skeleton">
//               <div className="skeleton-image"></div>
//               <Card.Body>
//                 <div className="skeleton-line skeleton-title"></div>
//                 <div className="skeleton-line skeleton-spec"></div>
//                 <div className="skeleton-line skeleton-spec"></div>
//                 <div className="skeleton-line skeleton-spec"></div>
//                 <div className="d-flex justify-content-between mt-3">
//                   <div className="skeleton-line skeleton-price"></div>
//                   <div className="skeleton-line skeleton-rating"></div>
//                 </div>
//                 <div className="skeleton-line skeleton-button mt-3"></div>
//                 <div className="skeleton-line skeleton-button mt-2"></div>
//               </Card.Body>
//             </Card>
//           </Col>
//         ))}
//       </Row>
//     );
//   };

//   return (
//     <div className="homepage-main bg-light">
//       <CategoryBar />
//       <MainCarousel bannerProducts={bannerProducts} loading={loadingBanners} />

//       <Container fluid className="mt-4 px-4">
        
//         {/* ===== SMARTPHONES - Improved Glass Cards ===== */}
//         <section className="mb-5 smartphone-section">
//           <div className="section-header text-center mb-4">
//             <h2 className="section-title">Premium Smartphones</h2>
//             <p className="section-subtitle">Latest technology in your hands</p>
//           </div>

//           {isLoading.smartphones ? (
//             <ProductCardSkeleton count={4} />
//           ) : (
//             <Row className="g-3">
//               {smartphones.slice(0, 4).map((phone, index) => (
//                 <Col key={phone._id} xs={12} md={6} lg={3}>
//                   <Card className="smartphone-tech-card-hover">
                    
//                     {/* 🔹 Badge */}
//                     <div className="position-absolute top-0 start-0 m-2 px-2 py-1 bg-primary text-white rounded-pill small fw-semibold">
//                       {index === 0 ? '🔥 HOT' : '🆕 NEW'}
//                     </div>

//                     {/* 🔹 Image Section */}
//                     <Card.Img 
//                       variant="top" 
//                       src={phone.images?.[0]?.url || defaultImage} 
//                       className="smartphone-image"
//                     />
                    
//                     <Card.Body>
//                       {/* 🔹 Phone Name */}
//                       <Card.Title className="smartphone-name">{phone.name}</Card.Title>
                      
//                       {/* 🔹 Specifications */} 
//                       <div className="smartphone-specs">
//                          <div className="spec-item">
//                           <strong>🧠 RAM:</strong> {phone.specifications[2].value || '8GB'}
//                         </div>
//                         <div className="spec-item">
//                           <strong>💾 Storage:</strong> {phone.specifications[3].value || '128GB'}
//                         </div>
//                         <div className="spec-item">
//                           <strong>📸 Camera:</strong> {phone.specifications[5].value || '48MP + 12MP'}
//                         </div>
//                       </div>

//                       {/* 🔹 Rating & Price Section */}
//                       <div className="smartphone-price-section">
//                         <div className="smartphone-price">₹{phone.price?.toLocaleString()}</div>
//                         <div className="star-rating">
//                           {[...Array(5)].map((_, starIndex) => (
//                             <span 
//                               key={starIndex} 
//                               className={starIndex < Math.floor(phone.avgRating || 4) ? "text-warning" : "text-muted"}
//                             >
//                               ★
//                             </span>
//                           ))}
//                           <small className="text-muted ms-1">({phone.avgRating || 4}.0)</small>
//                         </div>
//                       </div>

//                       {/* 🔹 Action Buttons */}
//                       <div className="smartphone-buttons">
//                         <Button variant="outline-primary" size="sm" className="w-100 mb-2" onClick={() => handleAddToCart(phone)}>
//                           <i className="bi bi-cart-plus me-2"></i>
//                           Add to Cart
//                         </Button>
//                         <Button style={{ backgroundColor: '#6f42c1', borderColor: '#6f42c1' }} size="sm" className="w-100" onClick={() => handleBuyNow(phone._id)}>
//                           <i className="bi bi-lightning-fill me-2"></i>
//                           Buy Now
//                         </Button>
//                       </div>
//                     </Card.Body>
//                   </Card>
//                 </Col>
//               ))}
//             </Row>
//           )}
//         </section>

//         {/* ===== LAPTOPS - Tech Spec Cards ===== */}
//         <section className="mb-5 laptop-section">
//           <div className="section-header text-center mb-4">
//             <h2 className="section-title">Powerful Laptops</h2>
//             <p className="section-subtitle">For work, gaming, and creativity</p>
//           </div>
          
//           {isLoading.laptops ? (
//             <ProductCardSkeleton count={4} />
//           ) : (
//             <Row className="g-3">
//               {laptops.slice(0, 4).map((laptop, index) => (
//                 <Col key={laptop._id} xs={12} md={6} lg={3}>
//                   <Card className="laptop-tech-card-hover">
                    
//                     {/* 🔹 Badge */}
//                     <div className="position-absolute top-0 start-0 m-2 px-2 py-1 bg-primary text-white rounded-pill small fw-semibold">
//                       {index === 0 ? '🔥 HOT' : '🆕 NEW'}
//                     </div>

//                     <Card.Img 
//                       variant="top" 
//                       src={laptop.images?.[0]?.url || defaultImage} 
//                       className="laptop-image"
//                     />
//                     <Card.Body>
//                       <Card.Title className="laptop-name">{laptop.name}</Card.Title>
//                       <div className="laptop-specs">
//                         <div className="spec-item">
//                           <strong>💻 CPU:</strong> {laptop.specifications[1].value  || 'Intel i5'}
//                         </div>
//                         <div className="spec-item">
//                           <strong>🧠 RAM:</strong> {laptop.specifications[2].value || '8GB'}
//                         </div>
//                         <div className="spec-item">
//                           <strong>💾 SSD:</strong> {laptop.specifications[3].value || '512GB'}
//                         </div>
//                       </div>
//                       <div className="laptop-price-section">
//                         <div className="laptop-price">₹{laptop.price?.toLocaleString()}</div>
//                         <div className="star-rating">
//                           {[...Array(5)].map((_, starIndex) => (
//                             <span 
//                               key={starIndex} 
//                               className={starIndex < Math.floor(laptop.avgRating || 4) ? "text-warning" : "text-muted"}
//                             >
//                               ★
//                             </span>
//                           ))}
//                           <small className="text-muted ms-1">({laptop.avgRating || 4}.0)</small>
//                         </div>
//                       </div>
//                       <div className="laptop-buttons">
//                         <Button variant="outline-primary" size="sm" className="w-100 mb-2" onClick={() => handleAddToCart(laptop)}>
//                           <i className="bi bi-cart-plus me-2"></i>
//                           Add to Cart
//                         </Button>
//                         <Button style={{ backgroundColor: '#6f42c1', borderColor: '#6f42c1' }} size="sm" className="w-100" onClick={() => handleBuyNow(laptop._id)}>
//                           <i className="bi bi-lightning-fill me-2"></i>
//                           Buy Now
//                         </Button>
//                       </div>
//                     </Card.Body>
//                   </Card>
//                 </Col>
//               ))}
//             </Row>
//           )}
//         </section>
      
//         {/* ===== HEADPHONES - Carousel Section ===== */}
//         <section className="mb-5 headphone-section">
//           <div className="section-header text-center mb-4">
//             <h2 className="section-title">Premium Audio</h2>
//             <p className="section-subtitle">Immerse yourself in crystal clear sound</p>
//           </div>
          
//           {isLoading.headphones ? (
//             <div className="headphone-skeleton-carousel">
//               <Card className="headphone-feature-card-improved skeleton">
//                 <Row className="g-0 align-items-center h-100">
//                   <Col md={6}>
//                     <div className="skeleton-image-large"></div>
//                   </Col>
//                   <Col md={6}>
//                     <Card.Body className="headphone-feature-body-improved">
//                       <div className="skeleton-line skeleton-title-large mb-3"></div>
//                       <div className="skeleton-line skeleton-spec mb-2"></div>
//                       <div className="skeleton-line skeleton-spec mb-2"></div>
//                       <div className="skeleton-line skeleton-spec mb-4"></div>
//                       <div className="skeleton-line skeleton-price-large mb-4"></div>
//                       <div className="d-flex gap-3">
//                         <div className="skeleton-line skeleton-button-large"></div>
//                         <div className="skeleton-line skeleton-button-large"></div>
//                       </div>
//                     </Card.Body>
//                   </Col>
//                 </Row>
//               </Card>
//             </div>
//           ) : (
//             <Carousel indicators={false} className="headphone-feature-carousel-improved">
//               {headphones.slice(0, 6).map((headphone, index) => (
//                 <Carousel.Item key={headphone._id}>
//                   <Card className="headphone-feature-card-improved">
                    
//                     {/* 🔹 Badge */}
//                     <div className="position-absolute top-0 start-0 m-3 px-3 py-1 bg-primary text-white rounded-pill small fw-semibold">
//                       {index === 0 ? '🔥 HOT' : index === 1 ? '🆕 NEW' : '💎 PREMIUM'}
//                     </div>

//                     <Row className="g-0 align-items-center h-100">
//                       <Col md={6}>
//                         <div className="headphone-image-container-improved">
//                           <Card.Img 
//                             src={headphone.images?.[0]?.url || defaultImage} 
//                             className="headphone-feature-image-centered"
//                           />
//                         </div>
//                       </Col>
//                       <Col md={6}>
//                         <Card.Body className="headphone-feature-body-improved">
//                           <Card.Title className="headphone-feature-name-improved">{headphone.name}</Card.Title>
                          
//                           {/* 🔹 Specifications */}
//                           <div className="headphone-specs-improved">
//                             <div className="spec-item">
//                               <strong>Brand:</strong> {headphone.specifications[0].value || 'Sony'}
//                             </div>
//                             <div className="spec-item">
//                               <strong>Battery:</strong> {headphone.specifications[4].value  || '30hrs'}
//                             </div>
//                             <div className="spec-item">
//                               <strong>Bluetooth Version:</strong> {headphone.specifications[2].value || 'Bluetooth 5.2'}
//                             </div>
//                           </div>

//                           {/* 🔹 Rating & Price */}
//                           <div className="headphone-rating-price-improved">
//                             <div className="star-rating-large">
//                               {[...Array(5)].map((_, starIndex) => (
//                                 <span 
//                                   key={starIndex} 
//                                   className={starIndex < Math.floor(headphone.avgRating || 3) ? "text-warning" : "text-muted"}
//                                   style={{ fontSize: '1.3rem' }}
//                                 >
//                                   ★
//                                 </span>
//                               ))}
//                               <strong className="rating-value ms-2">
//                                 ({headphone.avgRating || 3}.0)
//                               </strong>
//                             </div>
//                             <div className="headphone-feature-price-improved">
//                               ₹{headphone.price?.toLocaleString() || '32,000'}
//                             </div>
//                           </div>

//                           {/* 🔹 Action Buttons */}
//                           <div className="headphone-feature-buttons-improved">
//                             <Button variant="outline-primary" size="lg" className="me-3 px-4" onClick={() => handleAddToCart(headphone)}>
//                               <i className="bi bi-cart-plus me-2"></i>
//                               Add to Cart
//                             </Button>
//                             <Button style={{ backgroundColor: '#6f42c1', borderColor: '#6f42c1' }} size="lg" className="px-4" onClick={() => handleBuyNow(headphone._id)}>
//                               <i className="bi bi-lightning-fill me-2"></i>
//                               Buy Now
//                             </Button>
//                           </div>
//                         </Card.Body>
//                       </Col>
//                     </Row>
//                   </Card>
//                 </Carousel.Item>
//               ))}
//             </Carousel>
//           )}
//         </section>

//         {/* ===== WATCHES - Consistent Size Luxury Cards ===== */}
//         <section className="mb-5 watch-section">
//           <div className="section-header text-center mb-4">
//             <h2 className="section-title">Elegant Watches</h2>
//             <p className="section-subtitle">Timeless pieces for every occasion</p>
//           </div>
          
//           {isLoading.watches ? (
//             <ProductCardSkeleton count={4} />
//           ) : (
//             <Row className="g-3">
//               {watches.slice(0, 4).map((watch) => (
//                 <Col key={watch._id} xs={6} md={4} lg={3}>
//                   <Card className="watch-luxury-card-consistent text-center h-100">
//                     <div className="watch-circle-bg-consistent">
//                       <Card.Img 
//                         variant="top" 
//                         src={watch.images?.[0]?.url || defaultImage} 
//                         className="watch-image-consistent"
//                       />
//                     </div>
//                     <Card.Body className="d-flex flex-column">
//                       <div className="watch-brand-consistent">{watch.brand || 'Premium'}</div>
//                       <Card.Title className="watch-model-consistent">{watch.name}</Card.Title>
                      
//                       {/* This div now has a min-height from your CSS */}
//                       <div className="watch-details-consistent">
//                         {/* We use slice to safely render specifications */}
//                         {watch.specifications?.slice(2, 4).map(spec => (
//                           <span key={spec.key}>{spec.value}</span>
//                         ))}
//                       </div>

//                       <div className="smartphone-price-section">
//                         <div className="shoe-price-consistent">₹{watch.price?.toLocaleString()}</div>
//                         <div className="star-rating">
//                           {[...Array(5)].map((_, starIndex) => (
//                             <span 
//                               key={starIndex} 
//                               className={starIndex < Math.floor(watch.avgRating || 4) ? "text-warning" : "text-muted"}
//                             >
//                               ★
//                             </span>
//                           ))}
//                           <small className="text-muted ms-1">({watch.avgRating || 4}.0)</small>
//                         </div>
//                       </div>
                      
//                       <div className="watch-buttons-consistent mt-auto">
//                         <Button variant="outline-secondary" size="sm" className="w-100 mb-2" onClick={() => handleAddToCart(watch)}>
//                           Add to Cart
//                         </Button>
//                         <Button style={{ backgroundColor: '#6f42c1', borderColor: '#6f42c1' }} size="sm" className="w-100" onClick={() => handleBuyNow(watch._id)}>
//                           Buy Now
//                         </Button>
//                       </div>
//                     </Card.Body>
//                   </Card>
//                 </Col>
//               ))}
//             </Row>
//           )}
//         </section>

//         {/* ===== FASHION SECTION ===== */}
//         <section className="mb-5 fashion-section-v2">
//           <div className="section-header text-center mb-5">
//             <h2 className="section-title" style={{ fontFamily: 'serif', fontWeight: 'normal' }}>The Style Edit</h2>
//             <p className="section-subtitle">Curated looks for the modern wardrobe</p>
//           </div>
          
//           {isLoading.clothing ? (
//             <Row className="g-3 row-cols-2 row-cols-md-3 row-cols-lg-5">
//               {Array.from({ length: 5 }).map((_, index) => (
//                 <Col key={index}>
//                   <div className="fashion-card-editorial skeleton">
//                     <div className="skeleton-image"></div>
//                     <div className="fashion-content-overlay">
//                       <div className="skeleton-line skeleton-title mb-2"></div>
//                       <div className="skeleton-line skeleton-spec mb-3"></div>
//                       <div className="skeleton-line skeleton-price mb-3"></div>
//                       <div className="d-grid gap-2">
//                         <div className="skeleton-line skeleton-button"></div>
//                         <div className="skeleton-line skeleton-button"></div>
//                       </div>
//                     </div>
//                   </div>
//                 </Col>
//               ))}
//             </Row>
//           ) : (
//             <Row className="g-3 row-cols-2 row-cols-md-3 row-cols-lg-5"> 
//               {mensClothing.slice(0, 5).map((product) => (
//                 <Col key={product._id}> 
//                   <div className="fashion-card-editorial">
//                     <img 
//                       src={product.images?.[0]?.url || defaultImage} 
//                       alt={product.name}
//                       className="fashion-image-editorial"
//                     />
//                     <div className="fashion-brand-vertical">
//                       {product.brand || 'PREMIUM'}
//                     </div>
//                     <div className="fashion-content-overlay">
//                       <h4 className="fashion-name-editorial">{product.name}</h4>
//                       <p className="fashion-spec-editorial">
//                         {product.specifications?.slice(0, 2).map(spec => spec.value).join(' / ')}
//                       </p>
//                       <div className="fashion-rating mb-2">
//                         {[...Array(5)].map((_, starIndex) => (
//                           <span 
//                             key={starIndex} 
//                             className={starIndex < Math.floor(product.avgRating || 0) ? "text-warning" : "text-light"}
//                           >★</span>
//                         ))}
//                         {product.avgRating > 0 && (
//                           <small className="ms-2 opacity-75">({product.avgRating.toFixed(1)})</small>
//                         )}
//                       </div>
//                       <div className="fashion-price-area mt-3">
//                         <p className="fashion-price-editorial">₹{product.price?.toLocaleString()}</p>
//                       </div>
                      
//                       <div className="fashion-buttons-area d-grid gap-2">
//                         <Button variant="outline-light" size="sm" onClick={() => handleAddToCart(product)}>Add to Cart</Button>
//                         <Button variant="light" size="sm" onClick={() => handleBuyNow(product._id)}>Buy Now</Button>
//                       </div>
//                     </div>
//                   </div>
//                 </Col>
//               ))}
//             </Row>
//           )}
//         </section>

//         {/* ===== TABLETS - Side by Side Layout ===== */}
//         <section className="mb-5 tablet-section">
//           <div className="section-header text-center mb-4">
//             <h2 className="section-title">Smart Tablets</h2>
//             <p className="section-subtitle">Perfect for entertainment and productivity</p>
//           </div>
          
//           {isLoading.tablets ? (
//             <Row className="g-4">
//               {Array.from({ length: 2 }).map((_, index) => (
//                 <Col key={index} xs={12} md={6}>
//                   <Card className="tablet-combo-card h-100 skeleton">
//                     <Row className="g-0 align-items-center h-100">
//                       <Col md={5}>
//                         <div className="skeleton-image"></div>
//                       </Col>
//                       <Col md={7}>
//                         <Card.Body className="d-flex flex-column h-100 p-4">
//                           <div>
//                             <div className="skeleton-line skeleton-title mb-3"></div>
//                             <div className="d-flex flex-wrap gap-2 mb-3">
//                               <div className="skeleton-badge"></div>
//                               <div className="skeleton-badge"></div>
//                               <div className="skeleton-badge"></div>
//                             </div>
//                           </div>
//                           <div className="mt-auto">
//                             <div className="d-flex justify-content-between align-items-center mb-3">
//                               <div className="skeleton-line skeleton-rating"></div>
//                               <div className="skeleton-line skeleton-price"></div>
//                             </div>
//                             <div className="tablet-buttons d-flex">
//                               <div className="skeleton-line skeleton-button me-2"></div>
//                               <div className="skeleton-line skeleton-button"></div>
//                             </div>
//                           </div>
//                         </Card.Body>
//                       </Col>
//                     </Row>
//                   </Card>
//                 </Col>
//               ))}
//             </Row>
//           ) : (
//             <Row className="g-4">
//               {tablets.slice(2, 6).map((tablet) => (
//                 <Col key={tablet._id} xs={12} md={6}>
//                   <Card className="tablet-combo-card h-100">
//                     <Row className="g-0 align-items-center h-100">
//                       <Col md={5}>
//                         <Card.Img 
//                           src={tablet.images?.[0]?.url || defaultImage} 
//                           className="tablet-side-image"
//                         />
//                       </Col>
//                       <Col md={7}>
//                         <Card.Body className="d-flex flex-column h-100 p-4">
//                           <div>
//                             <Card.Title className="tablet-name">{tablet.name}</Card.Title>
//                             <div className="tablet-specs d-flex flex-wrap gap-2 mb-3">
//                               {tablet.specifications?.[0] && <Badge bg="light" text="dark">💻 {tablet.specifications[0].value}</Badge>}
//                               {tablet.specifications?.[1] && <Badge bg="light" text="dark">📺 {tablet.specifications[1].value}</Badge>}
//                               {tablet.specifications?.[2] && <Badge bg="light" text="dark">💾 {tablet.specifications[2].value}</Badge>}
//                             </div>
//                           </div>
//                           <div className="mt-auto">
//                             <div className="d-flex justify-content-between align-items-center mb-3">
//                               <StarRating rating={tablet.avgRating} />
//                               <div className="tablet-price">₹{tablet.price?.toLocaleString()}</div>
//                             </div>
//                             <div className="tablet-buttons d-flex">
//                               <Button variant="outline-primary" className="w-100 me-2" onClick={() => handleAddToCart(tablet)}>
//                                 Add to Cart
//                               </Button>
//                               <Button style={{ backgroundColor: '#6f42c1', borderColor: '#6f42c1' }} className="w-100" onClick={() => handleBuyNow(tablet._id)}>
//                                 Buy Now
//                               </Button>
//                             </div>
//                           </div>
//                         </Card.Body>
//                       </Col>
//                     </Row>
//                   </Card>
//                 </Col>
//               ))}
//             </Row>
//           )}
//         </section>

//         {/* ===== KITCHEN APPLIANCES - With Images ===== */}
//         <section className="mb-5 kitchen-section">
//           <div className="section-header text-center mb-4">
//             <h2 className="section-title">Washing Machine</h2>
//             <p className="section-subtitle">Modern appliances for modern homes</p>
//           </div>
          
//           {isLoading.washing_machine ? (
//             <ProductCardSkeleton count={4} />
//           ) : (
//             <Row className="g-4">
//               {washing_machine.slice(0, 4).map((product) => (
//                 <Col key={product._id} xs={12} sm={6} lg={3}>
//                   <Card className="h-100 text-center">
//                     <Card.Img 
//                       variant="top"
//                       src={product.images?.[0]?.url || defaultImage}
//                       style={{ height: '200px', objectFit: 'contain', padding: '1rem' }}
//                     />
//                     <Card.Body className="d-flex flex-column">
//                       <div>
//                         <Card.Title as="h6" className="fw-bold">{product.name}</Card.Title>
//                         <div className="kitchen-product-specs px-2">
//                           {product.specifications && product.specifications.length > 0
//                             ? product.specifications.slice(0, 2).map(spec => spec.value).join(' • ')
//                             : 'High-quality kitchen appliance'
//                           }
//                         </div>
//                       </div>
                      
//                       <div className="smartphone-price-section">
//                         <div className="smartphone-price">₹{product.price?.toLocaleString()}</div>
//                         <div className="star-rating">
//                           {[...Array(5)].map((_, starIndex) => (
//                             <span 
//                               key={starIndex} 
//                               className={starIndex < Math.floor(product.avgRating || 4) ? "text-warning" : "text-muted"}
//                             >
//                               ★
//                             </span>
//                           ))}
//                           <small className="text-muted ms-1">({product.avgRating || 4}.0)</small>
//                         </div>
//                       </div>

//                       <div className="d-grid gap-2">
//                         <Button variant="outline-success" onClick={() => handleAddToCart(product)}>
//                           Add to Cart
//                         </Button>
//                         <Button style={{ backgroundColor: '#6f42c1', borderColor: '#6f42c1' }} onClick={() => handleBuyNow(product._id)}>
//                           Buy Now
//                         </Button>
//                       </div>
//                     </Card.Body>
//                   </Card>
//                 </Col>
//               ))}
//             </Row>
//           )}
//         </section>

//         {/* ===== FOOTWEAR - Consistent Size Brand Cards ===== */}
//         <section className="mb-5 footwear-section">
//           <div className="section-header text-center mb-4">
//             <h2 className="section-title">Gym Essentials</h2>
//             <p className="section-subtitle">Step out in comfort and style</p>
//           </div>
          
//           {isLoading.gym_essentials ? (
//             <ProductCardSkeleton count={4} />
//           ) : (
//             <Row className="g-3">
//               {gym_essentials.slice(0, 4).map((gym) => (
//                 <Col key={gym._id} xs={6} md={3}>
//                   <Card className="footwear-brand-card-consistent">
//                     <Card.Img 
//                       variant="top" 
//                       src={gym.images?.[0]?.url || defaultImage} 
//                       className="footwear-image-consistent"
//                     />
//                     <Card.Body>
//                       <div className="shoe-brand-consistent">{gym.brand || 'Premium'}</div>
//                       <Card.Title className="shoe-model-consistent">{gym.name}</Card.Title>
//                       <div className="shoe-type-consistent">
//                         <Badge bg="light" text="dark">{gym.specifications[2].value || 'Casual'}</Badge>
//                         <Badge bg="light" text="dark">{gym.specifications[3].value || 'Leather'}</Badge>
//                       </div>
                      
//                       <div className="smartphone-price-section">
//                         <div className="shoe-price-consistent">₹{gym.price?.toLocaleString()}</div>
//                         <div className="star-rating">
//                           {[...Array(5)].map((_, starIndex) => (
//                             <span 
//                               key={starIndex} 
//                               className={starIndex < Math.floor(gym.avgRating || 4) ? "text-warning" : "text-muted"}
//                             >
//                               ★
//                             </span>
//                           ))}
//                           <small className="text-muted ms-1">({gym.avgRating || 4}.0)</small>
//                         </div>
//                       </div>

//                       <div className="smartphone-buttons">
//                         <Button variant="outline-primary" size="sm" className="w-100 mb-2" onClick={() => handleAddToCart(gym)}>
//                           <i className="bi bi-cart-plus me-2"></i>
//                           Add to Cart
//                         </Button>
//                         <Button style={{ backgroundColor: '#6f42c1', borderColor: '#6f42c1' }} size="sm" className="w-100" onClick={() => handleBuyNow(gym._id)}>
//                           <i className="bi bi-lightning-fill me-2"></i>
//                           Buy Now
//                         </Button>
//                       </div>
//                     </Card.Body>
//                   </Card>
//                 </Col>
//               ))}
//             </Row>
//           )}
//         </section>

//       </Container>
//     </div>
//   );
// }

// export default HomePage;







import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Context } from "../../store/Context";
import { Container, Row, Col, Card, Button, Carousel, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

import CategoryBar from "./CategoryBar";
import MainCarousel from "./MainCarousel";

import "./HomePage.css";



function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}



function HomePage() {
  const isMobile = useMobileDetection();
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




  // Mobile Cart Item Component
// Mobile Products Grid Component - HomePage ke andar hi rahega
function MobileProductsGrid({ products, onWishlistToggle, onBuyNow }) {
  return (
    <div className="mobile-products-grid">
      {products.map((product, index) => (
        <MobileProductCard 
          key={product._id}
          product={product}
          index={index}
          onWishlistToggle={onWishlistToggle}
          onBuyNow={onBuyNow}
        />
      ))}
    </div>
  );
}


const truncateName = (name, maxLength) => {
  if (!name) return "";
  return name.length > maxLength ? name.substring(0, maxLength) + "..." : name;
};

// Mobile Product Card Component
// Mobile Product Card Component
function MobileProductCard({ product, index, onWishlistToggle, onBuyNow }) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation(); // ✅ Important: Prevent card click when clicking heart
    setIsWishlisted(!isWishlisted);
    onWishlistToggle(product, !isWishlisted);
  };

  const handleCardClick = (e) => {
    // ✅ Only trigger if not clicking the wishlist heart
    if (!e.target.closest('.mobile-product-wishlist')) {
      onBuyNow(product._id);
    }
  };

  const getProductName = (name) => {
    // ✅ Always return full name - CSS will handle ellipsis
    return name;
  };

  return (
    <div 
      className="mobile-product-card"
      onClick={handleCardClick} // ✅ Entire card is clickable for Buy Now
    >
      {/* Wishlist Heart Button */}
      <button 
        className="mobile-product-wishlist"
        onClick={handleWishlistClick}
      >
        <span className={`mobile-product-wishlist-icon ${isWishlisted ? 'active' : ''}`}>
          {isWishlisted ? '❤️' : '🤍'}
        </span>
      </button>
      
      {/* Product Image with Rating */}
      <div className="mobile-product-image-container">
        <img 
          src={product.images?.[0]?.url || defaultImage} 
          alt={product.name}
          className="mobile-product-image"
        />
        <div className="mobile-product-review">
          <span className="mobile-product-rating">{product.avgRating || 4}.0</span>
          <span className="mobile-product-review-star">★</span>
        </div>
      </div>
      
      {/* Product Details */}
      <div className="mobile-product-details">
        <div className="mobile-product-name">
          {truncateName(product.name, 12)}
        </div>
        
        <div className="mobile-product-price">
          ₹{product.price?.toLocaleString()}
        </div>
        
        {/* ✅ REMOVE: Buy Now button completely */}
      </div>
    </div>
  );
}




// Laptop Horizontal Scroll Component
function LaptopHorizontalScroll({ products, onWishlistToggle, onBuyNow }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (e) => {
    const container = e.target;
    const scrollLeft = container.scrollLeft;
    const cardWidth = 280 + 16; // card width + gap
    const newIndex = Math.round(scrollLeft / cardWidth);
    setCurrentIndex(newIndex);
  };

  return (
    <div className="laptop-horizontal-scroll">
      <div 
        className="laptop-scroll-container"
        onScroll={handleScroll}
      >
        {products.map((laptop, index) => (
          <LaptopScrollCard 
            key={laptop._id}
            laptop={laptop}
            index={index}
            onWishlistToggle={onWishlistToggle}
            onBuyNow={onBuyNow}
          />
        ))}
      </div>
      
      {/* Scroll Indicators */}
      <div className="laptop-scroll-indicators">
        {products.map((_, index) => (
          <div 
            key={index}
            className={`laptop-scroll-indicator ${index === currentIndex ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}

// Laptop Scroll Card Component
function LaptopScrollCard({ laptop, index, onWishlistToggle, onBuyNow }) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    onWishlistToggle(laptop, !isWishlisted);
  };

  const handleCardClick = (e) => {
    if (!e.target.closest('.laptop-scroll-wishlist')) {
      onBuyNow(laptop._id);
    }
  };

  const getPerformanceBadge = (index) => {
    const badges = ['⚡ PERFORMANCE', '💼 BUSINESS', '🎮 GAMING', '💻 PREMIUM'];
    return badges[index % badges.length];
  };

  const getLaptopSpecs = () => {
    const specs = laptop.specifications || [];
    return {
      processor: specs[1]?.value || 'Intel i5',
      ram: specs[2]?.value || '8GB',
      storage: specs[3]?.value || '512GB SSD',
      display: specs[4]?.value || '14" FHD'
    };
  };

  const specs = getLaptopSpecs();

  return (
    <div 
      className="laptop-scroll-card"
      onClick={handleCardClick}
    >
      {/* Performance Badge */}
      <div className="laptop-performance-badge">
        {getPerformanceBadge(index)}
      </div>

      {/* Wishlist Heart */}
      <button 
        className="laptop-scroll-wishlist"
        onClick={handleWishlistClick}
      >
        <span className={`laptop-scroll-wishlist-icon ${isWishlisted ? 'active' : ''}`}>
          {isWishlisted ? '❤️' : '🤍'}
        </span>
      </button>
      
      {/* Laptop Image */}
      <div className="laptop-scroll-image-container">
        <img 
          src={laptop.images?.[0]?.url || defaultImage} 
          alt={laptop.name}
          className="laptop-scroll-image"
        />
      </div>
      
      {/* Laptop Details */}
      <div className="laptop-scroll-brand">
        {laptop.brand || 'PREMIUM BRAND'}
      </div>

      <div className="laptop-scroll-name">
        {laptop.name}
      </div>

      {/* Specifications Grid */}
      <div className="laptop-scroll-specs">
        <div className="laptop-spec-item">
          <div className="laptop-spec-icon">⚡</div>
          <span className="laptop-spec-text">{specs.processor}</span>
        </div>
        <div className="laptop-spec-item">
          <div className="laptop-spec-icon">💾</div>
          <span className="laptop-spec-text">{specs.ram}</span>
        </div>
        <div className="laptop-spec-item">
          <div className="laptop-spec-icon">🖥️</div>
          <span className="laptop-spec-text">{specs.display}</span>
        </div>
        <div className="laptop-spec-item">
          <div className="laptop-spec-icon">📦</div>
          <span className="laptop-spec-text">{specs.storage}</span>
        </div>
      </div>

      {/* Footer with Price & Rating */}
      <div className="laptop-scroll-footer">
        <div className="laptop-scroll-price">
          ₹{laptop.price?.toLocaleString()}
        </div>
        <div className="laptop-scroll-rating">
          <span className="laptop-scroll-rating-number">{laptop.avgRating || 4}.0</span>
          <span className="laptop-scroll-rating-star">★</span>
        </div>
      </div>
    </div>
  );
}






// Headphone Mobile Card Component
// Headphones Compact Container Component
function HeadphonesCompactContainer({ products, onWishlistToggle, onBuyNow }) {
  return (
    <div className="headphone-compact-container">
      {/* Audio Wave Animation */}
      <div className="headphone-wave-container">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="headphone-wave-bar" style={{ height: `${20 + i * 8}%` }} />
        ))}
      </div>

      {/* Header */}
     

      {/* Products Grid */}
      <div className="headphone-compact-grid">
        {products.map((headphone, index) => (
          <HeadphoneCompactCard 
            key={headphone._id}
            headphone={headphone}
            index={index}
            onWishlistToggle={onWishlistToggle}
            onBuyNow={onBuyNow}
          />
        ))}
      </div>
    </div>
  );
}

// Headphone Compact Card Component
function HeadphoneCompactCard({ headphone, index, onWishlistToggle, onBuyNow }) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    onWishlistToggle(headphone, !isWishlisted);
  };

  const handleCardClick = (e) => {
    if (!e.target.closest('.headphone-compact-wishlist')) {
      onBuyNow(headphone._id);
    }
  };

  const getAudioBadge = (index) => {
    const badges = ['HOT', 'NEW', 'PRO', 'MAX'];
    return badges[index % badges.length];
  };

  const getHeadphoneFeatures = () => {
    const specs = headphone.specifications || [];
    return {
      battery: specs[4]?.value || '30h',
      bluetooth: specs[2]?.value?.replace('Bluetooth ', 'BT ') || 'BT 5.2',
      type: specs[1]?.value?.includes('Wireless') ? 'Wireless' : 'Wired'
    };
  };

  const features = getHeadphoneFeatures();

  const getFeatureTags = () => {
    const tags = [features.type];
    if (parseInt(features.battery) >= 20) tags.push(features.battery);
    tags.push(features.bluetooth);
    return tags.slice(0, 2);
  };

  const shortenName = (name) => {
    if (name.length > 25) {
      return name.substring(0, 25) + '...';
    }
    return name;
  };

  return (
    <div 
      className="headphone-compact-card"
      onClick={handleCardClick}
    >
      {/* Badge */}
      <div className="headphone-compact-badge">
        {getAudioBadge(index)}
      </div>

      {/* Wishlist Heart */}
      <button 
        className="headphone-compact-wishlist"
        onClick={handleWishlistClick}
        style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 3
        }}
      >
        <span style={{ 
          fontSize: '12px',
          color: isWishlisted ? '#ef4444' : '#cbd5e1'
        }}>
          {isWishlisted ? '❤️' : '🤍'}
        </span>
      </button>

      {/* Image */}
      <div className="headphone-compact-image-container">
        <img 
          src={headphone.images?.[0]?.url || defaultImage} 
          alt={headphone.name}
          className="headphone-compact-image"
        />
      </div>

      {/* Name */}
      <div className="headphone-compact-name">
        {shortenName(headphone.name)}
      </div>

      {/* Features */}
      <div className="headphone-compact-features">
        {getFeatureTags().map((tag, tagIndex) => (
          <span key={tagIndex} className="headphone-compact-feature">
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="headphone-compact-footer">
        <div className="headphone-compact-price">
          ₹{(headphone.price / 1000).toFixed(0)}k
        </div>
        <div className="headphone-compact-rating">
          <span className="headphone-compact-rating-number">{headphone.avgRating || 4}.0</span>
          <span className="headphone-compact-rating-star">★</span>
        </div>
      </div>
    </div>
  );
}


// Watches Mobile Luxury Component
// Watches Timeline Component
// Professional Watches Component
function WatchesProfessional({ products, onWishlistToggle, onBuyNow }) {
  return (
    <div className="watches-professional-container">
      {/* Header */}
     

      {/* Products Grid */}
      <div className="mobile-products-grid">
        {products.map((watch, index) => (
          <WatchProfessionalCard 
            key={watch._id}
            watch={watch}
            index={index}
            onWishlistToggle={onWishlistToggle}
            onBuyNow={onBuyNow}
          />
        ))}
      </div>

      {/* View All Button */}
      <div className="watches-view-all">
        <button className="watches-view-all-btn">
          View All Watches
        </button>
      </div>
    </div>
  );
}

// Watch Professional Card Component
function WatchProfessionalCard({ watch, index, onWishlistToggle, onBuyNow }) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    onWishlistToggle(watch, !isWishlisted);
  };

  const handleCardClick = (e) => {
    if (!e.target.closest('.watch-professional-wishlist')) {
      onBuyNow(watch._id);
    }
  };

  const getBadge = (index) => {
    const badges = ['TRENDING', 'NEW', 'BESTSELLER', 'HOT'];
    return badges[index % badges.length];
  };

  const getWatchFeatures = () => {
    const specs = watch.specifications || [];
    const features = [];
    
    if (specs[2]?.value) features.push(specs[2].value); // Type
    if (specs[3]?.value) features.push(specs[3].value.split(' ')[0]); // Material
    
    return features.slice(0, 2);
  };

  const calculateDiscount = (price) => {
    // Simulate discount for demo
    const originalPrice = price * 1.2;
    const discount = ((originalPrice - price) / originalPrice * 100).toFixed(0);
    return { originalPrice, discount };
  };

  const { originalPrice, discount } = calculateDiscount(watch.price);

  const features = getWatchFeatures();

  const getStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 4);
    const emptyStars = 5 - fullStars;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('full');
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push('empty');
    }
    
    return stars;
  };

  const shortenName = (name) => {
    if (name.length > 40) {
      return name.substring(0, 40) + '...';
    }
    return name;
  };

  return (
    <div 
      className="watch-professional-card"
      onClick={handleCardClick}
    >
      {/* Badge */}
      <div className="watch-professional-badge">
        {getBadge(index)}
      </div>

      {/* Wishlist */}
      <button 
        className="watch-professional-wishlist"
        onClick={handleWishlistClick}
      >
        <span className={`watch-professional-wishlist-icon ${isWishlisted ? 'active' : ''}`}>
          {isWishlisted ? '❤️' : '🤍'}
        </span>
      </button>

      {/* Image */}
      <div className="watch-professional-image-container">
        <img 
          src={watch.images?.[0]?.url || defaultImage} 
          alt={watch.name}
          className="watch-professional-image"
        />
      </div>

      {/* Brand */}
      <div className="watch-professional-brand">
        {watch.brand || 'PREMIUM'}
      </div>

      {/* Name */}
      <div className="watch-professional-name">
        {shortenName(watch.name)}
      </div>

      {/* Features */}
      <div className="watch-professional-features">
        {features.map((feature, featureIndex) => (
          <span key={featureIndex} className="watch-professional-feature">
            {feature}
          </span>
        ))}
      </div>

      {/* Price Section */}
      <div className="watch-professional-price-section">
        <div>
          <span className="watch-professional-price">
            ₹{watch.price?.toLocaleString()}
          </span>
          <span className="watch-professional-original-price">
            ₹{originalPrice.toLocaleString()}
          </span>
          <span className="watch-professional-discount">
            {discount}% off
          </span>
        </div>
      </div>

      {/* Rating */}
      <div className="watch-professional-rating">
        <div className="watch-professional-stars">
          {getStarRating(watch.avgRating).map((star, starIndex) => (
            <span 
              key={starIndex} 
              className={`watch-professional-star ${star === 'empty' ? 'empty' : ''}`}
            >
              ★
            </span>
          ))}
        </div>
        <span className="watch-professional-rating-count">
          ({watch.avgRating || 4}.0)
        </span>
      </div>

      {/* Delivery Info */}
      <div className="watch-professional-delivery">
        <span>🛵 Free delivery</span>
      </div>
    </div>
  );
}


function TabletsProfessional({ products, onWishlistToggle, onBuyNow }) {
  return (
    <div className="tablets-professional-container">
    

      <div className="tablets-professional-grid">
        {products.map((tablet, index) => (
          <TabletProfessionalCard 
            key={tablet._id}
            tablet={tablet}
            index={index}
            onWishlistToggle={onWishlistToggle}
            onBuyNow={onBuyNow}
          />
        ))}
      </div>
    </div>
  );
}

function TabletProfessionalCard({ tablet, index, onWishlistToggle, onBuyNow }) {
  const handleCardClick = () => {
    onBuyNow(tablet._id);
  };

  const getBadge = (index) => {
    const badges = ['PRO', 'MAX', 'PLUS', 'AIR'];
    return badges[index % badges.length];
  };

  const getTabletSpecs = () => {
    const specs = tablet.specifications || [];
    return {
      display: specs[1]?.value || '10.9" Display',
      storage: specs[2]?.value || '128GB Storage',
      processor: specs[0]?.value || 'Fast Processor'
    };
  };

  const specs = getTabletSpecs();

  return (
    <div className="tablet-professional-card" onClick={handleCardClick}>
      <div className="tablet-professional-badge">{getBadge(index)}</div>
      
      <div className="tablet-professional-image-container">
        <img 
          src={tablet.images?.[0]?.url || defaultImage} 
          alt={tablet.name}
          className="tablet-professional-image"
        />
      </div>

      <div className="tablet-professional-name">{tablet.name}</div>
      
      <div className="tablet-professional-specs">
        <div className="tablet-professional-spec">
          <span className="tablet-professional-spec-icon">📱</span>
          {specs.display}
        </div>
        <div className="tablet-professional-spec">
          <span className="tablet-professional-spec-icon">💾</span>
          {specs.storage}
        </div>
      </div>

      <div className="tablet-professional-price-section">
        <div className="tablet-professional-price">₹{tablet.price?.toLocaleString()}</div>
        <div className="tablet-professional-rating">
          <span className="tablet-professional-rating-number">{tablet.avgRating || 4}.0</span>
          <span className="tablet-professional-rating-star">★</span>
        </div>
      </div>
    </div>
  );
}

function WashingMachinesProfessional({ products, onWishlistToggle, onBuyNow }) {
  return (
    <div className="washing-machines-professional-container">
    

      <div className="washing-machines-professional-grid">
        {products.map((machine, index) => (
          <WashingMachineProfessionalCard 
            key={machine._id}
            machine={machine}
            index={index}
            onWishlistToggle={onWishlistToggle}
            onBuyNow={onBuyNow}
          />
        ))}
      </div>
    </div>
  );
}

function WashingMachineProfessionalCard({ machine, index, onWishlistToggle, onBuyNow }) {
  const handleCardClick = () => {
    onBuyNow(machine._id);
  };

  const getFeature = (index) => {
    const features = ['AUTO WASH', 'QUICK WASH', 'STEAM WASH', 'ENERGY SAVE'];
    return features[index % features.length];
  };

  const getMachineSpecs = () => {
    const specs = machine.specifications || [];
    return {
      capacity: specs[0]?.value || '8 kg',
      type: specs[1]?.value || 'Front Load'
    };
  };

  const specs = getMachineSpecs();

  return (
    <div className="washing-machine-professional-card" onClick={handleCardClick}>
      <div className="washing-machine-professional-feature">{getFeature(index)}</div>
      
      <div className="washing-machine-professional-image-container">
        <img 
          src={machine.images?.[0]?.url || defaultImage} 
          alt={machine.name}
          className="washing-machine-professional-image"
        />
      </div>

      <div className="washing-machine-professional-name">{machine.name}</div>
      
      <div className="washing-machine-professional-capacity">
        <span>⚡</span> Capacity: {truncateName(specs.capacity, 12)}
              
      </div>
      
      <div className="washing-machine-professional-type">{specs.type}</div>

      <div className="washing-machine-professional-price-section">
        <div className="washing-machine-professional-price">₹{machine.price?.toLocaleString()}</div>
      </div>
    </div>
  );
}

function GymEssentialsProfessional({ products, onWishlistToggle, onBuyNow }) {
  return (
    <div className="gym-professional-container">
    >

      <div className="gym-professional-grid">
        {products.map((gym, index) => (
          <GymProfessionalCard 
            key={gym._id}
            gym={gym}
            index={index}
            onWishlistToggle={onWishlistToggle}
            onBuyNow={onBuyNow}
          />
        ))}
      </div>
    </div>
  );
}

function GymProfessionalCard({ gym, index, onWishlistToggle, onBuyNow }) {
  const handleCardClick = () => {
    onBuyNow(gym._id);
  };

  const getSportsType = (index) => {
    const types = ['GYM', 'FITNESS', 'TRAINING', 'WORKOUT'];
    return types[index % types.length];
  };

  const getGymSpecs = () => {
    const specs = gym.specifications || [];
    return {
      material: specs[3]?.value || 'Premium Material',
      purpose: specs[2]?.value || 'Multi-purpose'
    };
  };

  const specs = getGymSpecs();

  return (
    <div className="gym-professional-card" onClick={handleCardClick}>
      <div className="gym-professional-sports">{getSportsType(index)}</div>
      
      <div className="gym-professional-image-container">
        <img 
          src={gym.images?.[0]?.url || defaultImage} 
          alt={gym.name}
          className="gym-professional-image"
        />
      </div>

      <div className="gym-professional-brand">{gym.brand || 'FITNESS'}</div>
      <div className="gym-professional-name">{gym.name}</div>
      <div className="gym-professional-purpose">{specs.purpose}</div>

      <div className="gym-professional-price-section">
        <div className="gym-professional-price">₹{gym.price?.toLocaleString()}</div>
        
      </div>
    </div>
  );
}
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
       {/* ===== SMARTPHONES - Improved Glass Cards ===== */}
<section className="mb-5 smartphone-section">
  <div className="section-header text-center mb-4">
    <h2 className="section-title">Premium Smartphones</h2>
    <p className="section-subtitle">Latest technology in your hands</p>
  </div>

{isLoading.smartphones ? (
  isMobile ? (
    <ProductCardSkeleton count={4} isMobile={true} />
  ) : (
    <ProductCardSkeleton count={4} />
  )
) : isMobile ? (
  <MobileProductsGrid 
    products={smartphones.slice(0, 4)}
    onWishlistToggle={handleAddToCart}
    onBuyNow={handleBuyNow}
  />
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
    isMobile ? (
      <div className="laptop-horizontal-scroll">
        <div className="laptop-scroll-container">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="laptop-scroll-skeleton">
              <div className="laptop-scroll-skeleton-image"></div>
              <div className="laptop-scroll-skeleton-line laptop-scroll-skeleton-title mb-3"></div>
              <div className="laptop-scroll-skeleton-specs">
                <div className="laptop-scroll-skeleton-spec"></div>
                <div className="laptop-scroll-skeleton-spec"></div>
                <div className="laptop-scroll-skeleton-spec"></div>
                <div className="laptop-scroll-skeleton-spec"></div>
              </div>
              <div className="laptop-scroll-skeleton-footer">
                <div className="laptop-scroll-skeleton-price"></div>
                <div className="laptop-scroll-skeleton-rating"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <ProductCardSkeleton count={4} />
    )
  ) : isMobile ? (
    <LaptopHorizontalScroll 
      products={laptops.slice(0, 4)}
      onWishlistToggle={handleAddToCart}
      onBuyNow={handleBuyNow}
    />
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
    isMobile ? (
      <div className="headphone-compact-container">
        <div className="headphone-compact-header">
          <h2 className="headphone-compact-title">Premium Audio</h2>
          <p className="headphone-compact-subtitle">Immersive Sound Experience</p>
        </div>
        <div className="headphone-compact-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="headphone-compact-skeleton">
              <div className="headphone-compact-skeleton-image"></div>
              <div className="headphone-compact-skeleton-name"></div>
              <div className="headphone-compact-skeleton-features">
                <div className="headphone-compact-skeleton-feature"></div>
                <div className="headphone-compact-skeleton-feature"></div>
              </div>
              <div className="headphone-compact-skeleton-footer">
                <div className="headphone-compact-skeleton-price"></div>
                <div className="headphone-compact-skeleton-rating"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : (
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
    )
  ) : isMobile ? (
    <HeadphonesCompactContainer 
      products={headphones.slice(0, 4)}
      onWishlistToggle={handleAddToCart}
      onBuyNow={handleBuyNow}
    />
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
  isMobile ? (
    <ProductCardSkeleton count={4} isMobile={true} />
  ) : (
    <ProductCardSkeleton count={4} />
  )
) : isMobile ? (
  <MobileProductsGrid 
    products={watches.slice(0, 4)}
    onWishlistToggle={handleAddToCart}
    onBuyNow={handleBuyNow}
  />
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
    isMobile ? (
      <div className="tablets-professional-container">
        <div className="section-header-professional">
          <h2 className="section-title-professional">Smart Tablets</h2>
          <p className="section-subtitle-professional">Perfect for entertainment and productivity</p>
        </div>
        <div className="tablets-professional-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="tablet-professional-skeleton">
              <div className="professional-skeleton-image"></div>
              <div className="professional-skeleton-name"></div>
              <div className="professional-skeleton-spec"></div>
              <div className="professional-skeleton-spec"></div>
              <div className="professional-skeleton-footer">
                <div className="professional-skeleton-price"></div>
                <div className="professional-skeleton-badge"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : (
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
    )
  ) : isMobile ? (
    <TabletsProfessional 
      products={tablets.slice(0, 4)}
      onWishlistToggle={handleAddToCart}
      onBuyNow={handleBuyNow}
    />
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
    isMobile ? (
      <div className="washing-machines-professional-container">
        <div className="section-header-professional">
          <h2 className="section-title-professional">Washing Machines</h2>
          <p className="section-subtitle-professional">Modern appliances for modern homes</p>
        </div>
        <div className="washing-machines-professional-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="washing-machine-professional-skeleton">
              <div className="professional-skeleton-image"></div>
              <div className="professional-skeleton-name"></div>
              <div className="professional-skeleton-spec"></div>
              <div className="professional-skeleton-footer">
                <div className="professional-skeleton-price"></div>
                <div className="professional-skeleton-badge"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <ProductCardSkeleton count={4} />
    )
  ) : isMobile ? (
    <WashingMachinesProfessional 
      products={washing_machine.slice(0, 4)}
      onWishlistToggle={handleAddToCart}
      onBuyNow={handleBuyNow}
    />
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
    isMobile ? (
      <div className="gym-professional-container">
        <div className="section-header-professional">
          <h2 className="section-title-professional">Gym Essentials</h2>
          <p className="section-subtitle-professional">Step out in comfort and style</p>
        </div>
        <div className="gym-professional-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="gym-professional-skeleton">
              <div className="professional-skeleton-image"></div>
              <div className="professional-skeleton-name"></div>
              <div className="professional-skeleton-spec"></div>
              <div className="professional-skeleton-footer">
                <div className="professional-skeleton-price"></div>
                <div className="professional-skeleton-badge"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <ProductCardSkeleton count={4} />
    )
  ) : isMobile ? (
    <GymEssentialsProfessional 
      products={gym_essentials.slice(0, 4)}
      onWishlistToggle={handleAddToCart}
      onBuyNow={handleBuyNow}
    />
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


