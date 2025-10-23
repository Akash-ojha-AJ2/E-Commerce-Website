// src/components/ProductListPage/ProductCard.js

import React from 'react';

function ProductCard({ product }) {
    return (
        <div className="col">
            <div className="card h-100">
                <img src={product.img} className="card-img-top p-3" alt={product.name} style={{ objectFit: 'contain', height: '200px' }} />
                <div className="card-body">
                    <h5 className="card-title">{product.name}</h5>
                    <p className="card-text fw-bold">{product.price}</p>
                    <a href="#" className="btn btn-primary">Add to Cart</a>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;