import { IIIFCollection, IIIFManifest } from './iiifTypes';

// 在开发环境中使用相对路径，通过Vite代理访问
// 在生产环境中使用完整URL
const BASE_URL = import.meta.env.DEV ? '/iiif' : 'https://www.ai4dh.cn/iiif';

export class NewspaperService {
  static async getPublications(): Promise<IIIFCollection> {
    try {
      const response = await fetch(`${BASE_URL}/manifests/collection.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch publications:', error);
      throw error;
    }
  }

  static async getIssues(publicationId: string): Promise<IIIFCollection> {
    try {
      // 对publicationId进行URL编码，确保特殊字符正确处理
      const encodedPublicationId = encodeURIComponent(publicationId);
      const response = await fetch(`${BASE_URL}/3/manifests/${encodedPublicationId}/collection.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch issues:', error);
      throw error;
    }
  }

  static async getManifest(manifestId: string): Promise<IIIFManifest> {
    try {
      // 对manifestId进行URL编码，确保特殊字符正确处理
      const encodedManifestId = encodeURIComponent(manifestId);
      const response = await fetch(`${BASE_URL}/3/manifests/${encodedManifestId}/manifest.json`);
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
    const match = collectionUrl.match(/([^/]+)\/collection\.json$/);
    return match ? match[1] : '';
  }

  static extractIssueId(manifestUrl: string): string {
    const match = manifestUrl.match(/([^/]+)\/manifest\.json$/);
    return match ? match[1] : '';
  }
}