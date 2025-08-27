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
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [hasImageError, setHasImageError] = useState(false);

  // 检测是否为移动设备
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCardClick = () => {
    if (onClick) {
      onClick(publication);
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsImageExpanded(!isImageExpanded);
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
      {/* 封面图片 - 前20%显示 */}
      <div className="vertical-newspaper-card__image">
        {publication.image ? (
          <div 
            className={`vertical-newspaper-card__image-peek ${isImageExpanded || isMobile ? 'expanded' : ''}`}
            onClick={handleImageClick}
          >
            <img 
              src={`/${publication.image}`}
              alt={publication.title}
              className="vertical-newspaper-card__image-img"
              onLoad={() => setIsImageLoading(false)}
              onError={(e) => {
                setIsImageLoading(false);
                setHasImageError(true);
                const container = e.currentTarget.closest('.vertical-newspaper-card__image-peek');
                const placeholder = container?.nextElementSibling;
                if (container && placeholder) {
                  container.style.display = 'none';
                  placeholder.style.display = 'flex';
                }
              }}
            />
            {isImageLoading && (
              <div className="vertical-newspaper-card__image-loading"></div>
            )}
            <div className={`vertical-newspaper-card__image-overlay ${isImageExpanded || isMobile || isImageLoading ? 'hidden' : ''}`}>
              <span className="vertical-newspaper-card__image-hint">
                {isMobile ? '点击查看完整图片' : '点击查看完整图片'}
              </span>
            </div>
          </div>
        ) : null}
        <div className="vertical-newspaper-card__image-placeholder" style={{display: publication.image ? 'none' : 'flex'}}>
          <span className="vertical-newspaper-card__image-icon">📰</span>
        </div>
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
          <span className="vertical-newspaper-card__issue-count">
            共{publication.issueCount || 0}期
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
              handleClick();
            }}
          >
            [进入本刊]
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerticalNewspaperCard;