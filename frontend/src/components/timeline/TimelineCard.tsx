'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { TimelineEvent } from './timeline-data.ts';
import { ImageWithFallback } from './ImageWithFallback';

interface TimelineCardProps {
  event: TimelineEvent;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

export function TimelineCard({ event, index, isActive, onClick }: TimelineCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const isLeft = index % 2 === 0;

  // 检查是否有有效的图片URL
  const hasValidImage = event.imageUrl && event.imageUrl.trim() !== '';

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
      id={`event-${event.id}`}
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

      {/* 内容容器 - Linus式CSS Grid布局系统 */}
      <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-x-6 md:gap-x-8 lg:gap-x-12 xl:gap-x-16 gap-y-0 max-w-6xl md:max-w-7xl mx-auto px-4 md:px-6 lg:px-8 xl:px-12 w-full">
        {/* 图片区域 - 基于比例分配空间 */}
        <motion.div
          initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`${isLeft ? 'lg:order-1' : 'lg:order-2'} w-full max-w-md mx-auto lg:mx-0 timeline-image-container`}
        >
          {hasValidImage && !imageError ? (
            <div className="relative w-full h-60 overflow-hidden rounded-lg border-4 border-[var(--timeline-secondary)] shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group timeline-image"
                 onClick={onClick}>
              <ImageWithFallback
                src={event.imageUrl}
                alt={event.title}
                className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
              
              {/* 图片加载骨架屏 */}
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-[var(--timeline-secondary)] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              
              {/* 图片遮罩 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ) : (
            /* 无图片时保留空间 */
            <div className="w-full h-60 invisible" />
          )}
        </motion.div>

        {/* 文字区域 - 基于比例分配空间 */}
        <motion.div
          initial={{ opacity: 0, x: isLeft ? 40 : -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className={`${isLeft ? 'lg:order-2' : 'lg:order-1'} w-full max-w-4xl mx-auto lg:mx-0 cursor-pointer timeline-text`}
          onClick={onClick}
        >
          {/* 年份和地点 */}
          <div className={`flex items-center gap-3 mb-4 ${isLeft ? 'lg:justify-start justify-center' : 'lg:justify-end justify-center'} lg:pr-0 pr-4`}>
            <span className="font-bold timeline-secondary timeline-text-body">
              {event.year}
            </span>
            {event.location && event.location.trim() !== '' && (
              <span className="font-bold timeline-secondary timeline-text-body">
                {event.location}
              </span>
            )}
          </div>

          {/* 描述 */}
          <p className={`mb-4 ${isLeft ? 'lg:text-left text-center' : 'lg:text-right text-center'} timeline-text-secondary timeline-text-body timeline-line-height-relaxed lg:pr-0 pr-4`}
          >
            {event.description}
          </p>

          {/* 激活状态指示器 */}
          {isActive && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              className={`h-1 bg-[var(--timeline-secondary)] rounded-full mt-4 ${
                isLeft ? 'lg:origin-left origin-center' : 'lg:origin-right origin-center'
              }`}
            />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
