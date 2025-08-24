import { IIIFManifest } from './iiifTypes';
import { IIIFUrlBuilder } from './iiifUrlBuilder';

// 基础URL配置
const BASE_URL = import.meta.env.DEV ? '/iiif' : 'https://www.ai4dh.cn/iiif';

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

export class NewspaperService {
  static async getPublications(): Promise<PublicationItem[]> {
    const collectionUrl = IIIFUrlBuilder.buildCollection('collection.json', { proxy: true });
    
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
      
      // 异步获取期数信息
      await Promise.all(publications.map(async (pub, index) => {
        try {
          const issues = await this.getIssuesForPublication(pub.collection);
          publications[index].issueCount = issues.length;
          if (issues.length > 0) {
            publications[index].lastUpdated = issues[0].title || issues[0].summary;
          }
        } catch (e) {
          console.warn(`无法获取刊物 ${pub.title} 的期数信息:`, e);
        }
      }));
      
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
      // 使用统一的URL构建工具
      const manifestUrl = IIIFUrlBuilder.buildManifest(manifestId, { proxy: true });
      
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

  static extractPublicationId(collectionUrl: string): string {
    try {
      return IIIFUrlBuilder.extractCollectionId(collectionUrl);
    } catch (error) {
      // 回退到原来的逻辑作为后备
      console.log('Debug: extractPublicationId fallback with:', collectionUrl);
      const match = collectionUrl.match(/([^/]+)\/collection\.json$/);
      const result = match ? match[1] : '';
      console.log('Debug: extractPublicationId fallback result:', result);
      return result;
    }
  }

  static extractIssueId(manifestUrl: string): string {
    try {
      return IIIFUrlBuilder.extractManifestId(manifestUrl);
    } catch (error) {
      // 回退到原来的逻辑作为后备
      console.log('Debug: extractIssueId fallback with:', manifestUrl);
      if (manifestUrl.includes('/manifest.json')) {
        const match = manifestUrl.match(/([^/]+)\/manifest\.json$/);
        const result = match ? match[1] : '';
        console.log('Debug: extractIssueId (manifest.json) fallback result:', result);
        return result;
      }
      
      // 如果是完整的manifest URL，提取最后一部分作为ID
      const parts = manifestUrl.split('/');
      const result = parts[parts.length - 1] || '';
      console.log('Debug: extractIssueId (fallback) result:', result);
      return result;
    }
  }

  // 简化的getIssues方法 - 基于publicationId获取期数
  static async getIssues(publicationId: string): Promise<IssueItem[]> {
    try {
      const collectionUrl = IIIFUrlBuilder.buildCollection(`${publicationId}/collection.json`, { proxy: true });
      return await this.getIssuesForPublication(collectionUrl);
    } catch (error) {
      console.error('Failed to get issues:', error);
      return [];
    }
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

  // 统一的代理URL获取 - 使用新的URL构建工具
  static getProxyUrl(url: string): string {
    try {
      // 首先尝试解析URL
      const components = IIIFUrlBuilder.parse(url);
      return IIIFUrlBuilder.build(components, { proxy: true });
    } catch (error) {
      // 如果解析失败，尝试修复URL
      const fixedUrl = IIIFUrlBuilder.fix(url);
      return IIIFUrlBuilder.build(IIIFUrlBuilder.parse(fixedUrl), { proxy: true });
    }
  }
}