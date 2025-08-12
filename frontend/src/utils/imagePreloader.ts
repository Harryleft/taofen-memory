/**
 * 图片预加载工具
 * 用于优化图片加载性能
 */

export interface ImagePreloadOptions {
  priority?: boolean; // 是否优先加载
  timeout?: number; // 超时时间（毫秒）
  retryCount?: number; // 重试次数
}

export interface ImagePreloadResult {
  success: boolean;
  src: string;
  error?: string;
}

export class ImagePreloader {
  private static preloadCache = new Map<string, Promise<ImagePreloadResult>>();
  private static preloadedImages = new Set<string>();
  
  /**
   * 预加载单个图片
   */
  static async preloadImage(
    src: string, 
    options: ImagePreloadOptions = {}
  ): Promise<ImagePreloadResult> {
    const {
      priority = false,
      timeout = 5000,
      retryCount = 2
    } = options;
    
    // 如果已经预加载过，直接返回成功
    if (this.preloadedImages.has(src)) {
      return { success: true, src };
    }
    
    // 如果正在预加载中，返回同一个 Promise
    if (this.preloadCache.has(src)) {
      return this.preloadCache.get(src)!;
    }
    
    const preloadPromise = new Promise<ImagePreloadResult>((resolve) => {
      const img = new Image();
      let retryAttempts = 0;
      
      const loadHandler = () => {
        this.preloadedImages.add(src);
        resolve({ success: true, src });
      };
      
      const errorHandler = () => {
        retryAttempts++;
        if (retryAttempts <= retryCount) {
          // 重试
          setTimeout(() => {
            img.src = src;
          }, 1000 * retryAttempts);
        } else {
          resolve({ 
            success: false, 
            src, 
            error: `Failed to load image after ${retryCount} attempts` 
          });
        }
      };
      
      const timeoutHandler = () => {
        resolve({ 
          success: false, 
          src, 
          error: `Image load timeout after ${timeout}ms` 
        });
      };
      
      img.onload = loadHandler;
      img.onerror = errorHandler;
      
      // 设置超时
      const timeoutId = setTimeout(timeoutHandler, timeout);
      
      img.onload = () => {
        clearTimeout(timeoutId);
        loadHandler();
      };
      
      img.onerror = () => {
        clearTimeout(timeoutId);
        errorHandler();
      };
      
      // 开始加载
      img.src = src;
      
      // 如果是优先加载，设置 fetchPriority
      if (priority) {
        img.fetchPriority = 'high';
      }
    });
    
    this.preloadCache.set(src, preloadPromise);
    
    try {
      const result = await preloadPromise;
      return result;
    } finally {
      this.preloadCache.delete(src);
    }
  }
  
  /**
   * 批量预加载图片
   */
  static async preloadImages(
    srcs: string[], 
    options: ImagePreloadOptions = {}
  ): Promise<ImagePreloadResult[]> {
    const { priority = false } = options;
    
    // 如果是优先加载，串行加载
    if (priority) {
      const results: ImagePreloadResult[] = [];
      for (const src of srcs) {
        const result = await this.preloadImage(src, { ...options, priority: true });
        results.push(result);
      }
      return results;
    }
    
    // 并行加载
    const promises = srcs.map(src => this.preloadImage(src, options));
    return Promise.all(promises);
  }
  
  /**
   * 预加载可见区域的图片
   */
  static async preloadVisibleImages(
    container: HTMLElement, 
    selector: string = 'img[data-src]',
    options: ImagePreloadOptions = {}
  ): Promise<ImagePreloadResult[]> {
    const images = container.querySelectorAll(selector);
    const srcs = Array.from(images).map(img => img.getAttribute('data-src') || img.src);
    
    return this.preloadImages(srcs, options);
  }
  
  /**
   * 智能预加载策略
   */
  static async smartPreload(
    currentImages: string[], 
    nextImages: string[] = [],
    options: ImagePreloadOptions = {}
  ): Promise<void> {
    // 预加载当前页面的图片
    await this.preloadImages(currentImages, { ...options, priority: true });
    
    // 在后台预加载下一页的图片
    if (nextImages.length > 0) {
      this.preloadImages(nextImages, { ...options, priority: false })
        .catch(err => console.log('Background preloading failed:', err));
    }
  }
  
  /**
   * 清理缓存
   */
  static clearCache(): void {
    this.preloadCache.clear();
    this.preloadedImages.clear();
  }
  
  /**
   * 获取预加载状态
   */
  static getPreloadStatus(): { cached: number; preloaded: number } {
    return {
      cached: this.preloadCache.size,
      preloaded: this.preloadedImages.size
    };
  }
}