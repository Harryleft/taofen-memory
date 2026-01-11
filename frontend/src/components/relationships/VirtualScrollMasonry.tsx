import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Person } from '@/types/Person.ts';
import { getSafeDescriptionLength } from '@/utils/personDescription';
import PersonDescription from '@/components/PersonDescription.tsx';


interface VirtualScrollMasonryProps {
  items: Person[];
  onItemClick: (person: Person) => void;
  categories: Array<{ id: string; name: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string }>;
  itemHeight: number;
  gap: number;
  containerWidth: number;
  columnCount: number;
}

interface VirtualItem {
  person: Person;
  index: number;
  column: number;
  top: number;
  height: number;
}

const VirtualScrollMasonry: React.FC<VirtualScrollMasonryProps> = ({
  items,
  onItemClick,
  categories,
  itemHeight,
  gap,
  containerWidth,
  columnCount
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // 计算每列的宽度
  const columnWidth = (containerWidth - gap * (columnCount + 1)) / columnCount;

  // 计算所有项目的布局
  const layoutItems = useMemo(() => {
    const columnHeights = new Array(columnCount).fill(0);
    const virtualItems: VirtualItem[] = [];

    items.forEach((person, index) => {
      // 找到最短的列
      const minHeight = Math.min(...columnHeights);
      const columnIndex = columnHeights.indexOf(minHeight);

      // 计算项目高度（这里简化处理，实际应该根据内容计算）
      const descLength = getSafeDescriptionLength(person.description);
      const height = itemHeight + (descLength * 0.5);

      virtualItems.push({
        person,
        index,
        column: columnIndex,
        top: columnHeights[columnIndex],
        height
      });

      // 更新列高度
      columnHeights[columnIndex] += height + gap;
    });

    return {
      items: virtualItems,
      totalHeight: Math.max(...columnHeights)
    };
  }, [items, columnCount, itemHeight, gap]);

  // 更新容器高度和检测移动端
  useEffect(() => {
    const updateContainer = () => {
      if (containerRef.current) {
        // 使用多种方式获取容器高度
        const height = Math.max(
          containerRef.current.clientHeight,
          containerRef.current.offsetHeight,
          window.innerHeight - 327, // 减去头部高度
          400 // 最小高度
        );
        setContainerHeight(height);
        setIsMobile(window.innerWidth <= 768);
        
        console.log('VirtualScroll Debug: Container height updated:', {
          clientHeight: containerRef.current.clientHeight,
          offsetHeight: containerRef.current.offsetHeight,
          calculatedHeight: height,
          windowInnerHeight: window.innerHeight,
          isMobile: window.innerWidth <= 768
        });
      }
    };
    
    updateContainer();
    // 添加延迟确保DOM完全渲染
    const timeoutId = setTimeout(updateContainer, 100);
    
    window.addEventListener('resize', updateContainer);
    
    return () => {
      window.removeEventListener('resize', updateContainer);
      clearTimeout(timeoutId);
    };
  }, []);

  // 处理滚动事件
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const newScrollTop = containerRef.current.scrollTop;
      setScrollTop(newScrollTop);
      
      // 移动端滚动性能优化
      if (isMobile) {
        // 使用 requestAnimationFrame 优化滚动性能
        requestAnimationFrame(() => {
          // 可以在这里添加滚动优化逻辑
        });
      }
    }
  }, [isMobile]);

  // 计算可见区域
  const visibleRange = useMemo(() => {
    // 移动端增加缓冲区以减少白屏
    const bufferSize = isMobile ? 8 : 5;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
    const endIndex = Math.min(
      layoutItems.items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + bufferSize
    );
    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, itemHeight, layoutItems.items.length, isMobile]);

  // 过滤出可见的项目
  const visibleItems = layoutItems.items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);

  // 分类映射
  const getCategoryClass = (category: string): string => {
    const categoryMap: Record<string, string> = {
      '亲人家属': 'family',
      '新闻出版': 'media', 
      '学术文化': 'academic',
      '政治社会': 'political',
      '邹韬奋': 'all',
      'all': 'all'
    };
    return categoryMap[category] || 'all';
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-y-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div
        ref={contentRef}
        style={{
          height: layoutItems.totalHeight,
          position: 'relative',
          width: '100%'
        }}
      >
        {visibleItems.map((item) => {
          const categoryInfo = categories.find(cat => cat.id === item.person.category);
          const Icon = categoryInfo?.icon;
          const left = gap + item.column * (columnWidth + gap);

          return (
            <div
              key={item.person.id}
              className={`absolute cursor-pointer overflow-hidden masonry-card-base animate-in ${isMobile ? 'mobile-optimized' : ''}`}
              style={{
                left: `${left}px`,
                top: `${item.top}px`,
                width: `${columnWidth}px`,
                height: `${item.height}px`,
                // 移动端优化
                minHeight: isMobile ? '140px' : undefined
              }}
              onClick={() => onItemClick(item.person)}
              // 移动端触摸优化
              onTouchStart={(e) => {
                if (isMobile) {
                  const card = e.currentTarget;
                  card.style.transform = 'scale(0.98)';
                  card.style.transition = 'transform 0.1s ease';
                }
              }}
              onTouchEnd={(e) => {
                if (isMobile) {
                  const card = e.currentTarget;
                  card.style.transform = '';
                  card.style.transition = 'transform 0.3s ease';
                }
              }}
            >
              <div className="masonry-card-content p-4">
                <div className="masonry-card-avatar-container position-center mb-3">
                  {item.person.img ? (
                    <div className="masonry-card-avatar-wrapper">
                      <div className="masonry-avatar-container w-12 h-12">
                        <img
                          src={item.person.img}
                          alt={item.person.name}
                          className="masonry-avatar-image"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="masonry-card-avatar-wrapper">
                      <div className="masonry-avatar-container w-12 h-12">
                        <div className={`masonry-avatar-placeholder ${getCategoryClass(item.person.category)}`}>
                          {item.person.name && item.person.name !== '未知人物' ? item.person.name.charAt(0) : '?'}
                        </div>
                      </div>
                    </div>
                  )}
                  {Icon && (
                    <div className={`masonry-category-icon ${getCategoryClass(item.person.category)}`}>
                      <Icon size={14} className="text-white" />
                    </div>
                  )}
                </div>

                <h3 className="masonry-card-name text-align-center text-base mb-2">
                  {item.person.name}
                </h3>

                <PersonDescription 
                  description={item.person.description}
                  maxLength={80}
                  className="masonry-card-description text-align-center text-sm"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VirtualScrollMasonry;