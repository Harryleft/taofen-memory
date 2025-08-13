// 类型导出
export type {
  NavigationLink,
  NavigationCategory,
  ExternalResource,
  FooterSection,
  FooterConfig,
  FooterProps
} from './ZoutaofenFooter';

// 组件导出
export { default as Footer } from './ZoutaofenFooter';
export { 
  ZoutaofenFooterResponsive,
  ZoutaofenFooterMinimal,
  ZoutaofenFooter
} from './ZoutaofenFooter';

// 默认配置导出
export const defaultZoutaofenFooterConfig = {
  primaryNavigation: {
    categories: [
      {
        id: 'life-journey',
        title: '岁月行履',
        links: [
          { label: '生平简介', to: '/life-journey/biography', external: false },
          { label: '重要时刻', to: '/life-journey/moments', external: false },
          { label: '成长历程', to: '/life-journey/growth', external: false },
          { label: '历史足迹', to: '/life-journey/footprints', external: false }
        ]
      },
      {
        id: 'books-times',
        title: '时光书影',
        links: [
          { label: '代表作品', to: '/books-times/works', external: false },
          { label: '出版历程', to: '/books-times/publications', external: false },
          { label: '读书笔记', to: '/books-times/notes', external: false },
          { label: '文化影响', to: '/books-times/influence', external: false }
        ]
      },
      {
        id: 'writing-style',
        title: '笔下风骨',
        links: [
          { label: '写作风格', to: '/writing-style/style', external: false },
          { label: '思想精髓', to: '/writing-style/philosophy', external: false },
          { label: '语言特色', to: '/writing-style/language', external: false },
          { label: '创作方法', to: '/writing-style/methods', external: false }
        ]
      },
      {
        id: 'contemporary-figures',
        title: '同行群像',
        links: [
          { label: '同时代人', to: '/contemporary-figures/peers', external: false },
          { label: '师友往来', to: '/contemporary-figures/friends', external: false },
          { label: '文化圈', to: '/contemporary-figures/circle', external: false },
          { label: '社会影响', to: '/contemporary-figures/impact', external: false }
        ]
      }
    ]
  },
  externalResources: {
    title: '相关链接',
    resources: [
      {
        label: '韬奋纪念馆',
        url: 'https://zoutaofen.com',
        icon: '🏛️',
        description: '官方网站'
      },
      {
        label: '上海图书馆',
        url: 'https://data.library.sh.cn',
        icon: '📚',
        description: '开放数据平台'
      },
      {
        label: '维基百科',
        url: 'https://zh.wikipedia.org/wiki/邹韬奋',
        icon: '📖',
        description: '百科资料'
      }
    ]
  },
  legal: {
    copyright: '© 2025 不知道起什么名字团队',
    competitionInfo: '本作品为第十届上海图书馆开放数据竞赛作品',
    teamName: '不知道起什么名字团队'
  },
  style: {
    backgroundColor: 'dark',
    textColor: 'light',
    themeColor: 'gold'
  }
};

// 主题配置导出
export const footerThemes = {
  gold: {
    primary: '#fbbf24',
    secondary: '#f59e0b',
    accent: '#d97706'
  },
  blue: {
    primary: '#3b82f6',
    secondary: '#2563eb',
    accent: '#1d4ed8'
  },
  green: {
    primary: '#10b981',
    secondary: '#059669',
    accent: '#047857'
  },
  red: {
    primary: '#ef4444',
    secondary: '#dc2626',
    accent: '#b91c1c'
  }
};

// 响应式断点配置导出
export const responsiveBreakpoints = {
  mobile: '640px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px'
};

// 布局配置导出
export const layoutConfigs = {
  responsive: {
    padding: '3rem 0',
    container: 'max-w-7xl mx-auto',
    gap: '3rem'
  },
  minimal: {
    padding: '2rem 0',
    container: 'max-w-6xl mx-auto',
    gap: '2rem'
  },
  full: {
    padding: '4rem 0',
    container: 'max-w-7xl mx-auto',
    gap: '4rem'
  }
};

// 动画配置导出
export const animationConfigs = {
  duration: '0.3s',
  easing: 'ease',
  hoverTransform: 'translateX(4px)',
  resourceHoverTransform: 'translateY(-4px) scale(1.02)'
};

// 无障碍配置导出
export const accessibilityConfigs = {
  focusOutline: '2px solid #fbbf24',
  focusOffset: '2px',
  borderRadius: '4px',
  skipLink: '#main-content'
};

// SEO配置导出
export const seoConfigs = {
  structuredData: {
    type: 'WebSite',
    name: '韬奋纪念馆',
    description: '致力于韬奋精神的研究、传承与弘扬',
    url: 'https://zoutaofen.com'
  },
  metaTags: {
    title: '韬奋纪念馆 - 致力于韬奋精神的研究、传承与弘扬',
    description: '韬奋纪念馆官方网站，提供韬奋生平事迹、代表作品、思想精髓等相关资料。',
    keywords: '韬奋,邹韬奋,韬奋纪念馆,韬奋精神,中国近代史'
  }
};