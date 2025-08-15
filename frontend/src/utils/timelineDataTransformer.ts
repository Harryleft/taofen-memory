import { TimelineData } from '@/hooks/useTimelineData';

// 事件分组接口 - 符合TimelineEventList期望的格式
export interface TimelineYear {
  year: string;
  label: string;
  events: Array<{
    time: string;
    experience: string;
    image: string;
    location: string;
    timespot?: number;
  }>;
}

// 阶段定义 - 基于参考设计
export const periods = [
  { id: 'early', name: '求学成长期', color: '#A7C4E0', years: '1895-1921' },
  { id: 'middle', name: '事业发展期', color: '#7FA8CC', years: '1922-1936' },
  { id: 'late', name: '救亡图存期', color: '#5B8CB8', years: '1937-1944' }
] as const;

// 从年份判断所属阶段（预留功能）
// function getPeriodFromYear(year: number): 'early' | 'middle' | 'late' {
//   if (year <= 1921) return 'early';
//   if (year <= 1936) return 'middle';
//   return 'late';
// }

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

// 将原始数据按年份组织（保持原始事件格式）
export function transformTimelineData(data: TimelineData): TimelineYear[] {
  const yearMap = new Map<string, Array<{
    time: string;
    experience: string;
    image: string;
    location: string;
    timespot?: number;
  }>>();
  
  // 遍历所有核心事件
  data.forEach((coreEvent) => {
    coreEvent.timeline.forEach((event) => {
      const year = extractYear(event.time);
      if (!year) return; // 跳过没有年份的事件
      
      const yearKey = year.toString();
      
      if (!yearMap.has(yearKey)) {
        yearMap.set(yearKey, []);
      }
      
      yearMap.get(yearKey)?.push(event);
    });
  });
  
  // 转换为TimelineYear数组格式
  const result = Array.from(yearMap.entries())
    .map(([year, events]) => ({
      year,
      label: `${year}年的重要事件`,
      events: events.sort((a, b) => a.time.localeCompare(b.time))
    }))
    .sort((a, b) => parseInt(a.year) - parseInt(b.year));
  
  return result;
}

// 获取所有年份的范围
export function getYearRange(yearsData: TimelineYear[]) {
  if (yearsData.length === 0) return { min: null, max: null };
  
  const years = yearsData.map(y => parseInt(y.year));
  return {
    min: Math.min(...years),
    max: Math.max(...years)
  };
}

// 导出年份提取函数供其他组件使用
export { extractYear };