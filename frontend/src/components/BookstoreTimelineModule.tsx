import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Filter, Calendar, ZoomIn, X, ChevronLeft, ChevronRight, Download } from 'lucide-react';

// 书籍数据结构
interface BookData {
  id: number;
  year: number;
  bookname: string;
  writer: string;
  publisher: string;
  image: string;
}

// 卡片展示数据结构
interface BookItem {
  id: number;
  title: string;
  year: number;
  author: string;
  publisher: string;
  image: string;
  category: string;
  tags: string[];
  dimensions: {
    width: number;
    height: number;
  };
}

// 分页响应接口
interface PaginatedResponse {
  items: BookItem[];
  hasMore: boolean;
  total: number;
  currentPage: number;
}

// 筛选选项接口
interface FilterOptions {
  category: string;
  year: string;
  searchTerm: string;
}

// 智能搜索关键词映射表
const searchKeywordMap: Record<string, string[]> = {
  '韬奋': ['邹韬奋', '韬奋'],
  '生活书店': ['生活书店', '生活周刊社', '读书生活出版社', '读书生活社', '生活出版社', '新生活书店'],

};

// 通用模糊搜索函数
const fuzzyMatch = (searchTerm: string, targetText: string): boolean => {
  const lowerSearchTerm = searchTerm.toLowerCase();
  const lowerTargetText = targetText.toLowerCase();
  
  // 直接匹配
  if (lowerTargetText.includes(lowerSearchTerm)) {
    return true;
  }
  
  // 智能关键词映射匹配
  const mappedKeywords = searchKeywordMap[searchTerm];
  if (mappedKeywords) {
    return mappedKeywords.some(keyword => 
      lowerTargetText.includes(keyword.toLowerCase())
    );
  }
  
  // 分词匹配（对于多字搜索词）
  if (searchTerm.length > 1) {
    const chars = searchTerm.split('');
    // 检查是否所有字符都在目标文本中按顺序出现
    let lastIndex = -1;
    const allCharsFound = chars.every(char => {
      const index = lowerTargetText.indexOf(char, lastIndex + 1);
      if (index > lastIndex) {
        lastIndex = index;
        return true;
      }
      return false;
    });
    if (allCharsFound) return true;
  }
  
  return false;
};

// CSV生成和下载功能
const generateCSV = (books: BookItem[]): string => {
  // CSV表头
  const headers = ['书名', '作者', '出版社', '出版年份', '分类', '书籍ID'];
  
  // 转换数据为CSV格式
  const csvContent = [
    headers.join(','),
    ...books.map(book => [
      `"${book.title.replace(/"/g, '""')}"`, // 处理书名中的引号
      `"${book.author.replace(/"/g, '""')}"`,
      `"${book.publisher.replace(/"/g, '""')}"`,
      book.year,
      `"${book.category}"`,
      book.id
    ].join(','))
  ].join('\n');
  
  return csvContent;
};

