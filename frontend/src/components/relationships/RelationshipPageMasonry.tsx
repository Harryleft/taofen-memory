import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { Person } from '@/types/Person.ts';
import VirtualScrollMasonry from './VirtualScrollMasonry.tsx';
import { tagMatcher, hasValidDescription } from '@/utils/tagMatcher';
import { RELATIONSHIPS_CONFIG } from '@/constants/relationshipsConstants';
import '@/styles/relationships.css';

// 安全的描述显示函数，确保不会显示"0"或其他无效值
const renderSafeDescription = (description: string | undefined, maxLength: number) => {
  // 首先检查是否为 undefined 或 null
  if (description === undefined || description === null) {
    return null;
  }
  
  // 处理可能的非字符串值（防御性编程）
  if (typeof description !== 'string') {
    // 如果是数字0，直接过滤
    if (description === 0) {
      return null;
    }
    // 尝试转换为字符串，但保持防御性
    try {
      description = String(description);
    } catch {
      return null;
    }
  }
  
  // 然后使用 hasValidDescription 进行验证
  if (!hasValidDescription(description)) {
    return null;
  }
  
  // 三重保护，确保即使有遗漏的数据也不会显示"0"
  const desc = description || '';
  const trimmed = desc.trim();
  
  // 明确过滤掉各种形式的"0"和无效值
  if (trimmed === '0' || trimmed === '' || trimmed === 'null' || trimmed === 'undefined' || trimmed === 'false' || trimmed === 'true') {
    return null;
  }
  
  // 防止纯数字或符号被意外显示
  if (/^[\d\s\W]+$/.test(trimmed) && trimmed.length < 2) {
    return null;
  }
  
  if (trimmed.length > maxLength) {
    return `${trimmed.substring(0, maxLength)}...`;
  }
  
  return trimmed;
};

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
    CARD_WIDTH: 300,
    MIN_COLUMNS: 1, // 移动端允许单列
    MAX_COLUMNS: 4,
    BASE_HEIGHT: 360,
    MIN_HEIGHT: 340,
    MAX_HEIGHT: 400,
    HEIGHT_PER_CHAR: 0.8,
    VERTICAL_GAP: 20,
    // 响应式配置
    RESPONSIVE: {
      mobile: {
        BREAKPOINT: 480,
        CARD_WIDTH: 180,
        GAP: 12,
        VERTICAL_GAP: 16,
        BASE_HEIGHT: 216,
        DESC_MAX_LENGTH: 100,
        MIN_CARD_WIDTH: 160, // 移动端最小卡片宽度
        MAX_COLUMNS: 2, // 移动端最大2列
        MIN_HEIGHT: 200, // 移动端最小卡片高度
        PADDING: 8 // 移动端内边距
      },
      tablet: {
        BREAKPOINT: 768,
        CARD_WIDTH: 240,
        GAP: 14,
        VERTICAL_GAP: 18,
        BASE_HEIGHT: 288,
        DESC_MAX_LENGTH: 120,
        MIN_CARD_WIDTH: 220,
        MAX_COLUMNS: 3,
        MIN_HEIGHT: 280, // 平板端最小卡片高度
        PADDING: 12
      },
      desktop: {
        BREAKPOINT: 1024,
        CARD_WIDTH: 300,
        GAP: 16,
        VERTICAL_GAP: 20,
        BASE_HEIGHT: 360,
        DESC_MAX_LENGTH: 150,
        MIN_CARD_WIDTH: 280,
        MAX_COLUMNS: 4,
        MIN_HEIGHT: 340, // 桌面端最小卡片高度
        PADDING: 16
      }
    }
  },
  ui: {
    ICON_SIZE: 16,
    DESC_MAX_LENGTH: 150
  },
  lazyLoad: {
    INITIAL_ITEMS: 20,
    ITEMS_PER_LOAD: 10,
    LOAD_THRESHOLD: 200,
    LOAD_DELAY: 300,
    // 移动端减少初始加载数量
    MOBILE_INITIAL_ITEMS: 12,
    MOBILE_ITEMS_PER_LOAD: 8
  },
  // 虚拟滚动配置
  virtualScroll: {
    ENABLED: true,
    ITEM_HEIGHT: 200,
    BUFFER_SIZE: 5,
    ENABLE_THRESHOLD: 100 // 当项目数超过此值时启用虚拟滚动
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
  onTagClick?: (tag: { kind: 'type' | 'aspect'; value: string }) => void;
  selectedTypes?: string[];
  selectedAspects?: string[];
}

