/**
 * @file BookGridContainer.tsx
 * @description 书籍网格布局的容器组件，负责渲染瀑布流的列和卡片。
 * @module components/bookstore/BookGridContainer
 */

import React, { useEffect, useRef } from 'react';
import { BookItem } from '@/types/bookTypes';
import BookCard from './BookCardContainer.tsx';

// 调试开关
const DEBUG = false;
const logDebug = (message: string, data?: unknown) => {
  if (DEBUG) {
    console.log(`[BookGrid] ${message}`, data || '');
  }
};

/**
 * @interface BookGridProps
 * @description BookGridContainer 组件的 props 定义。
 * @property {BookItem[][]} columnArrays - 一个二维数组，代表瀑布流的各列，每个子数组包含该列的所有书籍项。
 * @property {Set<number>} visibleItems - 一个包含当前视口内可见书籍 ID 的 Set 集合，用于懒加载。
 * @property {(item: BookItem) => void} onOpenLightbox - 点击书籍卡片时触发的回调，用于打开详情弹窗。
 */
interface BookGridProps {
  columnArrays: BookItem[][];
  visibleItems: Set<number>;
  onOpenLightbox: (item: BookItem) => void;
}

/**
 * @component BookGridContainer
 * @description 负责将传入的、已经按列分配好的书籍数据渲染成一个响应式的网格布局。
 * - 遍历 `columnArrays` 来创建列。
 * - 在每列中遍历书籍项，并渲染 `BookCard` 组件。
 * - 将 `visibleItems` 集合中的可见性状态传递给每个 `BookCard`。
 * - 使用 `React.memo` 和自定义比较函数 `areEqual` 来优化性能，避免不必要的重渲染。
 */
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

/**
 * @function areEqual
 * @description `React.memo` 的自定义比较函数，用于优化 BookGridContainer 的重渲染。
 * - 通过比较 `columnArrays` 和 `visibleItems` 的引用，快速判断数据和可见性是否发生变化。
 * - 这是提升瀑布流滚动性能的关键，因为它阻止了在滚动过程中整个网格的频繁重渲染。
 * @param {BookGridProps} prevProps - 上一次的 props。
 * @param {BookGridProps} nextProps - 当前的 props。
 * @returns {boolean} - 如果 props 相等，返回 `true`，跳过渲染；否则返回 `false`。
 */
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
