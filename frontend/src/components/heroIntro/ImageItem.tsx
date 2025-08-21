import React, { useEffect, useState, useMemo } from 'react';
import { MasonryItem } from '@/services/heroImageService';
import PerformanceMonitor from '@/utils/performanceMonitor';

interface ImageItemProps {
  item: MasonryItem & { calculatedHeight: number };
  columnIndex: number;
  itemIndex: number;
  isVisible: boolean;
  onImageLoad?: (id: number) => void;
  onImageError?: (id: number) => void;
}

// 创建共享的事件处理器以减少内存分配
const createImageHandlers = (itemId: number, itemSrc: string, setImageState: (state: 'loading' | 'loaded' | 'error') => void, onLoad?: (id: number) => void, onError?: (id: number) => void) => {
  const handleLoad = () => {
    PerformanceMonitor.trackImageEnd(itemId, true, false);
    setImageState('loaded');
    onLoad?.(itemId);
  };

  const handleError = () => {
    PerformanceMonitor.trackImageEnd(itemId, false, false);
    setImageState('error');
    onError?.(itemId);
  };

  return { handleLoad, handleError };
};

const ImageItem = React.memo(({ 
  item, 
  isVisible,
  onImageLoad,
  onImageError 
}: ImageItemProps) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');

  // 使用memoized的事件处理器
  const { handleLoad, handleError } = useMemo(
    () => createImageHandlers(item.id, item.src, setImageState, onImageLoad, onImageError),
    [item.id, item.src, setImageState, onImageLoad, onImageError]
  );

  useEffect(() => {
    if (isVisible) {
      PerformanceMonitor.trackImageStart(item.id, item.src);
    }
  }, [item.id, item.src, isVisible]);

  return (
    <div
      className="relative overflow-hidden rounded-lg shadow-lg bg-gray-100"
      style={{ height: `${item.calculatedHeight}px` }}
    >
      {imageState === 'loading' && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {imageState === 'error' && (
        <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
          <span className="text-gray-500 text-sm">加载失败</span>
        </div>
      )}
      
      <img
        src={item.src}
        alt={item.title}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          imageState === 'loaded' ? 'opacity-100' : 'opacity-0'
        }`}
        loading={isVisible ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={isVisible ? "high" : "low"}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
});

ImageItem.displayName = 'ImageItem';

export default ImageItem;