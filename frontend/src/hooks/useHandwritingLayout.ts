import { useState, useEffect, useMemo } from 'react';
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