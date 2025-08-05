// 时间线事件图片组件 - 专注于图片展示逻辑

import React, { useState } from 'react';
import { BaseTimelineEvent } from '../../../types/timelineTypes';

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
    const baseClasses = 'inline-block object-cover ml-auto rounded-lg transition-transform duration-300 group-hover:scale-105';
    
    // 根据是否为特色事件设置不同的尺寸
    const sizeClasses = isFeatured 
      ? 'max-w-[60%] h-auto transform scale-115 shadow-lg'
      : 'max-w-[50%] h-auto transform scale-85 shadow-md';
    
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
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
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
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg animate-pulse">
          <div className="text-gray-400">
            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
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