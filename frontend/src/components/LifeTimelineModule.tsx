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
  const [allEvents, setAllEvents] = useState<TimelineEvent[]>([]);
  const [visibleEvents, setVisibleEvents] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 加载时间线数据
  useEffect(() => {
    const loadTimelineData = async () => {
      try {
        const response = await fetch('/data/timeline.json');
        const data: TimelineData = await response.json();
        setTimelineData(data);
        
        // 展平所有事件为单一数组
        const flatEvents: TimelineEvent[] = [];
        data.forEach(coreEvent => {
          coreEvent.timeline.forEach(event => {
            flatEvents.push(event);
          });
        });
        setAllEvents(flatEvents);
      } catch (error) {
        console.error('加载时间线数据失败:', error);
        setTimelineData([]);
        setAllEvents([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadTimelineData();
  }, []);

  // 观察器设置
  useEffect(() => {
    if (allEvents.length === 0) return;
    
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
  }, [allEvents]);

  // 获取核心事件的年份
  const getCoreEventYear = (coreEvent: CoreEvent): string => {
    const firstEvent = coreEvent.timeline.find(event => !event.timespot);
    if (firstEvent) {
      const match = firstEvent.time.match(/(\d{4})/);
      return match ? match[1] : '';
    }
    return '';
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
          width: 2px;
          background: linear-gradient(to bottom, rgba(184, 134, 11, 0.3), #B8860B, rgba(184, 134, 11, 0.3));
          transform: translateX(-50%);
          z-index: 0;
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
        @media (max-width: 768px) {
          .timeline-container::before {
            left: 20px;
          }
          .timeline-dot::before {
            left: 20px;
          }
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
          {allEvents.map((event, index) => (
            <div 
              key={index}
              data-event-index={index}
            >
              <TimelineItem 
                event={event} 
                index={index} 
                isVisible={visibleEvents.has(index)}
              />
            </div>
          ))}
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
  );
}