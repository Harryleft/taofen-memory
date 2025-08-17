// 统一的时间线数据Hook

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  TimelineData, 
  DataSourceType, 
  DataLoadConfig, 
  TimelineError,
  LoadingState,
  BaseTimelineEvent
} from '../types/timelineTypes';
import { timelineDataService } from '../services/timelineDataService';

// Hook配置接口
interface UseTimelineDataConfig {
  sourceType?: DataSourceType;
  staticJsonPath?: string;
  personApiEndpoint?: string;
  enableCache?: boolean;
  cacheExpiry?: number;
  autoLoad?: boolean;
}

// Hook返回值接口
interface UseTimelineDataReturn {
  // 数据状态
  timelineData: TimelineData | null;
  loading: boolean;
  error: TimelineError | null;
  
  // 数据操作
  loadData: () => Promise<void>;
  refreshData: () => Promise<void>;
  clearCache: () => void;
  
  // 数据查询
  getEventById: (id: string | number) => BaseTimelineEvent | null;
  getEventsByYear: (year: number) => BaseTimelineEvent[];
  getEventsByLocation: (location: string) => BaseTimelineEvent[];
  searchEvents: (query: string) => BaseTimelineEvent[];
  
  // 统计信息
  totalEvents: number;
  timeRange: { start: string; end: string };
  groupCount: number;
}

// 默认配置
const DEFAULT_CONFIG: UseTimelineDataConfig = {
  sourceType: DataSourceType.STATIC_JSON,
  staticJsonPath: '/data/timeline.json',
  enableCache: true,
  cacheExpiry: 5 * 60 * 1000, // 5分钟
  autoLoad: true
};

export function useUnifiedTimelineData(config: UseTimelineDataConfig = {}): UseTimelineDataReturn {
  const finalConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  
  // 状态管理
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    error: null
  });

  // 数据加载配置
  const dataLoadConfig = useMemo((): DataLoadConfig => ({
    sourceType: finalConfig.sourceType!,
    staticJsonPath: finalConfig.staticJsonPath,
    personApiEndpoint: finalConfig.personApiEndpoint,
    enableCache: finalConfig.enableCache,
    cacheExpiry: finalConfig.cacheExpiry
  }), [finalConfig]);

  // 加载数据
  const loadData = useCallback(async () => {
    try {
      const data = await timelineDataService.loadTimelineData(dataLoadConfig);
      setTimelineData(data);
    } catch {
      // 错误状态由service内部管理
    }
  }, [dataLoadConfig]);

  // 刷新数据（清除缓存后重新加载）
  const refreshData = useCallback(async () => {
    timelineDataService.clearCache();
    await loadData();
  }, [loadData]);

  // 清除缓存
  const clearCache = useCallback(() => {
    timelineDataService.clearCache();
  }, []);

  // 订阅加载状态变化
  useEffect(() => {
    const unsubscribe = timelineDataService.subscribe(setLoadingState);
    return unsubscribe;
  }, []);

  // 自动加载数据
  useEffect(() => {
    if (finalConfig.autoLoad) {
      loadData();
    }
  }, [finalConfig.autoLoad, loadData]);

  // 数据查询方法
  const getEventById = useCallback((id: string | number): BaseTimelineEvent | null => {
    if (!timelineData) return null;
    
    for (const group of timelineData.groups) {
      const event = group.timeline.find(e => e.id === id);
      if (event) return event;
    }
    return null;
  }, [timelineData]);

  const getEventsByYear = useCallback((year: number): BaseTimelineEvent[] => {
    if (!timelineData) return [];
    
    const events: BaseTimelineEvent[] = [];
    timelineData.groups.forEach(group => {
      group.timeline.forEach(event => {
        const eventYear = extractYear(event.time);
        if (eventYear === year) {
          events.push(event);
        }
      });
    });
    return events;
  }, [timelineData]);

  const getEventsByLocation = useCallback((location: string): BaseTimelineEvent[] => {
    if (!timelineData) return [];
    
    const events: BaseTimelineEvent[] = [];
    timelineData.groups.forEach(group => {
      group.timeline.forEach(event => {
        if (event.location.includes(location)) {
          events.push(event);
        }
      });
    });
    return events;
  }, [timelineData]);

  const searchEvents = useCallback((query: string): BaseTimelineEvent[] => {
    if (!timelineData || !query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    const events: BaseTimelineEvent[] = [];
    
    timelineData.groups.forEach(group => {
      group.timeline.forEach(event => {
        const searchText = [
          event.experience,
          event.title || '',
          event.location,
          event.time
        ].join(' ').toLowerCase();
        
        if (searchText.includes(lowerQuery)) {
          events.push(event);
        }
      });
    });
    
    return events;
  }, [timelineData]);

  // 统计信息
  const totalEvents = useMemo(() => {
    return timelineData?.metadata?.totalEvents || 0;
  }, [timelineData]);

  const timeRange = useMemo(() => {
    return timelineData?.metadata?.timeRange || { start: '', end: '' };
  }, [timelineData]);

  const groupCount = useMemo(() => {
    return timelineData?.groups.length || 0;
  }, [timelineData]);

  return {
    // 数据状态
    timelineData,
    loading: loadingState.isLoading,
    error: loadingState.error,
    
    // 数据操作
    loadData,
    refreshData,
    clearCache,
    
    // 数据查询
    getEventById,
    getEventsByYear,
    getEventsByLocation,
    searchEvents,
    
    // 统计信息
    totalEvents,
    timeRange,
    groupCount
  };
}

// 辅助函数：从时间字符串提取年份
function extractYear(timeStr: string): number | null {
  const match = timeStr.match(/(\d{4})/);
  return match ? parseInt(match[1]) : null;
}

// 兼容性Hook：保持向后兼容
export function useTimelineData() {
  const { timelineData, loading, error } = useUnifiedTimelineData();
  
  // 转换为旧格式
  const legacyData = useMemo(() => {
    if (!timelineData) return [];
    
    return timelineData.groups.map(group => ({
      core_event: group.core_event,
      timeline: group.timeline.map(event => ({
        time: event.time,
        experience: event.experience,
        image: event.image || '',
        location: event.location,
        timespot: event.timespot
      }))
    }));
  }, [timelineData]);

  return {
    timelineData: legacyData,
    loading,
    error
  };
}