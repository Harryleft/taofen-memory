import React from 'react';
import { ImagePlaceholder } from './ImagePlaceholder';
import { PublicationItem } from './services';

interface PublicationCardProps {
  publication: PublicationItem;
  isSelected?: boolean;
  onClick?: (publication: PublicationItem) => void;
  className?: string;
}

export const PublicationCard: React.FC<PublicationCardProps> = ({
  publication,
  isSelected = false,
  onClick,
  className = ''
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(publication);
    }
  };

  return (
    <div
      className={`newspapers-publication-card ${className} ${
        isSelected ? 'newspapers-publication-card--selected' : ''
      }`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* 图片区域 */}
      <div className="newspapers-publication-card__image">
        <ImagePlaceholder
          alt={publication.title}
          width={280}
          height={180}
          className="newspapers-publication-card__placeholder"
        />
        <div className="newspapers-publication-card__image-overlay"></div>
      </div>

      {/* 内容区域 */}
      <div className="newspapers-publication-card__content">
        <h3 className="newspapers-publication-card__title">
          {publication.title}
        </h3>
        
        {publication.summary && (
          <p className="newspapers-publication-card__summary">
            {publication.summary}
          </p>
        )}

        {/* 装饰元素 */}
        <div className="newspapers-publication-card__decorations">
          <div className="newspapers-publication-card__decoration newspapers-publication-card__decoration--1"></div>
          <div className="newspapers-publication-card__decoration newspapers-publication-card__decoration--2"></div>
        </div>
      </div>

      {/* 悬停效果 */}
      <div className="newspapers-publication-card__hover">
        <div className="newspapers-publication-card__hover-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="newspapers-publication-card__hover-text">
          浏览刊物
        </div>
      </div>
    </div>
  );
};

export default PublicationCard;