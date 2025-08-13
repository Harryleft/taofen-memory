import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (container.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!startY.current || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;

      if (diff > 0 && container.scrollTop === 0) {
        e.preventDefault();
        
        // 移动端优化：使用非线性阻尼
        const maxDistance = 100;
        const threshold = 60;
        
        // 非线性阻尼：开始时容易拉动，后期变难
        let distance;
        if (diff < threshold) {
          distance = diff * 0.6;
        } else {
          distance = threshold * 0.6 + (diff - threshold) * 0.3;
        }
        
        distance = Math.min(distance, maxDistance);
        
        setPullDistance(distance);
        setCanRefresh(distance > threshold);
      }
    };

    const handleTouchEnd = async () => {
      if (canRefresh && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }
      setPullDistance(0);
      setCanRefresh(false);
      startY.current = 0;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, canRefresh, isRefreshing]);

  return (
    <div 
      ref={containerRef}
      className="relative overflow-y-auto h-full"
      style={{
        // 移动端优化
        '-webkit-overflow-scrolling': 'touch',
        'scroll-behavior': 'smooth'
      }}
    >
      {/* 下拉刷新指示器 */}
      <div 
        className="absolute left-0 right-0 top-0 flex flex-col items-center justify-end transition-transform duration-300 pointer-events-none z-10"
        style={{
          height: '120px',
          transform: `translateY(${-120 + pullDistance}px)`,
        }}
      >
        <div className={`
          w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center mb-4
          transition-all duration-300
          ${canRefresh ? 'scale-110 bg-blue-50 shadow-blue-200' : ''}
          ${isRefreshing ? 'animate-spin' : ''}
        `}>
          <RefreshCw 
            size={22} 
            className={`
              transition-colors duration-300
              ${canRefresh ? 'text-blue-500' : 'text-gray-400'}
            `}
          />
        </div>
        <p className={`
          text-sm font-medium transition-colors duration-300
          ${canRefresh ? 'text-blue-500' : 'text-gray-400'}
        `}>
          {isRefreshing ? '刷新中...' : canRefresh ? '释放立即刷新' : '下拉刷新'}
        </p>
        <div className="text-xs text-gray-400 mt-1">
          {isRefreshing ? '正在加载数据...' : ''}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;