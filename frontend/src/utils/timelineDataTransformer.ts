import { TimelineData } from '@/hooks/useTimelineData';

// 扁平化的时间轴事件接口 - 基于参考设计
export interface FlatTimelineEvent {
  id: string;
  year: number;
  title: string;
  description: string;
  details: string[];
  imageUrl: string;
  period: 'early' | 'middle' | 'late';
  originalCoreEvent?: string; // 保留原始数据引用
}

// 阶段定义 - 基于参考设计
export const periods = [
  { id: 'early', name: '求学成长期', color: '#A7C4E0', years: '1895-1921' },
  { id: 'middle', name: '事业发展期', color: '#7FA8CC', years: '1922-1936' },
  { id: 'late', name: '救亡图存期', color: '#5B8CB8', years: '1937-1944' }
] as const;

// 从年份判断所属阶段
function getPeriodFromYear(year: number): 'early' | 'middle' | 'late' {
  if (year <= 1921) return 'early';
  if (year <= 1936) return 'middle';
  return 'late';
}

// 提取年份的辅助函数
function extractYear(timeString: string): number | null {
  if (!timeString || typeof timeString !== 'string') return null;
  
  const patterns = [
    /(\d{4})年/,
    /(\d{4})/,
    /(\d{4})-(\d{1,2})-(\d{1,2})/,
  ];
  
  for (const pattern of patterns) {
    const match = timeString.match(pattern);
    if (match) {
      const year = parseInt(match[1], 10);
      if (year >= 1800 && year <= 2100) {
        return year;
      }
    }
  }
  
  return null;
}

// 将原始数据转换为扁平结构
export function transformTimelineData(data: TimelineData): FlatTimelineEvent[] {
  const flatEvents: FlatTimelineEvent[] = [];
  
  data.forEach((coreEvent) => {
    coreEvent.timeline.forEach((event, eventIndex) => {
      const year = extractYear(event.time);
      if (!year) return; // 跳过没有年份的事件
      
      const id = `${year}-${eventIndex}`; // 简单的ID生成
      
      flatEvents.push({
        id,
        year,
        title: event.experience,
        description: `${event.time} - ${event.location}`,
        details: [
          event.experience,
          event.location,
          event.time
        ].filter(Boolean),
        imageUrl: event.image,
        period: getPeriodFromYear(year),
        originalCoreEvent: coreEvent.core_event
      });
    });
  });
  
  // 按年份排序
  return flatEvents.sort((a, b) => a.year - b.year);
}

// 将扁平数据按年份分组（用于兼容现有组件）
export function groupEventsByYear(events: FlatTimelineEvent[]) {
  const yearMap = new Map<number, FlatTimelineEvent[]>();
  
  events.forEach(event => {
    if (!yearMap.has(event.year)) {
      yearMap.set(event.year, []);
    }
    yearMap.get(event.year)?.push(event);
  });
  
  return Array.from(yearMap.entries())
    .map(([year, events]) => ({
      year: year.toString(),
      label: `${year}年的重要事件`,
      events: events.sort((a, b) => a.title.localeCompare(b.title))
    }))
    .sort((a, b) => parseInt(a.year) - parseInt(b.year));
}

// 获取所有年份的范围
export function getYearRange(events: FlatTimelineEvent[]) {
  if (events.length === 0) return { min: null, max: null };
  
  const years = events.map(e => e.year);
  return {
    min: Math.min(...years),
    max: Math.max(...years)
  };
}

// 导出年份提取函数供其他组件使用
export { extractYear };

// 过滤事件的工具函数
export function filterEvents(
  events: FlatTimelineEvent[],
  searchQuery: string = '',
  yearStart?: number | null,
  yearEnd?: number | null
): FlatTimelineEvent[] {
  return events.filter(event => {
    // 年份范围过滤
    if (typeof yearStart === 'number' && event.year < yearStart) return false;
    if (typeof yearEnd === 'number' && event.year > yearEnd) return false;
    
    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const searchableText = [
        event.title,
        event.description,
        ...event.details,
        event.year.toString()
      ].join(' ').toLowerCase();
      
      return searchableText.includes(query);
    }
    
    return true;
  });
}