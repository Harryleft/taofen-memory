import React from 'react';

// 新的统一 Header 配置接口
export interface HeaderConfig {
  moduleId: string;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
  accentColor?: 'gold' | 'blue' | 'green' | 'red';
  culturalElement?: {
    text: string;
    position: 'top' | 'bottom';
  };
  // 用于模块专属的装饰元素
  decorativeElement?: React.ReactNode;
}

interface BaseHeaderProps {
  config: HeaderConfig;
}

const BaseHeader: React.FC<BaseHeaderProps> = ({ config }) => {
  const {
    title,
    subtitle,
    description,
    icon,
    accentColor = 'gold',
    culturalElement,
    decorativeElement
  } = config;

  const accentColorVariants = {
    gold: 'text-accent-gold',
    blue: 'text-accent-blue',
    green: 'text-accent-green',
    red: 'text-accent-red',
  };

  const accentBgColorVariants = {
    gold: 'bg-accent-gold',
    blue: 'bg-accent-blue',
    green: 'bg-accent-green',
    red: 'bg-accent-red',
  };

  const accentColorValueVariants = {
    gold: '#f59e0b',
    blue: '#3b82f6',
    green: '#10b981',
    red: '#ef4444',
  };

  const accentColorClass = accentColorVariants[accentColor] || 'text-accent-gold';
  const accentBgColorClass = accentBgColorVariants[accentColor] || 'bg-accent-gold';
  const accentColorValue = accentColorValueVariants[accentColor] || '#f59e0b';

  return (
    <header className="minimal-header bg-background-pure text-center p-8 md:p-12">
      <div className="max-w-3xl mx-auto">
        {/* 文化元素 - 顶部 */}
        {culturalElement?.position === 'top' && (
          <div className="mb-6 text-xs text-primary-light font-cultural tracking-[0.2em]">
            {culturalElement.text}
          </div>
        )}

        {/* 品牌标识区域 - 极简化 */}
        <div className="mb-8">
          <h1 className="text-4xl font-cultural m-0 transition-opacity duration-300 hover:opacity-75">
            <span className="text-primary-dark">韬奋</span>
            <span className={`${accentColorClass} mx-1 font-light`}>
              ·
            </span>
            <span className="text-primary-medium">纪念</span>
          </h1>
          
          {/* 英文副标题 - 极简处理 */}
          <div className="text-xs text-primary-light font-english tracking-widest mt-2">
            TAOFEN HERITAGE
          </div>
        </div>

        {/* 分隔线 - 极简几何元素 */}
        <div className={`w-[60px] h-[1px] ${accentBgColorClass} mx-auto my-8 opacity-60`} />

        {/* 模块标识区域 */}
        <div className="mb-6">
          {/* 模块图标 - 简化处理 */}
          {icon && (
            <div className={`mb-4 ${accentColorClass} flex justify-center items-center transition-transform duration-300 hover:-translate-y-1`}>
              {icon}
            </div>
          )}

          {/* 模块标题 */}
          <h2 className="text-2xl font-cultural m-0 mb-2">
            {title}
          </h2>

          {/* 模块副标题 */}
          {subtitle && (
            <div className="text-sm text-primary-medium font-primary mb-4 tracking-[0.05em]">
              {subtitle}
            </div>
          )}
        </div>

        {/* 模块描述 */}
        <div className="text-base font-primary max-w-[600px] mx-auto mb-6 leading-relaxed">
          {description}
        </div>

        {/* 模块专属装饰区 */}
        {decorativeElement}

        {/* 文化元素 - 底部 */}
        {culturalElement?.position === 'bottom' && (
          <div className="mt-6 text-xs text-primary-light font-cultural tracking-[0.2em]">
            {culturalElement.text}
          </div>
        )}

        {/* 底部装饰 - 极简几何 */}
        <div className="mt-12 flex justify-center items-center gap-2">
          <div className="w-5 h-px bg-primary-light opacity-40" />
          <div 
            className="w-0.5 h-0.5 rounded-full opacity-60"
            style={{ backgroundColor: accentColorValue }}
          />
          <div className="w-5 h-px bg-primary-light opacity-40" />
        </div>
      </div>
    </header>
  );
};

export default BaseHeader;
