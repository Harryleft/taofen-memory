import React from 'react';

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
  const containerClasses = isFeatured
    ? 'transform scale(1.1) mb-8'
    : 'transform scale(0.95)';

  const imageClasses = isFeatured
    ? 'max-w-xs md:max-w-md lg:max-w-lg transform scale-115 shadow-lg'
    : 'max-w-xs transform scale-85 shadow-md';

  const timeTextClasses = isFeatured ? 'text-base font-semibold' : 'text-sm font-medium';
  const experienceTextClasses = isFeatured ? 'text-lg leading-relaxed font-medium' : 'text-base';

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
                  alt={event.experience} // Use experience as alt text
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
                  {event.experience}
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