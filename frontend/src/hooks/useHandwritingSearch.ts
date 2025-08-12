import { useState, useEffect, useCallback, useRef } from 'react';

interface UseHandwritingSearchReturn {
  searchTerm: string;
  debouncedSearchTerm: string;
  updateSearchTerm: (term: string) => void;
}

export const useHandwritingSearch = (debounceMs: number = 300): UseHandwritingSearchReturn => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 更新搜索词
  const updateSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
    
    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // 设置新的防抖定时器
    timeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(term);
    }, debounceMs);
  }, [debounceMs]);
  
  // 清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return {
    searchTerm,
    debouncedSearchTerm,
    updateSearchTerm
  };
};

export default useHandwritingSearch;