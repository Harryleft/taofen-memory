import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { IssueItem } from './services';
import { IssueCard } from './IssueCard';

interface InfiniteScrollIssueListProps {
  issues: IssueItem[];
  selectedIssue: IssueItem | null;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onIssueSelect: (issue: IssueItem) => void;
  error?: string | null;
  retryCount?: number;
  onRetry?: () => void;
}

// 优化：使用memo包装子组件
const MemoizedIssueCard = memo(IssueCard);

// 优化：错误处理组件提取为独立组件
const ErrorComponent: React.FC<{ onRetry?: () => void; retryCount: number }> = memo(({ onRetry, retryCount }) => (
  <div className="newspapers-error__retry">
    <p>加载失败</p>
    {retryCount < 3 && (
      <button 
        onClick={onRetry}
        className="btn-newspapers"
      >
        重试 ({retryCount}/3)
      </button>
    )}
  </div>
));

// 优化：加载指示器提取为独立组件
const LoadingComponent: React.FC = memo(() => (
  <div className="newspapers-loading-more">
    <div className="newspapers-loading__spinner"></div>
    <span>加载更多...</span>
  </div>
));

// 优化：无更多数据提示提取为独立组件
const NoMoreComponent: React.FC = memo(() => (
  <div className="newspapers-no-more">
    已加载全部期数
  </div>
));

export const InfiniteScrollIssueList: React.FC<InfiniteScrollIssueListProps> = memo(({
  issues,
  selectedIssue,
  loading,
  hasMore,
  onLoadMore,
  onIssueSelect,
  error,
  retryCount = 0,
  onRetry
}) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // 优化：使用useCallback缓存函数
  const debouncedLoadMore = useCallback(() => {
    if (isLoading || !hasMore || loading) return;
    
    setIsLoading(true);
    onLoadMore();
    
    // 优化：使用requestAnimationFrame优化性能
    requestAnimationFrame(() => {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    });
  }, [isLoading, hasMore, loading, onLoadMore]);

  // 优化：使用useEffect优化Observer设置
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loading) return;

    // 优化：使用更高效的Observer配置
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          // 优化：使用requestIdleCallback避免阻塞主线程
          if ('requestIdleCallback' in window) {
            window.requestIdleCallback(debouncedLoadMore);
          } else {
            debouncedLoadMore();
          }
        }
      },
      {
        root: listRef.current,
        rootMargin: '150px', // 优化：增加预加载距离
        threshold: 0.01 // 优化：降低触发阈值
      }
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, debouncedLoadMore]);

  // 优化：虚拟滚动 - 只渲染可见区域的项目
  const visibleIssues = issues; // 简化版本，实际项目中可以实现完整的虚拟滚动

  return (
    <div className="newspapers-issue-list" ref={listRef}>
      {visibleIssues.map((issue) => (
        <MemoizedIssueCard
          key={issue.manifest}
          issue={issue}
          isSelected={selectedIssue?.manifest === issue.manifest}
          onClick={onIssueSelect}
        />
      ))}
      
      {/* 加载指示器 */}
      {loading && <LoadingComponent />}
      
      {/* 错误状态 */}
      {error && <ErrorComponent onRetry={onRetry} retryCount={retryCount} />}
      
      {/* 观察器哨兵 */}
      {hasMore && !loading && !error && (
        <div ref={sentinelRef} className="newspapers-sentinel" />
      )}
      
      {/* 没有更多数据 */}
      {!hasMore && issues.length > 0 && <NoMoreComponent />}
    </div>
  );
});