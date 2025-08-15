import { useState, useEffect } from 'react';

interface TimelineEvent {
  time: string;
  experience: string;
  image: string;
  location: string;
  timespot?: number; // 1 for background events
}

interface CoreEvent {
  core_event: string;
  timeline: TimelineEvent[];
}

export type TimelineData = CoreEvent[];

export function useTimelineData() {
  const [timelineData, setTimelineData] = useState<TimelineData>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 数据验证函数
  const validateTimelineData = (data: unknown): data is TimelineData => {
    if (!Array.isArray(data)) return false;
    
    for (const item of data) {
      if (!item || typeof item !== 'object') return false;
      if (!item.core_event || typeof item.core_event !== 'string') return false;
      if (!Array.isArray(item.timeline)) return false;
      
      for (const event of item.timeline) {
        if (!event || typeof event !== 'object') return false;
        if (!event.time || typeof event.time !== 'string') return false;
        if (!event.experience || typeof event.experience !== 'string') return false;
        if (!event.image || typeof event.image !== 'string') return false;
        if (!event.location || typeof event.location !== 'string') return false;
      }
    }
    return true;
  };

  useEffect(() => {
    const loadTimelineData = async () => {
      try {
        // 调试：候选路径（优先使用 Vite BASE_URL + public 真实路径）
        const base = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL || '/';
        const candidates = [
          `${base.replace(/\/$/, '')}/data/json/timeline.json`, // 实际存在的路径
          `${base.replace(/\/$/, '')}/data/timeline.json`       // 兼容旧路径
        ];

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
            
            // 数据验证
            if (!validateTimelineData(data)) {
              console.error('[Timeline] Invalid data structure:', data);
              throw new Error('Invalid timeline data structure');
            }
            
            setTimelineData(data);
            console.info('[Timeline] Loaded events', data.length);
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
        }
        console.error('加载时间线数据失败:', e);
        setTimelineData([]);
      } finally {
        setLoading(false);
      }
    };

    loadTimelineData();
  }, []);

  return { timelineData, loading, error };
}