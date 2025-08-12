/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  
  // Tailwind CSS v4 配置
  future: {
    hoverOnlyWhenSupported: true,
  },
  
  theme: {
    extend: {
      // 设计令牌系统 - 统一的设计语言
      colors: {
        // === 基础色彩系统 ===
        'primary': '#2C2C2C',           // 主要文字色
        'secondary': '#666666',         // 次要文字色
        'muted': '#999999',            // 静音文字色
        
        // === 主题色 ===
        'cream': '#FAF7F0',            // 主背景色
        'gold': '#B8860B',             // 主强调色
        'charcoal': '#2C2C2C',         // 主文字色
        'seal': '#DC2626',             // 错误/警告色
        
        // === 语义化色彩系统 ===
        'warm-rose': '#8D6E63',        // 亲人家属 - 温暖克制的棕玫瑰色
        'heritage-blue': '#1565C0',    // 学术文化 - 文化传承的深蓝色
        'sage-green': '#689F38',       // 政治社会 - 稳重的橄榄绿
        
        // === 功能色彩系统 ===
        'accent-gold': '#D4AF37',      // 主要强调色
        'accent-light-gold': '#F4E4BC', // 轻强调色
        
        // === 背景色彩系统 ===
        'bg-pure': '#FFFFFF',          // 纯白背景
        'bg-warm': '#FEFEFE',          // 温暖背景
        'bg-subtle': '#F8F8F8',        // 微妙背景
        'bg-card': '#FFFFFF',          // 卡片背景
        
        // === 边框色彩系统 ===
        'border-light': 'rgba(0, 0, 0, 0.08)',
        'border-medium': 'rgba(0, 0, 0, 0.12)',
        'border-strong': 'rgba(0, 0, 0, 0.16)',
        'border-gold': 'rgba(212, 175, 55, 0.3)',
        
        // === 分类色彩系统 ===
        'category-gray': '#6b7280',    // 全部/默认分类
        'category-red': '#ef4444',     // 家庭关系
        'category-blue': '#3b82f6',    // 媒体关系
        'category-green': '#10b981',   // 政治关系
        'category-purple': '#8b5cf6',  // 学术关系
        'category-orange': '#f97316',  // 其他关系
        
        // === 状态色彩系统 ===
        'success': '#10b981',
        'warning': '#f59e0b',
        'error': '#ef4444',
        'info': '#3b82f6',
      },
      
      // 字体系统
      fontFamily: {
        'serif': ['EB Garamond', 'serif'],
        'sans': ['Noto Sans', 'sans-serif'],
        'song': ['SimSun', '宋体', 'NSimSun', 'serif'],
        'kai': ['KaiTi', 'STKaiti', '华文楷体', 'serif'],
        'fangsong': ['FangSong', 'STFangsong', '华文仿宋', 'serif'],
        'hei': ['SimHei', '黑体', 'Microsoft YaHei', 'sans-serif'],
        'pingfang': ['PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
        'times': ['Times New Roman', 'Georgia', 'serif'],
      },
      
      // 动画系统
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'subtle-float': 'subtle-float 4s ease-in-out infinite',
        'slide-in-right': 'slideInFromRight 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'blob': 'blob 7s infinite',
        'card-enter': 'cardEnter 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'stagger-in': 'staggerIn 0.6s ease-out forwards',
      },
      
      // 关键帧定义
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'subtle-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        slideInFromRight: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        cardEnter: {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        staggerIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      
      // 背景图片
      backgroundImage: {
        'noise': "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxmaWx0ZXIgaWQ9Im5vaXNlIiB4PSIwJSIgeT0iMCUiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPgogICAgICA8ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9IjAuOSIgbnVtT2N0YXZlcz0iNCIgcmVzdWx0PSJub2lzZSIgc2VlZD0iMSIvPgogICAgICA8ZmVDb2xvck1hdHJpeCBpbj0ibm9pc2UiIHR5cGU9InNhdHVyYXRlIiB2YWx1ZXM9IjAiLz4KICAgIDwvZmlsdGVyPgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjQiLz4KPC9zdmc+')",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      
      // 性能优化
      transitionProperty: {
        'transform-gpu': 'transform, opacity, filter',
      },
      
      // === 间距系统 ===
      spacing: {
        'xs': '0.5rem',    // 8px
        'sm': '0.75rem',   // 12px
        'md': '1rem',      // 16px
        'lg': '1.25rem',   // 20px
        'xl': '1.5rem',    // 24px
        '2xl': '2rem',     // 32px
        '3xl': '2.5rem',   // 40px
        '4xl': '3rem',     // 48px
        '5xl': '4rem',     // 64px
        '6xl': '6rem',     // 96px
      },
      
      // === 圆角系统 ===
      borderRadius: {
        'xs': '0.25rem',   // 4px
        'sm': '0.375rem',  // 6px
        'md': '0.5rem',    // 8px
        'lg': '0.75rem',   // 12px
        'xl': '1rem',      // 16px
        '2xl': '1.5rem',   // 24px
        '3xl': '2rem',     // 32px
        'full': '9999px',
      },
      
      // === 阴影系统 ===
      boxShadow: {
        'xs': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px rgba(0, 0, 0, 0.15)',
        'inner': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
        'card': '0 2px 4px rgba(0, 0, 0, 0.04), 0 4px 8px rgba(0, 0, 0, 0.06), 0 8px 16px rgba(0, 0, 0, 0.08)',
        'hover': '0 8px 16px rgba(0, 0, 0, 0.08), 0 16px 32px rgba(0, 0, 0, 0.12), 0 24px 48px rgba(0, 0, 0, 0.16)',
      },
      
      // === 字体大小系统 ===
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],   // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],      // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],   // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],    // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],       // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],  // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],    // 36px
        '5xl': ['3rem', { lineHeight: '1' }],            // 48px
        '6xl': ['3.75rem', { lineHeight: '1' }],          // 60px
      },
      
      // === 响应式断点系统 ===
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      
      // === 过渡动画系统 ===
      transitionDuration: {
        'fast': '150ms',
        'normal': '300ms',
        'slow': '500ms',
      },
      
      transitionTimingFunction: {
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
      },
    },
  },
  
  // 插件配置
  plugins: [],
  
  // 变量前缀配置
  prefix: '',
  
  // 重要配置
  important: false,
};