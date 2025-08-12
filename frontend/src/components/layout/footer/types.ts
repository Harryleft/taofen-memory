import React from 'react';

// 导航链接项配置
export interface NavigationItem {
  label: string;
  to: string;
  external?: boolean;
  icon?: React.ReactNode;
}

// 联系信息配置
export interface ContactInfo {
  label: string;
  value: string;
  icon?: React.ReactNode;
  link?: string;
}

// 社交媒体链接配置
export interface SocialLink {
  platform: string;
  url: string;
  icon: React.ReactNode;
  ariaLabel: string;
}

// 法律信息配置
export interface LegalInfo {
  label: string;
  to: string;
  external?: boolean;
}

// Footer 区域配置
export interface FooterSection {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

// 完整的 Footer 配置接口
export interface FooterConfig {
  // 基础信息
  brand: {
    name: string;
    logo?: React.ReactNode;
    description: string;
    copyright: string;
  };
  
  // 导航配置
  navigation?: {
    quickLinks?: NavigationItem[];
    siteMap?: NavigationItem[];
  };
  
  // 联系信息
  contact?: {
    items: ContactInfo[];
    socialLinks?: SocialLink[];
  };
  
  // 法律信息
  legal?: {
    items: LegalInfo[];
    additionalText?: string;
  };
  
  // 显示配置
  sections: FooterSection[];
  
  // 样式配置
  style?: {
    backgroundColor?: 'white' | 'gray' | 'cream' | 'dark';
    textColor?: 'light' | 'dark';
    accentColor?: 'gold' | 'blue' | 'green' | 'red';
  };
  
  // 功能配置
  features?: {
    showBackToTop?: boolean;
    showCurrentYear?: boolean;
    showLastUpdated?: boolean;
  };
}

// Footer 组件属性接口
export interface FooterProps {
  config: FooterConfig;
  className?: string;
}

// Footer 区域组件属性接口
export interface FooterSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

// 默认 Footer 配置
export const defaultFooterConfig: FooterConfig = {
  brand: {
    name: '韬奋纪念馆',
    description: '传承韬奋精神，弘扬文化传统',
    copyright: '© 2024 韬奋纪念馆. 保留所有权利.',
  },
  
  navigation: {
    quickLinks: [
      { label: '首页', to: '/' },
      { label: '岁月行履', to: '/timeline' },
      { label: '生活与书', to: '/bookstore-timeline' },
      { label: '笔下风骨', to: '/handwriting' },
      { label: '同道群像', to: '/relationships' },
    ],
    siteMap: [
      { label: '关于我们', to: '/about' },
      { label: '参观指南', to: '/visit' },
      { label: '教育活动', to: '/education' },
      { label: '研究成果', to: '/research' },
    ],
  },
  
  contact: {
    items: [
      { label: '地址', value: '上海市黄浦区淮海中路300号' },
      { label: '电话', value: '+86 21 1234 5678' },
      { label: '邮箱', value: 'info@taofen.org', link: 'mailto:info@taofen.org' },
      { label: '开放时间', value: '周二至周日 9:00-17:00' },
    ],
  },
  
  legal: {
    items: [
      { label: '隐私政策', to: '/privacy' },
      { label: '使用条款', to: '/terms' },
      { label: '无障碍声明', to: '/accessibility' },
    ],
    additionalText: '本网站内容仅供学术研究和教育用途。',
  },
  
  sections: [
    { id: 'brand', title: '关于我们', visible: true, order: 1 },
    { id: 'navigation', title: '快速导航', visible: true, order: 2 },
    { id: 'contact', title: '联系我们', visible: true, order: 3 },
    { id: 'legal', title: '法律信息', visible: true, order: 4 },
  ],
  
  style: {
    backgroundColor: 'dark',
    textColor: 'light',
    accentColor: 'gold',
  },
  
  features: {
    showBackToTop: true,
    showCurrentYear: true,
    showLastUpdated: false,
  },
};