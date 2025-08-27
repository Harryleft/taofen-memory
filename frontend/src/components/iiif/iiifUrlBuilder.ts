/**
 * IIIF URL构建工具类
 * 统一处理所有IIIF相关的URL构建逻辑
 */
export class IIIFUrlBuilder {
  private static readonly BASE_URL = 'https://www.ai4dh.cn/iiif/3';
  private static readonly PROXY_BASE = '/proxy';

  /**
   * 解析IIIF URL组件
   */
  static parse(url: string): IIIFUrlComponents {
    
    // 如果是完整的HTTP URL
    if (url.startsWith('http')) {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      
      debug.log('iiif', '路径部分:', pathParts);
      
      // 检查是否是ai4dh.cn的URL
      if (urlObj.hostname === 'www.ai4dh.cn') {
        const iiifIndex = pathParts.indexOf('iiif');
        if (iiifIndex !== -1 && iiifIndex + 3 < pathParts.length) {
          const version = pathParts[iiifIndex + 1];
          const type = pathParts[iiifIndex + 2];
          const resourcePath = pathParts.slice(iiifIndex + 3).join('/');
          
          debug.log('iiif', '解析结果:', { version, type, resourcePath });
          
          return {
            baseUrl: urlObj.origin,
            version,
            type,
            resourcePath,
            isComplete: true,
            originalUrl: url
          };
        }
      }
      
      // 如果是其他域名，直接返回
      return {
        baseUrl: urlObj.origin,
        version: '3',
        type: 'external',
        resourcePath: urlObj.pathname,
        isComplete: true,
        originalUrl: url
      };
    }
    
    // 如果是相对路径，假设是resourcePath
    return {
      baseUrl: this.BASE_URL,
      version: '3',
      type: 'manifests',
      resourcePath: url,
      isComplete: false,
      originalUrl: url
    };
  }

  /**
   * 构建IIIF URL
   */
  static build(components: IIIFUrlComponents, options: IIIFUrlOptions = {}): string {
    const { proxy = false, format = 'manifest' } = options;
    
    debug.log('iiif', '构建URL组件:', components);
    debug.log('iiif', '构建选项:', options);
    
    let url: string;
    
    if (components.isComplete && components.type !== 'external') {
      // 如果是完整的ai4dh URL，直接使用
      url = components.originalUrl;
    } else if (components.type === 'external') {
      // 外部URL直接使用
      url = components.originalUrl;
    } else {
      // 构建新的URL
      const resourcePath = this.normalizeResourcePath(components.resourcePath, format);
      url = `${components.baseUrl}/iiif/${components.version}/${components.type}/${resourcePath}`;
    }
    
    console.log('🔍 [IIIF] 构建的基础URL:', url);
    
    // 添加代理
    if (proxy && import.meta.env.DEV && url.startsWith('https://')) {
      const proxyUrl = `${this.PROXY_BASE}?url=${encodeURIComponent(url)}`;
      console.log('🔍 [IIIF] 代理URL:', proxyUrl);
      return proxyUrl;
    }
    
    return url;
  }

  /**
   * 构建manifest URL的便捷方法
   */
  static buildManifest(resourcePath: string, options: IIIFUrlOptions = {}): string {
    console.log('🔍 [IIIF] 构建manifest URL:', resourcePath);
    
    const components: IIIFUrlComponents = {
      baseUrl: this.BASE_URL,
      version: '3',
      type: 'manifests',
      resourcePath,
      isComplete: false,
      originalUrl: resourcePath
    };
    
    return this.build(components, options);
  }

  /**
   * 构建collection URL的便捷方法
   */
  static buildCollection(resourcePath: string, options: IIIFUrlOptions = {}): string {
    console.log('🔍 [IIIF] 构建collection URL:', resourcePath);
    
    const components: IIIFUrlComponents = {
      baseUrl: this.BASE_URL,
      version: '3',
      type: 'manifests',
      resourcePath,
      isComplete: false,
      originalUrl: resourcePath
    };
    
    return this.build(components, options);
  }

  /**
   * 规范化资源路径
   */
  private static normalizeResourcePath(path: string, format: string): string {
    console.log('🔍 [IIIF] 规范化路径:', path, '格式:', format);
    
    // 移除首尾的斜杠
    let normalized = path.replace(/^\/+|\/+$/g, '');
    
    // 如果路径中包含.json文件，直接使用
    if (normalized.includes('.json')) {
      console.log('🔍 [IIIF] 检测到.json文件，直接使用');
      return normalized;
    }
    
    // 否则添加格式后缀
    if (!normalized.endsWith(`.${format}`)) {
      normalized = `${normalized}.${format}`;
    }
    
    console.log('🔍 [IIIF] 规范化结果:', normalized);
    return normalized;
  }

  /**
   * 验证URL是否有效
   */
  static validate(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 修复URL中的常见问题
   */
  static fix(url: string): string {
    console.log('🔍 [IIIF] 修复URL:', url);
    
    // 修复双重斜杠
    let fixed = url.replace(/([^:])\/{2,}/g, '$1/');
    
    // 修复缺失的协议
    if (!fixed.startsWith('http') && !fixed.startsWith('/')) {
      fixed = `https://${fixed}`;
    }
    
    console.log('🔍 [IIIF] 修复结果:', fixed);
    return fixed;
  }
}

/**
 * IIIF URL组件接口
 */
export interface IIIFUrlComponents {
  baseUrl: string;
  version: string;
  type: string;
  resourcePath: string;
  isComplete: boolean;
  originalUrl: string;
}

/**
 * IIIF URL构建选项
 */
export interface IIIFUrlOptions {
  proxy?: boolean;
  format?: 'manifest' | 'collection' | 'json';
}
