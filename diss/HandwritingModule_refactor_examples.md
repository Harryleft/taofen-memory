# HandwritingModule 重构代码示例

## 1. 重构后的主组件

```typescript
// src/components/handwriting/HandwritingModule.tsx
import { useState } from 'react';
import AppHeader from '../layout/header/AppHeader';
import HandwritingLightbox from './HandwritingLightbox';
import { useHandwritingData } from '@/hooks/useHandwritingData';
import { useHandwritingFilters } from '@/hooks/useHandwritingFilters';
import { useHandwritingPagination } from '@/hooks/useHandwritingPagination';
import { useHandwritingLayout } from '@/hooks/useHandwritingLayout';
import { useHandwritingLightbox } from '@/hooks/useHandwritingLightbox';
import { useHandwritingSearch } from '@/hooks/useHandwritingSearch';
import { useHandwritingPreloader } from '@/hooks/useHandwritingPreloader';
import HandwritingFilterControls from './HandwritingFilterControls';
import ResultsHeader from './ResultsHeader';
import HandwritingMasonryGrid from './HandwritingMasonryGrid';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import HandwritingLoadingIndicator from './HandwritingLoadingIndicator';

interface HandwritingModuleProps {
  className?: string;
}

export default function HandwritingModule({ className = '' }: HandwritingModuleProps) {
  // 数据获取
  const { handwritingItems, loading, error, refetch } = useHandwritingData();
  
  // 搜索状态管理
  const { searchTerm, debouncedSearchTerm, updateSearchTerm } = useHandwritingSearch();
  
  // 过滤器状态
  const [filters, setFilters] = useState({
    selectedCategory: 'all',
    selectedYear: 'all',
    selectedSource: 'all',
    selectedTag: 'all',
    sortOrder: 'year_desc'
  });
  
  // 数据过滤
  const { filteredItems, uniqueYears, uniqueSources, uniqueTags } = useHandwritingFilters(
    handwritingItems, 
    { ...filters, searchTerm: debouncedSearchTerm }
  );
  
  // 分页管理
  const { pagination, paginatedItems, loadMore, resetPagination } = useHandwritingPagination(
    filteredItems, 
    20
  );
  
  // 布局管理
  const { columns, columnArrays } = useHandwritingLayout(paginatedItems);
  
  // Lightbox管理
  const { lightbox, openLightbox, closeLightbox, nextItem, prevItem } = useHandwritingLightbox(
    filteredItems
  );
  
  // 图片预加载
  useHandwritingPreloader(filteredItems, pagination.currentPage, pagination.itemsPerPage);
  
  // 过滤器更新处理
  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    resetPagination();
  }, [resetPagination]);
  
  // 搜索处理
  const handleSearchChange = useCallback((term: string) => {
    updateSearchTerm(term);
    resetPagination();
  }, [updateSearchTerm, resetPagination]);
  
  return (
    <>
      <AppHeader moduleId="handwriting" />
      <section className={`py-20 bg-cream ${className}`}>
        <div className="max-w-7xl mx-auto px-6">
          {/* 过滤器控件 */}
          <HandwritingFilterControls
            searchTerm={searchTerm}
            filters={filters}
            uniqueYears={uniqueYears}
            uniqueSources={uniqueSources}
            uniqueTags={uniqueTags}
            onSearchChange={handleSearchChange}
            onFilterChange={handleFilterChange}
          />
          
          {/* 结果头部 */}
          <ResultsHeader
            totalItems={filteredItems.length}
            visibleItems={paginatedItems.length}
          />
          
          {/* 加载状态 */}
          {loading && <HandwritingLoadingIndicator />}
          
          {/* 错误状态 */}
          {error && <ErrorState error={error} onRetry={refetch} />}
          
          {/* 瀑布流网格 */}
          {!loading && !error && (
            <>
              {filteredItems.length === 0 ? (
                <EmptyState />
              ) : (
                <HandwritingMasonryGrid
                  items={paginatedItems}
                  columns={columns}
                  columnArrays={columnArrays}
                  loading={pagination.isLoading}
                  hasMore={pagination.hasMore}
                  searchTerm={debouncedSearchTerm}
                  onCardClick={openLightbox}
                  onLoadMore={loadMore}
                />
              )}
            </>
          )}
        </div>
        
        {/* HandwritingLightbox */}
        {lightbox.selectedItem && (
          <HandwritingLightbox
            selectedItem={lightbox.selectedItem}
            currentIndex={lightbox.currentIndex}
            totalItems={filteredItems.length}
            searchTerm={debouncedSearchTerm}
            onClose={closeLightbox}
            onPrev={prevItem}
            onNext={nextItem}
          />
        )}
      </section>
    </>
  );
}
```

