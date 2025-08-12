import { useState, useEffect, useCallback } from 'react';
import AppHeader from '../layout/header/AppHeader';
import HandwritingLightbox from './HandwritingLightbox.tsx';
import { useHandwritingData } from '@/hooks/useHandwritingData';
import { useHandwritingFilters } from '@/hooks/useHandwritingFilters';
import { useHandwritingPagination } from '@/hooks/useHandwritingPagination';
import { useHandwritingLayout } from '@/hooks/useHandwritingLayout';
import { useHandwritingLightbox } from '@/hooks/useHandwritingLightbox';
import { useHandwritingSearch } from '@/hooks/useHandwritingSearch';
import { useHandwritingPreloader } from '@/hooks/useHandwritingPreloader';
import HandwritingFilterControls from './HandwritingFilterControls.tsx';
import HandwritingMasonryGrid from './HandwritingMasonryGrid.tsx';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import HandwritingLoadingIndicator from './HandwritingLoadingIndicator.tsx';

interface HandwritingModuleProps {
  className?: string;
}

// 缓存统计接口
interface CacheStats {
  totalRequests: number;
  hits: number;
  misses: number;
  averageResponseTime: number;
  hitRate: number;
}

// 缓存状态组件
const CacheStatus = ({ stats, enabled }: { stats?: CacheStats; enabled: boolean }) => {
  if (!enabled || !stats) return null;

  return (
    <div className="cache-status bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-blue-600 font-medium">🚀 缓存已启用</span>
          <span className="text-blue-500">
            命中率: {((stats.hits / stats.totalRequests) * 100).toFixed(1)}%
          </span>
          <span className="text-blue-500">
            响应时间: {stats.averageResponseTime.toFixed(0)}ms
          </span>
        </div>
        <div className="text-sm text-blue-500">
          请求: {stats.totalRequests} | 命中: {stats.hits}
        </div>
      </div>
    </div>
  );
};

// 缓存控制面板
const CacheControlPanel = ({ 
  onRefresh, 
  onForceRefresh, 
  onPrecache, 
  onClearCache,
  cacheEnabled 
}: {
  onRefresh: () => void;
  onForceRefresh: () => void;
  onPrecache: () => Promise<void>;
  onClearCache: () => Promise<void>;
  cacheEnabled: boolean;
}) => {
  if (!cacheEnabled) return null;

  return (
    <div className="cache-controls bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
      <div className="flex items-center space-x-2">
        <span className="text-gray-700 font-medium">缓存控制:</span>
        <button
          onClick={onRefresh}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          🔄 重新加载
        </button>
        <button
          onClick={onForceRefresh}
          className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
        >
          🔄 强制刷新
        </button>
        <button
          onClick={onPrecache}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          🔮 预缓存
        </button>
        <button
          onClick={onClearCache}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          🗑️ 清理缓存
        </button>
      </div>
    </div>
  );
};

export default function HandwritingModule({ className = '' }: HandwritingModuleProps) {
  // 数据获取（带缓存）
  const {
    handwritingItems,
    loading,
    error,
    refetch,
    forceRefresh,
    cacheStats: dataCacheStats
  } = useHandwritingData();
  
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
  
  // 数据过滤（带缓存）
  const {
    filteredItems,
    uniqueYears,
    uniqueSources,
    uniqueTags,
    cacheEnabled: filterCacheEnabled,
    precacheFilters,
    clearFilterCache,
    cacheStats: filterCacheStats
  } = useHandwritingFilters(handwritingItems, { ...filters, searchTerm: debouncedSearchTerm });
  
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
  
  // 缓存控制处理函数
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);
  
  const handleForceRefresh = useCallback(() => {
    forceRefresh();
  }, [forceRefresh]);
  
  const handlePrecache = useCallback(async () => {
    try {
      console.log('开始预缓存...');
      await precacheFilters();
      console.log('预缓存完成');
    } catch (error) {
      console.error('预缓存失败:', error);
    }
  }, [precacheFilters]);
  
  const handleClearCache = useCallback(async () => {
    try {
      console.log('清理缓存...');
      await clearFilterCache();
      console.log('缓存清理完成');
    } catch (error) {
      console.error('缓存清理失败:', error);
    }
  }, [clearFilterCache]);
  
  // 合并缓存统计信息
  const combinedCacheStats: CacheStats = {
    totalRequests: (dataCacheStats?.totalRequests || 0) + (filterCacheStats?.totalRequests || 0),
    hits: (dataCacheStats?.hits || 0) + (filterCacheStats?.hits || 0),
    misses: (dataCacheStats?.misses || 0) + (filterCacheStats?.misses || 0),
    averageResponseTime: dataCacheStats?.averageResponseTime || 0,
    hitRate: ((dataCacheStats?.hits || 0) + (filterCacheStats?.hits || 0)) / 
              ((dataCacheStats?.totalRequests || 0) + (filterCacheStats?.totalRequests || 0)) || 0
  };
  
  const cacheEnabled = filterCacheEnabled;
  
  // 智能预缓存 - 在数据加载完成后执行
  useEffect(() => {
    if (!loading && !error && handwritingItems.length > 0 && cacheEnabled) {
      const timer = setTimeout(() => {
        handlePrecache();
      }, 3000); // 3秒后开始预缓存
      
      return () => clearTimeout(timer);
    }
  }, [loading, error, handwritingItems, cacheEnabled, handlePrecache]);

  return (
    <>
      <AppHeader moduleId="handwriting" />
      <section className={`py-20 bg-cream ${className}`}>
        <div className="max-w-7xl mx-auto px-6">
          {/* 缓存状态显示 */}
          <CacheStatus stats={combinedCacheStats} enabled={cacheEnabled} />
          
          {/* 缓存控制面板 */}
          <CacheControlPanel
            onRefresh={handleRefresh}
            onForceRefresh={handleForceRefresh}
            onPrecache={handlePrecache}
            onClearCache={handleClearCache}
            cacheEnabled={cacheEnabled}
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
          {error && <ErrorState error={error} onRetry={refetch} />}
          
          {/* 瀑布流网格 */}
          {!loading && !error && (
            <>
              {filteredItems.length === 0 ? (
                <EmptyState />
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
