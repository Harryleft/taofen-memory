import { useEffect, useMemo, useState, useRef } from 'react';
import { fetchHeroImages, type MasonryItem as BaseMasonryItem } from '@/services/heroImageService';

type MasonryItem = BaseMasonryItem & { calculatedHeight?: number };

// =============== Utilities ===============
// Debounce utility to limit the rate at which a function gets called.
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
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

// 生成稳定的伪随机数（0~1），用于保证每次渲染的“错落感”一致
function randomUnitFromKey(key: string): number {
  let hash = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 10000) / 10000;
}

// 布局与视觉常量
const H_GAP_PX = 10;             // 列与列之间的横向间距（像素）
const GAP_PX = 20;               // 卡片垂直间距（纵向）
const FALLBACK_ASPECT = 0.8;     // 当无法测量图片时的备用宽高比
const IMAGE_HEIGHT_SCALE = 0.7;  // 图片高度缩放（<1 缩小，>1 放大）
const REPEAT_TIMES = 6;          // 背景图重复次数，确保可填满容器
const VARIATION_INTENSITY = 0.6; // 0~1，错落强度（节奏幅度全局缩放）
const STABLE_SEED = 'hero-backdrop-v1';

// 渐进方案：四卡所在横带的前景遮罩与背后弱化参数
const BAND_BLUR_PX = 1;             // 轻模糊，保留纸纹理
const BAND_SATURATE = 0.75;         // 更明显的去饱和，避免花
const BAND_BRIGHTNESS = 0.88;       // 略降亮度，压住背景


// 列节奏模板：轻微高度节奏，依次循环（幅度后续乘以 VARIATION_INTENSITY）
const RHYTHM_PATTERN = [-0.06, 0.0, 0.05, -0.03, 0.02];

// 基于宽高比的简单分类，用于邻接去重与加权重复
type AspectCategory = 'portrait' | 'square' | 'landscape';
const CATEGORY_WEIGHTS: Record<AspectCategory, number> = {
  portrait: 1,   // 特写类，少量出现
  square: 3,     // 常规
  landscape: 4   // 填缝为主
};

function getAspectCategory(aspect: number): AspectCategory {
  if (aspect > 1.05) return 'portrait';
  if (aspect < 0.85) return 'landscape';
  return 'square';
}

function stableShuffle<T>(arr: T[], seed: string): T[] {
  return [...arr]
    .map((item, index) => ({ item, key: randomUnitFromKey(`${seed}-${index}`) }))
    .sort((a, b) => a.key - b.key)
    .map(({ item }) => item);
}

function debugLog(enabled: boolean, ...args: unknown[]) {
  if (enabled) {
    // eslint-disable-next-line no-console
    console.log('[HeroBackdrop]', ...args);
  }
}

function safeWindowSize(): { width: number; height: number } {
  const width = Number.isFinite(window.innerWidth) ? window.innerWidth : 1280;
  const height = Number.isFinite(window.innerHeight) ? window.innerHeight : 800;
  return { width, height };
}

function computeColumns(width: number): number {
  if (width < 640) return 2;
  if (width < 1024) return 3;
  if (width < 1440) return 4;
  return 5;
}

function computeColumnWidth(width: number, columns: number, gapX: number): number {
  const w = (width - (columns - 1) * gapX) / columns;
  return Number.isFinite(w) && w > 0 ? w : 0;
}

function getAspectForItem(item: BaseMasonryItem, aspectMap: Record<number, number>): number {
  const measured = aspectMap[item.id];
  return typeof measured === 'number' && measured > 0 ? measured : (item.aspectRatio || FALLBACK_ASPECT);
}

function buildWeightedPool(items: BaseMasonryItem[], aspectMap: Record<number, number>): BaseMasonryItem[] {
  return items.flatMap((it) => {
    const aspect = getAspectForItem(it, aspectMap);
    const cat = getAspectCategory(aspect);
    const weight = CATEGORY_WEIGHTS[cat] || 2;
    return Array.from({ length: weight }, () => it);
  });
}

function buildRepeatedItems(items: BaseMasonryItem[], repeat: number, seed: string): BaseMasonryItem[] {
  const base = Array.from({ length: repeat }, () => items).flat();
  return stableShuffle(base, seed);
}

interface HeroBackgroundProps {
  scrollY: number;
}

