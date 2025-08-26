import React from 'react';
import { PublicationItem } from './services';

interface SimpleNewspaperCardProps {
  publication: PublicationItem;
  isSelected?: boolean;
  onClick?: (publication: PublicationItem) => void;
  className?: string;
}

export const SimpleNewspaperCard: React.FC<SimpleNewspaperCardProps> = ({
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
      className={`simple-newspaper-card ${className} ${
        isSelected ? 'simple-newspaper-card--selected' : ''
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
      {/* 卡片内容区域 */}
      <div className="simple-newspaper-card__content">
        <h3 className="simple-newspaper-card__title">
          {publication.title}
        </h3>
        
        {/* 查看本刊按钮 */}
        <button 
          className="simple-newspaper-card__button"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          查看本刊
        </button>
      </div>
    </div>
  );
};

export default SimpleNewspaperCard;