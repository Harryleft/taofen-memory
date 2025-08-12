// Footer 组件导出文件
export { default as BaseFooter } from './BaseFooter';
export { default as AppFooter } from './AppFooter';
export { default as FooterSection } from './sections/FooterSection';
export { default as BrandSection } from './sections/BrandSection';
export { default as NavigationSection } from './sections/NavigationSection';
export { default as ContactSection } from './sections/ContactSection';
export { default as LegalSection } from './sections/LegalSection';

// 类型导出
export type {
  FooterConfig,
  FooterProps,
  FooterSectionProps,
  NavigationItem,
  ContactInfo,
  SocialLink,
  LegalInfo
} from './types';

// 配置导出
export { defaultFooterConfig } from './types';