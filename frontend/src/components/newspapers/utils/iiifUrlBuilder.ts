/**
 * IIIF URL构建工具 - 统一管理所有IIIF相关URL构建
 * 
 * 设计原则：
 * - 单一职责：只负责URL构建，不处理业务逻辑
 * - 无状态：不依赖外部状态，纯函数
 * - 可测试：所有函数都是纯函数，易于单元测试
 */

export interface IIIFUrlConfig {
  baseUrl?: string;
  apiVersion?: string;
  useProxy?: boolean;
}

export class IIIFUrlBuilder {
  private static readonly DEFAULT_CONFIG: Required<IIIFUrlConfig> = {
    baseUrl: 'https://www.ai4dh.cn/iiif',
    apiVersion: '3',
    useProxy: false
  };

  /**
   * 构建manifest URL
   * 统一的manifest URL构建逻辑，消除重复代码
   */
  static buildManifestUrl(
    publicationId: string, 
    issueId: string, 
    config: IIIFUrlConfig = {}
  ): string {
    const { baseUrl, apiVersion } = { ...this.DEFAULT_CONFIG, ...config };
    
    // 如果issueId已经是完整URL，直接返回
    if (issueId.startsWith('http')) {
      return issueId;
    }
    
    // 构建标准manifest URL
    const url = `${baseUrl}/${apiVersion}/manifests/${publicationId}/${issueId}/manifest.json`;
    return url;
  }

  /**
   * 构建collection URL
   */
  static buildCollectionUrl(
    publicationId: string, 
    config: IIIFUrlConfig = {}
  ): string {
    const { baseUrl, apiVersion } = { ...this.DEFAULT_CONFIG, ...config };
    return `${baseUrl}/${apiVersion}/manifests/${publicationId}/collection.json`;
  }

  /**
   * 构建IIIF Image API URL
   * 将直接图像URL转换为IIIF Image API格式
   */
  static buildImageApiUrl(
    imageUrl: string, 
    config: IIIFUrlConfig = {}
  ): string {
    // 如果已经是IIIF Image API格式，直接返回
    if (imageUrl.includes('/full/') && imageUrl.includes('/default.jpg')) {
      return imageUrl;
    }

    const { baseUrl, apiVersion } = { ...this.DEFAULT_CONFIG, ...config };
    
    // 从直接图像URL提取路径
    const urlMatch = imageUrl.match(/https?:\/\/[^\/]+\/iiif\/([^\/]+)\/(.+)/);
    if (!urlMatch) {
      return imageUrl; // 无法解析，返回原URL
    }

    const [, version, imagePath] = urlMatch;
    const encodedPath = imagePath.replace(/\//g, '%2F');
    
    return `${baseUrl}/${version}/${encodedPath}/full/1024,/0/default.jpg`;
  }

  /**
   * 获取代理URL（如果需要）
   */
  static getProxyUrl(url: string, useProxy: boolean = false): string {
    if (!useProxy) {
      return url;
    }
    
    return `/proxy?url=${encodeURIComponent(url)}`;
  }

  /**
   * 从manifest URL提取issue ID
   * 统一的ID提取逻辑
   */
  static extractIssueId(manifestUrl: string): string {
    // 处理完整URL
    if (manifestUrl.startsWith('http')) {
      const match = manifestUrl.match(/([^/]+)\/manifest\.json$/);
      return match ? match[1] : '';
    }
    
    // 处理相对路径
    const match = manifestUrl.match(/([^/]+)\/manifest\.json$/);
    return match ? match[1] : '';
  }

  /**
   * 从collection URL提取publication ID
   */
  static extractPublicationId(collectionUrl: string): string {
    const match = collectionUrl.match(/([^/]+)\/collection\.json$/);
    return match ? match[1] : '';
  }

  /**
   * 验证IIIF URL格式
   */
  static validateIIIFUrl(url: string): boolean {
    const iiifPattern = /^https?:\/\/.+\/iiif\/\d+\/.+/;
    return iiifPattern.test(url);
  }

  /**
   * 构建UV查看器URL
   */
  static buildViewerUrl(
    manifestUrl: string, 
    options: {
      embedded?: boolean;
      timestamp?: number;
      viewerPath?: string;
    } = {}
  ): string {
    const {
      embedded = true,
      timestamp = Date.now(),
      viewerPath = '/uv_simple.html'
    } = options;

    const params = new URLSearchParams({
      v: timestamp.toString(),
      iiifManifestId: manifestUrl,
      ...(embedded && { embedded: 'true' })
    });

    return `${viewerPath}?${params.toString()}`;
  }
}