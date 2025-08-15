/**
 * @file TimelineEventList.tsx
 * @description 时间线事件列表组件 - 简化版本
 * @module TimelineEventList
 */
import React from 'react';
import TimelineEventItem from './TimelineEventItem';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { TimelineData } from '@/hooks/useTimelineData';

interface EventListProps {
  years: TimelineData;
  selectedYear?: string;
}

const TimelineEventList: React.FC<EventListProps> = ({ years, selectedYear }) => {
  // 🐛 调试信息：TimelineEventList组件接收到的原始数据
  console.log('🐛 TimelineEventList Debug:', {
    years,
    yearsLength: years?.length,
    selectedYear,
    yearsSample: years?.[0],
    allCoreEvents: years?.map((coreEvent) => ({ 
      coreEvent: coreEvent.core_event, 
      eventsCount: coreEvent.timeline.length 
    }))
  });

  // 根据选中的年份过滤事件（在原始数据中查找匹配的事件）
  const filteredCoreEvents = selectedYear 
    ? years.filter(coreEvent => {
        return coreEvent.timeline.some(event => event.time.includes(selectedYear));
      })
    : years;

  console.log('🐛 TimelineEventList Debug - 过滤后的数据:', {
    filteredCoreEvents,
    filteredEventsLength: filteredCoreEvents?.length,
    selectedYear
  });

  // 滚动发现体验
  const containerReveal = useScrollReveal({ threshold: 0.1 });

  // 🐛 调试信息：即将渲染
  console.log('🐛 TimelineEventList Debug - 即将渲染:', {
    filteredEventsLength: filteredCoreEvents?.length,
    hasData: filteredCoreEvents && filteredCoreEvents.length > 0,
    firstCoreEvent: filteredCoreEvents?.[0]?.core_event,
    firstCoreEventEvents: filteredCoreEvents?.[0]?.timeline
  });

  return (
    <div className="timeline-event-list">
      <div 
        ref={containerReveal.elementRef}
        className={`space-y-16 scroll-reveal ${containerReveal.isRevealed ? 'revealed' : ''}`}
      >
        {filteredCoreEvents.map((coreEvent, coreIndex) => (
          <section 
            key={coreEvent.core_event}
            className="timeline-core-event-section"
            data-core-event={coreEvent.core_event}
          >
            {/* 核心事件标题 */}
            <div className="core-event-header mb-12 text-center">
              <h2 className="text-3xl font-bold text-blue-900 mb-2">
                {coreEvent.core_event}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-yellow-600 to-blue-900 mx-auto mt-4 rounded-full"></div>
            </div>

            {/* 事件列表 */}
            <div className="core-event-timeline space-y-12">
              {coreEvent.timeline.map((event, eventIndex) => {
                // 提取年份用于data-year属性
                const yearMatch = event.time.match(/(\d{4})年/);
                const year = yearMatch ? yearMatch[1] : '';
                
                return (
                  <div
                    key={`${coreEvent.core_event}-${eventIndex}`}
                    className="timeline-event-item scroll-reveal"
                    data-year={year}
                    style={{ transitionDelay: `${eventIndex * 100}ms` }}
                  >
                    <TimelineEventItem
                      event={event}
                      isFeatured={eventIndex === 0}
                      layout={coreIndex % 2 === 0 ? 'image-left' : 'image-right'}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* 如果没有选中年份，显示快速导航 */}
      {!selectedYear && (
        <div className="quick-nav mt-16 pt-8 border-t border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            快速导航
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {years.map((coreEvent) => {
              // 提取该核心事件中的所有年份用于导航
              const yearsInCoreEvent = coreEvent.timeline
                .map(event => {
                  const yearMatch = event.time.match(/(\d{4})年/);
                  return yearMatch ? yearMatch[1] : null;
                })
                .filter(year => year !== null);
              
              // 获取唯一年份并排序
              const uniqueYears = [...new Set(yearsInCoreEvent)].sort();
              
              return uniqueYears.map(year => (
                <button
                  key={`nav-${coreEvent.core_event}-${year}`}
                  onClick={() => {
                    const element = document.querySelector(`[data-year="${year}"]`);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 text-sm font-medium text-blue-900 hover:bg-blue-900 hover:text-white"
                >
                  {year}年
                </button>
              ));
            }).flat()}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineEventList;