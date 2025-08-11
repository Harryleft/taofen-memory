import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
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

// 工具函数：提取年份从时间字符串
const extractYearFromDateString = (dateString: string): number => {
  const yearMatch = dateString.match(/(\d{4})年/);
  return yearMatch ? parseInt(yearMatch[1]) : 1937;
};

// 工具函数：判断手迹类别
const determineCategory = (item: HandwritingItem): 'letter' | 'manuscript' | 'note' | 'article' => {
  const content = (item.名称 + item.注释 + item.原文).toLowerCase();
  
  if (content.includes('信') || content.includes('书') || content.includes('致')) {
    return 'letter';
  } else if (content.includes('笔记') || content.includes('日记') || content.includes('记录')) {
    return 'note';
  } else if (content.includes('文章') || content.includes('稿') || content.includes('撰')) {
    return 'article';
  }
  
  return 'manuscript';
};

// 工具函数：生成标签
const generateTags = (item: HandwritingItem, year: number): string[] => {
  const tags: string[] = [];
  if (item.数据来源) tags.push(item.数据来源);
  if (year) tags.push(`${year}年`);
  return tags;
};

// 工具函数：获取图片路径
const getImagePath = (item: HandwritingItem): string => {
  if (item.图片位置 && item.图片位置.length > 0) {
    return item.图片位置[0].local_path.replace('public/', '/');
  }
  return '/images/placeholder.png';
};

// 工具函数：数据转换
const transformHandwritingData = (data: HandwritingItem[]): TransformedHandwritingItem[] => {
  return data.map(item => {
    const year = extractYearFromDateString(item.时间);
    const category = determineCategory(item);
    const tags = generateTags(item, year);
    const imagePath = getImagePath(item);
    
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
        height: Math.floor(Math.random() * 200) + 300
      },
      originalData: item
    };
  });
};

// 工具函数：高亮搜索文本 - 使用useMemo优化
const highlightSearchText = (text: string, searchTerm: string): JSX.Element => {
  if (!searchTerm) return <>{text}</>;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <span key={`${index}-${part}`} className="bg-yellow-200 text-charcoal font-bold">
            {part}
          </span>
        ) : (
          <span key={`${index}-${part}`}>{part}</span>
        )
      )}
    </>
  );
};

