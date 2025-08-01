import React from 'react';
import { BookItem } from '../../types/bookTypes';
import BookCard from './BookCard';

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
          {column.map((item) => (
            <BookCard
              key={item.id}
              item={item}
              isVisible={visibleItems.has(item.id)}
              isRapidScrolling={isRapidScrolling}
              columnIndex={columnIndex}
              onOpenLightbox={onOpenLightbox}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default BookGrid;
