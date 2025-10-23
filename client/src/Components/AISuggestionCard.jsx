import { Card, Button, Badge, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { Context } from "../store/Context";

function ProductCard({ product }) {
  const { isLoggedIn, refreshCartCount , backend} = useContext(Context);
  const navigate = useNavigate();
  const defaultImage = "https://via.placeholder.com/150";

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
  };

  const calculateAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 4;
    const total = ratings.reduce((sum, r) => sum + (r.rating || 0), 0);
    return (total / ratings.length).toFixed(1);
  };

  const avgRating = product.avgRating || calculateAverageRating(product.ratings);

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
                style={{ 
                  height: "1.8em",
                  overflow: "hidden"
                }}
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
  );
}

export default ProductCard;