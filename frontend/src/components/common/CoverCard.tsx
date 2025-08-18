// CoverCard.tsx - 统一封面卡片组件
'use client';

import { motion } from 'framer-motion';
import React from 'react';

export type CoverCardTheme = 'timeline' | 'bookstore';

export interface CoverCardData {
  title: string;
  subtitle?: string;
  description: string;
  stats: Array<{
    value: string;
    label: string;
  }>;
}

export interface CoverCardProps {
  theme: CoverCardTheme;
  data: CoverCardData;
  className?: string;
}

export function CoverCard({ theme, data, className = '' }: CoverCardProps) {
  const themeClass = `${theme}-cover`;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ 
        duration: 0.8, 
        ease: [0.4, 0.0, 0.2, 1],
        delay: 0.2 
      }}
      animate={{
        y: [0, -2, 0],
        scale: [1, 1.005, 1],
      }}
      className={`relative w-full mb-16 cover-card-breathing ${className}`}
    >
      {/* 封面卡主体 */}
      <div className={`relative cover-card ${themeClass}`}>
        {/* 卡片内容 - 居中引导布局 */}
        <div className="relative z-[2] flex flex-col items-center justify-center p-8 lg:p-12 text-center">
          {/* 主内容区域 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            {/* 主标题 */}
            <h1 className="cover-card-main-title">
              {data.title}
            </h1>
            
            {/* 副标题 */}
            {data.subtitle && (
              <h2 className="cover-card-sub-title">
                {data.subtitle}
              </h2>
            )}
            
            {/* 描述文字 */}
            <div className="cover-card-description max-w-3xl mx-auto">
              {data.description}
            </div>
            
            {/* 引导提示 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="cover-card-guide-section"
            >
              <div className="cover-card-stats mt-8">
                {data.stats.map((stat, index) => (
                  <React.Fragment key={index}>
                    <div className={`${themeClass}-stat-item cover-card-stat-item`}>
                      <span className="cover-card-stat-number">{stat.value}</span>
                      <span className="cover-card-stat-label">{stat.label}</span>
                    </div>
                    {index < data.stats.length - 1 && (
                      <div className="cover-card-stat-divider"></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
              
              {/* 滚动引导 */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="cover-card-scroll-guide"
              >
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ 
                    duration: 2.5, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="cover-card-scroll-arrow"
                >
                  <svg 
                    width="24" 
                    height="32" 
                    viewBox="0 0 24 32" 
                    fill="none"
                    className="text-current"
                  >
                    {/* 第一个向下箭头 - 带流动动画 */}
                    <motion.path 
                      d="M6 10l6 6 6-6" 
                      stroke="currentColor" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      animate={{ opacity: [0.3, 0.8, 0.3] }}
                      transition={{ 
                        duration: 2.5, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: 0
                      }}
                    />
                    {/* 第二个向下箭头 - 带流动动画 */}
                    <motion.path 
                      d="M6 18l6 6 6-6" 
                      stroke="currentColor" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      animate={{ opacity: [0.8, 1, 0.8] }}
                      transition={{ 
                        duration: 2.5, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: 0.3
                      }}
                    />
                  </svg>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// 便捷的时间轴卡片组件
export interface TimelineCoverCardProps {
  totalEvents: number;
}

export function TimelineCoverCard({ totalEvents }: TimelineCoverCardProps) {
  return (
    <CoverCard
      theme="timeline"
      data={{
        title: "韬奋·岁月行履",
        description: "从福建永安的书香少年到上海滩的新闻巨擘，从《生活》周刊的创办者到民族救亡的呐喊者，这是一段跨越半个世纪的传奇征程。让我们一起追寻这位新闻界先驱的足迹，探索他如何用笔杆子为民族解放和社会进步奋斗终生。",
        stats: [
          { value: `${totalEvents}个`, label: "重要事件" },
          { value: "49年", label: "传奇年华" }
        ]
      }}
    />
  );
}

// 便捷的书店卡片组件
export interface BookstoreCoverCardProps {
  totalBooks: number;
  featuredCategories: number;
}

export function BookstoreCoverCard({ totalBooks, featuredCategories }: BookstoreCoverCardProps) {
  return (
    <CoverCard
      theme="bookstore"
      data={{
        title: "韬奋·时光书影",
        subtitle: "珍藏经典 · 传承智慧",
        description: "这里收藏着韬奋先生一生的心血结晶，从《生活》周刊的创办到各类经典著作，每一本书都承载着深厚的历史底蕴和文化内涵。让我们一同翻阅这些珍贵的文献，感受那个时代知识分子的家国情怀和思想光芒。",
        stats: [
          { value: `${totalBooks}本`, label: "珍贵藏书" },
          { value: `${featuredCategories}个`, label: "精选分类" }
        ]
      }}
    />
  );
}