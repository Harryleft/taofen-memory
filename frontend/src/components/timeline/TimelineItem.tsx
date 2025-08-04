import React, { useState, useEffect } from 'react';
import { personMatcher } from '../../utils/personMatcher';
import { Person } from '../../types/Person';

interface TimelineEvent {
  time: string;
  experience: string;
  image: string;
  location: string;
  timespot?: number; // 1 for background events
}

interface TimelineItemProps {
  event: TimelineEvent;
  isFeatured?: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ event, isFeatured }) => {
  const [isPersonDataLoaded, setIsPersonDataLoaded] = useState(false);

  // 初始化人物数据
  useEffect(() => {
    const loadPersonData = async () => {
      try {
        await personMatcher.loadPersons();
        setIsPersonDataLoaded(true);
      } catch (error) {
        console.error('Failed to load person data:', error);
      }
    };
    
    loadPersonData();
  }, []);



  const containerClasses = isFeatured
    ? 'transform scale(1.1) mb-8'
    : 'transform scale(0.95)';

  const imageClasses = isFeatured
    ? 'max-w-xs md:max-w-md lg:max-w-lg transform scale-115 shadow-lg'
    : 'max-w-xs transform scale-85 shadow-md';

  const timeTextClasses = isFeatured ? 'text-base font-semibold' : 'text-sm font-medium';
  const experienceTextClasses = isFeatured ? 'text-lg leading-relaxed font-medium' : 'text-base';

  // 处理人物姓名点击 - 跳转到外部链接
  const handlePersonClick = (person: Person) => {
    if (person.link && person.link.length > 0) {
      window.open(person.link[0], '_blank', 'noopener,noreferrer');
    }
    // 如果没有外部链接，保持静默（不做任何操作）
  };

  // 渲染带有人物链接的文本
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

  return (
    <div className={`timeline-item ${containerClasses}`}>
      <div className={`timeline-dot ${event.timespot ? 'timeline-dot-gray' : 'timeline-dot-gold'} ${isFeatured ? 'hidden' : ''}`}></div>
      <div className="pl-[45px] md:pl-0">
        <div className="md:flex justify-between items-start w-full">
          <div className="md:w-6/12 md:text-right md:pr-2">
            {event.image && (
              <div className="relative group">
                <img 
                  src={event.image}
                  alt=""
                  className={`inline-block w-full ml-auto rounded-lg transition-transform duration-300 group-hover:scale-105 ${imageClasses}`}
                />
              </div>
            )}
          </div>
          
          <div className="hidden md:block w-12"></div>
          
          <div className="md:w-6/12 mt-4 md:mt-0">
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <p className={`text-gold ${timeTextClasses}`}>
                  {event.time}
                </p>
                {event.location && (
                  <div className="text-sm text-charcoal font-bold">
                    {event.location}
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <p className={`text-charcoal/80 ${experienceTextClasses}`}>
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

export default TimelineItem;