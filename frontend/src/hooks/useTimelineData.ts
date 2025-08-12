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

            const data: TimelineData = JSON.parse(text);
            setTimelineData(data);
            console.info('[Timeline] Loaded events', data?.length ?? 0);
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