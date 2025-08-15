/**
 * @file TimelineCoreEventSection.tsx
 * @description 渲染单个核心事件区域，包含该核心事件的标题和其下的多个时间轴事件。
 * @module TimelineCoreEventSection
 */
import React, { useState } from 'react';
import TimelineEventItem from './TimelineEventItem.tsx';

/**
 * @interface TimelineEvent
 * @description 单个时间轴事件的数据结构。
 */
interface TimelineEvent {
  time: string;
  experience: string;
  image: string;
  location: string;
  timespot?: number;
}

/**
 * @interface CoreEvent
 * @description 核心事件的数据结构，包含一个核心事件标题和一组相关的时间轴事件。
 */
interface CoreEvent {
  core_event: string;
  timeline: TimelineEvent[];
}

/**
 * @interface CoreEventSectionProps
 * @description TimelineCoreEventSection 组件的属性定义。
 * @property {CoreEvent} coreEvent - 当前核心事件的数据。
 * @property {number} coreIndex - 当前核心事件在列表中的索引。
 */
interface CoreEventSectionProps {
  coreEvent: CoreEvent;
  coreIndex: number;
}

/**
 * TimelineCoreEventSection 组件
 * @description 渲染并管理单个核心事件的展示，包括其标题和可展开/折叠的事件列表。
 * @param {CoreEventSectionProps} props - 组件属性。
 * @returns {JSX.Element} 渲染的核心事件区域。
 */
const TimelineCoreEventSection: React.FC<CoreEventSectionProps> = ({ coreEvent, coreIndex }) => {
    // 内部状态，用于控制事件列表是否展开
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 安全获取首事件，防止空数组导致错误
  const firstEvent = coreEvent.timeline && coreEvent.timeline.length > 0 ? coreEvent.timeline[0] : null;

    // 切换展开/折叠状态的函数
  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
    // Optional: Scroll into view logic can be handled here or in the parent
  };

  // 如果没有事件数据，显示错误状态
  if (!firstEvent) {
    return (
      <div className="core-event-section" data-core-event={coreIndex}>
        <div className="core-event-title text-center">
          <h3 className="text-3xl font-bold text-charcoal font-serif mb-2">
            {coreEvent.core_event}
          </h3>
        </div>
        <div className="text-center text-charcoal/60 py-8">
          该核心事件暂无时间线数据
        </div>
      </div>
    );
  }

  return (
    <div className="core-event-section" data-core-event={coreIndex}>
      <div className="core-event-title text-center">
        <h3 className="text-3xl font-bold text-charcoal font-serif mb-2">
          {coreEvent.core_event}
        </h3>
      </div>

      <div
        className={`first-event-clickable ${isExpanded ? 'expanded' : ''} cursor-pointer`}
        onClick={toggleExpansion}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleExpansion();
          }
        }}
      >
        <TimelineEventItem event={firstEvent} isFeatured layout={coreIndex % 2 === 0 ? 'image-left' : 'image-right'} />
      </div>

      {isExpanded && (
        <div className="space-y-6 animate-fadeIn mt-8">
          {coreEvent.timeline.slice(1).map((event, eventIndex) => (
            <div
              key={`${coreIndex}-${eventIndex + 1}`}
              className="staggered-animation"
              style={{ animationDelay: `${eventIndex * 0.1}s` }}
            >
              <TimelineEventItem event={event} layout={(coreIndex + eventIndex + 1) % 2 === 0 ? 'image-left' : 'image-right'} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimelineCoreEventSection;
