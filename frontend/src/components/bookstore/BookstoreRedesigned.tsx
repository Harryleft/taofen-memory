import React, { useState, useEffect, useMemo } from 'react';
import { FilterOptions } from '../../types/bookTypes';
import { useSimplifiedBookData } from '../../hooks/useSimplifiedBookData';
import { useResponsiveColumns } from '../../hooks/useResponsiveColumns';
import { useLightbox } from '../../hooks/useLightbox';
import VirtualizedBookGrid from './VirtualizedBookGrid';
import FilterControls from './FilterControls';
import Lightbox from './Lightbox';

/**
 * 基于第一性原理重新设计的书店组件
 * 
 * 设计原则：
 * 1. 单一职责：每个钩子只负责一个特定功能
 * 2. 最小状态：只保留必要的状态，其他通过计算得出
 * 3. 性能优先：优化滚动流畅度和渲染性能
 * 4. 简化架构：移除不必要的复杂性
 */
const BookstoreRedesigned: React.FC = () => {
  // 筛选状态管理
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    year: 'all',
    searchTerm: ''
  });

  // 防抖搜索状态
  const [debouncedFilters, setDebouncedFilters] = useState<FilterOptions>(filters);

  // 数据管理（简化版）
  const {
    items,
    isLoading,
    hasMore,
    error,
    loadMore,
    reset,
    metadata
  } = useSimplifiedBookData(debouncedFilters);

  // 响应式列数
  const columnCount = useResponsiveColumns();

  // 灯箱功能
  const {
    isOpen: isLightboxOpen,
    currentItem: lightboxItem,
    openLightbox,
    closeLightbox,
    navigateLightbox
  } = useLightbox(items);

  // 防抖处理筛选条件变化
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [filters]);

  // 当防抖后的筛选条件变化时，重置数据
  useEffect(() => {
    // 只有在防抖筛选条件真正变化时才重置
    const hasChanged = 
      debouncedFilters.category !== filters.category ||
      debouncedFilters.year !== filters.year ||
      debouncedFilters.searchTerm !== filters.searchTerm;
    
    if (hasChanged) {
      reset(debouncedFilters);
    }
  }, [debouncedFilters, reset]);

  // 筛选控制处理函数
  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // 错误处理
  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">加载失败: {error}</p>
          <button 
            onClick={() => reset(debouncedFilters)}
            className="px-4 py-2 bg-charcoal text-cream rounded hover:bg-charcoal/80"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* 页面标题 */}
      <div className="bg-charcoal text-cream py-8">
        <div className="container mx-auto px-4">
          <h1 
            className="text-4xl font-bold text-center mb-2"
            style={{ fontFamily: "'SimSun', '宋体', 'NSimSun', serif" }}
          >
            生活书店
          </h1>
          <p 
            className="text-center text-cream/80"
            style={{ fontFamily: "'SimSun', '宋体', 'NSimSun', serif" }}
          >
            重新设计的无限滚动体验
          </p>
        </div>
      </div>

      {/* 筛选控件 */}
      <div className="container mx-auto px-4 py-6">
        <FilterControls
          filters={filters}
          onFilterChange={handleFilterChange}
          uniqueYears={metadata.uniqueYears}
          uniqueCategories={metadata.uniqueCategories}
          isLoading={isLoading}
        />
      </div>

      {/* 主要内容区域 */}
      <div className="container mx-auto px-4 pb-8">
        {/* 加载状态 */}
        {isLoading && items.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-charcoal"></div>
            <p className="mt-4 text-charcoal/60">加载中...</p>
          </div>
        )}

        {/* 虚拟化书籍网格 */}
        {items.length > 0 && (
          <div className="h-[calc(100vh-300px)]">
            <VirtualizedBookGrid
              items={items}
              columnCount={columnCount}
              onOpenLightbox={openLightbox}
              onLoadMore={loadMore}
              hasMore={hasMore}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* 空状态 */}
        {!isLoading && items.length === 0 && (
          <div className="text-center py-12">
            <p 
              className="text-charcoal/60 text-lg"
              style={{ fontFamily: "'SimSun', '宋体', 'NSimSun', serif" }}
            >
              没有找到符合条件的书籍
            </p>
          </div>
        )}
      </div>

      {/* 灯箱 */}
      {isLightboxOpen && lightboxItem && (
        <Lightbox
          item={lightboxItem}
          onClose={closeLightbox}
          onNavigate={navigateLightbox}
        />
      )}
    </div>
  );
};

export default BookstoreRedesigned;