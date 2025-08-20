import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { fetchHeroImages, type MasonryItem as BaseMasonryItem } from '@/services/heroImageService';

// =============== 类型定义 ===============
type MasonryItem = BaseMasonryItem & { calculatedHeight?: number };
type AspectCategory = 'portrait' | 'square' | 'landscape';

// HeroBackgroundProps 接口已移除，因为不再需要 scrollY 参数

interface LayoutConfig {
  width: number;
  height: number;
  columns: number;
  columnWidth: number;
}

interface WindowSize {
  width: number;
  height: number;
}

// =============== 配置常量 ===============
const CONFIG = {
  // 布局相关
  LAYOUT: {
    H_GAP_PX: 10,
    V_GAP_PX: 20,
    FALLBACK_ASPECT: 0.8,
    IMAGE_HEIGHT_SCALE: 0.7,
    VARIATION_INTENSITY: 0.6,
    CONTAINER_HEIGHT_MULTIPLIER: 2,
  },
  
  // 数据处理
  DATA: {
    REPEAT_TIMES: 1,
    STABLE_SEED: 'hero-backdrop-v1',
  },
  
  // 视觉效果
  VISUAL: {
    BAND_BLUR_PX: 1,
    BAND_SATURATE: 0.75,
    BAND_BRIGHTNESS: 0.88,
    PARALLAX_SPEED: 0.3,
  },
  
  // 响应式断点
  BREAKPOINTS: {
    SM: 640,
    MD: 1024,
    LG: 1440
  },
  
  // 性能优化
  PERFORMANCE: {
    DEBOUNCE_DELAY: 250,
    MAX_CONCURRENT_PRELOADS: 6,
    VISIBLE_ITEMS_PER_COLUMN: 3,
    IDLE_TIMEOUT_MS: 1200,
    FALLBACK_DELAY_MS: 120,
  },
  
  // 懒加载配置
  LAZY_LOADING: {
    ROOT_MARGIN: '100px',
    THRESHOLD: 0.01,
  },
  
  // 调试
  DEBUG: false,
} as const;

// 网络质量检测配置
const NETWORK_CONDITIONS = {
  SLOW_TYPES: ['slow-2g', '2g'] as const,
} as const;

// 占位图片，避免空 src 触发无效请求
const PLACEHOLDER_SRC = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

// 列节奏模板
const RHYTHM_PATTERN = [-0.06, 0.0, 0.05, -0.03, 0.02] as const;

// 宽高比分类权重
const CATEGORY_WEIGHTS: Record<AspectCategory, number> = {
  portrait: 1,
  square: 3,
  landscape: 4
} as const;

