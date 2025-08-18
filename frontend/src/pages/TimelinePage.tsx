'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import AppHeader from '@/components/layout/header/AppHeader';
import { ZoutaofenFooter } from '@/components/layout/footer/ZoutaofenFooter';
import { TimelineCard } from '@/components/timeline/TimelineCard.tsx';
import { TimelineCoverCard } from '@/components/common/CoverCard.tsx';
import { TimelineNavigation } from '@/components/timeline/TimelineNavigation.tsx';
import { useTimelineData } from '@/hooks/useTimelineData.ts';

export default function TimelinePage() {
  const { timelineData, loading, error } = useTimelineData();
  const [activeEventId, setActiveEventId] = useState<string>('1895');
  const coverCardRef = useRef<HTMLDivElement>(null);
  const [coverCardHeight, setCoverCardHeight] = useState(0);

  
  useEffect(() => {
    if (timelineData.length > 0) {
      setActiveEventId(String(timelineData[0].id));
    }
  }, [timelineData]);

  // 获取封面卡高度
  useLayoutEffect(() => {
    const updateCoverCardHeight = () => {
      if (coverCardRef.current) {
        setCoverCardHeight(coverCardRef.current.offsetHeight);
      }
    };

    updateCoverCardHeight();
    window.addEventListener('resize', updateCoverCardHeight);
    return () => window.removeEventListener('resize', updateCoverCardHeight);
  }, []);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // 减去封面卡高度，确保导航与实际显示的事件对应
          const scrollPosition = window.scrollY + window.innerHeight / 2 - coverCardHeight;
          
          for (const event of timelineData) {
            // 获取文字区域元素，而不是整个卡片
            const textElement = document.querySelector(`[data-text-region="event-${event.id}"]`);
            if (textElement) {
              const textRect = textElement.getBoundingClientRect();
              const elementTop = textRect.top + window.scrollY - coverCardHeight;
              const elementBottom = elementTop + textRect.height;
              
              if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
                setActiveEventId(String(event.id));
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
  }, [timelineData, coverCardHeight]);

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
      <div className="relative max-w-screen-2xl mx-auto px-1 pt-32 pb-20">
      {/* 中央时间线 */}
        {/* <div className="absolute left-1/2 top-0 w-0.5 h-full -translate-x-0.5 bg-gradient-to-b from-[var(--timeline-secondary)] via-[var(--timeline-primary)] to-[var(--timeline-secondary)] opacity-20" /> */}

        {/* 跨轴章首页封面卡 - 替代页面标题 */}
        {timelineData.length > 0 && (
          <div ref={coverCardRef}>
            <TimelineCoverCard
              totalEvents={timelineData.length}
            />
          </div>
        )}

        {/* 时间轴事件卡片 - 与封面卡保持节拍间距 */}
        <div className="relative mt-16">
          {/* {console.log('[DEBUG] 渲染TimelineCard事件卡片 - 事件数量:', timelineData.length)} */}
          {timelineData.map((event, index) => (
            <div key={event.id}>
              {/* {console.log(`[DEBUG] 渲染事件卡片 ${index}:`, event.id, event.title)} */}
              <TimelineCard
                event={event}
                index={index}
                isActive={activeEventId === String(event.id)}
                isFirstEvent={index === 0}
                isLastEvent={index === timelineData.length - 1}
                onClick={() => handleEventClick(String(event.id))}
              />
            </div>
          ))}
        </div>

        {/* 结束装饰 - 与轴线对齐 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mt-20 relative"
        >
          {/* 轴线连接到装饰圆点 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 bg-gradient-to-b from-[var(--timeline-secondary)]/10 to-[var(--timeline-secondary)]/50" />
          
          <div className="flex flex-col items-center gap-6">
            {/* 装饰性圆点 - 轴线终点 */}
            <div className="w-8 h-8 rounded-full bg-[var(--timeline-secondary)] flex items-center justify-center shadow-lg relative z-10">
              <div className="w-3 h-3 rounded-full bg-white" />
            </div>
            
            {/* 主标题 */}
            <h3 className="text-center text-lg font-semibold timeline-primary timeline-text-body">
              精神永存，理想不灭
            </h3>
            
            {/* 总结文字 */}
            <div className="text-center max-w-lg leading-relaxed">
              <p className="timeline-text-secondary timeline-text-body mb-2">
                邹韬奋先生以笔为剑，以文为盾
              </p>
              <p className="timeline-text-secondary timeline-text-body">
                他的精神与理想，将永远激励着后人前行
              </p>
            </div>
                      
          </div>
        </motion.div>
      </div>

      {/* 右侧导航 */}
      {/* {console.log('[DEBUG] 渲染TimelineNavigation - 事件数量:', timelineData.length)} */}
      <TimelineNavigation
        events={timelineData}
        activeEventId={activeEventId}
      />

      {/* 底部信息 */}
      <ZoutaofenFooter version="responsive" />
    </div>
  );
}
