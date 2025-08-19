import { useMemo, memo } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { categoryLabels, highlightSearchText } from '@/utils/handwritingUtils.ts';
import type { TransformedHandwritingItem } from '@/hooks/useHandwritingData.ts';

interface LightboxProps {
  selectedItem: TransformedHandwritingItem;
  currentIndex: number;
  totalItems: number;
  searchTerm: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const HandwritingLightbox = memo(({
  selectedItem, 
  currentIndex, 
  totalItems, 
  searchTerm, 
  onClose, 
  onPrev, 
  onNext 
}: LightboxProps) => {
  const highlightedTitle = useMemo(() => highlightSearchText(selectedItem.title, searchTerm), [selectedItem.title, searchTerm]);
  const highlightedContent = useMemo(() => highlightSearchText(selectedItem.originalData.原文, searchTerm), [selectedItem.originalData.原文, searchTerm]);
  const highlightedNotes = useMemo(() => highlightSearchText(selectedItem.originalData.注释, searchTerm), [selectedItem.originalData.注释, searchTerm]);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-6xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
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
          <div className="flex-1 flex items-center justify-center bg-gray-100 p-4">
            <img
              src={selectedItem.highResImage}
              alt={selectedItem.title}
              className="max-w-full max-h-full object-contain"
              loading="lazy"
            />
          </div>
          
          {/* Details */}
          <div className="w-full lg:w-96 p-6 overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className={`handwriting-category-tag category-${selectedItem.category}`}>
                {categoryLabels[selectedItem.category]}
              </span>
              <span className="text-gold font-bold">{selectedItem.year}年</span>
            </div>
            
            <h3 className="text-2xl font-bold text-charcoal mb-2 font-serif">
              {highlightedTitle}
            </h3>
            
            <p className="text-charcoal/60 mb-4">{selectedItem.originalData.时间}</p>
            
            <div className="mb-6">
              <h4 className="font-bold text-charcoal mb-2">原文</h4>
              <p className="text-charcoal/80 leading-relaxed bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                {highlightedContent}
              </p>
            </div>
            
            <div className="mb-6">
              <h4 className="font-bold text-charcoal mb-2">注释</h4>
              <p className="text-charcoal/80 leading-relaxed bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                {highlightedNotes}
              </p>
            </div>
            
            <div className="mb-6">
              <h4 className="font-bold text-charcoal mb-2">数据来源</h4>
              {selectedItem.originalData.图片位置 && 
               selectedItem.originalData.图片位置.length > 0 && 
               selectedItem.originalData.图片位置[0].remote_url ? (
                <a 
                  href={selectedItem.originalData.图片位置[0].remote_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold hover:text-gold/80 underline transition-colors"
                >
                  {selectedItem.originalData.数据来源}
                </a>
              ) : (
                <p className="text-charcoal/60">
                  {selectedItem.originalData.数据来源}
                </p>
              )}
            </div>
            
            <div className="mb-6">
              <h4 className="font-bold text-charcoal mb-2">标签</h4>
              <div className="flex flex-wrap gap-2">
                {selectedItem.tags.map((tag, index) => (
                  <span key={index} className="handwriting-tag-detail">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mt-4 text-sm text-charcoal/60 text-center">
              {currentIndex + 1} / {totalItems}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

HandwritingLightbox.displayName = 'HandwritingLightbox';

export default HandwritingLightbox;
