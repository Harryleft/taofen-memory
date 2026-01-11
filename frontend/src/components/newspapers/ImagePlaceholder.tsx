import React, { useState, useRef, useEffect } from 'react';

interface ImagePlaceholderProps {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  src,
  alt,
  width = 300,
  height = 200,
  className = '',
  onLoad,
  onError
}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [imgSrc, setImgSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);

  // 生成占位图片URL
  const getPlaceholderUrl = (w: number, h: number) => {
    return `https://picsum.photos/seed/newspaper-${w}-${h}/${w}/${h}.jpg`;
  };

  // 加载图片
  useEffect(() => {
    if (!src) {
      // 如果没有提供src，使用占位图片
      setImgSrc(getPlaceholderUrl(width, height));
      return;
    }

    setImageState('loading');
    const img = new Image();
    
    const handleLoad = () => {
      setImageState('loaded');
      setImgSrc(src);
      onLoad?.();
    };

    const handleError = () => {
      // 如果提供的图片加载失败，使用占位图片
      setImgSrc(getPlaceholderUrl(width, height));
      setImageState('loaded');
      onError?.();
    };

    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = src;
  }, [src, width, height, onLoad, onError]);

  const handleImageLoad = () => {
    setImageState('loaded');
    onLoad?.();
  };

  const handleImageError = () => {
    // 如果占位图片也加载失败，显示错误状态
    setImageState('error');
    onError?.();
  };

  return (
    <div 
      className={`newspapers-image-placeholder ${className}`}
      style={{ width, height }}
    >
      {imageState === 'loading' && (
        <div className="newspapers-image-placeholder__loading">
          <div className="newspapers-image-placeholder__spinner"></div>
          <div className="newspapers-image-placeholder__skeleton"></div>
        </div>
      )}

      {imageState === 'error' && (
        <div className="newspapers-image-placeholder__error">
          <div className="newspapers-image-placeholder__icon">📰</div>
          <p className="newspapers-image-placeholder__text">图片加载失败</p>
        </div>
      )}

      {(imageState === 'loaded' || imgSrc) && (
        <img
          ref={imgRef}
          src={imgSrc}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`newspapers-image-placeholder__img ${
            imageState === 'loaded' ? 'newspapers-image-placeholder__img--loaded' : ''
          }`}
          style={{ 
            display: imageState === 'loaded' ? 'block' : 'none' 
          }}
        />
      )}
    </div>
  );
};

export default ImagePlaceholder;