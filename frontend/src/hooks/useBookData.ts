import { useState, useEffect, useCallback, useMemo } from 'react';
import { BookItem, FilterOptions } from '@/types/bookTypes';
import { PAGE_SIZE } from '@/constants/bookConstants';
import { loadAllBooksData, loadBooksDataPaginated } from '@/services/bookDataService';

interface UseBookDataReturn {
  allData: BookItem[];
  displayedData: BookItem[];
  currentPage: number;
  hasMore: boolean;
  isLoading: boolean;
  isInitialLoading: boolean;
  uniqueYears: number[];
  uniqueCategories: string[];
  loadInitialData: () => Promise<void>;
  loadMoreData: () => Promise<void>;
  resetAndReload: (filters: FilterOptions) => Promise<void>;
}

export const useBookData = (filters: FilterOptions): UseBookDataReturn => {
  const [allData, setAllData] = useState<BookItem[]>([]);
  const [displayedData, setDisplayedData] = useState<BookItem[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const loadInitialData = useCallback(async () => {
    setIsInitialLoading(true);
    try {
      const allBooks = await loadAllBooksData();
      setAllData(allBooks);
      
      const initialFilters: FilterOptions = { category: 'all', year: 'all', searchTerm: '' };
      const firstPage = await loadBooksDataPaginated(0, PAGE_SIZE, initialFilters);
      
      setDisplayedData(firstPage.items);
      setHasMore(firstPage.hasMore);
      setCurrentPage(0);
    } catch {
      // 加载数据失败
      throw new Error('Failed to load initial data');
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  const loadMoreData = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    try {
      const nextPage = currentPage + 1;
      const pageData = await loadBooksDataPaginated(nextPage, PAGE_SIZE, filters);
      
      setDisplayedData(prev => [...prev, ...pageData.items]);
      setHasMore(pageData.hasMore);
      setCurrentPage(nextPage);
    } catch {
      // 加载更多数据失败
      throw new Error('Failed to load more data');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, hasMore, isLoading, filters]);

  const resetAndReload = useCallback(async (newFilters: FilterOptions) => {
    setIsLoading(true);
    setDisplayedData([]);
    try {
      const firstPage = await loadBooksDataPaginated(0, PAGE_SIZE, newFilters);
      setDisplayedData(firstPage.items);
      setHasMore(firstPage.hasMore);
      setCurrentPage(0);
    } catch {
      // 重新加载数据失败
      throw new Error('Failed to reload data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uniqueYears = useMemo(() => 
    [...new Set(allData.map(item => item.year))].sort((a, b) => a - b), 
    [allData]
  );

  const uniqueCategories = useMemo(() => 
    [...new Set(allData.map(item => item.category))].sort(), 
    [allData]
  );

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return {
    allData,
    displayedData,
    currentPage,
    hasMore,
    isLoading,
    isInitialLoading,
    uniqueYears,
    uniqueCategories,
    loadInitialData,
    loadMoreData,
    resetAndReload
  };
};