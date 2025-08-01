import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { BookItem, FilterOptions, BookData, PaginatedResponse } from '../../types/bookTypes';
import { PAGE_SIZE } from '../../constants/bookConstants';
import { fuzzyMatch, downloadCSV } from '../../utils/bookUtils';

import BookstoreHeader from './BookstoreHeader';
import BookstoreFilters from './BookstoreFilters';
import BookGrid from './BookGrid';
import BookLightbox from './BookLightbox';


// 全局缓存
let allBooksCache: BookItem[] | null = null;

// 加载和处理所有书籍数据
const loadAllBooksData = async (): Promise<BookItem[]> => {
  if (allBooksCache) return allBooksCache;
  
  const response = await fetch('/data/books_clean.json');
  const booksData: BookData[] = await response.json();
  
  allBooksCache = booksData
    .filter(book => book.image && book.year >= 1900 && book.year <= 1949)
    .map(book => {
      let category = '其他出版社';
      const isLifeBookstore = 
        book.publisher?.includes('生活书店') || 
        book.publisher?.includes('生活周刊社') ||
        book.publisher?.includes('读书生活出版社') ||
        book.publisher?.includes('读书生活社') ||
        book.publisher?.includes('生活出版社') ||
        book.publisher?.includes('新生活书店') ||
        book.writer?.includes('邹韬奋') ||
        book.writer?.includes('韬奋') ||
        book.writer?.includes('生活书店');
      
      if (isLifeBookstore) {
        category = '生活书店系';
      }
      
      return {
        id: book.id,
        title: book.bookname,
        year: book.year,
        author: book.writer || '佚名',
        publisher: book.publisher || '未知出版社',
        image: book.image,
        category,
        tags: [category, `${Math.floor(book.year / 10) * 10}年代`],
        dimensions: {
          width: 200,
          height: Math.floor(Math.random() * 100) + 250
        }
      };
    })
    .sort((a, b) => a.year - b.year);
    
  return allBooksCache;
};

// 分页加载和筛选数据
const loadBooksDataPaginated = async (
  page: number = 0,
  pageSize: number = 30,
  filters?: FilterOptions
): Promise<PaginatedResponse> => {
  const allBooks = await loadAllBooksData();
  
  let filteredBooks = allBooks;
  
  if (filters) {
    filteredBooks = allBooks.filter(item => {
      const matchesSearch = !filters.searchTerm || 
        fuzzyMatch(filters.searchTerm, item.title) ||
        fuzzyMatch(filters.searchTerm, item.author) ||
        fuzzyMatch(filters.searchTerm, item.publisher);
      
      const matchesYear = filters.year === 'all' || item.year.toString() === filters.year;
      const matchesCategory = filters.category === 'all' || item.category === filters.category;
      
      return matchesSearch && matchesYear && matchesCategory;
    });
  }
  
  const start = page * pageSize;
  const items = filteredBooks.slice(start, start + pageSize);
  const hasMore = start + pageSize < filteredBooks.length;
  
  return {
    items,
    hasMore,
    total: filteredBooks.length,
    currentPage: page
  };
};

interface BookstoreTimelineModuleProps {
  className?: string;
}

