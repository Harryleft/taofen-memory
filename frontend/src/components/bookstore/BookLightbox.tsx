import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { BookItem } from '../../types/bookTypes';
import { BOOKSTORE_STYLES, BOOKSTORE_FONTS } from '../../styles/bookstore';

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
    <div className={BOOKSTORE_STYLES.lightbox.overlay}>
      <div className={BOOKSTORE_STYLES.lightbox.container}>
        {/* Navigation */}
        <button
          onClick={onClose}
          className={BOOKSTORE_STYLES.lightbox.navigation.close}
        >
          <X size={24} />
        </button>
        
        <button
          onClick={onPrev}
          className={BOOKSTORE_STYLES.lightbox.navigation.prev}
        >
          <ChevronLeft size={32} />
        </button>
        
        <button
          onClick={onNext}
          className={BOOKSTORE_STYLES.lightbox.navigation.next}
        >
          <ChevronRight size={32} />
        </button>

        {/* Content */}
        <div className={BOOKSTORE_STYLES.lightbox.content}>
          {/* Image */}
          <div className={BOOKSTORE_STYLES.lightbox.imageSection}>
            <img
              src={selectedItem.image}
              alt={selectedItem.title}
              className={BOOKSTORE_STYLES.lightbox.image}
            />
          </div>
          
          {/* Details */}
          <div className={BOOKSTORE_STYLES.lightbox.detailsSection}>
            <h3 className={BOOKSTORE_STYLES.lightbox.title} style={{fontFamily: BOOKSTORE_FONTS.kai, letterSpacing: '0.02em'}}>
              {selectedItem.title}
            </h3>
            
            <div className={BOOKSTORE_STYLES.lightbox.details}>
              <p className={BOOKSTORE_STYLES.lightbox.detailItem} style={{fontFamily: BOOKSTORE_FONTS.song}}>
                <span className="font-semibold">作者：</span>{selectedItem.author}
              </p>
              <p className={BOOKSTORE_STYLES.lightbox.detailItem} style={{fontFamily: BOOKSTORE_FONTS.song}}>
                <span className="font-semibold">出版社：</span>{selectedItem.publisher}
              </p>
            </div>
            
            <div className={BOOKSTORE_STYLES.lightbox.counter} style={{fontFamily: BOOKSTORE_FONTS.song}}>
              {currentIndex + 1} / {totalCount}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookLightbox;
