import { useState } from 'react';

export const useImageLoaded = () => {
    const [loaded, setLoaded] = useState(false);

    const handleLoad = () => {
        setLoaded(true);
    };

    return { loaded, handleLoad };
};
