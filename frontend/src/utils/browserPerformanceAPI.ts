// =============== 浏览器性能API集成工具 ===============

export interface CoreWebVitals {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  fmp: number; // First Meaningful Paint
  tti: number; // Time to Interactive
}

// 性能条目类型扩展
interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface FirstInputEntry extends PerformanceEntry {
  processingStart: number;
  startTime: number;
}

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface NetworkInfo {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

interface ExtendedPerformance extends Performance {
  memory?: MemoryInfo;
}

interface ExtendedNavigator extends Navigator {
  connection?: NetworkInfo;
}

export interface ResourceTiming {
  name: string;
  startTime: number;
  duration: number;
  transferSize: number;
  encodedBodySize: number;
  decodedBodySize: number;
  initiatorType: string;
  nextHopProtocol: string;
  responseStart: number;
  responseEnd: number;
}

export interface NavigationTiming {
  domComplete: number;
  domInteractive: number;
  domContentLoaded: number;
  loadEventEnd: number;
  redirectStart: number;
  redirectEnd: number;
  fetchStart: number;
  domainLookupStart: number;
  domainLookupEnd: number;
  connectStart: number;
  connectEnd: number;
  requestStart: number;
  responseStart: number;
  responseEnd: number;
}

export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export interface NetworkInfo {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

export interface PerformanceData {
  coreWebVitals: CoreWebVitals;
  resourceTiming: ResourceTiming[];
  navigationTiming: NavigationTiming;
  memoryInfo: MemoryInfo | null;
  networkInfo: NetworkInfo | null;
  customMetrics: Record<string, number>;
  timestamp: number;
  userAgent: string;
}

class BrowserPerformanceAPI {
  private static instance: BrowserPerformanceAPI;
  private observers: PerformanceObserver[] = [];
  private customMetrics: Record<string, number> = {};
  private resourceTimings: ResourceTiming[] = [];

  private constructor() {
    this.initializeObservers();
    this.collectInitialData();
  }

  static getInstance(): BrowserPerformanceAPI {
    if (!BrowserPerformanceAPI.instance) {
      BrowserPerformanceAPI.instance = new BrowserPerformanceAPI();
    }
    return BrowserPerformanceAPI.instance;
  }

  private initializeObservers(): void {
    if (typeof window === 'undefined' || !window.performance) return;

    // 监听绘制时间
    this.setupPaintObserver();
    
    // 监听最大内容绘制
    this.setupLCPObserver();
    
    // 监听布局偏移
    this.setupCLSObserver();
    
    // 监听首次输入延迟
    this.setupFIDObserver();
    
    // 监听资源加载
    this.setupResourceObserver();
    
    // 监听导航时间
    this.setupNavigationObserver();
  }

  private setupPaintObserver(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.customMetrics.fcp = entry.startTime;
          }
        });
      });
      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('Paint Observer not supported:', e);
    }
  }

  private setupLCPObserver(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcpEntry = entries[entries.length - 1];
        if (lcpEntry) {
          this.customMetrics.lcp = lcpEntry.startTime;
        }
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('LCP Observer not supported:', e);
    }
  }

  private setupCLSObserver(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        let clsValue = 0;
        list.getEntries().forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += (entry as LayoutShiftEntry).value;
          }
        });
        this.customMetrics.cls = clsValue;
      });
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('CLS Observer not supported:', e);
    }
  }

  private setupFIDObserver(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fidEntry = entries[0] as FirstInputEntry;
        if (fidEntry) {
          this.customMetrics.fid = fidEntry.processingStart - fidEntry.startTime;
        }
      });
      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('FID Observer not supported:', e);
    }
  }

  private setupResourceObserver(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            this.resourceTimings.push({
              name: entry.name,
              startTime: entry.startTime,
              duration: entry.duration,
              transferSize: resourceEntry.transferSize,
              encodedBodySize: resourceEntry.encodedBodySize,
              decodedBodySize: resourceEntry.decodedBodySize,
              initiatorType: resourceEntry.initiatorType,
              nextHopProtocol: resourceEntry.nextHopProtocol,
              responseStart: resourceEntry.responseStart,
              responseEnd: resourceEntry.responseEnd,
            });
          }
        });
      });
      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('Resource Observer not supported:', e);
    }
  }

  private setupNavigationObserver(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.customMetrics.ttfb = navEntry.responseStart - navEntry.requestStart;
            this.customMetrics.tti = navEntry.domInteractive - navEntry.fetchStart;
          }
        });
      });
      observer.observe({ entryTypes: ['navigation'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('Navigation Observer not supported:', e);
    }
  }

  private collectInitialData(): void {
    if (typeof window === 'undefined') return;

    // 收集导航时间
    this.collectNavigationTiming();
    
    // 收集内存信息
    this.collectMemoryInfo();
    
    // 收集网络信息
    this.collectNetworkInfo();
    
    // 收集用户代理
    this.customMetrics.userAgent = navigator.userAgent;
  }

  private collectNavigationTiming(): void {
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      this.customMetrics.domComplete = timing.domComplete - timing.navigationStart;
      this.customMetrics.domInteractive = timing.domInteractive - timing.navigationStart;
      this.customMetrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
      this.customMetrics.loadEventEnd = timing.loadEventEnd - timing.navigationStart;
    }
  }

  private collectMemoryInfo(): void {
    const perf = performance as ExtendedPerformance;
    if (perf.memory) {
      this.customMetrics.usedJSHeapSize = perf.memory.usedJSHeapSize;
      this.customMetrics.totalJSHeapSize = perf.memory.totalJSHeapSize;
      this.customMetrics.jsHeapSizeLimit = perf.memory.jsHeapSizeLimit;
    }
  }

  private collectNetworkInfo(): void {
    const nav = navigator as ExtendedNavigator;
    if (nav.connection) {
      this.customMetrics.effectiveType = nav.connection.effectiveType;
      this.customMetrics.downlink = nav.connection.downlink;
      this.customMetrics.rtt = nav.connection.rtt;
      this.customMetrics.saveData = nav.connection.saveData;
    }
  }

  // =============== 公共API ===============

  static getCoreWebVitals(): CoreWebVitals {
    const instance = BrowserPerformanceAPI.getInstance();
    return {
      fcp: instance.customMetrics.fcp || 0,
      lcp: instance.customMetrics.lcp || 0,
      fid: instance.customMetrics.fid || 0,
      cls: instance.customMetrics.cls || 0,
      ttfb: instance.customMetrics.ttfb || 0,
      fmp: instance.customMetrics.fmp || 0,
      tti: instance.customMetrics.tti || 0,
    };
  }

  static getResourceTimings(): ResourceTiming[] {
    const instance = BrowserPerformanceAPI.getInstance();
    return [...instance.resourceTimings];
  }

  static getNavigationTiming(): NavigationTiming {
    const instance = BrowserPerformanceAPI.getInstance();
    return {
      domComplete: instance.customMetrics.domComplete || 0,
      domInteractive: instance.customMetrics.domInteractive || 0,
      domContentLoaded: instance.customMetrics.domContentLoaded || 0,
      loadEventEnd: instance.customMetrics.loadEventEnd || 0,
      redirectStart: instance.customMetrics.redirectStart || 0,
      redirectEnd: instance.customMetrics.redirectEnd || 0,
      fetchStart: instance.customMetrics.fetchStart || 0,
      domainLookupStart: instance.customMetrics.domainLookupStart || 0,
      domainLookupEnd: instance.customMetrics.domainLookupEnd || 0,
      connectStart: instance.customMetrics.connectStart || 0,
      connectEnd: instance.customMetrics.connectEnd || 0,
      requestStart: instance.customMetrics.requestStart || 0,
      responseStart: instance.customMetrics.responseStart || 0,
      responseEnd: instance.customMetrics.responseEnd || 0,
    };
  }

  static getMemoryInfo(): MemoryInfo | null {
    const instance = BrowserPerformanceAPI.getInstance();
    if (instance.customMetrics.usedJSHeapSize) {
      return {
        usedJSHeapSize: instance.customMetrics.usedJSHeapSize,
        totalJSHeapSize: instance.customMetrics.totalJSHeapSize,
        jsHeapSizeLimit: instance.customMetrics.jsHeapSizeLimit,
      };
    }
    return null;
  }

  static getNetworkInfo(): NetworkInfo | null {
    const instance = BrowserPerformanceAPI.getInstance();
    if (instance.customMetrics.effectiveType) {
      return {
        effectiveType: instance.customMetrics.effectiveType,
        downlink: instance.customMetrics.downlink,
        rtt: instance.customMetrics.rtt,
        saveData: instance.customMetrics.saveData,
      };
    }
    return null;
  }

  static addCustomMetric(name: string, value: number): void {
    const instance = BrowserPerformanceAPI.getInstance();
    instance.customMetrics[name] = value;
  }

  static getPerformanceData(): PerformanceData {
    const instance = BrowserPerformanceAPI.getInstance();
    return {
      coreWebVitals: this.getCoreWebVitals(),
      resourceTiming: this.getResourceTimings(),
      navigationTiming: this.getNavigationTiming(),
      memoryInfo: this.getMemoryInfo(),
      networkInfo: this.getNetworkInfo(),
      customMetrics: { ...instance.customMetrics },
      timestamp: Date.now(),
      userAgent: instance.customMetrics.userAgent || '',
    };
  }

  static getImageLoadMetrics(): Array<{
    url: string;
    loadTime: number;
    size: number;
    cached: boolean;
  }> {
    const resourceTimings = this.getResourceTimings();
    return resourceTimings
      .filter(resource => resource.initiatorType === 'img')
      .map(resource => ({
        url: resource.name,
        loadTime: resource.duration,
        size: resource.transferSize,
        cached: resource.transferSize === 0,
      }));
  }

  static getNetworkPerformance(): {
    totalRequests: number;
    totalSize: number;
    averageLoadTime: number;
    cachedRequests: number;
  } {
    const resourceTimings = this.getResourceTimings();
    const totalRequests = resourceTimings.length;
    const totalSize = resourceTimings.reduce((sum, resource) => sum + resource.transferSize, 0);
    const averageLoadTime = totalRequests > 0 
      ? resourceTimings.reduce((sum, resource) => sum + resource.duration, 0) / totalRequests 
      : 0;
    const cachedRequests = resourceTimings.filter(resource => resource.transferSize === 0).length;

    return {
      totalRequests,
      totalSize,
      averageLoadTime,
      cachedRequests,
    };
  }

  static exportPerformanceReport(): string {
    const data = this.getPerformanceData();
    return JSON.stringify(data, null, 2);
  }

  static exportToFile(filename: string = 'browser-performance-report.json'): void {
    const data = this.exportPerformanceReport();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static cleanup(): void {
    const instance = BrowserPerformanceAPI.getInstance();
    
    // 停止所有观察者
    instance.observers.forEach(observer => {
      observer.disconnect();
    });
    instance.observers = [];
    
    // 清理数据
    instance.customMetrics = {};
    instance.resourceTimings = [];
  }
}

// =============== 便捷函数 ===============

export function measurePageLoadPerformance(): Promise<PerformanceData> {
  return new Promise((resolve) => {
    // 等待页面完全加载
    if (document.readyState === 'complete') {
      resolve(BrowserPerformanceAPI.getPerformanceData());
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => {
          resolve(BrowserPerformanceAPI.getPerformanceData());
        }, 1000);
      });
    }
  });
}

export function startPerformanceMonitoring(): () => void {
  // 定期收集性能数据
  const interval = setInterval(() => {
    const data = BrowserPerformanceAPI.getPerformanceData();
    console.log('[Performance Monitor]', data);
  }, 5000);
  
  return () => {
    clearInterval(interval);
    BrowserPerformanceAPI.cleanup();
  };
}

export default BrowserPerformanceAPI;