import React from 'react';
import { 
  COMMON_FONTS, 
  COMMON_HEADER_LAYOUT, 
  COMMON_HEADER_STYLES,
  ModuleHeaderConfig 
} from '../../styles/commonHeader';

interface BaseHeaderProps {
  config: ModuleHeaderConfig;
  children?: React.ReactNode;
}

const BaseHeader: React.FC<BaseHeaderProps> = ({ config, children }) => {
  const {
    moduleId,
    icon,
    title,
    subtitle,
    description,
    accentColor = 'gold',
    backgroundImage,
    showDecorative = true,
    customStyles = {}
  } = config;

  return (
    <div className={`${COMMON_HEADER_LAYOUT.container.base} ${COMMON_HEADER_LAYOUT.container.spacing} ${customStyles.container || ''}`}>
      {/* 装饰性背景元素 */}
      {showDecorative && (
        <div className={COMMON_HEADER_LAYOUT.background.decorative}>
          <div className={COMMON_HEADER_LAYOUT.background.gradient}></div>
          <div className="absolute top-8 left-1/4 w-2 h-2 bg-gold/30 rounded-full animate-pulse"></div>
          <div className="absolute top-12 right-1/3 w-1 h-1 bg-gold/40 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-4 left-1/3 w-1.5 h-1.5 bg-gold/25 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
      )}
      
      {/* 主内容区域 */}
      <div className={COMMON_HEADER_LAYOUT.content.wrapper}>
        {/* 装饰性顶部线条 */}
        {showDecorative && (
          <div className={COMMON_HEADER_STYLES.decorative.topLine}>
            <div className={COMMON_HEADER_STYLES.brand.decorativeLine}></div>
            <div className={COMMON_HEADER_STYLES.brand.decorativeDot}></div>
            <div className={COMMON_HEADER_STYLES.brand.decorativeLine}></div>
          </div>
        )}
        
        {/* 品牌标题区域 */}
        <div className={COMMON_HEADER_LAYOUT.content.brandSection}>
          <h1 className={COMMON_HEADER_STYLES.brand.title} 
              style={{ fontFamily: COMMON_FONTS.fangsong }}>
            <span className="inline-block transform hover:scale-105 transition-transform duration-300">韬</span>
            <span className="inline-block transform hover:scale-105 transition-transform duration-300" style={{transitionDelay: '50ms'}}>奋</span>
            <span className="mx-2 text-gold/60">·</span>
            <span className="inline-block transform hover:scale-105 transition-transform duration-300" style={{transitionDelay: '100ms'}}>时</span>
            <span className="inline-block transform hover:scale-105 transition-transform duration-300" style={{transitionDelay: '150ms'}}>光</span>
          </h1>
          
          {/* 英文副标题 */}
          <div className={COMMON_HEADER_STYLES.brand.subtitle} 
               style={{ fontFamily: "'Times New Roman', serif" }}>
            TAOFEN HERITAGE PROJECT
          </div>
        </div>
        
        {/* 背景图片区域（占位） */}
        {backgroundImage && (
          <div className={COMMON_HEADER_STYLES.image.container}>
            {backgroundImage === 'placeholder' ? (
              <div className={COMMON_HEADER_STYLES.image.placeholder}>
                <span className={COMMON_HEADER_STYLES.image.placeholderText}>
                  {moduleId} 主题图片占位
                </span>
              </div>
            ) : (
              <img 
                src={backgroundImage} 
                alt={`${title} 主题图片`}
                className={COMMON_HEADER_STYLES.image.actual}
              />
            )}
          </div>
        )}
        
        {/* 模块标识区域 */}
        <div className={COMMON_HEADER_LAYOUT.content.moduleSection}>
          {/* 模块图标 */}
          {icon && (
            <div className={`${COMMON_HEADER_STYLES.module.iconWrapper} bg-${accentColor}/20`}>
              {typeof icon === 'string' ? (
                <div dangerouslySetInnerHTML={{ __html: icon }} />
              ) : (
                icon
              )}
            </div>
          )}
          
          {/* 模块标题 */}
          <h2 className={`${COMMON_HEADER_STYLES.module.title} ${customStyles.title || ''}`}
              style={{ fontFamily: COMMON_FONTS.kai }}>
            {title}
          </h2>
          
          {/* 模块副标题 */}
          {subtitle && (
            <div className={COMMON_HEADER_STYLES.module.subtitle}
                 style={{ fontFamily: COMMON_FONTS.song }}>
              {subtitle}
            </div>
          )}
        </div>
        
        {/* 模块描述区域 */}
        <div className={COMMON_HEADER_LAYOUT.content.descriptionSection}>
          <p className={`${COMMON_HEADER_STYLES.module.description} ${customStyles.description || ''}`}
             style={{ fontFamily: COMMON_FONTS.song }}>
            {description}
          </p>
        </div>
        
        {/* 自定义内容区域 */}
        {children}
        
        {/* 装饰性底部元素 */}
        {showDecorative && (
          <div className={COMMON_HEADER_STYLES.decorative.bottomLine}>
            <div className={COMMON_HEADER_STYLES.decorative.dots}>
              <div className="w-8 h-px bg-gradient-to-r from-transparent to-gold/30"></div>
              <div className="w-1 h-1 bg-gold/50 rounded-full"></div>
              <div className="w-2 h-px bg-gold/40"></div>
              <div className="w-1 h-1 bg-gold/50 rounded-full"></div>
              <div className="w-8 h-px bg-gradient-to-l from-transparent to-gold/30"></div>
            </div>
          </div>
        )}
      </div>
      
      {/* 底部渐变分隔 */}
      {showDecorative && (
        <div className={COMMON_HEADER_STYLES.decorative.gradientSeparator}></div>
      )}
    </div>
  );
};

export default BaseHeader;