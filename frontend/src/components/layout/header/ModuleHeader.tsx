import React from 'react';

// 模块特色配置接口
export interface ModuleHeaderConfig {
  // 模块标识
  moduleId: string;
  
  // 模块图标（可以是SVG字符串或图标组件）
  icon?: string | React.ReactNode;
  
  // 模块标题
  title: string;
  
  // 模块副标题
  subtitle?: string;
  
  // 模块描述
  description: string;
  
  // 模块主色调（用于个性化）
  accentColor?: string;
  
  // 背景图片（占位或实际）
  backgroundImage?: string;
  
  // 是否显示装饰元素
  showDecorative?: boolean;
  
  // 自定义样式覆盖
  customStyles?: {
    container?: string;
    title?: string;
    description?: string;
  };
}

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
    <div className={`relative text-center overflow-hidden mb-16 max-w-6xl mx-auto px-6 ${customStyles.container || ''}`}>
      {/* 装饰性背景元素 */}
      {showDecorative && (
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-radial from-gold/20 to-transparent rounded-full"></div>
          <div className="absolute top-8 left-1/4 w-2 h-2 bg-gold/30 rounded-full animate-pulse"></div>
          <div className="absolute top-12 right-1/3 w-1 h-1 bg-gold/40 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-4 left-1/3 w-1.5 h-1.5 bg-gold/25 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
      )}
      
      {/* 主内容区域 */}
      <div className="relative z-10">
        {/* 装饰性顶部线条 */}
        {showDecorative && (
          <div className="flex items-center justify-center mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent w-24"></div>
            <div className="mx-4 w-2 h-2 bg-gold/60 rounded-full"></div>
            <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent w-24"></div>
          </div>
        )}
        
        {/* 品牌标题区域 */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-charcoal mb-2 tracking-wide leading-tight font-fangsong">
            <span className="inline-block transform hover:scale-105 transition-transform duration-300">韬</span>
            <span className="inline-block transform hover:scale-105 transition-transform duration-300" style={{transitionDelay: '50ms'}}>奋</span>
            <span className="mx-2 text-gold/60">·</span>
            <span className="inline-block transform hover:scale-105 transition-transform duration-300" style={{transitionDelay: '100ms'}}>时</span>
            <span className="inline-block transform hover:scale-105 transition-transform duration-300" style={{transitionDelay: '150ms'}}>光</span>
          </h1>
          
          {/* 英文副标题 */}
          <div className="text-sm text-charcoal/50 tracking-[0.3em] font-light mb-4 font-times">
            TAOFEN HERITAGE PROJECT
          </div>
        </div>
        
        {/* 背景图片区域（占位） */}
        {backgroundImage && (
          <div className="w-full h-32 md:h-40 mb-6 rounded-lg overflow-hidden">
            {backgroundImage === 'placeholder' ? (
              <div className="w-full h-full bg-gradient-to-br from-gold/10 to-charcoal/10 flex items-center justify-center">
                <span className="text-charcoal/40 text-sm">
                  {moduleId} 主题图片占位
                </span>
              </div>
            ) : (
              <img 
                src={backgroundImage} 
                alt={`${title} 主题图片`}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        )}
        
        {/* 模块标识区域 */}
        <div className="mb-6">
          {/* 模块图标 */}
          {icon && (
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-${accentColor}/20`}>
              {typeof icon === 'string' ? (
                <div dangerouslySetInnerHTML={{ __html: icon }} />
              ) : (
                icon
              )}
            </div>
          )}
          
          {/* 模块标题 */}
          <h2 className={`text-2xl md:text-3xl font-bold text-charcoal mb-3 font-kai ${customStyles.title || ''}`}>
            {title}
          </h2>
          
          {/* 模块副标题 */}
          {subtitle && (
            <div className="text-lg text-charcoal/70 mb-2 font-song">
              {subtitle}
            </div>
          )}
        </div>
        
        {/* 模块描述区域 */}
        <div className="max-w-2xl mx-auto">
          <p className={`text-base text-charcoal/60 leading-relaxed max-w-xl mx-auto font-song ${customStyles.description || ''}`}>
            {description}
          </p>
        </div>
        
        {/* 自定义内容区域 */}
        {children}
        
        {/* 装饰性底部元素 */}
        {showDecorative && (
          <div className="flex items-center justify-center mt-8">
            <div className="flex items-center space-x-2">
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
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent"></div>
      )}
    </div>
  );
};

export default BaseHeader;
