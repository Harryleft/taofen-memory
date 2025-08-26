import { IIIFManifest } from './utils/iiifTypes.ts';

// 简化的代理函数 - 消除特殊情况
async function fetchWithProxy(url: string): Promise<Response> {
  const finalUrl = import.meta.env.DEV && url.startsWith('https://') 
    ? `/proxy?url=${encodeURIComponent(url)}`
    : url;
  
  return fetch(finalUrl);
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
    
    try {
      const response = await fetchWithProxy(collectionUrl);
      if (!response.ok) {
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
      
      // 异步获取期数信息 - 使用批处理避免并发请求过多
      const BATCH_SIZE = 5; // 每批处理5个请求
      for (let i = 0; i < publications.length; i += BATCH_SIZE) {
        const batch = publications.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (pub, index) => {
          try {
            const issues = await this.getIssuesForPublication(pub.collection);
            publications[i + index].issueCount = issues.length;
            if (issues.length > 0) {
              publications[i + index].lastUpdated = issues[0].title || issues[0].summary;
            }
          } catch (e) {
            console.warn(`无法获取刊物 ${pub.title} 的期数信息:`, e);
          }
        }));
        
        // 批次间延迟，避免服务器限流
        if (i + BATCH_SIZE < publications.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      return publications;
    } catch (e) { 
      console.error('加载刊物列表失败:', e);
      return []; 
    }
  }
  
  static async getIssuesForPublication(collectionUrl: string): Promise<IssueItem[]> {
    try {
      const response = await fetchWithProxy(collectionUrl);
      if (!response.ok) {
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
      console.error('加载目录失败:', e);
      return []; 
    }
  }

  static async getManifest(manifestId: string): Promise<IIIFManifest> {
    try {
      // 直接构建完整的manifest URL
      const manifestUrl = this.buildProxyUrl(`https://www.ai4dh.cn/iiif/3/manifests/${manifestId}/manifest.json`);
      
      const response = await fetchWithProxy(manifestUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch manifest:', error);
      throw error;
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

  // Linus式简化的代理URL构建 - 直接使用完整URL
  private static buildProxyUrl(url: string): string {
    if (!url) return '';
    
    // 开发环境使用代理
    if (import.meta.env.DEV && url.startsWith('https://')) {
      return `/proxy?url=${encodeURIComponent(url)}`;
    }
    
    // 生产环境直接返回原URL
    return url;
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
}
