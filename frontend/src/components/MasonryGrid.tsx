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
    CARD_WIDTH: 140, // 进一步增宽卡片宽度
    GAP: 24, // 水平间距（列间距）
    VERTICAL_GAP: 60, // 垂直间距（行间距）
    MIN_COLUMNS: 1,
    MAX_COLUMNS: 4,
    BASE_HEIGHT: 280, // 适当增加基础高度
    HEIGHT_PER_CHAR: 0.6, // 稍微增加每字符高度
    MIN_HEIGHT: 240, // 增加最小卡片高度
    MAX_HEIGHT: 320 // 增加最大卡片高度
  },
  lazyLoad: {
    INITIAL_ITEMS: 20,
    LOAD_THRESHOLD: 200,
    ITEMS_PER_LOAD: 10,
    LOAD_DELAY: 300
  },
  ui: {
    ICON_SIZE: 12,
    DESC_MAX_LENGTH: 100 // 人物简介最大显示字符数
  },
  avatar: {
    // 头像外层容器尺寸 - 增加尺寸提供更好的视觉效果
    CONTAINER_SIZE: 'w-18 h-18', // 72px，增加头像容器尺寸
    // 头像内层尺寸 - 相应调整以保持比例
    INNER_SIZE: 'w-14 h-14', // 56px，增加内容显示区域
    // 边框宽度 - 保持适中的边框
    BORDER_WIDTH: 'border-2', // 8px，恢复合适的边框宽度
    // 分类图标容器
    CATEGORY_ICON: {
      SIZE: 'p-1.5', // 增加图标容器内边距
      BORDER: 'border-2', // 与头像边框保持一致
      POSITION: '-bottom-1 -right-1' // 调整位置适应新尺寸
    },
    // 字体大小调整
    FONT_SIZE: 'text-base', // 恢复正常字体大小
    // 阴影效果
    SHADOW: 'shadow-md' // 恢复适中的阴影效果
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
  
  // 根据人物描述长度动态估算卡片高度，增加随机变化实现交错效果
  const estimateCardHeight = useCallback((person: Person) => {
    let height = MASONRY_CONFIG.layout.BASE_HEIGHT;
    
    // 根据描述长度调整高度
    if (person.desc) {
      const descLength = person.desc.length;
      const additionalHeight = Math.min(
        descLength * MASONRY_CONFIG.layout.HEIGHT_PER_CHAR,
        MASONRY_CONFIG.layout.MAX_HEIGHT - MASONRY_CONFIG.layout.BASE_HEIGHT
      );
      height += additionalHeight;
    }
    
    // 添加基于人物ID的伪随机高度变化，实现更好的交错效果
    const randomSeed = person.id * 9301 + 49297; // 使用简单的线性同余生成器
    const randomFactor = (randomSeed % 1000) / 1000; // 生成0-1之间的伪随机数
    const heightVariation = (randomFactor - 0.5) * 60; // ±30px的高度变化
    height += heightVariation;
    
    // 确保高度在合理范围内
    return Math.max(
      MASONRY_CONFIG.layout.MIN_HEIGHT,
      Math.min(MASONRY_CONFIG.layout.MAX_HEIGHT, height)
    );
  }, []);
  

  
  // 优化的瀑布流布局算法，实现更好的交错排列效果
  const calculateMasonryLayout = useCallback((itemsToLayout: Person[], containerWidth: number) => {
    const columnCount = getColumnCount(containerWidth);
    const columnHeights = new Array(columnCount).fill(0);
    const layoutItems: MasonryItem[] = [];
    
    itemsToLayout.forEach((person, index) => {
      let targetColumnIndex;
      
      // 前几个卡片使用顺序分布，确保每列都有内容
      if (index < columnCount) {
        targetColumnIndex = index;
      } else {
        // 后续卡片使用智能选择策略，平衡最短列和交错效果
        const minHeight = Math.min(...columnHeights);
        const candidateColumns = columnHeights
          .map((height, idx) => ({ idx, height }))
          .filter(col => col.height <= minHeight + 100) // 允许一定的高度差异
          .sort((a, b) => a.height - b.height);
        
        // 在候选列中选择，增加随机性实现交错效果
        const randomSeed = person.id * 7919 + 65537;
        const randomIndex = randomSeed % candidateColumns.length;
        targetColumnIndex = candidateColumns[randomIndex].idx;
      }
      
      const estimatedHeight = estimateCardHeight(person);
      
      layoutItems.push({
        person,
        height: estimatedHeight,
        column: targetColumnIndex,
        top: columnHeights[targetColumnIndex]
      });
      
      // 更新列高度，使用动态间距增强交错效果
      const dynamicGap = MASONRY_CONFIG.layout.VERTICAL_GAP + 
        ((person.id * 1103) % 20) - 10; // ±10px的间距变化
      columnHeights[targetColumnIndex] += estimatedHeight + Math.max(40, dynamicGap);
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
    ? Math.max(...masonryItems.map(item => item.top + item.height)) + MASONRY_CONFIG.layout.VERTICAL_GAP
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
              className="absolute bg-gradient-to-br from-cream to-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gold/10 hover:border-gold/30 group hover:bg-gradient-to-br hover:from-gold/8 hover:to-cream hover:scale-105"
              style={{
                left: `${left}px`,
                top: `${top}px`,
                width: `${columnWidth}px`,
              }}
              onClick={() => onItemClick(person)}
            >
              <div className="flex flex-col items-center text-center">
                {/* 头像或占位符 */}
                <div className="relative mb-4">
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
                <h3 className="text-lg font-semibold text-charcoal mb-2 group-hover:text-gold transition-colors">
                  {person.name}
                </h3>
                
                {/* 人物简介 - 截取前50个字符 */}
                {person.desc && (
                  <p className="text-sm text-gray-600 mb-3 px-1 leading-relaxed">
                    {person.desc.length > MASONRY_CONFIG.ui.DESC_MAX_LENGTH 
                      ? `${person.desc.substring(0, MASONRY_CONFIG.ui.DESC_MAX_LENGTH)}...` 
                      : person.desc
                    }
                  </p>
                )}
                
                {/* 分类标签 */}
                <div className={`px-3 py-1.5 rounded-full text-xs font-medium text-white ${getCategoryColor(person.category)}`}>
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