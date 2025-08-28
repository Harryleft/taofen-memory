/**
 * 手写体图片缓存服务
 * 扩展现有缓存服务以支持瀑布流图片缓存
 */

import { CacheService } from './cache-service';

export interface ImageMetadata {
  id: string;
  url: string;
  dimensions: { width: number; height: number };
  format: 'jpg' | 'png' | 'webp';
  size: number;
  accessCount: number;
  lastAccessed: Date;
  loadTime: number;
}

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

export interface LayoutCache {
  items: string[];
  columns: number;
  viewport: { width: number; height: number };
  layout: { column: number; position: number }[];
  calculatedAt: Date;
}

export interface PreloadQueue {
  currentPage: number;
  nextPage: number;
  currentImages: string[];
  nextImages: string[];
  priority: 'high' | 'low';
  timestamp: Date;
}

export class ImageCacheService extends CacheService {
  private static instance: ImageCacheService;

  constructor() {
    super();
  }

  static getInstance(): ImageCacheService {
    if (!ImageCacheService.instance) {
      ImageCacheService.instance = new ImageCacheService();
    }
    return ImageCacheService.instance;
  }

  /**
   * 缓存图片元数据
   */
  async cacheImageMetadata(
    imageId: string,
    metadata: ImageMetadata,
    ttl: number = 86400
  ): Promise<boolean> {
    // 检查连接状态
    if (!this.getConnectionStatus()) {
      console.warn('缓存服务未连接，跳过缓存图片元数据');
      return false;
    }

    try {
      const response = await this.set(`image:metadata:${imageId}`, metadata, ttl);
      return response.success;
    } catch (error) {
      console.error('Failed to cache image metadata:', error);
      return false;
    }
  }

  /**
   * 获取图片元数据
   */
  async getImageMetadata(imageId: string): Promise<ImageMetadata | null> {
    // 检查连接状态
    if (!this.getConnectionStatus()) {
      console.warn('缓存服务未连接，跳过获取图片元数据');
      return null;
    }

    try {
      const response = await this.get(`image:metadata:${imageId}`);
      return response.success ? response.data as ImageMetadata : null;
    } catch (error) {
      console.error('Failed to get image metadata:', error);
      return null;
    }
  }

  /**
   * 缓存图片尺寸
   */
  async cacheImageDimensions(
    imageId: string,
    dimensions: ImageDimensions,
    ttl: number = 2592000
  ): Promise<boolean> {
    // 检查连接状态
    if (!this.getConnectionStatus()) {
      console.warn('缓存服务未连接，跳过缓存图片尺寸');
      return false;
    }

    try {
      const response = await this.set(`image:dimensions:${imageId}`, dimensions, ttl);
      return response.success;
    } catch (error) {
      console.error('Failed to cache image dimensions:', error);
      return false;
    }
  }

  /**
   * 获取图片尺寸
   */
  async getImageDimensions(imageId: string): Promise<ImageDimensions | null> {
    // 检查连接状态
    if (!this.getConnectionStatus()) {
      console.warn('缓存服务未连接，跳过获取图片尺寸');
      return null;
    }

    try {
      const response = await this.get(`image:dimensions:${imageId}`);
      return response.success ? response.data as ImageDimensions : null;
    } catch (error) {
      console.error('Failed to get image dimensions:', error);
      return null;
    }
  }

  /**
   * 批量获取图片尺寸
   */
  async batchGetImageDimensions(imageIds: string[]): Promise<Record<string, ImageDimensions>> {
    // 检查连接状态
    if (!this.getConnectionStatus()) {
      console.warn('缓存服务未连接，跳过批量获取图片尺寸');
      return {};
    }

    try {
      const keys = imageIds.map(id => `image:dimensions:${id}`);
      const response = await this.mget(keys);
      if (response.success && response.data) {
        const result: Record<string, ImageDimensions> = {};
        imageIds.forEach((id, index) => {
          if (response.data[index]) {
            result[id] = response.data[index] as ImageDimensions;
          }
        });
        return result;
      }
      return {};
    } catch (error) {
      console.error('Failed to batch get image dimensions:', error);
      return {};
    }
  }

  /**
   * 缓存瀑布流布局
   */
  async cacheLayout(
    layoutKey: string,
    layout: LayoutCache,
    ttl: number = 300
  ): Promise<boolean> {
    // 检查连接状态
    if (!this.getConnectionStatus()) {
      console.warn('缓存服务未连接，跳过缓存瀑布流布局');
      return false;
    }

    try {
      const response = await this.set(`image:layout:${layoutKey}`, layout, ttl);
      return response.success;
    } catch (error) {
      console.error('Failed to cache layout:', error);
      return false;
    }
  }

  /**
   * 获取瀑布流布局
   */
  async getLayout(layoutKey: string): Promise<LayoutCache | null> {
    // 检查连接状态
    if (!this.getConnectionStatus()) {
      console.warn('缓存服务未连接，跳过获取瀑布流布局');
      return null;
    }

    try {
      const response = await this.get(`image:layout:${layoutKey}`);
      return response.success ? response.data as LayoutCache : null;
    } catch (error) {
      console.error('Failed to get layout:', error);
      return null;
    }
  }

