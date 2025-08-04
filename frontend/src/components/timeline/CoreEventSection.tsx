import React, { useState } from 'react';
import TimelineItem from './TimelineItem';

interface TimelineEvent {
  time: string;
  experience: string;
  image: string;
  location: string;
  timespot?: number;
}

interface CoreEvent {
  core_event: string;
  timeline: TimelineEvent[];
}

interface CoreEventSectionProps {
  coreEvent: CoreEvent;
  coreIndex: number;
}

const CoreEventSection: React.FC<CoreEventSectionProps> = ({ coreEvent, coreIndex }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const firstEvent = coreEvent.timeline[0];

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
    // Optional: Scroll into view logic can be handled here or in the parent
  };

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
        <TimelineItem event={firstEvent} isFeatured />
      </div>

      {isExpanded && (
        <div className="space-y-6 animate-fadeIn mt-8">
          {coreEvent.timeline.slice(1).map((event, eventIndex) => (
            <div
              key={`${coreIndex}-${eventIndex + 1}`}
              className="staggered-animation"
              style={{ animationDelay: `${eventIndex * 0.1}s` }}
            >
              <TimelineItem event={event} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoreEventSection;