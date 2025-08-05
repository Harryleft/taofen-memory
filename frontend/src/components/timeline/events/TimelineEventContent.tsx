// 时间线事件内容组件 - 专注于事件内容的渲染

import React from 'react';
import { BaseTimelineEvent } from '../../../types/timelineTypes';
import styles from '../styles/timelineStyles.module.css';

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
    return {
      container: isFeatured ? styles.eventContentFeatured : styles.eventContent,
      time: isFeatured ? styles.eventTimeFeatured : styles.eventTime,
      location: isFeatured ? styles.eventLocationFeatured : styles.eventLocation,
      title: isFeatured ? styles.eventTitleFeatured : styles.eventTitleRegular,
      experience: isFeatured ? styles.eventExperienceFeatured : styles.eventExperienceRegular
    };
  };

  const contentStyles = getContentStyles();

  return (
    <div className={`${contentStyles.container} ${className}`}>
      {/* 时间和地点信息 */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <p className={contentStyles.time}>
          {event.time}
        </p>
        {event.location && (
          <div className={contentStyles.location}>
            {event.location}
          </div>
        )}
      </div>
      
      {/* 事件描述 */}
      <div className="space-y-1">
        {event.title && (
          <h4 className={contentStyles.title}>
            {event.title}
          </h4>
        )}
        <p className={contentStyles.experience}>
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