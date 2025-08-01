import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Filter, Calendar, ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';

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
      
      // 根据书名关键词添加主题标签
      const title = book.bookname?.toLowerCase() || '';
      if (title.includes('文学') || title.includes('小说') || title.includes('诗') || title.includes('散文')) {
        tags.push('文学');
      } else if (title.includes('政治') || title.includes('革命') || title.includes('主义')) {
        tags.push('政治');
      } else if (title.includes('教育') || title.includes('学校') || title.includes('教学')) {
        tags.push('教育');
      } else if (title.includes('科学') || title.includes('技术') || title.includes('工程')) {
        tags.push('科技');
      } else if (title.includes('历史') || title.includes('史')) {
        tags.push('历史');
      } else if (title.includes('哲学') || title.includes('思想')) {
        tags.push('哲学');
      }
      
      return {
        id: book.id,
        title: book.bookname,
        year: book.year,
        author: book.writer || '佚名',
        publisher: book.publisher || '未知出版社',
        image: book.image,
        category,
        tags: tags.slice(0, 3), // 最多保留3个标签
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
  console.log('📖 [DEBUG] loadBooksDataPaginated 调用:', { page, pageSize, filters });
  
  const allBooks = await loadAllBooksData();
  console.log('📚 [DEBUG] 获取全量数据:', allBooks.length, '本书');
  
  // 应用筛选
  let filteredBooks = allBooks;
  
  if (filters) {
    console.log('🔍 [DEBUG] 开始应用筛选条件:', filters);
    filteredBooks = allBooks.filter(item => {
      const searchTerm = filters.searchTerm.toLowerCase();
      
      // 增强搜索逻辑：检查标题、作者、出版社，以及特殊的生活书店系关键词
      const matchesSearch = !filters.searchTerm || 
        item.title.toLowerCase().includes(searchTerm) ||
        item.author.toLowerCase().includes(searchTerm) ||
        item.publisher.toLowerCase().includes(searchTerm) ||
        // 如果搜索"生活书店"相关词汇，包含所有生活书店系书籍
        (searchTerm.includes('生活书店') || searchTerm.includes('韬奋') || searchTerm.includes('生活') && item.category === '生活书店系');
      
      const matchesYear = filters.year === 'all' || item.year.toString() === filters.year;
      const matchesCategory = filters.category === 'all' || item.category === filters.category;
      
      return matchesSearch && matchesYear && matchesCategory;
    });
    console.log('🎯 [DEBUG] 筛选后数据:', filteredBooks.length, '本书');
  } else {
    console.log('🔄 [DEBUG] 未提供筛选条件，使用全量数据');
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
  
  console.log('📊 [DEBUG] 分页结果:', {
    page,
    start,
    itemsCount: items.length,
    hasMore,
    total: result.total,
    currentPage: result.currentPage
  });
  
  return result;
};

const categoryColors = {
  '生活书店系': 'bg-gold',
  '其他出版社': 'bg-gray-500'
};

interface BookstoreTimelineModuleProps {
  className?: string;
}

export default function BookstoreTimelineModule({ className = '' }: BookstoreTimelineModuleProps) {
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
  
  // Refs
  const observerRef = useRef<IntersectionObserver | null>(null);
  const masonryRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  // 页面大小常量
  const PAGE_SIZE = 30;

  // 初始化加载数据
  useEffect(() => {
    if (!isInitialized) {
      console.log('🔄 [DEBUG] 首次初始化开始');
      setIsInitialized(true);
      loadInitialData();
    }
  }, [isInitialized]);

  // 加载首页数据
  const loadInitialData = async () => {
    console.log('🚀 [DEBUG] loadInitialData 开始执行');
    setIsInitialLoading(true);
    try {
      // 加载全量数据以获取统计信息
      const allBooks = await loadAllBooksData();
      console.log('📚 [DEBUG] 全量数据加载完成，总数:', allBooks.length);
      setAllData(allBooks);
      
      // 构建初始筛选条件，确保与后续加载保持一致
      const filters: FilterOptions = {
        category: selectedCategory,
        year: selectedYear,
        searchTerm
      };
      console.log('🔍 [DEBUG] 初始筛选条件:', filters);
      
      // 加载第一页数据
      const firstPage = await loadBooksDataPaginated(0, PAGE_SIZE, filters);
      console.log('📄 [DEBUG] 首页数据加载结果:', {
        items: firstPage.items.length,
        hasMore: firstPage.hasMore,
        total: firstPage.total,
        currentPage: firstPage.currentPage
      });
      
      setDisplayedData(firstPage.items);
      setHasMore(firstPage.hasMore);
      setTotalCount(firstPage.total);
      setCurrentPage(0);
      
      // 设置初始可见项目（首屏项目立即可见）
      setTimeout(() => {
        const initialVisibleIds = new Set(firstPage.items.slice(0, 12).map(item => item.id));
        console.log('🎆 [DEBUG] 设置初始可见项目:', initialVisibleIds.size, '个');
        setVisibleItems(initialVisibleIds);
      }, 100);
      
    } catch (error) {
      console.error('❌ [DEBUG] 加载数据失败:', error);
    } finally {
      setIsInitialLoading(false);
      console.log('✅ [DEBUG] loadInitialData 执行完成');
    }
  };

  // 加载更多数据
  const loadMoreData = useCallback(async () => {
    console.log('🔄 [DEBUG] loadMoreData 被调用，当前状态:', {
      isLoading,
      hasMore,
      currentPage,
      displayedCount: displayedData.length
    });
    
    if (isLoading || !hasMore) {
      console.log('⏹️ [DEBUG] loadMoreData 提前返回:', { isLoading, hasMore });
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
      console.log('📄 [DEBUG] 准备加载第', nextPage, '页，筛选条件:', filters);
      
      const pageData = await loadBooksDataPaginated(nextPage, PAGE_SIZE, filters);
      console.log('📊 [DEBUG] 加载更多数据结果:', {
        newItems: pageData.items.length,
        hasMore: pageData.hasMore,
        total: pageData.total,
        currentPage: pageData.currentPage
      });
      
      setDisplayedData(prev => {
        const newData = [...prev, ...pageData.items];
        console.log('📈 [DEBUG] 数据更新：从', prev.length, '增加到', newData.length);
        return newData;
      });
      setHasMore(pageData.hasMore);
      setCurrentPage(nextPage);
      setTotalCount(pageData.total);
    } catch (error) {
      console.error('❌ [DEBUG] 加载更多数据失败:', error);
    } finally {
      setIsLoading(false);
      console.log('✅ [DEBUG] loadMoreData 执行完成');
    }
  }, [currentPage, hasMore, isLoading, selectedCategory, selectedYear, searchTerm]);

  // 重置并重新加载数据（搜索/筛选时使用）
  const resetAndReload = useCallback(async () => {
    console.log('🔄 [DEBUG] resetAndReload 开始执行');
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
      console.log('👁️ [DEBUG] 准备设置首屏项目为可见');
      // 使用 setTimeout 确保 DOM 更新后再设置可见性
      setTimeout(() => {
        const initialVisibleIds = new Set(firstPage.items.slice(0, 12).map(item => item.id)); // 前12个项目立即可见
        console.log('🎆 [DEBUG] 设置初始可见项目:', initialVisibleIds.size, '个');
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
    console.log('👀 [DEBUG] 设置卡片可见性观察器');
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const newVisibleIds = new Set<number>();
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const itemId = parseInt(entry.target.getAttribute('data-item-id') || '0');
            newVisibleIds.add(itemId);
            console.log(`✨ [DEBUG] 项目 ${itemId} 变为可见`);
          }
        });
        
        if (newVisibleIds.size > 0) {
          setVisibleItems(prev => {
            const updated = new Set([...prev, ...newVisibleIds]);
            console.log(`📊 [DEBUG] 可见项目更新: ${prev.size} -> ${updated.size}`);
            return updated;
          });
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    return () => {
      console.log('🔌 [DEBUG] 断开卡片可见性观察器');
      observerRef.current?.disconnect();
    };
  }, []);

  // 无限滚动观察器（监听"加载更多"触发点）
  useEffect(() => {
    // 等待初始数据加载完成再设置观察器
    if (isInitialLoading || displayedData.length === 0) {
      console.log('⏳ [DEBUG] 等待初始数据加载完成，跳过观察器设置');
      return;
    }
    
    console.log('🔭 [DEBUG] 设置无限滚动观察器，当前状态:', { hasMore, isLoading, displayedCount: displayedData.length });
    
    const loadMoreObserver = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        console.log('👁️ [DEBUG] 观察器触发:', {
          isIntersecting: target.isIntersecting,
          hasMore,
          isLoading,
          boundingClientRect: target.boundingClientRect
        });
        
        if (target.isIntersecting && hasMore && !isLoading) {
          console.log('🎯 [DEBUG] 触发加载更多数据');
          loadMoreData();
        } else {
          console.log('⛔ [DEBUG] 未触发加载更多，原因:', {
            intersecting: target.isIntersecting,
            hasMore,
            notLoading: !isLoading
          });
        }
      },
      { threshold: 1.0, rootMargin: '100px' } // 提前100px开始加载
    );

    // 延迟设置观察器，确保DOM已渲染
    const timeoutId = setTimeout(() => {
      if (loadMoreRef.current) {
        console.log('📍 [DEBUG] 开始观察加载触发点元素');
        loadMoreObserver.observe(loadMoreRef.current);
      } else {
        console.log('⚠️ [DEBUG] 加载触发点元素不存在');
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      console.log('🔌 [DEBUG] 断开无限滚动观察器');
      loadMoreObserver.disconnect();
    };
  }, [hasMore, isLoading, loadMoreData, displayedData.length, isInitialLoading]);

  // 瀑布流布局计算
  const distributeItems = useCallback(() => {
    console.log('🏗️ [DEBUG] 计算瀑布流布局:', { 
      displayedDataLength: displayedData.length, 
      columns 
    });
    
    const columnArrays: BookItem[][] = Array.from({ length: columns }, () => []);
    const columnHeights = new Array(columns).fill(0);

    displayedData.forEach((item, index) => {
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      columnArrays[shortestColumnIndex].push(item);
      columnHeights[shortestColumnIndex] += item.dimensions.height + 20; // 20px gap
      
      if (index < 5) { // 只记录前5个项目的分布
        console.log(`📋 [DEBUG] 项目 ${index} 分配到列 ${shortestColumnIndex}`);
      }
    });

    console.log('📊 [DEBUG] 布局分配结果:', columnArrays.map((col, i) => `列${i}: ${col.length}项`).join(', '));
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
    
    console.log('🔍 [DEBUG] 开始观察', displayedData.length, '个新项目');
    
    // 延迟观察，确保DOM已渲染
    const timeoutId = setTimeout(() => {
      const items = document.querySelectorAll('[data-item-id]');
      console.log('📋 [DEBUG] 找到', items.length, '个可观察元素');
      
      items.forEach((item, index) => {
        if (observerRef.current) {
          observerRef.current.observe(item);
          if (index < 5) { // 只记录前5个
            console.log(`🔗 [DEBUG] 开始观察项目 ${item.getAttribute('data-item-id')}`);
          }
        }
      });
    }, 50);
    
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
            <h2 className="text-5xl font-bold text-charcoal mb-6 font-serif">
              远读山峦时间轴
            </h2>
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
              <span className="ml-3 text-charcoal/60">正在加载书籍数据...</span>
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
          <h2 className="text-5xl font-bold text-charcoal mb-6 font-serif">
            远读山峦时间轴
          </h2>
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
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-white border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
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
          >
            <option value="all">全部年份</option>
            {uniqueYears.map(year => (
              <option key={year} value={year.toString()}>{year}年</option>
            ))}
          </select>
        </div>

{/* Masonry Grid */}
        <div ref={masonryRef} className="flex gap-5">
          {columnArrays.length > 0 ? (
            columnArrays.map((column, columnIndex) => {
              console.log(`🏛️ [DEBUG] 渲染列 ${columnIndex}，包含 ${column.length} 个项目`);
              return (
                <div key={columnIndex} className="flex-1 flex flex-col gap-5">
                  {column.map((item, itemIndex) => {
                    if (itemIndex < 3) { // 只调试前3个项目
                      console.log(`🎨 [DEBUG] 渲染项目 ${item.id} 在列 ${columnIndex}`);
                    }
                    return (
                      <div
                        key={item.id}
                        data-item-id={item.id}
                        className={`group cursor-pointer transform transition-all duration-700 ${
                          visibleItems.has(item.id)
                            ? 'translate-y-0 opacity-100'
                            : 'translate-y-8 opacity-0'
                        }`}
                        onClick={() => openLightbox(item)}
                        style={{
                          animationDelay: `${columnIndex * 100}ms`
                        }}
                      >
                        <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-amber-200">
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
                          </div>
                          <div className="p-4 bg-amber-50">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-1 rounded-full text-xs text-white bg-gold">
                                {item.year}年
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs text-white ${categoryColors[item.category as keyof typeof categoryColors] || 'bg-gray-500'}`}>
                                {item.category}
                              </span>
                            </div>
                            <h3 className="font-bold text-charcoal mb-2 group-hover:text-gold transition-colors line-clamp-2">
                              {item.title}
                            </h3>
                            <p className="text-sm text-charcoal/70 mb-1">
                              作者：{item.author}
                            </p>
                            <p className="text-sm text-charcoal/70 mb-2">
                              出版：{item.publisher}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {item.tags.slice(0, 2).map((tag, index) => (
                                <span key={index} className="text-xs bg-gold/10 text-gold px-2 py-1 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
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
              <p className="text-charcoal/60">🔍 [DEBUG] columnArrays 为空，无数据渲染</p>
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
              <span className="text-charcoal/60">正在加载更多...</span>
            </div>
          </div>
        )}

        {/* No more data indicator */}
        {!hasMore && displayedData.length > 0 && (
          <div className="text-center py-8">
            <p className="text-charcoal/50 text-sm">
              📚 已显示全部 {displayedData.length} 本书籍
            </p>
          </div>
        )}

        {/* Empty state */}
        {displayedData.length === 0 && !isInitialLoading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-charcoal mb-2">未找到相关书籍</h3>
            <p className="text-charcoal/60">请尝试调整搜索条件</p>
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
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full text-sm text-white bg-gold">
                    {selectedItem.year}年
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm text-white ${categoryColors[selectedItem.category as keyof typeof categoryColors] || 'bg-gray-500'}`}>
                    {selectedItem.category}
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold text-charcoal mb-4 font-serif">
                  {selectedItem.title}
                </h3>
                
                <div className="space-y-3 mb-6">
                  <p className="text-charcoal/80">
                    <span className="font-semibold">作者：</span>{selectedItem.author}
                  </p>
                  <p className="text-charcoal/80">
                    <span className="font-semibold">出版社：</span>{selectedItem.publisher}
                  </p>
                  <p className="text-charcoal/80">
                    <span className="font-semibold">出版年份：</span>{selectedItem.year}年
                  </p>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-bold text-charcoal mb-2">标签</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map((tag, index) => (
                      <span key={index} className="bg-gold/10 text-gold px-3 py-1 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-charcoal/60 text-center">
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
