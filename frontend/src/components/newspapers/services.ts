import { IIIFManifest } from '@/components/iiif/iiifTypes.ts';
import { isProduction, isDevelopment, logProduction, logDevelopment } from '../../utils/environment';
import { cacheService } from '@/services/cache/cache-service';

// IIIF信息接口
interface IIIFInfo {
  id?: string;
  type?: string;
  label?: { zh?: string[]; ['zh-CN']?: string[]; en?: string[] };
  metadata?: Array<any>;
  items?: Array<any>;
  thumbnail?: Array<any>;
  rights?: string;
  provider?: Array<any>;
  seeAlso?: Array<any>;
  service?: Array<any>;
}

// 环境感知的代理函数 - 生产环境彻底禁用代理
async function fetchWithProxy(url: string): Promise<Response> {
  if (isProduction) {
    // 生产环境：直接访问，绝对不使用代理
    logProduction('直接访问:', url);
    return fetch(url);
  } else if (isDevelopment) {
    // 开发环境：可以选择使用代理
    if (url.startsWith('https://')) {
      const proxyUrl = `/proxy?url=${encodeURIComponent(url)}`;
      logDevelopment('使用代理:', proxyUrl);
      return fetch(proxyUrl);
    }
  }
  
  // 默认情况：直接访问
  return fetch(url);
}

export interface PublicationItem {
  i: number;
  id: string;
  collection: string;
  title: string;
  name: string;
  issueCount: number;
  lastUpdated: string | null;
}

export interface IssueItem {
  i: number;
  manifest: string;
  title: string;
  summary: string;
}

// 分页加载参数接口
export interface PaginationParams {
  page: number;
  limit: number;
}

