import React from 'react';

// ================ 类型定义 ================

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
  
  // 法律信息
  legal?: {
    additionalText?: string;
  };
  
  // 显示配置
  sections: FooterSection[];
  
  // 样式配置
  style?: {
    backgroundColor?: 'white' | 'gray' | 'cream' | 'dark';
    textColor?: 'light' | 'dark';
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
      {config.description && (
        <div className="brand-description mb-2">
          <p className="text-sm text-gray-300">{config.description}</p>
        </div>
      )}
      <div className="brand-copyright">
        <p className="text-sm text-gray-400">{config.copyright}</p>
      </div>
    </div>
  );
};

// 法律区域组件
const LegalSection: React.FC<{ 
  additionalText?: string;
}> = ({ additionalText }) => {
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
            additionalText={legal.additionalText}
          />
        ) : null;
      default:
        return null;
    }
  };

  const footerClassName = `footer ${backgroundColorClass} ${textColorClass} ${className}`.trim();

  return (
    <footer className={footerClassName} role="contentinfo" aria-label="网站页脚">
      <div className="footer-container">
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
    </footer>
  );
};

// ================ 便捷组件 ================

interface AppFooterProps {
  className?: string;
}

const AppFooter: React.FC<AppFooterProps> = ({ 
  className = '' 
}) => {
  const config: FooterConfig = {
    brand: {
      name: '韬奋纪念馆',
      description: '',
      copyright: '© 2025 不知道起什么名字团队',
    },
    
    legal: {
      additionalText: '第十届上海图书馆开放数据竞赛作品',
    },
    
    sections: [
      { id: 'brand', title: '', visible: true, order: 1 },
      { id: 'legal', title: '', visible: true, order: 2 },
    ],
    
    style: {
      backgroundColor: 'dark',
      textColor: 'light',
    },
  };

  return <Footer config={config} className={className} />;
};

// ================ 导出 ================

export { AppFooter };
export default Footer;
