'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { TimelineEvent } from './timeline-data.ts';
import { ImageWithFallback } from '../../../example/邹韬奋竖轴时间轴页面/components/figma/ImageWithFallback.tsx';

interface TimelineCardProps {
  event: TimelineEvent;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

export function TimelineCard({ event, index, isActive, onClick }: TimelineCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const isLeft = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -50 : 50, y: 20 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay: 0.1,
        ease: [0.4, 0.0, 0.2, 1]
      }}
      className="relative flex justify-center mb-20"
      id={`event-${event.year}`}
    >
      {/* 时间线连接线 */}
      <div className="absolute left-1/2 top-20 w-0.5 h-full -translate-x-0.5 bg-gradient-to-b from-[var(--timeline-secondary)] to-transparent opacity-30" />
      
      {/* 时间节点圆圈 */}
      <motion.div
        whileHover={{ scale: 1.2 }}
        className={`absolute left-1/2 top-20 w-4 h-4 -translate-x-1/2 rounded-full border-4 border-white cursor-pointer z-10 transition-colors duration-300 ${
          isActive 
            ? 'bg-[var(--timeline-secondary)] shadow-lg shadow-[var(--timeline-secondary)]/30' 
            : 'bg-[var(--timeline-primary)] hover:bg-[var(--timeline-secondary)]'
        }`}
        onClick={onClick}
      />

      {/* 内容容器 - 左右交替 */}
      <div className={`flex ${isLeft ? 'flex-row' : 'flex-row-reverse'} items-start gap-16 w-full max-w-6xl timeline-content ${isLeft ? 'justify-start pl-16' : 'justify-end pr-32'}`}>
        {/* 图片区域 */}
        <motion.div
          initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-shrink-0 timeline-image-container"
        >
          <div className="relative w-80 h-60 overflow-hidden rounded-lg border-4 border-[var(--timeline-secondary)] shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group timeline-image"
               onClick={onClick}>
            <ImageWithFallback
              src={event.imageUrl}
              alt={event.title}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
            
            {/* 图片加载骨架屏 */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[var(--timeline-secondary)] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            
            {/* 图片遮罩 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </motion.div>

        {/* 文字区域 */}
        <motion.div
          initial={{ opacity: 0, x: isLeft ? 40 : -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className={`flex-1 min-w-0 cursor-pointer timeline-text ${isLeft ? 'max-w-lg' : 'max-w-xl pr-16'}`}
          onClick={onClick}
        >
          {/* 年份 */}
          <div className={`flex items-center mb-4 ${isLeft ? 'justify-start' : 'justify-end pr-4'}`}>
            <span 
              style={{ 
                fontSize: 'var(--text-body)',
                color: 'var(--timeline-secondary)'
              }}
              className="font-bold"
            >
              {event.year}
            </span>
          </div>

          {/* 标题 */}
          <h3 
            style={{ 
              fontSize: 'var(--text-section)',
              color: 'var(--timeline-primary)'
            }}
            className={`font-bold mb-4 leading-tight hover:text-[var(--timeline-secondary)] transition-colors duration-300 ${
              isLeft ? 'text-left' : 'text-right pr-4'
            }`}
          >
            {event.title}
          </h3>

          {/* 描述 */}
          <p 
            style={{ 
              fontSize: 'var(--text-body)',
              color: 'var(--timeline-text-secondary)',
              lineHeight: '1.7'
            }}
            className={`mb-4 ${isLeft ? 'text-left' : 'text-right pr-4'}`}
          >
            {event.description}
          </p>





          {/* 激活状态指示器 */}
          {isActive && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              className={`h-1 bg-[var(--timeline-secondary)] rounded-full mt-4 ${
                isLeft ? 'origin-left' : 'origin-right'
              }`}
            />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
