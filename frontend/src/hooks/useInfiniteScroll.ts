import { useState, useEffect, useRef, useCallback } from 'react';

const SCROLL_SPEED_THRESHOLD = 30;
const SCROLL_RESET_DELAY = 500;
const INITIAL_VISIBLE_COUNT = 20;
const VISIBILITY_DELAY = 100;
const OBSERVER_DELAY = 20;

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

  const getCachedCardElements = useCallback(() => {
    if (!cacheValidRef.current || !cardElementsCacheRef.current) {
      cardElementsCacheRef.current = document.querySelectorAll('[data-item-id]');
      cacheValidRef.current = true;
    }
    return cardElementsCacheRef.current;
  }, []);

  const invalidateCache = useCallback(() => {
    cacheValidRef.current = false;
  }, []);

  const setInitialVisibleItems = useCallback((items: { id: number }[]) => {
    const initialVisibleIds = new Set(items.slice(0, INITIAL_VISIBLE_COUNT).map(item => item.id));
    setVisibleItems(initialVisibleIds);
  }, []);

  const cleanupTimers = useCallback(() => {
    Object.values(timersRef.current).forEach(timer => {
      if (timer) clearTimeout(timer);
    });
    timersRef.current = { scroll: null, visibility: null, loadMore: null };
  }, []);

  const cleanupObservers = useCallback(() => {
    observerRef.current?.disconnect();
    loadMoreObserverRef.current?.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollSpeed = Math.abs(currentScrollY - lastScrollY.current);
      lastScrollY.current = currentScrollY;
      
      if (scrollSpeed > SCROLL_SPEED_THRESHOLD) {
        setIsRapidScrolling(true);
        const viewportHeight = window.innerHeight;
        const scrollTop = window.scrollY;
        const triggerZone = scrollTop + viewportHeight + 400;
        
        const cardElements = getCachedCardElements();
        const newVisibleIds = new Set(visibleItems);
        
        cardElements.forEach((element) => {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + scrollTop;
          
          if (elementTop < triggerZone) {
            const itemIdStr = element.getAttribute('data-item-id');
            if (itemIdStr) {
              const itemId = parseInt(itemIdStr, 10);
              if (!isNaN(itemId)) {
                newVisibleIds.add(itemId);
              }
            }
          }
        });
        
        setVisibleItems(newVisibleIds);
      }
      
      if (timersRef.current.scroll) clearTimeout(timersRef.current.scroll);
      
      timersRef.current.scroll = setTimeout(() => {
        setIsRapidScrolling(false);
      }, SCROLL_RESET_DELAY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timersRef.current.scroll) {
        clearTimeout(timersRef.current.scroll);
        timersRef.current.scroll = null;
      }
    };
  }, [visibleItems, getCachedCardElements]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const newVisibleIds = new Set<number>();
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const itemIdStr = entry.target.getAttribute('data-item-id');
            if (itemIdStr) {
              const itemId = parseInt(itemIdStr, 10);
              if (!isNaN(itemId)) {
                newVisibleIds.add(itemId);
              }
            }
          }
        });
        
        if (newVisibleIds.size > 0) {
          setVisibleItems(prev => new Set([...prev, ...newVisibleIds]));
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (displayedDataLength === 0) return;
    
    const loadMoreObserver = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 1.0, rootMargin: '300px' }
    );

    timersRef.current.loadMore = setTimeout(() => {
      if (loadMoreRef.current) {
        loadMoreObserver.observe(loadMoreRef.current);
      }
    }, VISIBILITY_DELAY);
    
    loadMoreObserverRef.current = loadMoreObserver;

    return () => {
      if (timersRef.current.loadMore) {
        clearTimeout(timersRef.current.loadMore);
        timersRef.current.loadMore = null;
      }
      loadMoreObserver.disconnect();
      loadMoreObserverRef.current = null;
    };
  }, [hasMore, isLoading, onLoadMore, displayedDataLength]);

  useEffect(() => {
    if (!observerRef.current || displayedDataLength === 0) return;
    
    timersRef.current.visibility = setTimeout(() => {
      const items = document.querySelectorAll('[data-item-id]');
      items.forEach((item) => {
        if (observerRef.current) {
          observerRef.current.observe(item);
        }
      });
    }, OBSERVER_DELAY);
    
    return () => {
      if (timersRef.current.visibility) {
        clearTimeout(timersRef.current.visibility);
        timersRef.current.visibility = null;
      }
    };
  }, [displayedDataLength]);

  useEffect(() => {
    return () => {
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