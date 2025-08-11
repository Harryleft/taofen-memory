import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { Search, Download } from 'lucide-react';
import AppHeader from '../layout/header/AppHeader.tsx';
import HandwritingCard from './HandwritingCard.tsx';
import Lightbox from './Lightbox.tsx';
import { useHandwritingData, type TransformedHandwritingItem } from '../../hooks/useHandwritingData.ts';
import { useHandwritingFilters } from '../../hooks/useHandwritingFilters.ts';
import { 
  highlightSearchText, 
  debounce, 
  getResponsiveColumns, 
  calculateMasonryLayout,
  categoryLabels,
  categoryColors
} from '../../utils/handwritingUtils.ts';




interface HandwritingModuleProps {
  className?: string;
}

export default function HandwritingModule({ className = '' }: HandwritingModuleProps) {
  // 使用数据获取Hook
  const { handwritingItems, loading, error, refetch } = useHandwritingData();
  
  // 过滤器状态
  const [filters, setFilters] = useState({
    searchTerm: '',
    selectedCategory: 'all',
    selectedYear: 'all',
    selectedSource: 'all',
    selectedTag: 'all',
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

  // 使用过滤Hook
  const { filteredItems, uniqueYears, uniqueSources, uniqueTags } = useHandwritingFilters(handwritingItems, filters);

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
    return calculateMasonryLayout(filteredItems, layout.columns);
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

    
  // 更新过滤器状态
  const updateFilters = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);
  
    
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
          value={filters.selectedTag}
          onChange={(e) => updateFilters('selectedTag', e.target.value)}
          className="px-4 py-2 bg-white border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
        >
          <option value="all">全部标签</option>
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