// Memoized手迹卡片组件
const HandwritingCard = memo(({ 
  item, 
  isVisible, 
  columnIndex, 
  searchTerm, 
  onCardClick 
}: { 
  item: TransformedHandwritingItem; 
  isVisible: boolean; 
  columnIndex: number; 
  searchTerm: string; 
  onCardClick: (item: TransformedHandwritingItem) => void;
}) => {
  const highlightedTitle = useMemo(() => highlightSearchText(item.title, searchTerm), [item.title, searchTerm]);
  const highlightedDescription = useMemo(() => highlightSearchText(item.description, searchTerm), [item.description, searchTerm]);
  
  return (
    <div
      data-item-id={item.id}
      className={`group cursor-pointer transform transition-all duration-700 ${
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-8 opacity-0'
      }`}
      onClick={() => onCardClick(item)}
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
            {highlightedTitle}
          </h3>
          <p className="text-sm text-charcoal/70 mb-2 line-clamp-2">
            {highlightedDescription}
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
});

HandwritingCard.displayName = 'HandwritingCard';

// 工具函数：搜索性能优化 - 使用useMemo缓存搜索结果
const useSearchResults = (items: TransformedHandwritingItem[], searchTerm: string) => {
  return useMemo(() => {
    if (!searchTerm) return items;
    
    const searchLower = searchTerm.toLowerCase();
    return items.filter(item => (
      item.title.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
      item.originalData.原文.toLowerCase().includes(searchLower) ||
      item.originalData.注释.toLowerCase().includes(searchLower)
    ));
  }, [items, searchTerm]);
};

// 工具函数：过滤手迹项目
const filterHandwritingItems = (
  items: TransformedHandwritingItem[],
  filters: {
    searchTerm: string;
    selectedCategory: string;
    selectedYear: string;
    selectedSource: string;
    sortOrder: string;
  }
): TransformedHandwritingItem[] => {
  const { searchTerm, selectedCategory, selectedYear, selectedSource, sortOrder } = filters;
  
  // 先搜索
  let filteredItems = items;
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    filteredItems = items.filter(item => (
      item.title.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
      item.originalData.原文.toLowerCase().includes(searchLower) ||
      item.originalData.注释.toLowerCase().includes(searchLower)
    ));
  }
  
  // 再筛选
  filteredItems = filteredItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesYear = selectedYear === 'all' || item.year.toString() === selectedYear;
    const matchesSource = selectedSource === 'all' || item.originalData.数据来源 === selectedSource;
    
    return matchesCategory && matchesYear && matchesSource;
  });
  
  // 最后排序
  return filteredItems.sort((a, b) => {
    switch (sortOrder) {
      case 'year_asc':
        return a.year - b.year;
      case 'year_desc':
        return b.year - a.year;
      case 'name_asc':
        return a.title.localeCompare(b.title);
      case 'name_desc':
        return b.title.localeCompare(a.title);
      case 'id_asc':
        return a.id.localeCompare(b.id);
      case 'id_desc':
        return b.id.localeCompare(a.id);
      default:
        return 0;
    }
  });
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
  // 数据状态
  const [handwritingItems, setHandwritingItems] = useState<TransformedHandwritingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 过滤器状态
  const [filters, setFilters] = useState({
    searchTerm: '',
    selectedCategory: 'all',
    selectedYear: 'all',
    selectedSource: 'all',
    sortOrder: 'year_desc'
  });
  
  // 布局状态
  const [layout, setLayout] = useState({
    columns: 4,
    visibleItems: new Set<string>()
  });
  
  // Lightbox状态
  const [lightbox, setLightbox] = useState({
    selectedItem: null as TransformedHandwritingItem | null,
    currentIndex: 0
  });
  
  // Refs
  const observerRef = useRef<IntersectionObserver | null>(null);
  const masonryRef = useRef<HTMLDivElement>(null);

  // Responsive columns - 使用防抖优化
  useEffect(() => {
    const debouncedUpdateColumns = debounce(() => {
      const width = window.innerWidth;
      let newColumns = 4;
      if (width < 640) newColumns = 1;
      else if (width < 768) newColumns = 2;
      else if (width < 1024) newColumns = 3;
      
      setLayout(prev => ({ ...prev, columns: newColumns }));
    }, 150);

    // 初始调用
    const initialUpdate = () => {
      const width = window.innerWidth;
      let newColumns = 4;
      if (width < 640) newColumns = 1;
      else if (width < 768) newColumns = 2;
      else if (width < 1024) newColumns = 3;
      
      setLayout(prev => ({ ...prev, columns: newColumns }));
    };
    
    initialUpdate();
    window.addEventListener('resize', debouncedUpdateColumns);
    return () => {
      window.removeEventListener('resize', debouncedUpdateColumns);
      debouncedUpdateColumns.cancel?.();
    };
  }, []);

  // 防抖函数
  const debounce = <T extends (...args: any[]) => void>(func: T, wait: number): T => {
    let timeout: NodeJS.Timeout | null = null;
    
    const debounced = (...args: Parameters<T>) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        timeout = null;
        func(...args);
      }, wait);
    };
    
    debounced.cancel = () => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
    };
    
    return debounced as T;
  };

  // Intersection Observer for future lazy loading - 目前禁用，所有卡片初始显示
  useEffect(() => {
    // 暂时禁用IntersectionObserver，因为所有卡片初始时就应该显示
    // 如果需要实现真正的懒加载（分页加载），可以重新启用这个逻辑
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // 使用工具函数进行过滤 - 使用useMemo优化
  const filteredItems = useMemo(() => {
    return filterHandwritingItems(handwritingItems, {
      searchTerm: filters.searchTerm,
      selectedCategory: filters.selectedCategory,
      selectedYear: filters.selectedYear,
      selectedSource: filters.selectedSource,
      sortOrder: filters.sortOrder
    });
  }, [handwritingItems, filters]);

  // 初始化时显示所有卡片
  useEffect(() => {
    if (filteredItems.length > 0 && layout.visibleItems.size === 0) {
      const allItemIds = filteredItems.map(item => item.id);
      setLayout(prev => ({
        ...prev,
        visibleItems: new Set(allItemIds)
      }));
    }
  }, [filteredItems, layout.visibleItems.size]);

  // Masonry layout calculation
  // 使用useMemo优化布局计算
  const columnArrays = useMemo(() => {
    const columnArrays: TransformedHandwritingItem[][] = Array.from({ length: layout.columns }, () => []);
    const columnHeights = new Array(layout.columns).fill(0);

    filteredItems.forEach((item) => {
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      columnArrays[shortestColumnIndex].push(item);
      columnHeights[shortestColumnIndex] += item.dimensions.height + 20; // 20px gap
    });

    return columnArrays;
  }, [filteredItems, layout.columns]);

  // Lightbox navigation
  const openLightbox = useCallback((item: TransformedHandwritingItem) => {
    setLightbox({
      selectedItem: item,
      currentIndex: filteredItems.findIndex(i => i.id === item.id)
    });
  }, [filteredItems]);

  const nextItem = useCallback(() => {
    const newIndex = (lightbox.currentIndex + 1) % filteredItems.length;
    setLightbox(prev => ({
      ...prev,
      currentIndex: newIndex,
      selectedItem: filteredItems[newIndex]
    }));
  }, [filteredItems, lightbox.currentIndex]);

  const prevItem = useCallback(() => {
    const newIndex = lightbox.currentIndex === 0 ? filteredItems.length - 1 : lightbox.currentIndex - 1;
    setLightbox(prev => ({
      ...prev,
      currentIndex: newIndex,
      selectedItem: filteredItems[newIndex]
    }));
  }, [filteredItems, lightbox.currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightbox.selectedItem) {
        if (e.key === 'Escape') {
          setLightbox(prev => ({ ...prev, selectedItem: null }));
        }
        if (e.key === 'ArrowRight') nextItem();
        if (e.key === 'ArrowLeft') prevItem();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox.selectedItem, nextItem, prevItem]);

  // Observe items when they mount - 目前禁用，所有卡片初始显示
  // useEffect(() => {
  //   const items = document.querySelectorAll('[data-item-id]');
  //   items.forEach(item => observerRef.current?.observe(item));
  // }, [filteredItems]);

  // 使用useMemo优化年份计算
  const uniqueYears = useMemo(() => {
    return [...new Set(handwritingItems.map(item => item.year))].sort((a, b) => a - b);
  }, [handwritingItems]);
  
  // 使用useMemo优化数据来源计算
  const uniqueSources = useMemo(() => {
    return [...new Set(handwritingItems.map(item => item.originalData.数据来源).filter(Boolean))].sort();
  }, [handwritingItems]);
  
  // 更新过滤器状态
  const updateFilters = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);
  
  // 数据加载函数
  const loadData = useCallback(async () => {
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
  }, []);

  // 数据加载
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // 渲染过滤器控件
  const renderFilterControls = () => (
    <div className="space-y-4 mb-8">
      {/* 搜索栏 */}
      <div className="flex justify-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/60" size={20} />
          <input
            type="text"
            placeholder="搜索手迹（名称、原文、注释）..."
            value={filters.searchTerm}
            onChange={(e) => updateFilters('searchTerm', e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 w-80"
          />
        </div>
      </div>
      
      {/* 筛选和排序控件 */}
      <div className="flex flex-wrap gap-4 justify-center">
        <select
          value={filters.selectedCategory}
          onChange={(e) => updateFilters('selectedCategory', e.target.value)}
          className="px-4 py-2 bg-white border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
        >
          <option value="all">全部类型</option>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <select
          value={filters.selectedYear}
          onChange={(e) => updateFilters('selectedYear', e.target.value)}
          className="px-4 py-2 bg-white border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
        >
          <option value="all">全部年份</option>
          {uniqueYears.map(year => (
            <option key={year} value={year.toString()}>{year}年</option>
          ))}
        </select>
        
        <select
          value={filters.selectedSource}
          onChange={(e) => updateFilters('selectedSource', e.target.value)}
          className="px-4 py-2 bg-white border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
        >
          <option value="all">全部来源</option>
          {uniqueSources.map(source => (
            <option key={source} value={source}>{source}</option>
          ))}
        </select>
        
        <select
          value={filters.sortOrder}
          onChange={(e) => updateFilters('sortOrder', e.target.value)}
          className="px-4 py-2 bg-white border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
        >
          <option value="year_desc">时间（新到旧）</option>
          <option value="year_asc">时间（旧到新）</option>
          <option value="name_asc">名称（A-Z）</option>
          <option value="name_desc">名称（Z-A）</option>
          <option value="id_asc">ID（升序）</option>
          <option value="id_desc">ID（降序）</option>
        </select>
      </div>
    </div>
  );
  
  // 渲染结果头部
  const renderResultsHeader = () => (
    <div className="text-center mb-8">
      <p className="text-charcoal/60">
        找到 <span className="font-bold text-gold">{filteredItems.length}</span> 件手迹
      </p>
    </div>
  );
  
  // 渲染空状态
  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📜</div>
      <h3 className="text-xl font-bold text-charcoal mb-2">未找到相关手迹</h3>
      <p className="text-charcoal/60">请尝试调整搜索条件</p>
    </div>
  );
  
  // 渲染手迹卡片 - 使用memoized组件
  const renderHandwritingCard = (item: TransformedHandwritingItem, columnIndex: number) => (
    <HandwritingCard
      key={item.id}
      item={item}
      isVisible={layout.visibleItems.has(item.id)}
      columnIndex={columnIndex}
      searchTerm={filters.searchTerm}
      onCardClick={openLightbox}
    />
  );
  
  // 渲染瀑布流网格
  const renderMasonryGrid = () => (
    <div ref={masonryRef} className="flex gap-5">
      {columnArrays.map((column, columnIndex) => (
        <div key={columnIndex} className="flex-1 flex flex-col gap-5">
          {column.map((item) => renderHandwritingCard(item, columnIndex))}
        </div>
      ))}
    </div>
  );
  
  // Memoized Lightbox组件
  const Lightbox = memo(({ 
    selectedItem, 
    currentIndex, 
    totalItems, 
    searchTerm, 
    onClose, 
    onPrev, 
    onNext 
  }: { 
    selectedItem: TransformedHandwritingItem; 
    currentIndex: number; 
    totalItems: number; 
    searchTerm: string; 
    onClose: () => void; 
    onPrev: () => void; 
    onNext: () => void;
  }) => {
    const highlightedTitle = useMemo(() => highlightSearchText(selectedItem.title, searchTerm), [selectedItem.title, searchTerm]);
    const highlightedContent = useMemo(() => highlightSearchText(selectedItem.originalData.原文, searchTerm), [selectedItem.originalData.原文, searchTerm]);
    const highlightedNotes = useMemo(() => highlightSearchText(selectedItem.originalData.注释, searchTerm), [selectedItem.originalData.注释, searchTerm]);

    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
        <div className="relative max-w-6xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
          {/* Navigation */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          >
            <X size={24} />
          </button>
          
          <button
            onClick={onPrev}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          >
            <ChevronLeft size={32} />
          </button>
          
          <button
            onClick={onNext}
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
                loading="lazy"
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
                {highlightedTitle}
              </h3>
              
              <p className="text-charcoal/60 mb-4">{selectedItem.originalData.时间}</p>
              
              <div className="mb-6">
                <h4 className="font-bold text-charcoal mb-2">原文</h4>
                <p className="text-charcoal/80 leading-relaxed bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                  {highlightedContent}
                </p>
              </div>
              
              <div className="mb-6">
                <h4 className="font-bold text-charcoal mb-2">注释</h4>
                <p className="text-charcoal/80 leading-relaxed bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                  {highlightedNotes}
                </p>
              </div>
              
              <div className="mb-6">
                <h4 className="font-bold text-charcoal mb-2">数据来源</h4>
                {selectedItem.originalData.图片位置 && 
                 selectedItem.originalData.图片位置.length > 0 && 
                 selectedItem.originalData.图片位置[0].remote_url ? (
                  <a 
                    href={selectedItem.originalData.图片位置[0].remote_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold hover:text-gold/80 underline transition-colors"
                  >
                    {selectedItem.originalData.数据来源}
                  </a>
                ) : (
                  <p className="text-charcoal/60">
                    {selectedItem.originalData.数据来源}
                  </p>
                )}
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
                {currentIndex + 1} / {totalItems}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  });

  Lightbox.displayName = 'Lightbox';

  // 渲染Lightbox - 使用memoized组件
  const renderLightbox = () => {
    if (!lightbox.selectedItem) return null;
    
    return (
      <Lightbox
        selectedItem={lightbox.selectedItem}
        currentIndex={lightbox.currentIndex}
        totalItems={filteredItems.length}
        searchTerm={filters.searchTerm}
        onClose={() => setLightbox(prev => ({ ...prev, selectedItem: null }))}
        onPrev={prevItem}
        onNext={nextItem}
      />
    );
  };

  return (
    <>
      <AppHeader moduleId="handwriting" />
      <section className={`py-20 bg-cream ${className}`}>
        <div className="max-w-7xl mx-auto px-6">

        {/* Filters */}
        {renderFilterControls()}

        {/* Results count */}
        {renderResultsHeader()}

        {/* Masonry Grid */}
        {!loading && !error && renderMasonryGrid()}

        {/* Empty state */}
        {!loading && !error && filteredItems.length === 0 && renderEmptyState()}
        </div>

        {/* Lightbox */}
        {renderLightbox()}
      </section>
    </>
  );
}
