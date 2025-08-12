import React from 'react';
import { LegalInfo } from './types.ts';

// 法律区域组件
const LegalSection: React.FC<{ 
  items: LegalInfo[]; 
  additionalText?: string;
}> = ({ items, additionalText }) => {
  return (
    <div className="legal-content text-center mt-4">
      {additionalText && (
        <div className="legal-additional-text">
          <p className="text-sm text-gray-400 leading-relaxed">
            {additionalText}
          </p>
        </div>
      )}
    </div>
  );
};

export default LegalSection;
