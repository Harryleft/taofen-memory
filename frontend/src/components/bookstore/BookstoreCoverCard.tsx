// BookstoreCoverCard.tsx - 书店页面封面卡
'use client';

import { motion } from 'framer-motion';

interface BookstoreCoverCardProps {
  totalBooks: number;
  featuredCategories: number;
}

export function BookstoreCoverCard({ 
  totalBooks,
  featuredCategories 
}: BookstoreCoverCardProps) {
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
      className="relative w-full max-w-5xl mx-auto px-4 md:px-6 lg:px-8 mb-16 cover-card-breathing"
    >
      {/* 书店封面卡主体 */}
      <div className="relative cover-card bookstore-cover">
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
              韬奋·时光书影
            </h1>
            
            {/* 副标题 */}
            <h2 className="cover-card-sub-title">
              珍藏经典 · 传承智慧
            </h2>
            
            {/* 描述文字 */}
            <div className="cover-card-description max-w-3xl mx-auto">
              这里收藏着韬奋先生一生的心血结晶，从《生活》周刊的创办到各类经典著作，
              每一本书都承载着深厚的历史底蕴和文化内涵。让我们一同翻阅这些珍贵的文献，
              感受那个时代知识分子的家国情怀和思想光芒。
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
                <div className="bookstore-cover-stat-item">
                  <span className="cover-card-stat-number">{totalBooks}本</span>
                  <span className="cover-card-stat-label">珍贵藏书</span>
                </div>
                <div className="cover-card-stat-divider"></div>
                <div className="bookstore-cover-stat-item">
                  <span className="cover-card-stat-number">{featuredCategories}个</span>
                  <span className="cover-card-stat-label">精选分类</span>
                </div>
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