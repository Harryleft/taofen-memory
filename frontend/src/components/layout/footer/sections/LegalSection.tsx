import React from 'react';
import { Link } from 'react-router-dom';
import FooterSection from './FooterSection';
import { LegalInfo } from '../types';

// 法律链接组件
const LegalLink: React.FC<{ item: LegalInfo }> = ({ item }) => {
  if (item.external) {
    return (
      <a
        href={item.to}
        target="_blank"
        rel="noopener noreferrer"
        className="legal-link text-gray-400 hover:text-amber-400 transition-colors duration-200 text-sm"
      >
        {item.label}
      </a>
    );
  }
  
  return (
    <Link
      to={item.to}
      className="legal-link text-gray-400 hover:text-amber-400 transition-colors duration-200 text-sm"
    >
      {item.label}
    </Link>
  );
};

// 法律区域组件
const LegalSection: React.FC<{ 
  items: LegalInfo[]; 
  additionalText?: string;
}> = ({ items, additionalText }) => {
  return (
    <div className="legal-content text-center mt-4">
      {/* 额外文本 */}
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