import { useMemo } from 'react';
import type { TransformedHandwritingItem } from './useHandwritingData.ts';

// 搜索过滤Hook
export const useHandwritingFilters = (
  items: TransformedHandwritingItem[],
  filters: {
    searchTerm: string;
    selectedCategory: string;
    selectedYear: string;
    selectedSource: string;
    selectedTag: string;
    sortOrder: string;
  }
) => {
  // 搜索结果 - 使用useMemo优化
  const searchResults = useMemo(() => {
    if (!filters.searchTerm) return items;
    
    const searchLower = filters.searchTerm.toLowerCase();
    return items.filter(item => (
      item.title.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
      item.originalData.原文.toLowerCase().includes(searchLower) ||
      item.originalData.注释.toLowerCase().includes(searchLower)
    ));
  }, [items, filters.searchTerm]);

  // 过滤和排序结果 - 使用useMemo优化
  const filteredAndSortedItems = useMemo(() => {
    // 先搜索
    let filteredItems = searchResults;
    
    // 再筛选
    filteredItems = filteredItems.filter(item => {
      const matchesCategory = filters.selectedCategory === 'all' || item.category === filters.selectedCategory;
      const matchesYear = filters.selectedYear === 'all' || item.year.toString() === filters.selectedYear;
      const matchesSource = filters.selectedSource === 'all' || item.originalData.数据来源 === filters.selectedSource;
      const matchesTag = filters.selectedTag === 'all' || item.originalData.标签 === filters.selectedTag;
      
      return matchesCategory && matchesYear && matchesSource && matchesTag;
    });
    
    // 最后排序
    return filteredItems.sort((a, b) => {
      switch (filters.sortOrder) {
        case 'year_asc':
          return a.year - b.year;
        case 'year_desc':
          return b.year - a.year;
        case 'name_asc':
          return a.title.localeCompare(b.title);
        case 'name_desc':
          return b.title.localeCompare(a.title);
        case 'id_asc':
          return a.id.localeCompare(b.id);
        case 'id_desc':
          return b.id.localeCompare(a.id);
        default:
          return 0;
      }
    });
  }, [searchResults, filters]);

  // 获取唯一的年份列表 - 使用useMemo优化
  const uniqueYears = useMemo(() => {
    return [...new Set(items.map(item => item.year))].sort((a, b) => a - b);
  }, [items]);
  
  // 获取唯一的数据来源列表 - 使用useMemo优化
  const uniqueSources = useMemo(() => {
    return [...new Set(items.map(item => item.originalData.数据来源).filter(Boolean))].sort();
  }, [items]);
  
  // 获取唯一的标签列表 - 使用useMemo优化
  const uniqueTags = useMemo(() => {
    return [...new Set(items.map(item => item.originalData.标签).filter(Boolean))].sort();
  }, [items]);

  return {
    filteredItems: filteredAndSortedItems,
    uniqueYears,
    uniqueSources,
    uniqueTags
  };
};

export default useHandwritingFilters;