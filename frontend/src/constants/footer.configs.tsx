import { FooterConfig } from '@/components/layout/footer';

// 统一的简化 Footer 配置
const simplifiedFooterConfig: FooterConfig = {
  brand: {
    name: '韬奋纪念馆',
    description: '',
    copyright: '© 2025 韬奋纪念馆. 保留所有权利.',
  },
  
  navigation: {
    quickLinks: [
      { label: '韬奋纪念馆', to: 'https://www.shmog.org/', external: true },
    ],
  },
  
  legal: {
    items: [],
    additionalText: '第十届上海图书馆开放数据竞赛作品',
  },
  
  sections: [
    { id: 'brand', title: '', visible: true, order: 1 },
    { id: 'legal', title: '', visible: true, order: 2 },
  ],
  
  style: {
    backgroundColor: 'dark',
    textColor: 'light',
    accentColor: 'gold',
  },
  
  features: {
    showBackToTop: false,
    showCurrentYear: false,
    showLastUpdated: false,
  },
};

// 所有页面使用统一的简化配置
export const footerConfigs: Record<string, FooterConfig> = {
  home: simplifiedFooterConfig,
  timeline: simplifiedFooterConfig,
  relationships: simplifiedFooterConfig,
  handwriting: simplifiedFooterConfig,
  bookstore: simplifiedFooterConfig,
  default: simplifiedFooterConfig,
};