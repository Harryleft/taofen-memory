// 浏览器环境中的简单哈希函数
const createHash = () => ({
  update: (str: string) => ({
    digest: () => {
      // 简单的哈希函数
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash).toString(16);
    }
  })
});

// 缓存策略接口
interface CacheStrategy {
  ttl: number; // 过期时间（毫秒）
  level: 'memory'; // 前端只支持内存缓存
  compress?: boolean; // 是否压缩
}

// 缓存统计接口
interface CacheStats {
  hits: number;
  misses: number;
  totalRequests: number;
  hitRate: number;
  averageResponseTime: number;
}

// 缓存配置接口
interface CacheConfig {
  memory: {
    maxSize: number; // 内存缓存最大条目数
  };
  defaults: {
    ttl: number; // 默认TTL
  };
}

// 预定义缓存策略
export const CACHE_STRATEGIES = {
  // 原始数据缓存 - 24小时
  RAW_DATA: {
    ttl: 24 * 60 * 60 * 1000,
    level: 'memory' as const,
  },
  
  // 转换数据缓存 - 24小时
  TRANSFORMED_DATA: {
    ttl: 24 * 60 * 60 * 1000,
    level: 'memory' as const,
  },
  
  // 过滤结果缓存 - 5分钟
  FILTERED_DATA: {
    ttl: 5 * 60 * 1000,
    level: 'memory' as const,
  },
  
  // 搜索结果缓存 - 3分钟
  SEARCH_RESULT: {
    ttl: 3 * 60 * 1000,
    level: 'memory' as const,
  },
  
  // 元数据缓存 - 1小时
  METADATA: {
    ttl: 60 * 60 * 1000,
    level: 'memory' as const,
  },
  
  // 布局缓存 - 1分钟
  LAYOUT: {
    ttl: 60 * 1000,
    level: 'memory' as const,
  },
};

// 缓存键生成器
export class CacheKeyGenerator {
  // 原始数据键
  static rawData(): string {
    return 'handwriting:raw:data';
  }
  
  // 转换数据键
  static transformedData(): string {
    return 'handwriting:transformed:data';
  }
  
  // 过滤结果键
  static filteredData(filters: Record<string, unknown>): string {
    const hash = CacheKeyGenerator.hashObject(filters);
    return `handwriting:filtered:${hash}`;
  }
  
  // 搜索结果键
  static searchResult(searchTerm: string, filters: Record<string, unknown>): string {
    const filterHash = CacheKeyGenerator.hashObject(filters);
    const searchHash = CacheKeyGenerator.hashString(searchTerm);
    return `handwriting:search:${searchHash}:${filterHash}`;
  }
  
  // 元数据键
  static metadata(type: 'years' | 'sources' | 'tags'): string {
    return `handwriting:metadata:${type}`;
  }
  
  // 布局键
  static layout(items: { id: string }[], columns: number): string {
    const itemsHash = CacheKeyGenerator.hashObject(items.map(item => item.id));
    return `handwriting:layout:${itemsHash}:${columns}`;
  }
  
  // 对象哈希
  private static hashObject(obj: Record<string, unknown>): string {
    const str = JSON.stringify(obj);
    return this.hashString(str);
  }
  
  // 字符串哈希
  private static hashString(str: string): string {
    return createHash().update(str).digest().substring(0, 8);
  }
}

// 内存缓存实现（LRU）
class MemoryCache {
  private cache = new Map<string, { value: unknown; expires: number }>();
  private maxSize: number;
  
  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }
  
  get(key: string): unknown {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    // 移动到最前面（LRU）
    this.cache.delete(key);
    this.cache.set(key, item);
    
    return item.value;
  }
  
  set(key: string, value: unknown, ttl: number): void {
    // 清理过期项
    this.cleanup();
    
    // 如果超过最大大小，删除最旧的项
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl
    });
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }
}

// 内存缓存管理器（前端专用）
export class MemoryCacheManager {
  private memoryCache: MemoryCache;
  private stats: CacheStats;
  private config: CacheConfig;
  
  constructor(config: CacheConfig) {
    this.config = config;
    this.memoryCache = new MemoryCache(config.memory.maxSize);
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      hitRate: 0,
      averageResponseTime: 0,
    };
  }
  
  // 获取缓存数据
  async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now();
    this.stats.totalRequests++;
    
    const result = this.memoryCache.get(key);
    if (result) {
      this.stats.hits++;
      this.updateStats(startTime);
      return result as T;
    }
    
    this.stats.misses++;
    this.updateStats(startTime);
    return null;
  }
  
  // 设置缓存数据
  async set<T>(key: string, value: T, strategy: CacheStrategy = CACHE_STRATEGIES.RAW_DATA): Promise<void> {
    this.memoryCache.set(key, value, strategy.ttl);
  }
  
  // 删除缓存
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
  }
  
  // 按模式删除缓存
  async deleteByPattern(pattern: string): Promise<void> {
    for (const [key] of this.memoryCache['cache'].entries()) {
      if (this.keyMatchesPattern(key, pattern)) {
        this.memoryCache.delete(key);
      }
    }
  }
  
  // 清空所有缓存
  async clear(): Promise<void> {
    this.memoryCache.clear();
  }
  
  // 获取缓存统计
  getStats(): CacheStats {
    return { ...this.stats };
  }
  
  // 重置统计
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      hitRate: 0,
      averageResponseTime: 0,
    };
  }
  
  // 更新统计信息
  private updateStats(startTime: number): void {
    const responseTime = Date.now() - startTime;
    this.stats.hitRate = this.stats.hits / this.stats.totalRequests;
    this.stats.averageResponseTime = 
      (this.stats.averageResponseTime * (this.stats.totalRequests - 1) + responseTime) / 
      this.stats.totalRequests;
  }
  
  // 检查键是否匹配模式
  private keyMatchesPattern(key: string, pattern: string): boolean {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(key);
  }
}

