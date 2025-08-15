/**
 * @file TimelineCoreEventSection.tsx
 * @description 渲染单个核心事件区域，包含该核心事件的标题和其下的多个时间轴事件。
 * @module TimelineCoreEventSection
 */
import React, { useState, useEffect } from 'react';
import TimelineEventItem from './TimelineEventItem.tsx';
import { useScrollReveal } from '@/hooks/useScrollReveal.ts';

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
  
  // 计算可展开的事件数量
  const expandableEventCount = coreEvent.timeline && coreEvent.timeline.length > 1 ? coreEvent.timeline.length - 1 : 0;

  // 滚动发现体验
  const titleReveal = useScrollReveal({ threshold: 0.1, delay: 100 });
  const firstEventReveal = useScrollReveal({ threshold: 0.2, delay: 300 });
  const [staggeredRevealed, setStaggeredRevealed] = useState(false);

  // 展开事件时的滚动发现效果
  useEffect(() => {
    if (isExpanded) {
      setStaggeredRevealed(true);
    } else {
      setStaggeredRevealed(false);
    }
  }, [isExpanded]);

    // 切换展开/折叠状态的函数
  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
    // Optional: Scroll into view logic can be handled here or in the parent
  };
  
  // 核心事件标题点击处理
  const handleTitleClick = () => {
    if (expandableEventCount > 0) {
      setIsExpanded(!isExpanded);
    }
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
      <div 
        ref={titleReveal.elementRef}
        className={`core-event-title text-center mb-6 scroll-reveal ${titleReveal.isRevealed ? 'revealed' : ''}`}
      >
        <h3 
          className={`text-3xl font-bold text-charcoal font-serif mb-2 inline-flex items-center gap-2 cursor-pointer transition-all duration-200 ${
            expandableEventCount > 0 ? 'hover:text-gold' : ''
          }`}
          onClick={handleTitleClick}
          title={expandableEventCount > 0 ? `点击${isExpanded ? '折叠' : '展开'}查看更多事件` : coreEvent.core_event}
        >
          {coreEvent.core_event}
          {expandableEventCount > 0 && (
            <span className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          )}
        </h3>
        {expandableEventCount > 0 && (
          <p className="text-sm text-charcoal/60 mt-1">
            共 {coreEvent.timeline.length} 个事件，{isExpanded ? '已展开' : `点击展开查看另外 ${expandableEventCount} 个事件`}
          </p>
        )}
      </div>

      <div
        ref={firstEventReveal.elementRef}
        className={`first-event-clickable ${isExpanded ? 'expanded' : ''} cursor-pointer relative group scroll-reveal ${firstEventReveal.isRevealed ? 'revealed' : ''}`}
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
        {/* 展开提示标签 */}
        {expandableEventCount > 0 && !isExpanded && (
          <div className="absolute -top-2 -right-2 bg-gold text-white text-xs px-2 py-1 rounded-full shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            点击展开
            <svg className="w-3 h-3 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
        
          
        <TimelineEventItem event={firstEvent} isFeatured layout={coreIndex % 2 === 0 ? 'image-left' : 'image-right'} />
      </div>

      {isExpanded && (
        <>
          <div className="space-y-6 mt-8">
            {coreEvent.timeline.slice(1).map((event, eventIndex) => (
              <div
                key={`${coreIndex}-${eventIndex + 1}`}
                className={`staggered-animation scroll-reveal ${staggeredRevealed ? 'revealed' : ''}`}
                style={{ 
                  transitionDelay: `${0.5 + eventIndex * 0.15}s`,
                  transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <TimelineEventItem event={event} layout={(coreIndex + eventIndex + 1) % 2 === 0 ? 'image-left' : 'image-right'} />
              </div>
            ))}
          </div>
          
          {/* 折叠按钮 */}
          <div className="text-center mt-6 scroll-reveal" style={{ transitionDelay: `${0.5 + (coreEvent.timeline.length - 1) * 0.15}s` }}>
            <button
              onClick={toggleExpansion}
              className="inline-flex items-center gap-1 text-sm text-gold font-medium hover:text-gold/80 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span>收起事件</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TimelineCoreEventSection;
