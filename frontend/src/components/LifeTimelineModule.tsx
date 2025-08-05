// import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTimelineData } from '../hooks/useTimelineData';
import CoreEventSection from './timeline/CoreEventSection';
import ProgressBar from './timeline/ProgressBar';
import TimelineHeader from './timeline/TimelineHeader';
import '../styles/timeline.css';

interface LifeTimelineModuleProps {
  className?: string;
}

export default function LifeTimelineModule({ className = '' }: LifeTimelineModuleProps) {
  const { timelineData, loading, error } = useTimelineData();

  if (loading) {
    return (
      <section className={`py-20 bg-cream ${className}`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
            <p className="mt-4 text-charcoal/70">正在加载邹韬奋先生的人生轨迹...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`py-20 bg-cream ${className}`}>
        <div className="max-w-6xl mx-auto px-6 text-center text-red-500">
          <p>加载数据失败: {error.message}</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <ProgressBar />
      <TimelineHeader />
      <section className={`py-20 bg-cream ${className}`}>
        <div className="max-w-6xl mx-auto px-6">

          <div className="timeline-container">
            {timelineData.map((coreEvent, coreIndex) => (
              <CoreEventSection
                key={coreIndex}
                coreEvent={coreEvent}
                coreIndex={coreIndex}
              />
            ))}
          </div>

          <div className="text-center mt-16">
            <Link
              to="/timeline"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gold text-cream rounded-xl font-semibold text-lg hover:bg-gold/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              查看完整时间线
              <ArrowRight size={20} />
            </Link>
            <p className="text-charcoal/60 mt-4 text-sm">
              探索邹韬奋先生完整的人生历程
            </p>
          </div>
        </div>
      </section>
    </>
  );
}