interface MasonryItem {
  person: Person;
  height: number;
  column: number;
  top: number;
}

const RelationshipPageMasonry: React.FC<MasonryGridProps> = ({
  items,
  onItemClick,
  categories,
  onTagClick,
  selectedTypes = [],
  selectedAspects = []
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [masonryItems, setMasonryItems] = useState<MasonryItem[]>([]);
  const [containerWidth, setContainerWidth] = useState(0);
  const [visibleItems, setVisibleItems] = useState<number>(() => {
    const isMobile = window.innerWidth <= MASONRY_CONFIG.layout.RESPONSIVE.mobile.BREAKPOINT;
    return isMobile ? MASONRY_CONFIG.lazyLoad.MOBILE_INITIAL_ITEMS : MASONRY_CONFIG.lazyLoad.INITIAL_ITEMS;
  });
  const [isLoading, setIsLoading] = useState(false);

  // 每张卡的 DOM ref 集合
  const cardRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());
  // 记录每张卡当前高度，用于比较变化
  const measuredHeights = useRef<Map<number, number>>(new Map());

  // 获取当前设备的响应式配置
  const getResponsiveConfig = useCallback(() => {
    const width = window.innerWidth;
    if (width <= MASONRY_CONFIG.layout.RESPONSIVE.mobile.BREAKPOINT) {
      return MASONRY_CONFIG.layout.RESPONSIVE.mobile;
    } else if (width <= MASONRY_CONFIG.layout.RESPONSIVE.tablet.BREAKPOINT) {
      return MASONRY_CONFIG.layout.RESPONSIVE.tablet;
    } else if (width <= MASONRY_CONFIG.layout.RESPONSIVE.desktop.BREAKPOINT) {
      return MASONRY_CONFIG.layout.RESPONSIVE.desktop;
    }
    return null; // 使用默认配置
  }, []);

  // 计算列数 - 优化以充分利用屏幕空间
  const getColumnCount = useCallback((width: number) => {
    const responsiveConfig = getResponsiveConfig();
    const gap = responsiveConfig?.GAP || MASONRY_CONFIG.layout.GAP;
    const cardWidth = responsiveConfig?.CARD_WIDTH || MASONRY_CONFIG.layout.CARD_WIDTH;
    const minCardWidth = responsiveConfig?.MIN_CARD_WIDTH || cardWidth;
    const maxColumns = responsiveConfig?.MAX_COLUMNS || MASONRY_CONFIG.layout.MAX_COLUMNS;
    const padding = responsiveConfig?.PADDING || 0;
    
    // 计算可用宽度（考虑内边距）
    const availableWidth = width - (padding * 2) - gap;
    
    // 动态计算最小卡片宽度，根据屏幕大小调整
    const effectiveMinWidth = Math.min(minCardWidth, Math.max(140, width / 4));
    const possibleColumns = Math.floor(availableWidth / (effectiveMinWidth + gap));
    
    // 移动端优先单列，但允许最多2列
    const minColumns = responsiveConfig ? 1 : MASONRY_CONFIG.layout.MIN_COLUMNS;
    
    return Math.max(minColumns, Math.min(maxColumns, possibleColumns));
  }, [getResponsiveConfig]);

  // 估算用于初始快速占位（防闪烁）
  const estimateCardHeight = useCallback((person: Person) => {
    const responsiveConfig = getResponsiveConfig();
    const baseHeight = responsiveConfig?.BASE_HEIGHT || MASONRY_CONFIG.layout.BASE_HEIGHT;
    const descMaxLength = responsiveConfig?.DESC_MAX_LENGTH || MASONRY_CONFIG.ui.DESC_MAX_LENGTH;
    
    let height = baseHeight;

    if (hasValidDescription(person.description)) {
      const descLength = Math.min(person.description.length, descMaxLength);
      const additionalHeight = Math.min(
        descLength * MASONRY_CONFIG.layout.HEIGHT_PER_CHAR,
        MASONRY_CONFIG.layout.MAX_HEIGHT - baseHeight
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
  }, [getResponsiveConfig]);

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

  // 更新 container 宽度 - 增强获取方式
  useEffect(() => {
    const updateContainerWidth = () => {
      let width = 0;
      
      if (containerRef.current) {
        // 尝试多种方式获取容器宽度
        const offsetWidth = containerRef.current.offsetWidth;
        const clientWidth = containerRef.current.clientWidth;
        const scrollWidth = containerRef.current.scrollWidth;
        const rectWidth = containerRef.current.getBoundingClientRect().width;
        
        // 使用最大的有效宽度
        width = Math.max(offsetWidth, clientWidth, scrollWidth, rectWidth);
        
        // 移动端特殊处理：考虑视口宽度和滚动条
        const responsiveConfig = getResponsiveConfig();
        if (responsiveConfig) {
          const padding = responsiveConfig.PADDING || 0;
          const viewportWidth = window.innerWidth - (padding * 2);
          width = Math.min(width, viewportWidth);
        }
        
        console.log('Masonry Debug: Container width updated:', {
          width,
          offsetWidth,
          clientWidth,
          scrollWidth,
          rectWidth,
          viewportWidth: window.innerWidth,
          responsiveConfig: responsiveConfig ? 'mobile' : 'desktop'
        });
      } else {
        // 如果容器ref不存在，使用窗口宽度作为后备
        const responsiveConfig = getResponsiveConfig();
        const padding = responsiveConfig?.PADDING || 24;
        width = window.innerWidth - padding; // 减去页面padding
        console.log('Masonry Debug: Using window width as fallback:', width);
      }
      
      if (width > 0) {
        setContainerWidth(width);
      }
    };
    
    // 初始更新
    updateContainerWidth();
    
    // 延迟再次更新，确保DOM完全渲染
    const timeoutId = setTimeout(() => {
      updateContainerWidth();
    }, 100);
    
    // 再次延迟更新，确保所有样式都已应用
    const timeoutId2 = setTimeout(() => {
      updateContainerWidth();
    }, 300);
    
    // 使用防抖优化resize事件
    const debouncedUpdate = debounce(updateContainerWidth, 100);
    window.addEventListener('resize', debouncedUpdate);
    return () => {
      window.removeEventListener('resize', debouncedUpdate);
      clearTimeout(timeoutId);
      clearTimeout(timeoutId2);
    };
  }, [getResponsiveConfig]);

  // 防抖函数
  const debounce = <T extends (...args: unknown[]) => void>(func: T, wait: number) => {
    let timeout: number;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => func(...args), wait);
    };
  };

  // 防抖的重新布局
  const triggerLayout = useDebouncedCallback(() => {
    console.log('Masonry Debug: Trigger layout called with:', {
      containerWidth,
      itemsLength: items.length,
      visibleItems,
      columnCount: getColumnCount(containerWidth)
    });
    
    if (containerWidth <= 0) {
      console.warn('Masonry Debug: Container width is 0, attempting to recalculate');
      // 强制重新计算宽度
      if (containerRef.current) {
        const newWidth = containerRef.current.offsetWidth;
        if (newWidth > 0) {
          console.log('Masonry Debug: Found new width:', newWidth);
          setContainerWidth(newWidth);
          return;
        }
      }
      return;
    }
    
    const visiblePersons = items.slice(0, visibleItems);
    const effectiveWidth = containerWidth > 0 ? containerWidth : 1200; // 默认宽度
    const layoutItems = calculateMasonryLayout(visiblePersons, effectiveWidth);
    console.log('Masonry Debug: Layout calculated:', {
      visiblePersonsLength: visiblePersons.length,
      layoutItemsLength: layoutItems.length,
      containerHeight: Math.max(...layoutItems.map(item => item.top + item.height)) + MASONRY_CONFIG.layout.VERTICAL_GAP,
      effectiveWidth
    });
    setMasonryItems(layoutItems);
  }, 80);

  // 初始和依赖更新时布局：包括 items、宽度、visibleItems
  useEffect(() => {
    triggerLayout();
  }, [items, containerWidth, visibleItems, calculateMasonryLayout, triggerLayout]);

  // 专门处理容器宽度为0的情况
  useEffect(() => {
    if (containerWidth <= 0 && containerRef.current) {
      console.log('Masonry Debug: Container width is 0, trying to recover...');
      
      // 尝试多种方式获取宽度
      const recoverWidth = () => {
        if (!containerRef.current) return;
        
        const width = containerRef.current.offsetWidth;
        const clientWidth = containerRef.current.clientWidth;
        const scrollWidth = containerRef.current.scrollWidth;
        
        console.log('Masonry Debug: Width recovery attempt:', {
          width,
          clientWidth,
          scrollWidth
        });
        
        // 使用任何可用的宽度
        const availableWidth = Math.max(width, clientWidth, scrollWidth);
        if (availableWidth > 0) {
          setContainerWidth(availableWidth);
        }
      };
      
      // 立即尝试
      recoverWidth();
      
      // 延迟再尝试
      const timeoutId = setTimeout(recoverWidth, 200);
      return () => clearTimeout(timeoutId);
    }
  }, [containerWidth]);

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

  // 触摸手势状态
  const touchState = useRef({
    startX: 0,
    startY: 0,
    startTime: 0,
    currentCard: null as HTMLDivElement | null,
    isSwiping: false,
    isDragging: false,
    lastTapTime: 0,
    tapCount: 0
  });

  // 处理触摸开始事件
  const handleTouchStart = useCallback((e: React.TouchEvent, card: HTMLDivElement) => {
    const touch = e.touches[0];
    const currentTime = Date.now();
    
    // 检测双击（防止误触）
    const timeSinceLastTap = currentTime - touchState.current.lastTapTime;
    if (timeSinceLastTap < 300) {
      touchState.current.tapCount++;
    } else {
      touchState.current.tapCount = 1;
    }
    touchState.current.lastTapTime = currentTime;
    
    touchState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: currentTime,
      currentCard: card,
      isSwiping: false,
      isDragging: false,
      lastTapTime: currentTime,
      tapCount: touchState.current.tapCount
    };
    
    // 添加触摸反馈
    card.style.transform = 'scale(0.98)';
    card.style.transition = 'transform 0.1s ease';
    
    // 防止默认行为
    e.preventDefault();
  }, []);

  // 处理触摸移动事件
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchState.current.currentCard) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchState.current.startX;
    const deltaY = touch.clientY - touchState.current.startY;
    // const deltaTime = Date.now() - touchState.current.startTime; // 保留用于未来的性能优化
    
    // 判断是否为滑动
    const totalDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (totalDistance > 8) {
      touchState.current.isDragging = true;
      
      // 判断是否为横向滑动
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 15) {
        touchState.current.isSwiping = true;
        
        // 添加滑动视觉反馈
        const card = touchState.current.currentCard;
        const maxSwipe = 120;
        const opacity = 1 - Math.min(Math.abs(deltaX) / maxSwipe, 0.6);
        const scale = 1 - Math.min(Math.abs(deltaX) / maxSwipe, 0.1);
        
        card.style.transform = `translateX(${deltaX * 0.8}px) scale(${scale})`;
        card.style.opacity = opacity.toString();
        card.style.transition = 'none';
      }
    }
    
    // 防止页面滚动
    if (touchState.current.isSwiping) {
      e.preventDefault();
    }
  }, []);

  // 处理触摸结束事件
  const handleTouchEnd = useCallback((e: React.TouchEvent, person: Person) => {
    if (!touchState.current.currentCard) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchState.current.startX;
    const deltaY = touch.clientY - touchState.current.startY;
    const deltaTime = Date.now() - touchState.current.startTime;
    const card = touchState.current.currentCard;
    
    // 重置卡片样式
    card.style.transform = '';
    card.style.opacity = '';
    card.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    
    // 计算滑动速度和距离
    const velocity = Math.abs(deltaX) / deltaTime;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // 如果是快速滑动且距离足够，则打开详情
    if (touchState.current.isSwiping && Math.abs(deltaX) > 40 && deltaTime < 400 && velocity > 0.2) {
      onItemClick(person);
    } 
    // 如果是轻触且没有拖动，则打开详情（但防止双击误触）
    else if (!touchState.current.isDragging && distance < 8 && touchState.current.tapCount === 1) {
      // 延迟执行以确保不是双击
      setTimeout(() => {
        if (touchState.current.tapCount === 1) {
          onItemClick(person);
        }
      }, 200);
    }
    
    touchState.current = {
      startX: 0,
      startY: 0,
      startTime: 0,
      currentCard: null,
      isSwiping: false,
      isDragging: false,
      lastTapTime: 0,
      tapCount: 0
    };
  }, [onItemClick]);

  // 懒加载滚动
  const handleScroll = useCallback(() => {
    if (isLoading || visibleItems >= items.length) return;

    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const responsiveConfig = getResponsiveConfig();
    const isMobile = !!responsiveConfig;
    
    // 移动端优化：根据网络状况调整加载策略
    const loadThreshold = isMobile ? MASONRY_CONFIG.lazyLoad.LOAD_THRESHOLD * 2 : MASONRY_CONFIG.lazyLoad.LOAD_THRESHOLD;
    const itemsPerLoad = isMobile ? MASONRY_CONFIG.lazyLoad.MOBILE_ITEMS_PER_LOAD : MASONRY_CONFIG.lazyLoad.ITEMS_PER_LOAD;
    
    // 网络状况检测（简化版）
    const navConn = (navigator as unknown as { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
    const isSlowNetwork = navConn ? 
      (navConn.effectiveType?.includes('2g') ?? false) || 
      (navConn.saveData ?? false) : false;
    
    // 根据网络状况调整延迟
    const loadDelay = isSlowNetwork ? MASONRY_CONFIG.lazyLoad.LOAD_DELAY * 2 : MASONRY_CONFIG.lazyLoad.LOAD_DELAY;
    
    // 更智能的加载阈值计算
    const effectiveThreshold = isMobile ? 
      Math.max(loadThreshold, windowHeight * 0.3) : 
      loadThreshold;

    if (scrollTop + windowHeight >= documentHeight - effectiveThreshold) {
      setIsLoading(true);
      
      // 使用 requestAnimationFrame 优化性能
      requestAnimationFrame(() => {
        setTimeout(() => {
          setVisibleItems(prev => Math.min(prev + itemsPerLoad, items.length));
          setIsLoading(false);
        }, loadDelay);
      });
    }
  }, [isLoading, visibleItems, items.length, getResponsiveConfig]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // 容器高度由当前 layout item 决定
  const containerHeight = masonryItems.length > 0
    ? Math.max(...masonryItems.map(item => item.top + item.height)) + MASONRY_CONFIG.layout.VERTICAL_GAP
    : 0;

  // 确保有一个有效的容器宽度，即使计算失败
  const effectiveContainerWidth = containerWidth > 0 ? containerWidth : 1200; // 默认宽度
  const responsiveConfig = getResponsiveConfig();
  const columnCount = getColumnCount(effectiveContainerWidth);
  const gap = responsiveConfig?.GAP || MASONRY_CONFIG.layout.GAP;
  const columnWidth = effectiveContainerWidth > 0
    ? (effectiveContainerWidth - gap * (columnCount + 1)) / columnCount
    : responsiveConfig?.CARD_WIDTH || MASONRY_CONFIG.layout.CARD_WIDTH;

  // 判断是否使用虚拟滚动
  const shouldUseVirtualScroll = false; // 暂时禁用虚拟滚动，修复容器高度为0的问题
  // MASONRY_CONFIG.virtualScroll.ENABLED && 
  // items.length > MASONRY_CONFIG.virtualScroll.ENABLE_THRESHOLD;

  // 虚拟滚动容器高度
  // const virtualScrollContainerHeight = window.innerHeight - 200; // 减去头部和筛选器的高度

  return (
    <div className="masonry-container">
      {shouldUseVirtualScroll ? (
        <VirtualScrollMasonry
          items={items}
          onItemClick={onItemClick}
          categories={categories}
          itemHeight={MASONRY_CONFIG.virtualScroll.ITEM_HEIGHT}
          gap={gap}
          containerWidth={effectiveContainerWidth}
          columnCount={columnCount}
        />
      ) : (
        <div
          ref={containerRef}
          className="masonry-grid-container"
          style={{ height: containerHeight }}
        >
        {masonryItems.map((item, index) => {
          const { person, column, top } = item;
          const categoryInfo = categories.find(cat => cat.id === person.category);
          const Icon = categoryInfo?.icon;
          const left = gap + column * (columnWidth + gap);

          // 统一头像和文字都居中显示
          const avatarPosition = 'position-center'; // 所有头像统一居中
          const textAlign = 'text-align-center'; // 所有文字统一居中
          
          // 添加动画类名和延迟
          const shouldAnimate = index < visibleItems;
          
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
              className={`masonry-card-base ${getCategoryClass(person.category)} ${shouldAnimate ? 'animate-in' : ''}`}
              style={{
                left: `${left}px`,
                top: `${top}px`,
                width: `${columnWidth}px`,
                // 移动端优化：增大触摸区域
                minHeight: responsiveConfig?.BASE_HEIGHT || MASONRY_CONFIG.layout.BASE_HEIGHT
              }}
              onClick={() => onItemClick(person)}
              onTouchStart={(e) => {
                const card = e.currentTarget;
                handleTouchStart(e, card);
              }}
              onTouchMove={handleTouchMove}
              onTouchEnd={(e) => handleTouchEnd(e, person)}
              // 移动端优化：添加触摸反馈属性
              onTouchCancel={(e) => {
                const card = e.currentTarget;
                card.style.transform = '';
                card.style.opacity = '';
                touchState.current = {
                  startX: 0,
                  startY: 0,
                  startTime: 0,
                  currentCard: null,
                  isSwiping: false,
                  isDragging: false,
                  lastTapTime: 0,
                  tapCount: 0
                };
              }}
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

                {(() => {
                  const maxLength = responsiveConfig?.DESC_MAX_LENGTH || MASONRY_CONFIG.ui.DESC_MAX_LENGTH;
                  const descriptionText = renderSafeDescription(person.description, maxLength);
                  return descriptionText ? (
                    <p className={`masonry-card-description ${textAlign}`}>
                      {descriptionText}
                    </p>
                  ) : null;
                })()}

                {(person.extra?.tags?.relationshipTypes?.length || person.extra?.tags?.aspects?.length) && (
                  <div className="masonry-card-tags">
                    {person.extra?.tags?.relationshipTypes?.slice(0, 2).map((t) => {
                      // 检查是否为强匹配、弱匹配或无匹配
                      let matchType: 'strong' | 'weak' | 'none' = 'none';
                      for (const selectedType of selectedTypes) {
                        if (t === selectedType) {
                          matchType = 'strong';
                          break;
                        }
                        const similarity = tagMatcher.semanticSimilarity(selectedType, t);
                        if (similarity >= RELATIONSHIPS_CONFIG.tagMatcher.thresholds.strong) {
                          matchType = 'strong';
                          break;
                        } else if (similarity >= RELATIONSHIPS_CONFIG.tagMatcher.thresholds.weak) {
                          matchType = 'weak';
                        }
                      }
                      
                      const styleClass = matchType === 'strong' 
                        ? "masonry-tag-type strong-match"
                        : matchType === 'weak'
                        ? "masonry-tag-type weak-match"
                        : "masonry-tag-default";
                      
                      return (
                        <button
                          key={`type-${person.id}-${t}`}
                          className={styleClass}
                          onClick={(e) => {
                            e.stopPropagation();
                            onTagClick && onTagClick({ kind: 'type', value: t });
                          }}
                          title={matchType === 'weak' ? '模糊匹配' : undefined}
                        >
                          {t}
                        </button>
                      );
                    })}
                    {person.extra?.tags?.aspects?.slice(0, 2).map((a) => {
                      // 检查是否为强匹配、弱匹配或无匹配
                      let matchType: 'strong' | 'weak' | 'none' = 'none';
                      for (const selectedAspect of selectedAspects) {
                        if (a === selectedAspect) {
                          matchType = 'strong';
                          break;
                        }
                        const similarity = tagMatcher.semanticSimilarity(selectedAspect, a);
                        if (similarity >= RELATIONSHIPS_CONFIG.tagMatcher.thresholds.strong) {
                          matchType = 'strong';
                          break;
                        } else if (similarity >= RELATIONSHIPS_CONFIG.tagMatcher.thresholds.weak) {
                          matchType = 'weak';
                        }
                      }
                      
                      const styleClass = matchType === 'strong' 
                        ? "masonry-tag-aspect strong-match"
                        : matchType === 'weak'
                        ? "masonry-tag-aspect weak-match"
                        : "masonry-tag-default";
                      
                      return (
                        <button
                          key={`aspect-${person.id}-${a}`}
                          className={styleClass}
                          onClick={(e) => {
                            e.stopPropagation();
                            onTagClick && onTagClick({ kind: 'aspect', value: a });
                          }}
                          title={matchType === 'weak' ? '模糊匹配' : undefined}
                        >
                          {a}
                        </button>
                      );
                    })}
                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>
      )}

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

export default RelationshipPageMasonry;
