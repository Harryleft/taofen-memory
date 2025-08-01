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

// 加载书籍数据并转换为卡片格式
const loadBooksData = async (): Promise<BookItem[]> => {
  const response = await fetch('/data/books_clean.json');
  const booksData: BookData[] = await response.json();
  
  return booksData
    .filter(book => book.image && book.publisher?.includes('生活书店') && book.year >= 1900 && book.year <= 1949)
    .map(book => ({
      id: book.id,
      title: book.bookname,
      year: book.year,
      author: book.writer || '佚名',
      publisher: book.publisher || '生活书店',
      image: book.image,
      category: '图书',
      tags: [book.publisher?.includes('生活书店') ? '生活书店' : '其他', `${book.year}年代`],
      dimensions: {
        width: 200,
        height: Math.floor(Math.random() * 100) + 250 // 随机高度模拟不同封面尺寸
      }
    }))
    .sort((a, b) => a.year - b.year); // 按年份排序保持时间连续性
};

const categoryColors = {
  '图书': 'bg-gold',
  '期刊': 'bg-blue-500',
  '手册': 'bg-green-500'
};

interface BookstoreTimelineModuleProps {
  className?: string;
}

export default function BookstoreTimelineModule({ className = '' }: BookstoreTimelineModuleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<BookItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const [columns, setColumns] = useState(4);
  const [data, setData] = useState<BookItem[]>([]);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const masonryRef = useRef<HTMLDivElement>(null);

  // 加载数据
  useEffect(() => {
    loadBooksData().then(setData);
  }, []);

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

  // 交叉观察器用于懒加载
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const itemId = parseInt(entry.target.getAttribute('data-item-id') || '0');
            setVisibleItems(prev => new Set([...prev, itemId]));
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    return () => observerRef.current?.disconnect();
  }, []);

  // 筛选数据
  const filteredItems = data.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.publisher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = selectedYear === 'all' || item.year.toString() === selectedYear;
    
    return matchesSearch && matchesYear;
  });

  // 瀑布流布局计算
  const distributeItems = useCallback(() => {
    const columnArrays: BookItem[][] = Array.from({ length: columns }, () => []);
    const columnHeights = new Array(columns).fill(0);

    filteredItems.forEach((item) => {
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      columnArrays[shortestColumnIndex].push(item);
      columnHeights[shortestColumnIndex] += item.dimensions.height + 20; // 20px gap
    });

    return columnArrays;
  }, [filteredItems, columns]);

  const columnArrays = distributeItems();

  // 灯箱导航
  const openLightbox = (item: BookItem) => {
    setSelectedItem(item);
    setCurrentIndex(filteredItems.findIndex(i => i.id === item.id));
  };

  const nextItem = () => {
    const newIndex = (currentIndex + 1) % filteredItems.length;
    setCurrentIndex(newIndex);
    setSelectedItem(filteredItems[newIndex]);
  };

  const prevItem = () => {
    const newIndex = currentIndex === 0 ? filteredItems.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setSelectedItem(filteredItems[newIndex]);
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

  // 观察项目
  useEffect(() => {
    const items = document.querySelectorAll('[data-item-id]');
    items.forEach(item => observerRef.current?.observe(item));
  }, [filteredItems]);

  const uniqueYears = [...new Set(data.map(item => item.year))].sort();
  const yearRange = data.length > 0 
    ? `${Math.min(...data.map(d => d.year))}-${Math.max(...data.map(d => d.year))}`
    : '';

  return (
    <section className={`relative py-20 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-charcoal mb-6 font-serif">
            远读山峦时间轴
          </h2>
          <p className="text-xl text-charcoal/70 max-w-3xl mx-auto leading-relaxed">
            {yearRange && `${yearRange} 年出版物卡片展示：共 ${data.length} 本书籍，时间流瀑布式浏览`}
          </p>
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

        {/* Results count */}
        <div className="text-center mb-8">
          <p className="text-charcoal/60">
            找到 <span className="font-bold text-gold">{filteredItems.length}</span> 本书籍
          </p>
        </div>

        {/* Masonry Grid */}
        <div ref={masonryRef} className="flex gap-5">
          {columnArrays.map((column, columnIndex) => (
            <div key={columnIndex} className="flex-1 flex flex-col gap-5">
              {column.map((item) => (
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
                        <span className="text-xs text-charcoal/60">{item.category}</span>
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
              ))}
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredItems.length === 0 && (
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
                  <span className="text-gold font-bold">{selectedItem.category}</span>
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
                  {currentIndex + 1} / {filteredItems.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