const downloadCSV = (books: BookItem[]) => {
  const csvContent = generateCSV(books);
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // 添加BOM以支持中文
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `韬奋时光书影_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

// 全量数据缓存
let allBooksCache: BookItem[] | null = null;

// 加载所有书籍数据（仅首次加载，后续使用缓存）
const loadAllBooksData = async (): Promise<BookItem[]> => {
  if (allBooksCache) return allBooksCache;
  
  const response = await fetch('/data/books_clean.json');
  const booksData: BookData[] = await response.json();
  
  allBooksCache = booksData
    .filter(book => book.image && book.year >= 1900 && book.year <= 1949)
    .map(book => {
      // 智能分类书籍 - 简化为两种分类
      let category = '其他出版社';
      let tags = [];
      
      // 判断是否属于生活书店系（检查出版社和作者）
      const isLifeBookstore = 
        // 检查出版社
        book.publisher?.includes('生活书店') || 
        book.publisher?.includes('生活周刊社') ||
        book.publisher?.includes('读书生活出版社') ||
        book.publisher?.includes('读书生活社') ||
        book.publisher?.includes('生活出版社') ||
        book.publisher?.includes('新生活书店') ||
        // 检查作者（生活书店相关作者）
        book.writer?.includes('邹韬奋') ||
        book.writer?.includes('韬奋') ||
        book.writer?.includes('生活书店') ||
        // 可以根据需要添加更多生活书店系相关作者
        false;
      
      if (isLifeBookstore) {
        category = '生活书店系';
        tags.push('生活书店系');
      } else {
        category = '其他出版社';
        tags.push('其他出版社');
      }
      
      // 添加年代标签
      const decade = Math.floor(book.year / 10) * 10;
      tags.push(`${decade}年代`);
      
      
      return {
        id: book.id,
        title: book.bookname,
        year: book.year,
        author: book.writer || '佚名',
        publisher: book.publisher || '未知出版社',
        image: book.image,
        category,
        tags: tags.slice(0, 2), // 最多保留2个标签：分类标签和年代标签
        dimensions: {
          width: 200,
          height: Math.floor(Math.random() * 100) + 250 // 随机高度模拟不同封面尺寸
        }
      };
    })
    .sort((a, b) => a.year - b.year); // 按年份排序保持时间连续性
    
  return allBooksCache;
};

// 分页加载书籍数据
const loadBooksDataPaginated = async (
  page: number = 0,
  pageSize: number = 30,
  filters?: FilterOptions
): Promise<PaginatedResponse> => {
  const allBooks = await loadAllBooksData();
  
  // 应用筛选
  let filteredBooks = allBooks;
  
  if (filters) {
    filteredBooks = allBooks.filter(item => {
      const searchTerm = filters.searchTerm.toLowerCase();
      
      // 使用通用模糊搜索匹配
      const matchesSearch = !filters.searchTerm || 
        fuzzyMatch(filters.searchTerm, item.title) ||
        fuzzyMatch(filters.searchTerm, item.author) ||
        fuzzyMatch(filters.searchTerm, item.publisher);
      
      const matchesYear = filters.year === 'all' || item.year.toString() === filters.year;
      const matchesCategory = filters.category === 'all' || item.category === filters.category;
      
      return matchesSearch && matchesYear && matchesCategory;
    });
  }
  
  // 分页
  const start = page * pageSize;
  const items = filteredBooks.slice(start, start + pageSize);
  const hasMore = start + pageSize < filteredBooks.length;
  
  const result = {
    items,
    hasMore,
    total: filteredBooks.length,
    currentPage: page
  };
  
  return result;
};

const categoryColors = {
  '生活书店系': 'bg-gold',
  '其他出版社': 'bg-gray-500'
};

interface TaofenHeritageModuleProps {
  className?: string;
}

export default function TaofenHeritageModule({ className = '' }: TaofenHeritageModuleProps) {
  // *** 懒加载版本 v2.0 - 2025-01-30 ***
  
  // 筛选状态
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // 懒加载状态
  const [displayedData, setDisplayedData] = useState<BookItem[]>([]); // 当前显示的数据
  const [allData, setAllData] = useState<BookItem[]>([]); // 完整数据集（用于获取统计信息）
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false); // 防止重复初始化
  
  // 灯箱状态
  const [selectedItem, setSelectedItem] = useState<BookItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // UI状态
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const [columns, setColumns] = useState(4);
  const [isRapidScrolling, setIsRapidScrolling] = useState(false); // 快速滚动状态
  
  // Refs
  const observerRef = useRef<IntersectionObserver | null>(null);
  const masonryRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // 页面大小常量
  const PAGE_SIZE = 30;

  // 初始化加载数据
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      loadInitialData();
    }
  }, [isInitialized]);

  // 加载首页数据
  const loadInitialData = async () => {
    setIsInitialLoading(true);
    try {
      // 加载全量数据以获取统计信息
      const allBooks = await loadAllBooksData();
      setAllData(allBooks);
      
      // 构建初始筛选条件，确保与后续加载保持一致
      const filters: FilterOptions = {
        category: selectedCategory,
        year: selectedYear,
        searchTerm
      };
      
      // 加载第一页数据
      const firstPage = await loadBooksDataPaginated(0, PAGE_SIZE, filters);
      
      setDisplayedData(firstPage.items);
      setHasMore(firstPage.hasMore);
      setTotalCount(firstPage.total);
      setCurrentPage(0);
      
      // 设置初始可见项目（首屏项目立即可见）
      setTimeout(() => {
        const initialVisibleIds = new Set(firstPage.items.slice(0, 20).map(item => item.id)); // 增加首屏可见项目
        setVisibleItems(initialVisibleIds);
      }, 100);
      
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  // 加载更多数据
  const loadMoreData = useCallback(async () => {
    if (isLoading || !hasMore) {
      return;
    }
    
    setIsLoading(true);
    try {
      const nextPage = currentPage + 1;
      const filters: FilterOptions = {
        category: selectedCategory,
        year: selectedYear,
        searchTerm
      };
      
      const pageData = await loadBooksDataPaginated(nextPage, PAGE_SIZE, filters);
      
      setDisplayedData(prev => {
        const newData = [...prev, ...pageData.items];
        return newData;
      });
      setHasMore(pageData.hasMore);
      setCurrentPage(nextPage);
      setTotalCount(pageData.total);
    } catch (error) {
      console.error('加载更多数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, hasMore, isLoading, selectedCategory, selectedYear, searchTerm]);

  // 重置并重新加载数据（搜索/筛选时使用）
  const resetAndReload = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters: FilterOptions = {
        category: selectedCategory,
        year: selectedYear,
        searchTerm
      };
      
      const firstPage = await loadBooksDataPaginated(0, PAGE_SIZE, filters);
      setDisplayedData(firstPage.items);
      setHasMore(firstPage.hasMore);
      setTotalCount(firstPage.total);
      setCurrentPage(0);
      
      // 不立即清空 visibleItems，让首屏项目立即可见
      // 使用 setTimeout 确保 DOM 更新后再设置可见性
      setTimeout(() => {
        const initialVisibleIds = new Set(firstPage.items.slice(0, 20).map(item => item.id)); // 前20个项目立即可见
        setVisibleItems(initialVisibleIds);
      }, 100);
      
    } catch (error) {
      console.error('重新加载数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedYear, searchTerm]);

  // 响应式列数
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

  // 快速滚动检测
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollSpeed = Math.abs(currentScrollY - lastScrollY.current);
      lastScrollY.current = currentScrollY;
      
      // 滚动速度大于30px表示快速滚动
      if (scrollSpeed > 30) {
        setIsRapidScrolling(true);
        
        // 快速滚动时，批量显示即将进入视口的项目
        const viewportHeight = window.innerHeight;
        const scrollTop = window.scrollY;
        const triggerZone = scrollTop + viewportHeight + 400; // 提前400px
        
        // 获取所有卡片元素
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
      
      // 清除之前的定时器
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      
      // 设置新的定时器，滚动停止500ms后恢复正常状态
      scrollTimeout.current = setTimeout(() => {
        setIsRapidScrolling(false);
      }, 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [visibleItems]);

  // 搜索/筛选变化时重新加载数据（跳过初始化时的触发）
  useEffect(() => {
    // 跳过初始化时的调用，避免与 loadInitialData 产生竞争
    if (isInitialLoading) return;
    
    const debounceTimer = setTimeout(() => {
      resetAndReload();
    }, 300); // 300ms防抖

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedCategory, selectedYear, isInitialLoading]);

  // 卡片可见性观察器（用于渐进动画）
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
          setVisibleItems(prev => {
            const updated = new Set([...prev, ...newVisibleIds]);
            return updated;
          });
        }
      },
      { threshold: 0.1, rootMargin: '200px' } // 增大可见性检测范围
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // 无限滚动观察器（监听"加载更多"触发点）
  useEffect(() => {
    // 等待初始数据加载完成再设置观察器
    if (isInitialLoading || displayedData.length === 0) {
      return;
    }
    
    const loadMoreObserver = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        
        if (target.isIntersecting && hasMore && !isLoading) {
          loadMoreData();
        }
      },
      { threshold: 1.0, rootMargin: '300px' } // 提前300px开始加载
    );

    // 延迟设置观察器，确保DOM已渲染
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

  // 瀑布流布局计算
  const distributeItems = useCallback(() => {
    const columnArrays: BookItem[][] = Array.from({ length: columns }, () => []);
    const columnHeights = new Array(columns).fill(0);

    displayedData.forEach((item, index) => {
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      columnArrays[shortestColumnIndex].push(item);
      columnHeights[shortestColumnIndex] += item.dimensions.height + 20; // 20px gap
    });

    return columnArrays;
  }, [displayedData, columns]);

  const columnArrays = distributeItems();

  // 灯箱导航
  const openLightbox = (item: BookItem) => {
    setSelectedItem(item);
    setCurrentIndex(displayedData.findIndex(i => i.id === item.id));
  };

  const nextItem = () => {
    const newIndex = (currentIndex + 1) % displayedData.length;
    setCurrentIndex(newIndex);
    setSelectedItem(displayedData[newIndex]);
  };

  const prevItem = () => {
    const newIndex = currentIndex === 0 ? displayedData.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setSelectedItem(displayedData[newIndex]);
  };

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedItem) {
        if (e.key === 'Escape') setSelectedItem(null);
        if (e.key === 'ArrowRight') nextItem();
        if (e.key === 'ArrowLeft') prevItem();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, currentIndex]);

  // 观察项目（当数据更新时重新观察）
  useEffect(() => {
    if (!observerRef.current || displayedData.length === 0) return;
    
    // 延迟观察，确保DOM已渲染
    const timeoutId = setTimeout(() => {
      const items = document.querySelectorAll('[data-item-id]');
      
      items.forEach((item, index) => {
        if (observerRef.current) {
          observerRef.current.observe(item);
        }
      });
    }, 20); // 减少延迟时间
    
    return () => clearTimeout(timeoutId);
  }, [displayedData.length]); // 只在数据长度变化时重新观察

  const uniqueYears = [...new Set(allData.map(item => item.year))].sort();
  const uniqueCategories = [...new Set(allData.map(item => item.category))].sort();
  const yearRange = allData.length > 0 
    ? `${Math.min(...allData.map(d => d.year))}-${Math.max(...allData.map(d => d.year))}`
    : '';

  // 显示加载状态
  if (isInitialLoading) {
    return (
      <section className={`relative py-20 bg-white ${className}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-charcoal mb-6" style={{fontFamily: "'FangSong', 'STFangSong', '华文仿宋', serif"}}>
              韬奋·时光书影
            </h2>
            <p className="text-lg text-charcoal/70 mb-2" style={{fontFamily: "'KaiTi', 'STKaiti', '华文楷体', serif"}}>
              探寻生活书店出版文化印记
            </p>
            {/* <p className="text-sm text-charcoal/50" style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif", letterSpacing: '0.05em'}}>
              1900-1949年
            </p> */}
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
              <span className="ml-3 text-charcoal/60" style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif"}}>正在加载书籍数据...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`relative py-20 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-charcoal mb-6" style={{fontFamily: "'FangSong', 'STFangSong', '华文仿宋', serif"}}>
            韬奋·时光书影
          </h2>
          <p className="text-lg text-charcoal/70 mb-2" style={{fontFamily: "'KaiTi', 'STKaiti', '华文楷体', serif"}}>
            探寻生活书店出版文化印记
          </p>
          {/* <p className="text-sm text-charcoal/50" style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif", letterSpacing: '0.05em'}}>
            1900-1949年
          </p> */}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/60" size={20} />
            <input
              type="text"
              placeholder="搜索书籍、作者、出版社..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 w-80"
              style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif"}}
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-white border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
            style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif"}}
          >
            <option value="all">全部出版社</option>
            {uniqueCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 bg-white border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
            style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif"}}
          >
            <option value="all">全部年份</option>
            {uniqueYears.map(year => (
              <option key={year} value={year.toString()}>{year}年</option>
            ))}
          </select>

          {/* CSV下载按钮 */}
          <button
            onClick={() => downloadCSV(allData)}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gold/30 text-charcoal rounded-lg hover:bg-gold/5 hover:border-gold/60 focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all duration-300 shadow-sm hover:shadow-md"
            style={{fontFamily: "'KaiTi', 'STKaiti', '华文楷体', serif"}}
            title="下载全部书籍数据为CSV文件"
          >
            <Download size={18} className="text-gold" />
            <span className="font-medium">导出数据</span>
          </button>
        </div>

        {/* 数据统计信息 */}
        {/* <div className="text-center mb-6">
          <p className="text-charcoal/60 text-sm" style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif"}}>
            当前显示 <span className="font-bold text-gold">{displayedData.length}</span> 本
            {totalCount !== displayedData.length && (
              <span> / 共 <span className="font-bold text-charcoal">{totalCount}</span> 本</span>
            )}
            {searchTerm && (
              <span className="ml-2 text-amber-600">「{searchTerm}」</span>
            )}
          </p>
        </div> */}

{/* Masonry Grid */}
        <div ref={masonryRef} className="flex gap-5">
          {columnArrays.length > 0 ? (
            columnArrays.map((column, columnIndex) => {
              return (
                <div key={columnIndex} className="flex-1 flex flex-col gap-5">
                  {column.map((item, itemIndex) => {
                    return (
                      <div
                        key={item.id}
                        data-item-id={item.id}
                        className={`group cursor-pointer transform transition-all ${
                          isRapidScrolling ? 'duration-300' : 'duration-700'
                        } ${
                          visibleItems.has(item.id)
                            ? 'translate-y-0 opacity-100'
                            : 'translate-y-8 opacity-0'
                        }`}
                        onClick={() => openLightbox(item)}
                        style={{
                          animationDelay: `${columnIndex * 100}ms`
                        }}
                      >
                        <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-amber-200 relative">
                          <div className="relative overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full object-cover group-hover:scale-110 transition-transform duration-700"
                              style={{ height: `${item.dimensions.height}px` }}
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                              <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={32} />
                            </div>
                            
                            {/* 专业年份标签 - 左下角 */}
                            <div className="absolute bottom-3 left-3">
                              <div className="relative">
                                {/* 背景层 - 磨砂玻璃效果 */}
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-lg"></div>
                                {/* 内容层 */}
                                <div className="relative px-3 py-1.5 text-white">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-1 h-1 bg-gold rounded-full"></div>
                                    <span className="text-xs font-medium tracking-wide">
                                      {item.year}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="p-4 bg-amber-50">
                            <h3 className="font-bold text-charcoal mb-2 group-hover:text-gold transition-colors line-clamp-2" style={{fontFamily: "'KaiTi', 'STKaiti', '华文楷体', serif", letterSpacing: '0.02em'}}>
                              {item.title}
                            </h3>
                            <p className="text-sm text-charcoal/70 mb-1" style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif"}}>
                              作者：{item.author}
                            </p>
                            <p className="text-sm text-charcoal/70 mb-2" style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif"}}>
                              出版：{item.publisher}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })
          ) : (
            <div className="w-full text-center py-8">
              <p className="text-charcoal/60" style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif"}}>无数据可显示</p>
            </div>
          )}
        </div>

        {/* Load more trigger point */}
        <div ref={loadMoreRef} className="w-full h-4" />

        {/* Loading more indicator */}
        {isLoading && hasMore && (
          <div className="text-center py-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold mr-3"></div>
              <span className="text-charcoal/60" style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif"}}>正在加载更多...</span>
            </div>
          </div>
        )}

        {/* No more data indicator */}
        {!hasMore && displayedData.length > 0 && (
          <div className="text-center py-8">
            <p className="text-charcoal/50 text-sm" style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif"}}>
              📚 已显示全部 {displayedData.length} 本书籍
            </p>
          </div>
        )}

        {/* Empty state */}
        {displayedData.length === 0 && !isInitialLoading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-charcoal mb-2" style={{fontFamily: "'KaiTi', 'STKaiti', '华文楷体', serif"}}>未找到相关书籍</h3>
            <p className="text-charcoal/60" style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif"}}>请尝试调整搜索条件</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
            {/* Navigation */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <X size={24} />
            </button>
            
            <button
              onClick={prevItem}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <ChevronLeft size={32} />
            </button>
            
            <button
              onClick={nextItem}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <ChevronRight size={32} />
            </button>

            {/* Content */}
            <div className="flex flex-col lg:flex-row max-h-[90vh]">
              {/* Image */}
              <div className="flex-1 flex items-center justify-center bg-amber-50 p-4">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              
              {/* Details */}
              <div className="w-full lg:w-96 p-6 overflow-y-auto bg-white">
                <h3 className="text-2xl font-bold text-charcoal mb-4" style={{fontFamily: "'KaiTi', 'STKaiti', '华文楷体', serif", letterSpacing: '0.02em'}}>
                  {selectedItem.title}
                </h3>
                
                <div className="space-y-3 mb-6">
                  <p className="text-charcoal/80" style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif"}}>
                    <span className="font-semibold">作者：</span>{selectedItem.author}
                  </p>
                  <p className="text-charcoal/80" style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif"}}>
                    <span className="font-semibold">出版社：</span>{selectedItem.publisher}
                  </p>
                  <p className="text-charcoal/80" style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif"}}>
                    <span className="font-semibold">出版年份：</span>{selectedItem.year}年
                  </p>
                </div>
                
                <div className="mt-4 text-sm text-charcoal/60 text-center" style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif"}}>
                  {currentIndex + 1} / {displayedData.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}