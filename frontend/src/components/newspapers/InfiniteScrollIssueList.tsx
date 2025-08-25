import React, { useState, useEffect, useRef, useCallback } from 'react';
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

export const InfiniteScrollIssueList: React.FC<InfiniteScrollIssueListProps> = ({
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

  // 防抖加载更多
  const debouncedLoadMore = useCallback(() => {
    if (isLoading || !hasMore || loading) return;
    
    setIsLoading(true);
    onLoadMore();
    
    // 延迟重置加载状态，避免快速重复触发
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [isLoading, hasMore, loading, onLoadMore]);

  // 设置 Intersection Observer
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loading) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          debouncedLoadMore();
        }
      },
      {
        root: listRef.current,
        rootMargin: '100px',
        threshold: 0.1
      }
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, debouncedLoadMore]);

  // 错误处理组件
  const ErrorComponent = () => (
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
  );

  return (
    <div className="newspapers-issue-list" ref={listRef}>
      {issues.map((issue) => (
        <IssueCard
          key={issue.manifest}
          issue={issue}
          isSelected={selectedIssue?.manifest === issue.manifest}
          onClick={onIssueSelect}
        />
      ))}
      
      {/* 加载指示器 */}
      {loading && (
        <div className="newspapers-loading-more">
          <div className="newspapers-loading__spinner"></div>
          <span>加载更多...</span>
        </div>
      )}
      
      {/* 错误状态 */}
      {error && <ErrorComponent />}
      
      {/* 观察器哨兵 */}
      {hasMore && !loading && !error && (
        <div ref={sentinelRef} className="newspapers-sentinel" />
      )}
      
      {/* 没有更多数据 */}
      {!hasMore && issues.length > 0 && (
        <div className="newspapers-no-more">
          已加载全部期数
        </div>
      )}
    </div>
  );
};