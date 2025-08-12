import React, { useState } from 'react';
import { FooterProps } from './types';
import BrandSection from './BrandSection.tsx';
import LegalSection from './LegalSection.tsx';


const BaseFooter: React.FC<FooterProps> = ({ config, className = '' }) => {
  // 无障碍支持：跳转到主要内容区域的链接
  const [showSkipLink, setShowSkipLink] = useState(false);
  const {
    brand,
    legal,
    sections,
    style
  } = config;

  // 样式配置
  const backgroundColorClasses = {
    white: 'bg-white',
    gray: 'bg-gray-100',
    cream: 'bg-amber-50',
    dark: 'bg-gray-900'
  };

  const textColorClasses = {
    light: 'text-gray-100',
    dark: 'text-gray-900'
  };

  const backgroundColorClass = backgroundColorClasses[style?.backgroundColor || 'dark'];
  const textColorClass = textColorClasses[style?.textColor || 'light'];


  // 过滤并排序显示的区域
  const visibleSections = sections
    .filter(section => section.visible)
    .sort((a, b) => a.order - b.order);

  // 获取区域组件
  const getSectionComponent = (sectionId: string) => {
    switch (sectionId) {
      case 'brand':
        return <BrandSection config={brand} />;
      case 'legal':
        return legal ? (
          <LegalSection 
            items={legal.items}
            additionalText={legal.additionalText}
          />
        ) : null;
      default:
        return null;
    }
  };

  const footerClassName = `base-footer ${backgroundColorClass} ${textColorClass} ${className}`.trim();

  return (
    <>
      {/* 无障碍跳转链接 */}
      <a
        href="#main-content"
        className={`sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-amber-500 text-white px-4 py-2 rounded-md z-50 transition-all duration-200 ${
          showSkipLink ? 'block' : 'hidden'
        }`}
        onFocus={() => setShowSkipLink(true)}
        onBlur={() => setShowSkipLink(false)}
      >
        跳转到主要内容
      </a>
      
      <footer className={footerClassName} role="contentinfo" aria-label="网站页脚">
        <div className="footer-container">
          {/* 主要内容区域 */}
          <div className="footer-main-content">
            <div className="footer-content-wrapper text-center py-8">
              {visibleSections.map(section => {
                const component = getSectionComponent(section.id);
                return component ? (
                  <div key={section.id} className="footer-section mb-6">
                    {component}
                  </div>
                ) : null;
              })}
            </div>
          </div>

          {/* 底部分隔线 */}
          <div className="footer-bottom-bar border-t border-gray-700 mt-4 pt-4">
          </div>
        </div>
      </footer>

    </>
  );
};

export default BaseFooter;
