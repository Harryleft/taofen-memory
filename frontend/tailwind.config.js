/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF7F0',
        gold: '#B8860B',
        charcoal: '#2C2C2C',
        seal: '#DC2626',
        // 新增配色方案
        'warm-rose': '#8D6E63',     // 亲人家属 - 温暖克制的棕玫瑰色
        'heritage-blue': '#1565C0', // 学术文化 - 文化传承的深蓝色
        'sage-green': '#689F38',    // 政治社会 - 稳重的橄榄绿
        // From MINIMAL_COLORS
        'primary-dark': '#2C2C2C',
        'primary-medium': '#666666',
        'primary-light': '#999999',
        'accent-gold': '#D4AF37',
        'accent-light-gold': '#F4E4BC',
        'bg-pure': '#FFFFFF',
        'bg-warm': '#FEFEFE',
        'bg-subtle': '#F8F8F8',
        // 人物关系分类颜色 - 从 relationships.css 迁移
        'category-gray': '#6b7280',   // 全部/默认分类
        'category-red': '#ef4444',    // 家庭关系 (保持原有，与 warm-rose 共存)
        'category-blue': '#3b82f6',   // 媒体关系
        'category-green': '#10b981',  // 政治关系
        'category-purple': '#8b5cf6', // 学术关系
        'category-orange': '#f97316', // 其他关系
      },
      fontFamily: {
        'serif': ['EB Garamond', 'serif'],
        'sans': ['Noto Sans', 'sans-serif'],
        // From COMMON_FONTS & MINIMAL_FONTS
        'song': ['SimSun', '宋体', 'NSimSun', 'serif'],
        'kai': ['KaiTi', 'STKaiti', '华文楷体', 'serif'],
        'fangsong': ['FangSong', 'STFangsong', '华文仿宋', 'serif'],
        'hei': ['SimHei', '黑体', 'Microsoft YaHei', 'sans-serif'],
        'pingfang': ['PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
        'times': ['Times New Roman', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'subtle-float': 'subtle-float 4s ease-in-out infinite',
      },
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
      },
      backgroundImage: {
        'noise': "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxmaWx0ZXIgaWQ9Im5vaXNlIiB4PSIwJSIgeT0iMCUiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPgogICAgICA8ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9IjAuOSIgbnVtT2N0YXZlcz0iNCIgcmVzdWx0PSJub2lzZSIgc2VlZD0iMSIvPgogICAgICA8ZmVDb2xvck1hdHJpeCBpbj0ibm9pc2UiIHR5cGU9InNhdHVyYXRlIiB2YWx1ZXM9IjAiLz4KICAgIDwvZmlsdGVyPgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjQiLz4KPC9zdmc+')",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};