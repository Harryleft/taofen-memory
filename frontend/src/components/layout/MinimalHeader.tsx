import React from 'react';
import {
  MINIMAL_FONTS,
  MINIMAL_COLORS,
  MINIMAL_SPACING,
  MINIMAL_TYPOGRAPHY,
  MINIMAL_LAYOUT,
  MINIMAL_ANIMATIONS,
  MinimalHeaderConfig
} from '../../styles/minimalistHeader.ts';

interface MinimalHeaderProps {
  config: MinimalHeaderConfig;
  children?: React.ReactNode;
}

const MinimalHeader: React.FC<MinimalHeaderProps> = ({ config, children }) => {
  const {
    moduleId,
    title,
    subtitle,
    description,
    icon,
    accentColor = 'gold',
    culturalElement
  } = config;

  const accentColorValue = MINIMAL_COLORS.accent[accentColor];

  return (
    <header 
      style={{
        ...MINIMAL_LAYOUT.header,
        backgroundColor: MINIMAL_COLORS.background.pure
      }}
      className="minimal-header"
    >
      <div style={MINIMAL_LAYOUT.container}>
        {/* 文化元素 - 顶部 */}
        {culturalElement?.position === 'top' && (
          <div 
            style={{
              marginBottom: MINIMAL_SPACING.lg,
              fontSize: '0.75rem',
              color: MINIMAL_COLORS.primary.light,
              fontFamily: MINIMAL_FONTS.cultural,
              letterSpacing: '0.2em'
            }}
          >
            {culturalElement.text}
          </div>
        )}

        {/* 品牌标识区域 - 极简化 */}
        <div style={{ marginBottom: MINIMAL_SPACING.xl }}>
          <h1 
            style={{
              ...MINIMAL_TYPOGRAPHY.brand,
              fontFamily: MINIMAL_FONTS.cultural,
              margin: 0,
              transition: MINIMAL_ANIMATIONS.transition.normal
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = String(MINIMAL_ANIMATIONS.hover.opacity);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <span style={{ color: MINIMAL_COLORS.primary.dark }}>韬奋</span>
            <span 
              style={{ 
                color: accentColorValue,
                margin: `0 ${MINIMAL_SPACING.xs}`,
                fontWeight: '200'
              }}
            >
              ·
            </span>
            <span style={{ color: MINIMAL_COLORS.primary.medium }}>纪念</span>
          </h1>
          
          {/* 英文副标题 - 极简处理 */}
          <div 
            style={{
              ...MINIMAL_TYPOGRAPHY.subtitle,
              fontFamily: MINIMAL_FONTS.english,
              marginTop: MINIMAL_SPACING.sm
            }}
          >
            TAOFEN HERITAGE
          </div>
        </div>

        {/* 分隔线 - 极简几何元素 */}
        <div 
          style={{
            width: '60px',
            height: '1px',
            backgroundColor: accentColorValue,
            margin: `${MINIMAL_SPACING.xl} auto`,
            opacity: 0.6
          }}
        />

        {/* 模块标识区域 */}
        <div style={{ marginBottom: MINIMAL_SPACING.lg }}>
          {/* 模块图标 - 简化处理 */}
          {icon && (
            <div 
              style={{
                marginBottom: MINIMAL_SPACING.md,
                color: accentColorValue,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: MINIMAL_ANIMATIONS.transition.normal
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = MINIMAL_ANIMATIONS.hover.transform;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {icon}
            </div>
          )}

          {/* 模块标题 */}
          <h2 
            style={{
              ...MINIMAL_TYPOGRAPHY.moduleTitle,
              fontFamily: MINIMAL_FONTS.cultural,
              margin: 0,
              marginBottom: MINIMAL_SPACING.sm
            }}
          >
            {title}
          </h2>

          {/* 模块副标题 */}
          {subtitle && (
            <div 
              style={{
                ...MINIMAL_TYPOGRAPHY.subtitle,
                fontFamily: MINIMAL_FONTS.primary,
                marginBottom: MINIMAL_SPACING.md,
                textTransform: 'none',
                letterSpacing: '0.05em'
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {/* 模块描述 */}
        <div 
          style={{
            ...MINIMAL_TYPOGRAPHY.description,
            fontFamily: MINIMAL_FONTS.primary,
            maxWidth: '600px',
            margin: '0 auto',
            marginBottom: MINIMAL_SPACING.lg
          }}
        >
          {description}
        </div>

        {/* 自定义内容区域 */}
        {children}

        {/* 文化元素 - 底部 */}
        {culturalElement?.position === 'bottom' && (
          <div 
            style={{
              marginTop: MINIMAL_SPACING.lg,
              fontSize: '0.75rem',
              color: MINIMAL_COLORS.primary.light,
              fontFamily: MINIMAL_FONTS.cultural,
              letterSpacing: '0.2em'
            }}
          >
            {culturalElement.text}
          </div>
        )}

        {/* 底部装饰 - 极简几何 */}
        <div 
          style={{
            marginTop: MINIMAL_SPACING.xl,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: MINIMAL_SPACING.sm
          }}
        >
          <div 
            style={{
              width: '20px',
              height: '1px',
              backgroundColor: MINIMAL_COLORS.primary.light,
              opacity: 0.4
            }}
          />
          <div 
            style={{
              width: '3px',
              height: '3px',
              backgroundColor: accentColorValue,
              borderRadius: '50%',
              opacity: 0.6
            }}
          />
          <div 
            style={{
              width: '20px',
              height: '1px',
              backgroundColor: MINIMAL_COLORS.primary.light,
              opacity: 0.4
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default MinimalHeader;
