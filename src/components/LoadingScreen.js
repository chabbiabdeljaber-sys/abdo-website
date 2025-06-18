import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = ({ message = "Loading", subMessage = "Please wait..." }) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <div className="loading-text">{message}</div>
      <div className="loading-subtext">{subMessage}</div>
    </div>
  );
};

export default LoadingScreen; 