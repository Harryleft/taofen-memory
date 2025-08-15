import { useEffect, useMemo, useState } from 'react';
import { useTimelineData } from '@/hooks/useTimelineData';
import TimelineEventList from '@/components/timeline/TimelineEventList.tsx';
import TimelineNavigation from '@/components/timeline/TimelineNavigation.tsx';
import TimelineProgressBar from '@/components/timeline/TimelineProgressBar.tsx';
import AppHeader from '@/components/layout/header/AppHeader.tsx';
import { AppFooter } from '@/components/layout/footer';
import '@/styles/timeline-simple.css';
import { transformTimelineData, groupEventsByYear, getYearRange, extractYear } from '@/utils/timelineDataTransformer';



export default function TimelinePage() {
  const { timelineData, loading, error } = useTimelineData();

  // 状态管理
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [currentYear, setCurrentYear] = useState<string>('');

  // 使用新的数据适配层
  const flatEvents = useMemo(() => {
    return transformTimelineData(timelineData);
  }, [timelineData]);

  // 将数据按年份重新组织（兼容现有组件）
  const yearsData = useMemo(() => {
    return groupEventsByYear(flatEvents);
  }, [flatEvents]);

  // 获取年份范围
  const allYears = useMemo(() => {
    return getYearRange(flatEvents);
  }, [flatEvents]);

  // 监听滚动，自动更新当前年份
  useEffect(() => {
    const handleScroll = () => {
      const yearElements = document.querySelectorAll('[data-year]');
      const scrollTop = window.scrollY + 200; // 偏移量

      for (let i = yearElements.length - 1; i >= 0; i--) {
        const element = yearElements[i] as HTMLElement;
        const year = element.getAttribute('data-year');
        if (year && element.offsetTop <= scrollTop) {
          setCurrentYear(year);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [yearsData]);

  // 显示所有时间线数据（无需过滤）
  const displayYears = useMemo(() => {
    return yearsData;
  }, [yearsData]);

  // 处理年份选择
  const handleYearChange = (year: string) => {
    setSelectedYear(year === selectedYear ? '' : year);
    setCurrentYear(year);
  };

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
      <div className="min-h-screen bg-cream flex flex-col">
        <AppHeader moduleId="timeline" />
        <div className="max-w-6xl mx-auto px-6 py-20">
          {/* 顶部统计（Phase 3，可选显示） */}
          <div className="timeline-summary-card hidden">
            <div className="timeline-summary-grid">
              <div className="timeline-summary-tile">
                <div className="timeline-summary-label">时间范围</div>
                <div className="timeline-summary-value">自动读取（Phase 3 数据）</div>
              </div>
              <div className="timeline-summary-tile">
                <div className="timeline-summary-label">核心事件</div>
                <div className="timeline-summary-value">自动读取（Phase 3 数据）</div>
              </div>
              <div className="timeline-summary-tile">
                <div className="timeline-summary-label">事件总数</div>
                <div className="timeline-summary-value">自动读取（Phase 3 数据）</div>
              </div>
            </div>
          </div>

          {/* 主时间线 */}
          <main className="timeline-container">
            <TimelineEventList years={displayYears} selectedYear={selectedYear} />
          </main>

          {/* 右侧时间轴导航 */}
          <TimelineNavigation
            years={displayYears}
            currentYear={currentYear || displayYears[0]?.year || ''}
            onYearChange={handleYearChange}
          />

          {/* 回到顶部 */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 rounded-full bg-charcoal text-cream shadow-lg hover:shadow-xl px-3 py-2 text-sm"
            aria-label="回到顶部"
          >
            回到顶部
          </button>
        </div>
      </div>
      
      {/* Footer */}
      <AppFooter />
    </>
  );
}
