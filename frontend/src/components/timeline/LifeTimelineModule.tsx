/**
 * @file LifeTimelineModule.tsx
 * @description 时间轴功能的主模块，作为容器组件，负责获取时间轴数据并渲染核心事件、进度条和头部。
 * @module LifeTimelineModule
 */

import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTimelineData } from '../../hooks/useTimelineData.ts';
import TimelineCoreEventSection from './TimelineCoreEventSection.tsx';
import TimelineProgressBar from './TimelineProgressBar.tsx';
import MinimalTimelineHeader from '../layout/header/MinimalTimelineHeader.tsx';
import '../../styles/timeline.css';

/**
 * @interface LifeTimelineModuleProps
 * @description LifeTimelineModule 组件的属性定义。
 * @property {string} [className] - 可选的 CSS 类名，用于自定义组件样式。
 */
interface LifeTimelineModuleProps {
  className?: string;
}

/**
 * LifeTimelineModule 组件
 * @param {LifeTimelineModuleProps} props - 组件属性
 * @returns {JSX.Element} 渲染的时间轴模块，包含加载、错误和成功三种状态下的 UI。
 */

export default function LifeTimelineModule({ className = '' }: LifeTimelineModuleProps) {
  // 使用自定义 Hook 获取时间轴数据、加载状态和错误信息
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
      <TimelineProgressBar />
      <MinimalTimelineHeader />
      <section className={`py-20 bg-cream ${className}`}>
        <div className="max-w-6xl mx-auto px-6">

          <div className="timeline-container">
            {timelineData.map((coreEvent, coreIndex) => (
              <TimelineCoreEventSection
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
