import React from 'react';
import './ProductCardSkeleton.css';

const ProductCardSkeleton = () => {
  return (
    <div className="col-md-4">
      <div className="card h-100 shadow-sm skeleton-card">
        <div className="ratio ratio-4x3">
          <div className="card-img-top shimmer" />
        </div>
        <div className="card-body d-flex flex-column justify-content-between">
          <div>
            <div className="placeholder title shimmer mb-3"></div>
            <div className="placeholder text shimmer mb-2"></div>
            <div className="placeholder category shimmer"></div>
          </div>
          <div className="d-flex gap-2 mt-3">
            <div className="placeholder w-50 shimmer" style={{ height: '38px', borderRadius: '50px' }}></div>
            <div className="placeholder w-50 shimmer" style={{ height: '38px', borderRadius: '50px' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;