export default function BookstoreTimelineModule({ className = '' }: BookstoreTimelineModuleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const [displayedData, setDisplayedData] = useState<BookItem[]>([]);
  const [allData, setAllData] = useState<BookItem[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  const [selectedItem, setSelectedItem] = useState<BookItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const [columns, setColumns] = useState(4);
  const [isRapidScrolling, setIsRapidScrolling] = useState(false);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<number | null>(null);

  const loadInitialData = useCallback(async () => {
    setIsInitialLoading(true);
    try {
      const allBooks = await loadAllBooksData();
      setAllData(allBooks);
      
      const filters: FilterOptions = { category: 'all', year: 'all', searchTerm: '' };
      const firstPage = await loadBooksDataPaginated(0, PAGE_SIZE, filters);
      
      setDisplayedData(firstPage.items);
      setHasMore(firstPage.hasMore);
      setCurrentPage(0);
      
      setTimeout(() => {
        const initialVisibleIds = new Set(firstPage.items.slice(0, 20).map(item => item.id));
        setVisibleItems(initialVisibleIds);
      }, 100);
      
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const loadMoreData = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    try {
      const nextPage = currentPage + 1;
      const filters: FilterOptions = { category: selectedCategory, year: selectedYear, searchTerm };
      
      const pageData = await loadBooksDataPaginated(nextPage, PAGE_SIZE, filters);
      
      setDisplayedData(prev => [...prev, ...pageData.items]);
      setHasMore(pageData.hasMore);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('加载更多数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, hasMore, isLoading, selectedCategory, selectedYear, searchTerm]);

  const resetAndReload = useCallback(async () => {
    setIsLoading(true);
    setDisplayedData([]);
    try {
      const filters: FilterOptions = { category: selectedCategory, year: selectedYear, searchTerm };
      
      const firstPage = await loadBooksDataPaginated(0, PAGE_SIZE, filters);
      setDisplayedData(firstPage.items);
      setHasMore(firstPage.hasMore);
      setCurrentPage(0);
      
      setTimeout(() => {
        const initialVisibleIds = new Set(firstPage.items.slice(0, 20).map(item => item.id));
        setVisibleItems(initialVisibleIds);
      }, 100);
      
    } catch (error) {
      console.error('重新加载数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedYear, searchTerm]);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) setColumns(1);
      else if (width < 768) setColumns(2);
      else if (width < 1024) setColumns(3);
      else setColumns(4);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollSpeed = Math.abs(currentScrollY - lastScrollY.current);
      lastScrollY.current = currentScrollY;
      
      if (scrollSpeed > 30) {
        setIsRapidScrolling(true);
        const viewportHeight = window.innerHeight;
        const scrollTop = window.scrollY;
        const triggerZone = scrollTop + viewportHeight + 400;
        
        const cardElements = document.querySelectorAll('[data-item-id]');
        const newVisibleIds = new Set(visibleItems);
        
        cardElements.forEach((element) => {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + scrollTop;
          
          if (elementTop < triggerZone) {
            const itemId = parseInt(element.getAttribute('data-item-id') || '0');
            newVisibleIds.add(itemId);
          }
        });
        
        setVisibleItems(newVisibleIds);
      }
      
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      
      scrollTimeout.current = setTimeout(() => {
        setIsRapidScrolling(false);
      }, 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [visibleItems]);

  useEffect(() => {
    if (isInitialLoading) return;
    
    const debounceTimer = setTimeout(() => {
      resetAndReload();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedCategory, selectedYear, isInitialLoading, resetAndReload]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const newVisibleIds = new Set<number>();
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const itemId = parseInt(entry.target.getAttribute('data-item-id') || '0');
            newVisibleIds.add(itemId);
          }
        });
        
        if (newVisibleIds.size > 0) {
          setVisibleItems(prev => new Set([...prev, ...newVisibleIds]));
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    return () => observerRef.current?.disconnect();
  }, []);

  useEffect(() => {
    if (isInitialLoading || displayedData.length === 0) return;
    
    const loadMoreObserver = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoading) {
          loadMoreData();
        }
      },
      { threshold: 1.0, rootMargin: '300px' }
    );

    const timeoutId = setTimeout(() => {
      if (loadMoreRef.current) {
        loadMoreObserver.observe(loadMoreRef.current);
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      loadMoreObserver.disconnect();
    };
  }, [hasMore, isLoading, loadMoreData, displayedData.length, isInitialLoading]);

  const columnArrays = useMemo(() => {
    const arrays: BookItem[][] = Array.from({ length: columns }, () => []);
    const heights = new Array(columns).fill(0);

    displayedData.forEach((item) => {
      const shortestColumnIndex = heights.indexOf(Math.min(...heights));
      arrays[shortestColumnIndex].push(item);
      heights[shortestColumnIndex] += item.dimensions.height + 20;
    });

    return arrays;
  }, [displayedData, columns]);

  const openLightbox = (item: BookItem) => {
    setSelectedItem(item);
    setCurrentIndex(displayedData.findIndex(i => i.id === item.id));
  };

  const closeLightbox = () => setSelectedItem(null);

  const nextItem = useCallback(() => {
    if (!selectedItem) return;
    const newIndex = (currentIndex + 1) % displayedData.length;
    setCurrentIndex(newIndex);
    setSelectedItem(displayedData[newIndex]);
  }, [currentIndex, displayedData, selectedItem]);

  const prevItem = useCallback(() => {
    if (!selectedItem) return;
    const newIndex = currentIndex === 0 ? displayedData.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setSelectedItem(displayedData[newIndex]);
  }, [currentIndex, displayedData, selectedItem]);

  useEffect(() => {
    if (!observerRef.current || displayedData.length === 0) return;
    
    const timeoutId = setTimeout(() => {
      const items = document.querySelectorAll('[data-item-id]');
      items.forEach((item) => {
        if (observerRef.current) {
          observerRef.current.observe(item);
        }
      });
    }, 20);
    
    return () => clearTimeout(timeoutId);
  }, [displayedData.length]);

  const uniqueYears = useMemo(() => [...new Set(allData.map(item => item.year))].sort((a,b) => a-b), [allData]);
  const uniqueCategories = useMemo(() => [...new Set(allData.map(item => item.category))].sort(), [allData]);

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
          onOpenLightbox={openLightbox}
        />

        <div ref={loadMoreRef} className="w-full h-4" />

        {isLoading && hasMore && (
          <div className="text-center py-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold mr-3"></div>
              <span className="text-charcoal/60" style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif"}}>正在加载更多...</span>
            </div>
          </div>
        )}

        {!hasMore && displayedData.length > 0 && (
          <div className="text-center py-8">
            <p className="text-charcoal/50 text-sm" style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif"}}>
              📚 已显示 {displayedData.length} 本书籍
            </p>
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
        onNext={nextItem}
        onPrev={prevItem}
      />
    </section>
  );
}
