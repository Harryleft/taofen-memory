import React from 'react';

// ================ 类型定义 ================

// 导航链接配置
export interface NavigationLink {
  label: string;
  to: string;
  external?: boolean;
}

// 导航分类配置
export interface NavigationCategory {
  id: string;
  title: string;
  links: NavigationLink[];
}

// 联系信息配置
export interface ContactInfo {
  label: string;
  value: string;
  icon?: string;
  type?: 'address' | 'phone' | 'email' | 'website';
}

// 社交媒体链接配置
export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
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
    categories?: NavigationCategory[];
  };
  
  // 联系信息
  contact?: {
    items: ContactInfo[];
  };
  
  // 社交媒体
  social?: {
    links: SocialLink[];
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
    <div className="brand-section">
      {config.logo && (
        <div className="brand-logo mb-4">
          {config.logo}
        </div>
      )}
      <h3 className="brand-name text-xl font-bold text-white mb-2">
        {config.name}
      </h3>
      {config.description && (
        <p className="brand-description text-gray-300 text-sm mb-4">
          {config.description}
        </p>
      )}
    </div>
  );
};

// 导航区域组件
const NavigationSection: React.FC<{ 
  categories?: NavigationCategory[];
}> = ({ categories }) => {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="navigation-section">
      {categories.map((category) => (
        <div key={category.id} className="nav-category mb-6">
          <h4 className="nav-title text-white font-semibold mb-3">
            {category.title}
          </h4>
          <ul className="nav-links space-y-2">
            {category.links.map((link, index) => (
              <li key={index}>
                <a
                  href={link.to}
                  target={link.external ? '_blank' : '_self'}
                  rel={link.external ? 'noopener noreferrer' : ''}
                  className="nav-link text-gray-300 hover:text-white text-sm transition-colors duration-200"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

// 联系信息区域组件
const ContactSection: React.FC<{ 
  items: ContactInfo[];
}> = ({ items }) => {
  return (
    <div className="contact-section">
      <h4 className="contact-title text-white font-semibold mb-3">联系我们</h4>
      <div className="contact-items space-y-3">
        {items.map((item, index) => (
          <div key={index} className="contact-item flex items-start space-x-3">
            {item.icon && (
              <span className="contact-icon text-gray-400 mt-1">
                {item.icon}
              </span>
            )}
            <div>
              <p className="contact-label text-gray-400 text-xs mb-1">
                {item.label}
              </p>
              <p className="contact-value text-gray-300 text-sm">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 社交媒体区域组件
const SocialSection: React.FC<{ 
  links: SocialLink[];
}> = ({ links }) => {
  return (
    <div className="social-section">
      <h4 className="social-title text-white font-semibold mb-3">关注我们</h4>
      <div className="social-links flex space-x-4">
        {links.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link text-gray-400 hover:text-white transition-colors duration-200"
            aria-label={link.platform}
          >
            <span className="social-icon">{link.icon}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

// 法律区域组件
const LegalSection: React.FC<{ 
  additionalText?: string;
}> = ({ additionalText }) => {
  return (
    <div className="legal-section mt-8 pt-6 border-t border-gray-700">
      {additionalText && (
        <p className="legal-additional-text text-gray-400 text-sm text-center">
          {additionalText}
        </p>
      )}
    </div>
  );
};

// ================ 主要 Footer 组件 ================

const Footer: React.FC<FooterProps> = ({ config, className = '' }) => {
  const {
    brand,
    navigation,
    contact,
    social,
    legal,
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

  const footerClassName = `footer ${backgroundColorClass} ${textColorClass} ${className}`.trim();

  return (
    <footer className={footerClassName} role="contentinfo" aria-label="网站页脚">
      <div className="footer-container">
        {/* 主要内容区域 - 三列布局 */}
        <div className="footer-grid grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
          {/* 品牌区域 */}
          <div className="footer-brand">
            <BrandSection config={brand} />
          </div>
          
          {/* 导航区域 */}
          <div className="footer-navigation">
            <NavigationSection categories={navigation?.categories} />
          </div>
          
          {/* 联系和社交媒体区域 */}
          <div className="footer-contact-social space-y-8">
            {contact && <ContactSection items={contact.items} />}
            {social && <SocialSection links={social.links} />}
          </div>
        </div>
        
        {/* 底部版权和法律信息 */}
        <div className="footer-bottom">
          <div className="footer-bottom-content flex flex-col md:flex-row justify-between items-center py-6 border-t border-gray-700">
            <div className="footer-copyright text-gray-400 text-sm mb-4 md:mb-0">
              {brand.copyright}
            </div>
            {legal && (
              <LegalSection additionalText={legal.additionalText} />
            )}
          </div>
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
      description: '致力于韬奋精神的研究、传承与弘扬',
      copyright: '© 2025 韬奋纪念馆. 保留所有权利.',
    },
    
    navigation: {
      categories: [
        {
          id: 'about',
          title: '关于我们',
          links: [
            { label: '纪念馆介绍', to: '/about', external: false },
            { label: '韬奋生平', to: '/about/biography', external: false },
            { label: '历史沿革', to: '/about/history', external: false },
            { label: '参观指南', to: '/visit', external: false },
          ]
        },
        {
          id: 'resources',
          title: '资源中心',
          links: [
            { label: '数字档案', to: '/resources/archive', external: false },
            { label: '学术研究', to: '/resources/research', external: false },
            { label: '教育项目', to: '/resources/education', external: false },
            { label: '出版物', to: '/resources/publications', external: false },
          ]
        }
      ]
    },
    
    contact: {
      items: [
        {
          label: '地址',
          value: '上海市重庆南路205弄5号',
          type: 'address'
        },
        {
          label: '电话',
          value: '+86 21 6472 5920',
          type: 'phone'
        },
        {
          label: '邮箱',
          value: 'info@zoutaofen.com',
          type: 'email'
        }
      ]
    },
    
    social: {
      links: [
        {
          platform: '微信',
          url: '#',
          icon: '📱'
        },
        {
          platform: '微博',
          url: '#',
          icon: '📱'
        },
        {
          platform: '抖音',
          url: '#',
          icon: '📱'
        }
      ]
    },
    
    legal: {
      additionalText: '第十届上海图书馆开放数据竞赛作品',
    },
    
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
