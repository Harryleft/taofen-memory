import { useEffect, useState, useRef } from 'react';
import { fetchHeroImages, type MasonryItem as BaseMasonryItem } from '@/services/heroImageService';

type MasonryItem = BaseMasonryItem & {
  calculatedHeight?: number;
};

// 生成稳定的伪随机数（0~1），用于保证每次渲染的“错落感”一致
function randomUnitFromKey(key: string): number {
  let hash = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  // 归一化到 [0,1)
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

interface HeroBackgroundProps {
  scrollY: number;
}

export default function HeroPageBackdrop({ scrollY }: HeroBackgroundProps) {
  const DEBUG_HERO = false; // 如需排查，改为 true
  const [columns, setColumns] = useState(4);
  const [containerHeight, setContainerHeight] = useState(0);
  const [columnWidth, setColumnWidth] = useState(0);
  const [remoteItems, setRemoteItems] = useState<BaseMasonryItem[]>([]);
  const [aspectMap, setAspectMap] = useState<Record<number, number>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 确保 scrollY 为有效数值，防止 NaN 或 undefined
  const safeScrollY = typeof scrollY === 'number' && !isNaN(scrollY) ? scrollY : 0;
  
  useEffect(() => {
    // 加载图片数据
    fetchHeroImages()
      .then(setRemoteItems)
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[HeroBackdrop] fetchHeroImages error:', err);
      });

    const updateLayout = () => {
      const width = Number.isFinite(window.innerWidth) ? window.innerWidth : 1280;
      const height = Number.isFinite(window.innerHeight) ? window.innerHeight : 800;
      
      // 设置列数
      let newColumns;
      if (width < 640) newColumns = 2;
      else if (width < 1024) newColumns = 3;
      else if (width < 1440) newColumns = 4;
      else newColumns = 5;
      
      setColumns(newColumns);
      setContainerHeight(height * 1.5); // 确保背景高度足够覆盖首屏
      // 使用可配置的横向间距计算列宽
      const computed = (width - (newColumns - 1) * H_GAP_PX) / newColumns;
      setColumnWidth(Number.isFinite(computed) && computed > 0 ? computed : 0);
      if (DEBUG_HERO) {
        // eslint-disable-next-line no-console
        console.log('[HeroBackdrop] layout', { width, height, newColumns, columnWidth: computed });
      }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
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

  const distributeItems = () => {
    const columnArrays: MasonryItem[][] = Array.from({ length: columns }, () => []);
    const columnHeights = new Array(columns).fill(0);
    if (columns <= 0 || columnWidth <= 0 || containerHeight <= 0) {
      if (DEBUG_HERO) {
        // eslint-disable-next-line no-console
        console.warn('[HeroBackdrop] early-exit distributeItems', { columns, columnWidth, containerHeight });
      }
      return columnArrays;
    }

    // 分层权重重复 + 稳定洗牌：避免同质连片与死板重复
    const weightedPool = remoteItems.flatMap((it) => {
      const measuredAspect = aspectMap[it.id];
      const aspect = typeof measuredAspect === 'number' && measuredAspect > 0 ? measuredAspect : (it.aspectRatio || FALLBACK_ASPECT);
      const cat = getAspectCategory(aspect);
      const weight = CATEGORY_WEIGHTS[cat] || 2;
      return Array.from({ length: weight }, () => it);
    });
    const baseRepeated = Array.from({ length: REPEAT_TIMES }, () => weightedPool).flat();
    const repeatedItems = stableShuffle(baseRepeated, STABLE_SEED);
    if (DEBUG_HERO) {
      // eslint-disable-next-line no-console
      console.log('[HeroBackdrop] pool', { baseLen: baseRepeated.length, repeatedLen: repeatedItems.length, columns });
    }

    const lastCategoryPerColumn: (AspectCategory | null)[] = new Array(columns).fill(null);
    const itemCountPerColumn: number[] = new Array(columns).fill(0);

    try {
      repeatedItems.forEach((item) => {
      const measuredAspect = aspectMap[item.id];
      const aspect = typeof measuredAspect === 'number' && measuredAspect > 0 ? measuredAspect : (item.aspectRatio || FALLBACK_ASPECT);
      const cat = getAspectCategory(aspect);

      // 候选列：按当前高度升序，优先选择与上一张不同类别的列
      const candidates = columnHeights
        .map((h, idx) => ({ idx, h }))
        .sort((a, b) => a.h - b.h);

      let targetColumnIndex = candidates.find(c => lastCategoryPerColumn[c.idx] !== cat)?.idx;
      if (typeof targetColumnIndex !== 'number') {
        targetColumnIndex = candidates[0].idx;
      }

      // 列节奏：对高度做轻微缩放，制造有机节奏
      const rhythmIdx = itemCountPerColumn[targetColumnIndex] % RHYTHM_PATTERN.length;
      const rhythmScale = 1 + RHYTHM_PATTERN[rhythmIdx] * VARIATION_INTENSITY;
      const calculatedHeight = columnWidth * aspect * IMAGE_HEIGHT_SCALE * rhythmScale;

      columnArrays[targetColumnIndex].push({
        ...item,
        calculatedHeight,
      });
      columnHeights[targetColumnIndex] += calculatedHeight + GAP_PX;
      lastCategoryPerColumn[targetColumnIndex] = cat;
      itemCountPerColumn[targetColumnIndex] += 1;

        // 如果最短列的高度已经超过容器高度，停止添加
        if (Math.min(...columnHeights) > containerHeight) {
          return;
        }
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[HeroBackdrop] distributeItems error:', e);
    }

    return columnArrays;
  };

  const columnArrays = distributeItems();

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ height: `${containerHeight}px` }}
    >
      <div 
        className="flex gap-4 h-full"
        style={{
          transform: `translateY(${safeScrollY * 0.5}px)`,
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
                  className="relative group overflow-hidden rounded-lg shadow-lg transform hover:scale-105 hover:shadow-2xl transition-transform duration-300 will-change-transform"
                  style={{
                    height: `${itemWithHeight.calculatedHeight}px`,
                    transform: `translateY(${Math.sin((safeScrollY + itemIndex * 100) * 0.001) * 10}px)`,
                    animationDelay: `${itemIndex * 0.1}s`,
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