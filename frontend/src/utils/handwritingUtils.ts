import { useMemo } from 'react';
import React from 'react';

// 工具函数：高亮搜索文本
export const highlightSearchText = (text: string, searchTerm: string): React.ReactElement => {
  if (!searchTerm) return React.createElement(React.Fragment, null, text);
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  const parts = text.split(regex);
  
  return React.createElement(React.Fragment, null, 
    parts.map((part, index) => 
      regex.test(part) ? (
        React.createElement('span', { 
          key: `${index}-${part}`, 
          className: 'bg-yellow-200 text-charcoal font-bold' 
        }, part)
      ) : (
        React.createElement('span', { 
          key: `${index}-${part}` 
        }, part)
      )
    )
  );
};

// 工具函数：防抖
export const debounce = <T extends (...args: any[]) => void>(func: T, wait: number): T => {
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

// 工具函数：响应式列数计算
export const getResponsiveColumns = (width: number): number => {
  if (width < 640) return 1;
  if (width < 768) return 2;
  if (width < 1024) return 3;
  return 4;
};

// 工具函数：计算瀑布流布局
export const calculateMasonryLayout = (
  items: any[],
  columns: number
): any[][] => {
  const columnArrays: any[][] = Array.from({ length: columns }, () => []);
  const columnHeights = new Array(columns).fill(0);

  items.forEach((item) => {
    const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
    columnArrays[shortestColumnIndex].push(item);
    columnHeights[shortestColumnIndex] += item.dimensions.height + 20; // 20px gap
  });

  return columnArrays;
};

// 类别标签映射 - 使用JSON中的真实标签
export const categoryLabels: Record<string, string> = {
  '题词': '题词',
  '文稿': '文稿', 
  '书简': '书简',
  '其他': '其他'
};

// 类别颜色映射 - 为真实标签分配颜色
export const categoryColors: Record<string, string> = {
  '题词': 'bg-blue-500',
  '文稿': 'bg-gold',
  '书简': 'bg-green-500',
  '其他': 'bg-gray-500'
};

// Hook：使用防抖的响应式列数
export const useResponsiveColumns = () => {
  return useMemo(() => {
    const updateColumns = (setWidth: (width: number) => void) => {
      const handleResize = () => {
        const width = window.innerWidth;
        const newColumns = getResponsiveColumns(width);
        setWidth(newColumns);
      };

      handleResize(); // 初始调用
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    };

    return updateColumns;
  }, []);
};

export default {
  highlightSearchText,
  debounce,
  getResponsiveColumns,
  calculateMasonryLayout,
  categoryLabels,
  categoryColors,
  useResponsiveColumns
};