import React from 'react';
import { HeaderConfig } from '../components/layout/header/BaseHeader';

// 生平时光轴模块的专属装饰元素
const TimelineDecorativeElement = (
  <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200 -z-10" />
);

// 人物关系模块的专属装饰元素
const RelationshipsDecorativeElement = (
  <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
);

// 手稿文献模块的专属装饰元素
const HandwritingDecorativeElement = (
  <div className="absolute bottom-0 left-1/4 w-24 h-24 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
);

// 定义所有模块的 Header 配置
export const headerConfigs: Record<string, HeaderConfig> = {
  // 生平时光轴
  timeline: {
    moduleId: 'timeline',
    title: '生平时光轴',
    subtitle: 'Timeline of Life',
    description: '以时间为线索，梳理呈现韬奋先生一生的重要事迹、著述与社会活动，见证其思想的演变与时代的脉搏。',
    accentColor: 'gold',
    culturalElement: {
      text: '流光一瞬，思想永恒',
      position: 'top',
    },
    decorativeElement: TimelineDecorativeElement,
  },

  // 人物关系
  relationships: {
    moduleId: 'relationships',
    title: '人物关系',
    subtitle: 'Social Connections',
    description: '探索韬奋先生在其时代背景下的社会网络，包括他的师友、同事、论敌以及他所影响的后辈，揭示思想的碰撞与传承。',
    accentColor: 'blue',
    culturalElement: {
      text: '观其友，知其人',
      position: 'bottom',
    },
    decorativeElement: RelationshipsDecorativeElement,
  },

  // 手稿文献
  handwriting: {
    moduleId: 'handwriting',
    title: '手稿文献',
    subtitle: 'Manuscripts & Documents',
    description: '展出珍贵的韬奋手稿、书信及相关历史文献，通过第一手资料，直观感受其思想的形成过程与人格魅力。',
    accentColor: 'green',
    culturalElement: {
      text: '字里行间，尽是风骨',
      position: 'top',
    },
    decorativeElement: HandwritingDecorativeElement,
  },

  // 书店经营
  bookstore: {
    moduleId: 'bookstore',
    title: '书店经营',
    subtitle: 'Bookstore Management',
    description: '聚焦韬奋先生作为卓越出版家的一面，回顾生活书店的创办、发展及其在文化传播中的重要作用。',
    accentColor: 'red',
  },

  // 默认或未知模块
  default: {
    moduleId: 'default',
    title: '韬奋纪念馆',
    subtitle: 'Taofen Memorial Museum',
    description: '全面了解邹韬奋先生的生平、事业与精神。',
    accentColor: 'gold',
  },
};