  /**
   * 缓存预加载队列
   */
  async cachePreloadQueue(
    queueId: string,
    queue: PreloadQueue,
    ttl: number = 60
  ): Promise<boolean> {
    // 检查连接状态
    if (!this.getConnectionStatus()) {
      console.warn('缓存服务未连接，跳过缓存预加载队列');
      return false;
    }

    try {
      const response = await this.set(`image:preload:${queueId}`, queue, ttl);
      return response.success;
    } catch (error) {
      console.error('Failed to cache preload queue:', error);
      return false;
    }
  }

  /**
   * 获取预加载队列
   */
  async getPreloadQueue(queueId: string): Promise<PreloadQueue | null> {
    // 检查连接状态
    if (!this.getConnectionStatus()) {
      console.warn('缓存服务未连接，跳过获取预加载队列');
      return null;
    }

    try {
      const response = await this.get(`image:preload:${queueId}`);
      return response.success ? response.data as PreloadQueue : null;
    } catch (error) {
      console.error('Failed to get preload queue:', error);
      return null;
    }
  }

  /**
   * 清除图片缓存
   */
  async clearImageCache(imageId: string): Promise<boolean> {
    // 检查连接状态
    if (!this.getConnectionStatus()) {
      console.warn('缓存服务未连接，跳过清除图片缓存');
      return false;
    }

    try {
      const response = await this.delete(`image:metadata:${imageId}`);
      const response2 = await this.delete(`image:dimensions:${imageId}`);
      return response.success && response2.success;
    } catch (error) {
      console.error('Failed to clear image cache:', error);
      return false;
    }
  }

  /**
   * 清除布局缓存
   */
  async clearLayoutCache(layoutKey: string): Promise<boolean> {
    // 检查连接状态
    if (!this.getConnectionStatus()) {
      console.warn('缓存服务未连接，跳过清除布局缓存');
      return false;
    }

    try {
      const response = await this.delete(`image:layout:${layoutKey}`);
      return response.success;
    } catch (error) {
      console.error('Failed to clear layout cache:', error);
      return false;
    }
  }

  /**
   * 获取图片缓存统计
   */
  async getImageCacheStats(): Promise<ImageCacheStats | null> {
    // 检查连接状态
    if (!this.getConnectionStatus()) {
      console.warn('缓存服务未连接，跳过获取图片缓存统计');
      return null;
    }

    try {
      const response = await this.get('image:stats');
      return response.success ? response.data as ImageCacheStats : null;
    } catch (error) {
      console.error('Failed to get image cache stats:', error);
      return null;
    }
  }

  /**
   * 生成布局缓存键
   */
  generateLayoutKey(
    items: string[],
    columns: number,
    viewport: { width: number; height: number }
  ): string {
    const itemsHash = this.hashArray(items);
    const viewportHash = this.hashObject(viewport);
    return `${viewportHash}:${columns}:${itemsHash}`;
  }

  /**
   * 生成预加载队列键
   */
  generatePreloadQueueKey(currentPage: number, itemsPerPage: number): string {
    return `page_${currentPage}_items_${itemsPerPage}`;
  }

  /**
   * 获取图片ID从URL
   */
  extractImageIdFromUrl(url: string): string {
    const match = url.match(/\/([^/]+)\.\w+$/);
    return match ? match[1] : url;
  }

  /**
   * 预获取图片尺寸
   */
  async prefetchImageDimensions(urls: string[]): Promise<Record<string, ImageDimensions>> {
    const imageIds = urls.map(url => this.extractImageIdFromUrl(url));
    
    // 先尝试从缓存获取
    const cachedDimensions = await this.batchGetImageDimensions(imageIds);
    
    // 找出未缓存的图片
    const uncachedUrls = urls.filter(url => {
      const imageId = this.extractImageIdFromUrl(url);
      return !cachedDimensions[imageId];
    });

    // 对于未缓存的图片，返回默认尺寸
    uncachedUrls.forEach(url => {
      const imageId = this.extractImageIdFromUrl(url);
      cachedDimensions[imageId] = {
        width: 320,
        height: 400,
        aspectRatio: 0.8
      };
    });

    return cachedDimensions;
  }

  /**
   * 智能缓存策略：基于访问频率调整TTL
   */
  async smartCacheStrategy(
    imageId: string,
    metadata: ImageMetadata,
    baseTTL: number = 86400
  ): Promise<void> {
    const accessMultiplier = Math.min(metadata.accessCount / 10, 5);
    const adjustedTTL = Math.floor(baseTTL * accessMultiplier);
    
    await this.cacheImageMetadata(imageId, metadata, adjustedTTL);
  }

  // 辅助方法
  private hashArray(arr: string[]): string {
    return this.hashObject(arr);
  }

  private hashObject(obj: Record<string, unknown>): string {
    const str = JSON.stringify(obj);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
}

/**
 * 图片缓存统计接口
 */
export interface ImageCacheStats {
  totalKeys: number;
  memoryUsage: number;
  hitRate: number;
  totalRequests: number;
  averageResponseTime: number;
  prefix: string;
  type: string;
}

// 导出单例实例
export const imageCacheService = ImageCacheService.getInstance();