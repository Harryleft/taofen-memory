import React, { useState, useRef, useEffect } from 'react';

interface ImagePeekProps {
  src: string;
  alt: string;
  className?: string;
  height?: 'sm' | 'md' | 'lg' | 'auto';
  showExpandHint?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  onClick?: () => void;
}

/**
 * 图片前20%显示组件
 * 
 * 三种实现方案：
 * 1. clip-path: 使用CSS clip-path属性，性能最佳
 * 2. overflow: 使用overflow:hidden和transform，兼容性好
 * 3. scale: 使用transform scale，视觉效果独特
 */
export const ImagePeek: React.FC<ImagePeekProps> = ({
  src,
  alt,
  className = '',
  height = 'md',
  showExpandHint = true,
  onLoad,
  onError,
  onClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 检测移动设备
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(hover: none) and (pointer: coarse)').matches);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 移动端默认展开
  useEffect(() => {
    if (isMobile) {
      setIsExpanded(true);
    }
  }, [isMobile]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  const handleContainerClick = () => {
    if (!isMobile) {
      setIsExpanded(!isExpanded);
    }
    onClick?.();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleContainerClick();
    }
  };

  const getContainerClasses = () => {
    const baseClasses = 'image-peek-container image-peek-performance cursor-pointer';
    const heightClasses = {
      sm: 'h-32',
      md: 'h-44',
      lg: 'h-56',
      auto: 'h-auto max-h-80',
    };
    
    return `${baseClasses} ${heightClasses[height]} ${className}`.trim();
  };

  const getImageClasses = () => {
    const baseClasses = 'image-peek-clip w-full h-full object-cover';
    
    if (isExpanded || isMobile) {
      return `${baseClasses} expanded`;
    }
    
    return baseClasses;
  };

  if (hasError) {
    return (
      <div className="image-peek-error">
        <div className="text-center">
          <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>图片加载失败</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 加载状态 */}
      {isLoading && (
        <div className="image-peek-loading" />
      )}
      
      {/* 图片容器 */}
      <div
        ref={containerRef}
        className={getContainerClasses()}
        onClick={handleContainerClick}
        onKeyPress={handleKeyPress}
        tabIndex={0}
        role="button"
        aria-expanded={isExpanded}
        aria-label={`${alt}，点击${isExpanded ? '收起' : '展开'}查看完整图片`}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className={getImageClasses()}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ display: isLoading ? 'none' : 'block' }}
        />
        
        {/* 展开提示 */}
        {showExpandHint && !isExpanded && !isMobile && !isLoading && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
            点击展开
          </div>
        )}
      </div>
      
      {/* 移动端提示 */}
      {isMobile && showExpandHint && !isLoading && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          移动端已自动展开
        </div>
      )}
    </div>
  );
};

export default ImagePeek;