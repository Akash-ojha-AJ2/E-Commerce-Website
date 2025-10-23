import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import './OrderCardSkeleton.css';

const OrderCardSkeleton = () => {
  return (
    <Col md={12}>
      <Card className="shadow-lg p-3 skeleton-card">
        <Card.Body>
          <Row>
            {/* Left Side Skeleton */}
            <Col md={4} className="border-end">
              <div className="placeholder title shimmer"></div>
              <div className="placeholder text shimmer"></div>
              <div className="placeholder text shimmer" style={{ width: '60%' }}></div>
              <div className="placeholder text shimmer" style={{ width: '70%' }}></div>
              
              <div className="placeholder title shimmer mt-3"></div>
              <div className="placeholder text shimmer"></div>
              <div className="placeholder text shimmer" style={{ width: '70%' }}></div>

              <div className="placeholder title shimmer mt-3"></div>
              <div className="placeholder badge-sm shimmer"></div>
            </Col>

            {/* Right Side Skeleton */}
            <Col md={8}>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="placeholder title shimmer" style={{ width: '70%' }}></div>
                <div className="placeholder button shimmer"></div>
              </div>

              <div className="mb-3">
                <div className="placeholder text shimmer mb-3" style={{ width: '20%', height: '20px' }}></div>
                {[1, 2].map(i => (
                  <div key={i} className="d-flex align-items-center gap-3 mb-2">
                    <div className="placeholder img-sm shimmer"></div>
                    <div style={{ flex: 1 }}>
                      <div className="placeholder text shimmer mb-2" style={{ width: '80%', height: '20px' }}></div>
                      <div className="placeholder text shimmer" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="d-flex justify-content-between align-items-center mt-4">
                <div className="placeholder title shimmer" style={{ width: '40%' }}></div>
                <div className="placeholder badge-sm shimmer"></div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default OrderCardSkeleton;