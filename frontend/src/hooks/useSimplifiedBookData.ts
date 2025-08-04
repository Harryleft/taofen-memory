import { useState, useEffect, useCallback, useMemo } from 'react';
import { BookItem, FilterOptions } from '../types/bookTypes';
import { PAGE_SIZE } from '../constants/bookConstants';
import { loadAllBooksData, loadBooksDataPaginated } from '../services/bookDataService';

interface UseSimplifiedBookDataReturn {
  items: BookItem[];
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  reset: (filters: FilterOptions) => Promise<void>;
  metadata: {
    uniqueYears: number[];
    uniqueCategories: string[];
  };
}

/**
 * 基于第一性原理简化的书籍数据管理钩子
 * 
 * 核心原理：
 * 1. 单一数据源：items数组
 * 2. 最小状态：只保留必要的加载状态
 * 3. 纯函数：所有派生状态通过计算得出
 */
export const useSimplifiedBookData = (filters: FilterOptions): UseSimplifiedBookDataReturn => {
  // 核心状态：只保留必要的状态
  const [items, setItems] = useState<BookItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [allItemsCache, setAllItemsCache] = useState<BookItem[]>([]);

  // 派生状态：通过计算得出，不存储在状态中
  const metadata = useMemo(() => {
    if (allItemsCache.length === 0) {
      return { uniqueYears: [], uniqueCategories: [] };
    }

    const uniqueYears = [...new Set(allItemsCache.map(item => item.year))].sort((a, b) => a - b);
    const uniqueCategories = [...new Set(allItemsCache.map(item => item.category))].sort();
    
    return { uniqueYears, uniqueCategories };
  }, [allItemsCache]);

  // 加载初始数据
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 并行加载所有数据（用于元数据）和第一页数据
      const [allBooks, firstPage] = await Promise.all([
        loadAllBooksData(),
        loadBooksDataPaginated(0, PAGE_SIZE, filters)
      ]);
      
      setAllItemsCache(allBooks);
      setItems(firstPage.items);
      setHasMore(firstPage.hasMore);
      setCurrentPage(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载数据失败');
      console.error('加载初始数据失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // 加载更多数据
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) {
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const nextPage = currentPage + 1;
      const pageData = await loadBooksDataPaginated(nextPage, PAGE_SIZE, filters);
      
      setItems(prev => [...prev, ...pageData.items]);
      setHasMore(pageData.hasMore);
      setCurrentPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载更多数据失败');
      console.error('加载更多数据失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, hasMore, isLoading, filters]);

  // 重置并重新加载数据
  const reset = useCallback(async (newFilters: FilterOptions) => {
    setItems([]);
    setCurrentPage(0);
    setHasMore(true);
    setError(null);
    setIsLoading(true);
    
    try {
      const firstPage = await loadBooksDataPaginated(0, PAGE_SIZE, newFilters);
      setItems(firstPage.items);
      setHasMore(firstPage.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : '重新加载数据失败');
      console.error('重新加载数据失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初始化数据加载
  useEffect(() => {
    loadInitialData();
  }, []); // 只在组件挂载时执行一次

  return {
    items,
    isLoading,
    hasMore,
    error,
    loadMore,
    reset,
    metadata
  };
};