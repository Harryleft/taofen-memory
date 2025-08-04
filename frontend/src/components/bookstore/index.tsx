/**
 * 邹韬奋纪念网站 - 书店模块
 * 
 * 主要功能：
 * - 展示与生活书店相关的书籍
 * - 支持按年份、出版社分类筛选
 * - 实现瀑布流布局和无限滚动
 * - 提供书籍详情灯箱预览
 * - 支持CSV数据导出
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { BookItem, FilterOptions } from '../../types/bookTypes';
import { downloadCSV } from '../../utils/bookUtils';

import BookstoreHeader from './BookstoreHeader';
import BookstoreFilters from './BookstoreFilters';
import BookGrid from './BookGrid';
import BookLightbox from './BookLightbox';

import { useBookData } from '../../hooks/useBookData';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useLightbox } from '../../hooks/useLightbox';
import { useResponsiveColumns } from '../../hooks/useResponsiveColumns';

// 添加调试常量
const DEBUG = true;
const logDebug = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[BookstoreModule] ${message}`, data || '');
  }
};

// UI常量配置
const SEARCH_DEBOUNCE_DELAY = 300;  // 搜索防抖延迟(ms)
const COLUMN_GAP = 20;              // 瀑布流列间距(px)
const LOAD_MORE_INDICATOR_HEIGHT = 4; // 加载指示器高度(tailwind单位)

interface BookstoreTimelineModuleProps {
  className?: string;
}

export default function BookstoreTimelineModule({ className = '' }: BookstoreTimelineModuleProps) {
  // 筛选状态管理
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // 构建筛选条件对象
  const filters: FilterOptions = { searchTerm, category: selectedCategory, year: selectedYear };
  
  // 数据管理：书籍数据获取、分页、筛选
  const {
    allData,
    displayedData,
    hasMore,
    isLoading,
    isInitialLoading,
    uniqueYears,
    uniqueCategories,
    loadMoreData,
    resetAndReload
  } = useBookData(filters);
  
  // 响应式布局：根据屏幕宽度计算列数
  const { columns } = useResponsiveColumns();
  
  // 优化加载更多函数，使用 useCallback 包装
  const handleLoadMore = useCallback(() => {
    logDebug('触发加载更多数据');
    loadMoreData();
  }, [loadMoreData]);
  
  // 无限滚动：可见性检测、性能优化
  const {
    visibleItems,
    isRapidScrolling,
    loadMoreRef,
    invalidateCache,
    setInitialVisibleItems
  } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: handleLoadMore,
    displayedDataLength: displayedData.length
  });
  
  // 灯箱控制：书籍详情预览、导航
  const {
    selectedItem,
    currentIndex,
    openLightbox,
    closeLightbox,
    nextItem,
    prevItem
  } = useLightbox();

  // 防抖处理：筛选条件变化时重新加载数据
  useEffect(() => {
    if (isInitialLoading) return;
    
    logDebug('筛选条件变化，准备重新加载数据', { searchTerm, selectedCategory, selectedYear });
    const debounceTimer = setTimeout(() => {
      resetAndReload({ searchTerm, category: selectedCategory, year: selectedYear });
      invalidateCache(); // 清除DOM元素缓存
      logDebug('重新加载数据并清除缓存');
    }, SEARCH_DEBOUNCE_DELAY);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedCategory, selectedYear, isInitialLoading, resetAndReload, invalidateCache]);
  
  // 可见性初始化：数据加载完成后设置初始可见项目
  useEffect(() => {
    if (displayedData.length > 0) {
      logDebug('设置初始可见项目', { count: displayedData.length });
      setInitialVisibleItems(displayedData);
    }
  }, [displayedData, setInitialVisibleItems]);

  // 瀑布流布局算法：将书籍分配到最短的列中
  const columnArrays = useMemo(() => {
    logDebug('重新计算瀑布流布局', { columns, itemCount: displayedData.length });
    const arrays: BookItem[][] = Array.from({ length: columns }, () => []);
    const heights = new Array(columns).fill(0);

    displayedData.forEach((item) => {
      const shortestColumnIndex = heights.indexOf(Math.min(...heights));
      arrays[shortestColumnIndex].push(item);
      heights[shortestColumnIndex] += item.dimensions.height + COLUMN_GAP;
    });

    return arrays;
  }, [displayedData, columns]);

  // 灯箱事件处理器
  const handleOpenLightbox = useCallback((item: BookItem) => {
    logDebug('打开灯箱预览', { itemId: item.id, title: item.title });
    openLightbox(item, displayedData);
  }, [displayedData, openLightbox]);
  
  const handleNextItem = useCallback(() => {
    logDebug('灯箱导航：下一项');
    nextItem(displayedData);
  }, [displayedData, nextItem]);
  
  const handlePrevItem = useCallback(() => {
    logDebug('灯箱导航：上一项');
    prevItem(displayedData);
  }, [displayedData, prevItem]);

  // 初始加载状态渲染
  if (isInitialLoading) {
    return (
      <section className={`relative py-20 bg-white ${className}`}>
        <div className="max-w-7xl mx-auto px-6">
          <BookstoreHeader />
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
            <span className="ml-3 text-charcoal/60" style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif"}}>正在加载书籍数据...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`relative py-20 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        <BookstoreHeader />
        
        {/* 筛选控件 */}
        <BookstoreFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          uniqueCategories={uniqueCategories}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          uniqueYears={uniqueYears}
          onDownload={() => downloadCSV(allData)}
        />

        {/* 书籍网格 - 瀑布流布局 */}
        <BookGrid
          columnArrays={columnArrays}
          visibleItems={visibleItems}
          isRapidScrolling={isRapidScrolling}
          onOpenLightbox={handleOpenLightbox}
        />

        {/* 无限滚动触发器 */}
        <div 
          ref={loadMoreRef} 
          className={`w-full h-${LOAD_MORE_INDICATOR_HEIGHT}`} 
          data-testid="load-more-trigger"
        />

        {/* 加载更多指示器 */}
        {isLoading && hasMore && (
          <div className="text-center py-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold mr-3"></div>
              <span className="text-charcoal/60" style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif"}}>正在加载更多...</span>
            </div>
          </div>
        )}

        {/* 空状态提示 */}
        {displayedData.length === 0 && !isInitialLoading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-charcoal mb-2" style={{fontFamily: "'KaiTi', 'STKaiti', '华文楷体', serif"}}>未找到相关书籍</h3>
            <p className="text-charcoal/60" style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif"}}>请尝试调整搜索条件</p>
          </div>
        )}
      </div>

      {/* 书籍详情灯箱 */}
      <BookLightbox
        selectedItem={selectedItem}
        currentIndex={currentIndex}
        totalCount={displayedData.length}
        onClose={closeLightbox}
        onNext={handleNextItem}
        onPrev={handlePrevItem}
      />
    </section>
  );
}
