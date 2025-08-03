import React, { useEffect, useState, useRef } from 'react';
import { MapPin, ChevronDown, ChevronRight } from 'lucide-react';

// Timeline data interfaces (matching timeline.json structure)
interface TimelineEventData {
  time: string;
  experience: string;
  image: string;
  location: string;
  timespot?: number; // 1 for background events
}

interface CoreEvent {
  core_event: string;
  timeline: TimelineEventData[];
}

interface TimelineData extends Array<CoreEvent> {}

export default function TimelinePage() {
  const [timelineData, setTimelineData] = useState<TimelineData>([]);
  const [expandedEvents, setExpandedEvents] = useState<Set<number>>(new Set());
  const [visibleEvents, setVisibleEvents] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 加载时间线数据
  useEffect(() => {
    const loadTimelineData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/timeline.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch timeline data: ${response.status}`);
        }
        const data: TimelineData = await response.json();
        setTimelineData(data);
      } catch (err) {
        console.error('加载时间线数据失败:', err);
        setError('加载数据失败，请稍后重试');
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
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
          <p className="mt-4 text-charcoal/70">正在加载邹韬奋先生的人生轨迹...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-gold text-cream rounded hover:bg-gold/80 transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-charcoal mb-6 font-serif">邹韬奋人生时间线</h1>
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
                                alt=""
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
                              </div>
                              
                              {event.location && (
                                <div className="text-sm text-charcoal font-bold">
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}