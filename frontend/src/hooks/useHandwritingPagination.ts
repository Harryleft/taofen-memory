import { useState, useCallback, useEffect } from 'react';
import type { TransformedHandwritingItem } from './useHandwritingData';

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  hasMore: boolean;
  isLoading: boolean;
}

interface UseHandwritingPaginationReturn {
  pagination: PaginationState;
  paginatedItems: TransformedHandwritingItem[];
  loadMore: () => void;
  resetPagination: () => void;
}

export const useHandwritingPagination = (
  items: TransformedHandwritingItem[], 
  itemsPerPage: number = 20
): UseHandwritingPaginationReturn => {
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage,
    hasMore: true,
    isLoading: false
  });
  
  // 计算分页后的项目
  const paginatedItems = items.slice(0, pagination.currentPage * pagination.itemsPerPage);
  
  // 更新是否有更多数据
  useEffect(() => {
    const hasMore = paginatedItems.length < items.length;
    if (hasMore !== pagination.hasMore) {
      setPagination(prev => ({ ...prev, hasMore }));
    }
  }, [paginatedItems.length, items.length, pagination.hasMore]);
  
  // 加载更多
  const loadMore = useCallback(() => {
    if (pagination.hasMore && !pagination.isLoading) {
      setPagination(prev => ({
        ...prev,
        isLoading: true,
        currentPage: prev.currentPage + 1
      }));
      
      // 模拟加载延迟
      setTimeout(() => {
        setPagination(prev => ({
          ...prev,
          isLoading: false
        }));
      }, 300);
    }
  }, [pagination.hasMore, pagination.isLoading]);
  
  // 重置分页
  const resetPagination = useCallback(() => {
    setPagination(prev => ({
      ...prev,
      currentPage: 1,
      hasMore: true
    }));
  }, []);
  
  return {
    pagination,
    paginatedItems,
    loadMore,
    resetPagination
  };
};

export default useHandwritingPagination;