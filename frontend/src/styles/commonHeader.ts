/**
 * 邹韬奋纪念网站 - 通用Header样式配置
 * 统一的品牌展示架构，支持模块个性化定制
 */

// 通用字体配置
export const COMMON_FONTS = {
  // 宋体 - 用于正文内容
  song: "'SimSun', '宋体', 'NSimSun', serif",
  // 楷体 - 用于标题和重要文本
  kai: "'KaiTi', 'STKaiti', '华文楷体', serif",
  // 仿宋 - 用于品牌标题
  fangsong: "'FangSong', 'STFangsong', '华文仿宋', serif",
  // 黑体 - 用于现代感文本
  hei: "'SimHei', '黑体', 'Microsoft YaHei', sans-serif"
};

// 通用主题色彩
export const COMMON_THEME = {
  primary: {
    gold: 'gold',
    charcoal: 'charcoal'
  },
  opacity: {
    light: '/20',
    medium: '/40', 
    heavy: '/60',
    strong: '/80'
  }
};

// 通用动画配置
export const COMMON_ANIMATIONS = {
  transition: {
    fast: 'transition-all duration-200',
    normal: 'transition-all duration-300',
    slow: 'transition-all duration-500'
  },
  hover: {
    scale: 'hover:scale-105',
    lift: 'hover:-translate-y-1',
    glow: 'hover:shadow-lg'
  }
};

// 通用Header布局配置
export const COMMON_HEADER_LAYOUT = {
  container: {
    base: 'relative text-center overflow-hidden',
    spacing: 'mb-16', // 可根据模块调整
    maxWidth: 'max-w-6xl mx-auto px-6'
  },
  background: {
    decorative: 'absolute inset-0 opacity-5',
    gradient: 'absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-radial from-gold/20 to-transparent rounded-full'
  },
  content: {
    wrapper: 'relative z-10',
    brandSection: 'mb-8',
    moduleSection: 'mb-6',
    descriptionSection: 'max-w-2xl mx-auto'
  }
};

// 通用Header样式
export const COMMON_HEADER_STYLES = {
  // 品牌标题区域
  brand: {
    container: 'flex items-center justify-center mb-8',
    decorativeLine: 'h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent w-24',
    decorativeDot: 'mx-4 w-2 h-2 bg-gold/60 rounded-full',
    title: `text-5xl md:text-6xl font-bold text-charcoal mb-2 tracking-wide leading-tight`,
    subtitle: `text-sm text-charcoal/50 tracking-[0.3em] font-light mb-4`
  },
  
  // 模块标识区域
  module: {
    container: 'mb-6',
    iconWrapper: 'w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center',
    title: `text-2xl md:text-3xl font-bold text-charcoal mb-3`,
    subtitle: `text-lg text-charcoal/70 mb-2`,
    description: `text-base text-charcoal/60 leading-relaxed max-w-xl mx-auto`
  },
  
  // 装饰元素
  decorative: {
    topLine: 'flex items-center justify-center mb-8',
    bottomLine: 'flex items-center justify-center mt-8',
    dots: 'flex items-center space-x-2',
    animatedDot: 'rounded-full animate-pulse',
    gradientSeparator: 'absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent'
  },
  
  // 图片占位区域
  image: {
    container: 'w-full h-32 md:h-40 mb-6 rounded-lg overflow-hidden',
    placeholder: 'w-full h-full bg-gradient-to-br from-gold/10 to-charcoal/10 flex items-center justify-center',
    placeholderText: 'text-charcoal/40 text-sm',
    actual: 'w-full h-full object-cover'
  }
};

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

export default {
  COMMON_FONTS,
  COMMON_THEME,
  COMMON_ANIMATIONS,
  COMMON_HEADER_LAYOUT,
  COMMON_HEADER_STYLES
};