import { useMemo, useCallback, useState, useEffect } from 'react';
import type { TransformedHandwritingItem } from './useHandwritingData';
import { HandwritingCacheManager, createHandwritingCacheManager } from '@/lib/cache/RedisCacheManager';

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
  const [cacheManager, setCacheManager] = useState<HandwritingCacheManager | null>(null);
  const [cacheEnabled, setCacheEnabled] = useState(false);

  // 初始化缓存管理器
  useEffect(() => {
    const initCache = async () => {
      try {
        const manager = createHandwritingCacheManager();
        const isConnected = await manager.isRedisConnected();
        if (isConnected) {
          setCacheManager(manager);
          setCacheEnabled(true);
        } else {
          console.warn('Redis not connected, running without cache');
          setCacheEnabled(false);
        }
      } catch (err) {
        console.warn('Failed to initialize cache manager:', err);
        setCacheEnabled(false);
      }
    };

    initCache();
  }, []);

  
  // 实际的过滤计算函数
  const computeFilteredItems = useCallback((
    items: TransformedHandwritingItem[],
    filters: Record<string, unknown>,
    searchTerm: string
  ): TransformedHandwritingItem[] => {
    // 搜索过滤
    let filteredItems = items;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredItems = items.filter(item => (
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        item.originalData.原文.toLowerCase().includes(searchLower) ||
        item.originalData.注释.toLowerCase().includes(searchLower)
      ));
    }

    // 分类过滤
    if (filters.selectedCategory !== 'all') {
      filteredItems = filteredItems.filter(item => item.category === filters.selectedCategory);
    }

    // 年份过滤
    if (filters.selectedYear !== 'all') {
      filteredItems = filteredItems.filter(item => item.year.toString() === filters.selectedYear);
    }

    // 来源过滤
    if (filters.selectedSource !== 'all') {
      filteredItems = filteredItems.filter(item => item.originalData.数据来源 === filters.selectedSource);
    }

    // 标签过滤
    if (filters.selectedTag !== 'all') {
      filteredItems = filteredItems.filter(item => item.tags.includes(filters.selectedTag));
    }

    // 排序
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
  }, []);

  // 获取缓存的元数据
  const getCachedMetadata = useCallback(async (
    type: 'years' | 'sources' | 'tags',
    items: TransformedHandwritingItem[]
  ) => {
    if (!cacheManager || !cacheEnabled) {
      // 如果缓存未启用，直接计算
      return computeMetadata(type, items);
    }

    const cacheKey = `handwriting:metadata:${type}`;

    try {
      // 尝试从缓存获取
      const cached = await cacheManager.get<TransformedHandwritingItem[]>(cacheKey);
      if (cached) {
        console.log(`✅ Metadata cache hit: ${type}`);
        return cached;
      }

      // 计算结果
      const result = computeMetadata(type, items);
      
      // 缓存结果（1小时TTL）
      await cacheManager.set(cacheKey, result, {
        ttl: 60 * 60 * 1000,
        level: 'both',
      });
      console.log(`❌ Metadata cache miss, cached result: ${type}`);

      return result;
    } catch (error) {
      console.warn('Metadata cache operation failed, computing directly:', error);
      return computeMetadata(type, items);
    }
  }, [cacheManager, cacheEnabled, computeMetadata]);

  // 实际的元数据计算函数
  const computeMetadata = useCallback((
    type: 'years' | 'sources' | 'tags',
    items: TransformedHandwritingItem[]
  ) => {
    switch (type) {
      case 'years':
        return [...new Set(items.map(item => item.year))].sort((a, b) => a - b);
      
      case 'sources':
        return [...new Set(items.map(item => item.originalData.数据来源).filter(Boolean))].sort();
      
      case 'tags': {
        const allTags = items.flatMap(item => item.tags).filter(tag => tag && tag.trim());
        return [...new Set(allTags)].sort();
      }
      
      default:
        return [];
    }
  }, []);

  // 获取缓存的元数据
  const getCachedMetadata = useCallback(async (
    type: 'years' | 'sources' | 'tags',
    items: TransformedHandwritingItem[]
  ) => {
    if (!cacheManager || !cacheEnabled) {
      // 如果缓存未启用，直接计算
      return computeMetadata(type, items);
    }

    const cacheKey = `handwriting:metadata:${type}`;

    try {
      // 尝试从缓存获取
      const cached = await cacheManager.get<TransformedHandwritingItem[]>(cacheKey);
      if (cached) {
        console.log(`✅ Metadata cache hit: ${type}`);
        return cached;
      }

      // 计算结果
      const result = computeMetadata(type, items);
      
      // 缓存结果（1小时TTL）
      await cacheManager.set(cacheKey, result, {
        ttl: 60 * 60 * 1000,
        level: 'both',
      });
      console.log(`❌ Metadata cache miss, cached result: ${type}`);

      return result;
    } catch (error) {
      console.warn('Metadata cache operation failed, computing directly:', error);
      return computeMetadata(type, items);
    }
  }, [cacheManager, cacheEnabled, computeMetadata]);

  // 主要的过滤结果 - 使用useMemo优化
  const filteredAndSortedItems = useMemo(() => {
    // 如果缓存已启用，异步获取缓存结果
    // 但为了保持同步接口，这里仍然使用同步计算
    // 在实际使用中，可以通过useEffect来更新缓存
    return computeFilteredItems(items, filters, filters.searchTerm);
  }, [items, filters, computeFilteredItems]);

  // 元数据 - 使用useMemo优化
  const uniqueYears = useMemo(() => {
    return computeMetadata('years', items);
  }, [items, computeMetadata]);

  const uniqueSources = useMemo(() => {
    return computeMetadata('sources', items);
  }, [items, computeMetadata]);

  const uniqueTags = useMemo(() => {
    return computeMetadata('tags', items);
  }, [items, computeMetadata]);

  // 异步预缓存功能
  const precacheFilters = useCallback(async () => {
    if (!cacheManager || !cacheEnabled) return;

    try {
      // 预缓存当前过滤器结果
      await getCachedFilteredItems(items, filters, filters.searchTerm);
      
      // 预缓存元数据
      await getCachedMetadata('years', items);
      await getCachedMetadata('sources', items);
      await getCachedMetadata('tags', items);
      
      console.log('🔮 Filter precaching completed');
    } catch (error) {
      console.warn('Precaching failed:', error);
    }
  }, [items, filters, cacheManager, cacheEnabled, getCachedFilteredItems, getCachedMetadata]);

  // 清理过滤器缓存
  const clearFilterCache = useCallback(async () => {
    if (!cacheManager) return;
    
    try {
      await cacheManager.deleteByPattern('handwriting:filtered:*');
      await cacheManager.deleteByPattern('handwriting:metadata:*');
      console.log('🗑️ Filter cache cleared');
    } catch (error) {
      console.warn('Failed to clear filter cache:', error);
    }
  }, [cacheManager]);

  return {
    filteredItems: filteredAndSortedItems,
    uniqueYears,
    uniqueSources,
    uniqueTags,
    cacheEnabled,
    precacheFilters, // 新增：预缓存功能
    clearFilterCache, // 新增：清理缓存功能
    cacheStats: cacheManager?.getStats(), // 缓存统计
  };
};

// 工具函数：计算过滤结果（导出供测试使用）
export const computeFilteredItems = (
  items: TransformedHandwritingItem[],
  filters: Record<string, unknown>,
  searchTerm: string
): TransformedHandwritingItem[] => {
  // 搜索过滤
  let filteredItems = items;
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    filteredItems = items.filter(item => (
      item.title.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
      item.originalData.原文.toLowerCase().includes(searchLower) ||
      item.originalData.注释.toLowerCase().includes(searchLower)
    ));
  }

  // 分类过滤
  if (filters.selectedCategory !== 'all') {
    filteredItems = filteredItems.filter(item => item.category === filters.selectedCategory);
  }

  // 年份过滤
  if (filters.selectedYear !== 'all') {
    filteredItems = filteredItems.filter(item => item.year.toString() === filters.selectedYear);
  }

  // 来源过滤
  if (filters.selectedSource !== 'all') {
    filteredItems = filteredItems.filter(item => item.originalData.数据来源 === filters.selectedSource);
  }

  // 标签过滤
  if (filters.selectedTag !== 'all') {
    filteredItems = filteredItems.filter(item => item.tags.includes(filters.selectedTag));
  }

  // 排序
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
};

export default useHandwritingFilters;