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

// 配置常量
const MASONRY_CONFIG = {
  layout: {
    CARD_WIDTH: 150,
    GAP: 5,
    MIN_COLUMNS: 1,
    MAX_COLUMNS: 5,
    BASE_HEIGHT: 180
  },
  lazyLoad: {
    INITIAL_ITEMS: 20,
    LOAD_THRESHOLD: 200,
    ITEMS_PER_LOAD: 10,
    LOAD_DELAY: 300
  },
  ui: {
    ICON_SIZE: 12
  },
  avatar: {
    // 头像外层容器尺寸 - 从w-16 h-16 (64px)优化为更平衡的尺寸
    CONTAINER_SIZE: 'w-15 h-15', // 60px，减少整体尺寸但保持视觉平衡
    // 头像内层尺寸 - 相应调整以保持比例
    INNER_SIZE: 'w-11 h-11', // 44px，保持合适的内容显示区域
    // 边框宽度 - 从border-2 (8px)减少到border-1 (4px)
    BORDER_WIDTH: 'border-1', // 4px，减少空白区域
    // 分类图标容器
    CATEGORY_ICON: {
      SIZE: 'p-1', // 从p-1.5减少到p-1，与整体缩小保持一致
      BORDER: 'border-1', // 与头像边框保持一致
      POSITION: '-bottom-0.5 -right-0.5' // 微调位置以适应新尺寸
    },
    // 字体大小调整
    FONT_SIZE: 'text-sm', // 从text-base减少，适配较小的头像尺寸
    // 阴影效果
    SHADOW: 'shadow-sm' // 从shadow-md减少，避免视觉过重
  }
};

const MasonryGrid: React.FC<MasonryGridProps> = ({ 
  items, 
  onItemClick, 
  getCategoryColor, 
  categories 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [masonryItems, setMasonryItems] = useState<MasonryItem[]>([]);
  const [containerWidth, setContainerWidth] = useState(0);
  const [visibleItems, setVisibleItems] = useState<number>(MASONRY_CONFIG.lazyLoad.INITIAL_ITEMS);
  const [isLoading, setIsLoading] = useState(false);
  
  // 计算列数
  const getColumnCount = useCallback((width: number) => {
    const availableWidth = width - MASONRY_CONFIG.layout.GAP;
    const possibleColumns = Math.floor(availableWidth / (MASONRY_CONFIG.layout.CARD_WIDTH + MASONRY_CONFIG.layout.GAP));
    return Math.max(MASONRY_CONFIG.layout.MIN_COLUMNS, Math.min(MASONRY_CONFIG.layout.MAX_COLUMNS, possibleColumns));
  }, []);
  
  // 估算卡片高度（纵向长方形，高度大于宽度）
  const estimateCardHeight = useCallback((person: Person) => {
    return MASONRY_CONFIG.layout.BASE_HEIGHT;
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
      columnHeights[shortestColumnIndex] += estimatedHeight + MASONRY_CONFIG.layout.GAP;
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
    
    // 当滚动到距离底部时加载更多
    if (scrollTop + windowHeight >= documentHeight - MASONRY_CONFIG.lazyLoad.LOAD_THRESHOLD) {
      setIsLoading(true);
      setTimeout(() => {
        setVisibleItems(prev => Math.min(prev + MASONRY_CONFIG.lazyLoad.ITEMS_PER_LOAD, items.length));
        setIsLoading(false);
      }, MASONRY_CONFIG.lazyLoad.LOAD_DELAY);
    }
  }, [isLoading, visibleItems, items.length]);
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
  
  // 计算容器高度
  const containerHeight = masonryItems.length > 0 
    ? Math.max(...masonryItems.map(item => item.top + item.height)) + MASONRY_CONFIG.layout.GAP
    : 0;
  
  const columnCount = getColumnCount(containerWidth);
  const columnWidth = containerWidth > 0 
    ? (containerWidth - MASONRY_CONFIG.layout.GAP * (columnCount + 1)) / columnCount 
    : MASONRY_CONFIG.layout.CARD_WIDTH;
  
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
          
          const left = MASONRY_CONFIG.layout.GAP + column * (columnWidth + MASONRY_CONFIG.layout.GAP);
          
          return (
            <div
              key={`${person.id}-${index}`}
              className="absolute bg-gradient-to-br from-cream to-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gold/10 hover:border-gold/20 group hover:bg-gradient-to-br hover:from-gold/5 hover:to-cream"
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
                <div className="relative mb-3">
                  {person.img ? (
                    <div className="relative">
                      {/* 头像外层容器 - 使用配置常量管理尺寸和样式 */}
                      <div className={`${MASONRY_CONFIG.avatar.CONTAINER_SIZE} rounded-full bg-white group-hover:bg-gold/20 ${MASONRY_CONFIG.avatar.BORDER_WIDTH} border-white group-hover:border-gold/30 transition-all duration-300 flex items-center justify-center ${MASONRY_CONFIG.avatar.SHADOW}`}>
                        <img
                          src={person.img}
                          alt={person.name}
                          className={`${MASONRY_CONFIG.avatar.INNER_SIZE} rounded-full object-cover`}
                          loading="lazy"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* 无头像占位符 - 使用配置常量保持与有头像版本的一致性 */}
                      <div className={`${MASONRY_CONFIG.avatar.CONTAINER_SIZE} rounded-full bg-white group-hover:bg-gold/20 ${MASONRY_CONFIG.avatar.BORDER_WIDTH} border-white group-hover:border-gold/30 transition-all duration-300 flex items-center justify-center ${MASONRY_CONFIG.avatar.SHADOW}`}>
                        <div className={`${MASONRY_CONFIG.avatar.INNER_SIZE} rounded-full ${getCategoryColor(person.category)} flex items-center justify-center text-white ${MASONRY_CONFIG.avatar.FONT_SIZE} font-bold`}>
                          {person.name.charAt(0)}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* 分类图标 - 使用配置常量管理位置、尺寸和样式 */}
                  {Icon && (
                    <div className={`absolute ${MASONRY_CONFIG.avatar.CATEGORY_ICON.POSITION} ${getCategoryColor(person.category)} rounded-full ${MASONRY_CONFIG.avatar.CATEGORY_ICON.SIZE} ${MASONRY_CONFIG.avatar.CATEGORY_ICON.BORDER} border-white ${MASONRY_CONFIG.avatar.SHADOW}`}>
                      <Icon size={MASONRY_CONFIG.ui.ICON_SIZE} className="text-white" />
                    </div>
                  )}
                </div>
                
                {/* 姓名 */}
                <h3 className="text-lg font-semibold text-charcoal mb-1.5 group-hover:text-gold transition-colors">
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