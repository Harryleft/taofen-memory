import React from 'react';
import { FooterConfig } from './types.ts';

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
