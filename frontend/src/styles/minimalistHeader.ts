/**
 * 邹韬奋纪念网站 - 极简主义Header设计系统
 * 融合瑞典极简设计理念与民国文化属性
 * 基于第一性原理：简洁、功能性、文化传承
 */

// 极简字体系统 - 减少字体种类，提升一致性
export const MINIMAL_FONTS = {
  // 主字体：现代简洁的中文字体
  primary: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
  // 文化字体：保留传统韵味的楷体
  cultural: "'KaiTi', 'STKaiti', '华文楷体', serif",
  // 英文字体：经典衬线体
  english: "'Times New Roman', 'Georgia', serif"
};

// 极简色彩系统 - 基于瑞典设计的中性色调
export const MINIMAL_COLORS = {
  // 主色调：深灰色系
  primary: {
    dark: '#2C2C2C',    // 深炭灰
    medium: '#666666',  // 中灰
    light: '#999999'    // 浅灰
  },
  // 强调色：温暖的金色（保留民国文化元素）
  accent: {
    gold: '#D4AF37',    // 古典金
    lightGold: '#F4E4BC' // 淡金色
  },
  // 背景色：纯净白色系
  background: {
    pure: '#FFFFFF',
    warm: '#FEFEFE',
    subtle: '#F8F8F8'
  }
};

// 极简间距系统 - 基于8px网格
export const MINIMAL_SPACING = {
  xs: '4px',   // 0.5 * 8
  sm: '8px',   // 1 * 8
  md: '16px',  // 2 * 8
  lg: '24px',  // 3 * 8
  xl: '32px',  // 4 * 8
  xxl: '48px', // 6 * 8
  xxxl: '64px' // 8 * 8
};

// 极简排版系统
export const MINIMAL_TYPOGRAPHY = {
  // 品牌标题
  brand: {
    fontSize: '2.5rem',      // 40px
    lineHeight: '1.2',
    fontWeight: '300',       // 轻量级
    letterSpacing: '0.05em',
    color: MINIMAL_COLORS.primary.dark
  },
  // 模块标题
  moduleTitle: {
    fontSize: '1.75rem',     // 28px
    lineHeight: '1.3',
    fontWeight: '400',
    letterSpacing: '0.02em',
    color: MINIMAL_COLORS.primary.dark
  },
  // 副标题
  subtitle: {
    fontSize: '0.875rem',    // 14px
    lineHeight: '1.4',
    fontWeight: '400',
    letterSpacing: '0.1em',
    color: MINIMAL_COLORS.primary.medium,
    textTransform: 'uppercase' as const
  },
  // 描述文本
  description: {
    fontSize: '1rem',        // 16px
    lineHeight: '1.6',
    fontWeight: '400',
    color: MINIMAL_COLORS.primary.medium
  }
};

// 极简布局系统
export const MINIMAL_LAYOUT = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: `0 ${MINIMAL_SPACING.lg}`
  },
  header: {
    padding: `${MINIMAL_SPACING.xxxl} 0`,
    textAlign: 'center' as const,
    borderBottom: `1px solid ${MINIMAL_COLORS.background.subtle}`
  },
  section: {
    marginBottom: MINIMAL_SPACING.xl
  }
};

// 极简动画系统 - 微妙而优雅
export const MINIMAL_ANIMATIONS = {
  transition: {
    fast: '0.15s ease-out',
    normal: '0.25s ease-out',
    slow: '0.4s ease-out'
  },
  hover: {
    opacity: 0.7,
    transform: 'translateY(-1px)'
  }
};

// 模块配置接口 - 简化配置选项
export interface MinimalHeaderConfig {
  // 必需字段
  moduleId: string;
  title: string;
  description: string;
  
  // 可选字段
  subtitle?: string;
  icon?: React.ReactNode;
  accentColor?: keyof typeof MINIMAL_COLORS.accent;
  
  // 文化元素
  culturalElement?: {
    text: string;
    position: 'top' | 'bottom';
  };
}

export default {
  MINIMAL_FONTS,
  MINIMAL_COLORS,
  MINIMAL_SPACING,
  MINIMAL_TYPOGRAPHY,
  MINIMAL_LAYOUT,
  MINIMAL_ANIMATIONS
};