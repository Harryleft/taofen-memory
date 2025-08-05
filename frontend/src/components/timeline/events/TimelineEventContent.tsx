// 时间线事件内容组件 - 专注于事件内容的渲染

import React from 'react';
import { BaseTimelineEvent } from '../../../types/timelineTypes';

interface TimelineEventContentProps {
  event: BaseTimelineEvent;
  isFeatured?: boolean;
  className?: string;
}

const TimelineEventContent: React.FC<TimelineEventContentProps> = ({ 
  event, 
  isFeatured = false,
  className = ''
}) => {
  // 样式计算逻辑
  const getContentStyles = () => {
    const baseStyles = {
      time: isFeatured ? 'text-base font-semibold' : 'text-sm font-medium',
      experience: isFeatured ? 'text-lg leading-relaxed font-medium' : 'text-base',
      location: 'text-sm text-charcoal font-bold'
    };
    return baseStyles;
  };

  const styles = getContentStyles();

  return (
    <div className={`space-y-2 ${className}`}>
      {/* 时间和地点信息 */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <p className={`text-gold ${styles.time}`}>
          {event.time}
        </p>
        {event.location && (
          <div className={styles.location}>
            {event.location}
          </div>
        )}
      </div>
      
      {/* 事件描述 */}
      <div className="space-y-1">
        {event.title && (
          <h4 className="font-semibold text-charcoal">
            {event.title}
          </h4>
        )}
        <p className={`text-charcoal/80 ${styles.experience}`}>
          {event.experience}
        </p>
        
        {/* 详细信息 */}
        {event.details && event.details.length > 0 && (
          <div className="mt-2 space-y-1">
            {event.details.map((detail, index) => (
              <p key={index} className="text-sm text-charcoal/60 pl-4 border-l-2 border-gold/20">
                {detail}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineEventContent;