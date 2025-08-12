import { useMemo, memo } from 'react';
import { ZoomIn } from 'lucide-react';
import { highlightSearchText, categoryLabels, categoryColors } from '@/utils/handwritingUtils.ts';
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
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs text-white ${categoryColors[item.category]}`}>
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
          <div className="flex flex-wrap gap-1">
            {item.tags.filter(tag => !tag.includes('年')).slice(0, 2).map((tag, index) => (
              <span key={index} className="text-xs bg-gold/10 text-gold px-2 py-1 rounded">
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