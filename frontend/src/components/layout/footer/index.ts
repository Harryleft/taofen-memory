// 类型导出
export type {
  FooterConfig,
  FooterProps,
  NavigationLink,
  NavigationCategory,
} from './index.tsx';

// 组件导出
export { default as Footer } from './index.tsx';
export { AppFooter } from './index.tsx';

// 默认配置导出
export const defaultFooterConfig = {
  brand: {
    name: '韬奋纪念馆',
    description: '致力于韬奋精神的研究、传承与弘扬',
    copyright: '© 2025 韬奋纪念馆. 保留所有权利.',
  },
  navigation: {
    categories: [
      {
        id: 'about',
        title: '关于我们',
        links: [
          { label: '纪念馆介绍', to: '/about', external: false },
          { label: '韬奋生平', to: '/about/biography', external: false },
          { label: '历史沿革', to: '/about/history', external: false },
          { label: '参观指南', to: '/visit', external: false },
        ]
      },
      {
        id: 'resources',
        title: '资源中心',
        links: [
          { label: '数字档案', to: '/resources/archive', external: false },
          { label: '学术研究', to: '/resources/research', external: false },
          { label: '教育项目', to: '/resources/education', external: false },
          { label: '出版物', to: '/resources/publications', external: false },
        ]
      }
    ]
  },
  contact: {
    items: [
      {
        label: '地址',
        value: '上海市重庆南路205弄5号',
        type: 'address'
      },
      {
        label: '电话',
        value: '+86 21 6472 5920',
        type: 'phone'
      },
      {
        label: '邮箱',
        value: 'info@zoutaofen.com',
        type: 'email'
      }
    ]
  },
  social: {
    links: [
      {
        platform: '微信',
        url: '#',
        icon: '📱'
      },
      {
        platform: '微博',
        url: '#',
        icon: '📱'
      },
      {
        platform: '抖音',
        url: '#',
        icon: '📱'
      }
    ]
  },
  sections: [
    { id: 'brand', title: '品牌', visible: true, order: 1 },
    { id: 'navigation', title: '导航', visible: true, order: 2 },
    { id: 'contact', title: '联系', visible: true, order: 3 },
    { id: 'social', title: '社交', visible: true, order: 4 },
  ],
  style: {
    backgroundColor: 'dark',
    textColor: 'light',
  },
};
