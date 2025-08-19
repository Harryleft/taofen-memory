import { useMemo, memo, useState } from 'react';
import { ZoomIn, Image } from 'lucide-react';
import { highlightSearchText, categoryLabels } from '@/utils/handwritingUtils.ts';
import type { TransformedHandwritingItem } from '@/hooks/useHandwritingData.ts';

interface HandwritingCardProps {
  item: TransformedHandwritingItem;
  isVisible: boolean;
  columnIndex: number;
  searchTerm: string;
  onCardClick: (item: TransformedHandwritingItem) => void;
}

const HandwritingCard = memo(({ 
  item, 
  isVisible, 
  columnIndex, 
  searchTerm, 
  onCardClick 
}: HandwritingCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const highlightedTitle = useMemo(() => highlightSearchText(item.title, searchTerm), [item.title, searchTerm]);
  const highlightedDescription = useMemo(() => highlightSearchText(item.description, searchTerm), [item.description, searchTerm]);
  
    
  return (
    <div
      data-item-id={item.id}
      className={`group cursor-pointer transform transition-all duration-700 ${
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-8 opacity-0'
      }`}
      onClick={() => onCardClick(item)}
      style={{
        animationDelay: `${columnIndex * 100}ms`
      }}
    >
      <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
        <div className="relative overflow-hidden">
          {/* 图片占位符 */}
          {!imageLoaded && !imageError && (
            <div 
              className="w-full bg-gray-100 flex items-center justify-center"
              style={{ height: `${item.dimensions.height}px` }}
            >
              <div className="text-gray-400">
                <Image size={32} className="animate-pulse" />
              </div>
            </div>
          )}
          
          {/* 图片加载失败占位符 */}
          {imageError && (
            <div 
              className="w-full bg-gray-200 flex items-center justify-center"
              style={{ height: `${item.dimensions.height}px` }}
            >
              <div className="text-gray-500 text-center">
                <Image size={32} />
                <p className="text-xs mt-1">图片加载失败</p>
              </div>
            </div>
          )}
          
          {/* 实际图片 */}
          <img
            src={item.image}
            alt={item.title}
            className={`w-full object-cover group-hover:scale-110 transition-transform duration-700 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ height: `${item.dimensions.height}px` }}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
          
          {/* 悬停效果 */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
            <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={32} />
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`handwriting-category-tag category-${item.category}`}>
              {categoryLabels[item.category]}
            </span>
            <span className="text-xs text-charcoal/60">{item.year}年</span>
          </div>
          <h3 className="font-bold text-charcoal mb-2 group-hover:text-gold transition-colors">
            {highlightedTitle}
          </h3>
          <p className="text-sm text-charcoal/70 mb-2 line-clamp-2">
            {highlightedDescription}
          </p>
          <div className="handwriting-tags">
            {item.tags.filter(tag => !tag.includes('年')).slice(0, 2).map((tag, index) => (
              <span key={index} className="handwriting-tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

HandwritingCard.displayName = 'HandwritingCard';

export default HandwritingCard;