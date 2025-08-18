import { useState, useEffect, useRef } from 'react';
import { adaptTimelineData } from './timelineDataAdapter';
import { TimelineEvent } from '@/types/personTypes.ts';

interface RawTimelineEvent {
  time: string;
  experience: string;
  image: string;
  location: string;
  timespot?: number; // 1 for background events
}

interface CoreEvent {
  core_event: string;
  timeline: RawTimelineEvent[];
}

export type TimelineData = CoreEvent[];

export function useTimelineData() {
  const [timelineData, setTimelineData] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const hasLoaded = useRef(false);

  // 数据验证函数
  const validateTimelineData = (data: unknown): data is TimelineData => {
    if (!Array.isArray(data)) {
      return false;
    }
    
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (!item || typeof item !== 'object') {
        return false;
      }
      
      if (!item.core_event || typeof item.core_event !== 'string') {
        return false;
      }
      
      if (!Array.isArray(item.timeline)) {
        return false;
      }
      
      for (let j = 0; j < item.timeline.length; j++) {
        const event = item.timeline[j];
        if (!event || typeof event !== 'object') {
          return false;
        }
        
        if (!event.time || typeof event.time !== 'string') {
          return false;
        }
        
        if (!event.experience || typeof event.experience !== 'string') {
          return false;
        }
        
        if (typeof event.image !== 'string') {
          return false;
        }
        
        if (typeof event.location !== 'string') {
          return false;
        }
      }
    }
    
    return true;
  };

  useEffect(() => {
    // 防止重复加载
    if (hasLoaded.current) {
      return;
    }

    const loadTimelineData = async () => {
      try {
        const base = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL || '/';
        const candidates = [
          `${base.replace(/\/$/, '')}/data/json/timeline.json`, // 实际存在的路径
          `${base.replace(/\/$/, '')}/data/timeline.json`       // 兼容旧路径
        ];

        let lastError: Error | null = null;
        for (const url of candidates) {
          try {
            const response = await fetch(url, { cache: 'no-cache' });
            if (!response.ok) {
              throw new Error(`HTTP ${response.status} when GET ${url}`);
            }

            const contentType = response.headers.get('content-type') || '';
            const text = await response.text();
            if (!contentType.includes('application/json')) {
              const snippet = text.slice(0, 180);
              throw new Error(`Invalid content-type: ${contentType}. Snippet: ${snippet}`);
            }

            const data = JSON.parse(text);
            
            // 数据验证
            if (!validateTimelineData(data)) {
              throw new Error('Invalid timeline data structure');
            }
            
            // 使用适配器转换数据
            const adaptedData = adaptTimelineData(data);
            setTimelineData(adaptedData);
            hasLoaded.current = true; // 标记数据已加载
            
            lastError = null;
            break;
          } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));
          }
        }

        if (lastError) {
          throw lastError;
        }
      } catch (e) {
        if (e instanceof Error) {
          setError(e);
        }
        setTimelineData([]);
      } finally {
        setLoading(false);
      }
    };

    loadTimelineData();
  }, []);

  return { timelineData, loading, error };
}
