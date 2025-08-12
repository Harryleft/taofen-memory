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
    <FooterSection title="法律信息">
      <div className="legal-content space-y-4">
        {/* 法律链接 */}
        {items.length > 0 && (
          <div className="legal-links">
            <ul className="legal-links-list flex flex-wrap gap-4">
              {items.map((item, index) => (
                <li key={index}>
                  <LegalLink item={item} />
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* 额外文本 */}
        {additionalText && (
          <div className="legal-additional-text">
            <p className="text-sm text-gray-400 leading-relaxed">
              {additionalText}
            </p>
          </div>
        )}
      </div>
    </FooterSection>
  );
};

export default LegalSection;