import { memo, useRef, useCallback } from 'react';
import HandwritingCard from './HandwritingCard';
import HandwritingSkeletonGrid from './HandwritingSkeletonGrid.tsx';
import HandwritingPaginationTrigger from './HandwritingPaginationTrigger.tsx';
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
