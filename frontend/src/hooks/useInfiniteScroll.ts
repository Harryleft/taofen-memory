import { useState, useEffect, useRef, useCallback } from 'react';

const SCROLL_SPEED_THRESHOLD = 30;
const SCROLL_RESET_DELAY = 1500; // 增加延迟时间，减少频繁状态切换
const INITIAL_VISIBLE_COUNT = 20;
const VISIBILITY_DELAY = 100;
const OBSERVER_DELAY = 20;

// 添加调试常量
const DEBUG = true;
const logDebug = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[InfiniteScroll] ${message}`, data || '');
  }
};

interface UseInfiniteScrollReturn {
  visibleItems: Set<number>;
  isRapidScrolling: boolean;
  loadMoreRef: React.RefObject<HTMLDivElement>;
  invalidateCache: () => void;
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
  displayedDataLength
}: UseInfiniteScrollProps): UseInfiniteScrollReturn => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const [isRapidScrolling, setIsRapidScrolling] = useState(false);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreObserverRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const cardElementsCacheRef = useRef<NodeListOf<Element> | null>(null);
  const cacheValidRef = useRef(false);
  const timersRef = useRef<{
    scroll: number | null;
    visibility: number | null;
    loadMore: number | null;
  }>({ scroll: null, visibility: null, loadMore: null });

  // 添加上次可见项目集合的引用，用于比较
  const prevVisibleItemsRef = useRef<Set<number>>(new Set());

  const getCachedCardElements = useCallback(() => {
    if (!cacheValidRef.current || !cardElementsCacheRef.current) {
      logDebug('缓存无效，重新获取卡片元素');
      cardElementsCacheRef.current = document.querySelectorAll('[data-item-id]');
      cacheValidRef.current = true;
      logDebug('获取到卡片元素数量', cardElementsCacheRef.current.length);
    }
    return cardElementsCacheRef.current;
  }, []);

  const invalidateCache = useCallback(() => {
    logDebug('缓存已标记为无效');
    cacheValidRef.current = false;
  }, []);

  const setInitialVisibleItems = useCallback((items: { id: number }[]) => {
    const initialVisibleIds = new Set(items.slice(0, INITIAL_VISIBLE_COUNT).map(item => item.id));
    logDebug('设置初始可见项目', Array.from(initialVisibleIds));
    setVisibleItems(initialVisibleIds);
    prevVisibleItemsRef.current = new Set(initialVisibleIds);
  }, []);

  const cleanupTimers = useCallback(() => {
    Object.values(timersRef.current).forEach(timer => {
      if (timer) clearTimeout(timer);
    });
    timersRef.current = { scroll: null, visibility: null, loadMore: null };
    logDebug('清理所有定时器');
  }, []);

  const cleanupObservers = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      logDebug('断开交叉观察器连接');
    }
    if (loadMoreObserverRef.current) {
      loadMoreObserverRef.current.disconnect();
      logDebug('断开加载更多观察器连接');
    }
  }, []);

  // 优化可见性状态更新逻辑
  const updateVisibleItems = useCallback((newItems: Set<number>) => {
    // 检查是否有实际变化
    let hasChanges = false;
    const prevSize = prevVisibleItemsRef.current.size;
    
    // 检查是否有新增项
    newItems.forEach(id => {
      if (!prevVisibleItemsRef.current.has(id)) {
        hasChanges = true;
      }
    });
    
    // 检查是否有移除项
    prevVisibleItemsRef.current.forEach(id => {
      if (!newItems.has(id)) {
        hasChanges = true;
      }
    });
    
    // 只有在有变化时才更新状态
    if (hasChanges || newItems.size !== prevSize) {
      logDebug('更新可见项目', {
        prevCount: prevSize,
        newCount: newItems.size,
        added: Array.from(newItems).filter(id => !prevVisibleItemsRef.current.has(id)),
        removed: Array.from(prevVisibleItemsRef.current).filter(id => !newItems.has(id))
      });
      setVisibleItems(new Set(newItems));
      prevVisibleItemsRef.current = new Set(newItems);
    } else {
      logDebug('可见项目无变化，跳过更新');
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollSpeed = Math.abs(currentScrollY - lastScrollY.current);
      lastScrollY.current = currentScrollY;
      
      if (scrollSpeed > SCROLL_SPEED_THRESHOLD) {
        logDebug('检测到快速滚动', scrollSpeed);
        // 防抖：只有在当前不是快速滚动状态时才设置为true
        if (!isRapidScrolling) {
          setIsRapidScrolling(true);
        }
        const viewportHeight = window.innerHeight;
        const scrollTop = window.scrollY;
        const triggerZone = scrollTop + viewportHeight + 400;
        
        const cardElements = getCachedCardElements();
        const newVisibleIds = new Set<number>();
        
        cardElements.forEach((element) => {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + scrollTop;
          
          if (elementTop < triggerZone && rect.top < viewportHeight && rect.bottom > 0) {
            const itemIdStr = element.getAttribute('data-item-id');
            if (itemIdStr) {
              const itemId = parseInt(itemIdStr, 10);
              if (!isNaN(itemId)) {
                newVisibleIds.add(itemId);
              }
            }
          }
        });
        
        updateVisibleItems(newVisibleIds);
      }
      
      // 清除之前的重置定时器
      if (timersRef.current.scroll) {
        clearTimeout(timersRef.current.scroll);
      }
      
      // 设置新的重置定时器，只有在当前是快速滚动状态时才需要重置
      if (isRapidScrolling || scrollSpeed > SCROLL_SPEED_THRESHOLD) {
        timersRef.current.scroll = setTimeout(() => {
          logDebug('重置快速滚动状态');
          setIsRapidScrolling(false);
        }, SCROLL_RESET_DELAY);
      }
    };

    logDebug('添加滚动事件监听器');
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      logDebug('移除滚动事件监听器');
      window.removeEventListener('scroll', handleScroll);
      if (timersRef.current.scroll) {
        clearTimeout(timersRef.current.scroll);
        timersRef.current.scroll = null;
      }
    };
  }, [getCachedCardElements, updateVisibleItems]);

  useEffect(() => {
    logDebug('创建交叉观察器');
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const newVisibleIds = new Set(prevVisibleItemsRef.current);
        let hasChanges = false;
        
        entries.forEach((entry) => {
          const itemIdStr = entry.target.getAttribute('data-item-id');
          if (itemIdStr) {
            const itemId = parseInt(itemIdStr, 10);
            if (!isNaN(itemId)) {
              if (entry.isIntersecting) {
                if (!newVisibleIds.has(itemId)) {
                  newVisibleIds.add(itemId);
                  hasChanges = true;
                  logDebug('交叉观察器检测到新可见项目', itemId);
                }
              } else {
                if (newVisibleIds.has(itemId)) {
                  newVisibleIds.delete(itemId);
                  hasChanges = true;
                  logDebug('交叉观察器检测到项目不再可见', itemId);
                }
              }
            }
          }
        });
        
        if (hasChanges) {
          updateVisibleItems(newVisibleIds);
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    return () => {
      logDebug('清理交叉观察器');
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [updateVisibleItems]);

  useEffect(() => {
    if (displayedDataLength === 0) {
      logDebug('没有显示数据，跳过加载更多观察器设置');
      return;
    }
    
    logDebug('设置加载更多观察器', { hasMore, isLoading });
    const loadMoreObserver = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoading) {
          logDebug('触发加载更多');
          onLoadMore();
        }
      },
      { threshold: 1.0, rootMargin: '300px' }
    );

    timersRef.current.loadMore = setTimeout(() => {
      if (loadMoreRef.current) {
        loadMoreObserver.observe(loadMoreRef.current);
        logDebug('开始观察加载更多元素');
      }
    }, VISIBILITY_DELAY);
    
    loadMoreObserverRef.current = loadMoreObserver;

    return () => {
      logDebug('清理加载更多观察器');
      if (timersRef.current.loadMore) {
        clearTimeout(timersRef.current.loadMore);
        timersRef.current.loadMore = null;
      }
      loadMoreObserver.disconnect();
      loadMoreObserverRef.current = null;
    };
  }, [hasMore, isLoading, onLoadMore, displayedDataLength]);

  useEffect(() => {
    if (!observerRef.current || displayedDataLength === 0) {
      logDebug('跳过可见性观察器设置', { hasObserver: !!observerRef.current, displayedDataLength });
      return;
    }
    
    // 先清除之前的观察
    if (observerRef.current) {
      observerRef.current.disconnect();
      logDebug('重置交叉观察器');
    }
    
    logDebug('设置项目可见性观察', displayedDataLength);
    timersRef.current.visibility = setTimeout(() => {
      const items = document.querySelectorAll('[data-item-id]');
      logDebug('找到需要观察的项目数量', items.length);
      
      items.forEach((item) => {
        if (observerRef.current) {
          observerRef.current.observe(item);
        }
      });
    }, OBSERVER_DELAY);
    
    return () => {
      logDebug('清理可见性观察器定时器');
      if (timersRef.current.visibility) {
        clearTimeout(timersRef.current.visibility);
        timersRef.current.visibility = null;
      }
    };
  }, [displayedDataLength]);

  useEffect(() => {
    return () => {
      logDebug('组件卸载，清理所有资源');
      cleanupTimers();
      cleanupObservers();
    };
  }, [cleanupTimers, cleanupObservers]);

  return {
    visibleItems,
    isRapidScrolling,
    loadMoreRef,
    invalidateCache,
    setInitialVisibleItems
  };
};