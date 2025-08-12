import React, { useState } from 'react';

// ================ 类型定义 ================

// 法律信息配置
export interface LegalInfo {
  label: string;
  to: string;
  external?: boolean;
}

// Footer 区域配置
export interface FooterSection {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

// 完整的 Footer 配置接口
export interface FooterConfig {
  // 基础信息
  brand: {
    name: string;
    logo?: React.ReactNode;
    description: string;
    copyright: string;
  };
  
  // 导航配置
  navigation?: {
    quickLinks?: Array<{label: string; to: string; external?: boolean}>;
    siteMap?: Array<{label: string; to: string; external?: boolean}>;
  };
  
  // 联系信息
  contact?: {
    items: Array<{label: string; value: string; type?: string}>;
    socialLinks?: Array<{label: string; to: string; icon?: string}>;
  };
  
  // 法律信息
  legal?: {
    items: LegalInfo[];
    additionalText?: string;
  };
  
  // 显示配置
  sections: FooterSection[];
  
  // 样式配置
  style?: {
    backgroundColor?: 'white' | 'gray' | 'cream' | 'dark';
    textColor?: 'light' | 'dark';
    accentColor?: 'gold' | 'blue' | 'green' | 'red';
  };
  
  // 功能配置
  features?: {
    showBackToTop?: boolean;
    showCurrentYear?: boolean;
    showLastUpdated?: boolean;
  };
}

// Footer 组件属性接口
export interface FooterProps {
  config: FooterConfig;
  className?: string;
}

// ================ 子组件定义 ================

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

// ================ 主要 Footer 组件 ================

const Footer: React.FC<FooterProps> = ({ config, className = '' }) => {
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

  const footerClassName = `footer ${backgroundColorClass} ${textColorClass} ${className}`.trim();

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
            <div className="footer-content-wrapper text-center py-1">
              {visibleSections.map(section => {
                const component = getSectionComponent(section.id);
                return component ? (
                  <div key={section.id} className="footer-section mb-1">
                    {component}
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

// ================ 便捷组件 ================

interface AppFooterProps {
  className?: string;
}

const AppFooter: React.FC<AppFooterProps> = ({ 
  className = '' 
}) => {
  // 根据 moduleId 查找配置，如果找不到则使用默认配置
  const config: FooterConfig = {
    brand: {
      name: '韬奋纪念馆',
      description: '',
      copyright: '© 2025 韬奋纪念馆. 保留所有权利.',
    },
    
    navigation: {
      quickLinks: [
        { label: '韬奋纪念馆', to: 'https://www.shmog.org/', external: true },
      ],
    },
    
    legal: {
      items: [],
      additionalText: '第十届上海图书馆开放数据竞赛作品',
    },
    
    sections: [
      { id: 'brand', title: '', visible: true, order: 1 },
      { id: 'legal', title: '', visible: true, order: 2 },
    ],
    
    style: {
      backgroundColor: 'dark',
      textColor: 'light',
      accentColor: 'gold',
    },
    
    features: {
      showBackToTop: false,
      showCurrentYear: false,
      showLastUpdated: false,
    },
  };

  return <Footer config={config} className={className} />;
};

// ================ 导出 ================

export { AppFooter };
export type { FooterConfig, FooterProps, LegalInfo, FooterSection };
export default Footer;
