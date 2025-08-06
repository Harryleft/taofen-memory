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

const BookDetailModal: React.FC<BookLightboxProps> = ({
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
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-4xl max-h-full bg-white rounded-lg overflow-hidden shadow-2xl">
        {/* Navigation */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
        >
          <X size={24} />
        </button>
        
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
        >
          <ChevronLeft size={32} />
        </button>
        
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
        >
          <ChevronRight size={32} />
        </button>

        {/* Content */}
        <div className="flex flex-col md:flex-row max-h-[90vh]">
          {/* Image */}
          <div className="flex-1 flex items-center justify-center bg-gray-100 min-h-[300px] md:min-h-[400px]">
            <img
              src={selectedItem.image}
              alt={selectedItem.title}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          
          {/* Details */}
          <div className="w-full md:w-80 p-6 flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 font-serif leading-tight">
              {selectedItem.title}
            </h3>
            
            <div className="space-y-3 text-gray-700">
              <p className="text-base font-serif">
                <span className="font-semibold">作者：</span>{selectedItem.author}
              </p>
              <p className="text-base font-serif">
                <span className="font-semibold">出版社：</span>{selectedItem.publisher}
              </p>
              {selectedItem.year && (
                <p className="text-base font-serif">
                  <span className="font-semibold">年份：</span>{selectedItem.year}
                </p>
              )}
            </div>
            
            <div className="mt-6 text-sm text-gray-500 font-serif">
              {currentIndex + 1} / {totalCount}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailModal;
