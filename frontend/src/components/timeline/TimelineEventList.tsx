/**
 * @file TimelineEventList.tsx
 * @description 时间线事件列表组件，按年份组织展示所有事件
 * @module TimelineEventList
 */
import React, { useState, useEffect } from 'react';
import TimelineEventItem from './TimelineEventItem';
import { personMatcher } from '@/utils/personMatcher';

interface TimelineEvent {
  time: string;
  experience: string;
  image: string;
  location: string;
  timespot?: number;
}

interface TimelineYear {
  year: string;
  label: string;
  events: TimelineEvent[];
}

interface EventListProps {
  years: TimelineYear[];
  selectedYear?: string;
}

const TimelineEventList: React.FC<EventListProps> = ({ years, selectedYear }) => {
  const [filteredYears, setFilteredYears] = useState<TimelineYear[]>(years);
  const [isPersonDataLoaded, setIsPersonDataLoaded] = useState(false);
  
  // 加载人物数据
  useEffect(() => {
    const loadPersonData = async () => {
      try {
        if (!isPersonDataLoaded && personMatcher) {
          await personMatcher.loadPersons();
          setIsPersonDataLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load person data:', error);
        setIsPersonDataLoaded(false);
      }
    };
    
    loadPersonData();
  }, [isPersonDataLoaded]);

  // 根据选中的年份过滤事件
  useEffect(() => {
    if (selectedYear) {
      setFilteredYears(years.filter(year => year.year === selectedYear));
    } else {
      setFilteredYears(years);
    }
  }, [years, selectedYear]);

  // 滚动发现体验
  const containerReveal = useScrollReveal({ threshold: 0.1 });

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
              <h2 className="text-[2.441rem] font-bold text-accent-primary font-serif mb-2">
                {yearData.year}年
              </h2>
              <p className="text-lg text-text-secondary">
                {yearData.label}
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-accent-secondary to-accent-primary mx-auto mt-4 rounded-full"></div>
            </div>

            {/* 事件列表 */}
            <div className="year-events space-y-12">
              {yearData.events.map((event, eventIndex) => {
                // 判断事件类型
                const isKeyMilestone = eventIndex === 0; // 每年第一个事件作为关键里程碑
                const isBackgroundEvent = event.timespot === 1;
                const isMinorEvent = !isKeyMilestone && !isBackgroundEvent;

                return (
                  <div
                    key={`${yearData.year}-${eventIndex}`}
                    className={`timeline-event-item scroll-reveal ${
                      isKeyMilestone ? 'key-milestone' :
                      isBackgroundEvent ? 'background-event' :
                      isMinorEvent ? 'minor-event' : ''
                    }`}
                    style={{ transitionDelay: `${eventIndex * 100}ms` }}
                  >
                    <TimelineEventItem
                      event={event}
                      isFeatured={isKeyMilestone}
                      layout={yearIndex % 2 === 0 ? 'image-left' : 'image-right'}
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
        <div className="quick-nav mt-16 pt-8 border-t border-border">
          <h3 className="text-xl font-semibold text-text-primary mb-6 text-center">
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
                className="px-4 py-2 bg-white rounded-lg shadow-sm border border-border hover:shadow-md transition-all duration-200 text-sm font-medium text-accent-primary hover:bg-accent-primary hover:text-white"
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