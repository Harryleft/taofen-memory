// 类型导出
export type {
  FooterConfig,
  FooterProps,
  LegalInfo,
  FooterSection
} from './index.tsx';

// 组件导出
export { default as Footer } from './index.tsx';
export { AppFooter } from './index.tsx';

// 默认配置导出
export const defaultFooterConfig = {
  brand: {
    name: '韬奋纪念馆',
    description: '',
    copyright: '© 2025 韬奋纪念馆. 保留所有权利.',
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