## 2. HandwritingFilterControls 组件

```typescript
// src/components/handwriting/HandwritingFilterControls.tsx
import { memo } from 'react';
import { Search } from 'lucide-react';
import { categoryLabels } from '@/utils/handwritingUtils';

interface FilterControlsProps {
  searchTerm: string;
  filters: {
    selectedCategory: string;
    selectedYear: string;
    selectedSource: string;
    selectedTag: string;
    sortOrder: string;
  };
  uniqueYears: number[];
  uniqueSources: string[];
  uniqueTags: string[];
  onSearchChange: (term: string) => void;
  onFilterChange: (key: string, value: string) => void;
}

const HandwritingFilterControls = memo(({
  searchTerm,
  filters,
  uniqueYears,
  uniqueSources,
  uniqueTags,
  onSearchChange,
  onFilterChange
}: FilterControlsProps) => {
  return (
    <div className="space-y-4 mb-8">
      {/* 搜索栏 */}
      <div className="flex justify-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/60" size={20} />
          <input
            type="text"
            placeholder="搜索手迹（名称、原文、注释）..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 w-80"
          />
        </div>
      </div>
      
      {/* 筛选和排序控件 */}
      <div className="flex flex-wrap gap-4 justify-center">
        <select
          value={filters.selectedCategory}
          onChange={(e) => onFilterChange('selectedCategory', e.target.value)}
          className="px-4 py-2 bg-white border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
        >
          <option value="all">全部类型</option>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <select
          value={filters.selectedYear}
          onChange={(e) => onFilterChange('selectedYear', e.target.value)}
          className="px-4 py-2 bg-white border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
        >
          <option value="all">全部年份</option>
          {uniqueYears.map(year => (
            <option key={year} value={year.toString()}>{year}年</option>
          ))}
        </select>
        
        <select
          value={filters.selectedSource}
          onChange={(e) => onFilterChange('selectedSource', e.target.value)}
          className="px-4 py-2 bg-white border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
        >
          <option value="all">全部来源</option>
          {uniqueSources.map(source => (
            <option key={source} value={source}>{source}</option>
          ))}
        </select>
        
        <select
          value={filters.selectedTag}
          onChange={(e) => onFilterChange('selectedTag', e.target.value)}
          className="px-4 py-2 bg-white border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
        >
          <option value="all">时间 ({uniqueTags.length})</option>
          {uniqueTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
        
        <select
          value={filters.sortOrder}
          onChange={(e) => onFilterChange('sortOrder', e.target.value)}
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
});

HandwritingFilterControls.displayName = 'HandwritingFilterControls';

export default HandwritingFilterControls;
```

## 3. HandwritingMasonryGrid 组件

