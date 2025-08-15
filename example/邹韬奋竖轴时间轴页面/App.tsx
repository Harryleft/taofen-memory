'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TimelineHeader } from './components/TimelineHeader';
import { TimelineCard } from './components/TimelineCard';
import { TimelineNavigation } from './components/TimelineNavigation';
import { timelineEvents } from './components/timeline-data';

export default function App() {
  const [activeEventId, setActiveEventId] = useState(timelineEvents[0].year.toString());

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      for (const event of timelineEvents) {
        const element = document.getElementById(`event-${event.year}`);
        if (element) {
          const elementTop = element.offsetTop;
          const elementBottom = elementTop + element.offsetHeight;

          if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
            setActiveEventId(event.year.toString());
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleEventClick = (eventId: string) => {
    setActiveEventId(eventId);
  };

  return (
    <div className="min-h-screen timeline-background">
      {/* 页面头部 */}
      <TimelineHeader />

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
          className="text-center mb-20"
        >
          <h2 
            style={{ 
              fontSize: 'var(--text-section)',
              color: 'var(--timeline-primary)'
            }}
            className="font-bold mb-4"
          >
            人生轨迹
          </h2>
          <p 
            style={{ 
              fontSize: 'var(--text-body)',
              color: 'var(--timeline-text-secondary)'
            }}
            className="max-w-2xl mx-auto leading-relaxed"
          >
            从求学青年到新闻巨擘，从文化启蒙到救亡图存，
            邹韬奋用49年的生命书写了一段传奇的人生华章。
          </p>
        </motion.div>

        {/* 时间轴事件卡片 */}
        <div className="relative">
          {timelineEvents.map((event, index) => (
            <TimelineCard
              key={event.id}
              event={event}
              index={index}
              isActive={activeEventId === event.year.toString()}
              onClick={() => handleEventClick(event.year.toString())}
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
            <p 
              style={{ 
                fontSize: 'var(--text-body)',
                color: 'var(--timeline-text-muted)'
              }}
              className="text-center max-w-md leading-relaxed"
            >
              虽然生命短暂，但邹韬奋先生的精神和理想
              <br />
              将永远激励着后人前行
            </p>
          </div>
        </motion.div>
      </div>

      {/* 右侧导航 */}
      <TimelineNavigation
        events={timelineEvents}
        activeEventId={activeEventId}
        onEventClick={handleEventClick}
      />

      {/* 底部信息 */}
      <footer className="bg-[var(--timeline-primary)] text-white py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p 
            style={{ fontSize: 'var(--text-body)' }}
            className="mb-4"
          >
            纪念邹韬奋先生诞辰 {new Date().getFullYear() - 1895} 周年
          </p>
          <p 
            style={{ 
              fontSize: 'var(--text-caption)',
              color: 'rgba(255,255,255,0.7)'
            }}
          >
            "生活的目的在增进人类全体之幸福"
          </p>
        </div>
      </footer>
    </div>
  );
}