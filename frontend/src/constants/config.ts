// 统一配置常量
export const UI_CONFIG = {
  // 动画配置
  ANIMATION: {
    DELAY: {
      ENTRANCE: 300,
      FAST: 150,
      NORMAL: 300,
      SLOW: 500,
    },
    DURATION: {
      FAST: '150ms',
      NORMAL: '300ms',
      SLOW: '500ms',
    },
  },
  
  // 布局配置
  LAYOUT: {
    HEADER_HEIGHT: 64,
    FOOTER_HEIGHT: 48,
    MAX_WIDTH: {
      SMALL: 640,
      MEDIUM: 768,
      LARGE: 1024,
      XLARGE: 1280,
    },
  },
  
  // 响应式断点
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
  },
  
  // 字体大小
  FONT_SIZE: {
    XS: '0.75rem',
    SM: '0.875rem',
    BASE: '1rem',
    LG: '1.125rem',
    XL: '1.25rem',
    '2XL': '1.5rem',
    '3XL': '1.875rem',
    '4XL': '2.25rem',
  },
  
  // 间距
  SPACING: {
    XS: '0.5rem',
    SM: '0.75rem',
    MD: '1rem',
    LG: '1.5rem',
    XL: '2rem',
    '2XL': '3rem',
    '3XL': '4rem',
  },
  
  // 圆角
  RADIUS: {
    NONE: '0',
    SM: '0.125rem',
    MD: '0.375rem',
    LG: '0.5rem',
    XL: '0.75rem',
    FULL: '9999px',
  },
  
  // 阴影
  SHADOW: {
    SM: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    MD: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    LG: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    XL: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    '2XL': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  },
  
  // Z-index 层级
  Z_INDEX: {
    DROPDOWN: 1000,
    STICKY: 1020,
    FIXED: 1030,
    MODAL: 1040,
    POPOVER: 1050,
    TOOLTIP: 1060,
  },
} as const;

// 应用特定配置
export const APP_CONFIG = {
  // 基础信息
  META: {
    TITLE: '邹韬奋纪念网页',
    YEAR_RANGE: '1895 - 1944',
    SUBTITLE: '沿邹韬奋的生活、事业与遗产，洞见时代精神',
  },
  
  // 页面配置
  PAGES: {
    HOME: '/',
    TIMELINE: '/timeline',
    RELATIONSHIPS: '/relationships',
    HANDWRITING: '/handwriting',
    BOOKSTORE: '/bookstore',
  },
  
  // 颜色主题
  COLORS: {
    PRIMARY: {
      CREAM: '#FAF7F0',
      GOLD: '#B8860B',
      CHARCOAL: '#2C2C2C',
      SEAL: '#DC2626',
    },
    SEMANTIC: {
      SUCCESS: '#10b981',
      WARNING: '#f59e0b',
      ERROR: '#ef4444',
      INFO: '#3b82f6',
    },
  },
  
  // 网格配置
  GRID: {
    COLUMNS: {
      DEFAULT: 1,
      SM: 2,
      MD: 3,
      LG: 4,
      XL: 5,
    },
    GAP: {
      SM: '1rem',
      MD: '1.5rem',
      LG: '2rem',
    },
  },
  
  // 分页配置
  PAGINATION: {
    DEFAULT_SIZE: 12,
    PAGE_SIZE_OPTIONS: [12, 24, 36, 48],
    MAX_VISIBLE_PAGES: 5,
  },
  
  // 缓存配置
  CACHE: {
    TTL: {
      SHORT: 5 * 60 * 1000, // 5分钟
      MEDIUM: 30 * 60 * 1000, // 30分钟
      LONG: 2 * 60 * 60 * 1000, // 2小时
    },
  },
} as const;

// 导出所有配置
export const CONFIG = {
  ...UI_CONFIG,
  ...APP_CONFIG,
} as const;