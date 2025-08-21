// =============== 性能监控类型定义 ===============

interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface FirstInputEntry extends PerformanceEntry {
  processingStart: number;
}

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export interface PerformanceMetrics {
  // 服务器启动性能
  serverStartup: {
    startTime: number;
    endTime: number;
    duration: number;
    firstResponseTime: number;
    hotReloadTime?: number;
  };
  
  // 页面加载性能
  pageLoad: {
    fcp: number; // First Contentful Paint
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
    loadComplete: number; // 页面完全加载时间
    domInteractive: number; // DOM可交互时间
    domComplete: number; // DOM构建完成时间
  };
  
  // 图片加载性能
  images: {
    totalImages: number;
    loadedImages: number;
    failedImages: number;
    cachedImages: number;
    averageLoadTime: number;
    imageLoadTimes: Array<{
      id: number;
      url: string;
      startTime: number;
      endTime: number;
      duration: number;
      cached: boolean;
      success: boolean;
    }>;
  };
  
  // DOM渲染性能
  domRendering: {
    heroBackdropRender: {
      startTime: number;
      endTime: number;
      duration: number;
    };
    columnsRender: Array<{
      columnIndex: number;
      startTime: number;
      endTime: number;
      duration: number;
      itemCount: number;
    }>;
    skeletonShowTime: number;
    firstContentTime: number;
    fullRenderTime: number;
  };
  
  // 网络性能
  network: {
    requestCount: number;
    totalSize: number;
    averageResponseTime: number;
    networkType: string;
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
  
  // 内存使用
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  
  // 自定义标记
  customMarks: Array<{
    name: string;
    startTime: number;
    endTime: number;
    duration: number;
  }>;
}

export interface ImageLoadMetric {
  id: number;
  url: string;
  startTime: number;
  endTime: number;
  duration: number;
  cached: boolean;
  success: boolean;
  width?: number;
  height?: number;
}

export interface RenderMetric {
  componentName: string;
  startTime: number;
  endTime: number;
  duration: number;
  props?: Record<string, unknown>;
}

// =============== 性能监控工具类 ===============

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Partial<PerformanceMetrics> = {};
  private imageLoadMetrics: Map<number, ImageLoadMetric> = new Map();
  private renderMetrics: Map<string, RenderMetric> = new Map();
  private customMarks: Map<string, { startTime: number; endTime?: number }> = new Map();
  private observers: PerformanceObserver[] = [];

  private constructor() {
    this.initializeMetrics();
    this.setupPerformanceObservers();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeMetrics(): void {
    this.metrics = {
      serverStartup: {
        startTime: 0,
        endTime: 0,
        duration: 0,
        firstResponseTime: 0,
      },
      pageLoad: {
        fcp: 0,
        lcp: 0,
        fid: 0,
        cls: 0,
        loadComplete: 0,
        domInteractive: 0,
        domComplete: 0,
      },
      images: {
        totalImages: 0,
        loadedImages: 0,
        failedImages: 0,
        cachedImages: 0,
        averageLoadTime: 0,
        imageLoadTimes: [],
      },
      domRendering: {
        heroBackdropRender: {
          startTime: 0,
          endTime: 0,
          duration: 0,
        },
        columnsRender: [],
        skeletonShowTime: 0,
        firstContentTime: 0,
        fullRenderTime: 0,
      },
      network: {
        requestCount: 0,
        totalSize: 0,
        averageResponseTime: 0,
        networkType: '',
        effectiveType: '',
        downlink: 0,
        rtt: 0,
      },
      memory: {
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0,
      },
      customMarks: [],
    };
  }

  private setupPerformanceObservers(): void {
    if (typeof window === 'undefined') return;

    // 监听页面加载性能
    try {
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.pageLoad!.fcp = entry.startTime;
          }
        });
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);
    } catch (e) {
      console.warn('Paint Observer not supported:', e);
    }

    // 监听最大内容绘制
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcpEntry = entries[entries.length - 1];
        if (lcpEntry) {
          this.metrics.pageLoad!.lcp = lcpEntry.startTime;
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    } catch (e) {
      console.warn('LCP Observer not supported:', e);
    }

    // 监听布局偏移
    try {
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        list.getEntries().forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += (entry as LayoutShiftEntry).value;
          }
        });
        this.metrics.pageLoad!.cls = clsValue;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    } catch (e) {
      console.warn('CLS Observer not supported:', e);
    }

    // 监听首次输入延迟
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fidEntry = entries[0] as FirstInputEntry | undefined;
        if (fidEntry) {
          this.metrics.pageLoad!.fid = fidEntry.processingStart - fidEntry.startTime;
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    } catch (e) {
      console.warn('FID Observer not supported:', e);
    }

    // 监听资源加载
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.initiatorType === 'img') {
            this.trackImageLoad(entry);
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);
    } catch (e) {
      console.warn('Resource Observer not supported:', e);
    }
  }

  // =============== 标记开始/结束 ===============

  static markStart(name: string): void {
    const instance = PerformanceMonitor.getInstance();
    const markName = name.startsWith('hero-') ? `${name}-start` : `hero-${name}-start`;
    
    // 安全检查：确保 performance API 可用
    if (typeof performance === 'undefined' || typeof performance.mark !== 'function') {
      console.warn('Performance API not available, skipping mark:', markName);
      return;
    }
    
    try {
      performance.mark(markName);
      instance.customMarks.set(name, { startTime: performance.now() });
    } catch (error) {
      console.warn('Failed to create performance mark:', markName, error);
    }
  }

  static markEnd(name: string): number {
    const instance = PerformanceMonitor.getInstance();
    const startMark = name.startsWith('hero-') ? `${name}-start` : `hero-${name}-start`;
    const endMark = name.startsWith('hero-') ? `${name}-end` : `hero-${name}-end`;
    
    // 安全检查：确保 performance API 可用
    if (typeof performance === 'undefined' || typeof performance.mark !== 'function') {
      console.warn('Performance API not available, skipping mark:', endMark);
      return 0;
    }
    
    try {
      performance.mark(endMark);
      performance.measure(name, startMark, endMark);
      
      const measures = performance.getEntriesByName(name);
      const duration = measures.length > 0 ? measures[measures.length - 1].duration : 0;
      
      const markData = instance.customMarks.get(name);
      if (markData) {
        markData.endTime = performance.now();
        instance.metrics.customMarks?.push({
          name,
          startTime: markData.startTime,
          endTime: markData.endTime,
          duration,
        });
      }
      
      // 清理标记
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(name);
      
      return duration;
    } catch (error) {
      console.warn('Failed to measure performance:', name, error);
      return 0;
    }
  }

  // =============== 图片加载监控 ===============

  static trackImageStart(id: number, url: string): void {
    const instance = PerformanceMonitor.getInstance();
    instance.imageLoadMetrics.set(id, {
      id,
      url,
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
      cached: false,
      success: false,
    });
  }

  static trackImageEnd(id: number, success: boolean, cached: boolean = false, width?: number, height?: number): void {
    const instance = PerformanceMonitor.getInstance();
    const metric = instance.imageLoadMetrics.get(id);
    
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      metric.success = success;
      metric.cached = cached;
      if (width) metric.width = width;
      if (height) metric.height = height;
      
      // 更新汇总统计
      const images = instance.metrics.images!;
      images.totalImages++;
      if (success) {
        images.loadedImages++;
        if (cached) {
          images.cachedImages++;
        }
      } else {
        images.failedImages++;
      }
      
      // 计算平均加载时间
      const totalTime = images.imageLoadTimes.reduce((sum, img) => sum + img.duration, 0) + metric.duration;
      images.averageLoadTime = totalTime / (images.imageLoadTimes.length + 1);
      
      images.imageLoadTimes.push(metric);
    }
  }

  private trackImageLoad(entry: PerformanceEntry): void {
    if (entry.initiatorType !== 'img') return;
    
    const url = entry.name;
    const id = this.extractImageIdFromUrl(url);
    
    if (id) {
      const cached = this.isImageCached(entry);
      this.trackImageEnd(id, true, cached);
    }
  }

  private extractImageIdFromUrl(url: string): number | null {
    // 从URL中提取图片ID，例如：/images/hero_page/book_12345.jpg -> 12345
    const match = url.match(/book_(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }

  private isImageCached(entry: PerformanceEntry): boolean {
    const resourceEntry = entry as PerformanceResourceTiming;
    return resourceEntry.transferSize === 0;
  }

  // =============== 渲染性能监控 ===============

  static trackRenderStart(componentName: string, props?: Record<string, unknown>): void {
    const instance = PerformanceMonitor.getInstance();
    const renderId = `${componentName}-${performance.now()}`;
    
    instance.renderMetrics.set(renderId, {
      componentName,
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
      props,
    });
    
    return renderId;
  }

  static trackRenderEnd(renderId: string): void {
    const instance = PerformanceMonitor.getInstance();
    const metric = instance.renderMetrics.get(renderId);
    
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      
      // 特殊处理HeroBackdrop
      if (metric.componentName === 'HeroPageBackdrop') {
        instance.metrics.domRendering!.heroBackdropRender = {
          startTime: metric.startTime,
          endTime: metric.endTime,
          duration: metric.duration,
        };
      }
    }
  }

  // =============== 网络信息监控 ===============

  static updateNetworkInfo(): void {
    const instance = PerformanceMonitor.getInstance();
    const nav = navigator as Navigator & { connection?: NetworkInformation };
    
    if (nav.connection) {
      instance.metrics.network = {
        ...instance.metrics.network!,
        networkType: nav.connection.type || 'unknown',
        effectiveType: nav.connection.effectiveType || 'unknown',
        downlink: nav.connection.downlink || 0,
        rtt: nav.connection.rtt || 0,
      };
    }
  }

  // =============== 内存使用监控 ===============

  static updateMemoryInfo(): void {
    const instance = PerformanceMonitor.getInstance();
    const perf = performance as Performance & { memory?: PerformanceMemory };
    
    if (perf.memory) {
      instance.metrics.memory = {
        usedJSHeapSize: perf.memory.usedJSHeapSize,
        totalJSHeapSize: perf.memory.totalJSHeapSize,
        jsHeapSizeLimit: perf.memory.jsHeapSizeLimit,
      };
    }
  }

  // =============== 获取性能指标 ===============

  static getMetrics(): PerformanceMetrics {
    const instance = PerformanceMonitor.getInstance();
    
    // 更新页面加载时间
    if (typeof window !== 'undefined' && window.performance) {
      const timing = window.performance.timing;
      instance.metrics.pageLoad!.loadComplete = timing.loadEventEnd - timing.navigationStart;
      instance.metrics.pageLoad!.domInteractive = timing.domInteractive - timing.navigationStart;
      instance.metrics.pageLoad!.domComplete = timing.domComplete - timing.navigationStart;
    }
    
    // 更新网络和内存信息
    instance.updateNetworkInfo();
    instance.updateMemoryInfo();
    
    return instance.metrics as PerformanceMetrics;
  }

  // =============== 导出性能数据 ===============

  static exportMetrics(): string {
    const metrics = this.getMetrics();
    return JSON.stringify(metrics, null, 2);
  }

  static exportToFile(filename: string = 'performance-metrics.json'): void {
    const metrics = this.exportMetrics();
    const blob = new Blob([metrics], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // =============== 清理资源 ===============

  static cleanup(): void {
    const instance = PerformanceMonitor.getInstance();
    
    // 停止所有观察者
    instance.observers.forEach(observer => {
      observer.disconnect();
    });
    instance.observers = [];
    
    // 清理数据
    instance.imageLoadMetrics.clear();
    instance.renderMetrics.clear();
    instance.customMarks.clear();
    
    // 重新初始化
    instance.initializeMetrics();
  }
}

// =============== 便捷函数 ===============

export function measurePerformance<T>(name: string, fn: () => T): T {
  PerformanceMonitor.markStart(name);
  const result = fn();
  PerformanceMonitor.markEnd(name);
  return result;
}

export async function measureAsyncPerformance<T>(name: string, fn: () => Promise<T>): Promise<T> {
  PerformanceMonitor.markStart(name);
  const result = await fn();
  PerformanceMonitor.markEnd(name);
  return result;
}

export default PerformanceMonitor;