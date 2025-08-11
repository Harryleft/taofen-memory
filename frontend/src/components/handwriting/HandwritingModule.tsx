import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ZoomIn, Download, X, ChevronLeft, ChevronRight } from 'lucide-react';
import AppHeader from '../layout/header/AppHeader.tsx';

// 真实数据接口定义
interface HandwritingItem {
  id: string;
  名称: string;
  原文: string;
  时间: string;
  注释: string;
  数据来源: string;
  图片位置: Array<{
    remote_url: string;
    local_path: string;
  }>;
}

// 转换后的数据接口（适配现有组件）
interface TransformedHandwritingItem {
  id: string;
  title: string;
  year: number;
  date: string;
  category: 'letter' | 'manuscript' | 'note' | 'article';
  description: string;
  image: string;
  highResImage: string;
  tags: string[];
  dimensions: {
    width: number;
    height: number;
  };
  originalData: HandwritingItem;
}

// 数据获取函数
const fetchHandwritingData = async (): Promise<HandwritingItem[]> => {
  try {
    const response = await fetch('/data/json/taofen_handwriting_details.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching handwriting data:', error);
    throw error;
  }
};

// 数据转换函数
const transformHandwritingData = (data: HandwritingItem[]): TransformedHandwritingItem[] => {
  return data.map(item => {
    // 从时间字符串中提取年份
    const yearMatch = item.时间.match(/(\d{4})年/);
    const year = yearMatch ? parseInt(yearMatch[1]) : 1937;
    
    // 根据注释内容判断类别
    let category: 'letter' | 'manuscript' | 'note' | 'article' = 'manuscript';
    const content = (item.名称 + item.注释 + item.原文).toLowerCase();
    if (content.includes('信') || content.includes('书') || content.includes('致')) {
      category = 'letter';
    } else if (content.includes('笔记') || content.includes('日记') || content.includes('记录')) {
      category = 'note';
    } else if (content.includes('文章') || content.includes('稿') || content.includes('撰')) {
      category = 'article';
    }
    
    // 生成标签
    const tags: string[] = [];
    if (item.数据来源) tags.push(item.数据来源);
    if (year) tags.push(`${year}年`);
    
    // 获取图片路径
    const imagePath = item.图片位置 && item.图片位置.length > 0 
      ? item.图片位置[0].local_path.replace('public/', '/')
      : '/images/placeholder.png';
    
    return {
      id: item.id,
      title: item.名称,
      year,
      date: item.时间,
      category,
      description: item.注释 || item.原文.substring(0, 100) + '...',
      image: imagePath,
      highResImage: imagePath,
      tags,
      dimensions: {
        width: 320,
        height: Math.floor(Math.random() * 200) + 300 // 随机高度，模拟真实图片
      },
      originalData: item
    };
  });
};

// 图片路径转换函数
const getImagePath = (item: HandwritingItem): string => {
  if (item.图片位置 && item.图片位置.length > 0) {
    return item.图片位置[0].local_path.replace('public/', '/');
  }
  return '/images/placeholder.png';
};

const categoryLabels = {
  letter: '书信',
  manuscript: '手稿',
  note: '笔记',
  article: '文章'
};

const categoryColors = {
  letter: 'bg-blue-500',
  manuscript: 'bg-gold',
  note: 'bg-green-500',
  article: 'bg-purple-500'
};

interface HandwritingModuleProps {
  className?: string;
}

