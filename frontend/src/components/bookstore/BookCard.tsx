import React from 'react';
import { ZoomIn } from 'lucide-react';
import { BookItem } from '../../types/bookTypes';

interface BookCardProps {
  item: BookItem;
  isVisible: boolean;
  isRapidScrolling: boolean;
  columnIndex: number;
  onOpenLightbox: (item: BookItem) => void;
}

const BookCard: React.FC<BookCardProps> = ({
  item,
  isVisible,
  isRapidScrolling,
  columnIndex,
  onOpenLightbox
}) => {
  return (
    <div
      data-item-id={item.id}
      className={`group cursor-pointer transform transition-all ${
        isRapidScrolling ? 'duration-300' : 'duration-700'
      } ${
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-8 opacity-0'
      }`}
      onClick={() => onOpenLightbox(item)}
      style={{
        animationDelay: `${columnIndex * 100}ms`
      }}
    >
      <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-amber-200 relative">
        <div className="relative overflow-hidden">
          <img
            src={item.image}
            alt={item.title}
            className="w-full object-cover group-hover:scale-110 transition-transform duration-700"
            style={{ height: `${item.dimensions.height}px` }}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
            <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={32} />
          </div>
          
          <div className="absolute bottom-3 left-3">
            <div className="relative">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-lg"></div>
              <div className="relative px-3 py-1.5 text-white">
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 bg-gold rounded-full"></div>
                  <span className="text-xs font-medium tracking-wide">
                    {item.year}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-amber-50">
          <h3 className="font-bold text-charcoal mb-2 group-hover:text-gold transition-colors line-clamp-2" style={{fontFamily: "'KaiTi', 'STKaiti', '华文楷体', serif", letterSpacing: '0.02em'}}>
            {item.title}
          </h3>
          <p className="text-sm text-charcoal/70 mb-1" style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif"}}>
            作者：{item.author}
          </p>
          <p className="text-sm text-charcoal/70 mb-2" style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif"}}>
            出版：{item.publisher}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
