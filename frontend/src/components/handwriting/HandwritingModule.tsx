import { useState, useCallback } from 'react';
import AppHeader from '@/components/layout/header/AppHeader';
import HandwritingLightbox from './HandwritingLightbox.tsx';
import HandwritingCoverCard from './HandwritingCoverCard.tsx';
import { useHandwritingData } from '@/hooks/useHandwritingData';
import { useHandwritingFilters } from '@/hooks/useHandwritingFilters';
import { useHandwritingPagination } from '@/hooks/useHandwritingPagination';
import { useHandwritingLayout } from '@/hooks/useHandwritingLayout';
import { useHandwritingLightbox } from '@/hooks/useHandwritingLightbox';
import { useHandwritingSearch } from '@/hooks/useHandwritingSearch';
import { useHandwritingPreloader } from '@/hooks/useHandwritingPreloader';
import HandwritingFilterControls from './HandwritingFilterControls.tsx';
import HandwritingMasonryGrid from './HandwritingMasonryGrid.tsx';
import HandwritingEmptyState from './HandwritingEmptyState.tsx';
import HandwritingErrorState from './HandwritingErrorState.tsx';
import HandwritingLoadingIndicator from './HandwritingLoadingIndicator.tsx';

interface HandwritingModuleProps {
  className?: string;
}

// 默认过滤器配置
const DEFAULT_FILTERS = {
  selectedCategory: 'all',
  selectedYear: 'all',
  selectedSource: 'all',
  selectedTag: 'all',
  sortOrder: 'year_desc'
} as const;

// 分页配置
const PAGINATION_CONFIG = {
  itemsPerPage: 20
} as const;

export default function HandwritingModule({ className = '' }: HandwritingModuleProps) {
  // 数据获取
  const { handwritingItems, loading, error, refetch } = useHandwritingData();
  
  // 搜索状态管理
  const { searchTerm, debouncedSearchTerm, updateSearchTerm } = useHandwritingSearch();
  
  // 过滤器状态
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  
  // 数据过滤
  const { filteredItems, uniqueYears, uniqueSources, uniqueTags } = useHandwritingFilters(
    handwritingItems, 
    { ...filters, searchTerm: debouncedSearchTerm }
  );
  
  // 分页管理
  const { pagination, paginatedItems, loadMore, resetPagination } = useHandwritingPagination(
    filteredItems, 
    PAGINATION_CONFIG.itemsPerPage
  );
  
  // 布局管理
  const { columns, columnArrays } = useHandwritingLayout(paginatedItems);
  
  // Lightbox管理
  const { lightbox, openLightbox, closeLightbox, nextItem, prevItem } = useHandwritingLightbox(
    filteredItems
  );
  
  // 图片预加载
  useHandwritingPreloader(filteredItems, pagination.currentPage, pagination.itemsPerPage);
  
  // 事件处理函数
  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    resetPagination();
  }, [resetPagination]);
  
  const handleSearchChange = useCallback((term: string) => {
    updateSearchTerm(term);
    resetPagination();
  }, [updateSearchTerm, resetPagination]);
  
  return (
    <>
      <AppHeader moduleId="handwriting" />
      <section className={`py-20 bg-cream ${className}`}>
        <div className="max-w-7xl mx-auto px-6">
          {/* 封面卡片 - 立即显示，数据到达后更新 */}
          <HandwritingCoverCard
            totalHandwritings={loading ? undefined : handwritingItems.length}
          />
          
          {/* 过滤器控件 */}
          <HandwritingFilterControls
            searchTerm={searchTerm}
            filters={filters}
            uniqueYears={uniqueYears}
            uniqueSources={uniqueSources}
            uniqueTags={uniqueTags}
            onSearchChange={handleSearchChange}
            onFilterChange={handleFilterChange}
          />
          
          {/* 加载状态 */}
          {loading && <HandwritingLoadingIndicator />}
          
          {/* 错误状态 */}
          {error && <HandwritingErrorState error={error} onRetry={refetch} />}
          
          {/* 瀑布流网格 */}
          {!loading && !error && (
            <>
              {filteredItems.length === 0 ? (
                <HandwritingEmptyState />
              ) : (
                <HandwritingMasonryGrid
                  items={paginatedItems}
                  columns={columns}
                  columnArrays={columnArrays}
                  loading={pagination.isLoading}
                  hasMore={pagination.hasMore}
                  searchTerm={debouncedSearchTerm}
                  onCardClick={openLightbox}
                  onLoadMore={loadMore}
                />
              )}
            </>
          )}
        </div>
        
        {/* HandwritingLightbox */}
        {lightbox.selectedItem && (
          <HandwritingLightbox
            selectedItem={lightbox.selectedItem}
            currentIndex={lightbox.currentIndex}
            totalItems={filteredItems.length}
            searchTerm={debouncedSearchTerm}
            onClose={closeLightbox}
            onPrev={prevItem}
            onNext={nextItem}
          />
        )}
      </section>
    </>
  );
}
