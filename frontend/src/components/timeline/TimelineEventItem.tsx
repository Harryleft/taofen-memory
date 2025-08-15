/**
 * @file TimelineEventItem.tsx
 * @description 渲染时间轴上的单个事件项，支持普通和特色两种展示模式，并能高亮文本中的人名并使其可点击。
 * @module TimelineEventItem
 */
import React, { useState, useEffect } from 'react';
import { personMatcher } from '@/utils/personMatcher.ts';
import { Person } from '@/types/Person.ts';

/**
 * @interface TimelineEvent
 * @description 单个时间轴事件的数据结构定义。
 * @property {string} time - 事件发生的时间。
 * @property {string} experience - 事件的描述文本。
 * @property {string} image - 与事件关联的图片 URL。
 * @property {string} location - 事件发生的地点。
 * @property {number} [timespot] - 可选，标记事件类型，例如背景事件。
 */
interface TimelineEvent {
  time: string;
  experience: string;
  image: string;
  location: string;
  timespot?: number; // 1 for background events
}

/**
 * @interface TimelineItemProps
 * @description TimelineEventItem 组件的属性定义。
 * @property {TimelineEvent} event - 当前事件的数据对象。
 * @property {boolean} [isFeatured] - 可选，标记是否为特色事件，用于应用不同的样式。
 */
interface TimelineItemProps {
  event: TimelineEvent;
  isFeatured?: boolean;
  layout?: 'image-left' | 'image-right';
}

/**
 * TimelineEventItem 组件
 * @description 根据传入的事件数据，渲染一个时间轴事件项。
 * @param {TimelineItemProps} props - 组件属性。
 * @returns {JSX.Element} 渲染的单个时间轴事件。
 */
