import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { BookItem } from '../../types/bookTypes';

interface BookLightboxProps {
  selectedItem: BookItem | null;
  currentIndex: number;
  totalCount: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const BookLightbox: React.FC<BookLightboxProps> = ({
  selectedItem,
  currentIndex,
  totalCount,
  onClose,
  onNext,
  onPrev
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  if (!selectedItem) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
        {/* Navigation */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
        >
          <X size={24} />
        </button>
        
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
        >
          <ChevronLeft size={32} />
        </button>
        
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
        >
          <ChevronRight size={32} />
        </button>

        {/* Content */}
        <div className="flex flex-col lg:flex-row max-h-[90vh]">
          {/* Image */}
          <div className="flex-1 flex items-center justify-center bg-amber-50 p-4">
            <img
              src={selectedItem.image}
              alt={selectedItem.title}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          
          {/* Details */}
          <div className="w-full lg:w-96 p-6 overflow-y-auto bg-white">
            <h3 className="text-2xl font-bold text-charcoal mb-4" style={{fontFamily: "'KaiTi', 'STKaiti', '华文楷体', serif", letterSpacing: '0.02em'}}>
              {selectedItem.title}
            </h3>
            
            <div className="space-y-3 mb-6">
              <p className="text-charcoal/80" style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif"}}>
                <span className="font-semibold">作者：</span>{selectedItem.author}
              </p>
              <p className="text-charcoal/80" style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif"}}>
                <span className="font-semibold">出版社：</span>{selectedItem.publisher}
              </p>
            </div>
            
            <div className="mt-4 text-sm text-charcoal/60 text-center" style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif"}}>
              {currentIndex + 1} / {totalCount}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookLightbox;
