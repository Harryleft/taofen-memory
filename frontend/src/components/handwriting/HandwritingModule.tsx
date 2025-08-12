import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search } from 'lucide-react';
import AppHeader from '../layout/header/AppHeader.tsx';
import HandwritingCard from './HandwritingCard.tsx';
import Lightbox from './Lightbox.tsx';
import SkeletonGrid from './SkeletonGrid.tsx';
import { useHandwritingData, type TransformedHandwritingItem } from '@/hooks/useHandwritingData.ts';
import { useHandwritingFilters } from '@/hooks/useHandwritingFilters.ts';
import { ImagePreloader } from '@/utils/imagePreloader.ts';
import { 
  debounce,
  getResponsiveColumns, 
  calculateMasonryLayout,
  categoryLabels
} from '@/utils/handwritingUtils.ts';




interface HandwritingModuleProps {
  className?: string;
}

export default function HandwritingModule({ className = '' }: HandwritingModuleProps) {
  // 使用数据获取Hook
  const { handwritingItems, loading, error, refetch } = useHandwritingData();
  
  // Debug: 监控数据加载状态
  useEffect(() => {
    console.log('🔍 [HandwritingModule] Debug Info:');
    console.log('- loading:', loading);
    console.log('- error:', error);
    console.log('- handwritingItems length:', handwritingItems.length);
    console.log('- handwritingItems:', handwritingItems);
  }, [loading, error, handwritingItems]);
  
  // 过滤器状态
  const [filters, setFilters] = useState({
    searchTerm: '',
    selectedCategory: 'all',
    selectedYear: 'all',
    selectedSource: 'all',
    selectedTag: 'all',
    sortOrder: 'year_desc'
  });
  
  // 搜索防抖和缓存
  const [searchCache, setSearchCache] = useState<Map<string, TransformedHandwritingItem[]>>(new Map());
  const debouncedSearchRef = useRef<NodeJS.Timeout | null>(null);
  
  // 布局状态
  const [layout, setLayout] = useState({
    columns: 4,
    visibleItems: new Set<string>()
  });
  
  // 分页状态
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 20,
    hasMore: true,
    isLoading: false
  });
  
  // Lightbox状态
  const [lightbox, setLightbox] = useState({
    selectedItem: null as TransformedHandwritingItem | null,
    currentIndex: 0
  });
  
  // Refs
  const observerRef = useRef<IntersectionObserver | null>(null);
  const masonryRef = useRef<HTMLDivElement>(null);
  
  // 清理防抖定时器
  useEffect(() => {
    return () => {
      if (debouncedSearchRef.current) {
        clearTimeout(debouncedSearchRef.current);
      }
    };
  }, []);

  // Responsive columns - 使用防抖优化
  useEffect(() => {
    const debouncedUpdateColumns = debounce(() => {
      const width = window.innerWidth;
      const newColumns = getResponsiveColumns(width);
      setLayout(prev => ({ ...prev, columns: newColumns }));
    }, 150);

    // 初始调用
    const initialUpdate = () => {
      const width = window.innerWidth;
      const newColumns = getResponsiveColumns(width);
      setLayout(prev => ({ ...prev, columns: newColumns }));
    };
    
    initialUpdate();
    window.addEventListener('resize', debouncedUpdateColumns);
    return () => {
      window.removeEventListener('resize', debouncedUpdateColumns);
      debouncedUpdateColumns.cancel?.();
    };
  }, []);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && pagination.hasMore && !pagination.isLoading) {
            loadMore();
          }
        });
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1
      }
    );

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [pagination.hasMore, pagination.isLoading, loadMore]);

  // 优化的搜索处理函数
  const optimizedSearch = useCallback((searchTerm: string, items: TransformedHandwritingItem[]): TransformedHandwritingItem[] => {
    if (!searchTerm.trim()) return items;
    
    const cacheKey = searchTerm.toLowerCase();
    
    // 检查缓存
    if (searchCache.has(cacheKey)) {
      return searchCache.get(cacheKey)!;
    }
    
    // 执行搜索
    const searchResults = items.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.originalData.原文?.toLowerCase().includes(searchLower) ||
        item.originalData.注释?.toLowerCase().includes(searchLower) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    });
    
    // 更新缓存
    setSearchCache(prev => {
      const newCache = new Map(prev);
      newCache.set(cacheKey, searchResults);
      return newCache;
    });
    
    return searchResults;
  }, [searchCache]);

  // 使用过滤Hook
  const { filteredItems, uniqueYears, uniqueSources, uniqueTags } = useHandwritingFilters(handwritingItems, filters);
  
  // Debug: 监控过滤结果
  useEffect(() => {
    console.log('🔍 [HandwritingModule] Filter Debug Info:');
    console.log('- filteredItems length:', filteredItems.length);
    console.log('- uniqueYears:', uniqueYears);
    console.log('- uniqueSources:', uniqueSources);
    console.log('- uniqueTags:', uniqueTags);
    console.log('- uniqueTags length:', uniqueTags.length);
    console.log('- current filters:', filters);
    console.log('- contains real tags:', {
      '题词': uniqueTags.includes('题词'),
      '文稿': uniqueTags.includes('文稿'),
      '书简': uniqueTags.includes('书简')
    });
  }, [filteredItems, uniqueYears, uniqueSources, uniqueTags, filters]);

  // 分页逻辑
  useEffect(() => {
    console.log('🔍 [HandwritingModule] Pagination Debug Info:');
    console.log('- filteredItems length:', filteredItems.length);
    console.log('- currentPage:', pagination.currentPage);
    console.log('- itemsPerPage:', pagination.itemsPerPage);
    console.log('- hasMore:', pagination.hasMore);
    
    const startIndex = 0;
    const endIndex = pagination.currentPage * pagination.itemsPerPage;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);
    
    // 更新可见项目
    const visibleItemIds = paginatedItems.map(item => item.id);
    setLayout(prev => ({
      ...prev,
      visibleItems: new Set(visibleItemIds)
    }));
    
    // 更新是否有更多数据
    const hasMore = endIndex < filteredItems.length;
    setPagination(prev => ({
      ...prev,
      hasMore
    }));
  }, [filteredItems, pagination.currentPage, pagination.itemsPerPage]);
  
  // 过滤器变化时重置分页
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      currentPage: 1,
      hasMore: true
    }));
  }, [filters]);
  
  // 加载更多
  const loadMore = useCallback(() => {
    if (pagination.hasMore && !pagination.isLoading) {
      setPagination(prev => ({
        ...prev,
        isLoading: true,
        currentPage: prev.currentPage + 1
      }));
      
      // 模拟加载延迟
      setTimeout(() => {
        setPagination(prev => ({
          ...prev,
          isLoading: false
        }));
      }, 300);
    }
  }, [pagination.hasMore, pagination.isLoading]);

  // 图片预加载策略
  useEffect(() => {
    if (filteredItems.length === 0) return;
    
    const startIndex = 0;
    const endIndex = pagination.currentPage * pagination.itemsPerPage;
    const currentItems = filteredItems.slice(startIndex, endIndex);
    
    // 预加载当前页面的图片
    const currentImages = currentItems.map(item => item.image);
    
    // 预加载下一页的图片（预取）
    const nextStartIndex = endIndex;
    const nextEndIndex = endIndex + pagination.itemsPerPage;
    const nextItems = filteredItems.slice(nextStartIndex, nextEndIndex);
    const nextImages = nextItems.map(item => item.image);
    
    // 执行智能预加载
    ImagePreloader.smartPreload(currentImages, nextImages, {
      priority: true,
      timeout: 3000,
      retryCount: 1
    });
  }, [filteredItems, pagination.currentPage, pagination.itemsPerPage]);

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

  // Masonry layout calculation
  // 使用useMemo优化布局计算
  const columnArrays = useMemo(() => {
    const result = calculateMasonryLayout(filteredItems, layout.columns);
    console.log('🔍 [HandwritingModule] Masonry Debug Info:');
    console.log('- filteredItems length:', filteredItems.length);
    console.log('- layout columns:', layout.columns);
    console.log('- columnArrays length:', result.length);
    console.log('- columnArrays:', result.map(col => col.length));
    return result;
  }, [filteredItems, layout.columns]);

  // Observe items when they mount - 目前禁用，所有卡片初始显示
  // useEffect(() => {
  //   const items = document.querySelectorAll('[data-item-id]');
  //   items.forEach(item => observerRef.current?.observe(item));
  // }, [filteredItems]);

    
  // 更新过滤器状态 - 带防抖处理
  const updateFilters = useCallback((key: string, value: string) => {
    // 清除之前的防抖定时器
    if (debouncedSearchRef.current) {
      clearTimeout(debouncedSearchRef.current);
    }
    
    // 如果是搜索词，使用防抖
    if (key === 'searchTerm') {
      debouncedSearchRef.current = setTimeout(() => {
        setFilters(prev => ({ ...prev, [key]: value }));
      }, 300);
    } else {
      // 其他过滤器立即更新
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  }, []);
  
    
  // 渲染过滤器控件 - 使用useMemo优化
  const renderFilterControls = useMemo(() => {
    return () => (
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
          value={filters.selectedTag}
          onChange={(e) => updateFilters('selectedTag', e.target.value)}
          className="px-4 py-2 bg-white border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
        >
          <option value="all">时间 ({uniqueTags.length})</option>
          {uniqueTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
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
  }, [filters, uniqueYears, uniqueSources, uniqueTags, updateFilters, categoryLabels]);
  
  // 渲染结果头部 - 使用useMemo优化
  const renderResultsHeader = useMemo(() => () => (
    <div className="text-center mb-8">
      <p className="text-charcoal/60">
        找到 <span className="font-bold text-gold">{filteredItems.length}</span> 件手迹
      </p>
    </div>
  ), [filteredItems.length]);
  
  // 渲染空状态 - 使用useMemo优化
  const renderEmptyState = useMemo(() => () => (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📜</div>
      <h3 className="text-xl font-bold text-charcoal mb-2">未找到相关手迹</h3>
      <p className="text-charcoal/60">请尝试调整搜索条件</p>
    </div>
  ), []);
  
  // 渲染手迹卡片 - 使用useMemo优化
  const renderHandwritingCard = useCallback((item: TransformedHandwritingItem, columnIndex: number) => (
    <HandwritingCard
      key={item.id}
      item={item}
      isVisible={layout.visibleItems.has(item.id)}
      columnIndex={columnIndex}
      searchTerm={filters.searchTerm}
      onCardClick={openLightbox}
    />
  ), [layout.visibleItems, filters.searchTerm, openLightbox]);
  
  // 渲染瀑布流网格 - 使用useMemo优化
  const renderMasonryGrid = useMemo(() => () => (
    <>
      {/* 骨架屏加载效果 */}
      {loading && (
        <SkeletonGrid 
          columns={layout.columns}
          itemsPerColumn={3}
          heights={[]}
        />
      )}
      
      {/* 实际内容 */}
      {!loading && (
        <div ref={masonryRef} className="flex gap-5">
          {columnArrays.map((column, columnIndex) => (
            <div key={columnIndex} className="flex-1 flex flex-col gap-5">
              {column.map((item) => renderHandwritingCard(item, columnIndex))}
            </div>
          ))}
        </div>
      )}
      
      {/* 加载更多触发器 */}
      {pagination.hasMore && !loading && (
        <div 
          ref={(el) => {
            if (el && observerRef.current) {
              observerRef.current.observe(el);
            }
          }}
          className="flex justify-center items-center py-8"
        >
          {pagination.isLoading && (
            <div className="flex items-center gap-2 text-charcoal/60">
              <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
              <span>加载更多...</span>
            </div>
          )}
        </div>
      )}
      
      {/* 显示当前加载状态 */}
      {!loading && (
        <div className="text-center py-4 text-sm text-charcoal/50">
          已显示 {layout.visibleItems.size} / {filteredItems.length} 项
        </div>
      )}
    </>
  ), [columnArrays, renderHandwritingCard, pagination.hasMore, pagination.isLoading, layout.visibleItems.size, filteredItems.length, loading, layout.columns]);
  
  
  // 渲染Lightbox - 使用useMemo优化
  const renderLightbox = useMemo(() => {
    if (!lightbox.selectedItem) return null;
    
    return () => (
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
  }, [lightbox.selectedItem, lightbox.currentIndex, filteredItems.length, filters.searchTerm, prevItem, nextItem]);

  return (
    <>
      <AppHeader moduleId="handwriting" />
      <section className={`py-20 bg-cream ${className}`}>
        <div className="max-w-7xl mx-auto px-6">

        {/* Filters */}
        {renderFilterControls()}

        {/* Results count */}
        {renderResultsHeader()}

        {/* Loading state handled by skeleton grid */}

        {/* Error state */}
        {error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-bold text-charcoal mb-2">加载失败</h3>
            <p className="text-charcoal/60 mb-4">{error}</p>
            <button 
              onClick={refetch}
              className="bg-gold text-cream px-6 py-2 rounded-lg hover:bg-gold/90 transition-colors"
            >
              重新加载
            </button>
          </div>
        )}

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
