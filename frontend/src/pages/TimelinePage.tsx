'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AppHeader from '../components/layout/header/AppHeader';
import { ZoutaofenFooter } from '../components/layout/footer/ZoutaofenFooter';
import { TimelineCard } from '../components/timeline/TimelineCard.tsx';
import { TimelineNavigation } from '../components/timeline/TimelineNavigation.tsx';
import { useTimelineData } from '../hooks/useTimelineData.ts';

export default function TimelinePage() {
  const { timelineData, loading, error } = useTimelineData();
  const [activeEventId, setActiveEventId] = useState<string>('1895');

  useEffect(() => {
    if (timelineData.length > 0) {
      setActiveEventId(timelineData[0].id);
    }
  }, [timelineData]);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollPosition = window.scrollY + window.innerHeight / 2;
          
          for (const event of timelineData) {
            const element = document.getElementById(`event-${event.id}`);
            if (element) {
              const elementTop = element.offsetTop;
              const elementBottom = elementTop + element.offsetHeight;
              
              if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
                setActiveEventId(event.id);
                break;
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [timelineData]);

  const handleEventClick = (eventId: string) => {
    setActiveEventId(eventId);
  };

      {/* 加载状态处理 */}
  if (loading) {
    return (
      <div className="min-h-screen timeline-background flex items-center justify-center">
        <AppHeader moduleId="timeline" />
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--timeline-secondary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="timeline-text-secondary">
            加载时间线数据中...
          </p>
        </div>
      </div>
    );
  }

      {/* 错误状态处理 */}
  if (error) {
    return (
      <div className="min-h-screen timeline-background flex items-center justify-center">
        <AppHeader moduleId="timeline" />
        <div className="text-center">
          <p className="timeline-text-secondary mb-4">
            加载失败：{error.message}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[var(--timeline-secondary)] text-white rounded hover:opacity-80 transition-opacity"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

      {/* 空数据状态处理 */}
  if (timelineData.length === 0) {
    return (
      <div className="min-h-screen timeline-background flex items-center justify-center">
        <AppHeader moduleId="timeline" />
        <div className="text-center">
          <p className="timeline-text-secondary">
            暂无时间线数据
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen timeline-background">
      {/* 页面头部 */}
      <AppHeader moduleId="timeline" />

      {/* 时间轴主内容 */}
      <div className="relative max-w-screen-2xl mx-auto px-1 py-20">
        {/* 中央时间线 */}
        <div className="absolute left-1/2 top-0 w-0.5 h-full -translate-x-0.5 bg-gradient-to-b from-[var(--timeline-secondary)] via-[var(--timeline-primary)] to-[var(--timeline-secondary)] opacity-20" />

        {/* 时间轴标题 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20 pt-24"
        >
          <h2 className="font-bold mb-4 timeline-primary timeline-text-section">
            人生轨迹
          </h2>
          <p className="max-w-2xl mx-auto leading-relaxed timeline-text-secondary timeline-text-body">
            从求学青年到新闻巨擘，从文化启蒙到救亡图存，
            邹韬奋用49年的生命书写了一段传奇的人生华章。
          </p>
        </motion.div>

        {/* 时间轴事件卡片 */}
        <div className="relative">
          {timelineData.map((event, index) => (
            <TimelineCard
              key={event.id}
              event={event}
              index={index}
              isActive={activeEventId === event.id}
              onClick={() => handleEventClick(event.id)}
            />
          ))}
        </div>

        {/* 结束装饰 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mt-20"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-[var(--timeline-secondary)] flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-white" />
            </div>
            <p className="text-center max-w-md leading-relaxed timeline-text-muted timeline-text-body">
              虽然生命短暂，但邹韬奋先生的精神和理想
              <br />
              将永远激励着后人前行
            </p>
          </div>
        </motion.div>
      </div>

      {/* 右侧导航 */}
      <TimelineNavigation
        events={timelineData}
        activeEventId={activeEventId}
        onEventClick={handleEventClick}
      />

      {/* 底部信息 */}
      <ZoutaofenFooter version="responsive" />
    </div>
  );
}
