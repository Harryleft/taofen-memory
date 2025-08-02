import React, { useEffect, useState, useRef } from 'react';
import { Calendar, MapPin, BookOpen, Users, Award, Heart, ArrowRight, ChevronDown, ChevronRight } from 'lucide-react';
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

export default function LifeTimelineModule({ className = '' }: LifeTimelineModuleProps) {
  const [timelineData, setTimelineData] = useState<TimelineData>([]);
  const [expandedEvents, setExpandedEvents] = useState<Set<number>>(new Set());
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
      } catch (error) {
        console.error('加载时间线数据失败:', error);
        // 使用默认数据
        setTimelineData([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadTimelineData();
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
  }, [timelineData]);

  // 切换展开状态
  const toggleExpanded = (index: number) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

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
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-charcoal mb-6 font-serif">人生大事</h2>
          <p className="text-xl text-charcoal/70 max-w-3xl mx-auto leading-relaxed">
            追溯邹韬奋先生的人生轨迹，感受一位文化先驱的成长历程与时代担当
          </p>
          <p className="text-sm text-charcoal/50 mt-4">
            点击红色核心事件节点展开详细时间线
          </p>
        </div>

        <div className="relative">
          {/* Main Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-gold/30 via-gold to-gold/30"></div>

          {/* Core Events */}
          <div className="space-y-32">
            {timelineData.map((coreEvent, index) => (
              <div
                key={index}
                data-event-index={index}
                className={`relative transform transition-all duration-1000 ${
                  visibleEvents.has(index)
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-8 opacity-0'
                }`}
              >
                {/* Core Event Node */}
                <div className="flex items-center justify-center">
                  <div
                    onClick={() => toggleExpanded(index)}
                    className="relative cursor-pointer group"
                  >
                    {/* Core Event Circle - 红色 */}
                    <div className="w-16 h-16 bg-red-500 rounded-full border-4 border-cream shadow-lg z-20 relative flex items-center justify-center hover:bg-red-600 transition-colors">
                      <div className="text-white font-bold text-xs text-center leading-tight">
                        {getCoreEventYear(coreEvent)}
                      </div>
                    </div>
                    
                    {/* Expand/Collapse Icon */}
                    <div className="absolute -right-2 -top-2 w-6 h-6 bg-gold rounded-full flex items-center justify-center text-cream text-xs">
                      {expandedEvents.has(index) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </div>
                  </div>
                </div>

                {/* Core Event Title */}
                <div className="text-center mt-4 mb-8">
                  <h3 className="text-2xl font-bold text-charcoal font-serif">
                    {coreEvent.core_event}
                  </h3>
                  <div className="text-gold font-semibold text-lg mt-1">
                    {getCoreEventYear(coreEvent)}年
                  </div>
                </div>

                {/* Expanded Timeline Details */}
                {expandedEvents.has(index) && (
                  <div className="mt-8 space-y-6">
                    {coreEvent.timeline.map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className="relative"
                      >
                        {/* Event Item - 响应式布局：桌面端左图右文，移动端上图下文 */}
                        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
                          {/* 图片部分 */}
                          {event.image && (
                            <div className="flex-shrink-0 w-full md:w-32 h-48 md:h-32">
                              <img
                                src={event.image}
                                alt={event.time}
                                className="w-full h-full object-cover rounded-lg shadow-md"
                              />
                            </div>
                          )}
                          
                          {/* 内容部分 */}
                          <div className={`flex-1 rounded-xl shadow-md p-4 md:p-6 border-l-4 ${
                            event.timespot 
                              ? 'bg-gray-50 border-gray-400' // 背景故事 - 灰色
                              : 'bg-red-50 border-red-400'   // 核心故事 - 红色
                          }`}>
                            {/* 时间和地点部分 - 上方 */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 pb-3 border-b border-gray-200">
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${
                                  event.timespot ? 'bg-gray-400' : 'bg-red-500'
                                }`}></div>
                                <div className="font-bold text-charcoal text-lg">{event.time}</div>
                                {event.timespot && (
                                  <div className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                                    历史背景
                                  </div>
                                )}
                              </div>
                              
                              {event.location && (
                                <div className="flex items-center text-sm text-charcoal/60">
                                  <MapPin size={14} className="mr-1" />
                                  {event.location}
                                </div>
                              )}
                            </div>
                            
                            {/* 文字内容部分 - 下方 */}
                            <p className="text-charcoal/80 leading-relaxed">
                              {event.experience}
                            </p>
                          </div>
                        </div>

                        {/* Sub-timeline Node */}
                        <div className={`absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full border-2 border-cream shadow-md z-10 ${
                          event.timespot ? 'bg-gray-400' : 'bg-red-500'
                        }`}></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
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