import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useTimelineData } from '@/hooks/useTimelineData';
import TimelineEventList from '@/components/timeline/TimelineEventList.tsx';
import TimelineCircularNavigation from '@/components/timeline/TimelineCircularNavigation.tsx';
import TimelineProgressBar from '@/components/timeline/TimelineProgressBar.tsx';
import AppHeader from '@/components/layout/header/AppHeader.tsx';
import { AppFooter } from '@/components/layout/footer';
import '@/styles/timeline.css';

type TimelineEvent = {
  time: string;
  experience: string;
  image: string;
  location: string;
  timespot?: number;
};

function extractYear(input: string): number | null {
  if (!input || typeof input !== 'string') return null;
  
  // 支持多种日期格式：YYYY年、YYYY、YYYY-MM-DD等
  const patterns = [
    /(\d{4})年/,        // 2023年
    /(\d{4})/,          // 2023
    /(\d{4})-(\d{1,2})-(\d{1,2})/, // 2023-12-31
  ];
  
  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) {
      const year = parseInt(match[1], 10);
      if (year >= 1800 && year <= 2100) { // 合理的年份范围
        return year;
      }
    }
  }
  
  return null;
}

export default function TimelinePage() {
  const { timelineData, loading, error } = useTimelineData();

  // 状态管理
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [yearStart, setYearStart] = useState<number | null>(null);
  const [yearEnd, setYearEnd] = useState<number | null>(null);

  const deferredSearch = useDeferredValue(search);

  // 将数据按年份重新组织
  const yearsData = useMemo(() => {
    const yearMap = new Map<string, TimelineEvent[]>();
    
    timelineData.forEach(group => {
      group.timeline.forEach(event => {
        const year = extractYear(event.time);
        if (year) {
          const yearKey = year.toString();
          if (!yearMap.has(yearKey)) {
            yearMap.set(yearKey, []);
          }
          yearMap.get(yearKey)?.push(event);
        }
      });
    });

    // 转换为TimelineYear数组并按年份排序
    return Array.from(yearMap.entries())
      .map(([year, events]) => ({
        year,
        label: `${year}年的重要事件`,
        events: events.sort((a, b) => a.time.localeCompare(b.time))
      }))
      .sort((a, b) => parseInt(a.year) - parseInt(b.year));
  }, [timelineData]);

  // 获取年份范围
  const allYears = useMemo(() => {
    const years = yearsData.map(y => parseInt(y.year));
    if (years.length === 0) return { min: null as number | null, max: null as number | null };
    return { min: Math.min(...years), max: Math.max(...years) };
  }, [yearsData]);

  useEffect(() => {
    if (allYears.min !== null && allYears.max !== null) {
      setYearStart(prev => (prev === null ? (allYears.min as number) : prev));
      setYearEnd(prev => (prev === null ? (allYears.max as number) : prev));
    }
  }, [allYears.min, allYears.max]);

  // 过滤数据
  const filteredYears = useMemo(() => {
    const s = deferredSearch.trim();
    const hasYearRange = typeof yearStart === 'number' && typeof yearEnd === 'number';

    return yearsData
      .map(yearData => {
        const filteredEvents = yearData.events.filter(event => {
          const y = extractYear(event.time);
          const passYear = !hasYearRange || (typeof y === 'number' && y >= (yearStart as number) && y <= (yearEnd as number));
          if (!passYear) return false;
          if (!s) return true;
          const hay = `${event.time} ${event.experience} ${event.location}`.toLowerCase();
          return hay.includes(s.toLowerCase());
        });
        return { ...yearData, events: filteredEvents };
      })
      .filter(yearData => yearData.events.length > 0);
  }, [yearsData, deferredSearch, yearStart, yearEnd]);

  // 处理年份选择
  const handleYearChange = (year: string) => {
    setSelectedYear(year === selectedYear ? '' : year);
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
          {/* 过滤栏 */}
          <div className="timeline-filter-card mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex-1">
              <label className="block text-sm text-charcoal/70 mb-2">搜索事件</label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="输入关键词（事件、地点、年份）"
                className="w-full rounded-md border border-charcoal/20 bg-white/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold/60"
              />
            </div>
            <div className="flex gap-3">
              <div>
                <label className="block text-sm text-charcoal/70 mb-2">起始年份</label>
                <input
                  type="number"
                  value={yearStart ?? ''}
                  onChange={e => setYearStart(e.target.value ? parseInt(e.target.value, 10) : null)}
                  placeholder={allYears.min?.toString() ?? ''}
                  className="w-28 rounded-md border border-charcoal/20 bg-white/60 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-charcoal/70 mb-2">结束年份</label>
                <input
                  type="number"
                  value={yearEnd ?? ''}
                  onChange={e => setYearEnd(e.target.value ? parseInt(e.target.value, 10) : null)}
                  placeholder={allYears.max?.toString() ?? ''}
                  className="w-28 rounded-md border border-charcoal/20 bg-white/60 px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* 主时间线 */}
          <main className="timeline-container pl-24"> {/* 为圆形导航栏留出空间 */}
            {filteredYears.length === 0 ? (
              <div className="text-center text-charcoal/60 py-12">未找到匹配的事件，请调整搜索或年份范围。</div>
            ) : (
              <TimelineEventList years={filteredYears} selectedYear={selectedYear} />
            )}
          </main>

          {/* 圆形时间导航栏 */}
          <TimelineCircularNavigation
            years={filteredYears}
            currentYear={selectedYear || filteredYears[0]?.year || ''}
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
