import { HeaderConfig, NavigationItem } from '@/components/layout/header/BaseHeader';

// 统一导航菜单配置 - 所有页面使用相同的导航
const NAVIGATION_ITEMS: NavigationItem[] = [
  { label: '岁月行履', to: '/timeline' },
  { label: '时光书影', to: '/bookstore-timeline' },
  { label: '笔下风骨', to: '/handwriting' },
  { label: '同道群像', to: '/relationships' }
];

// 定义所有模块的 Header 配置 - 统一使用首页样式
export const headerConfigs: Record<string, HeaderConfig> = {
  // 首页
  home: {
    moduleId: 'home',
    title: '邹韬奋',
    subtitle: '沿邹韬奋的生活、事业与遗产，洞见时代精神',
    description: '韬奋纪念馆 - 全面了解邹韬奋先生的生平、事业与精神',
    accentColor: 'gold',
    layout: 'hero',
    navigation: NAVIGATION_ITEMS,
    logo: {
      showText: true,
      showIcon: true,
    },
    showNavigation: true,
    showMobileMenu: true,
    backgroundColor: 'transparent',
  },

  // 生平时光轴 - 其他页面使用白色背景
  timeline: {
    moduleId: 'timeline',
    title: '生平时光轴',
    subtitle: 'Timeline of Life',
    description: '以时间为线索，梳理呈现韬奋先生一生的重要事迹、著述与社会活动，见证其思想的演变与时代的脉搏。',
    accentColor: 'gold',
    layout: 'hero',
    navigation: NAVIGATION_ITEMS,
    logo: {
      showText: true,
      showIcon: true,
    },
    showNavigation: true,
    showMobileMenu: true,
    backgroundColor: 'white',
  },

  // 人物关系 - 其他页面使用白色背景
  relationships: {
    moduleId: 'relationships',
    title: '人物关系',
    subtitle: 'Social Connections',
    description: '探索韬奋先生在其时代背景下的社会网络，包括他的师友、同事、论敌以及他所影响的后辈，揭示思想的碰撞与传承。',
    accentColor: 'blue',
    layout: 'hero',
    navigation: NAVIGATION_ITEMS,
    logo: {
      showText: true,
      showIcon: true,
    },
    showNavigation: true,
    showMobileMenu: true,
    backgroundColor: 'white',
  },

  // 手稿文献 - 其他页面使用白色背景
  handwriting: {
    moduleId: 'handwriting',
    title: '手稿文献',
    subtitle: 'Manuscripts & Documents',
    description: '展出珍贵的韬奋手稿、书信及相关历史文献，通过第一手资料，直观感受其思想的形成过程与人格魅力。',
    accentColor: 'green',
    layout: 'hero',
    navigation: NAVIGATION_ITEMS,
    logo: {
      showText: true,
      showIcon: true,
    },
    showNavigation: true,
    showMobileMenu: true,
    backgroundColor: 'white',
  },

  // 书店经营 - 其他页面使用白色背景
  bookstore: {
    moduleId: 'bookstore',
    title: '书店经营',
    subtitle: 'Bookstore Management',
    description: '聚焦韬奋先生作为卓越出版家的一面，回顾生活书店的创办、发展及其在文化传播中的重要作用。',
    accentColor: 'red',
    layout: 'hero',
    navigation: NAVIGATION_ITEMS,
    logo: {
      showText: true,
      showIcon: true,
    },
    showNavigation: true,
    showMobileMenu: true,
    backgroundColor: 'white',
  },

  // 默认或未知模块 - 其他页面使用白色背景
  default: {
    moduleId: 'default',
    title: '韬奋纪念馆',
    subtitle: 'Taofen Memorial Museum',
    description: '全面了解邹韬奋先生的生平、事业与精神。',
    accentColor: 'gold',
    layout: 'hero',
    navigation: NAVIGATION_ITEMS,
    logo: {
      showText: true,
      showIcon: true,
    },
    showNavigation: true,
    showMobileMenu: true,
    backgroundColor: 'white',
  },
};