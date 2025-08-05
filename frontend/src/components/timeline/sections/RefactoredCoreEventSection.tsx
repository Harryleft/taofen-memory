// 重构后的核心事件分组组件 - 高内聚低耦合设计

import React, { useState, useMemo } from 'react';
import { CoreEventGroup, BaseTimelineEvent } from '../../../types/timelineTypes';
import { Person } from '../../../types/Person';
import RefactoredTimelineItem from '../events/RefactoredTimelineItem';
import styles from '../styles/timelineStyles.module.css';

interface RefactoredCoreEventSectionProps {
  coreEventGroup: CoreEventGroup;
  sectionIndex: number;
  className?: string;
  onPersonClick?: (person: Person) => void;
  onEventClick?: (event: BaseTimelineEvent) => void;
  expandable?: boolean;
  defaultExpanded?: boolean;
}

const RefactoredCoreEventSection: React.FC<RefactoredCoreEventSectionProps> = ({ 
  coreEventGroup, 
  sectionIndex,
  className = '',
  onPersonClick,
  onEventClick,
  expandable = true,
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});

  // 事件分类逻辑
  const { featuredEvents, regularEvents, backgroundEvents } = useMemo(() => {
    const featured: BaseTimelineEvent[] = [];
    const regular: BaseTimelineEvent[] = [];
    const background: BaseTimelineEvent[] = [];

    coreEventGroup.timeline.forEach(event => {
      if (event.timespot === 1) {
        background.push(event);
      } else if (event.image && event.experience.length > 100) {
        featured.push(event);
      } else {
        regular.push(event);
      }
    });

    return {
      featuredEvents: featured,
      regularEvents: regular,
      backgroundEvents: background
    };
  }, [coreEventGroup.timeline]);

  // 统计信息
  const stats = useMemo(() => ({
    totalEvents: coreEventGroup.timeline.length,
    featuredCount: featuredEvents.length,
    regularCount: regularEvents.length,
    backgroundCount: backgroundEvents.length
  }), [coreEventGroup.timeline.length, featuredEvents.length, regularEvents.length, backgroundEvents.length]);

  // 切换展开状态
  const toggleExpanded = () => {
    if (expandable) {
      setIsExpanded(!isExpanded);
    }
  };

  // 处理图片加载状态
  const handleImageLoad = (eventId: string | number) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [eventId]: true
    }));
  };

  const handleImageError = (eventId: string | number) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [eventId]: false
    }));
  };

  // 处理事件点击
  const handleEventClick = (event: BaseTimelineEvent) => {
    onEventClick?.(event);
  };

  // 渲染事件项
  const renderEventItem = (event: BaseTimelineEvent, isFeatured: boolean = false) => (
    <RefactoredTimelineItem
      key={event.id}
      event={event}
      isFeatured={isFeatured}
      onPersonClick={onPersonClick}
      onImageLoad={() => handleImageLoad(event.id)}
      onImageError={() => handleImageError(event.id)}
      className="cursor-pointer hover:bg-cream/50 transition-colors duration-200 rounded-lg p-2 -m-2"
    />
  );

  return (
    <section className={`${styles.coreEventSection} ${className}`}>
      {/* 分组标题 */}
      <div className="mb-8">
        <div 
          className={`flex items-center justify-between ${
            expandable ? 'cursor-pointer' : ''
          }`}
          onClick={toggleExpanded}
        >
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-charcoal font-serif">
              {coreEventGroup.core_event}
            </h2>
            
            {/* 统计信息 */}
            <div className="flex items-center space-x-2 text-sm text-charcoal/60">
              <span className="bg-gold/10 px-2 py-1 rounded-full">
                {stats.totalEvents} 个事件
              </span>
              {stats.featuredCount > 0 && (
                <span className="bg-blue-100 px-2 py-1 rounded-full">
                  {stats.featuredCount} 个重点
                </span>
              )}
              {stats.backgroundCount > 0 && (
                <span className="bg-gray-100 px-2 py-1 rounded-full">
                  {stats.backgroundCount} 个背景
                </span>
              )}
            </div>
          </div>
          
          {/* 展开/收起按钮 */}
          {expandable && (
            <button 
              className="text-charcoal/60 hover:text-charcoal transition-colors duration-200"
              aria-label={isExpanded ? '收起' : '展开'}
            >
              <svg 
                className={`w-6 h-6 transform transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
        
        {/* 分隔线 */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mt-4"></div>
      </div>

      {/* 事件列表 */}
      {isExpanded && (
        <div className="space-y-6">
          {/* 特色事件 */}
          {featuredEvents.length > 0 && (
            <div className="featured-events">
              {featuredEvents.map(event => renderEventItem(event, true))}
            </div>
          )}
          
          {/* 常规事件 */}
          {regularEvents.length > 0 && (
            <div className="regular-events space-y-4">
              {regularEvents.map(event => renderEventItem(event, false))}
            </div>
          )}
          
          {/* 背景事件 */}
          {backgroundEvents.length > 0 && (
            <div className="background-events">
              <div className="text-sm text-charcoal/50 mb-3 font-medium">时代背景</div>
              <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                {backgroundEvents.map(event => renderEventItem(event, false))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* 加载状态指示 */}
      {Object.values(imageLoadingStates).some(loading => loading === undefined) && (
        <div className="text-center mt-4">
          <div className="text-sm text-charcoal/50">图片加载中...</div>
        </div>
      )}
    </section>
  );
};

export default RefactoredCoreEventSection;

// 导出类型
export type { RefactoredCoreEventSectionProps };