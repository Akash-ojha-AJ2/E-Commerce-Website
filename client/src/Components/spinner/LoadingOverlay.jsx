import React from 'react';
import { Spinner } from 'react-bootstrap'; // React-Bootstrap से Spinner इम्पोर्ट करें

const LoadingOverlay = ({ isLoading, text = "Loading..." }) => {
  // अगर isLoading false है, तो कुछ भी रेंडर न करें
  if (!isLoading) {
    return null;
  }

  return (
    <div className="loading-overlay">
      <Spinner animation="border" variant="light" style={{ width: '3rem', height: '3rem' }} />
      <p className="loading-overlay-text">{text}</p>
    </div>
  );
};

export default LoadingOverlay;