// 手稿缓存管理器（专门为手稿组件定制）
export class HandwritingCacheManager extends MemoryCacheManager {
  constructor(config?: Partial<CacheConfig>) {
    const defaultConfig: CacheConfig = {
      memory: {
        maxSize: 1000,
      },
      defaults: {
        ttl: 60 * 60 * 1000, // 1小时
      },
    };
    
    super({ ...defaultConfig, ...config });
  }
  
  // 获取原始数据
  async getRawData(): Promise<unknown[] | null> {
    return this.get<unknown[]>(CacheKeyGenerator.rawData(), CACHE_STRATEGIES.RAW_DATA);
  }
  
  // 设置原始数据
  async setRawData(data: unknown[]): Promise<void> {
    await this.set(CacheKeyGenerator.rawData(), data, CACHE_STRATEGIES.RAW_DATA);
  }
  
  // 获取转换后数据
  async getTransformedData(): Promise<TransformedHandwritingItem[] | null> {
    return this.get<TransformedHandwritingItem[]>(
      CacheKeyGenerator.transformedData(), 
      CACHE_STRATEGIES.TRANSFORMED_DATA
    );
  }
  
  // 设置转换后数据
  async setTransformedData(data: TransformedHandwritingItem[]): Promise<void> {
    await this.set(
      CacheKeyGenerator.transformedData(), 
      data, 
      CACHE_STRATEGIES.TRANSFORMED_DATA
    );
  }
  
  // 获取过滤结果
  async getFilteredData(filters: Record<string, unknown>): Promise<TransformedHandwritingItem[] | null> {
    const key = CacheKeyGenerator.filteredData(filters);
    return this.get<TransformedHandwritingItem[]>(key, CACHE_STRATEGIES.FILTERED_DATA);
  }
  
  // 设置过滤结果
  async setFilteredData(filters: Record<string, unknown>, data: TransformedHandwritingItem[]): Promise<void> {
    const key = CacheKeyGenerator.filteredData(filters);
    await this.set(key, data, CACHE_STRATEGIES.FILTERED_DATA);
  }
  
  // 获取搜索结果
  async getSearchResult(searchTerm: string, filters: Record<string, unknown>): Promise<TransformedHandwritingItem[] | null> {
    const key = CacheKeyGenerator.searchResult(searchTerm, filters);
    return this.get<TransformedHandwritingItem[]>(key, CACHE_STRATEGIES.SEARCH_RESULT);
  }
  
  // 设置搜索结果
  async setSearchResult(searchTerm: string, filters: Record<string, unknown>, data: TransformedHandwritingItem[]): Promise<void> {
    const key = CacheKeyGenerator.searchResult(searchTerm, filters);
    await this.set(key, data, CACHE_STRATEGIES.SEARCH_RESULT);
  }
  
  // 获取元数据
  async getMetadata(type: 'years' | 'sources' | 'tags'): Promise<unknown[] | null> {
    const key = CacheKeyGenerator.metadata(type);
    return this.get<unknown[]>(key, CACHE_STRATEGIES.METADATA);
  }
  
  // 设置元数据
  async setMetadata(type: 'years' | 'sources' | 'tags', data: unknown[]): Promise<void> {
    const key = CacheKeyGenerator.metadata(type);
    await this.set(key, data, CACHE_STRATEGIES.METADATA);
  }
  
  // 获取布局
  async getLayout(items: { id: string }[], columns: number): Promise<unknown | null> {
    const key = CacheKeyGenerator.layout(items, columns);
    return this.get<unknown>(key, CACHE_STRATEGIES.LAYOUT);
  }
  
  // 设置布局
  async setLayout(items: { id: string }[], columns: number, data: unknown): Promise<void> {
    const key = CacheKeyGenerator.layout(items, columns);
    await this.set(key, data, CACHE_STRATEGIES.LAYOUT);
  }
  
  // 清理所有手稿相关缓存
  async clearHandwritingCache(): Promise<void> {
    await this.deleteByPattern('handwriting:*');
  }

  // 检查Redis连接状态（前端专用，总是返回false）
  async isRedisConnected(): Promise<boolean> {
    return false;
  }
  
  // 清理数据相关缓存（数据更新时调用）
  async clearDataCache(): Promise<void> {
    await this.deleteByPattern('handwriting:*:data');
    await this.deleteByPattern('handwriting:filtered:*');
    await this.deleteByPattern('handwriting:search:*');
    await this.deleteByPattern('handwriting:metadata:*');
  }
  
  // 关闭缓存管理器（前端专用，空实现）
  close(): void {
    // 前端内存缓存无需特殊清理
  }
}

// 类型定义
export interface TransformedHandwritingItem {
  id: string;
  title: string;
  year: number;
  date: string;
  category: string;
  description: string;
  image: string;
  highResImage: string;
  tags: string[];
  dimensions: {
    width: number;
    height: number;
  };
  originalData: Record<string, unknown>;
}

// 创建全局缓存管理器实例
export const createHandwritingCacheManager = () => {
  return new HandwritingCacheManager();
};

// 默认导出
export default HandwritingCacheManager;