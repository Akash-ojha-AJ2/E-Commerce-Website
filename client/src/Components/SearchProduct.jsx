import React, { useState, useEffect, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { FaHeart } from 'react-icons/fa'; 
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Context } from '../store/Context';

function SearchProduct() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [filtersLog, setFiltersLog] = useState({});
  const [searchTime, setSearchTime] = useState(0);
  const navigate = useNavigate();

  const { isLoggedIn,refreshCartCount,backend } = useContext(Context);


  const search = async () => {
    console.log("1. Starting search for query:", query);
    if (!query.trim()) {
      setProducts([]);
      setError("");
      setFiltersLog({});
      return;
    }

    setIsLoading(true);
    setProducts([]);
    setError("");
    setFiltersLog({});
    setSearchTime(0);

    const startTime = Date.now();

    try {
     
      const res = await fetch(`${backend}/api/ai-search/search`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query }), 
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        setProducts(data.products || []);
        setFiltersLog(data.filtersApplied || {}); 
        if (!data.products || data.products.length === 0) {
          setError("No products found with the applied filters.");
        }
      } else {
        setError(data.message || "No products found");
      }

    } catch (err) {
      console.error("Search failed:", err);
      setError(err.message || "Failed to fetch products.");
    } finally {
      const endTime = Date.now();
      setSearchTime(endTime - startTime);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    search();
  }, [query]);

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

  return (
    <div className="container mt-4">
      <h3>Search Results for: "{query}"</h3>
      
      {/* Search metadata */}
      {!isLoading && products.length > 0 && (
        <div className="text-muted mb-3">
          Found {products.length} products in {searchTime || 0}ms
        </div>
      )}

      {/* Filters display (yeh ab backend se aaye data se chalega) */}
      {filtersLog && Object.keys(filtersLog).length > 0 && (
        <div className="alert alert-info" role="alert">
          <strong>Extracted Filters:</strong>
          <div className="mt-2">
            {filtersLog.type && (
              <span className="badge bg-primary me-2">Type: {filtersLog.type}</span>
            )}
            {filtersLog.category && (
              <span className="badge bg-secondary me-2">Category: {filtersLog.category}</span>
            )}
            {filtersLog.minPrice && (
              <span className="badge bg-warning me-2">Min Price: ₹{filtersLog.minPrice}</span>
            )}
            {filtersLog.maxPrice && (
              <span className="badge bg-warning me-2">Max Price: ₹{filtersLog.maxPrice}</span>
            )}
            {filtersLog.specifications?.map((spec, index) => (
              <span key={index} className="badge bg-success me-2">
                {spec.key}: {spec.value}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Analyzing your search and finding products...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* No results */}
      {!isLoading && !error && products.length === 0 && query.trim() && (
        <div className="alert alert-warning" role="alert">
          No products found for your search. Try different keywords or filters.
        </div>
      )}
      
      {/* Results - (Bina kisi badlaav ke) */}
      {!isLoading && products.length > 0 && (
        <div className="row">
          {products.map((product) => (
             <div key={product._id || product.id} className="col-6 col-md-4 col-lg-3 mb-4 d-flex">
              <div className="card product-card-enhanced h-100 w-100">
                
                {/* Image Container */}
                <div className="product-image-container">
                  <Link to={`/product/${product._id}`}>
                    <img
                      src={product.images?.[0]?.url || 'https://via.placeholder.com/300x300'}
                      className="product-image"
                      alt={product.name}
                    />
                  </Link>
                  <button className="wishlist-btn" onClick={()=>{handleAddToCart(product)}}>
                    <FaHeart />
                  </button>
                </div>

                {/* Card Body */}
                <div className="card-body p-3 text-start d-flex flex-column">
                  {product.isSponsored && <span className="sponsored-tag">Sponsored</span>}
                  <div className="product-info">
                    <h6 className="product-title">{product.name || 'Unnamed Product'}</h6>
                    <p className="product-subtitle">{product.specifications?.[0]?.value || 'General Product Type'}</p>
                  </div>
                  <div className="rating-badge my-1">
                    {parseFloat(product.avgRating || '3.9').toFixed(1)} ★ ({product.reviews?.length?.toLocaleString('en-IN') || '1,234'})
                  </div>
                  <div className="price-container">
                    <span className="current-price">₹{product.price?.toLocaleString('en-IN') || 'N/A'}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <>
                        <span className="original-price">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                        <span className="discount-percentage">
                          {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                        </span>
                      </>
                    )}
                  </div>
                  
                  {/* Actions container */}
                  <div className="product-actions mt-auto pt-2">
                    <button className="btn btn-buy-now" onClick={() => navigate(`/product/${product._id}`)}>
                      <i className="fas fa-bolt me-1"></i> Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchProduct;

