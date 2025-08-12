import React from 'react';
import FooterSection from './FooterSection';
import { FooterConfig } from '../types';

// Logo 组件
const FooterLogo = () => {
  return (
    <div className="footer-logo mb-4">
      <div className="w-12 h-12 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-lg">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="6" width="18" height="12" rx="2" strokeWidth="1.5"/>
          <rect x="6" y="3" width="12" height="8" rx="1" strokeWidth="1.5"
                fill="currentColor" fillOpacity="0.2"/>
          <circle cx="8" cy="12" r="1" fill="currentColor"/>
          <circle cx="12" cy="12" r="1" fill="currentColor"/>
          <circle cx="16" cy="12" r="1" fill="currentColor"/>
          <circle cx="10" cy="15" r="1" fill="currentColor"/>
          <circle cx="14" cy="15" r="1" fill="currentColor"/>
        </svg>
      </div>
    </div>
  );
};

// 品牌区域组件
const BrandSection: React.FC<{ config: FooterConfig['brand'] }> = ({ config }) => {
  return (
    <div className="brand-content text-center">
      <div className="brand-copyright text-sm text-gray-400">
        <p>{config.copyright}</p>
      </div>
    </div>
  );
};

export default BrandSection;