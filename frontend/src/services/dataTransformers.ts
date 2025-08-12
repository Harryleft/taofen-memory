// 数据转换器实现

import { 
  BaseTimelineEvent, 
  CoreEventGroup, 
  TimelineData, 
  DataTransformer 
} from '../types/timelineTypes';
import { PersonData, PersonTimelineEvent } from '../types/personTypes';

// 原始数据类型定义
interface RawTimelineEvent {
  time: string;
  experience: string;
  location?: string;
  image: string;
  timespot?: number;
}


interface RawTimelineData {
  core_event: string;
  timeline: RawTimelineEvent[];
}

// 静态JSON数据转换器
export class StaticJsonTransformer implements DataTransformer<RawTimelineData[]> {
  transform(rawData: RawTimelineData[]): TimelineData {
    const groups: CoreEventGroup[] = rawData.map((group, index) => ({
      id: `group_${index}`,
      core_event: group.core_event,
      timeline: group.timeline.map((event: RawTimelineEvent, eventIndex: number) => ({
        id: `${index}_${eventIndex}`,
        time: event.time,
        experience: event.experience,
        location: event.location || '',
        image: event.image,
        timespot: event.timespot
      }))
    }));

    return {
      groups,
      metadata: {
        totalEvents: groups.reduce((sum, group) => sum + group.timeline.length, 0),
        timeRange: this.extractTimeRange(groups),
        lastUpdated: new Date().toISOString()
      }
    };
  }

  validate(data: TimelineData): boolean {
    return (
      Array.isArray(data.groups) &&
      data.groups.every(group => 
        typeof group.core_event === 'string' &&
        Array.isArray(group.timeline)
      )
    );
  }

  private extractTimeRange(groups: CoreEventGroup[]): { start: string; end: string } {
    const allEvents = groups.flatMap(group => group.timeline);
    const years = allEvents
      .map(event => this.extractYear(event.time))
      .filter(year => year !== null)
      .sort((a, b) => a! - b!);
    
    return {
      start: years.length > 0 ? `${years[0]}年` : '',
      end: years.length > 0 ? `${years[years.length - 1]}年` : ''
    };
  }

  private extractYear(timeStr: string): number | null {
    const match = timeStr.match(/(\d{4})/);
    return match ? parseInt(match[1]) : null;
  }
}

// 人物API数据转换器
export class PersonApiTransformer implements DataTransformer<PersonData> {
  transform(rawData: PersonData): TimelineData {
    const events: BaseTimelineEvent[] = [];
    
    rawData.data.forEach((yearData) => {
      yearData.items.forEach((event) => {
        // 过滤掉没有实质内容的事件
        if (!event.sub || event.sub.trim().length < 10) {
          return;
        }
        
        events.push({
          id: event.id,
          time: event.redater || `${yearData.year}年`,
          date: event.redate,
          title: this.extractTitle(event),
          experience: event.sub,
          location: this.extractLocation(event.sub),
          image: event.pic,
          details: this.extractDetails(event.sub)
        });
      });
    });

    // 按年份分组
    const groupedEvents = this.groupEventsByPeriod(events);
    
    return {
      groups: groupedEvents,
      metadata: {
        totalEvents: events.length,
        timeRange: {
          start: `${Math.min(...events.map(e => this.extractYear(e.time)).filter(y => y !== null))}年`,
          end: `${Math.max(...events.map(e => this.extractYear(e.time)).filter(y => y !== null))}年`
        },
        lastUpdated: new Date().toISOString()
      }
    };
  }

  validate(data: TimelineData): boolean {
    return (
      Array.isArray(data.groups) &&
      data.groups.every(group => 
        typeof group.core_event === 'string' &&
        Array.isArray(group.timeline)
      )
    );
  }

  private extractTitle(event: PersonTimelineEvent): string {
    const description = event.sub;
    const firstSentence = description.split('。')[0];
    
    if (firstSentence.length > 30) {
      const keyActions = ['出生', '考入', '毕业', '创办', '担任', '发表', '出版', '逝世', '组织', '参加'];
      
      for (const action of keyActions) {
        if (firstSentence.includes(action)) {
          const parts = firstSentence.split(action);
          if (parts.length >= 2) {
            return `${action}${parts[1].substring(0, 15)}`;
          }
        }
      }
      
      return firstSentence.substring(0, 20) + '...';
    }
    
    return firstSentence;
  }

  private extractLocation(description: string): string {
    const locations = ['上海', '北京', '福建', '福州', '永安', '广州', '重庆', '汉口', '香港', '南京', '杭州'];
    
    for (const location of locations) {
      if (description.includes(location)) {
        return location;
      }
    }
    
    return '';
  }

  private extractDetails(description: string): string[] {
    const sentences = description.split('。').filter(s => s.trim().length > 0);
    
    if (sentences.length <= 1) {
      return [];
    }
    
    return sentences.slice(1, 4).map(s => s.trim() + '。');
  }

  private extractYear(timeStr: string): number | null {
    const match = timeStr.match(/(\d{4})/);
    return match ? parseInt(match[1]) : null;
  }

  private groupEventsByPeriod(events: BaseTimelineEvent[]): CoreEventGroup[] {
    // 按年份排序
    const sortedEvents = events.sort((a, b) => {
      const yearA = this.extractYear(a.time) || 0;
      const yearB = this.extractYear(b.time) || 0;
      return yearA - yearB;
    });

    // 简单的时期划分逻辑（可以根据需要调整）
    const periods = [
      { name: '早年时期', startYear: 1895, endYear: 1920 },
      { name: '求学与初入社会', startYear: 1921, endYear: 1930 },
      { name: '办报生涯', startYear: 1931, endYear: 1940 },
      { name: '抗战时期', startYear: 1941, endYear: 1944 }
    ];

    return periods.map((period, index) => {
      const periodEvents = sortedEvents.filter(event => {
        const year = this.extractYear(event.time);
        return year && year >= period.startYear && year <= period.endYear;
      });

      return {
        id: `period_${index}`,
        core_event: period.name,
        timeline: periodEvents
      };
    }).filter(group => group.timeline.length > 0);
  }
}