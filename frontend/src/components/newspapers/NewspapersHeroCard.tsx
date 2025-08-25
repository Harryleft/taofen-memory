import React from 'react';
import { HeaderConfig } from '@/components/layout/header/BaseHeader';

interface NewspapersHeroCardProps {
  config: HeaderConfig;
  onMobileDrawerOpen?: () => void;
  isMobile?: boolean;
}

export const NewspapersHeroCard: React.FC<NewspapersHeroCardProps> = ({
  config,
  onMobileDrawerOpen,
  isMobile = false
}) => {
  return (
    <div className="newspapers-hero-card">
      {/* 背景装饰 */}
      <div className="newspapers-hero-card__background">
        <div className="newspapers-hero-card__gradient"></div>
        <div className="newspapers-hero-card__pattern"></div>
      </div>

      {/* 主要内容 */}
      <div className="newspapers-hero-card__content">
        <div className="newspapers-hero-card__header">
          <div className="newspapers-hero-card__icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="8" width="48" height="48" rx="4" stroke="currentColor" strokeWidth="2" fill="none"/>
              <rect x="16" y="16" width="32" height="2" fill="currentColor"/>
              <rect x="16" y="24" width="24" height="2" fill="currentColor"/>
              <rect x="16" y="32" width="28" height="2" fill="currentColor"/>
              <rect x="16" y="40" width="20" height="2" fill="currentColor"/>
            </svg>
          </div>
          
          <div className="newspapers-hero-card__title-section">
            <h1 className="newspapers-hero-card__title">
              {config.title}
            </h1>
            <p className="newspapers-hero-card__subtitle">
              {config.subtitle}
            </p>
          </div>
        </div>

        <div className="newspapers-hero-card__description">
          <p>{config.description}</p>
        </div>

        <div className="newspapers-hero-card__action">
          {isMobile ? (
            <button
              onClick={onMobileDrawerOpen}
              className="newspapers-hero-card__button"
            >
              <span className="newspapers-hero-card__button-icon">📰</span>
              <span>浏览报刊</span>
            </button>
          ) : (
            <div className="newspapers-hero-card__instruction">
              <div className="newspapers-hero-card__instruction-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p>请从左侧选择一个刊物开始浏览</p>
            </div>
          )}
        </div>

        {/* 装饰元素 */}
        <div className="newspapers-hero-card__decorations">
          <div className="newspapers-hero-card__decoration newspapers-hero-card__decoration--1"></div>
          <div className="newspapers-hero-card__decoration newspapers-hero-card__decoration--2"></div>
          <div className="newspapers-hero-card__decoration newspapers-hero-card__decoration--3"></div>
        </div>
      </div>
    </div>
  );
};

export default NewspapersHeroCard;