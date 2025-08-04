import React, { useState, useEffect, useRef } from 'react';
import { BookItem } from '../../types/book';

interface BookCardProps {
  item: BookItem;
  isVisible: boolean;
  isRapidScrolling: boolean;
  columnIndex: number;
  onOpenLightbox: (item: BookItem) => void;
}

const DEBUG = true;

const BookCard: React.FC<BookCardProps> = ({ 
  item, 
  isVisible, 
  isRapidScrolling, 
  columnIndex, 
  onOpenLightbox 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const renderCountRef = useRef(0);
  const prevPropsRef = useRef<BookCardProps | null>(null);
  const componentIdRef = useRef(`BookCard-${item.id}-${Math.random().toString(36).substr(2, 9)}`);
  
  // 增加渲染计数
  renderCountRef.current += 1;
  
  const logDebug = (message: string, data?: any) => {
    if (DEBUG) {
      console.log(`[${componentIdRef.current}] ${message}`, data || '');
    }
  };

  // 详细的props变化追踪
  useEffect(() => {
    const currentProps = { item, isVisible, isRapidScrolling, columnIndex };
    
    if (prevPropsRef.current) {
      const changes: string[] = [];
      
      if (prevPropsRef.current.isVisible !== isVisible) {
        changes.push(`isVisible: ${prevPropsRef.current.isVisible} → ${isVisible}`);
      }
      if (prevPropsRef.current.isRapidScrolling !== isRapidScrolling) {
        changes.push(`isRapidScrolling: ${prevPropsRef.current.isRapidScrolling} → ${isRapidScrolling}`);
      }
      if (prevPropsRef.current.item.id !== item.id) {
        changes.push(`item.id: ${prevPropsRef.current.item.id} → ${item.id}`);
      }
      if (prevPropsRef.current.columnIndex !== columnIndex) {
        changes.push(`columnIndex: ${prevPropsRef.current.columnIndex} → ${columnIndex}`);
      }
      
      if (changes.length > 0) {
        logDebug('Props变化导致重新渲染', {
          renderCount: renderCountRef.current,
          changes: changes.join(', '),
          timestamp: Date.now()
        });
      }
    }
    
    prevPropsRef.current = currentProps;
  }, [item, isVisible, isRapidScrolling, columnIndex]);

  // 处理图片加载完成事件
  const handleImageLoad = () => {
    logDebug(`图片加载完成`);
    setImageLoaded(true);
  };

  // 记录组件渲染
  if (DEBUG) {
    logDebug('组件渲染', { 
      renderCount: renderCountRef.current,
      isVisible, 
      isRapidScrolling,
      imageLoaded,
      timestamp: Date.now()
    });
  }

  return (
    <div
      data-item-id={item.id}
      className={`group cursor-pointer transform transition-all ${
        isRapidScrolling ? 'duration-300' : 'duration-700'
      } ${
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-8 opacity-0'
      }`}
      onClick={() => onOpenLightbox(item)}
      style={{
        animationDelay: `${columnIndex * 100}ms`
      }}
    >
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="relative aspect-[3/4] overflow-hidden">
          {/* 图片容器 */}
          <img
            key={`${item.id}-${item.cover_image}`} // 确保图片在item变化时重新加载
            src={item.cover_image}
            alt={item.title}
            className={`w-full h-full object-cover transition-all duration-500 ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
            onLoad={handleImageLoad}
            loading="lazy"
          />
          
          {/* 加载状态 */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-gray-400 text-sm">加载中...</div>
            </div>
          )}
          
          {/* 悬停遮罩 */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
        </div>
        
        {/* 书籍信息 */}
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

// 优化的React.memo比较函数
const arePropsEqual = (prevProps: BookCardProps, nextProps: BookCardProps): boolean => {
  // 基本属性比较
  const isVisibleSame = prevProps.isVisible === nextProps.isVisible;
  const isRapidScrollingSame = prevProps.isRapidScrolling === nextProps.isRapidScrolling;
  const itemIdSame = prevProps.item.id === nextProps.item.id;
  const columnIndexSame = prevProps.columnIndex === nextProps.columnIndex;
  
  // 深度比较item对象的关键属性
  const itemSame = (
    prevProps.item.title === nextProps.item.title &&
    prevProps.item.author === nextProps.item.author &&
    prevProps.item.publisher === nextProps.item.publisher &&
    prevProps.item.year === nextProps.item.year &&
    prevProps.item.cover_image === nextProps.item.cover_image
  );
  
  const shouldSkipRender = isVisibleSame && isRapidScrollingSame && itemIdSame && columnIndexSame && itemSame;
  
  if (DEBUG && !shouldSkipRender) {
    console.log(`[BookCard-${nextProps.item.id}] 组件将重新渲染`, {
      itemId: nextProps.item.id,
      reasons: {
        isVisibleChanged: !isVisibleSame,
        isRapidScrollingChanged: !isRapidScrollingSame,
        itemIdChanged: !itemIdSame,
        columnIndexChanged: !columnIndexSame,
        itemContentChanged: !itemSame
      },
      prevProps: {
        isVisible: prevProps.isVisible,
        isRapidScrolling: prevProps.isRapidScrolling,
        itemId: prevProps.item.id,
        columnIndex: prevProps.columnIndex
      },
      nextProps: {
        isVisible: nextProps.isVisible,
        isRapidScrolling: nextProps.isRapidScrolling,
        itemId: nextProps.item.id,
        columnIndex: nextProps.columnIndex
      },
      timestamp: Date.now()
    });
  }
  
  return shouldSkipRender;
};

export default React.memo(BookCard, arePropsEqual);
