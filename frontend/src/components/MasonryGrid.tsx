import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Person } from '../types/Person';

interface MasonryGridProps {
  items: Person[];
  onItemClick: (person: Person) => void;
  getCategoryColor: (category: string) => string;
  categories: Array<{ id: string; name: string; icon: React.ComponentType<any>; color: string }>;
}

interface MasonryItem {
  person: Person;
  height: number;
  column: number;
  top: number;
}

const MasonryGrid: React.FC<MasonryGridProps> = ({ 
  items, 
  onItemClick, 
  getCategoryColor, 
  categories 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [masonryItems, setMasonryItems] = useState<MasonryItem[]>([]);
  const [containerWidth, setContainerWidth] = useState(0);
  const [visibleItems, setVisibleItems] = useState<number>(20); // 懒加载初始数量
  const [isLoading, setIsLoading] = useState(false);
  
  // 卡片基础配置
  const CARD_WIDTH = 280;
  const GAP = 24;
  const MIN_COLUMNS = 1;
  const MAX_COLUMNS = 5;
  
  // 计算列数
  const getColumnCount = useCallback((width: number) => {
    const availableWidth = width - GAP;
    const possibleColumns = Math.floor(availableWidth / (CARD_WIDTH + GAP));
    return Math.max(MIN_COLUMNS, Math.min(MAX_COLUMNS, possibleColumns));
  }, []);
  
  // 估算卡片高度（统一高度，不再基于内容长度）
  const estimateCardHeight = useCallback((person: Person) => {
    const baseHeight = 200; // 统一基础高度
    return baseHeight;
  }, []);
  
  // 瀑布流布局算法
  const calculateMasonryLayout = useCallback((itemsToLayout: Person[], containerWidth: number) => {
    const columnCount = getColumnCount(containerWidth);
    const columnHeights = new Array(columnCount).fill(0);
    const layoutItems: MasonryItem[] = [];
    
    itemsToLayout.forEach((person) => {
      // 找到最短的列
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      const estimatedHeight = estimateCardHeight(person);
      
      layoutItems.push({
        person,
        height: estimatedHeight,
        column: shortestColumnIndex,
        top: columnHeights[shortestColumnIndex]
      });
      
      // 更新列高度
      columnHeights[shortestColumnIndex] += estimatedHeight + GAP;
    });
    
    return layoutItems;
  }, [getColumnCount, estimateCardHeight]);
  
  // 监听容器宽度变化
  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    
    updateContainerWidth();
    window.addEventListener('resize', updateContainerWidth);
    return () => window.removeEventListener('resize', updateContainerWidth);
  }, []);
  
  // 重新计算布局
  useEffect(() => {
    if (containerWidth > 0) {
      const visiblePersons = items.slice(0, visibleItems);
      const layoutItems = calculateMasonryLayout(visiblePersons, containerWidth);
      setMasonryItems(layoutItems);
    }
  }, [items, containerWidth, visibleItems, calculateMasonryLayout]);
  
  // 懒加载处理
  const handleScroll = useCallback(() => {
    if (isLoading || visibleItems >= items.length) return;
    
    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // 当滚动到距离底部200px时加载更多
    if (scrollTop + windowHeight >= documentHeight - 200) {
      setIsLoading(true);
      setTimeout(() => {
        setVisibleItems(prev => Math.min(prev + 10, items.length));
        setIsLoading(false);
      }, 300);
    }
  }, [isLoading, visibleItems, items.length]);
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
  
  // 计算容器高度
  const containerHeight = masonryItems.length > 0 
    ? Math.max(...masonryItems.map(item => item.top + item.height)) + GAP
    : 0;
  
  const columnCount = getColumnCount(containerWidth);
  const columnWidth = containerWidth > 0 
    ? (containerWidth - GAP * (columnCount + 1)) / columnCount 
    : CARD_WIDTH;
  
  return (
    <div className="w-full">
      <div 
        ref={containerRef}
        className="relative"
        style={{ height: containerHeight }}
      >
        {masonryItems.map((item, index) => {
          const { person, column, top } = item;
          const categoryInfo = categories.find(cat => cat.id === person.category);
          const Icon = categoryInfo?.icon;
          
          const left = GAP + column * (columnWidth + GAP);
          
          return (
            <div
              key={`${person.id}-${index}`}
              className="absolute bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-gray-200 group"
              style={{
                left: `${left}px`,
                top: `${top}px`,
                width: `${columnWidth}px`,
                transform: 'translateZ(0)', // 硬件加速
              }}
              onClick={() => onItemClick(person)}
            >
              <div className="flex flex-col items-center text-center">
                {/* 头像或占位符 */}
                <div className="relative mb-4">
                  {person.img ? (
                    <img
                      src={person.img}
                      alt={person.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 group-hover:border-gray-300 transition-colors"
                      loading="lazy"
                    />
                  ) : (
                    <div className={`w-20 h-20 rounded-full ${getCategoryColor(person.category)} flex items-center justify-center text-white text-2xl font-bold`}>
                      {person.name.charAt(0)}
                    </div>
                  )}
                  {/* 分类图标 */}
                  {Icon && (
                    <div className={`absolute -bottom-1 -right-1 ${getCategoryColor(person.category)} rounded-full p-2 border-2 border-white`}>
                      <Icon size={16} className="text-white" />
                    </div>
                  )}
                </div>
                
                {/* 姓名 */}
                <h3 className="text-lg font-semibold text-charcoal mb-2 group-hover:text-gold transition-colors">
                  {person.name}
                </h3>
                
                {/* 分类标签 */}
                <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(person.category)}`}>
                  {person.category}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* 加载更多指示器 */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
        </div>
      )}
      
      {/* 已加载完所有内容 */}
      {visibleItems >= items.length && items.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          已显示全部 {items.length} 位人物
        </div>
      )}
    </div>
  );
};

export default MasonryGrid;