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
        const response = await fetch('/data/timeline.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: TimelineData = await response.json();
        setTimelineData(data);
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