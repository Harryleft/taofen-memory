// 重构后的时间线事件项组件 - 高内聚低耦合设计

import React from 'react';
import { BaseTimelineEvent } from '../../../types/timelineTypes';
import { Person } from '../../../types/Person';
import TimelineEventContent from './TimelineEventContent';
import TimelineEventImage from './TimelineEventImage';
import PersonLinkRenderer from './PersonLinkRenderer';
import styles from '../styles/timelineStyles.module.css';

interface RefactoredTimelineItemProps {
  event: BaseTimelineEvent;
  isFeatured?: boolean;
  className?: string;
  onPersonClick?: (person: Person) => void;
  onImageLoad?: () => void;
  onImageError?: (error: Event) => void;
}

const RefactoredTimelineItem: React.FC<RefactoredTimelineItemProps> = ({ 
  event, 
  isFeatured = false,
  className = '',
  onPersonClick,
  onImageLoad,
  onImageError
}) => {
  // 样式计算逻辑
  const getContainerStyles = () => {
    const baseClasses = styles.timelineItem;
    const featuredClasses = isFeatured 
      ? 'transform scale-1.1 mb-8' 
      : 'transform scale-0.95';
    
    return `${baseClasses} ${featuredClasses} ${className}`;
  };

  const getDotStyles = () => {
    const baseClasses = styles.timelineDot;
    const colorClasses = event.timespot 
      ? styles.timelineDotGray 
      : styles.timelineDotGold;
    const visibilityClasses = isFeatured ? 'hidden' : '';
    
    return `${baseClasses} ${colorClasses} ${visibilityClasses}`;
  };

  // 渲染带有人物链接的经验文本
  const renderExperienceWithLinks = () => {
    return (
      <PersonLinkRenderer
        text={event.experience}
        onPersonClick={onPersonClick}
        className="text-charcoal/80"
      />
    );
  };

  return (
    <div className={getContainerStyles()}>
      {/* 时间线圆点 */}
      <div className={getDotStyles()}></div>
      
      {/* 主要内容区域 */}
      <div className="pl-[45px] md:pl-0">
        <div className="md:flex justify-between items-start w-full">
          {/* 图片区域 */}
          <div className="md:w-6/12 md:text-right md:pr-2">
            <TimelineEventImage
              event={event}
              isFeatured={isFeatured}
              onImageLoad={onImageLoad}
              onImageError={onImageError}
            />
          </div>
          
          {/* 分隔区域 */}
          <div className="hidden md:block w-12"></div>
          
          {/* 内容区域 */}
          <div className="md:w-6/12 mt-4 md:mt-0">
            <TimelineEventContent
              event={{
                ...event,
                // 使用PersonLinkRenderer处理经验文本
                experience: ''
              }}
              isFeatured={isFeatured}
            />
            
            {/* 单独渲染经验文本以支持人物链接 */}
            <div className="mt-2">
              <div className={`space-y-1 ${
                isFeatured ? 'text-lg leading-relaxed font-medium' : 'text-base'
              }`}>
                {renderExperienceWithLinks()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefactoredTimelineItem;

// 导出类型以供其他组件使用
export type { RefactoredTimelineItemProps };