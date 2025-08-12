import { useState, useEffect, useRef, useCallback } from 'react';

const INITIAL_VISIBLE_COUNT = 30;
const OBSERVER_ROOT_MARGIN = '800px 0px';

const DEBUG = true; 
const logDebug = (message: string, data?: unknown) => {
  if (DEBUG) {
    console.log(`[InfiniteScroll] ${message}`, data || '');
  }
};

interface UseInfiniteScrollReturn {
  visibleItems: Set<number>;
  loadMoreRef: React.RefObject<HTMLDivElement>;
  setInitialVisibleItems: (items: { id: number }[]) => void;
}

interface UseInfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  displayedDataLength: number;
}

export const useInfiniteScroll = ({
  hasMore,
  isLoading,
  onLoadMore,
  displayedDataLength,
}: UseInfiniteScrollProps): UseInfiniteScrollReturn => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const itemObserverRef = useRef<IntersectionObserver | null>(null);
  const loadMoreObserverRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const prevVisibleItemsRef = useRef<Set<number>>(new Set());

  const updateVisibleItems = useCallback((newItems: Set<number>) => {
    const prevSize = prevVisibleItemsRef.current.size;
    if (newItems.size !== prevSize || ![...newItems].every(id => prevVisibleItemsRef.current.has(id))) {
      logDebug('可见项目已更新', { newCount: newItems.size });
      setVisibleItems(new Set(newItems));
      prevVisibleItemsRef.current = new Set(newItems);
    }
  }, []);

  // 【修改】简化 setInitialVisibleItems，它只负责更新状态
  const setInitialVisibleItems = useCallback((items: { id: number }[]) => {
    const initialVisibleIds = new Set(items.slice(0, INITIAL_VISIBLE_COUNT).map(item => item.id));
    logDebug('设置初始可见项目', { count: initialVisibleIds.size });
    updateVisibleItems(initialVisibleIds);
  }, [updateVisibleItems]);

  useEffect(() => {
    logDebug('创建列表项观察器');
    itemObserverRef.current = new IntersectionObserver(
      (entries) => {
        const newVisibleIds = new Set(prevVisibleItemsRef.current);
        let hasChanges = false;
        entries.forEach((entry) => {
          const itemIdStr = entry.target.getAttribute('data-item-id');
          if (!itemIdStr) return;
          const itemId = parseInt(itemIdStr, 10);
          if (isNaN(itemId)) return;
          if (entry.isIntersecting) {
            if (!newVisibleIds.has(itemId)) {
              newVisibleIds.add(itemId);
              hasChanges = true;
            }
          } else {
            if (newVisibleIds.has(itemId)) {
              newVisibleIds.delete(itemId);
              hasChanges = true;
            }
          }
        });
        if (hasChanges) {
          updateVisibleItems(newVisibleIds);
        }
      },
      { threshold: 0.1, rootMargin: OBSERVER_ROOT_MARGIN }
    );
    return () => itemObserverRef.current?.disconnect();
  }, [updateVisibleItems]);
  
  // 【关键修复】恢复到完全重新观察的逻辑
  useEffect(() => {
    const observer = itemObserverRef.current;
    if (!observer || displayedDataLength === 0) {
      return;
    }
    
    // 1. 断开所有之前的观察，防止重复
    observer.disconnect();
    logDebug('观察器已断开，准备重新观察所有项目...');

    // 2. 获取当前 DOM 中所有的项目
    const allItems = document.querySelectorAll('[data-item-id]');
    
    // 3. 重新观察每一个项目
    allItems.forEach(item => {
      observer.observe(item);
    });

    logDebug(`已重新观察 ${allItems.length} 个项目`);

  }, [displayedDataLength]);

  useEffect(() => {
    if (!hasMore || isLoading) return;
    loadMoreObserverRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          logDebug('触发加载更多');
          onLoadMore();
        }
      },
      { threshold: 1.0, rootMargin: '200px' }
    );
    if (loadMoreRef.current) {
      loadMoreObserverRef.current.observe(loadMoreRef.current);
    }
    return () => loadMoreObserverRef.current?.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  return {
    visibleItems,
    loadMoreRef,
    setInitialVisibleItems,
  };
};