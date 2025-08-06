import React, { useEffect, useRef } from 'react';
import { BookItem } from '../../types/bookTypes';
import BookCard from './BookCardContainer.tsx';

// 添加调试常量
const DEBUG = true;
const logDebug = (message: string, data?: unknown) => {
  if (DEBUG) {
    console.log(`[BookGrid] ${message}`, data || '');
  }
};

//【修改】从 Props 中移除 isRapidScrolling
interface BookGridProps {
  columnArrays: BookItem[][];
  visibleItems: Set<number>;
  onOpenLightbox: (item: BookItem) => void;
}

const BookGridContainer: React.FC<BookGridProps> = ({
  columnArrays,
  visibleItems,
  onOpenLightbox
}) => {
  const renderCountRef = useRef(0);
  const prevVisibleSizeRef = useRef(visibleItems.size);
  renderCountRef.current += 1;
  
  //【修改】简化调试日志，移除 isRapidScrolling
  useEffect(() => {
    const visibleSizeChanged = prevVisibleSizeRef.current !== visibleItems.size;
    if (visibleSizeChanged) {
      logDebug('可见项目集合更新', {
        visibleCount: visibleItems.size,
        prevVisibleCount: prevVisibleSizeRef.current,
        renderCount: renderCountRef.current
      });
      prevVisibleSizeRef.current = visibleItems.size;
    }
  }, [visibleItems]);
  
  //【修改】简化渲染日志
  if (DEBUG) {
    console.log(`[BookGrid] 渲染网格`, { 
      renderCount: renderCountRef.current,
      columnCount: columnArrays.length,
      visibleCount: visibleItems.size
    });
  }

  if (columnArrays.length === 0) {
    return (
      <div className="w-full text-center py-8">
        <p className="text-gray-600 font-serif">无数据可显示</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 auto-cols-fr" style={{ gridTemplateColumns: `repeat(${columnArrays.length}, 1fr)` }}>
      {columnArrays.map((column, columnIndex) => (
        <div key={columnIndex} className="flex flex-col gap-4">
          {column.map((item) => {
            const isVisible = visibleItems.has(item.id);
            return (
              <BookCard
                key={item.id}
                item={item}
                isVisible={isVisible}
                columnIndex={columnIndex}
                onOpenLightbox={onOpenLightbox}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

// 【修改】优化 React.memo 的比较函数
const areEqual = (prevProps: BookGridProps, nextProps: BookGridProps) => {
  // 1. 如果列数组的引用没有变，那么数据就没有变，瀑布流结构不变
  if (prevProps.columnArrays !== nextProps.columnArrays) {
    return false;
  }
  // 2. 如果可见项的引用没有变，那么可见性就没有变
  if (prevProps.visibleItems !== nextProps.visibleItems) {
    return false;
  }
  // 3. 如果打开灯箱的函数句柄变了（通常不应该），则需要重渲染
  if (prevProps.onOpenLightbox !== nextProps.onOpenLightbox) {
    return false;
  }
  
  // 如果以上都没有变化，则跳过重渲染
  return true;
};
export default React.memo(BookGridContainer, areEqual);
