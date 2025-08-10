import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { fetchHeroImages, type MasonryItem as BaseMasonryItem } from '@/services/heroImageService';

// =============== 类型定义 ===============
type MasonryItem = BaseMasonryItem & { calculatedHeight?: number };
type AspectCategory = 'portrait' | 'square' | 'landscape';

interface HeroBackgroundProps {
  scrollY: number;
}

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
  H_GAP_PX: 10,
  V_GAP_PX: 20,
  FALLBACK_ASPECT: 0.8,
  IMAGE_HEIGHT_SCALE: 0.7,
  REPEAT_TIMES: 6,
  VARIATION_INTENSITY: 0.6,
  STABLE_SEED: 'hero-backdrop-v1',
  
  // 视觉效果
  BAND_BLUR_PX: 1,
  BAND_SATURATE: 0.75,
  BAND_BRIGHTNESS: 0.88,
  PARALLAX_SPEED: 0.3,
  CONTAINER_HEIGHT_MULTIPLIER: 2,
  
  // 响应式断点
  BREAKPOINTS: {
    SM: 640,
    MD: 1024,
    LG: 1440
  },
  
  // 性能相关
  DEBOUNCE_DELAY: 250,
  DEBUG: false
} as const;

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
  static debounce<T extends (...args: any[]) => any>(
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
    const columnWidth = LayoutCalculator.computeColumnWidth(width, columns, CONFIG.H_GAP_PX);
    
    return {
      width,
      height: height * CONFIG.CONTAINER_HEIGHT_MULTIPLIER,
      columns,
      columnWidth
    };
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
      : (item.aspectRatio || CONFIG.FALLBACK_ASPECT);
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

  // 预加载图片并获取真实尺寸
  static preloadImages(
    items: BaseMasonryItem[],
    onAspectMeasured: (id: number, aspect: number) => void
  ): void {
    items.forEach((item) => {
      const img = new Image();
      img.src = item.src;
      img.onload = () => {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          const ratio = img.naturalHeight / img.naturalWidth;
          onAspectMeasured(item.id, ratio);
        }
      };
      img.onerror = () => {
        Utils.debugLog(CONFIG.DEBUG, `图片加载失败: ${item.src}`);
      };
    });
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
      const rhythmScale = 1 + RHYTHM_PATTERN[rhythmIdx] * CONFIG.VARIATION_INTENSITY;
      const calculatedHeight = columnWidth * aspect * CONFIG.IMAGE_HEIGHT_SCALE * rhythmScale;

      // 添加项目到目标列
      arrays[targetColumnIndex].push({ ...item, calculatedHeight });
      columnHeights[targetColumnIndex] += calculatedHeight + CONFIG.V_GAP_PX;
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

// =============== 主组件 ===============
export default function HeroPageBackdrop({ scrollY }: HeroBackgroundProps) {
  // State
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(() => 
    LayoutCalculator.getLayoutConfig()
  );
  const [remoteItems, setRemoteItems] = useState<BaseMasonryItem[]>([]);
  const [aspectMap, setAspectMap] = useState<Record<number, number>>({});

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);

  // 安全的scrollY值
  const safeScrollY = Utils.safeNumber(scrollY, 0);

  // 视差滚动效果（直接DOM操作，避免频繁重渲染）
  useEffect(() => {
    if (scrollableContainerRef.current) {
      scrollableContainerRef.current.style.transform = 
        `translateY(${safeScrollY * CONFIG.PARALLAX_SPEED}px)`;
    }
  }, [safeScrollY]);

  // 宽高比测量回调
  const handleAspectMeasured = useCallback((id: number, aspect: number) => {
    setAspectMap((prev) => (prev[id] ? prev : { ...prev, [id]: aspect }));
  }, []);

  // 布局更新函数
  const updateLayout = useCallback(() => {
    const newConfig = LayoutCalculator.getLayoutConfig();
    setLayoutConfig(newConfig);
    Utils.debugLog(CONFIG.DEBUG, 'Layout updated', newConfig);
  }, []);

  // 防抖的布局更新
  const debouncedUpdateLayout = useMemo(
    () => Utils.debounce(updateLayout, CONFIG.DEBOUNCE_DELAY),
    [updateLayout]
  );

  // 初始化和窗口尺寸监听
  useEffect(() => {
    // 加载图片数据
    fetchHeroImages()
      .then(setRemoteItems)
      .catch((err) => {
        console.error('[HeroBackdrop] fetchHeroImages error:', err);
      });

    // 初始布局计算
    debouncedUpdateLayout();

    // 监听窗口尺寸变化
    window.addEventListener('resize', debouncedUpdateLayout);
    return () => window.removeEventListener('resize', debouncedUpdateLayout);
  }, [debouncedUpdateLayout]);

  // 预加载图片并测量真实宽高比
  useEffect(() => {
    if (remoteItems.length > 0) {
      ImageProcessor.preloadImages(remoteItems, handleAspectMeasured);
    }
  }, [remoteItems, handleAspectMeasured]);

  // 构建素材池
  const weightedPool = useMemo(() => 
    ImageProcessor.buildWeightedPool(remoteItems, aspectMap),
    [remoteItems, aspectMap]
  );

  const repeatedItems = useMemo(() => 
    ImageProcessor.buildRepeatedItems(weightedPool, CONFIG.REPEAT_TIMES, CONFIG.STABLE_SEED),
    [weightedPool]
  );

  // 计算列布局
  const columnArrays = useMemo(() => 
    MasonryLayouter.distributeItems(
      repeatedItems,
      layoutConfig.columns,
      layoutConfig.columnWidth,
      aspectMap
    ),
    [repeatedItems, layoutConfig.columns, layoutConfig.columnWidth, aspectMap]
  );

  // 图片项目组件
  const ImageItem = useCallback(({ 
    item, 
    columnIndex, 
    itemIndex 
  }: { 
    item: MasonryItem & { calculatedHeight: number };
    columnIndex: number;
    itemIndex: number;
  }) => (
    <div
      key={`${item.id}-${columnIndex}-${itemIndex}`}
      className="relative group overflow-hidden rounded-lg shadow-lg transform hover:scale-105 hover:shadow-2xl transition-transform duration-300"
      style={{ height: `${item.calculatedHeight}px` }}
    >
      <img
        src={item.src}
        alt={item.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="text-sm font-medium mb-1">{item.title}</h3>
        <p className="text-xs opacity-80">{item.year}</p>
      </div>
    </div>
  ), []);

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
    height: `${layoutConfig.height}px`
  }), [layoutConfig.height]);

  const scrollableStyle = useMemo(() => ({
    filter: `saturate(${CONFIG.BAND_SATURATE}) brightness(${CONFIG.BAND_BRIGHTNESS}) blur(${CONFIG.BAND_BLUR_PX}px)`
  }), []);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={containerStyle}
    >
      <div 
        ref={scrollableContainerRef}
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