import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useTimelineData } from '@/hooks/useTimelineData';
import TimelineCoreEventSection from '@/components/timeline/TimelineCoreEventSection.tsx';
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

type CoreEvent = {
  core_event: string;
  timeline: TimelineEvent[];
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

  // 第一阶段新增：搜索 + 年份过滤 + 侧边索引 + 回到顶部
  const [search, setSearch] = useState('');
  const [yearStart, setYearStart] = useState<number | null>(null);
  const [yearEnd, setYearEnd] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const deferredSearch = useDeferredValue(search);

  const allYears = useMemo(() => {
    const years: number[] = [];
    timelineData.forEach(group =>
      group.timeline.forEach(ev => {
        const y = extractYear(ev.time);
        if (typeof y === 'number') years.push(y);
      })
    );
    if (years.length === 0) return { min: null as number | null, max: null as number | null };
    return { min: Math.min(...years), max: Math.max(...years) };
  }, [timelineData]);

  useEffect(() => {
    if (allYears.min !== null && allYears.max !== null) {
      setYearStart(prev => (prev === null ? (allYears.min as number) : prev));
      setYearEnd(prev => (prev === null ? (allYears.max as number) : prev));
    }
  }, [allYears.min, allYears.max]);

  const filteredData: CoreEvent[] = useMemo(() => {
    const s = deferredSearch.trim();
    const hasYearRange = typeof yearStart === 'number' && typeof yearEnd === 'number';

    return timelineData
      .map(group => {
        const filteredTimeline = group.timeline.filter(ev => {
          const y = extractYear(ev.time);
          const passYear = !hasYearRange || (typeof y === 'number' && y >= (yearStart as number) && y <= (yearEnd as number));
          if (!passYear) return false;
          if (!s) return true;
          const hay = `${group.core_event} ${ev.time} ${ev.experience} ${ev.location}`.toLowerCase();
          return hay.includes(s.toLowerCase());
        });
        return { ...group, timeline: filteredTimeline };
      })
      .filter(group => group.timeline.length > 0);
  }, [timelineData, deferredSearch, yearStart, yearEnd]);

  // Scrollspy：监听各核心段曝光并高亮侧边索引
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  sectionRefs.current = [];

  useEffect(() => {
    const nodes = sectionRefs.current.filter(Boolean) as HTMLElement[];
    if (nodes.length === 0) return;
    const obs = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          const idx = Number(visible[0].target.getAttribute('data-core-idx') || 0);
          setActiveIndex(idx);
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: [0, 0.2, 0.6] }
    );
    nodes.forEach(n => obs.observe(n));
    return () => obs.disconnect();
  }, [filteredData]);

  const handleJump = (idx: number) => {
    const node = sectionRefs.current[idx];
    if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

          <div className="timeline-two-col">
            {/* 侧边索引（桌面端可见） */}
            <aside className="timeline-sidenav hidden lg:block">
              <div className="timeline-sidenav-card">
                <div className="timeline-sidenav-title">核心事件</div>
                <ul className="timeline-sidenav-list">
                  {filteredData.map((g, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => handleJump(idx)}
                        className={`timeline-sidenav-item ${idx === activeIndex ? 'active' : ''}`}
                        title={g.core_event}
                        aria-current={idx === activeIndex ? 'true' : undefined}
                      >
                        {g.core_event}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* 主时间线 */}
            <main className="timeline-container">
              {filteredData.length === 0 ? (
                <div className="text-center text-charcoal/60 py-12">未找到匹配的事件，请调整搜索或年份范围。</div>
              ) : (
                filteredData.map((coreEvent, coreIndex) => (
                  <section
                    key={coreIndex}
                    id={`core-${coreIndex}`}
                    data-core-idx={coreIndex}
                    ref={(el) => (sectionRefs.current[coreIndex] = el)}
                    className="mb-12 clear-right"
                  >
                    <TimelineCoreEventSection coreEvent={coreEvent} coreIndex={coreIndex} />
                  </section>
                ))
              )}
            </main>
          </div>

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
