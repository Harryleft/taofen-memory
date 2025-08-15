import { useState, useEffect } from 'react';
import { adaptTimelineData, debugDataTransformation } from './timelineDataAdapter';
import { TimelineEvent } from '../components/timeline-data.ts';

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

  // 数据验证函数
  const validateTimelineData = (data: unknown): data is TimelineData => {
    if (!Array.isArray(data)) {
      console.error('[Timeline] Validation failed: Not an array', data);
      return false;
    }
    
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (!item || typeof item !== 'object') {
        console.error(`[Timeline] Validation failed: Item ${i} is not an object`, item);
        return false;
      }
      
      if (!item.core_event || typeof item.core_event !== 'string') {
        console.error(`[Timeline] Validation failed: Item ${i} missing or invalid core_event`, item);
        return false;
      }
      
      if (!Array.isArray(item.timeline)) {
        console.error(`[Timeline] Validation failed: Item ${i} timeline is not an array`, item);
        return false;
      }
      
      for (let j = 0; j < item.timeline.length; j++) {
        const event = item.timeline[j];
        if (!event || typeof event !== 'object') {
          console.error(`[Timeline] Validation failed: Event ${j} in item ${i} is not an object`, event);
          return false;
        }
        
        if (!event.time || typeof event.time !== 'string') {
          console.error(`[Timeline] Validation failed: Event ${j} in item ${i} missing or invalid time`, event);
          return false;
        }
        
        if (!event.experience || typeof event.experience !== 'string') {
          console.error(`[Timeline] Validation failed: Event ${j} in item ${i} missing or invalid experience`, event);
          return false;
        }
        
        if (typeof event.image !== 'string') {
          console.error(`[Timeline] Validation failed: Event ${j} in item ${i} invalid image type`, event);
          return false;
        }
        
        if (typeof event.location !== 'string') {
          console.error(`[Timeline] Validation failed: Event ${j} in item ${i} invalid location type`, event);
          return false;
        }
      }
    }
    
    console.log('[Timeline] Validation passed for', data.length, 'items');
    return true;
  };

  useEffect(() => {
    const loadTimelineData = async () => {
      console.log('🐛 useTimelineData Debug - 开始加载数据');
      
      try {
        // 调试：候选路径（优先使用 Vite BASE_URL + public 真实路径）
        const base = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL || '/';
        const candidates = [
          `${base.replace(/\/$/, '')}/data/json/timeline.json`, // 实际存在的路径
          `${base.replace(/\/$/, '')}/data/timeline.json`       // 兼容旧路径
        ];
        
        console.log('🐛 useTimelineData Debug - 候选路径:', candidates);

        let lastError: Error | null = null;
        for (const url of candidates) {
          try {
            console.info('[Timeline] Fetching JSON', { url, base });
            const response = await fetch(url, { cache: 'no-cache' });
            console.info('[Timeline] Response meta', {
              ok: response.ok,
              status: response.status,
              redirected: response.redirected,
              finalURL: response.url
            });
            if (!response.ok) {
              throw new Error(`HTTP ${response.status} when GET ${url}`);
            }

            const contentType = response.headers.get('content-type') || '';
            console.info('[Timeline] Content-Type', contentType);
            const text = await response.text();
            if (!contentType.includes('application/json')) {
              const snippet = text.slice(0, 180);
              throw new Error(`Invalid content-type: ${contentType}. Snippet: ${snippet}`);
            }

            const data = JSON.parse(text);
            
            console.log('🐛 useTimelineData Debug - 解析后的原始数据:', {
              dataType: typeof data,
              isArray: Array.isArray(data),
              length: Array.isArray(data) ? data.length : 'N/A',
              sample: Array.isArray(data) ? data[0] : data
            });
            
            // 数据验证
            if (!validateTimelineData(data)) {
              console.error('[Timeline] Invalid data structure:', data);
              throw new Error('Invalid timeline data structure');
            }
            
            // 使用适配器转换数据
            const adaptedData = adaptTimelineData(data);
            setTimelineData(adaptedData);
            
            // 调试信息
            debugDataTransformation(data);
            console.info('[Timeline] Loaded events', adaptedData.length);
            console.log('🐛 useTimelineData Debug - 适配后数据设置成功:', {
              timelineData: adaptedData,
              length: adaptedData.length
            });
            lastError = null;
            break;
          } catch (err) {
            console.warn('[Timeline] Failed candidate', url, err);
            lastError = err instanceof Error ? err : new Error(String(err));
          }
        }

        if (lastError) {
          throw lastError;
        }
      } catch (e) {
        if (e instanceof Error) {
          setError(e);
          console.log('🐛 useTimelineData Debug - 设置错误状态:', e);
        }
        console.error('加载时间线数据失败:', e);
        setTimelineData([]);
        console.log('🐛 useTimelineData Debug - 设置空数据数组');
      } finally {
        setLoading(false);
        console.log('🐛 useTimelineData Debug - 设置loading为false');
      }
    };

    loadTimelineData();
  }, []);

  return { timelineData, loading, error };
}