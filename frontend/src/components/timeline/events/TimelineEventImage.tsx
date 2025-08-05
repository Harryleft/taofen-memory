// 时间线事件图片组件 - 专注于图片展示逻辑

import React, { useState } from 'react';
import { BaseTimelineEvent } from '../../../types/timelineTypes';
import styles from '../styles/timelineStyles.module.css';

interface TimelineEventImageProps {
  event: BaseTimelineEvent;
  isFeatured?: boolean;
  className?: string;
  onImageLoad?: () => void;
  onImageError?: (error: Event) => void;
}

const TimelineEventImage: React.FC<TimelineEventImageProps> = ({ 
  event, 
  isFeatured = false,
  className = '',
  onImageLoad,
  onImageError
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // 如果没有图片，不渲染组件
  if (!event.image) {
    return null;
  }

  // 样式计算逻辑
  const getImageStyles = () => {
    const baseClasses = styles.eventImage;
    const sizeClasses = isFeatured ? styles.eventImageFeatured : styles.eventImageRegular;
    
    return `${baseClasses} ${sizeClasses}`;
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageLoaded(true);
    onImageLoad?.();
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageError(true);
    onImageError?.(e.nativeEvent);
  };

  // 如果图片加载失败，显示占位符
  if (imageError) {
    return (
      <div className={`${styles.eventImageError} ${className}`}>
        <div className="text-center p-4">
          <div className="text-gray-400 mb-2">
            <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-xs text-gray-500">图片加载失败</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      {/* 加载状态指示器 */}
      {!imageLoaded && (
        <div className={styles.eventImageLoading}>
          <div className={styles.imageLoadingSpinner}></div>
        </div>
      )}
      
      {/* 实际图片 */}
      <img
        src={event.image}
        alt={event.title || event.experience.substring(0, 50) + '...'}
        className={getImageStyles()}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{ opacity: imageLoaded ? 1 : 0 }}
      />
      
      {/* 图片悬浮信息 */}
      {imageLoaded && (
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-end justify-start opacity-0 group-hover:opacity-100">
          <div className="p-2 text-white text-xs bg-black bg-opacity-50 rounded-br-lg rounded-tl-lg">
            {event.time} · {event.location}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineEventImage;