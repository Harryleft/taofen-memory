import React, { useState } from 'react';
import { PublicationItem } from './services';

// 扩展的 PublicationItem 接口，包含本地数据字段
interface ExtendedPublicationItem extends PublicationItem {
  founding_date?: string;
  description?: string;
  image?: string;
}

interface VerticalNewspaperCardProps {
  publication: ExtendedPublicationItem;
  isSelected?: boolean;
  onClick?: (publication: ExtendedPublicationItem) => void;
  className?: string;
}

/**
 * 垂直报刊卡片组件 - 专为界面1侧边栏设计
 * 
 * 规格：
 * - 封面图片：120x160px
 * - 布局：垂直排列，适合侧边栏显示
 * - 包含：封面图、刊物名称、创刊日期、期数、简介、操作按钮
 */
export const VerticalNewspaperCard: React.FC<VerticalNewspaperCardProps> = ({
  publication,
  isSelected = false,
  onClick,
  className = ''
}) => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [hasImageError, setHasImageError] = useState(false);

  const handleCardClick = () => {
    if (onClick) {
      onClick(publication);
    }
  };

  // 优化的图片URL处理函数
  const getImageUrl = (imagePath?: string): string => {
    if (!imagePath) {
      console.log('🎨 使用默认图片，imagePath为空');
      return '/images/books/book_23416_-4998639186942255748.jpg';
    }
    
    // 清理路径，移除多余的斜杠
    const cleanPath = imagePath.replace(/^\/+/, '').replace(/\/+/g, '/');
    
    // 如果已经是完整URL，直接返回
    if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
      console.log('🌐 使用完整URL:', cleanPath);
      return cleanPath;
    }
    
    // 如果以images/开头，直接添加/前缀
    if (cleanPath.startsWith('images/')) {
      const fullPath = `/${cleanPath}`;
      console.log('📁 使用images路径:', fullPath);
      return fullPath;
    }
    
    // 如果以/开头，认为是绝对路径
    if (cleanPath.startsWith('/')) {
      console.log('📁 使用绝对路径:', cleanPath);
      return cleanPath;
    }
    
    // 否则，添加/images/前缀
    const fullPath = `/images/${cleanPath}`;
    console.log('🔗 拼接路径:', fullPath);
    return fullPath;
  };

  // 优化的图片加载处理
  const handleImageLoad = () => {
    console.log('✅ 图片加载成功:', publication.image);
    setIsImageLoading(false);
    setHasImageError(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('❌ 图片加载失败:', publication.image, e);
    setIsImageLoading(false);
    setHasImageError(true);
    
    // 隐藏图片容器，显示占位符
    const container = e.currentTarget.closest('.vertical-newspaper-card__image-peek');
    const placeholder = container?.nextElementSibling;
    if (container && placeholder) {
      container.style.display = 'none';
      placeholder.style.display = 'flex';
    }
  };

  return (
    <div
      className={`vertical-newspaper-card ${className} ${
        isSelected ? 'vertical-newspaper-card--selected' : ''
      }`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* 封面图片 - 顶部20%显示 */}
      <div className="vertical-newspaper-card__image">
        {publication.image && !hasImageError ? (
          <div className="vertical-newspaper-card__image-peek">
            <img 
              src={getImageUrl(publication.image)}
              alt={publication.title}
              className="vertical-newspaper-card__image-img"
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{
                display: isImageLoading ? 'none' : 'block',
              }}
            />
            {isImageLoading && (
              <div className="vertical-newspaper-card__image-loading"></div>
            )}
            </div>
        ) : (
          <div className="vertical-newspaper-card__image-placeholder">
            <span className="vertical-newspaper-card__image-icon">📰</span>
            {hasImageError && (
              <span className="vertical-newspaper-card__error-text">
                图片加载失败
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* 卡片内容区域 */}
      <div className="vertical-newspaper-card__content">
        <h3 className="vertical-newspaper-card__title">
          {publication.title}
        </h3>
        
        <div className="vertical-newspaper-card__meta">
          <span className="vertical-newspaper-card__founding-date">
            创刊：{publication.founding_date || '1938年'}
          </span>
        </div>
        
        <div className="vertical-newspaper-card__description">
          {publication.description || '历史报刊文献，珍贵的历史资料。'}
        </div>
        
        <div className="vertical-newspaper-card__action">
          <button 
            className="vertical-newspaper-card__button"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            查看
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerticalNewspaperCard;
