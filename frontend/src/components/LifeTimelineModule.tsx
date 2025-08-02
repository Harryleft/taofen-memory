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
  const isEven = index % 2 === 0;
  
  return (
    <div className={`timeline-item mb-20 transform transition-all duration-1000 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
    }`}>
      <div className="timeline-dot"></div>
      {/* Container for mobile padding */}
      <div className="pl-[45px] md:pl-0">
        {/* Flex container for desktop left-right layout */}
        <div className="md:flex justify-between items-start w-full">
          {/* Left side - Image (alternates with text on desktop) */}
          <div className={`md:w-5/12 ${
            isEven ? 'md:order-1 md:text-right' : 'md:order-3 md:text-left'
          }`}>
            {event.image && (
              <div className="relative group">
                <img 
                  src={event.image}
                  alt={event.time}
                  className="inline-block w-full max-w-md rounded-2xl shadow-2xl transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent rounded-2xl"></div>
                {/* Timeline indicator on image */}
                <div className="absolute top-4 right-4">
                  <div className={`w-3 h-3 rounded-full border-2 border-white shadow-lg ${
                    event.timespot ? 'bg-slate-400' : 'bg-blue-400'
                  }`}></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Middle separator (desktop only) */}
          <div className="hidden md:block w-2/12 md:order-2"></div>
          
          {/* Right side - Text content (alternates with image) */}
          <div className={`md:w-5/12 mt-6 md:mt-0 ${
            isEven ? 'md:order-3' : 'md:order-1'
          }`}>
            <div className="space-y-4">
              {/* Date and location */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <p className="text-sm text-blue-400 font-light tracking-widest uppercase">
                  {event.time}
                </p>
                {event.location && (
                  <>
                    <span className="hidden sm:block text-slate-600">•</span>
                    <div className="flex items-center text-sm text-slate-400 font-light">
                      <MapPin size={12} className="mr-1" />
                      {event.location}
                    </div>
                  </>
                )}
              </div>
              
              {/* Event type badge */}
              {event.timespot && (
                <div className="inline-block">
                  <span className="text-xs bg-slate-700/50 text-slate-300 px-3 py-1 rounded-full border border-slate-600/30">
                    Background Event
                  </span>
                </div>
              )}
              
              {/* Description */}
              <div className="space-y-3">
                <p className="text-slate-200 leading-relaxed font-light">
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
      <section className={`py-24 bg-slate-900 min-h-screen ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-t-white/20 rounded-full animate-spin mx-auto"></div>
            </div>
            <p className="mt-8 text-slate-300 font-light tracking-wide">Loading timeline data...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-24 bg-slate-900 min-h-screen ${className}`}>
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
          background: linear-gradient(to bottom, transparent, #475569, transparent);
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
          background: #60a5fa;
          border: 3px solid #0f172a;
          box-shadow: 0 0 20px rgba(96, 165, 250, 0.4);
          transform: translateX(-50%);
          z-index: 2;
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
      
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_theme(colors.blue.900/0.3)_0%,_transparent_50%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_theme(colors.slate.700/0.2)_0%,_transparent_50%)] pointer-events-none"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-6xl font-light text-white mb-8 tracking-wide">Life Journey</h2>
          <p className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed font-light">
            The pivotal moments that shaped a revolutionary mind
          </p>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-white to-transparent mx-auto mt-8"></div>
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
        <div className="text-center mt-20">
          <Link
            to="/timeline"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-600 text-white rounded-2xl font-light text-lg hover:from-slate-600 hover:to-slate-500 transition-all duration-500 shadow-2xl hover:shadow-blue-500/20 transform hover:-translate-y-1 border border-slate-600/50 backdrop-blur-sm"
          >
            <span className="tracking-wide">Explore Complete Timeline</span>
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="text-slate-400 mt-6 text-sm font-light tracking-wide">
            Discover the complete journey through time
          </p>
        </div>
      </div>
    </section>
  );
}