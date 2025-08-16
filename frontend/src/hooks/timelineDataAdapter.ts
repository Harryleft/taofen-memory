import { TimelineEvent } from '../components/timeline/timeline-data.ts';
import { TimelineData } from './useTimelineData.ts';

/**
 * 时间线数据适配器
 * 将新的TimelineData结构转换为组件可用的TimelineEvent结构
 * 
 * Linus式设计原则：
 * 1. 消除所有特殊情况 - 统一处理所有数据格式
 * 2. 数据结构优先 - 先设计正确的数据流
 * 3. 单一职责 - 每个函数只做一件事
 * 4. 向后兼容 - 不破坏现有组件接口
 */

interface PeriodRange {
  start: number;
  end: number;
  id: 'early' | 'middle' | 'late';
}

// 时期定义 - 基于历史事实划分
const PERIODS: PeriodRange[] = [
  { start: 1895, end: 1921, id: 'early' },   // 求学成长期
  { start: 1922, end: 1936, id: 'middle' },  // 事业发展期  
  { start: 1937, end: 1944, id: 'late' }     // 救亡图存期
];

/**
 * 从时间字符串提取年份
 * 支持 "1895年", "1916年3月24日", "1931年9月18日" 等格式
 */
function extractYear(timeString: string): number {
  // 特殊处理"弥留之际"等情况
  if (timeString.includes('弥留之际') || timeString.includes('逝世') || timeString.includes('去世')) {
    return 1944; // 邹韬奋逝世年份
  }
  
  // 匹配4位数字年份
  const yearMatch = timeString.match(/(\d{4})/);
  if (!yearMatch) {
    console.warn(`无法从时间字符串提取年份: ${timeString}`);
    return 1900; // 默认年份
  }
  return parseInt(yearMatch[1], 10);
}

/**
 * 根据年份确定时期
 */
function getPeriodByYear(year: number): 'early' | 'middle' | 'late' {
  const period = PERIODS.find(p => year >= p.start && year <= p.end);
  return period?.id || 'middle'; // 默认middle
}

/**
 * 将experience分割为title和description
 * 尝试智能分割，取第一句作为标题
 */
function splitExperience(experience: string): { title: string; description: string } {
  // 尝试按句号、逗号分割
  const sentences = experience.split(/[。！？.!?]/).filter(s => s.trim().length > 0);
  
  if (sentences.length <= 1) {
    return {
      title: experience.length > 30 ? experience.substring(0, 30) + '...' : experience,
      description: experience
    };
  }
  
  return {
    title: sentences[0].trim(),
    description: experience
  };
}

/**
 * 生成唯一ID - 使用年份和索引组合确保唯一性
 */
function generateId(year: number, index: number): string {
  return `${year}-${index}`;
}

/**
 * 规范化图片URL
 */
function normalizeImageUrl(image: string): string {
  if (!image || image.trim() === '') {
    // 如果没有图片，返回空字符串而不是占位图片
    return '';
  }
  
  // 如果已经是完整URL，直接返回
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  
  // 如果以/开头，认为是相对路径
  if (image.startsWith('/')) {
    return image;
  }
  
  // 否则添加/前缀
  return `/${image}`;
}

/**
 * 主要适配函数 - 将新数据结构转换为旧格式
 * 这是核心函数，负责所有数据转换逻辑
 */
export function adaptTimelineData(newData: TimelineData): TimelineEvent[] {
  if (!Array.isArray(newData)) {
    console.error('适配器收到无效数据:', newData);
    return [];
  }

  // 展平嵌套结构并过滤背景事件
  const allEvents = newData.flatMap(coreEvent => {
    if (!coreEvent || !Array.isArray(coreEvent.timeline)) {
      console.warn('跳过无效的coreEvent:', coreEvent);
      return [];
    }
    
    return coreEvent.timeline
      .filter(event => !event.timespot) // 过滤掉背景事件(timespot=1)
      .map(event => ({
        ...event,
        coreEvent: coreEvent.core_event // 保留原始分类信息
      }));
  });

  // 按年份排序
  allEvents.sort((a, b) => extractYear(a.time) - extractYear(b.time));

  // 转换为目标格式
  return allEvents.map((event, index) => {
    const year = extractYear(event.time);
    const { title, description } = splitExperience(event.experience);
    
    return {
      id: generateId(year, index),
      year,
      title,
      description,
      details: [], // 清空details数组，地点信息现在有专门字段
      imageUrl: normalizeImageUrl(event.image),
      location: event.location || '', // 直接设置location字段
      period: getPeriodByYear(year)
    };
  });
}

/**
 * 验证适配后的数据
 */
export function validateAdaptedData(events: TimelineEvent[]): boolean {
  return events.every(event => 
    event.id && 
    event.year && 
    event.title && 
    event.description && 
    event.period
  );
}

/**
 * 调试工具函数 - 打印数据转换前后的对比
 */
export function debugDataTransformation(newData: TimelineData): void {
  console.group('🔧 时间线数据转换调试');
  
  console.log('原始数据结构:', {
    总分类数: newData.length,
    样本分类: newData[0]?.core_event,
    样本事件: newData[0]?.timeline[0]
  });
  
  const adapted = adaptTimelineData(newData);
  
  console.log('适配后数据结构:', {
    总事件数: adapted.length,
    样本事件: adapted[0],
    验证结果: validateAdaptedData(adapted)
  });
  
  console.groupEnd();
}