```typescript
// src/components/handwriting/HandwritingMasonryGrid.tsx
import { memo, useRef, useEffect, useCallback } from 'react';
import HandwritingCard from './HandwritingCard';
import HandwritingSkeletonGrid from './HandwritingSkeletonGrid';
import HandwritingPaginationTrigger from './HandwritingPaginationTrigger';
import type { TransformedHandwritingItem } from '@/hooks/useHandwritingData';

interface MasonryGridProps {
  items: TransformedHandwritingItem[];
  columns: number;
  columnArrays: TransformedHandwritingItem[][];
  loading: boolean;
  hasMore: boolean;
  searchTerm: string;
  onCardClick: (item: TransformedHandwritingItem) => void;
  onLoadMore: () => void;
}

const HandwritingMasonryGrid = memo(({
  items,
  columns,
  columnArrays,
  loading,
  hasMore,
  searchTerm,
  onCardClick,
  onLoadMore
}: MasonryGridProps) => {
  const masonryRef = useRef<HTMLDivElement>(null);
  
  // 渲染单个手迹卡片
  const renderHandwritingCard = useCallback((item: TransformedHandwritingItem, columnIndex: number) => (
    <HandwritingCard
      key={item.id}
      item={item}
      isVisible={true}
      columnIndex={columnIndex}
      searchTerm={searchTerm}
      onCardClick={onCardClick}
    />
  ), [searchTerm, onCardClick]);
  
  return (
    <>
      {/* 骨架屏加载效果 */}
      {loading && (
        <HandwritingSkeletonGrid 
          columns={columns}
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
      
      {/* 分页触发器 */}
      {hasMore && !loading && (
        <HandwritingPaginationTrigger
          hasMore={hasMore}
          isLoading={loading}
          onLoadMore={onLoadMore}
        />
      )}
      
      {/* 显示当前加载状态 */}
      {!loading && (
        <div className="text-center py-4 text-sm text-charcoal/50">
          已显示 {items.length} 项
        </div>
      )}
    </>
  );
});

HandwritingMasonryGrid.displayName = 'HandwritingMasonryGrid';

export default HandwritingMasonryGrid;
```

## 4. useHandwritingPagination Hook

```typescript
// src/hooks/useHandwritingPagination.ts
import { useState, useCallback, useEffect } from 'react';
import type { TransformedHandwritingItem } from './useHandwritingData';

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  hasMore: boolean;
  isLoading: boolean;
}

interface UseHandwritingPaginationReturn {
  pagination: PaginationState;
  paginatedItems: TransformedHandwritingItem[];
  loadMore: () => void;
  resetPagination: () => void;
}

export const useHandwritingPagination = (
  items: TransformedHandwritingItem[], 
  itemsPerPage: number = 20
): UseHandwritingPaginationReturn => {
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage,
    hasMore: true,
    isLoading: false
  });
  
  // 计算分页后的项目
  const paginatedItems = items.slice(0, pagination.currentPage * pagination.itemsPerPage);
  
  // 更新是否有更多数据
  useEffect(() => {
    const hasMore = paginatedItems.length < items.length;
    if (hasMore !== pagination.hasMore) {
      setPagination(prev => ({ ...prev, hasMore }));
    }
  }, [paginatedItems.length, items.length, pagination.hasMore]);
  
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
  
  // 重置分页
  const resetPagination = useCallback(() => {
    setPagination(prev => ({
      ...prev,
      currentPage: 1,
      hasMore: true
    }));
  }, []);
  
  return {
    pagination,
    paginatedItems,
    loadMore,
    resetPagination
  };
};

export default useHandwritingPagination;
```

## 5. useHandwritingLayout Hook

