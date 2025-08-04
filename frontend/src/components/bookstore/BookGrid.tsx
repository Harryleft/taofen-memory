import React, { useEffect, useRef } from 'react';
import { BookItem } from '../../types/bookTypes';
import BookCard from './BookCard';

// 添加调试常量
const DEBUG = true;
const logDebug = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[BookGrid] ${message}`, data || '');
  }
};

interface BookGridProps {
  columnArrays: BookItem[][];
  visibleItems: Set<number>;
  isRapidScrolling: boolean;
  onOpenLightbox: (item: BookItem) => void;
}

const BookGrid: React.FC<BookGridProps> = ({
  columnArrays,
  visibleItems,
  isRapidScrolling,
  onOpenLightbox
}) => {
  // 添加渲染计数器，用于调试
  const renderCountRef = useRef(0);
  // 添加上一次可见项目集合大小引用，用于比较
  const prevVisibleSizeRef = useRef(visibleItems.size);
  
  // 组件渲染时增加计数器
  renderCountRef.current += 1;
  
  // 添加调试信息，记录可见项目的变化
  useEffect(() => {
    const visibleSizeChanged = prevVisibleSizeRef.current !== visibleItems.size;
    if (visibleSizeChanged) {
      logDebug('可见项目集合更新', {
        visibleCount: visibleItems.size,
        prevVisibleCount: prevVisibleSizeRef.current,
        isRapidScrolling,
        renderCount: renderCountRef.current
      });
      prevVisibleSizeRef.current = visibleItems.size;
    }
  }, [visibleItems, isRapidScrolling]);
  
  // 记录组件渲染
  if (DEBUG) {
    console.log(`[BookGrid] 渲染网格`, { 
      renderCount: renderCountRef.current,
      columnCount: columnArrays.length,
      visibleCount: visibleItems.size,
      isRapidScrolling
    });
  }

  if (columnArrays.length === 0) {
    return (
      <div className="w-full text-center py-8">
        <p className="text-charcoal/60" style={{ fontFamily: "'SimSun', '宋体', 'NSimSun', serif" }}>无数据可显示</p>
      </div>
    );
  }

  return (
    <div className="flex gap-5">
      {columnArrays.map((column, columnIndex) => (
        <div key={columnIndex} className="flex-1 flex flex-col gap-5">
          {column.map((item) => {
            const isVisible = visibleItems.has(item.id);
            return (
              <BookCard
                key={item.id}
                item={item}
                isVisible={isVisible}
                isRapidScrolling={isRapidScrolling}
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

// 使用 React.memo 包装组件，添加自定义比较函数以减少不必要的重新渲染
export default React.memo(BookGrid, (prevProps, nextProps) => {
  // 检查是否需要重新渲染
  const shouldRerender = (
    // 检查列数组是否相同
    prevProps.columnArrays.length !== nextProps.columnArrays.length ||
    // 检查快速滚动状态是否相同
    prevProps.isRapidScrolling !== nextProps.isRapidScrolling ||
    // 检查可见项目集合是否相同
    prevProps.visibleItems.size !== nextProps.visibleItems.size
  );
  
  // 添加更详细的调试日志
  if (DEBUG && shouldRerender) {
    console.log(`[BookGrid] 组件将重新渲染`, {
      columnLengthChanged: prevProps.columnArrays.length !== nextProps.columnArrays.length,
      rapidScrollingChanged: prevProps.isRapidScrolling !== nextProps.isRapidScrolling,
      visibleSizeChanged: prevProps.visibleItems.size !== nextProps.visibleItems.size,
      prevVisibleSize: prevProps.visibleItems.size,
      nextVisibleSize: nextProps.visibleItems.size
    });
  }
  
  // 返回是否相等（不需要重新渲染）
  return !shouldRerender;
});
