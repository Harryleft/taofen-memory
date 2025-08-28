/**
 * 缓存服务API客户端
 * 提供统一的缓存操作接口
 */

export interface CacheResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  result?: unknown;
}

export interface IIIFInfoResponse {
  source: 'cache' | 'remote' | 'stale';
  data: unknown;
}

export interface IIIFImageResponse {
  source: 'cache' | 'remote';
  data: {
    buffer: ArrayBuffer;
    contentType: string;
    size: number;
  };
}

export interface CacheStats {
  connected: boolean;
  memory_used: unknown;
  keyspace: string;
  uptime: string;
}

class CacheService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api/cache';
  }

  /**
   * 获取IIIF信息
   */
  async getIIIFInfo(identifier: string): Promise<IIIFInfoResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/iiif/info/${encodeURIComponent(identifier)}`);
      
      if (!response.ok) {
        throw new Error(`获取IIIF信息失败: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('获取IIIF信息失败:', error);
      throw error;
    }
  }

  /**
   * 获取IIIF图像
   */
  async getIIIFImage(
    identifier: string,
    params: {
      region: string;
      size: string;
      rotation: string;
      quality: string;
    }
  ): Promise<IIIFImageResponse> {
    try {
      const { region, size, rotation, quality } = params;
      const response = await fetch(
        `${this.baseUrl}/iiif/region/${encodeURIComponent(identifier)}/${encodeURIComponent(region)}/${encodeURIComponent(size)}/${encodeURIComponent(rotation)}/${encodeURIComponent(quality)}`
      );
      
      if (!response.ok) {
        throw new Error(`获取IIIF图像失败: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('获取IIIF图像失败:', error);
      throw error;
    }
  }

  /**
   * 设置缓存
   */
  async set(key: string, value: unknown, ttl?: number): Promise<CacheResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/set`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value, ttl }),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('设置缓存失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取缓存
   */
  async get(key: string): Promise<CacheResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/get/${encodeURIComponent(key)}`);
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('获取缓存失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<CacheResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/delete/${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('删除缓存失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 批量获取缓存
   */
  async mget(keys: string[]): Promise<CacheResponse<unknown[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/mget`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keys }),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('批量获取缓存失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 清空缓存
   */
  async clear(pattern = '*'): Promise<CacheResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pattern }),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('清空缓存失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取缓存统计
   */
  async getStats(): Promise<CacheResponse<CacheStats>> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`);
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('获取缓存统计失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl.replace('/cache', '')}/health`);
      return response.ok;
    } catch (error) {
      console.error('缓存服务健康检查失败:', error);
      return false;
    }
  }

  /**
   * 预取IIIF信息
   */
  async prefetchIIIFInfo(identifiers: string[]): Promise<void> {
    try {
      await Promise.all(
        identifiers.map(identifier => this.getIIIFInfo(identifier))
      );
    } catch (error) {
      console.error('预取IIIF信息失败:', error);
    }
  }

  /**
   * 缓存键生成器
   */
  generateKey(prefix: string, ...parts: string[]): string {
    return [prefix, ...parts].join(':');
  }

  }

/**
 * IIIF图片参数接口
 */
interface IIIFImageParams {
  region: string;
  size: string;
  rotation: string;
  quality: string;
}

/**
 * IIIF缓存键生成器
 */
export function generateIIIFKey(identifier: string, type: 'info' | 'image', params?: IIIFImageParams): string {
  if (type === 'info') {
    return cacheService.generateKey('iiif', 'info', identifier);
  } else if (type === 'image' && params) {
    const { region, size, rotation, quality } = params;
    return cacheService.generateKey('iiif', 'image', identifier, region, size, rotation, quality);
  }
  return cacheService.generateKey('iiif', type, identifier);
}