```typescript
// src/hooks/useHandwritingLayout.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { debounce } from '@/utils/handwritingUtils';
import type { TransformedHandwritingItem } from './useHandwritingData';

interface LayoutState {
  columns: number;
  columnArrays: TransformedHandwritingItem[][];
}

const getResponsiveColumns = (width: number): number => {
  if (width < 640) return 1;
  if (width < 768) return 2;
  if (width < 1024) return 3;
  return 4;
};

const calculateMasonryLayout = (
  items: TransformedHandwritingItem[],
  columns: number
): TransformedHandwritingItem[][] => {
  const columnArrays: TransformedHandwritingItem[][] = Array.from({ length: columns }, () => []);
  const columnHeights = new Array(columns).fill(0);

  items.forEach((item) => {
    const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
    columnArrays[shortestColumnIndex].push(item);
    columnHeights[shortestColumnIndex] += item.dimensions.height + 20; // 20px gap
  });

  return columnArrays;
};

export const useHandwritingLayout = (items: TransformedHandwritingItem[]): LayoutState => {
  const [columns, setColumns] = useState(4);
  
  // 响应式列数计算
  useEffect(() => {
    const debouncedUpdateColumns = debounce(() => {
      const width = window.innerWidth;
      const newColumns = getResponsiveColumns(width);
      setColumns(newColumns);
    }, 150);

    // 初始调用
    const initialUpdate = () => {
      const width = window.innerWidth;
      const newColumns = getResponsiveColumns(width);
      setColumns(newColumns);
    };
    
    initialUpdate();
    window.addEventListener('resize', debouncedUpdateColumns);
    
    return () => {
      window.removeEventListener('resize', debouncedUpdateColumns);
      debouncedUpdateColumns.cancel?.();
    };
  }, []);
  
  // 计算瀑布流布局
  const columnArrays = useMemo(() => {
    return calculateMasonryLayout(items, columns);
  }, [items, columns]);
  
  return {
    columns,
    columnArrays
  };
};

export default useHandwritingLayout;
```

## 6. useHandwritingLightbox Hook

```typescript
// src/hooks/useHandwritingLightbox.ts
import { useState, useCallback, useEffect } from 'react';
import type { TransformedHandwritingItem } from './useHandwritingData';

interface LightboxState {
  selectedItem: TransformedHandwritingItem | null;
  currentIndex: number;
}

interface UseHandwritingLightboxReturn {
  lightbox: LightboxState;
  openLightbox: (item: TransformedHandwritingItem) => void;
  closeLightbox: () => void;
  nextItem: () => void;
  prevItem: () => void;
}

export const useHandwritingLightbox = (
  items: TransformedHandwritingItem[]
): UseHandwritingLightboxReturn => {
  const [lightbox, setLightbox] = useState<LightboxState>({
    selectedItem: null,
    currentIndex: 0
  });
  
  // 打开Lightbox
  const openLightbox = useCallback((item: TransformedHandwritingItem) => {
    setLightbox({
      selectedItem: item,
      currentIndex: items.findIndex(i => i.id === item.id)
    });
  }, [items]);
  
  // 关闭Lightbox
  const closeLightbox = useCallback(() => {
    setLightbox(prev => ({ ...prev, selectedItem: null }));
  }, []);
  
  // 下一个项目
  const nextItem = useCallback(() => {
    if (items.length === 0) return;
    
    const newIndex = (lightbox.currentIndex + 1) % items.length;
    setLightbox(prev => ({
      ...prev,
      currentIndex: newIndex,
      selectedItem: items[newIndex]
    }));
  }, [items, lightbox.currentIndex]);
  
  // 上一个项目
  const prevItem = useCallback(() => {
    if (items.length === 0) return;
    
    const newIndex = lightbox.currentIndex === 0 ? items.length - 1 : lightbox.currentIndex - 1;
    setLightbox(prev => ({
      ...prev,
      currentIndex: newIndex,
      selectedItem: items[newIndex]
    }));
  }, [items, lightbox.currentIndex]);
  
  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightbox.selectedItem) {
        switch (e.key) {
          case 'Escape':
            closeLightbox();
            break;
          case 'ArrowRight':
            nextItem();
            break;
          case 'ArrowLeft':
            prevItem();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox.selectedItem, closeLightbox, nextItem, prevItem]);
  
  return {
    lightbox,
    openLightbox,
    closeLightbox,
    nextItem,
    prevItem
  };
};

export default useHandwritingLightbox;
```

## 7. useHandwritingSearch Hook

