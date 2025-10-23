import React, { useEffect, useState ,useContext} from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import SellerLayout from "./SellerLayout";
import ProductCardSkeleton from '../spinner/ProductCardSkeleton';
import {Context} from "../../store/Context"

import 'bootstrap-icons/font/bootstrap-icons.css';
import './SellerAllProduct.css';

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const {backend} = useContext(Context)

  // Star rating render करने का function
  const renderStars = (rating) => {
    if (!rating || rating === 0) {
      return <span className="text-muted">No reviews yet</span>;
    }

    const stars = [];
    const fullStars = Math.floor(rating);
    const decimalPart = rating % 1;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        // Full star
        stars.push(
          <span key={i} className="text-warning">
            <i className="bi bi-star-fill"></i>
          </span>
        );
      } else if (i === fullStars + 1 && decimalPart >= 0.3 && decimalPart <= 0.7) {
        // Half star
        stars.push(
          <span key={i} className="text-warning">
            <i className="bi bi-star-half"></i>
          </span>
        );
      } else if (i === fullStars + 1 && decimalPart > 0.7) {
        // Consider as full star if decimal is high
        stars.push(
          <span key={i} className="text-warning">
            <i className="bi bi-star-fill"></i>
          </span>
        );
      } else {
        // Empty star
        stars.push(
          <span key={i} className="text-secondary">
            <i className="bi bi-star"></i>
          </span>
        );
      }
    }
    
    return stars;
  };

  const fetchMyProducts = async () => {
    try {
      const res = await fetch(`${backend}/api/v1/seller/my-products`, {
        credentials: 'include'
      });
      const data = await res.json();
      console.log('Backend response:', data);
      
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error("Failed to load products");
      }
    } catch (err) {
      toast.error("Server error fetching products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${backend}/api/v1/seller/delete-product/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Product deleted successfully");
        setProducts(products.filter(p => p._id !== id));
      } else {
        toast.error(data.message || "Failed to delete product");
      }
    } catch (err) {
      toast.error("Error deleting product");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter(product => {
    switch (filter) {
      case 'inStock':
        return product.stock > 0;
      case 'outOfStock':
        return product.stock === 0;
      case 'rating4Plus':
        return (product.avgRating || 0) >= 4;
      case 'rating3Plus':
        return (product.avgRating || 0) >= 3;
      default:
        return true;
    }
  });

  useEffect(() => {
    fetchMyProducts();
  }, []);

  return (
    <SellerLayout>
      <div className="seller-products-page">
        {/* Header Section */}
        <div className="seller-products-header-section">
          <div className="seller-header-content">
            <h1 className="seller-page-title">My Products</h1>
            <p className="seller-page-subtitle">Manage your product listings and inventory</p>
          </div>
          <Link to="/seller/sellproduct" className="btn btn-primary seller-add-product-btn">
            <i className="bi bi-plus-circle me-2"></i>Add New Product
          </Link>
        </div>

        {/* Stats and Filters Section */}
        <div className="seller-products-controls">
          <div className="seller-stats-container">
            <div className="seller-stat-card">
              <span className="seller-stat-number">{products.length}</span>
              <span className="seller-stat-label">Total Products</span>
            </div>
            <div className="seller-stat-card">
              <span className="seller-stat-number">
                {products.filter(p => p.stock > 0).length}
              </span>
              <span className="seller-stat-label">In Stock</span>
            </div>
            <div className="seller-stat-card">
              <span className="seller-stat-number">
                {products.filter(p => p.avgRating >= 4).length}
              </span>
              <span className="seller-stat-label">4+ Stars</span>
            </div>
            <div className="seller-stat-card">
              <span className="seller-stat-number">
                {products.reduce((total, product) => total + (product.reviewCount || 0), 0)}
              </span>
              <span className="seller-stat-label">Total Reviews</span>
            </div>
          </div>

          <div className="seller-filters-container">
            <div className="seller-filter-buttons">
              <button 
                className={`seller-filter-btn ${filter === 'all' ? 'seller-filter-active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Products
              </button>
              <button 
                className={`seller-filter-btn ${filter === 'inStock' ? 'seller-filter-active' : ''}`}
                onClick={() => setFilter('inStock')}
              >
                In Stock
              </button>
              <button 
                className={`seller-filter-btn ${filter === 'outOfStock' ? 'seller-filter-active' : ''}`}
                onClick={() => setFilter('outOfStock')}
              >
                Out of Stock
              </button>
              <button 
                className={`seller-filter-btn ${filter === 'rating4Plus' ? 'seller-filter-active' : ''}`}
                onClick={() => setFilter('rating4Plus')}
              >
                4+ Stars
              </button>
              <button 
                className={`seller-filter-btn ${filter === 'rating3Plus' ? 'seller-filter-active' : ''}`}
                onClick={() => setFilter('rating3Plus')}
              >
                3+ Stars
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="seller-products-grid-section">
          {loading ? (
            <div className="seller-products-grid">
              {Array.from({ length: 8 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="seller-empty-state">
              <div className="seller-empty-icon">
                <i className="bi bi-box-seam"></i>
              </div>
              <h3 className="seller-empty-title">No products found</h3>
              <p className="seller-empty-text">
                {filter === 'all' 
                  ? "You haven't added any products yet. Start by adding your first product!" 
                  : `No products match the "${filter}" filter.`}
              </p>
              {filter !== 'all' && (
                <button 
                  className="btn btn-outline-primary seller-show-all-btn"
                  onClick={() => setFilter('all')}
                >
                  Show All Products
                </button>
              )}
              {filter === 'all' && (
                <Link to="/seller/sellproduct" className="btn btn-primary seller-add-first-btn">
                  Add Your First Product
                </Link>
              )}
            </div>
          ) : (
            <div className="seller-products-grid">
              {filteredProducts.map((product) => {
                const displayRating = product.avgRating || 0;
                const totalReviews = product.reviewCount || 0;
                
                return (
                  <div className="seller-product-card" key={product._id}>
                    <div className="seller-product-image-container">
                      <img
                        src={product.images[0]?.url || '/placeholder-image.jpg'}
                        alt={product.name}
                        className="seller-product-image"
                        onError={(e) => {
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                      
                      {/* Stock Badge */}
                      <div className="seller-product-badges">
                        {product.stock === 0 && (
                          <span className="seller-badge seller-out-of-stock-badge">
                            Out of Stock
                          </span>
                        )}
                        {displayRating >= 4 && totalReviews > 0 && (
                          <span className="seller-badge seller-top-rated-badge">
                            Top Rated
                          </span>
                        )}
                        {totalReviews === 0 && (
                          <span className="seller-badge seller-no-reviews-badge">
                            No Reviews
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="seller-product-info">
                      <h3 className="seller-product-name" title={product.name}>
                        {product.name}
                      </h3>
                      
                      {/* Stock and Category Information */}
                      <div className="seller-product-meta">
                        <div className="seller-stock-info">
                          <span className={`seller-stock-status ${product.stock > 0 ? 'seller-in-stock' : 'seller-out-of-stock'}`}>
                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                          <span className="seller-stock-count">• {product.stock} units</span>
                        </div>
                        <div className="seller-category-info">
                          {product.category}
                        </div>
                      </div>

                      {/* Star Rating Section */}
                      <div className="seller-product-rating">
                        <div className="seller-star-rating">
                          {renderStars(displayRating)}
                          {displayRating > 0 ? (
                            <span className="seller-rating-text">
                              {displayRating.toFixed(1)} ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                            </span>
                          ) : (
                            <span className="seller-rating-text text-muted">
                              No reviews yet
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="seller-price-section">
                        <span className="seller-product-price">
                          ₹{product.price?.toLocaleString() || '0'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="seller-product-actions">
                      <Link
                        to={`/seller/edit-product/${product._id}`}
                        className="btn btn-outline seller-edit-btn"
                        title="Edit Product"
                      >
                        <i className="bi bi-pencil-square"></i>
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="btn btn-outline seller-delete-btn"
                        disabled={deletingId === product._id}
                        title="Delete Product"
                      >
                        {deletingId === product._id ? (
                          <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                          <>
                            <i className="bi bi-trash3"></i>
                            <span>Delete</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </SellerLayout>
  );
};

export default MyProducts;