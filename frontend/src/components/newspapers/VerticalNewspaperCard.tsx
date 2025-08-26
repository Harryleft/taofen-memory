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
 * - 包含：封面图、刊物名称、创刊日期、期数、简介、操作按钮
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
      {/* 封面图片 */}
      <div className="vertical-newspaper-card__image">
        <div className="vertical-newspaper-card__image-placeholder">
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
            创刊：{publication.title.includes('全民抗战') ? '1938年7月7日' : '1938年'}
          </span>
          <span className="vertical-newspaper-card__issue-count">
            共{publication.issueCount || 0}期
          </span>
        </div>
        
        <div className="vertical-newspaper-card__description">
          {publication.title.includes('全民抗战') ? 
            '1938年在汉口创刊，主编邹韬奋、柳湜，是当时国民党统治区影响最广的刊物。' :
            '历史报刊文献，珍贵的历史资料。'
          }
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