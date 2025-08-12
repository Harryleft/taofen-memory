import React from 'react';
import { Link } from 'react-router-dom';
import FooterSection from './FooterSection';
import { NavigationItem } from '../types';

// 导航链接组件
const NavigationLink: React.FC<{ item: NavigationItem }> = ({ item }) => {
  if (item.external) {
    return (
      <a
        href={item.to}
        target="_blank"
        rel="noopener noreferrer"
        className="navigation-link text-gray-300 hover:text-amber-400 transition-colors duration-200 flex items-center gap-2"
      >
        {item.icon && <span className="navigation-icon">{item.icon}</span>}
        <span>{item.label}</span>
      </a>
    );
  }
  
  return (
    <Link
      to={item.to}
      className="navigation-link text-gray-300 hover:text-amber-400 transition-colors duration-200 flex items-center gap-2"
    >
      {item.icon && <span className="navigation-icon">{item.icon}</span>}
      <span>{item.label}</span>
    </Link>
  );
};

// 导航区域组件
const NavigationSection: React.FC<{ 
  quickLinks?: NavigationItem[]; 
  siteMap?: NavigationItem[];
}> = ({ quickLinks, siteMap }) => {
  return (
    <FooterSection title="快速导航">
      <div className="navigation-content space-y-6">
        {/* 快速链接 */}
        {quickLinks && quickLinks.length > 0 && (
          <div className="quick-links">
            <h4 className="text-sm font-medium text-amber-400 mb-3 uppercase tracking-wide">
              主要栏目
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((item, index) => (
                <li key={index}>
                  <NavigationLink item={item} />
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* 站点地图 */}
        {siteMap && siteMap.length > 0 && (
          <div className="site-map">
            <h4 className="text-sm font-medium text-amber-400 mb-3 uppercase tracking-wide">
              站点地图
            </h4>
            <ul className="space-y-2">
              {siteMap.map((item, index) => (
                <li key={index}>
                  <NavigationLink item={item} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </FooterSection>
  );
};

export default NavigationSection;