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
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_theme(colors.blue.900/0.3)_0%,_transparent_50%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_theme(colors.slate.700/0.2)_0%,_transparent_50%)] pointer-events-none"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-6xl font-light text-white mb-8 tracking-wide">Timeline</h2>
          <p className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed font-light">
            Journey through the pivotal moments that shaped a visionary
          </p>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-white to-transparent mx-auto mt-8"></div>
        </div>

        <div className="relative">
          {/* Main Timeline Line */}
          <div className="absolute left-6 md:left-1/2 md:transform md:-translate-x-px w-px h-full bg-gradient-to-b from-transparent via-slate-600 to-transparent"></div>

          {/* Core Events */}
          <div className="space-y-24">
            {timelineData.map((coreEvent, index) => (
              <div
                key={index}
                data-event-index={index}
                className={`relative transform transition-all duration-1000 ${
                  visibleEvents.has(index)
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-12 opacity-0'
                }`}
              >
                {/* Core Event Node - Asymmetrical positioning */}
                <div className={`flex ${index % 2 === 0 ? 'justify-start md:justify-end md:pr-8' : 'justify-start md:justify-start md:pl-8'} items-center md:items-start`}>
                  <div
                    onClick={() => toggleExpanded(index)}
                    className="relative cursor-pointer group"
                  >
                    {/* Core Event Circle - White accent with blue glow */}
                    <div className="w-6 h-6 bg-white rounded-full shadow-lg shadow-blue-500/20 z-20 relative flex items-center justify-center hover:shadow-blue-400/40 transition-all duration-300 border border-slate-600">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    </div>
                    
                    {/* Expand/Collapse Icon */}
                    <div className="absolute -right-3 -top-1 w-4 h-4 bg-slate-700 rounded-full flex items-center justify-center text-white text-xs border border-slate-600">
                      {expandedEvents.has(index) ? <ChevronDown size={8} /> : <ChevronRight size={8} />}
                    </div>
                  </div>
                </div>

                {/* Core Event Title Card - Asymmetrical */}
                <div className={`mt-6 mb-8 ${index % 2 === 0 ? 'md:pr-16' : 'md:pl-16 md:ml-8'} ml-8 md:ml-0`}>
                  <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-blue-400 font-light text-sm tracking-widest uppercase">
                        {getCoreEventYear(coreEvent)}
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-slate-600 to-transparent"></div>
                    </div>
                    <h3 className="text-2xl font-light text-white mb-2 tracking-wide">
                      {coreEvent.core_event}
                    </h3>
                  </div>
                </div>

                {/* Expanded Timeline Details */}
                {expandedEvents.has(index) && (
                  <div className={`mt-8 space-y-8 ${index % 2 === 0 ? 'md:pr-16' : 'md:pl-16 md:ml-8'} ml-8 md:ml-0`}>
                    {coreEvent.timeline.map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className="relative animate-fade-in"
                        style={{animationDelay: `${eventIndex * 0.1}s`}}
                      >
                        {/* Event Card - Modular design */}
                        <div className="group">
                          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-2xl overflow-hidden shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:border-slate-600/50">
                            {/* Image Section */}
                            {event.image && (
                              <div className="relative h-48 overflow-hidden">
                                <img
                                  src={event.image}
                                  alt={event.time}
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                                
                                {/* Timeline dot overlay */}
                                <div className="absolute top-4 right-4">
                                  <div className={`w-3 h-3 rounded-full border-2 border-white shadow-lg ${
                                    event.timespot ? 'bg-slate-400' : 'bg-blue-400'
                                  }`}></div>
                                </div>
                              </div>
                            )}
                            
                            {/* Content Section */}
                            <div className="p-6 space-y-4">
                              {/* Header */}
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                      event.timespot ? 'bg-slate-400' : 'bg-blue-400'
                                    }`}></div>
                                    <div className="text-white font-light tracking-wide">{event.time}</div>
                                    {event.timespot && (
                                      <div className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded-full border border-slate-600/30">
                                        Background
                                      </div>
                                    )}
                                  </div>
                                  
                                  {event.location && (
                                    <div className="flex items-center text-sm text-slate-400 font-light">
                                      <MapPin size={12} className="mr-2" />
                                      {event.location}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Description */}
                              <p className="text-slate-300 leading-relaxed font-light text-sm">
                                {event.experience}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
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