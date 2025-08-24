/**
 * IIIF URL构建工具类
 * 
 * 这个类提供了一个统一、robust的URL构建解决方案，消除了所有特殊情况处理。
 * 
 * 核心原则：
 * 1. 好品味 - 消除所有边界情况，让异常情况变成正常情况
 * 2. 简洁性 - 每个函数只做一件事，并且做好
 * 3. 实用主义 - 解决实际问题，而不是理论上的完美
 */

export interface IIIFUrlComponents {
  baseUrl: string;
  version: string;
  path: string;
  type: 'manifest' | 'collection' | 'image';
  format?: string;
}

export interface IIIFBuildOptions {
  encode?: boolean;
  validate?: boolean;
  proxy?: boolean;
}

export class IIIFUrlBuilder {
  private static readonly DEFAULT_BASE_URL = 'https://www.ai4dh.cn/iiif';
  private static readonly DEFAULT_VERSION = '3';
  private static readonly SUPPORTED_FORMATS = ['json', 'jpg', 'png', 'tif', 'jp2'];
  
  /**
   * 构建完整的IIIF URL
   * 
   * 这个方法消除了所有特殊情况，通过统一的数据结构处理所有URL类型
   */
  static build(components: IIIFUrlComponents, options: IIIFBuildOptions = {}): string {
    const { encode = true, validate = true, proxy = false } = options;
    
    if (validate) {
      this.validateComponents(components);
    }
    
    // 构建基础路径
    let path = components.path;
    
    // 处理路径编码 - 消除边界情况
    if (encode) {
      path = this.encodePath(path);
    }
    
    // 构建URL - 没有特殊情况，只有统一的数据结构
    const url = `${components.baseUrl}/${components.version}/${this.buildPathSegment(path, components.type, components.format)}`;
    
    // 处理代理 - 简化为单一逻辑分支
    return proxy && this.shouldProxy(url) ? this.buildProxyUrl(url) : url;
  }
  
  /**
   * 解析IIIF URL为组件
   * 
   * 这是构建的逆向操作，用于URL验证和修复
   */
  static parse(url: string): IIIFUrlComponents {
    // 首先处理代理URL
    const actualUrl = this.parseProxyUrl(url) || url;
    
    // 解析URL组件 - 修复正则表达式以正确匹配包含/iiif/的URL
    const match = actualUrl.match(/^(https?:\/\/[^\/]+\/iiif)\/(\d+)\/(.+)$/);
    if (!match) {
      throw new Error(`Invalid IIIF URL: ${url}`);
    }
    
    const [, baseUrl, version, pathSegment] = match;
    
    // 解析路径段 - 消除复杂的条件判断
    const { path, type, format } = this.parsePathSegment(pathSegment);
    
    return {
      baseUrl,
      version,
      path,
      type,
      format
    };
  }
  
  /**
   * 智能URL修复 - 自动检测和修复常见的URL问题
   */
  static fix(url: string): string {
    try {
      // 尝试解析URL
      const components = this.parse(url);
      
      // 检查并修复常见问题
      const fixedComponents = this.fixComponents(components);
      
      // 重新构建URL
      return this.build(fixedComponents, { encode: true, validate: true });
    } catch (error) {
      // 如果解析失败，尝试启发式修复
      return this.heuristicFix(url);
    }
  }
  
