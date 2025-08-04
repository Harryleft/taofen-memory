import React, { useMemo } from 'react';
import { BookItem } from '../../types/bookTypes';
import BookCard from './BookCard';
import { useVirtualizedScroll } from '../../hooks/useVirtualizedScroll';

interface VirtualizedBookGridProps {
  items: BookItem[];
  columnCount: number;
  onOpenLightbox: (item: BookItem) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

/**
 * 基于第一性原理重新设计的虚拟化书籍网格组件
 * 
 * 核心原理：
 * 1. 按需渲染：只渲染可见区域的内容
 * 2. 最小重新渲染：通过精确的依赖管理避免不必要的更新
 * 3. 性能优先：优化滚动流畅度
 */
const VirtualizedBookGrid: React.FC<VirtualizedBookGridProps> = ({
  items,
  columnCount,
  onOpenLightbox,
  onLoadMore,
  hasMore = false,
  isLoading = false
}) => {
  const {
    virtualState,
    containerRef,
    scrollElementRef,
    getItemStyle,
    isItemVisible
  } = useVirtualizedScroll({
    items,
    columnCount,
    onLoadMore,
    hasMore
  });

  // 将可见项目按列分组
  const visibleItemsWithPosition = useMemo(() => {
    return virtualState.visibleItems.map((item, index) => {
      const actualIndex = virtualState.startIndex + index;
      const row = Math.floor(actualIndex / columnCount);
      const col = actualIndex % columnCount;
      return {
        item,
        actualIndex,
        row,
        col,
        style: getItemStyle(actualIndex)
      };
    });
  }, [virtualState.visibleItems, virtualState.startIndex, columnCount, getItemStyle]);

  // 如果没有数据，显示空状态
  if (items.length === 0 && !isLoading) {
    return (
      <div className="w-full text-center py-8">
        <p className="text-charcoal/60" style={{ fontFamily: "'SimSun', '宋体', 'NSimSun', serif" }}>
          无数据可显示
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="h-full overflow-auto"
      style={{ position: 'relative' }}
    >
      {/* 虚拟滚动容器 */}
      <div 
        ref={scrollElementRef}
        style={{ 
          height: virtualState.totalHeight,
          position: 'relative'
        }}
      >
        {/* 渲染可见项目 */}
        {visibleItemsWithPosition.map(({ item, actualIndex, row, col, style }) => (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              top: row * 300, // 使用固定高度
              left: `${(col / columnCount) * 100}%`,
              width: `${100 / columnCount}%`,
              padding: '0 10px', // 添加间距
            }}
          >
            <BookCard
              item={item}
              isVisible={true} // 虚拟化滚动中的项目都是可见的
              isRapidScrolling={false} // 虚拟化滚动不需要快速滚动检测
              columnIndex={col}
              onOpenLightbox={onOpenLightbox}
            />
          </div>
        ))}
        
        {/* 加载更多指示器 */}
        {hasMore && (
          <div 
            className="w-full text-center py-8"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0
            }}
          >
            {isLoading ? (
              <p className="text-charcoal/60">加载中...</p>
            ) : (
              <p className="text-charcoal/40">滚动加载更多</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// 使用React.memo优化，但采用更简单的比较逻辑
export default React.memo(VirtualizedBookGrid, (prevProps, nextProps) => {
  // 只比较真正影响渲染的属性
  return (
    prevProps.items.length === nextProps.items.length &&
    prevProps.columnCount === nextProps.columnCount &&
    prevProps.hasMore === nextProps.hasMore &&
    prevProps.isLoading === nextProps.isLoading &&
    // 浅比较items数组的引用（如果数据管理正确，引用变化意味着内容变化）
    prevProps.items === nextProps.items
  );
});