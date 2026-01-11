import { useMemo, memo, useState, useCallback, useEffect } from 'react';
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
  const [currentImageSrc, setCurrentImageSrc] = useState<string>('');
  
  const highlightedTitle = useMemo(() => highlightSearchText(item.title, searchTerm), [item.title, searchTerm]);
  const highlightedDescription = useMemo(() => highlightSearchText(item.description, searchTerm), [item.description, searchTerm]);
  
  // 智能图片源选择和回退机制
  const getNextImageSrc = useCallback((currentSrc: string): string => {
    // 当前是缩略图，尝试优化图片
    if (currentSrc === item.thumbnailImage && item.optimizedImage) {
      return item.optimizedImage;
    }
    // 当前是优化图片，尝试原图
    if (currentSrc === item.optimizedImage && item.image) {
      return item.image;
    }
    // 没有更多回退选项
    return '';
  }, [item.thumbnailImage, item.optimizedImage, item.image]);
  
  // 初始化图片源
  useEffect(() => {
    // 优先使用缩略图
    if (item.thumbnailImage) {
      setCurrentImageSrc(item.thumbnailImage);
    } else if (item.optimizedImage) {
      setCurrentImageSrc(item.optimizedImage);
    } else if (item.image) {
      setCurrentImageSrc(item.image);
    }
  }, [item.thumbnailImage, item.optimizedImage, item.image]);
  
  // 新增：智能加载策略
  const loadingStrategy = useMemo(() => {
    // 首屏前6张图片优先加载
    return columnIndex < 6 ? 'eager' : 'lazy';
  }, [columnIndex]);
  
  const fetchPriority = useMemo(() => {
    // 首屏前6张图片高优先级
    return columnIndex < 6 ? 'high' : 'auto';
  }, [columnIndex]);
  
  // 修复：图片错误处理和回退机制
  const handleImageError = useCallback(() => {
    if (!imageError) {
      const nextSrc = getNextImageSrc(currentImageSrc);
      if (nextSrc) {
        console.warn(`图片加载失败，回退到下一个选项: ${currentImageSrc} -> ${nextSrc}`);
        setCurrentImageSrc(nextSrc);
        setImageLoaded(false); // 重置加载状态
      } else {
        console.error(`所有图片源都加载失败: ${item.title}`);
        setImageError(true);
      }
    }
  }, [imageError, currentImageSrc, getNextImageSrc, item.title]);
  
    
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
          {currentImageSrc && (
            <img
              key={currentImageSrc} // 添加key确保图片源变化时重新加载
              src={currentImageSrc}
              alt={item.title}
              className={`w-full object-cover group-hover:scale-110 transition-transform duration-700 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ height: `${item.dimensions.height}px` }}
              loading={loadingStrategy}
              fetchpriority={fetchPriority}
              onLoad={() => setImageLoaded(true)}
              onError={handleImageError}
            />
          )}
          
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