// 分页响应接口
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export class NewspaperService {
  static async getPublications(): Promise<PublicationItem[]> {
    const collectionUrl = this.buildProxyUrl('https://www.ai4dh.cn/iiif/3/manifests/collection.json');
    
    // 添加重试机制
    const maxRetries = 3;
    const retryDelay = 1000; // 1秒
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetchWithProxy(collectionUrl);
        if (!response.ok) {
          if (response.status === 404 && attempt < maxRetries) {
            console.warn(`获取刊物列表失败 (尝试 ${attempt}/${maxRetries}): HTTP ${response.status}`);
            await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
            continue;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const col = await response.json();
        
        // 简化数据处理 - 消除复杂的调试信息
        const publications = (col.items || []).map((it: IIIFCollectionItem, i: number) => {
          const collectionId = it.id.match(/([^/]+)\/collection\.json$/)?.[1] || it.id;
          
          return {
            i, 
            id: collectionId,
            collection: it.id,
            title: (it.label?.zh?.[0]) || (it.label?.['zh-CN']?.[0]) || (it.label?.en?.[0]) || '未知刊物',
            name: (it.label?.zh?.[0]) || (it.label?.['zh-CN']?.[0]) || (it.label?.en?.[0]) || '未知刊物',
            issueCount: 0,
            lastUpdated: null
          };
        });
        
        // 异步获取期数信息 - 使用批处理避免并发请求过多，添加错误容忍
        const BATCH_SIZE = 3; // 减少批大小以提高稳定性
        for (let i = 0; i < publications.length; i += BATCH_SIZE) {
          const batch = publications.slice(i, i + BATCH_SIZE);
          
          // 使用Promise.allSettled替代Promise.all，避免单个失败影响整个批次
          const results = await Promise.allSettled(
            batch.map(async (pub, index) => {
              try {
                const issues = await this.getIssuesForPublication(pub.collection);
                return { index, issues, success: true };
              } catch (e) {
                console.warn(`无法获取刊物 ${pub.title} 的期数信息:`, e);
                return { index, issues: [], success: false };
              }
            })
          );
          
          // 处理结果
          results.forEach(result => {
            if (result.status === 'fulfilled' && result.value.success) {
              const { index, issues } = result.value;
              publications[i + index].issueCount = issues.length;
              if (issues.length > 0) {
                publications[i + index].lastUpdated = issues[0].title || issues[0].summary;
              }
            }
          });
          
          // 批次间延迟，避免服务器限流
          if (i + BATCH_SIZE < publications.length) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
        
        return publications;
      } catch (e) { 
        console.error(`加载刊物列表失败 (尝试 ${attempt}/${maxRetries}):`, e);
        if (attempt === maxRetries) {
          // 最后一次尝试失败，返回空数组
          return [];
        }
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
    
    return []; // 如果所有重试都失败，返回空数组
  }
  
  static async getIssuesForPublication(collectionUrl: string): Promise<IssueItem[]> {
    // 添加重试机制
    const maxRetries = 2;
    const retryDelay = 1000;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetchWithProxy(collectionUrl);
        if (!response.ok) {
          if (response.status === 404 && attempt < maxRetries) {
            console.warn(`获取期刊目录失败 (尝试 ${attempt}/${maxRetries}): HTTP ${response.status}`);
            await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
            continue;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const col = await response.json();
        return (col.items || []).map((it: IIIFCollectionItem, i: number) => ({
          i, 
          id: it.id,
          manifest: it.id,
          title: (it.label?.['zh-CN']?.[0]) || (it.label?.zh?.[0]) || (it.label?.en?.[0]) || '未知期刊',
          summary: (it.summary?.['zh-CN']?.[0]) || (it.summary?.zh?.[0]) || (it.summary?.en?.[0]) || ''
        }));
      } catch (e) { 
        console.error(`加载目录失败 (尝试 ${attempt}/${maxRetries}):`, e);
        if (attempt === maxRetries) {
          return []; // 返回空数组作为降级方案
        }
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
    
    return []; // 如果所有重试都失败，返回空数组
  }

  static async getManifest(manifestId: string): Promise<IIIFManifest> {
    try {
      // 优先尝试从缓存获取IIIF信息
      if (await cacheService.healthCheck()) {
        try {
          const iiifInfo = await cacheService.getIIIFInfo(manifestId);
          if (iiifInfo && iiifInfo.data) {
            logDevelopment(`缓存命中: IIIF信息 ${manifestId}`);
            
            // 基于IIIF信息构建manifest
            const manifest = this.buildManifestFromIIIFInfo(manifestId, iiifInfo.data);
            return manifest;
          }
        } catch (cacheError) {
          logDevelopment(`缓存获取失败，降级到直接访问: ${cacheError}`);
        }
      }

      // 缓存未命中或服务不可用，直接获取manifest
      logDevelopment(`缓存未命中，直接获取manifest: ${manifestId}`);
      const manifestUrl = this.buildProxyUrl(`https://www.ai4dh.cn/iiif/3/manifests/${manifestId}/manifest.json`);
      
      const response = await fetchWithProxy(manifestUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const manifest = await response.json();
      
      // 异步缓存manifest数据（不阻塞返回）
      this.cacheManifestAsync(manifestId, manifest).catch(error => {
        console.warn('缓存manifest失败:', error);
      });
      
      return manifest;
    } catch (error) {
      console.error('Failed to fetch manifest:', error);
      throw error;
    }
  }

  // 基于IIIF信息构建manifest对象
  private static buildManifestFromIIIFInfo(manifestId: string, iiifInfo: IIIFInfo): IIIFManifest {
    return {
      id: `https://www.ai4dh.cn/iiif/3/manifests/${manifestId}/manifest.json`,
      type: 'Manifest',
      label: iiifInfo.label || { zh: [manifestId] },
      metadata: iiifInfo.metadata || [],
      items: iiifInfo.items || [],
      thumbnail: iiifInfo.thumbnail,
      rights: iiifInfo.rights,
      provider: iiifInfo.provider,
      seeAlso: iiifInfo.seeAlso,
      service: iiifInfo.service
    };
  }

  // 异步缓存manifest数据
  private static async cacheManifestAsync(manifestId: string, manifest: IIIFManifest): Promise<void> {
    try {
      const cacheKey = cacheService.generateIIIFKey(manifestId, 'manifest');
      await cacheService.set(cacheKey, manifest, 86400); // 24小时
      logDevelopment(`缓存manifest成功: ${manifestId}`);
    } catch (error) {
      console.warn('缓存manifest失败:', error);
    }
  }

  // Linus式简化的ID提取 - 消除特殊情况
  static extractPublicationId(collectionUrl: string): string {
    const match = collectionUrl.match(/([^/]+)\/collection\.json$/);
    return match ? match[1] : '';
  }

  static extractIssueId(manifestUrl: string): string {
    const match = manifestUrl.match(/([^/]+)\/manifest\.json$/);
    return match ? match[1] : '';
  }

  // 简化的getIssues方法 - 基于publicationId获取期数
  static async getIssues(publicationId: string): Promise<IssueItem[]> {
    try {
      const collectionUrl = this.buildProxyUrl(`https://www.ai4dh.cn/iiif/3/manifests/${publicationId}/collection.json`);
      return await this.getIssuesForPublication(collectionUrl);
    } catch (error) {
      console.error('Failed to get issues:', error);
      return [];
    }
  }

  // 分页获取期数
  static async getIssuesPaginated(
    publicationId: string, 
    pagination: PaginationParams
  ): Promise<PaginatedResponse<IssueItem>> {
    try {
      const collectionUrl = this.buildProxyUrl(`https://www.ai4dh.cn/iiif/3/manifests/${publicationId}/collection.json`);
      const response = await fetchWithProxy(collectionUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const col = await response.json();
      const allIssues = (col.items || []).map((it: IIIFCollectionItem, i: number) => ({
        i, 
        id: it.id,
        manifest: it.id,
        title: (it.label?.['zh-CN']?.[0]) || (it.label?.zh?.[0]) || (it.label?.en?.[0]) || '未知期刊',
        summary: (it.summary?.['zh-CN']?.[0]) || (it.summary?.zh?.[0]) || (it.summary?.en?.[0]) || ''
      }));

      // 计算分页
      const startIndex = pagination.page * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      const paginatedIssues = allIssues.slice(startIndex, endIndex);
      
      return {
        data: paginatedIssues,
        total: allIssues.length,
        page: pagination.page,
        limit: pagination.limit,
        hasMore: endIndex < allIssues.length
      };
    } catch (error) {
      console.error('Failed to get paginated issues:', error);
      return {
        data: [],
        total: 0,
        page: pagination.page,
        limit: pagination.limit,
        hasMore: false
      };
    }
  }

  // Linus式简化的URL构建 - 生产环境彻底禁用代理
  private static buildProxyUrl(url: string): string {
    if (!url) return '';
    
    // 修复IIIF URL路径问题 - 移除多余的iiif路径段
    let fixedUrl = url;
    if (url.includes('iiif/3/iiif/manifests/')) {
      fixedUrl = url.replace('iiif/3/iiif/manifests/', 'iiif/3/manifests/');
      logProduction('buildProxyUrl - 修复IIIF URL路径:', url, '->', fixedUrl);
    }
    
    if (isProduction) {
      // 生产环境：绝对不使用代理
      logProduction('buildProxyUrl - 直接访问:', fixedUrl);
      return fixedUrl;
    } else if (isDevelopment) {
      // 开发环境：可以选择使用代理
      if (fixedUrl.startsWith('https://')) {
        const proxyUrl = `/proxy?url=${encodeURIComponent(fixedUrl)}`;
        logDevelopment('buildProxyUrl - 使用代理:', proxyUrl);
        return proxyUrl;
      }
    }
    
    // 默认情况：直接访问
    return fixedUrl;
  }

  // 简化的搜索功能
  static filterPublications(
    publications: PublicationItem[], 
    searchTerm: string, 
    sortBy: 'name' | 'date' | 'count' = 'name'
  ): PublicationItem[] {
    let filtered = [...publications];
    
    // 搜索过滤
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(pub => 
        pub.title.toLowerCase().includes(term) ||
        pub.name.toLowerCase().includes(term)
      );
    }
    
    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title, 'zh-CN');
        case 'count':
          return b.issueCount - a.issueCount;
        case 'date':
          if (!a.lastUpdated) return 1;
          if (!b.lastUpdated) return -1;
          return a.lastUpdated.localeCompare(b.lastUpdated, 'zh-CN');
        default:
          return 0;
      }
    });
    
    return filtered;
  }

  // Linus式简化的代理URL获取 - 消除特殊情况
  static getProxyUrl(url: string): string {
    return this.buildProxyUrl(url);
  }

  // 缓存相关的辅助方法
  static async prefetchManifests(manifestIds: string[]): Promise<void> {
    try {
      if (await cacheService.healthCheck()) {
        logDevelopment(`开始预取manifests: ${manifestIds.length}个`);
        await cacheService.prefetchIIIFInfo(manifestIds);
        logDevelopment(`预取manifests完成`);
      }
    } catch (error) {
      console.warn('预取manifests失败:', error);
    }
  }

  static async clearManifestCache(manifestId?: string): Promise<void> {
    try {
      if (manifestId) {
        // 清除特定manifest的缓存
        const patterns = [
          cacheService.generateIIIFKey(manifestId, 'info'),
          cacheService.generateIIIFKey(manifestId, 'manifest'),
          `iiif:image:${manifestId}:*`
        ];
        
        for (const pattern of patterns) {
          await cacheService.clear(pattern);
        }
        logDevelopment(`清除manifest缓存成功: ${manifestId}`);
      } else {
        // 清除所有相关缓存
        await cacheService.clear('iiif:*');
        logDevelopment('清除所有IIIF缓存成功');
      }
    } catch (error) {
      console.warn('清除缓存失败:', error);
    }
  }

  static async getCacheStatus(): Promise<{
    enabled: boolean;
    healthy: boolean;
    stats?: unknown;
  }> {
    try {
      const healthy = await cacheService.healthCheck();
      let stats = null;
      
      if (healthy) {
        try {
          const statsResponse = await cacheService.getStats();
          if (statsResponse.success) {
            stats = statsResponse.data;
          }
        } catch (statsError) {
          console.warn('获取缓存统计失败:', statsError);
        }
      }
      
      return {
        enabled: true,
        healthy,
        stats
      };
    } catch {
      return {
        enabled: false,
        healthy: false
      };
    }
  }
}