  /**
   * 验证URL是否有效
   */
  static validate(url: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    try {
      const components = this.parse(url);
      
      // 验证组件
      if (!components.baseUrl || !components.baseUrl.startsWith('http')) {
        errors.push('Invalid base URL');
      }
      
      if (!components.version || !/^\d+$/.test(components.version)) {
        errors.push('Invalid IIIF version');
      }
      
      if (!components.path || components.path.trim() === '') {
        errors.push('Invalid path');
      }
      
      if (components.format && !this.SUPPORTED_FORMATS.includes(components.format)) {
        errors.push(`Unsupported format: ${components.format}`);
      }
      
    } catch (error) {
      errors.push(`URL parsing failed: ${error.message}`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * 便捷方法 - 构建manifest URL
   */
  static buildManifest(path: string, options: IIIFBuildOptions = {}): string {
    return this.build({
      baseUrl: this.DEFAULT_BASE_URL,
      version: this.DEFAULT_VERSION,
      path,
      type: 'manifest',
      format: 'json'
    }, options);
  }
  
  /**
   * 便捷方法 - 构建collection URL
   */
  static buildCollection(path: string, options: IIIFBuildOptions = {}): string {
    return this.build({
      baseUrl: this.DEFAULT_BASE_URL,
      version: this.DEFAULT_VERSION,
      path,
      type: 'collection',
      format: 'json'
    }, options);
  }
  
  /**
   * 便捷方法 - 构建image URL
   */
  static buildImage(path: string, region = 'full', size = '1024,', rotation = '0', quality = 'default', format = 'jpg', options: IIIFBuildOptions = {}): string {
    // 对于image URL，路径已经包含了完整的IIIF Image API格式，不需要额外编码
    const imagePath = `${path}/${region}/${size}/${rotation}/${quality}.${format}`;
    return this.build({
      baseUrl: this.DEFAULT_BASE_URL,
      version: this.DEFAULT_VERSION,
      path: imagePath,
      type: 'image',
      format
    }, { ...options, encode: false }); // 禁用路径编码，避免双重编码
  }
  
  /**
   * 从manifest URL提取ID
   */
  static extractManifestId(manifestUrl: string): string {
    try {
      const components = this.parse(manifestUrl);
      
      // 移除manifest.json后缀和路径前缀
      let id = components.path;
      if (id.endsWith('/manifest.json')) {
        id = id.substring(0, id.length - '/manifest.json'.length);
      }
      
      return id;
    } catch (error) {
      // 回退到简单的字符串处理
      const match = manifestUrl.match(/([^\/]+)\/manifest\.json$/);
      return match ? match[1] : '';
    }
  }
  
  /**
   * 从collection URL提取ID
   */
  static extractCollectionId(collectionUrl: string): string {
    try {
      const components = this.parse(collectionUrl);
      
      // 移除collection.json后缀和路径前缀
      let id = components.path;
      if (id.endsWith('/collection.json')) {
        id = id.substring(0, id.length - '/collection.json'.length);
      }
      
      return id;
    } catch (error) {
      // 回退到简单的字符串处理
      const match = collectionUrl.match(/([^\/]+)\/collection\.json$/);
      return match ? match[1] : '';
    }
  }
  
  // 私有方法 - 实现细节
  
  private static validateComponents(components: IIIFUrlComponents): void {
    if (!components.baseUrl) {
      throw new Error('Base URL is required');
    }
    
    if (!components.version) {
      throw new Error('IIIF version is required');
    }
    
    if (!components.path) {
      throw new Error('Path is required');
    }
    
    if (!components.type) {
      throw new Error('Type is required');
    }
    
    if (components.format && !this.SUPPORTED_FORMATS.includes(components.format)) {
      throw new Error(`Unsupported format: ${components.format}`);
    }
  }
  
  private static encodePath(path: string): string {
    // 智能编码 - 只编码必要的部分
    return path.replace(/\//g, '%2F');
  }
  
  private static buildPathSegment(path: string, type: 'manifest' | 'collection' | 'image', format?: string): string {
    // 根据类型构建路径段 - 消除特殊情况
    switch (type) {
      case 'manifest':
        return format ? `manifests/${path}/manifest.${format}` : `manifests/${path}/manifest.json`;
      case 'collection':
        return format ? `manifests/${path}/collection.${format}` : `manifests/${path}/collection.json`;
      case 'image':
        return path; // image路径已经包含了完整的IIIF Image API格式
      default:
        throw new Error(`Unknown type: ${type}`);
    }
  }
  
  private static parsePathSegment(pathSegment: string): { path: string; type: 'manifest' | 'collection' | 'image'; format?: string } {
    // 检查是否是manifest路径
    if (pathSegment.includes('manifests/')) {
      const match = pathSegment.match(/manifests\/(.+?)\/(manifest|collection)\.(\w+)$/);
      if (match) {
        return {
          path: match[1],
          type: match[2] as 'manifest' | 'collection',
          format: match[3]
        };
      }
    }
    
    // 检查是否是image路径
    if (pathSegment.includes('/full/') && pathSegment.includes('/default.')) {
      const match = pathSegment.match(/(.+?)\/full\/(.+?)\/(\d+)\/(\d+)\/default\.(\w+)$/);
      if (match) {
        return {
          path: pathSegment,
          type: 'image',
          format: match[5]
        };
      }
    }
    
    throw new Error(`Unknown path segment format: ${pathSegment}`);
  }
  
  private static shouldProxy(url: string): boolean {
    // 在开发环境下代理外部URL
    return import.meta.env.DEV && url.startsWith('https://');
  }
  
  private static buildProxyUrl(url: string): string {
    return `/proxy?url=${encodeURIComponent(url)}`;
  }
  
  private static parseProxyUrl(url: string): string | null {
    if (url.startsWith('/proxy?url=')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      return decodeURIComponent(urlParams.get('url') || '');
    }
    return null;
  }
  
  private static fixComponents(components: IIIFUrlComponents): IIIFUrlComponents {
    const fixed = { ...components };
    
    // 修复base URL
    if (!fixed.baseUrl.startsWith('http')) {
      fixed.baseUrl = this.DEFAULT_BASE_URL;
    }
    
    // 修复版本
    if (!fixed.version || !/^\d+$/.test(fixed.version)) {
      fixed.version = this.DEFAULT_VERSION;
    }
    
    // 修复格式
    if (fixed.format && !this.SUPPORTED_FORMATS.includes(fixed.format)) {
      fixed.format = 'json';
    }
    
    return fixed;
  }
  
  private static heuristicFix(url: string): string {
    // 启发式修复常见问题
    let fixed = url;
    
    // 修复双斜杠
    fixed = fixed.replace(/([^:])\/\//g, '$1/');
    
    // 修复编码问题
    if (url.includes('/') && !url.includes('%2F')) {
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1];
      if (lastPart.includes('/')) {
        parts[parts.length - 1] = lastPart.replace(/\//g, '%2F');
        fixed = parts.join('/');
      }
    }
    
    return fixed;
  }
}