const TimelineEventItem: React.FC<TimelineItemProps> = ({ event, isFeatured, layout = 'image-left' }) => {
    // 状态：标记人物数据是否已加载完成，用于控制人名链接的渲染
  const [isPersonDataLoaded, setIsPersonDataLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // 判断事件类型用于视觉层次
  const isKeyMilestone = isFeatured; // 特色事件作为关键里程碑
  const isBackgroundEvent = event.timespot === 1; // 背景事件
  const isMinorEvent = !isFeatured && !isBackgroundEvent; // 次要事件

  // Effect Hook: 组件挂载时异步加载人物数据
  useEffect(() => {
    const loadPersonData = async () => {
      try {
        // 检查是否已经加载过，避免重复加载
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

  // 处理图片加载错误
  const handleImageError = () => {
    console.warn('Failed to load image:', event.image);
    setImageError(true);
  };



    // 根据 isFeatured 属性决定容器的样式类，特色事件会放大
  const containerClasses = isFeatured
    ? 'transform scale-[1.06] mb-8'
    : 'transform scale-[0.98]';


    // 根据 isFeatured 属性决定时间和描述文本的样式
  const timeTextClasses = isFeatured ? 'text-base font-semibold' : 'text-sm font-medium';
  const experienceTextClasses = isFeatured ? 'text-lg leading-relaxed font-medium' : 'text-base';

  // 根据是否为特色事件设置图片尺寸样式
  // 特色事件: 最大宽度80%, 高度自适应保持比例
  // 普通事件: 最大宽度60%, 高度自适应保持比例
    // 根据 isFeatured 属性决定图片尺寸，特色事件的图片更大
  const imageSizeClasses = isFeatured
    ? 'featured-img'
    : 'regular-img';

  const isImageRight = layout === 'image-right';

  // 处理人物姓名点击 - 跳转到外部链接
    // 事件处理：点击人名时，在新标签页打开相关链接
  const handlePersonClick = (person: Person) => {
    if (person.link && person.link.length > 0) {
      window.open(person.link[0], '_blank', 'noopener,noreferrer');
    }
    // 如果没有外部链接，保持静默（不做任何操作）
  };

  // 渲染带有人物链接的文本
    // 渲染函数：解析文本中的人名，并将其转换为可点击的链接
  const renderTextWithPersonLinks = (text: string) => {
    if (!isPersonDataLoaded) {
      return <span>{text}</span>;
    }

    const personMatches = personMatcher.extractPersonsFromText(text);
    
    if (personMatches.length === 0) {
      return <span>{text}</span>;
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    personMatches.forEach((match, index) => {
      // 添加匹配前的文本
      if (match.startIndex > lastIndex) {
        elements.push(
          <span key={`text-${index}`}>
            {text.substring(lastIndex, match.startIndex)}
          </span>
        );
      }

      // 添加人物链接
      elements.push(
        <button
          key={`person-${index}`}
          onClick={() => handlePersonClick(match.person)}
          className="text-gold underline hover:text-gold/80 transition-colors duration-200 font-medium"
          title={match.person.link && match.person.link.length > 0 ? `点击查看${match.person.name}的相关链接` : match.person.name}
        >
          {match.name}
        </button>
      );

      lastIndex = match.endIndex;
    });

    // 添加剩余的文本
    if (lastIndex < text.length) {
      elements.push(
        <span key="text-end">
          {text.substring(lastIndex)}
        </span>
      );
    }

    return <>{elements}</>;
  };

  // 根据事件类型确定视觉层次类
  const visualClass = isKeyMilestone ? 'key-milestone' : 
                     isBackgroundEvent ? 'background-event' : 
                     isMinorEvent ? 'minor-event' : '';

  // 骨架屏（统一样式）：当图片存在但尚未加载时由浏览器自己处理；这里提供统一结构供未来扩展
  return (
    <div className={`timeline-item ${containerClasses} ${visualClass}`}>
      <div className={`timeline-dot ${event.timespot ? 'timeline-dot-gray' : 'timeline-dot-gold'} ${isFeatured ? 'hidden' : ''}`}></div>
      <div className={`${isFeatured ? 'pl-0' : 'pl-[45px]'} md:pl-0`}>
        <div className={`md:flex justify-between items-start w-full ${isImageRight ? 'md:flex-row-reverse' : ''}`}>
          <div className={`md:w-6/12 ${isImageRight ? 'md:text-left md:pl-4' : 'md:text-right md:pr-4'}`}>
            {event.image && !imageError && (
              <div className="relative group">
                <img
                  src={event.image}
                  alt=""
                  className={`inline-block ${imageSizeClasses} object-cover ml-auto rounded-lg transition-all duration-500 group-hover:scale-105 ${
                    isKeyMilestone ? 'shadow-lg' : 
                    isBackgroundEvent ? 'opacity-80' : 
                    'shadow-md'
                  }`}
                  onError={handleImageError}
                />
              </div>
            )}
            {imageError && (
              <div className="relative group">
                <div className={`inline-block ${imageSizeClasses} bg-charcoal/10 ml-auto rounded-lg flex items-center justify-center`}>
                  <span className="text-charcoal/50 text-sm">图片加载失败</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="hidden md:block w-16"></div>
          
          <div className="md:w-6/12 mt-4 md:mt-0 px-2">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <p className={`text-gold ${timeTextClasses} ${
                  isKeyMilestone ? 'font-bold text-lg' : 
                  isBackgroundEvent ? 'opacity-70' : 
                  ''
                }`}>
                  {event.time}
                </p>
                {event.location && (
                  <div className={`text-sm font-bold ${
                    isKeyMilestone ? 'text-charcoal' : 
                    isBackgroundEvent ? 'text-charcoal/60' : 
                    'text-charcoal'
                  }`}>
                    {event.location}
                  </div>
                )}
              </div>
              
              <div className="pt-1">
                <p className={`leading-relaxed ${
                  isKeyMilestone ? 'text-charcoal text-lg font-medium' : 
                  isBackgroundEvent ? 'text-charcoal/60 text-sm' : 
                  'text-charcoal/80'
                }`}>
                  {renderTextWithPersonLinks(event.experience)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      

    </div>
  );
};

export default TimelineEventItem;
