import React, { useEffect, useState, useRef } from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TimelineEvent {
  time: string;
  experience: string;
  image: string;
  location: string;
  timespot?: number; // 1 for background events
}

interface CoreEvent {
  core_event: string;
  timeline: TimelineEvent[];
}

interface TimelineData extends Array<CoreEvent> {}

interface LifeEvent {
  id: number;
  year: number;
  date: string;
  title: string;
  description: string;
  location: string;
  category: 'birth' | 'education' | 'career' | 'publication' | 'social' | 'death';
  image: string;
  details: string[];
}


interface LifeTimelineModuleProps {
  className?: string;
}

// Timeline Item Component
interface TimelineItemProps {
  event: TimelineEvent;
  index: number;
  isVisible: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ event, index, isVisible }) => {
  return (
    <div className={`timeline-item mb-16 transform transition-all duration-1000 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
    }`}>
      <div className={`timeline-dot ${event.timespot ? 'timeline-dot-gray' : 'timeline-dot-gold'}`}></div>
      {/* Container for mobile padding */}
      <div className="pl-[45px] md:pl-0">
        {/* Flex container for desktop left-right layout */}
        <div className="md:flex justify-between items-start w-full">
          {/* Left side - Image (always on left) */}
          <div className="md:w-6/12 md:text-right md:pr-2">
            {event.image && (
              <div className="relative group">
                <img 
                  src={event.image}
                  alt=""
                  className="inline-block w-full max-w-xs ml-auto rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            )}
          </div>
          
          {/* Middle separator (desktop only) */}
          <div className="hidden md:block w-12"></div>
          
          {/* Right side - Text content (always on right) */}
          <div className="md:w-6/12 mt-4 md:mt-0">
            <div className="space-y-2">
              {/* Date and location */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <p className="text-sm text-gold font-semibold">
                  {event.time}
                </p>
                {event.location && (
                  <div className="text-sm text-charcoal font-bold">
                    {event.location}
                  </div>
                )}
              </div>
              
              
              {/* Description */}
              <div className="space-y-1">
                <p className="text-charcoal/80 leading-relaxed">
                  {event.experience}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function LifeTimelineModule({ className = '' }: LifeTimelineModuleProps) {
  const [timelineData, setTimelineData] = useState<TimelineData>([]);
  const [expandedCoreEvents, setExpandedCoreEvents] = useState<Set<number>>(new Set());
  const [visibleEvents, setVisibleEvents] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 加载时间线数据
  useEffect(() => {
    const loadTimelineData = async () => {
      try {
        const response = await fetch('/data/timeline.json');
        const data: TimelineData = await response.json();
        setTimelineData(data);
      } catch (error) {
        console.error('加载时间线数据失败:', error);
        setTimelineData([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadTimelineData();
  }, []);

  // 滚动进度条
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 观察器设置
  useEffect(() => {
    if (timelineData.length === 0) return;
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const eventIndex = parseInt(entry.target.getAttribute('data-event-index') || '0');
            setVisibleEvents(prev => new Set([...prev, eventIndex]));
          }
        });
      },
      { threshold: 0.3, rootMargin: '50px' }
    );

    const eventElements = document.querySelectorAll('[data-event-index]');
    eventElements.forEach(el => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, [timelineData, expandedCoreEvents]);

  // 切换核心事件展开状态
  const toggleCoreEvent = (coreEventIndex: number) => {
    setExpandedCoreEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(coreEventIndex)) {
        newSet.delete(coreEventIndex);
      } else {
        newSet.add(coreEventIndex);
      }
      return newSet;
    });
    
    // 平滑滚动到核心事件位置
    setTimeout(() => {
      const element = document.querySelector(`[data-core-event="${coreEventIndex}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };



  if (loading) {
    return (
      <section className={`py-20 bg-cream ${className}`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
            <p className="mt-4 text-charcoal/70">正在加载邹韬奋先生的人生轨迹...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Progress Bar */}
      <div className="timeline-progress">
        <div 
          className="timeline-progress-bar" 
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>
      
      <section className={`py-20 bg-cream ${className}`}>
      {/* Custom timeline styles */}
      <style>{`
        .timeline-container {
          position: relative;
        }
        .timeline-container::before {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 3px;
          background: linear-gradient(to bottom, 
            transparent 0%, 
            rgba(184, 134, 11, 0.2) 10%, 
            rgba(184, 134, 11, 0.6) 30%, 
            #B8860B 50%, 
            rgba(184, 134, 11, 0.6) 70%, 
            rgba(184, 134, 11, 0.2) 90%, 
            transparent 100%
          );
          transform: translateX(-50%);
          z-index: 0;
          border-radius: 2px;
        }
        .timeline-item {
          position: relative;
          z-index: 1;
        }
        .timeline-dot::before {
          content: '';
          position: absolute;
          top: 8px;
          left: 50%;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #B8860B;
          border: 3px solid #FAF7F0;
          box-shadow: 0 0 15px rgba(184, 134, 11, 0.3);
          transform: translateX(-50%);
          z-index: 2;
        }
        .timeline-dot-gray::before {
          background: #9CA3AF;
          box-shadow: 0 0 15px rgba(156, 163, 175, 0.3);
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .core-event-section {
          position: relative;
          margin-bottom: 48px;
          transition: all 0.3s ease;
        }
        .core-event-section::before {
          content: '';
          position: absolute;
          left: 50%;
          top: 0;
          width: 4px;
          height: 100%;
          background: linear-gradient(to bottom, transparent, rgba(184, 134, 11, 0.3), transparent);
          transform: translateX(-50%);
          z-index: 0;
        }
        .core-event-title {
          position: relative;
          background: #FAF7F0;
          padding: 20px 0;
          margin-bottom: 24px;
          z-index: 1;
        }
        .first-event-clickable {
          position: relative;
          cursor: pointer;
          border-radius: 12px;
          padding: 16px;
          margin: -16px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
          overflow: hidden;
        }
        /* 核心事件第一个条目的特殊样式 - 更大的字体和图片 */
        .first-event-clickable .timeline-item {
          transform: scale(1.1);
          margin-bottom: 32px;
        }
        .first-event-clickable img {
          max-width: 420px !important;
          transform: scale(1.15);
          box-shadow: 0 12px 40px rgba(184, 134, 11, 0.25);
        }
        .first-event-clickable .text-sm {
          font-size: 1rem !important;
          font-weight: 600 !important;
        }
        .first-event-clickable .text-charcoal\/80 {
          font-size: 1.125rem !important;
          line-height: 1.75 !important;
          font-weight: 500 !important;
        }
        .first-event-clickable .timeline-dot::before {
          display: none !important;
        }
        .first-event-clickable::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 40px;
          background: linear-gradient(to bottom, transparent, rgba(184, 134, 11, 0.08));
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        .first-event-clickable:not(.expanded)::after {
          opacity: 1;
        }
        .first-event-clickable:hover {
          background: rgba(184, 134, 11, 0.05);
          transform: scale(1.015);
          box-shadow: 0 8px 32px rgba(184, 134, 11, 0.12);
        }
        .first-event-clickable:hover .timeline-dot::before {
          transform: translateX(-50%) scale(1.3);
          box-shadow: 0 0 30px rgba(184, 134, 11, 0.6);
        }
        .expand-indicator {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(184, 134, 11, 0.25), rgba(184, 134, 11, 0.4));
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px solid rgba(184, 134, 11, 0.5);
          backdrop-filter: blur(8px);
          z-index: 10;
          box-shadow: 0 3px 12px rgba(184, 134, 11, 0.25);
        }
        .expand-indicator.expanded {
          transform: translateY(-50%) rotate(180deg);
          background: linear-gradient(135deg, rgba(184, 134, 11, 0.25), rgba(184, 134, 11, 0.35));
          border-color: rgba(184, 134, 11, 0.5);
        }
        .expand-indicator:hover {
          transform: translateY(-50%) scale(1.15);
          background: linear-gradient(135deg, rgba(184, 134, 11, 0.25), rgba(184, 134, 11, 0.35));
          box-shadow: 0 4px 16px rgba(184, 134, 11, 0.3);
        }
        .expand-indicator.expanded:hover {
          transform: translateY(-50%) rotate(180deg) scale(1.15);
        }
        .staggered-animation {
          animation: staggerIn 0.6s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
        }
        @keyframes staggerIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        /* 展开内容中的普通事件样式保持较小 */
        .space-y-6 .timeline-item {
          transform: scale(0.95);
        }
        .space-y-6 .timeline-item img {
          max-width: 280px !important;
          transform: scale(0.85) !important;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
        }
        .space-y-6 .timeline-item .text-sm {
          font-size: 0.8rem !important;
          font-weight: 500 !important;
        }
        .space-y-6 .timeline-item .text-charcoal\/80 {
          font-size: 0.9rem !important;
          line-height: 1.5 !important;
          font-weight: 400 !important;
        }
        .space-y-6 .timeline-item .timeline-dot::before {
          width: 12px !important;
          height: 12px !important;
          border-width: 2px !important;
          box-shadow: 0 0 10px rgba(184, 134, 11, 0.2) !important;
        }
        @media (max-width: 768px) {
          .timeline-container::before {
            left: 20px;
          }
          .timeline-dot::before {
            left: 20px;
          }
          .core-event-section {
            margin-bottom: 36px;
          }
          .core-event-title {
            padding: 16px 0;
            margin-bottom: 20px;
          }
          .first-event-clickable {
            margin: -12px;
            padding: 12px;
          }
          .expand-indicator {
            right: 4px;
            width: 24px;
            height: 24px;
          }
          .expand-indicator svg {
            width: 10px;
            height: 10px;
          }
        }
        .timeline-progress {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: rgba(184, 134, 11, 0.2);
          z-index: 1000;
        }
        .timeline-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #B8860B, #DAA520);
          transition: width 0.3s ease;
        }
      `}</style>
      
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-charcoal mb-6 font-serif">人生大事</h2>
          <p className="text-xl text-charcoal/70 max-w-3xl mx-auto leading-relaxed">
            追溯邹韬奋先生的人生轨迹，感受一位文化先驱的成长历程与时代担当
          </p>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-8"></div>
        </div>

        <div className="timeline-container">
          {timelineData.map((coreEvent, coreIndex) => {
            const isExpanded = expandedCoreEvents.has(coreIndex);
            const firstEvent = coreEvent.timeline[0]; // 每个timeline的第一个条目
            
            return (
              <div key={coreIndex} className="core-event-section" data-core-event={coreIndex}>
                {/* Core Event Title */}
                <div className="core-event-title text-center">
                  <h3 className="text-3xl font-bold text-charcoal font-serif mb-2">
                    {coreEvent.core_event}
                  </h3>
                </div>
                
                {/* First Event - Always Visible and Clickable */}
                <div 
                  data-event-index={`${coreIndex}-first`}
                  className={`first-event-clickable ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => toggleCoreEvent(coreIndex)}
                >
                  <div className="timeline-item mb-6">
                    <div className={`timeline-dot ${firstEvent.timespot ? 'timeline-dot-gray' : 'timeline-dot-gold'}`}></div>
                    <div className="pl-[45px] md:pl-0">
                      <div className="md:flex justify-between items-start w-full">
                        {/* Left side - Image */}
                        <div className="md:w-6/12 md:text-right md:pr-2">
                          {firstEvent.image && (
                            <div className="relative group">
                              <img 
                                src={firstEvent.image}
                                alt=""
                                className="inline-block w-full max-w-xs ml-auto rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                          )}
                        </div>
                        
                        {/* Middle separator */}
                        <div className="hidden md:block w-12"></div>
                        
                        {/* Right side - Text content */}
                        <div className="md:w-6/12 mt-4 md:mt-0 relative">
                          <div className="space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <p className="text-sm text-gold font-semibold">
                                {firstEvent.time}
                              </p>
                              {firstEvent.location && (
                                <div className="text-sm text-charcoal font-bold">
                                  {firstEvent.location}
                                </div>
                              )}
                            </div>
                            <div className="space-y-1">
                              <p className="text-charcoal/80 leading-relaxed pr-10">
                                {firstEvent.experience}
                              </p>
                            </div>
                          </div>
                          {/* Expand indicator */}
                          <div className={`expand-indicator ${isExpanded ? 'expanded' : ''}`}>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M3 4.5L6 7.5L9 4.5" stroke="#B8860B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Expanded Content - Rest of Timeline Events */}
                {isExpanded && (
                  <div className="space-y-6 animate-fadeIn mt-8">
                    <div className="text-center mb-6">
                      <p className="text-sm text-charcoal/70 font-medium">详细时间线</p>
                    </div>
                    {coreEvent.timeline.slice(1).map((event, eventIndex) => (
                      <div 
                        key={`${coreIndex}-${eventIndex + 1}`}
                        data-event-index={`${coreIndex}-${eventIndex + 1}`}
                        className="staggered-animation"
                        style={{ animationDelay: `${eventIndex * 0.1}s` }}
                      >
                        <TimelineItem 
                          event={event} 
                          index={eventIndex + 1} 
                          isVisible={true}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 查看完整时间线按钮 */}
        <div className="text-center mt-16">
          <Link
            to="/timeline"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gold text-cream rounded-xl font-semibold text-lg hover:bg-gold/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            查看完整时间线
            <ArrowRight size={20} />
          </Link>
          <p className="text-charcoal/60 mt-4 text-sm">
            探索邹韬奋先生完整的人生历程
          </p>
        </div>
      </div>
    </section>
    </>
  );
}