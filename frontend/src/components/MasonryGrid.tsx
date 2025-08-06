import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { Person } from '../types/Person';
import '../styles/relationships.css';

// 分类映射：将中文分类名映射为英文类名
const getCategoryClass = (category: string): string => {
  const categoryMap: Record<string, string> = {
    '亲人家属': 'family',
    '新闻出版': 'media', 
    '学术文化': 'academic',
    '政治社会': 'political',
    '邹韬奋': 'all', // 邹韬奋本人归类为all
    'all': 'all'
  };
  return categoryMap[category] || 'all';
};

// 瀑布流配置
const MASONRY_CONFIG = {
  layout: {
    GAP: 16,
    CARD_WIDTH: 280,
    MIN_COLUMNS: 2,
    MAX_COLUMNS: 5,
    BASE_HEIGHT: 200,
    MIN_HEIGHT: 150,
    MAX_HEIGHT: 400,
    HEIGHT_PER_CHAR: 0.8,
    VERTICAL_GAP: 20
  },
  ui: {
    ICON_SIZE: 16,
    DESC_MAX_LENGTH: 150
  },
  lazyLoad: {
    INITIAL_ITEMS: 20,
    ITEMS_PER_LOAD: 10,
    LOAD_THRESHOLD: 200,
    LOAD_DELAY: 300
  }
};

// 简单防抖 hook
function useDebouncedCallback<T extends (...args: unknown[]) => void>(callback: T, delay = 100) {
  const timer = useRef<number | null>(null);
  return useCallback((...args: Parameters<T>) => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
    }
    timer.current = window.setTimeout(() => {
      callback(...args);
      timer.current = null;
    }, delay);
  }, [callback, delay]);
}

interface MasonryGridProps {
  items: Person[];
  onItemClick: (person: Person) => void;
  categories: Array<{ id: string; name: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string }>;
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

    if (person.description) {
      const descLength = person.description.length;
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

  // 主要布局：基于每张卡"真实高度"做瀑布流
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
    <div className="masonry-container">
      <div
        ref={containerRef}
        className="masonry-grid-container"
        style={{ height: containerHeight }}
      >
        {masonryItems.map((item, index) => {
          const { person, column, top } = item;
          const categoryInfo = categories.find(cat => cat.id === person.category);
          const Icon = categoryInfo?.icon;
          const left = MASONRY_CONFIG.layout.GAP + column * (columnWidth + MASONRY_CONFIG.layout.GAP);

          // 统一头像和文字都居中显示
          const avatarPosition = 'position-center'; // 所有头像统一居中
          const textAlign = 'text-align-center'; // 所有文字统一居中
          
          // 添加延迟动画
          const animationDelay = (index * 0.1) % 2;
          
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
              className={`masonry-card-base ${getCategoryClass(person.category)}`}
              style={{
                left: `${left}px`,
                top: `${top}px`,
                width: `${columnWidth}px`,
                animationDelay: `${animationDelay}s`
              }}
              onClick={() => onItemClick(person)}
            >
              <div className="masonry-card-content">
                <div className={`masonry-card-avatar-container ${avatarPosition}`}>
                  {person.img ? (
                    <div className="masonry-card-avatar-wrapper">
                      <div className="masonry-avatar-container">
                        <img
                          src={person.img}
                          alt={person.name}
                          className="masonry-avatar-image"
                          loading="lazy"
                          onLoad={() => {
                            // 图片加载后可能撑高，强制触发一次布局（防抖会合并）
                            triggerLayout();
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="masonry-card-avatar-wrapper">
                      <div className="masonry-avatar-container">
                        <div className={`masonry-avatar-placeholder ${getCategoryClass(person.category)}`}>
                          {person.name.charAt(0)}
                        </div>
                      </div>
                    </div>
                  )}
                  {Icon && (
                    <div className={`masonry-category-icon ${getCategoryClass(person.category)}`}>
                      <Icon size={MASONRY_CONFIG.ui.ICON_SIZE} className="text-white" />
                    </div>
                  )}
                </div>

                <h3 className={`masonry-card-name ${textAlign}`}>
                  {person.name}
                </h3>

                {person.description && (
                  <p className={`masonry-card-description ${textAlign}`}>
                    {person.description.length > MASONRY_CONFIG.ui.DESC_MAX_LENGTH
                      ? `${person.description.substring(0, MASONRY_CONFIG.ui.DESC_MAX_LENGTH)}...`
                      : person.description
                    }
                  </p>
                )}

                <div className={`masonry-category-tag ${getCategoryClass(person.category)}`}>
                  {person.category}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isLoading && (
        <div className="masonry-loading-container">
          <div className="masonry-loading-spinner"></div>
        </div>
      )}

      {visibleItems >= items.length && items.length > 0 && (
        <div className="masonry-complete-container">
          已显示全部 {items.length} 位人物
        </div>
      )}
    </div>
  );
};

export default MasonryGrid;
