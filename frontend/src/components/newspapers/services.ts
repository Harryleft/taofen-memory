import { IIIFManifest } from './iiifTypes';

// 在开发环境中使用相对路径，通过Vite代理访问
// 在生产环境中使用完整URL
const BASE_URL = import.meta.env.DEV ? '/iiif' : 'https://www.ai4dh.cn/iiif';

// 代理函数用于处理CORS
async function fetchWithProxy(url: string): Promise<Response> {
  // 如果是本地开发环境且是外部URL，使用代理
  if (import.meta.env.DEV && url.startsWith('https://')) {
    const proxyUrl = `/proxy?url=${encodeURIComponent(url)}`;
    console.log('使用代理:', proxyUrl);
    return fetch(proxyUrl);
  }
  
  // 直接获取
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

export class NewspaperService {
  static async getPublications(): Promise<PublicationItem[]> {
    // 加载顶级刊物集合
    const url = 'https://www.ai4dh.cn/iiif/3/manifests/collection.json';
    
    try {
      const response = await fetchWithProxy(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const col = await response.json();
      
      const publications = (col.items || []).map((it: IIIFCollectionItem, i: number) => {
        // 调试信息：检查item.id的实际内容
        console.log(`🔍 [调试] item ${i}:`, it.id);
        
        // 从完整的collection URL中提取刊物ID
        const collectionId = it.id.match(/([^/]+)\/collection\.json$/)?.[1] || it.id;
        
        console.log(`🔍 [调试] 提取的collectionId:`, collectionId);
        
        return {
          i, 
          id: collectionId,
          collection: it.id,
          title: (it.label?.zh?.[0]) || (it.label?.['zh-CN']?.[0]) || (it.label?.en?.[0]) || '未知刊物',
          name: (it.label?.zh?.[0]) || (it.label?.['zh-CN']?.[0]) || (it.label?.en?.[0]) || '未知刊物',
          issueCount: 0, // 将在后续加载时填充
          lastUpdated: null // 将在后续加载时填充
        };
      });
      
      // 异步获取每个刊物的期数信息
      await Promise.all(publications.map(async (pub, index) => {
        try {
          const issues = await this.getIssuesForPublication(pub.collection);
          publications[index].issueCount = issues.length;
          // 从第一个期数中获取日期信息
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
    // 直接使用传入的完整URL，不进行任何路径拼接
    const url = collectionUrl;
    
    try {
      const response = await fetchWithProxy(url);
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
      let manifestUrl;
      
      if (manifestId.startsWith('http')) {
        // 如果manifestId是完整URL，直接使用
        manifestUrl = manifestId;
        console.log('🔍 [调试] 使用完整manifest URL:', manifestUrl);
      } else {
        // 否则构建完整URL
        manifestUrl = `${BASE_URL}/3/manifests/${encodeURIComponent(manifestId)}/manifest.json`;
        console.log('🔍 [调试] 构建manifest URL:', manifestUrl);
      }
      
      const response = await fetchWithProxy(manifestUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const manifest = await response.json();
      console.log('✅ [调试] Manifest加载成功:', manifest);
      return manifest;
    } catch (error) {
      console.error('❌ Failed to fetch manifest:', error);
      throw error;
    }
  }

  static extractPublicationId(collectionUrl: string): string {
    const match = collectionUrl.match(/([^/]+)\/collection\.json$/);
    return match ? match[1] : '';
  }

  static extractIssueId(manifestUrl: string): string {
    // 如果是完整的URL，提取最后的ID部分
    if (manifestUrl.startsWith('http')) {
      const match = manifestUrl.match(/([^/]+)\/manifest\.json$/);
      return match ? match[1] : '';
    }
    // 如果是相对路径，直接提取
    const match = manifestUrl.match(/([^/]+)\/manifest\.json$/);
    return match ? match[1] : '';
  }

  // 搜索功能
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
          // 按最后更新时间排序（如果有）
          if (!a.lastUpdated) return 1;
          if (!b.lastUpdated) return -1;
          return a.lastUpdated.localeCompare(b.lastUpdated, 'zh-CN');
        default:
          return 0;
      }
    });
    
    return filtered;
  }

  // 获取代理URL
  static getProxyUrl(url: string): string {
    if (import.meta.env.DEV && url.startsWith('https://')) {
      return `/proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  }
}