```typescript
// src/hooks/useHandwritingSearch.ts
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseHandwritingSearchReturn {
  searchTerm: string;
  debouncedSearchTerm: string;
  updateSearchTerm: (term: string) => void;
}

export const useHandwritingSearch = (debounceMs: number = 300): UseHandwritingSearchReturn => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 更新搜索词
  const updateSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
    
    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // 设置新的防抖定时器
    timeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(term);
    }, debounceMs);
  }, [debounceMs]);
  
  // 清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return {
    searchTerm,
    debouncedSearchTerm,
    updateSearchTerm
  };
};

export default useHandwritingSearch;
```

## 8. useHandwritingPreloader Hook

```typescript
// src/hooks/useHandwritingPreloader.ts
import { useEffect } from 'react';
import { ImagePreloader } from '@/utils/imagePreloader';
import type { TransformedHandwritingItem } from './useHandwritingData';

export const useHandwritingPreloader = (
  items: TransformedHandwritingItem[],
  currentPage: number,
  itemsPerPage: number
) => {
  useEffect(() => {
    if (items.length === 0) return;
    
    const startIndex = 0;
    const endIndex = currentPage * itemsPerPage;
    const currentItems = items.slice(startIndex, endIndex);
    
    // 预加载当前页面的图片
    const currentImages = currentItems.map(item => item.image);
    
    // 预加载下一页的图片（预取）
    const nextStartIndex = endIndex;
    const nextEndIndex = endIndex + itemsPerPage;
    const nextItems = items.slice(nextStartIndex, nextEndIndex);
    const nextImages = nextItems.map(item => item.image);
    
    // 执行智能预加载
    ImagePreloader.smartPreload(currentImages, nextImages, {
      priority: true,
      timeout: 3000,
      retryCount: 1
    });
  }, [items, currentPage, itemsPerPage]);
};

export default useHandwritingPreloader;
```

## 9. 简单的状态组件

```typescript
// src/components/handwriting/ResultsHeader.tsx
import { memo } from 'react';

interface ResultsHeaderProps {
  totalItems: number;
  visibleItems: number;
}

const ResultsHeader = memo(({ totalItems, visibleItems }: ResultsHeaderProps) => (
  <div className="text-center mb-8">
    <p className="text-charcoal/60">
      找到 <span className="font-bold text-gold">{totalItems}</span> 件手迹
      {visibleItems < totalItems && (
        <span>，显示 <span className="font-bold text-gold">{visibleItems}</span> 项</span>
      )}
    </p>
  </div>
));

ResultsHeader.displayName = 'ResultsHeader';

export default ResultsHeader;

// src/components/handwriting/EmptyState.tsx
import { memo } from 'react';

interface EmptyStateProps {
  message?: string;
}

const EmptyState = memo(({ message = "未找到相关手迹" }: EmptyStateProps) => (
  <div className="text-center py-12">
    <div className="text-6xl mb-4">📜</div>
    <h3 className="text-xl font-bold text-charcoal mb-2">{message}</h3>
    <p className="text-charcoal/60">请尝试调整搜索条件</p>
  </div>
));

EmptyState.displayName = 'EmptyState';

export default EmptyState;

// src/components/handwriting/ErrorState.tsx
import { memo } from 'react';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

const ErrorState = memo(({ error, onRetry }: ErrorStateProps) => (
  <div className="text-center py-12">
    <div className="text-6xl mb-4">❌</div>
    <h3 className="text-xl font-bold text-charcoal mb-2">加载失败</h3>
    <p className="text-charcoal/60 mb-4">{error}</p>
    <button 
      onClick={onRetry}
      className="bg-gold text-cream px-6 py-2 rounded-lg hover:bg-gold/90 transition-colors"
    >
      重新加载
    </button>
  </div>
));

ErrorState.displayName = 'ErrorState';

export default ErrorState;

// src/components/handwriting/HandwritingLoadingIndicator.tsx
import { memo } from 'react';

interface LoadingIndicatorProps {
  message?: string;
}

const HandwritingLoadingIndicator = memo(({ message = "加载中..." }: LoadingIndicatorProps) => (
  <div className="flex justify-center items-center py-12">
    <div className="flex items-center gap-2 text-charcoal/60">
      <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
      <span>{message}</span>
    </div>
  </div>
));

HandwritingLoadingIndicator.displayName = 'HandwritingLoadingIndicator';

export default HandwritingLoadingIndicator;

// src/components/handwriting/HandwritingPaginationTrigger.tsx
import { memo, useRef, useEffect, useCallback } from 'react';

interface PaginationTriggerProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

const HandwritingPaginationTrigger = memo(({ hasMore, isLoading, onLoadMore }: PaginationTriggerProps) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  
  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || isLoading) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onLoadMore();
          }
        });
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1
      }
    );

    const currentTrigger = triggerRef.current;
    if (currentTrigger) {
      observer.observe(currentTrigger);
    }

    return () => {
      if (currentTrigger) {
        observer.unobserve(currentTrigger);
      }
    };
  }, [hasMore, isLoading, onLoadMore]);
  
  return (
    <div ref={triggerRef} className="flex justify-center items-center py-8">
      {isLoading && (
        <div className="flex items-center gap-2 text-charcoal/60">
          <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
          <span>加载更多...</span>
        </div>
      )}
    </div>
  );
});

HandwritingPaginationTrigger.displayName = 'HandwritingPaginationTrigger';

export default HandwritingPaginationTrigger;
```

