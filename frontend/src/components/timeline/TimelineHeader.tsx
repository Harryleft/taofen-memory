'use client';

import { motion } from 'framer-motion';
// import { ImageWithFallback } from '../../../example/邹韬奋竖轴时间轴页面/components/figma/ImageWithFallback.tsx';

export function TimelineHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }}
      className="relative timeline-background min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* 背景装饰 */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-[var(--timeline-secondary)] opacity-10" />
        <div className="absolute bottom-20 right-20 w-24 h-24 rounded-full bg-[var(--timeline-primary)] opacity-10" />
        <div className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-[var(--timeline-secondary)] opacity-10" />
      </div>
    </motion.div>
  );
}
