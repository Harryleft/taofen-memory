import React, { useState, useEffect, useRef } from 'react';
import { BookItem } from '../../types/bookTypes';

//【修改】从 Props 中移除 isRapidScrolling
interface BookCardProps {
  item: BookItem;
  isVisible: boolean;
  columnIndex: number;
  onOpenLightbox: (item: BookItem) => void;
}

const DEBUG = false; // 在生产中建议关闭

const BookCard: React.FC<BookCardProps> = ({ 
  item, 
  isVisible, 
  columnIndex, 
  onOpenLightbox 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const renderCountRef = useRef(0);
  
  //【修改】简化日志，移除 isRapidScrolling
  const logDebug = React.useCallback((message: string, data?: unknown) => {
    if (DEBUG) {
      console.log(`[BookCard-${item.id}] ${message}`, data || '');
    }
  }, [item.id]);

  useEffect(() => {
    // 可以在这里保留一些调试逻辑，但移除对 isRapidScrolling 的追踪
    logDebug('Props变化或渲染', {
        renderCount: renderCountRef.current,
        isVisible,
        timestamp: Date.now()
    });
    renderCountRef.current += 1;
  }, [isVisible, logDebug]);


  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div
      data-item-id={item.id}
      className={`group cursor-pointer transform transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      onClick={() => onOpenLightbox(item)}
      style={{
        animationDelay: `${columnIndex * 0.1}s`
      }}
    >
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <div className="relative overflow-hidden aspect-[3/4]">
          <img
            key={`${item.id}-${item.image}`}
            src={item.image}
            alt={item.title}
            className={`w-full h-full object-cover transition-all duration-300 ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
            onLoad={handleImageLoad}
            loading="lazy"
          />
          
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-gray-400 text-sm">加载中...</div>
            </div>
          )}
          
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm leading-tight">
            {item.title}
          </h3>
          
          <div className="space-y-1 text-xs text-gray-600">
            {item.author && (
              <p className="line-clamp-1">
                <span className="font-medium">作者：</span>{item.author}
              </p>
            )}
            {item.publisher && (
              <p className="line-clamp-1">
                <span className="font-medium">出版：</span>{item.publisher}
              </p>
            )}
            {item.year && (
              <p>
                <span className="font-medium">年份：</span>{item.year}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

//【修改】简化 React.memo 的比较函数
const arePropsEqual = (prevProps: BookCardProps, nextProps: BookCardProps): boolean => {
  // 现在我们只关心 isVisible 和 item 的内容是否发生变化
  if (prevProps.isVisible !== nextProps.isVisible) return false;
  if (prevProps.item.id !== nextProps.item.id) return false;
  
  // 进行浅层比较，如果 item 对象本身没变，我们假设内容也没变
  // 如果需要，可以进行更深度的比较
  if (prevProps.item !== nextProps.item) {
     return (
        prevProps.item.title === nextProps.item.title &&
        prevProps.item.author === nextProps.item.author &&
        prevProps.item.publisher === nextProps.item.publisher &&
        prevProps.item.year === nextProps.item.year &&
        prevProps.item.image === nextProps.item.image
     );
  }

  return true;
};

export default React.memo(BookCard, arePropsEqual);
