import React, { useState, useCallback } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaArrowUp } from 'react-icons/fa';
import { FooterProps } from './types';
import BrandSection from './sections/BrandSection';
import NavigationSection from './sections/NavigationSection';
import ContactSection from './sections/ContactSection';
import LegalSection from './sections/LegalSection';

// 默认社交媒体图标
const defaultSocialLinks = [
  {
    platform: '微信',
    url: '#',
    icon: <span className="text-lg">💬</span>,
    ariaLabel: '关注我们微信公众号'
  },
  {
    platform: '微博',
    url: '#',
    icon: <span className="text-lg">📱</span>,
    ariaLabel: '关注我们微博'
  },
  {
    platform: '邮箱',
    url: 'mailto:info@taofen.org',
    icon: <FaEnvelope className="text-sm" />,
    ariaLabel: '发送邮件联系我们'
  }
];

// 默认联系信息图标
const getContactIcon = (label: string) => {
  switch (label) {
    case '地址':
      return <FaMapMarkerAlt />;
    case '电话':
      return <FaPhone />;
    case '邮箱':
      return <FaEnvelope />;
    case '开放时间':
      return <FaClock />;
    default:
      return null;
  }
};

// 回到顶部按钮组件
const BackToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  // 监听滚动事件
  React.useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="back-to-top fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
      aria-label="回到顶部"
    >
      <FaArrowUp className="group-hover:scale-110 transition-transform duration-200" />
    </button>
  );
};

const BaseFooter: React.FC<FooterProps> = ({ config, className = '' }) => {
  // 无障碍支持：跳转到主要内容区域的链接
  const [showSkipLink, setShowSkipLink] = useState(false);
  const {
    brand,
    navigation,
    contact,
    legal,
    sections,
    style,
    features
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

  // 处理联系信息，添加图标
  const processedContact = contact ? {
    ...contact,
    items: contact.items.map(item => ({
      ...item,
      icon: getContactIcon(item.label)
    })),
    socialLinks: contact.socialLinks || defaultSocialLinks
  } : undefined;

  // 过滤并排序显示的区域
  const visibleSections = sections
    .filter(section => section.visible)
    .sort((a, b) => a.order - b.order);

  // 获取区域组件
  const getSectionComponent = (sectionId: string) => {
    switch (sectionId) {
      case 'brand':
        return <BrandSection config={brand} />;
      case 'navigation':
        return <NavigationSection 
          quickLinks={navigation?.quickLinks}
          siteMap={navigation?.siteMap}
        />;
      case 'contact':
        return processedContact ? (
          <ContactSection 
            items={processedContact.items}
            socialLinks={processedContact.socialLinks}
          />
        ) : null;
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

  const footerClassName = `base-footer ${backgroundColorClass} ${textColorClass} ${className}`.trim();

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
            <div className="footer-content-wrapper">
              {/* 网格布局 */}
              <div className="footer-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {visibleSections.map(section => {
                  const component = getSectionComponent(section.id);
                  return component ? (
                    <div key={section.id} className="footer-column">
                      {component}
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>

          {/* 底部栏 */}
          <div className="footer-bottom-bar border-t border-gray-700 mt-12 pt-8">
            <div className="footer-bottom-content flex flex-col md:flex-row justify-between items-center gap-4">
              {/* 版权信息 */}
              <div className="footer-copyright text-sm text-gray-400">
                {brand.copyright}
              </div>

              {/* 技术信息 */}
              <div className="footer-tech-info text-sm text-gray-400">
                <span>Powered by React & TypeScript</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* 回到顶部按钮 */}
      {features?.showBackToTop && <BackToTopButton />}
    </>
  );
};

export default BaseFooter;