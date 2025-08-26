import React from 'react';
import { PublicationItem } from './services';

interface VerticalNewspaperCardProps {
  publication: PublicationItem;
  isSelected?: boolean;
  onClick?: (publication: PublicationItem) => void;
  className?: string;
}

/**
 * 垂直报刊卡片组件 - 专为界面1侧边栏设计
 * 
 * 规格：
 * - 封面图片：120x160px
 * - 布局：垂直排列，适合侧边栏显示
 * - 包含：封面图、刊物名称、操作按钮
 */
export const VerticalNewspaperCard: React.FC<VerticalNewspaperCardProps> = ({
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
      className={`vertical-newspaper-card ${className} ${
        isSelected ? 'vertical-newspaper-card--selected' : ''
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
      <div className="vertical-newspaper-card__content">
        <h3 className="vertical-newspaper-card__title">
          {publication.title}
        </h3>
        
        {/* 期数信息 */}
        <div className="vertical-newspaper-card__meta">
          <span className="vertical-newspaper-card__issue-count">
            {publication.issueCount || 0} 期
          </span>
        </div>
      </div>
    </div>
  );
};

export default VerticalNewspaperCard;