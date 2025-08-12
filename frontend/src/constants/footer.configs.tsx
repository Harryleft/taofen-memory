import { FooterConfig } from '../components/layout/footer/types';

// 统一的 Footer 配置 - 所有页面使用相同的简化配置
export const footerConfigs: Record<string, FooterConfig> = {
  // 所有页面使用统一的简化配置
  home: {
    brand: {
      name: '韬奋纪念馆',
      description: '',
      copyright: '© 2025 韬奋纪念馆. 保留所有权利.',
    },
    
    // 只保留必要的链接
    navigation: {
      quickLinks: [
        { label: '韬奋纪念馆', to: 'https://www.shmog.org/', external: true },
      ],
    },
    
    // 移除法律信息
    legal: {
      items: [],
      additionalText: '第十届上海图书馆开放数据竞赛作品',
    },
    
    // 只显示品牌和竞赛说明
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
  },

  // 所有页面使用相同的简化配置
  timeline: {
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
  },

  // 人物关系 - 使用相同的简化配置
  relationships: {
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
  },

  // 手稿文献 - 使用相同的简化配置
  handwriting: {
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
  },

  // 书店经营 - 使用相同的简化配置
  bookstore: {
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
  },

  // 默认或未知模块 - 使用相同的简化配置
  default: {
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
  },
};