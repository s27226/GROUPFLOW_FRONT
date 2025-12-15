import React from 'react';
import { useImageLoaded } from '../hooks/useImageLoaded';

const ProfileBanner = ({ src, alt = "Banner" }) => {
    const { loaded, handleLoad } = useImageLoaded();

    return (
        <div className="profile-banner">
            {!loaded && (
                <div 
                    className="skeleton" 
                    style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '900px', 
                        height: '200px', 
                        borderRadius: '12px' 
                    }}
                />
            )}
            <img 
                src={src} 
                alt={alt} 
                loading="lazy"
                className={loaded ? 'loaded' : ''}
                onLoad={handleLoad}
            />
        </div>
    );
};

export default ProfileBanner;
