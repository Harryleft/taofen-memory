import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { Person } from '../types/Person';

// 简单防抖 hook
function useDebouncedCallback<T extends (...args: any[]) => void>(callback: T, delay = 100) {
  const timer = useRef<number | null>(null);
  return useCallback((...args: Parameters<T>) => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
    }
    // @ts-ignore
    timer.current = window.setTimeout(() => {
      callback(...args);
      timer.current = null;
    }, delay);
  }, [callback, delay]);
}

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

const MASONRY_CONFIG = {
  layout: {
    CARD_WIDTH: 140,
    GAP: 24,
    VERTICAL_GAP: 65,
    MIN_COLUMNS: 1,
    MAX_COLUMNS: 4,
    // 估算仍可用于初始占位，但不会决定最终布局
    BASE_HEIGHT: 280,
    HEIGHT_PER_CHAR: 0.6,
    MIN_HEIGHT: 240,
    MAX_HEIGHT: 320
  },
  lazyLoad: {
    INITIAL_ITEMS: 20,
    LOAD_THRESHOLD: 200,
    ITEMS_PER_LOAD: 10,
    LOAD_DELAY: 300
  },
  ui: {
    ICON_SIZE: 12,
    DESC_MAX_LENGTH: 100
  },
  avatar: {
    CONTAINER_SIZE: 'w-18 h-18',
    INNER_SIZE: 'w-14 h-14',
    BORDER_WIDTH: 'border-2',
    CATEGORY_ICON: {
      SIZE: 'p-1.5',
      BORDER: 'border-2',
      POSITION: '-bottom-1 -right-1'
    },
    FONT_SIZE: 'text-base',
    SHADOW: 'shadow-md'
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

  // 每张卡的 DOM ref 集合
  const cardRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());
  // 记录每张卡当前高度，用于比较变化
  const measuredHeights = useRef<Map<number, number>>(new Map());

  // 计算列数
  const getColumnCount = useCallback((width: number) => {
    const availableWidth = width - MASONRY_CONFIG.layout.GAP;
    const possibleColumns = Math.floor(availableWidth / (MASONRY_CONFIG.layout.CARD_WIDTH + MASONRY_CONFIG.layout.GAP));
    return Math.max(MASONRY_CONFIG.layout.MIN_COLUMNS, Math.min(MASONRY_CONFIG.layout.MAX_COLUMNS, possibleColumns));
  }, []);

  // 估算用于初始快速占位（防闪烁）
  const estimateCardHeight = useCallback((person: Person) => {
    let height = MASONRY_CONFIG.layout.BASE_HEIGHT;

    if (person.desc) {
      const descLength = person.desc.length;
      const additionalHeight = Math.min(
        descLength * MASONRY_CONFIG.layout.HEIGHT_PER_CHAR,
        MASONRY_CONFIG.layout.MAX_HEIGHT - MASONRY_CONFIG.layout.BASE_HEIGHT
      );
      height += additionalHeight;
    }

    const randomSeed = person.id * 9301 + 49297;
    const randomFactor = (randomSeed % 1000) / 1000;
    const heightVariation = (randomFactor - 0.5) * 60;
    height += heightVariation;

    return Math.max(
      MASONRY_CONFIG.layout.MIN_HEIGHT,
      Math.min(MASONRY_CONFIG.layout.MAX_HEIGHT, height)
    );
  }, []);

  // 主要布局：基于每张卡“真实高度”做瀑布流
  const calculateMasonryLayout = useCallback((persons: Person[], width: number) => {
    const columnCount = getColumnCount(width);
    const columnHeights = new Array(columnCount).fill(0);
    const layoutItems: MasonryItem[] = [];

    persons.forEach((person, index) => {
      let targetColumnIndex: number;

      if (index < columnCount) {
        targetColumnIndex = index;
      } else {
        const minHeight = Math.min(...columnHeights);
        const candidateColumns = columnHeights
          .map((height, idx) => ({ idx, height }))
          .filter(col => col.height <= minHeight + 100)
          .sort((a, b) => a.height - b.height);

        const randomSeed = person.id * 7919 + 65537;
        const randomIndex = candidateColumns.length
          ? randomSeed % candidateColumns.length
          : 0;
        targetColumnIndex = candidateColumns[randomIndex]?.idx ?? 0;
      }

      // 优先采用真实测量高度，fallback 用估算
      const measured = measuredHeights.current.get(person.id);
      const height = typeof measured === 'number'
        ? measured
        : estimateCardHeight(person);

      layoutItems.push({
        person,
        height,
        column: targetColumnIndex,
        top: columnHeights[targetColumnIndex]
      });

      const dynamicGap = MASONRY_CONFIG.layout.VERTICAL_GAP +
        ((person.id * 1103) % 20) - 10; // ±10px
      columnHeights[targetColumnIndex] += height + Math.max(40, dynamicGap);
    });

    return layoutItems;
  }, [estimateCardHeight, getColumnCount]);

  // 更新 container 宽度
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

  // 防抖的重新布局
  const triggerLayout = useDebouncedCallback(() => {
    if (containerWidth <= 0) return;
    const visiblePersons = items.slice(0, visibleItems);
    const layoutItems = calculateMasonryLayout(visiblePersons, containerWidth);
    setMasonryItems(layoutItems);
  }, 80);

  // 初始和依赖更新时布局：包括 items、宽度、visibleItems
  useEffect(() => {
    triggerLayout();
  }, [items, containerWidth, visibleItems, calculateMasonryLayout, triggerLayout]);

  // 监听每个卡片尺寸变化
  useLayoutEffect(() => {
    // 观察每个可见卡
    const observers: ResizeObserver[] = [];
    const visiblePersons = items.slice(0, visibleItems);
    visiblePersons.forEach(person => {
      const card = cardRefs.current.get(person.id);
      if (card) {
        const ro = new ResizeObserver(entries => {
          for (const entry of entries) {
            const newH = entry.contentRect.height;
            const prevH = measuredHeights.current.get(person.id);
            if (prevH !== newH) {
              measuredHeights.current.set(person.id, newH);
              // 触发重新布局（防抖整合多次发生）
              triggerLayout();
            }
          }
        });
        ro.observe(card);
        observers.push(ro);
      }
    });

    return () => {
      observers.forEach(o => o.disconnect());
    };
  }, [items, visibleItems, triggerLayout]);

  // 懒加载滚动
  const handleScroll = useCallback(() => {
    if (isLoading || visibleItems >= items.length) return;

    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight >= documentHeight - MASONRY_CONFIG.lazyLoad.LOAD_THRESHOLD) {
      setIsLoading(true);
      setTimeout(() => {
        setVisibleItems(prev => Math.min(prev + MASONRY_CONFIG.lazyLoad.ITEMS_PER_LOAD, items.length));
        setIsLoading(false);
      }, MASONRY_CONFIG.lazyLoad.LOAD_DELAY);
    }
  }, [isLoading, visibleItems, items.length]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // 容器高度由当前 layout item 决定
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
        {masonryItems.map((item) => {
          const { person, column, top } = item;
          const categoryInfo = categories.find(cat => cat.id === person.category);
          const Icon = categoryInfo?.icon;
          const left = MASONRY_CONFIG.layout.GAP + column * (columnWidth + MASONRY_CONFIG.layout.GAP);

          return (
            <div
              key={person.id}
              ref={(el) => {
                if (el) {
                  cardRefs.current.set(person.id, el);
                } else {
                  cardRefs.current.delete(person.id);
                }
              }}
              className="absolute bg-gradient-to-br from-cream to-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gold/10 hover:border-gold/30 group hover:bg-gradient-to-br hover:from-gold/8 hover:to-cream hover:scale-105"
              style={{
                left: `${left}px`,
                top: `${top}px`,
                width: `${columnWidth}px`,
              }}
              onClick={() => onItemClick(person)}
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  {person.img ? (
                    <div className="relative">
                      <div className={`${MASONRY_CONFIG.avatar.CONTAINER_SIZE} rounded-full bg-white group-hover:bg-gold/20 ${MASONRY_CONFIG.avatar.BORDER_WIDTH} border-white group-hover:border-gold/30 transition-all duration-300 flex items-center justify-center ${MASONRY_CONFIG.avatar.SHADOW}`}>
                        <img
                          src={person.img}
                          alt={person.name}
                          className={`${MASONRY_CONFIG.avatar.INNER_SIZE} rounded-full object-cover`}
                          loading="lazy"
                          onLoad={() => {
                            // 图片加载后可能撑高，强制触发一次布局（防抖会合并）
                            triggerLayout();
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className={`${MASONRY_CONFIG.avatar.CONTAINER_SIZE} rounded-full bg-white group-hover:bg-gold/20 ${MASONRY_CONFIG.avatar.BORDER_WIDTH} border-white group-hover:border-gold/30 transition-all duration-300 flex items-center justify-center ${MASONRY_CONFIG.avatar.SHADOW}`}>
                        <div className={`${MASONRY_CONFIG.avatar.INNER_SIZE} rounded-full ${getCategoryColor(person.category)} flex items-center justify-center text-white ${MASONRY_CONFIG.avatar.FONT_SIZE} font-bold`}>
                          {person.name.charAt(0)}
                        </div>
                      </div>
                    </div>
                  )}
                  {Icon && (
                    <div className={`absolute ${MASONRY_CONFIG.avatar.CATEGORY_ICON.POSITION} ${getCategoryColor(person.category)} rounded-full ${MASONRY_CONFIG.avatar.CATEGORY_ICON.SIZE} ${MASONRY_CONFIG.avatar.CATEGORY_ICON.BORDER} border-white ${MASONRY_CONFIG.avatar.SHADOW}`}>
                      <Icon size={MASONRY_CONFIG.ui.ICON_SIZE} className="text-white" />
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-charcoal mb-2 group-hover:text-gold transition-colors">
                  {person.name}
                </h3>

                {person.desc && (
                  <p className="text-sm text-gray-600 mb-3 px-1 leading-relaxed">
                    {person.desc.length > MASONRY_CONFIG.ui.DESC_MAX_LENGTH
                      ? `${person.desc.substring(0, MASONRY_CONFIG.ui.DESC_MAX_LENGTH)}...`
                      : person.desc
                    }
                  </p>
                )}

                <div className={`px-3 py-1.5 rounded-full text-xs font-medium text-white ${getCategoryColor(person.category)}`}>
                  {person.category}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
        </div>
      )}

      {visibleItems >= items.length && items.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          已显示全部 {items.length} 位人物
        </div>
      )}
    </div>
  );
};

export default MasonryGrid;