export default function HandwritingModule({ className = '' }: HandwritingModuleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<TransformedHandwritingItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const [columns, setColumns] = useState(4);
  const [handwritingItems, setHandwritingItems] = useState<TransformedHandwritingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const masonryRef = useRef<HTMLDivElement>(null);

  // Responsive columns
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

  // Intersection Observer for lazy loading
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const itemId = entry.target.getAttribute('data-item-id') || '';
            setVisibleItems(prev => new Set([...prev, itemId]));
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    return () => observerRef.current?.disconnect();
  }, []);

  // Filter items
  const filteredItems = handwritingItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         item.originalData.原文.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesYear = selectedYear === 'all' || item.year.toString() === selectedYear;
    
    return matchesSearch && matchesCategory && matchesYear;
  });

  // Masonry layout calculation
  const distributeItems = useCallback(() => {
    const columnArrays: TransformedHandwritingItem[][] = Array.from({ length: columns }, () => []);
    const columnHeights = new Array(columns).fill(0);

    filteredItems.forEach((item) => {
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      columnArrays[shortestColumnIndex].push(item);
      columnHeights[shortestColumnIndex] += item.dimensions.height + 20; // 20px gap
    });

    return columnArrays;
  }, [filteredItems, columns]);

  const columnArrays = distributeItems();

  // Lightbox navigation
  const openLightbox = (item: TransformedHandwritingItem) => {
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

  // Keyboard navigation
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

  // 数据加载
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const rawData = await fetchHandwritingData();
        const transformedData = transformHandwritingData(rawData);
        setHandwritingItems(transformedData);
      } catch (err) {
        setError('加载手迹数据失败，请刷新页面重试');
        console.error('Failed to load handwriting data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Observe items when they mount
  useEffect(() => {
    const items = document.querySelectorAll('[data-item-id]');
    items.forEach(item => observerRef.current?.observe(item));
  }, [filteredItems]);

  const uniqueYears = [...new Set(handwritingItems.map(item => item.year))].sort();

  return (
    <>
      <AppHeader moduleId="handwriting" />
      <section className={`py-20 bg-cream ${className}`}>
        <div className="max-w-7xl mx-auto px-6">

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/60" size={20} />
            <input
              type="text"
              placeholder="搜索手迹..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 w-64"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-white border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
          >
            <option value="all">全部类型</option>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
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

        {/* Results count */}
        <div className="text-center mb-8">
          <p className="text-charcoal/60">
            找到 <span className="font-bold text-gold">{filteredItems.length}</span> 件手迹
          </p>
        </div>

        {/* Masonry Grid */}
        {!loading && !error && (
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
                  <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
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
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs text-white ${categoryColors[item.category]}`}>
                          {categoryLabels[item.category]}
                        </span>
                        <span className="text-xs text-charcoal/60">{item.year}年</span>
                      </div>
                      <h3 className="font-bold text-charcoal mb-2 group-hover:text-gold transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-charcoal/70 mb-2 line-clamp-2">
                        {item.description}
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
        )}

        {/* Empty state */}
        {!loading && !error && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📜</div>
            <h3 className="text-xl font-bold text-charcoal mb-2">未找到相关手迹</h3>
            <p className="text-charcoal/60">请尝试调整搜索条件</p>
          </div>
        )}
        </div>

        {/* Lightbox */}
        {selectedItem && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-6xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
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
              <div className="flex-1 flex items-center justify-center bg-gray-100 p-4">
                <img
                  src={selectedItem.highResImage}
                  alt={selectedItem.title}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              
              {/* Details */}
              <div className="w-full lg:w-96 p-6 overflow-y-auto">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm text-white ${categoryColors[selectedItem.category]}`}>
                    {categoryLabels[selectedItem.category]}
                  </span>
                  <span className="text-gold font-bold">{selectedItem.year}年</span>
                </div>
                
                <h3 className="text-2xl font-bold text-charcoal mb-2 font-serif">
                  {selectedItem.title}
                </h3>
                
                <p className="text-charcoal/60 mb-4">{selectedItem.date}</p>
                
                <div className="mb-6">
                  <h4 className="font-bold text-charcoal mb-2">简介</h4>
                  <p className="text-charcoal/80 leading-relaxed">
                    {selectedItem.description}
                  </p>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-bold text-charcoal mb-2">原文</h4>
                  <p className="text-charcoal/80 leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {selectedItem.originalData.原文}
                  </p>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-bold text-charcoal mb-2">数据来源</h4>
                  <p className="text-charcoal/60">
                    {selectedItem.originalData.数据来源}
                  </p>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-bold text-charcoal mb-2">标签</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map((tag, index) => (
                      <span key={index} className="bg-gold/10 text-gold px-3 py-1 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className="flex-1 bg-gold text-cream px-4 py-2 rounded-lg hover:bg-gold/90 transition-colors flex items-center justify-center gap-2">
                    <Download size={16} />
                    下载高清图
                  </button>
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
    </>
  );
}
