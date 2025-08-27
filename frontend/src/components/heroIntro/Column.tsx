import React, { useEffect } from 'react';
import { MasonryItem } from '@/services/heroImageService';
import PerformanceMonitor from '@/utils/performanceMonitor';
import ImageItem from './ImageItem';

interface ColumnProps {
  column: MasonryItem[];
  columnIndex: number;
  visibleItemsPerColumn: number;
}

const Column = React.memo(({ 
  column, 
  columnIndex,
  visibleItemsPerColumn 
}: ColumnProps) => {
  useEffect(() => {
    const renderId = PerformanceMonitor.trackRenderStart(`hero-column-${columnIndex}`, { 
      itemCount: column.length 
    });
    return () => {
      PerformanceMonitor.trackRenderEnd(renderId);
    };
  }, [column.length, columnIndex]);

  return (
    <div className="flex-1 space-y-4">
      {column.map((item, itemIndex) => {
        const isVisible = itemIndex < visibleItemsPerColumn;
        
        return (
          <ImageItem
            key={`${item.id}-${columnIndex}-${itemIndex}`}
            item={item}
            columnIndex={columnIndex}
            itemIndex={itemIndex}
            isVisible={isVisible}
          />
        );
      })}
    </div>
  );
});

Column.displayName = 'Column';

export default Column;