/**
 * 邹韬奋纪念网站 - 书店模块
 * * 主要功能：
 * - 展示与生活书店相关的书籍
 * - 支持按年份、出版社分类筛选
 * - 实现瀑布流布局和无限滚动
 * - 提供书籍详情灯箱预览
 * - 支持CSV数据导出
 */

import { useState, useEffect, useMemo, useRef } from 'react'; // 【修改】引入 useRef
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

// UI常量配置
const SEARCH_DEBOUNCE_DELAY = 300;   // 搜索防抖延迟(ms)
const COLUMN_GAP = 20;               // 瀑布流列间距(px)
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
              <div className="text-center py-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold mr-3"></div>
                  <span className="text-charcoal/60" style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif"}}>正在加载更多...</span>
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