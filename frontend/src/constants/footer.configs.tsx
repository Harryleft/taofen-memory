import { FooterConfig, defaultFooterConfig } from '../components/layout/footer/types';

// 统一的 Footer 配置 - 目前所有页面使用相同的配置
export const footerConfigs: Record<string, FooterConfig> = {
  // 首页
  home: {
    ...defaultFooterConfig,
    brand: {
      ...defaultFooterConfig.brand,
      description: '传承韬奋精神，弘扬文化传统 - 全面了解邹韬奋先生的生平、事业与精神',
    },
  },

  // 生平时光轴
  timeline: {
    ...defaultFooterConfig,
    brand: {
      ...defaultFooterConfig.brand,
      description: '以时间为线索，梳理呈现韬奋先生一生的重要事迹与思想演变',
    },
  },

  // 人物关系
  relationships: {
    ...defaultFooterConfig,
    brand: {
      ...defaultFooterConfig.brand,
      description: '探索韬奋先生在其时代背景下的社会网络与思想传承',
    },
  },

  // 手稿文献
  handwriting: {
    ...defaultFooterConfig,
    brand: {
      ...defaultFooterConfig.brand,
      description: '展出珍贵的韬奋手稿、书信及相关历史文献',
    },
  },

  // 书店经营
  bookstore: {
    ...defaultFooterConfig,
    brand: {
      ...defaultFooterConfig.brand,
      description: '聚焦韬奋先生作为卓越出版家的一面，回顾生活书店的发展历程',
    },
  },

  // 默认或未知模块
  default: {
    ...defaultFooterConfig,
  },
};