import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { BookItem } from '../types/bookTypes';

// 基于第一性原理的虚拟化滚动常量
const VIEWPORT_BUFFER = 2; // 视口上下各保留2屏内容
const ITEM_HEIGHT_ESTIMATE = 300; // 预估每个项目高度
const SCROLL_DEBOUNCE = 16; // 60fps对应的防抖时间

interface VirtualizedScrollState {
  scrollTop: number;
  viewportHeight: number;
  totalHeight: number;
  startIndex: number;
  endIndex: number;
  visibleItems: BookItem[];
}

interface UseVirtualizedScrollProps {
  items: BookItem[];
  columnCount: number;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

interface UseVirtualizedScrollReturn {
  virtualState: VirtualizedScrollState;
  containerRef: React.RefObject<HTMLDivElement>;
  scrollElementRef: React.RefObject<HTMLDivElement>;
  getItemStyle: (index: number) => React.CSSProperties;
  isItemVisible: (index: number) => boolean;
}

/**
 * 基于第一性原理重新设计的虚拟化滚动钩子
 * 
 * 核心原理：
 * 1. 只渲染视口内及缓冲区的内容
 * 2. 通过绝对定位模拟完整列表的滚动效果
 * 3. 最小化状态更新，只在必要时重新计算
 */
export const useVirtualizedScroll = ({
  items,
  columnCount,
  onLoadMore,
  hasMore = false
}: UseVirtualizedScrollProps): UseVirtualizedScrollReturn => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<number | null>(null);
  const itemHeightsRef = useRef<Map<number, number>>(new Map());
  
  const [virtualState, setVirtualState] = useState<VirtualizedScrollState>({
    scrollTop: 0,
    viewportHeight: 0,
    totalHeight: 0,
    startIndex: 0,
    endIndex: 0,
    visibleItems: []
  });

  // 计算每行的项目数量（基于列数）
  const rowCount = Math.ceil(items.length / columnCount);
  
  // 计算虚拟化参数
  const calculateVirtualization = useCallback((scrollTop: number, viewportHeight: number) => {
    if (rowCount === 0) {
      return {
        startIndex: 0,
        endIndex: 0,
        visibleItems: [],
        totalHeight: 0
      };
    }

    // 计算可见行的范围
    const startRow = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT_ESTIMATE) - VIEWPORT_BUFFER);
    const endRow = Math.min(
      rowCount - 1,
      Math.ceil((scrollTop + viewportHeight) / ITEM_HEIGHT_ESTIMATE) + VIEWPORT_BUFFER
    );

    // 转换为项目索引
    const startIndex = startRow * columnCount;
    const endIndex = Math.min(items.length - 1, (endRow + 1) * columnCount - 1);
    
    // 获取可见项目
    const visibleItems = items.slice(startIndex, endIndex + 1);
    
    // 计算总高度
    const totalHeight = rowCount * ITEM_HEIGHT_ESTIMATE;

    return {
      startIndex,
      endIndex,
      visibleItems,
      totalHeight
    };
  }, [items, columnCount, rowCount]);

  // 防抖的滚动处理函数
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const scrollTop = containerRef.current.scrollTop;
    const viewportHeight = containerRef.current.clientHeight;
    
    // 清除之前的防抖定时器
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // 设置新的防抖定时器
    scrollTimeoutRef.current = setTimeout(() => {
      const newVirtualization = calculateVirtualization(scrollTop, viewportHeight);
      
      setVirtualState(prev => ({
        ...prev,
        scrollTop,
        viewportHeight,
        ...newVirtualization
      }));

      // 检查是否需要加载更多数据
      if (hasMore && onLoadMore && scrollTop + viewportHeight >= newVirtualization.totalHeight * 0.8) {
        onLoadMore();
      }
    }, SCROLL_DEBOUNCE);
  }, [calculateVirtualization, hasMore, onLoadMore]);

  // 获取项目的样式（用于绝对定位）
  const getItemStyle = useCallback((index: number): React.CSSProperties => {
    const row = Math.floor(index / columnCount);
    const col = index % columnCount;
    
    return {
      position: 'absolute',
      top: row * ITEM_HEIGHT_ESTIMATE,
      left: `${(col / columnCount) * 100}%`,
      width: `${100 / columnCount}%`,
      height: ITEM_HEIGHT_ESTIMATE,
    };
  }, [columnCount]);

  // 检查项目是否可见
  const isItemVisible = useCallback((index: number): boolean => {
    return index >= virtualState.startIndex && index <= virtualState.endIndex;
  }, [virtualState.startIndex, virtualState.endIndex]);

  // 初始化和响应容器大小变化
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const viewportHeight = container.clientHeight;
    
    const initialVirtualization = calculateVirtualization(0, viewportHeight);
    
    setVirtualState({
      scrollTop: 0,
      viewportHeight,
      ...initialVirtualization
    });
  }, [calculateVirtualization]);

  // 添加滚动事件监听器
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  return {
    virtualState,
    containerRef,
    scrollElementRef,
    getItemStyle,
    isItemVisible
  };
};