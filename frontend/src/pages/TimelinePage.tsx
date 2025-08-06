import React from 'react';
import { useTimelineData } from '../hooks/useTimelineData';
import TimelineCoreEventSection from '../components/timeline/TimelineCoreEventSection.tsx';
import TimelineProgressBar from '../components/timeline/TimelineProgressBar.tsx';
import '../styles/timeline.css';

export default function TimelinePage() {
  const { timelineData, loading, error } = useTimelineData();

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
          <p className="mt-4 text-charcoal/70">正在加载邹韬奋先生的人生轨迹...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>加载数据失败: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <TimelineProgressBar />
      <div className="min-h-screen bg-cream">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-charcoal mb-6 font-serif">邹韬奋人生时间线</h1>
            <p className="text-xl text-charcoal/70 max-w-3xl mx-auto leading-relaxed">
              追溯邹韬奋先生的人生轨迹，感受一位文化先驱的成长历程与时代担当
            </p>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-8"></div>
          </div>

          <div className="timeline-container">
            {timelineData.map((coreEvent, coreIndex) => (
              <TimelineCoreEventSection
                key={coreIndex}
                coreEvent={coreEvent}
                coreIndex={coreIndex}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
