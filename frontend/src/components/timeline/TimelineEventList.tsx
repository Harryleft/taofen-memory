/**
 * @file TimelineEventList.tsx
 * @description 时间线事件列表组件 - 简化版本
 * @module TimelineEventList
 */
import React from 'react';
import TimelineEventItem from './TimelineEventItem';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface TimelineYear {
  year: string;
  label: string;
  events: Array<{
    time: string;
    experience: string;
    image: string;
    location: string;
    timespot?: number;
  }>;
}

interface EventListProps {
  years: TimelineYear[];
  selectedYear?: string;
}

const TimelineEventList: React.FC<EventListProps> = ({ years, selectedYear }) => {
  // 🐛 调试信息：TimelineEventList组件接收到的数据
  console.log('🐛 TimelineEventList Debug:', {
    years,
    yearsLength: years?.length,
    selectedYear,
    yearsSample: years?.[0],
    allYears: years?.map(y => ({ year: y.year, eventsCount: y.events.length }))
  });

  // 根据选中的年份过滤事件
  const filteredYears = selectedYear 
    ? years.filter(year => year.year === selectedYear)
    : years;

  console.log('🐛 TimelineEventList Debug - 过滤后的数据:', {
    filteredYears,
    filteredYearsLength: filteredYears?.length,
    selectedYear
  });

  // 滚动发现体验
  const containerReveal = useScrollReveal({ threshold: 0.1 });

  // 🐛 调试信息：即将渲染
  console.log('🐛 TimelineEventList Debug - 即将渲染:', {
    filteredYearsLength: filteredYears?.length,
    hasData: filteredYears && filteredYears.length > 0,
    firstYear: filteredYears?.[0]?.year,
    firstYearEvents: filteredYears?.[0]?.events
  });

  return (
    <div className="timeline-event-list">
      <div 
        ref={containerReveal.elementRef}
        className={`space-y-16 scroll-reveal ${containerReveal.isRevealed ? 'revealed' : ''}`}
      >
        {filteredYears.map((yearData, yearIndex) => (
          <section 
            key={yearData.year}
            className="timeline-year-section"
            data-year={yearData.year}
          >
            {/* 年份标题 */}
            <div className="year-header mb-12 text-center">
              <h2 className="text-3xl font-bold text-blue-900 mb-2">
                {yearData.year}年
              </h2>
              <p className="text-lg text-gray-600">
                {yearData.label}
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-yellow-600 to-blue-900 mx-auto mt-4 rounded-full"></div>
            </div>

            {/* 事件列表 */}
            <div className="year-events space-y-12">
              {yearData.events.map((event, eventIndex) => (
                <div
                  key={`${yearData.year}-${eventIndex}`}
                  className="timeline-event-item scroll-reveal"
                  style={{ transitionDelay: `${eventIndex * 100}ms` }}
                >
                  <TimelineEventItem
                    event={event}
                    isFeatured={eventIndex === 0}
                    layout={yearIndex % 2 === 0 ? 'image-left' : 'image-right'}
                  />
                </div>
              ))}
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
            {years.map((yearData) => (
              <button
                key={`nav-${yearData.year}`}
                onClick={() => {
                  const element = document.querySelector(`[data-year="${yearData.year}"]`);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 text-sm font-medium text-blue-900 hover:bg-blue-900 hover:text-white"
              >
                {yearData.year}年
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineEventList;