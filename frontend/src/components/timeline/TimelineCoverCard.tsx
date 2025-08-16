// TimelineCoverCard.tsx - 时间轴跨轴章首页封面卡
'use client';

import { motion } from 'framer-motion';

interface TimelineCoverCardProps {
  totalEvents: number;
  yearSpan: string; // 例如 "1895-1944"
}

export function TimelineCoverCard({ 
  totalEvents, 
  yearSpan 
}: TimelineCoverCardProps) {
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
      className="relative w-full max-w-5xl mx-auto px-4 md:px-6 lg:px-8 mb-16"
    >
      {/* 跨轴封面卡主体 */}
      <div className="relative timeline-cover-card">
        {/* 轴线穿过效果 - 在卡片下方 */}
        <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 timeline-cover-axis-line z-[1]" />

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
            <h1 className="timeline-cover-main-title">
              邹韬奋传奇人生
            </h1>
            
            {/* 副标题 */}
            <h2 className="timeline-cover-sub-title">
              {yearSpan} 
            </h2>
            
            {/* 描述文字 */}
            <div className="timeline-cover-description max-w-3xl mx-auto">
              从福建永安的书香少年到上海滩的新闻巨擘，从《生活》周刊的创办者到民族救亡的呐喊者，
              这是一段跨越半个世纪的传奇征程。让我们一起追寻这位新闻界先驱的足迹，
              探索他如何用笔杆子为民族解放和社会进步奋斗终生。
            </div>
            
            {/* 引导提示 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="timeline-cover-guide-section"
            >
              <div className="timeline-cover-stats mt-8">
                <div className="timeline-cover-stat-item">
                  <span className="timeline-cover-stat-number">{totalEvents}个</span>
                  <span className="timeline-cover-stat-label">重要事件</span>
                </div>
                <div className="timeline-cover-stat-divider"></div>
                <div className="timeline-cover-stat-item">
                  <span className="timeline-cover-stat-number">49年</span>
                  <span className="timeline-cover-stat-label">传奇年华</span>
                </div>
              </div>
              
              {/* 滚动引导 */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="timeline-cover-scroll-guide"
              >
                {/* <span className="timeline-cover-scroll-text">向下滚动，开始时光之旅</span> */}
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ 
                    duration: 2.5, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="timeline-cover-scroll-arrow"
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