// =============== 工具函数 ===============
class Utils {
  // Debounce工具函数
  static debounce<T extends (...args: unknown[]) => void>(
    func: T, 
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;
    
    return function executedFunction(...args: Parameters<T>): void {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // 基于key生成稳定的伪随机数
  static randomUnitFromKey(key: string): number {
    let hash = 2166136261;
    for (let i = 0; i < key.length; i += 1) {
      hash ^= key.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return ((hash >>> 0) % 10000) / 10000;
  }

  // 稳定洗牌算法
  static stableShuffle<T>(arr: T[], seed: string): T[] {
    return [...arr]
      .map((item, index) => ({ 
        item, 
        key: Utils.randomUnitFromKey(`${seed}-${index}`) 
      }))
      .sort((a, b) => a.key - b.key)
      .map(({ item }) => item);
  }

  // 调试日志
  static debugLog(enabled: boolean, ...args: unknown[]): void {
    if (enabled) {
      console.log('[HeroBackdrop]', ...args);
    }
  }

  // 安全获取窗口尺寸
  static safeWindowSize(): WindowSize {
    const width = Number.isFinite(window.innerWidth) ? window.innerWidth : 1280;
    const height = Number.isFinite(window.innerHeight) ? window.innerHeight : 800;
    return { width, height };
  }

  // 安全数值处理
  static safeNumber(value: unknown, fallback = 0): number {
    return typeof value === 'number' && !isNaN(value) ? value : fallback;
  }
}

// =============== 布局计算类 ===============
class LayoutCalculator {
  // 计算列数
  static computeColumns(width: number): number {
    if (width < CONFIG.BREAKPOINTS.SM) return 2;
    if (width < CONFIG.BREAKPOINTS.MD) return 3;
    if (width < CONFIG.BREAKPOINTS.LG) return 4;
    return 5;
  }

  // 计算列宽
  static computeColumnWidth(width: number, columns: number, gapX: number): number {
    const w = (width - (columns - 1) * gapX) / columns;
    return Number.isFinite(w) && w > 0 ? w : 0;
  }

  // 获取布局配置
  static getLayoutConfig(): LayoutConfig {
    const { width, height } = Utils.safeWindowSize();
    const columns = LayoutCalculator.computeColumns(width);
    const columnWidth = LayoutCalculator.computeColumnWidth(width, columns, CONFIG.LAYOUT.H_GAP_PX);
    
    return {
      width,
      height: height * CONFIG.LAYOUT.CONTAINER_HEIGHT_MULTIPLIER,
      columns,
      columnWidth
    };
  }
}

// =============== 懒加载工具 ===============
class LazyLoadingManager {
  // 检测是否支持 IntersectionObserver
  static isSupported(): boolean {
    return typeof IntersectionObserver !== 'undefined';
  }

  // 创建 IntersectionObserver 配置
  static createObserverConfig(): IntersectionObserverInit {
    return {
      root: null,
      rootMargin: CONFIG.LAZY_LOADING.ROOT_MARGIN,
      threshold: CONFIG.LAZY_LOADING.THRESHOLD,
    };
  }

  // 处理图片懒加载逻辑
  static handleImageLoad(el: HTMLImageElement): void {
    const realSrc = el.dataset && el.dataset.src ? el.dataset.src : '';
    if (realSrc) {
      el.src = realSrc;
    }
  }
}

// =============== 网络检测工具 ===============
class NetworkDetector {
  // 检测网络连接信息
  static getConnectionInfo(): {
    saveData: boolean;
    effectiveType: string;
    isSlowNetwork: boolean;
  } {
    const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
    const connection = nav && nav.connection ? nav.connection : null;
    const saveData = connection && connection.saveData === true;
    const effectiveType = connection && typeof connection.effectiveType === 'string' 
      ? connection.effectiveType 
      : '';
    const isSlowNetwork = NETWORK_CONDITIONS.SLOW_TYPES.includes(effectiveType as any);
    
    return { saveData, effectiveType, isSlowNetwork };
  }

  // 判断是否应该延迟加载
  static shouldDeferLoading(): boolean {
    const { saveData, isSlowNetwork } = NetworkDetector.getConnectionInfo();
    return !saveData && !isSlowNetwork;
  }
}

// =============== 图片处理类 ===============
class ImageProcessor {
  // 获取宽高比分类
  static getAspectCategory(aspect: number): AspectCategory {
    if (aspect > 1.05) return 'portrait';
    if (aspect < 0.85) return 'landscape';
    return 'square';
  }

  // 获取项目的宽高比
  static getAspectForItem(
    item: BaseMasonryItem, 
    aspectMap: Record<number, number>
  ): number {
    const measured = aspectMap[item.id];
    return typeof measured === 'number' && measured > 0 
      ? measured 
      : (item.aspectRatio || CONFIG.LAYOUT.FALLBACK_ASPECT);
  }

  // 构建加权素材池
  static buildWeightedPool(
    items: BaseMasonryItem[], 
    aspectMap: Record<number, number>
  ): BaseMasonryItem[] {
    return items.flatMap((item) => {
      const aspect = ImageProcessor.getAspectForItem(item, aspectMap);
      const category = ImageProcessor.getAspectCategory(aspect);
      const weight = CATEGORY_WEIGHTS[category] || 2;
      return Array.from({ length: weight }, () => item);
    });
  }

  // 构建重复项目列表
  static buildRepeatedItems(
    items: BaseMasonryItem[], 
    repeat: number, 
    seed: string
  ): BaseMasonryItem[] {
    const base = Array.from({ length: repeat }, () => items).flat();
    return Utils.stableShuffle(base, seed);
  }

  // 预加载图片并获取真实尺寸（支持清理和并发控制）
  static preloadImagesWithCleanup(
    items: BaseMasonryItem[],
    onAspectMeasured: (id: number, aspect: number) => void
  ): () => void {
    const abortController = new AbortController();
    const imageObjects: HTMLImageElement[] = [];
    let currentlyLoading = 0;
    let itemIndex = 0;
    
    const loadNextBatch = () => {
      while (currentlyLoading < CONFIG.PERFORMANCE.MAX_CONCURRENT_PRELOADS && itemIndex < items.length) {
        if (abortController.signal.aborted) break;
        
        const item = items[itemIndex++];
        const img = new Image();
        imageObjects.push(img);
        currentlyLoading++;
        
        const handleLoad = () => {
          if (img.naturalWidth > 0 && img.naturalHeight > 0 && !abortController.signal.aborted) {
            const ratio = img.naturalHeight / img.naturalWidth;
            onAspectMeasured(item.id, ratio);
          }
          // 清理事件监听器
          img.onload = null;
          img.onerror = null;
          currentlyLoading--;
          // 继续加载下一批
          loadNextBatch();
        };
        
        const handleError = () => {
          if (!abortController.signal.aborted) {
            Utils.debugLog(CONFIG.DEBUG, `图片加载失败: ${item.src}`);
          }
          // 清理事件监听器
          img.onload = null;
          img.onerror = null;
          currentlyLoading--;
          // 继续加载下一批
          loadNextBatch();
        };
        
        img.onload = handleLoad;
        img.onerror = handleError;
        img.src = item.src;
      }
    };
    
    // 开始加载
    loadNextBatch();
    
    // 返回清理函数
    return () => {
      abortController.abort();
      imageObjects.forEach(img => {
        // 清理事件监听器
        img.onload = null;
        img.onerror = null;
        // 取消图片加载
        img.src = '';
      });
      imageObjects.length = 0; // 清空数组
    };
  }

  // 保持原有方法向后兼容
  static preloadImages(
    items: BaseMasonryItem[],
    onAspectMeasured: (id: number, aspect: number) => void
  ): void {
    this.preloadImagesWithCleanup(items, onAspectMeasured);
  }
}

// =============== 瀑布流布局类 ===============
class MasonryLayouter {
  // 分发项目到各列
  static distributeItems(
    items: BaseMasonryItem[],
    columns: number,
    columnWidth: number,
    aspectMap: Record<number, number>
  ): MasonryItem[][] {
    const arrays: MasonryItem[][] = Array.from({ length: columns }, () => []);
    
    if (columns <= 0 || columnWidth <= 0) {
      Utils.debugLog(CONFIG.DEBUG, 'Invalid layout parameters', { columns, columnWidth });
      return arrays;
    }

    const columnHeights = new Array(columns).fill(0);
    const lastCategoryPerColumn: (AspectCategory | null)[] = new Array(columns).fill(null);
    const itemCountPerColumn: number[] = new Array(columns).fill(0);

    items.forEach((item) => {
      const aspect = ImageProcessor.getAspectForItem(item, aspectMap);
      const category = ImageProcessor.getAspectCategory(aspect);

      // 选择目标列：优先选择不同类别的最短列
      const candidates = columnHeights
        .map((height, idx) => ({ idx, height }))
        .sort((a, b) => a.height - b.height);

      let targetColumnIndex = candidates.find(
        c => lastCategoryPerColumn[c.idx] !== category
      )?.idx;
      
      if (typeof targetColumnIndex !== 'number') {
        targetColumnIndex = candidates[0].idx;
      }

      // 应用节奏变化
      const rhythmIdx = itemCountPerColumn[targetColumnIndex] % RHYTHM_PATTERN.length;
      const rhythmScale = 1 + RHYTHM_PATTERN[rhythmIdx] * CONFIG.LAYOUT.VARIATION_INTENSITY;
      const calculatedHeight = columnWidth * aspect * CONFIG.LAYOUT.IMAGE_HEIGHT_SCALE * rhythmScale;

      // 添加项目到目标列
      arrays[targetColumnIndex].push({ ...item, calculatedHeight });
      columnHeights[targetColumnIndex] += calculatedHeight + CONFIG.LAYOUT.V_GAP_PX;
      lastCategoryPerColumn[targetColumnIndex] = category;
      itemCountPerColumn[targetColumnIndex] += 1;
    });

    Utils.debugLog(CONFIG.DEBUG, 'Layout complete', { 
      columns, 
      columnWidth, 
      totalItems: items.length 
    });
    
    return arrays;
  }
}

// =============== 数据加载管理器 ===============
class DataLoadingManager {
  // 创建数据加载器
  static createImageLoader(
    onSuccess: (items: BaseMasonryItem[]) => void,
    onFinally: () => void
  ): () => void {
    return () => {
      fetchHeroImages()
        .then(onSuccess)
        .catch((err) => {
          console.error('[HeroBackdrop] fetchHeroImages error:', err);
        })
        .finally(onFinally);
    };
  }

  // 调度加载策略
  static scheduleLoading(
    loader: () => void,
    deferredRef: React.MutableRefObject<number | null>
  ): void {
    const shouldDefer = NetworkDetector.shouldDeferLoading();

    if (!shouldDefer) {
      // 慢网或省流量：立即加载，避免空窗
      loader();
    } else if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      // 延迟加载，设置较短超时，避免等待过长
      deferredRef.current = requestIdleCallback(loader, { 
        timeout: CONFIG.PERFORMANCE.IDLE_TIMEOUT_MS 
      });
    } else {
      // 降级方案：使用 setTimeout，短延迟
      deferredRef.current = setTimeout(loader, CONFIG.PERFORMANCE.FALLBACK_DELAY_MS) as unknown as number;
    }
  }

  // 清理调度
  static cleanupScheduled(deferredRef: React.MutableRefObject<number | null>): void {
    if (deferredRef.current) {
      if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        cancelIdleCallback(deferredRef.current);
      } else {
        clearTimeout(deferredRef.current);
      }
    }
  }
}

// =============== 主组件 ===============
export default function HeroPageBackdrop() {
  // State - 静态布局配置，在组件挂载时计算一次
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig | null>(null);
  const [remoteItems, setRemoteItems] = useState<BaseMasonryItem[]>([]);
  const [aspectMap, setAspectMap] = useState<Record<number, number>>({});
  const [isDeferred, setIsDeferred] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const deferredRef = useRef<number | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 宽高比测量回调
  const handleAspectMeasured = useCallback((id: number, aspect: number) => {
    setAspectMap((prev) => (prev[id] ? prev : { ...prev, [id]: aspect }));
  }, []);

  // 延迟加载初始化
  useEffect(() => {
    // 计算初始布局配置（不阻塞）
    const initialConfig = LayoutCalculator.getLayoutConfig();
    setLayoutConfig(initialConfig);
    
    // 创建数据加载器
    const imageLoader = DataLoadingManager.createImageLoader(
      setRemoteItems,
      () => setIsDeferred(true)
    );

    // 调度加载
    DataLoadingManager.scheduleLoading(imageLoader, deferredRef);

    return () => {
      DataLoadingManager.cleanupScheduled(deferredRef);
    };
  }, []);

  // 预加载图片并测量真实宽高比（带清理）
  useEffect(() => {
    if (remoteItems.length > 0 && isDeferred) {
      // 使用新的带清理的方法
      const cleanup = ImageProcessor.preloadImagesWithCleanup(remoteItems, handleAspectMeasured);
      cleanupRef.current = cleanup;
      
      // 返回清理函数
      return () => {
        if (cleanupRef.current) {
          cleanupRef.current();
          cleanupRef.current = null;
        }
      };
    }
  }, [remoteItems, handleAspectMeasured, isDeferred]);

  // 构建素材池
  const weightedPool = useMemo(() => 
    ImageProcessor.buildWeightedPool(remoteItems, aspectMap),
    [remoteItems, aspectMap]
  );

  const repeatedItems = useMemo(() => 
    ImageProcessor.buildRepeatedItems(weightedPool, CONFIG.DATA.REPEAT_TIMES, CONFIG.DATA.STABLE_SEED),
    [weightedPool]
  );

  // 计算列布局
  const columnArrays = useMemo(() => 
    layoutConfig ? MasonryLayouter.distributeItems(
      repeatedItems,
      layoutConfig.columns,
      layoutConfig.columnWidth,
      aspectMap
    ) : [],
    [repeatedItems, layoutConfig, aspectMap]
  );

  // 注册懒加载图片（需在 ImageItem 定义前）
  const registerLazyImage = useCallback((el: HTMLImageElement | null, src: string) => {
    if (!el) return;
    
    if (!LazyLoadingManager.isSupported() || !observerRef.current) {
      // 回退：直接加载真实图片
      el.src = src;
      return;
    }
    
    // 设置占位和数据属性
    if (!el.dataset || el.dataset.src !== src) {
      el.dataset.src = src;
      el.src = PLACEHOLDER_SRC;
    }
    
    observerRef.current.observe(el);
  }, []);

  // 图片项目组件
  const ImageItem = useCallback(({ 
    item, 
    columnIndex, 
    itemIndex 
  }: { 
    item: MasonryItem & { calculatedHeight: number };
    columnIndex: number;
    itemIndex: number;
  }) => {
    const isVisibleBucket = itemIndex < CONFIG.PERFORMANCE.VISIBLE_ITEMS_PER_COLUMN;
    return (
      <div
        key={`${item.id}-${columnIndex}-${itemIndex}`}
        className="relative overflow-hidden rounded-lg shadow-lg"
        style={{ height: `${item.calculatedHeight}px` }}
      >
        {isVisibleBucket ? (
          <img
            src={item.src}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        ) : (
          <img
            ref={(el) => registerLazyImage(el, item.src)}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
          />
        )}
      </div>
    );
  }, [registerLazyImage]);

  // 列组件
  const Column = useCallback(({ 
    column, 
    columnIndex 
  }: { 
    column: MasonryItem[];
    columnIndex: number;
  }) => (
    <div key={columnIndex} className="flex-1 space-y-4">
      {column.map((item, itemIndex) => {
        const itemWithHeight = item as MasonryItem & { calculatedHeight: number };
        return (
          <ImageItem
            key={`${item.id}-${columnIndex}-${itemIndex}`}
            item={itemWithHeight}
            columnIndex={columnIndex}
            itemIndex={itemIndex}
          />
        );
      })}
    </div>
  ), [ImageItem]);

  // 容器样式
  const containerStyle = useMemo(() => ({
    height: layoutConfig ? `${layoutConfig.height}px` : '100vh'
  }), [layoutConfig]);

  const scrollableStyle = useMemo(() => ({
    filter: `saturate(${CONFIG.VISUAL.BAND_SATURATE}) brightness(${CONFIG.VISUAL.BAND_BRIGHTNESS}) blur(${CONFIG.VISUAL.BAND_BLUR_PX}px)`
  }), []);

  // 懒加载：创建 IntersectionObserver（仅赋值不可见区图片的 src）
  useEffect(() => {
    if (observerRef.current) return;
    if (typeof window === 'undefined') return;
    if (!LazyLoadingManager.isSupported()) {
      // 环境不支持 IO，保持为空以触发回退逻辑
      return;
    }

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const el = entry.target as HTMLImageElement;
        if (entry.isIntersecting) {
          LazyLoadingManager.handleImageLoad(el);
          observerRef.current && observerRef.current.unobserve(el);
        }
      });
    }, LazyLoadingManager.createObserverConfig());

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  

  // 如果还没有延迟加载完成，返回空的占位容器
  if (!isDeferred) {
    return (
      <div 
        ref={containerRef}
        className="absolute inset-0 overflow-hidden"
        style={containerStyle}
      />
    );
  }

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={containerStyle}
    >
      <div 
        className="flex gap-4 h-full"
        style={scrollableStyle}
      >
        {columnArrays.map((column, columnIndex) => (
          <Column
            key={columnIndex}
            column={column}
            columnIndex={columnIndex}
          />
        ))}
      </div>
    </div>
  );
}