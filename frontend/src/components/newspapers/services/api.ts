/**
 * 统一的API服务层
 * 
 * Linus设计原则：
 * - 单一职责：每个函数只做一件事
 * - 错误处理：明确的错误处理机制
 * - 缓存策略：避免重复请求
 * - 类型安全：完整的TypeScript支持
 */

import { 
  Publication, 
  Issue, 
  ApiResponse, 
  PaginationParams, 
  SortOptions, 
  SearchFilter,
  isIIIFCollectionItem,
  publicationFromIIIF,
  issueFromIIIF
} from '../types';
import { IIIFManifest, IIIFCollectionItem } from '../iiifTypes';

// ==================== 配置 ====================

const API_BASE_URL = import.meta.env.DEV ? '/iiif' : 'https://www.ai4dh.cn/iiif';
const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

// ==================== 缓存管理 ====================

class SimpleCache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>();
  
  set(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
  
  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

// 全局缓存实例
const publicationsCache = new SimpleCache<Publication[]>();
const issuesCache = new SimpleCache<Issue[]>();
const manifestsCache = new SimpleCache<IIIFManifest>();

// ==================== 工具函数 ====================

/**
 * 统一的fetch包装器
 */
async function fetchWithProxy(url: string): Promise<Response> {
  // 开发环境代理处理
  if (import.meta.env.DEV && url.startsWith('https://')) {
    const proxyUrl = `/proxy?url=${encodeURIComponent(url)}`;
    return fetch(proxyUrl);
  }
  
  return fetch(url);
}

/**
 * 统一的API响应处理
 */
async function handleApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  return {
    data,
    success: true,
    timestamp: Date.now()
  };
}

/**
 * 统一的错误处理
 */
function handleApiError(error: unknown, operation: string): never {
  console.error(`❌ ${operation}失败:`, error);
  
  if (error instanceof Error) {
    throw new Error(`${operation}失败: ${error.message}`);
  }
  
  throw new Error(`${operation}失败: 未知错误`);
}

// ==================== 核心服务 ====================

export class NewspapersApiService {
  // ==================== 刊物相关 ====================
  
  /**
   * 获取刊物列表
   * 
   * 设计原则：
   * - 自动缓存
   * - 错误处理
   * - 类型安全
   */
  static async getPublications(): Promise<Publication[]> {
    // 检查缓存
    const cached = publicationsCache.get('publications');
    if (cached) {
      console.log('📚 从缓存获取刊物列表');
      return cached;
    }
    
    try {
      console.log('📚 加载刊物列表...');
      
      const url = 'https://www.ai4dh.cn/iiif/3/manifests/collection.json';
      const response = await fetchWithProxy(url);
      const result = await handleApiResponse<{ items: IIIFCollectionItem[] }>(response);
      
      // 转换数据格式
      const publications = result.data.items.map((item, index) => {
        if (!isIIIFCollectionItem(item)) {
          console.warn('⚠️ 无效的IIIF集合项:', item);
          return null;
        }
        
        return publicationFromIIIF(item, index);
      }).filter((pub): pub is Publication => pub !== null);
      
      // 异步获取每个刊物的期数信息
      await this.enrichPublicationsWithIssueCount(publications);
      
      // 缓存结果
      publicationsCache.set('publications', publications);
      
      console.log(`✅ 成功加载 ${publications.length} 个刊物`);
      return publications;
      
    } catch (error) {
      return handleApiError(error, '获取刊物列表');
    }
  }
  
  /**
   * 为刊物列表添加期数统计信息
   */
  private static async enrichPublicationsWithIssueCount(publications: Publication[]): Promise<void> {
    await Promise.all(publications.map(async (pub, index) => {
      try {
        const issues = await this.getIssuesForPublication(pub.collectionUrl);
        publications[index].issueCount = issues.length;
        
        // 从第一个期数中获取日期信息
        if (issues.length > 0) {
          publications[index].lastUpdated = issues[0].title || issues[0].summary;
        }
      } catch (error) {
        console.warn(`⚠️ 无法获取刊物 ${pub.title} 的期数信息:`, error);
      }
    }));
  }
  
  // ==================== 期数相关 ====================
  
  /**
   * 获取刊物期数列表
   */
  static async getIssuesForPublication(collectionUrl: string): Promise<Issue[]> {
    // 检查缓存
    const cached = issuesCache.get(collectionUrl);
    if (cached) {
      console.log('📄 从缓存获取期数列表:', collectionUrl);
      return cached;
    }
    
    try {
      console.log('📄 加载期数列表:', collectionUrl);
      
      const response = await fetchWithProxy(collectionUrl);
      const result = await handleApiResponse<{ items: IIIFCollectionItem[] }>(response);
      
      const issues = result.data.items.map((item, index) => {
        if (!isIIIFCollectionItem(item)) {
          console.warn('⚠️ 无效的IIIF集合项:', item);
          return null;
        }
        
        return issueFromIIIF(item, index);
      }).filter((issue): issue is Issue => issue !== null);
      
      // 缓存结果
      issuesCache.set(collectionUrl, issues);
      
      console.log(`✅ 成功加载 ${issues.length} 个期数`);
      return issues;
      
    } catch (error) {
      return handleApiError(error, '获取期数列表');
    }
  }
  
  // ==================== Manifest相关 ====================
  
