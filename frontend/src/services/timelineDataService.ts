// 统一的时间线数据管理服务

import { 
  TimelineData, 
  DataSourceType, 
  DataLoadConfig, 
  TimelineError,
  LoadingState 
} from '../types/timelineTypes';
import { PersonData } from '../types/personTypes';
import { StaticJsonTransformer, PersonApiTransformer } from './dataTransformers';

// 缓存管理器
class CacheManager {
  private cache = new Map<string, { data: TimelineData; timestamp: number }>();
  private defaultExpiry = 5 * 60 * 1000; // 5分钟

  set(key: string, data: TimelineData, expiry?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + (expiry || this.defaultExpiry)
    });
  }

  get(key: string): TimelineData | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.timestamp) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const cached = this.cache.get(key);
    return cached ? Date.now() <= cached.timestamp : false;
  }
}

// 统一的时间线数据服务
export class TimelineDataService {
  private cacheManager = new CacheManager();
  private staticTransformer = new StaticJsonTransformer();
  private personTransformer = new PersonApiTransformer();
  private loadingState: LoadingState = {
    isLoading: false,
    error: null
  };
  private listeners: Array<(state: LoadingState) => void> = [];

  // 订阅加载状态变化
  subscribe(listener: (state: LoadingState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // 通知状态变化
  private notifyStateChange(): void {
    this.listeners.forEach(listener => listener({ ...this.loadingState }));
  }

  // 设置加载状态
  private setLoadingState(state: Partial<LoadingState>): void {
    this.loadingState = { ...this.loadingState, ...state };
    this.notifyStateChange();
  }

  // 获取当前加载状态
  getLoadingState(): LoadingState {
    return { ...this.loadingState };
  }

  // 主要的数据加载方法
  async loadTimelineData(config: DataLoadConfig): Promise<TimelineData> {
    const cacheKey = this.generateCacheKey(config);
    
    // 检查缓存
    if (config.enableCache && this.cacheManager.has(cacheKey)) {
      const cachedData = this.cacheManager.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    this.setLoadingState({ isLoading: true, error: null });

    try {
      let timelineData: TimelineData;

      switch (config.sourceType) {
        case DataSourceType.STATIC_JSON:
          timelineData = await this.loadFromStaticJson(config.staticJsonPath!);
          break;
        case DataSourceType.PERSON_API:
          timelineData = await this.loadFromPersonApi(config.personApiEndpoint!);
          break;
        case DataSourceType.MIXED:
          timelineData = await this.loadMixedData(config);
          break;
        default:
          throw new Error(`Unsupported data source type: ${config.sourceType}`);
      }

      // 验证数据
      if (!this.validateTimelineData(timelineData)) {
        throw new Error('Invalid timeline data structure');
      }

      // 缓存数据
      if (config.enableCache) {
        this.cacheManager.set(cacheKey, timelineData, config.cacheExpiry);
      }

      this.setLoadingState({ isLoading: false, error: null });
      return timelineData;

    } catch (error) {
      const timelineError: TimelineError = {
        code: 'LOAD_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error
      };
      
      this.setLoadingState({ isLoading: false, error: timelineError });
      throw timelineError;
    }
  }

  // 从静态JSON加载数据
  private async loadFromStaticJson(jsonPath: string): Promise<TimelineData> {
    const response = await fetch(jsonPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch static JSON: ${response.status}`);
    }
    
    const rawData = await response.json();
    return this.staticTransformer.transform(rawData);
  }

  // 从人物API加载数据
  private async loadFromPersonApi(apiEndpoint: string): Promise<TimelineData> {
    const response = await fetch(apiEndpoint);
    if (!response.ok) {
      throw new Error(`Failed to fetch person API: ${response.status}`);
    }
    
    const rawData: PersonData = await response.json();
    return this.personTransformer.transform(rawData);
  }

  // 混合数据源加载
  private async loadMixedData(config: DataLoadConfig): Promise<TimelineData> {
    const [staticData, personData] = await Promise.all([
      config.staticJsonPath ? this.loadFromStaticJson(config.staticJsonPath) : null,
      config.personApiEndpoint ? this.loadFromPersonApi(config.personApiEndpoint) : null
    ]);

    // 合并数据逻辑
    if (staticData && personData) {
      return this.mergeTimelineData(staticData, personData);
    }
    
    return staticData || personData || { groups: [], metadata: { totalEvents: 0, timeRange: { start: '', end: '' } } };
  }

  // 合并时间线数据
  private mergeTimelineData(staticData: TimelineData, personData: TimelineData): TimelineData {
    // 简单的合并策略：优先使用静态数据，补充人物API数据
    const mergedGroups = [...staticData.groups];
    
    // 可以根据需要实现更复杂的合并逻辑
    personData.groups.forEach(personGroup => {
      const existingGroup = mergedGroups.find(g => 
        g.core_event.includes(personGroup.core_event) || 
        personGroup.core_event.includes(g.core_event)
      );
      
      if (!existingGroup) {
        mergedGroups.push(personGroup);
      }
    });

    return {
      groups: mergedGroups,
      metadata: {
        totalEvents: mergedGroups.reduce((sum, group) => sum + group.timeline.length, 0),
        timeRange: staticData.metadata?.timeRange || { start: '', end: '' },
        lastUpdated: new Date().toISOString()
      }
    };
  }

  // 验证时间线数据
  private validateTimelineData(data: TimelineData): boolean {
    return this.staticTransformer.validate(data);
  }

  // 生成缓存键
  private generateCacheKey(config: DataLoadConfig): string {
    return `timeline_${config.sourceType}_${config.staticJsonPath || ''}_${config.personApiEndpoint || ''}`;
  }

  // 清除缓存
  clearCache(): void {
    this.cacheManager.clear();
  }

  // 预加载数据
  async preloadData(configs: DataLoadConfig[]): Promise<void> {
    const promises = configs.map(config => 
      this.loadTimelineData(config).catch(error => {
        console.warn('Preload failed for config:', config, error);
      })
    );
    
    await Promise.allSettled(promises);
  }
}

// 导出单例实例
export const timelineDataService = new TimelineDataService();