## 重构后的文件结构

```
src/
├── components/
│   └── handwriting/
│       ├── HandwritingModule.tsx          # 主组件 (约100行)
│       ├── HandwritingFilterControls.tsx              # 过滤器控件
│       ├── ResultsHeader.tsx               # 结果头部
│       ├── HandwritingMasonryGrid.tsx                 # 瀑布流网格
│       ├── EmptyState.tsx                  # 空状态
│       ├── ErrorState.tsx                  # 错误状态
│       ├── HandwritingLoadingIndicator.tsx            # 加载指示器
│       ├── HandwritingPaginationTrigger.tsx           # 分页触发器
│       ├── HandwritingCard.tsx             # 手迹卡片 (现有)
│       ├── HandwritingLightbox.tsx                    # 图片预览 (现有)
│       └── HandwritingSkeletonGrid.tsx                # 骨架屏 (现有)
├── hooks/
│   ├── useHandwritingData.ts               # 数据获取 (现有)
│   ├── useHandwritingFilters.ts            # 过滤器 (现有，需优化)
│   ├── useHandwritingPagination.ts         # 分页管理
│   ├── useHandwritingLayout.ts             # 布局管理
│   ├── useHandwritingLightbox.ts           # Lightbox管理
│   ├── useHandwritingSearch.ts             # 搜索管理
│   └── useHandwritingPreloader.ts          # 图片预加载
└── utils/
    ├── handwritingUtils.ts                 # 工具函数 (现有)
    └── imagePreloader.ts                   # 图片预加载 (现有)
```

## 重构效果总结

### 代码行数对比
- **重构前**: HandwritingModule.tsx 540行
- **重构后**: 
  - HandwritingModule.tsx ~100行
  - HandwritingFilterControls.tsx ~60行
  - HandwritingMasonryGrid.tsx ~50行
  - 各个Hook ~40-60行
  - 状态组件 ~10-20行

### 职责分离
- **主组件**: 协调各个子组件和Hook
- **子组件**: 专注UI渲染和用户交互
- **Hook**: 专注业务逻辑和状态管理

### 性能优化
- 使用React.memo避免不必要的重渲染
- 使用useMemo缓存计算结果
- 使用useCallback缓存函数引用
- 智能的图片预加载策略

### 可维护性提升
- 单一职责原则
- 清晰的组件边界
- 易于测试和调试
- 便于功能扩展
