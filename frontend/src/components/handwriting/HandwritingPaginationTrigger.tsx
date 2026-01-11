import { memo, useRef, useEffect } from 'react';

interface PaginationTriggerProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

const HandwritingPaginationTrigger = memo(({ hasMore, isLoading, onLoadMore }: PaginationTriggerProps) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  
  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || isLoading) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onLoadMore();
          }
        });
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1
      }
    );

    const currentTrigger = triggerRef.current;
    if (currentTrigger) {
      observer.observe(currentTrigger);
    }

    return () => {
      if (currentTrigger) {
        observer.unobserve(currentTrigger);
      }
    };
  }, [hasMore, isLoading, onLoadMore]);
  
  return (
    <div ref={triggerRef} className="flex justify-center items-center py-8">
      {isLoading && (
        <div className="flex items-center gap-2 text-charcoal/60">
          <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
          <span>加载更多...</span>
        </div>
      )}
    </div>
  );
});

HandwritingPaginationTrigger.displayName = 'HandwritingPaginationTrigger';

export default HandwritingPaginationTrigger;
