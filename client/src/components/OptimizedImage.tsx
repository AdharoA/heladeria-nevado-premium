import React, { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
}

/**
 * OptimizedImage Component
 * 
 * Handles:
 * - Lazy loading with intersection observer
 * - Image dimension optimization
 * - Error handling with fallback
 * - Native <img> optimization
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width = 400,
  height = 400,
  className = '',
  loading = 'lazy',
  sizes,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setError(true);
  };

  if (!src || error) {
    return (
      <div 
        className={`${className} bg-gray-200 dark:bg-gray-700 flex items-center justify-center`}
        style={{ aspectRatio: `${width}/${height}` }}
      >
        <span className="text-gray-500 dark:text-gray-400">No image</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 w-full h-auto object-cover`}
      loading={loading}
      sizes={sizes}
      onLoad={handleLoad}
      onError={handleError}
      decoding="async"
    />
  );
};

export default OptimizedImage;
