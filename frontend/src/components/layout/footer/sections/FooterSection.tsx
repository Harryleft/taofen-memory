import React from 'react';
import { FooterSectionProps } from '../types';

// Footer 区域组件容器
const FooterSection: React.FC<FooterSectionProps> = ({ 
  title, 
  children, 
  className = '' 
}) => {
  return (
    <div className={`footer-section ${className}`}>
      <h3 className="footer-section-title text-lg font-semibold mb-4 text-amber-400 font-serif">
        {title}
      </h3>
      <div className="footer-section-content">
        {children}
      </div>
    </div>
  );
};

export default FooterSection;