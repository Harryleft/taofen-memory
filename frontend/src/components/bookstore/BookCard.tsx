import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn } from 'lucide-react';
import { BookItem } from '../../types/bookTypes';

interface BookCardProps {
  item: BookItem;
  isVisible: boolean;
  isRapidScrolling: boolean;
  columnIndex: number;
  onOpenLightbox: (item: BookItem) => void;
}

// 添加调试常量
const DEBUG = true;
const logDebug = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[BookCard] ${message}`, data || '');
  }
};

const BookCard: React.FC<BookCardProps> = ({
  item,
  isVisible,
  isRapidScrolling,
  columnIndex,
  onOpenLightbox
}) => {
  // 添加图片加载状态
  const [imageLoaded, setImageLoaded] = useState(false);
  // 添加渲染计数器，用于调试
  const renderCountRef = useRef(0);
  // 添加上一次可见性状态引用，用于比较
  const prevVisibleRef = useRef(isVisible);

  // 组件渲染时增加计数器
  renderCountRef.current += 1;
  
  // 当可见性变化时记录日志
  useEffect(() => {
    const visibilityChanged = prevVisibleRef.current !== isVisible;
    if (visibilityChanged) {
      logDebug(`项目 ${item.id} 可见性变化`, { 
        isVisible, 
        isRapidScrolling, 
        renderCount: renderCountRef.current,
        prevVisible: prevVisibleRef.current
      });
      prevVisibleRef.current = isVisible;
    }
  }, [isVisible, isRapidScrolling, item.id]);

  // 处理图片加载完成事件
  const handleImageLoad = () => {
    logDebug(`项目 ${item.id} 图片加载完成`);
    setImageLoaded(true);
  };

  // 记录组件渲染
  if (DEBUG) {
    console.log(`[BookCard] 渲染项目 ${item.id}`, { 
      renderCount: renderCountRef.current,
      isVisible, 
      isRapidScrolling 
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
      <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-amber-200 relative">
        <div className="relative overflow-hidden">
          {/* 使用 key 属性确保图片在 id 变化时重新加载 */}
          <img
            key={`img-${item.id}`}
            src={item.image}
            alt={item.title}
            className={`w-full object-cover group-hover:scale-110 transition-transform duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{ 
              height: `${item.dimensions.height}px`,
              transition: 'opacity 0.5s ease-in-out'
            }}
            loading="lazy"
            onLoad={handleImageLoad}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
            <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={32} />
          </div>
          
          <div className="absolute bottom-3 left-3">
            <div className="relative">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-lg"></div>
              <div className="relative px-3 py-1.5 text-white">
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 bg-gold rounded-full"></div>
                  <span className="text-xs font-medium tracking-wide">
                    {item.year}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-amber-50">
          <h3 className="font-bold text-charcoal mb-2 group-hover:text-gold transition-colors line-clamp-2" style={{fontFamily: "'KaiTi', 'STKaiti', '华文楷体', serif", letterSpacing: '0.02em'}}>
            {item.title}
          </h3>
          <p className="text-sm text-charcoal/70 mb-1" style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif"}}>
            作者：{item.author}
          </p>
          <p className="text-sm text-charcoal/70 mb-2" style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif"}}>
            出版：{item.publisher}
          </p>
        </div>
      </div>
    </div>
  );
};

// 使用 React.memo 包装组件，添加自定义比较函数以减少不必要的重新渲染
export default React.memo(BookCard, (prevProps, nextProps) => {
  // 只有在这些属性发生变化时才重新渲染
  const shouldRerender = (
    prevProps.isVisible !== nextProps.isVisible ||
    prevProps.isRapidScrolling !== nextProps.isRapidScrolling ||
    prevProps.item.id !== nextProps.item.id
  );
  
  if (DEBUG && shouldRerender) {
    console.log(`[BookCard] 组件将重新渲染`, {
      id: nextProps.item.id,
      isVisibleChanged: prevProps.isVisible !== nextProps.isVisible,
      isRapidScrollingChanged: prevProps.isRapidScrolling !== nextProps.isRapidScrolling,
      itemIdChanged: prevProps.item.id !== nextProps.item.id
    });
  }
  
  return !shouldRerender;
});
