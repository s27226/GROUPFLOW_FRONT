import React, { useState, useEffect, useRef } from 'react';
import '../../styles/skeletons.css';

/**
 * Lazy loading image component with skeleton placeholder
 * Prevents FOUC and layout shift when images load
 * 
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text for accessibility
 * @param {string} className - Additional CSS classes
 * @param {number} aspectRatio - Aspect ratio (width/height) to prevent layout shift
 * @param {string} placeholderColor - Background color for placeholder
 */
export default function LazyImage({ 
  src, 
  alt = '', 
  className = '', 
  aspectRatio = 16/9,
  placeholderColor,
  onLoad,
  ...props 
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    // Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setError(true);
    setIsLoaded(true);
  };

  const containerStyle = {
    position: 'relative',
    width: '100%',
    paddingBottom: `${(1 / aspectRatio) * 100}%`,
    backgroundColor: placeholderColor || 'var(--bg-secondary)',
    overflow: 'hidden',
    borderRadius: '8px',
  };

  const imageStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  return (
    <div 
      ref={imgRef} 
      className={`image-skeleton-container ${className}`}
      style={containerStyle}
    >
      {!isLoaded && !error && (
        <div className="skeleton" style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%' 
        }}></div>
      )}
      
      {isInView && !error && (
        <img
          src={src}
          alt={alt}
          className={`${isLoaded ? 'image-loaded' : 'image-loading'}`}
          style={imageStyle}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          {...props}
        />
      )}
      
      {error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: 'var(--text-secondary)',
        }}>
          <svg 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor"
            style={{ marginBottom: '8px' }}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <p style={{ fontSize: '0.875rem' }}>Image failed to load</p>
        </div>
      )}
    </div>
  );
}