export default function HeroPageBackdrop({ scrollY }: HeroBackgroundProps) {
  const DEBUG_HERO = false; // 调试开关
  const [columns, setColumns] = useState(4);
  const [containerHeight, setContainerHeight] = useState(0);
  const [columnWidth, setColumnWidth] = useState(0);
  const [remoteItems, setRemoteItems] = useState<BaseMasonryItem[]>([]);
  const [aspectMap, setAspectMap] = useState<Record<number, number>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollableContainerRef = useRef<HTMLDivElement>(null); // 新增：用于直接DOM操作的ref
  
  // 确保 scrollY 为有效数值，防止 NaN 或 undefined
  const safeScrollY = typeof scrollY === 'number' && !isNaN(scrollY) ? scrollY : 0;
  
  // 新增：解耦合的效果
  // 这个effect只负责监听scrollY的变化，并直接更新DOM，绕过React渲染
  useEffect(() => {
    if (scrollableContainerRef.current) {
      scrollableContainerRef.current.style.transform = `translateY(${safeScrollY * 0.3}px)`;
    }
  }, [safeScrollY]);

  useEffect(() => {
    // 加载图片数据
    fetchHeroImages()
      .then(setRemoteItems)
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[HeroBackdrop] fetchHeroImages error:', err);
      });

    const updateLayout = () => {
      const { width, height } = safeWindowSize();
      const newColumns = computeColumns(width);
      setColumns(newColumns);
      setContainerHeight(height * 2); // 增加容器高度，提供更长的滚动行程
      const computed = computeColumnWidth(width, newColumns, H_GAP_PX);
      setColumnWidth(computed);
      debugLog(DEBUG_HERO, 'layout', { width, height, newColumns, columnWidth: computed });
    };

    const debouncedUpdateLayout = debounce(updateLayout, 250);

    debouncedUpdateLayout();
    window.addEventListener('resize', debouncedUpdateLayout);
    return () => window.removeEventListener('resize', debouncedUpdateLayout);
  }, []);

  // 预加载图片并测量真实宽高比，恢复“最初样式”的自然高低差
  useEffect(() => {
    if (!remoteItems.length) return;
    remoteItems.forEach((item) => {
      const img = new Image();
      img.src = item.src;
      img.onload = () => {
        const ratio = img.naturalHeight / img.naturalWidth;
        setAspectMap((prev) => (prev[item.id] ? prev : { ...prev, [item.id]: ratio }));
      };
    });
  }, [remoteItems]);

  // 预构建素材池与布局（职责拆分，配合 memo 降噪）
  const weightedPool = useMemo(() => buildWeightedPool(remoteItems, aspectMap), [remoteItems, aspectMap]);
  const repeatedItems = useMemo(() => buildRepeatedItems(weightedPool, REPEAT_TIMES, STABLE_SEED), [weightedPool]);

  const columnArrays = useMemo(() => {
    const arrays: MasonryItem[][] = Array.from({ length: columns }, () => []);
    const columnHeights = new Array(columns).fill(0);
    if (columns <= 0 || columnWidth <= 0 || containerHeight <= 0) {
      debugLog(DEBUG_HERO, 'early-exit distributeItems', { columns, columnWidth, containerHeight });
      return arrays;
    }

    const lastCategoryPerColumn: (AspectCategory | null)[] = new Array(columns).fill(null);
    const itemCountPerColumn: number[] = new Array(columns).fill(0);

    repeatedItems.forEach((item) => {
      const aspect = getAspectForItem(item, aspectMap);
      const cat = getAspectCategory(aspect);

      const candidates = columnHeights
        .map((h, idx) => ({ idx, h }))
        .sort((a, b) => a.h - b.h);

      let targetColumnIndex = candidates.find(c => lastCategoryPerColumn[c.idx] !== cat)?.idx;
      if (typeof targetColumnIndex !== 'number') {
        targetColumnIndex = candidates[0].idx;
      }

      const rhythmIdx = itemCountPerColumn[targetColumnIndex] % RHYTHM_PATTERN.length;
      const rhythmScale = 1 + RHYTHM_PATTERN[rhythmIdx] * VARIATION_INTENSITY;
      const calculatedHeight = columnWidth * aspect * IMAGE_HEIGHT_SCALE * rhythmScale;

      arrays[targetColumnIndex].push({ ...item, calculatedHeight });
      columnHeights[targetColumnIndex] += calculatedHeight + GAP_PX;
      lastCategoryPerColumn[targetColumnIndex] = cat;
      itemCountPerColumn[targetColumnIndex] += 1;
    });

    debugLog(DEBUG_HERO, 'layout-complete', { columns, columnWidth, total: repeatedItems.length });
    return arrays;
  }, [repeatedItems, columns, columnWidth, containerHeight, aspectMap]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ height: `${containerHeight}px` }}
    >
      <div 
        ref={scrollableContainerRef} // 挂载ref
        className="flex gap-4 h-full"
        style={{
          // transform: `translateY(${safeScrollY * 0.3}px)`, // 移除：样式将由useEffect直接控制
          // 四卡带背后的背景弱化（轻模糊+降饱和+降亮度）
          filter: `saturate(${BAND_SATURATE}) brightness(${BAND_BRIGHTNESS}) blur(${BAND_BLUR_PX}px)`,
        }}
      >
        {columnArrays.map((column, columnIndex) => (
          <div
            key={columnIndex}
            className="flex-1 space-y-4"
          >
            {column.map((item, itemIndex) => {
              const itemWithHeight = item as MasonryItem & { calculatedHeight: number };
              return (
                <div
                  key={`${item.id}-${columnIndex}-${itemIndex}`}
                  className="relative group overflow-hidden rounded-lg shadow-lg transform hover:scale-105 hover:shadow-2xl transition-transform duration-300"
                  style={{
                    height: `${itemWithHeight.calculatedHeight}px`,
                  }}
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
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}