  /**
   * 获取IIIF Manifest
   */
  static async getManifest(manifestId: string): Promise<IIIFManifest> {
    // 构建manifest URL
    let manifestUrl: string;
    
    if (manifestId.startsWith('http')) {
      manifestUrl = manifestId;
    } else {
      manifestUrl = `${API_BASE_URL}/3/manifests/${encodeURIComponent(manifestId)}/manifest.json`;
    }
    
    // 检查缓存
    const cached = manifestsCache.get(manifestUrl);
    if (cached) {
      console.log('📖 从缓存获取manifest:', manifestUrl);
      return cached;
    }
    
    try {
      console.log('📖 加载manifest:', manifestUrl);
      
      const response = await fetchWithProxy(manifestUrl);
      const result = await handleApiResponse<IIIFManifest>(response);
      
      // 缓存结果
      manifestsCache.set(manifestUrl, result.data);
      
      console.log('✅ Manifest加载成功');
      return result.data;
      
    } catch (error) {
      return handleApiError(error, '获取Manifest');
    }
  }
  
  // ==================== 搜索和过滤 ====================
  
  /**
   * 搜索刊物
   */
  static async searchPublications(params: {
    term: string;
    sortBy?: keyof Publication;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
  }): Promise<{ publications: Publication[]; total: number }> {
    try {
      // 获取所有刊物（从缓存）
      const allPublications = await this.getPublications();
      
      // 过滤
      let filtered = allPublications.filter(pub => {
        const term = params.term.toLowerCase();
        return pub.title.toLowerCase().includes(term) ||
               pub.name.toLowerCase().includes(term);
      });
      
      // 排序
      if (params.sortBy) {
        filtered.sort((a, b) => {
          const aValue = a[params.sortBy!];
          const bValue = b[params.sortBy!];
          
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return params.sortOrder === 'desc' 
              ? bValue.localeCompare(aValue, 'zh-CN')
              : aValue.localeCompare(bValue, 'zh-CN');
          }
          
          if (typeof aValue === 'number' && typeof bValue === 'number') {
            return params.sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
          }
          
          return 0;
        });
      }
      
      // 分页
      const page = params.page || 1;
      const pageSize = params.pageSize || 20;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginated = filtered.slice(start, end);
      
      return {
        publications: paginated,
        total: filtered.length
      };
      
    } catch (error) {
      return handleApiError(error, '搜索刊物');
    }
  }
  
  // ==================== 工具方法 ====================
  
  /**
   * 获取代理URL
   */
  static getProxyUrl(url: string): string {
    if (import.meta.env.DEV && url.startsWith('https://')) {
      return `/proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  }
  
  /**
   * 从集合URL提取刊物ID
   */
  static extractPublicationId(collectionUrl: string): string {
    const match = collectionUrl.match(/([^/]+)\/collection\.json$/);
    return match ? match[1] : '';
  }
  
  /**
   * 从Manifest URL提取期数ID
   */
  static extractIssueId(manifestUrl: string): string {
    if (manifestUrl.startsWith('http')) {
      const match = manifestUrl.match(/([^/]+)\/manifest\.json$/);
      return match ? match[1] : '';
    }
    
    const match = manifestUrl.match(/([^/]+)\/manifest\.json$/);
    return match ? match[1] : '';
  }
  
  /**
   * 清除缓存
   */
  static clearCache(): void {
    publicationsCache.clear();
    issuesCache.clear();
    manifestsCache.clear();
    console.log('🧹 缓存已清除');
  }
  
  /**
   * 获取缓存统计信息
   */
  static getCacheStats(): {
    publications: number;
    issues: number;
    manifests: number;
  } {
    return {
      publications: publicationsCache.cache.size,
      issues: issuesCache.cache.size,
      manifests: manifestsCache.cache.size
    };
  }
}

// ==================== 向后兼容性 ====================

/**
 * 旧版服务接口，用于平滑迁移
 * @deprecated 使用 NewspapersApiService 替代
 */
export class LegacyNewspaperService {
  static async getPublications() {
    const publications = await NewspapersApiService.getPublications();
    return publications.map(pub => ({
      i: pub.index,
      id: pub.id,
      collection: pub.collectionUrl,
      title: pub.title,
      name: pub.name,
      issueCount: pub.issueCount,
      lastUpdated: pub.lastUpdated
    }));
  }
  
  static async getIssuesForPublication(collectionUrl: string) {
    const issues = await NewspapersApiService.getIssuesForPublication(collectionUrl);
    return issues.map(issue => ({
      i: issue.index,
      manifest: issue.manifestUrl,
      title: issue.title,
      summary: issue.summary
    }));
  }
  
  static async getManifest(manifestId: string) {
    return NewspapersApiService.getManifest(manifestId);
  }
  
  static filterPublications(
    publications: any[],
    searchTerm: string,
    sortBy: 'name' | 'date' | 'count' = 'name'
  ) {
    // 实现过滤逻辑
    let filtered = [...publications];
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(pub => 
        pub.title.toLowerCase().includes(term) ||
        pub.name.toLowerCase().includes(term)
      );
    }
    
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
  
  static extractPublicationId(collectionUrl: string) {
    return NewspapersApiService.extractPublicationId(collectionUrl);
  }
  
  static extractIssueId(manifestUrl: string) {
    return NewspapersApiService.extractIssueId(manifestUrl);
  }
  
  static getProxyUrl(url: string) {
    return NewspapersApiService.getProxyUrl(url);
  }
}