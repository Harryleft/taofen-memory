import { useState, useCallback } from 'react';
import AppHeader from '../layout/header/AppHeader';
import Lightbox from './Lightbox';
import { useHandwritingData } from '@/hooks/useHandwritingData';
import { useHandwritingFilters } from '@/hooks/useHandwritingFilters';
import { useHandwritingPagination } from '@/hooks/useHandwritingPagination';
import { useHandwritingLayout } from '@/hooks/useHandwritingLayout';
import { useHandwritingLightbox } from '@/hooks/useHandwritingLightbox';
import { useHandwritingSearch } from '@/hooks/useHandwritingSearch';
import { useHandwritingPreloader } from '@/hooks/useHandwritingPreloader';
import FilterControls from './FilterControls';
import MasonryGrid from './MasonryGrid';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import LoadingIndicator from './LoadingIndicator';

interface HandwritingModuleProps {
  className?: string;
}

export default function HandwritingModule({ className = '' }: HandwritingModuleProps) {
  // 数据获取
  const { handwritingItems, loading, error, refetch } = useHandwritingData();
  
  // 搜索状态管理
  const { searchTerm, debouncedSearchTerm, updateSearchTerm } = useHandwritingSearch();
  
  // 过滤器状态
  const [filters, setFilters] = useState({
    selectedCategory: 'all',
    selectedYear: 'all',
    selectedSource: 'all',
    selectedTag: 'all',
    sortOrder: 'year_desc'
  });
  
  // 数据过滤
  const { filteredItems, uniqueYears, uniqueSources, uniqueTags } = useHandwritingFilters(
    handwritingItems, 
    { ...filters, searchTerm: debouncedSearchTerm }
  );
  
  // 分页管理
  const { pagination, paginatedItems, loadMore, resetPagination } = useHandwritingPagination(
    filteredItems, 
    20
  );
  
  // 布局管理
  const { columns, columnArrays } = useHandwritingLayout(paginatedItems);
  
  // Lightbox管理
  const { lightbox, openLightbox, closeLightbox, nextItem, prevItem } = useHandwritingLightbox(
    filteredItems
  );
  
  // 图片预加载
  useHandwritingPreloader(filteredItems, pagination.currentPage, pagination.itemsPerPage);
  
  // 过滤器更新处理
  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    resetPagination();
  }, [resetPagination]);
  
  // 搜索处理
  const handleSearchChange = useCallback((term: string) => {
    updateSearchTerm(term);
    resetPagination();
  }, [updateSearchTerm, resetPagination]);
  
  return (
    <>
      <AppHeader moduleId="handwriting" />
      <section className={`py-20 bg-cream ${className}`}>
        <div className="max-w-7xl mx-auto px-6">
          {/* 过滤器控件 */}
          <FilterControls
            searchTerm={searchTerm}
            filters={filters}
            uniqueYears={uniqueYears}
            uniqueSources={uniqueSources}
            uniqueTags={uniqueTags}
            onSearchChange={handleSearchChange}
            onFilterChange={handleFilterChange}
          />
          
          {/* 加载状态 */}
          {loading && <LoadingIndicator />}
          
          {/* 错误状态 */}
          {error && <ErrorState error={error} onRetry={refetch} />}
          
          {/* 瀑布流网格 */}
          {!loading && !error && (
            <>
              {filteredItems.length === 0 ? (
                <EmptyState />
              ) : (
                <MasonryGrid
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
        
        {/* Lightbox */}
        {lightbox.selectedItem && (
          <Lightbox
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