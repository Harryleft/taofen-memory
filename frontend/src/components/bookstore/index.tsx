import { useState, useEffect, useMemo } from 'react';
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

const SEARCH_DEBOUNCE_DELAY = 300;
const COLUMN_GAP = 20;
const LOAD_MORE_INDICATOR_HEIGHT = 4;

interface BookstoreTimelineModuleProps {
  className?: string;
}

export default function BookstoreTimelineModule({ className = '' }: BookstoreTimelineModuleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const filters: FilterOptions = { searchTerm, category: selectedCategory, year: selectedYear };
  
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
  
  const { columns } = useResponsiveColumns();
  
  const {
    visibleItems,
    isRapidScrolling,
    loadMoreRef,
    invalidateCache,
    setInitialVisibleItems
  } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: loadMoreData,
    displayedDataLength: displayedData.length
  });
  
  const {
    selectedItem,
    currentIndex,
    openLightbox,
    closeLightbox,
    nextItem,
    prevItem
  } = useLightbox();

  useEffect(() => {
    if (isInitialLoading) return;
    
    const debounceTimer = setTimeout(() => {
      resetAndReload(filters);
      invalidateCache();
    }, SEARCH_DEBOUNCE_DELAY);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedCategory, selectedYear, isInitialLoading, resetAndReload, invalidateCache, filters]);
  
  useEffect(() => {
    if (displayedData.length > 0) {
      setInitialVisibleItems(displayedData);
    }
  }, [displayedData, setInitialVisibleItems]);

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

  const handleOpenLightbox = (item: BookItem) => {
    openLightbox(item, displayedData);
  };
  
  const handleNextItem = () => {
    nextItem(displayedData);
  };
  
  const handlePrevItem = () => {
    prevItem(displayedData);
  };

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

        <BookGrid
          columnArrays={columnArrays}
          visibleItems={visibleItems}
          isRapidScrolling={isRapidScrolling}
          onOpenLightbox={handleOpenLightbox}
        />

        <div ref={loadMoreRef} className={`w-full h-${LOAD_MORE_INDICATOR_HEIGHT}`} />

        {isLoading && hasMore && (
          <div className="text-center py-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold mr-3"></div>
              <span className="text-charcoal/60" style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif"}}>正在加载更多...</span>
            </div>
          </div>
        )}

        {displayedData.length === 0 && !isInitialLoading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-charcoal mb-2" style={{fontFamily: "'KaiTi', 'STKaiti', '华文楷体', serif"}}>未找到相关书籍</h3>
            <p className="text-charcoal/60" style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif"}}>请尝试调整搜索条件</p>
          </div>
        )}
      </div>

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
