import React from 'react';
import '../../styles/skeletons.css';

/**
 * Reusable loading spinner component
 * @param {string} size - 'small', 'medium', or 'large'
 * @param {boolean} fullScreen - Whether to center in full viewport
 */
export default function LoadingSpinner({ size = 'medium', fullScreen = false }) {
  const sizeClass = size === 'large' ? 'spinner-large' : '';
  
  const content = <div className={`spinner ${sizeClass}`}></div>;
  
  if (fullScreen) {
    return (
      <div className="loading-container loading-container-full">
        {content}
      </div>
    );
  }
  
  return (
    <div className="loading-container">
      {content}
    </div>
  );
}
