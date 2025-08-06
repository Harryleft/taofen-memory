/**
 * @file BookstoreModule.tsx
 * @description 书店页面的核心业务逻辑和状态管理中心。
 * @module components/bookstore/BookstoreModule
 * @summary
 * 该组件是书店功能的顶层容器，负责整合所有子组件和自定义 Hooks，以实现一个功能完整的书籍展示页面。
 * - **状态管理**: 使用 `useState` 管理筛选条件（搜索词、年份、分类）。
 * - **数据获取**: 通过自定义 Hook `useBookData` 获取、筛选和分页书籍数据。
 * - **响应式布局**: 通过 `useResponsiveColumns` 动态计算瀑布流的列数。
 * - **无限滚动**: 通过 `useInfiniteScroll` 实现滚动加载更多数据和卡片懒加载。
 * - **详情展示**: 通过 `useLightbox` 管理书籍详情弹窗的显示和导航。
 * - **组件协调**: 将状态和回调函数传递给 `BookFiltersPanel`、`BookGrid` 和 `BookDetailModal` 等子组件。
 * - **性能优化**: 使用 `useMemo` 计算瀑布流布局，并通过防抖（debouncing）处理筛选输入。
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { BookItem, FilterOptions } from '../../types/bookTypes';
import { downloadCSV } from '../../utils/bookUtils';


import BookFiltersPanel from './BookFiltersPanel.tsx';
import BookGrid from './BookGridContainer.tsx';
import BookDetailModal from './BookDetailModal.tsx';


import { useBookData } from '../../hooks/useBookData';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useLightbox } from '../../hooks/useLightbox';
import { useResponsiveColumns } from '../../hooks/useResponsiveColumns';

// 使用配置常量
const SEARCH_DEBOUNCE_DELAY = 300; // ms
const COLUMN_GAP = 16; // px
const LOAD_MORE_INDICATOR_HEIGHT = 80; // px

interface BookstoreTimelineModuleProps {
  className?: string;
}

/**
 * @component BookstoreTimelineModule
 * @description 书店页面的主组件，整合了所有功能模块。
 * @param {BookstoreTimelineModuleProps} props - 组件的 props。
 * @returns {JSX.Element} - 渲染出的书店页面。
 */
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
  
  // 无限滚动：可见性检测、性能优化
  const {
    visibleItems,
    loadMoreRef,
    setInitialVisibleItems
  } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: loadMoreData,
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

  // 【修复】使用 useRef 追踪上一次的 isInitialLoading 状态，用于精确判断重置加载何时完成
  const prevIsInitialLoading = useRef(isInitialLoading);

  // 防抖处理：筛选条件变化时重新加载数据
  useEffect(() => {
    // isInitialLoading 会在 resetAndReload 开始时变为 true，这里用它来防止在加载期间再次触发
    if (isInitialLoading) return;
    
    const debounceTimer = setTimeout(() => {
      resetAndReload(filters);
    }, SEARCH_DEBOUNCE_DELAY);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedCategory, selectedYear]); // 【优化】依赖项简化为只包含筛选条件

  
  // 【修复】这个新的 useEffect 只在“筛选/重置”加载完成后执行一次，而不会在“加载更多”时执行
  useEffect(() => {
    // 条件：只有当 `isInitialLoading` 从 `true` 变为 `false` 时，才执行
    if (prevIsInitialLoading.current && !isInitialLoading && displayedData.length > 0) {
      setInitialVisibleItems(displayedData);
    }
    // 在每次渲染后，同步 ref 的值为当前状态，供下一次渲染判断
    prevIsInitialLoading.current = isInitialLoading;
  }, [isInitialLoading, displayedData, setInitialVisibleItems]);
  

  // 瀑布流布局算法：将书籍分配到最短的列中
  const columnArrays = useMemo(() => {
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
  const handleOpenLightbox = (item: BookItem) => {
    openLightbox(item, displayedData);
  };
  
  const handleNextItem = () => {
    nextItem(displayedData);
  };
  
  const handlePrevItem = () => {
    prevItem(displayedData);
  };
  
  // 【修复】为搜索/筛选场景增加判断逻辑
  // 如果 hasMore 为 false，说明是搜索/筛选的最终结果，我们应该展示所有项。
  // 否则，我们才使用 useInfiniteScroll 提供的 visibleItems。
  const itemsToDisplay = !hasMore 
    ? new Set(displayedData.map(item => item.id)) 
    : visibleItems;

  // 初始加载状态渲染
  if (isInitialLoading && displayedData.length === 0) {
    return (
      <section className={`relative py-20 bg-white ${className}`}>
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-500 rounded-full animate-spin"></div>
            <span className="mt-4 text-lg text-gray-600 font-song">正在加载书籍数据...</span>
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
        <BookFiltersPanel
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
        {/* 【修复】将 visibleItems 替换为我们新计算的 itemsToDisplay */}
        <BookGrid
          columnArrays={columnArrays}
          visibleItems={itemsToDisplay}
          onOpenLightbox={handleOpenLightbox}
        />

        {/* 【修复】只有在 hasMore 为 true (无限滚动模式下) 才显示加载触发器和加载动画 */}
        {hasMore && (
          <>
            {/* 无限滚动触发器 */}
            <div ref={loadMoreRef} className={`w-full h-${LOAD_MORE_INDICATOR_HEIGHT}`} />

            {/* 加载更多指示器 */}
            {isLoading && (
              <div className="flex items-center justify-center w-full py-4">
                 <div className="flex items-center text-gray-500">
                   <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
                   <span className="ml-3 font-song">正在加载更多...</span>
                </div>
              </div>
            )}
          </>
        )}

        {/* 空状态提示 */}
        {displayedData.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-charcoal mb-2" style={{fontFamily: "'KaiTi', 'STKaiti', '华文楷体', serif"}}>未找到相关书籍</h3>
            <p className="text-charcoal/60" style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif"}}>请尝试调整搜索条件</p>
          </div>
        )}
      </div>

      {/* 书籍详情灯箱 */}
      <BookDetailModal
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
