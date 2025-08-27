export interface HeroImageItem {
  id: number;
  filename: string;
  title: string;
  year: string;
}

export interface MasonryItem {
  id: number;
  src: string;
  title: string;
  year: string;
  // 服务器提供的预估宽高比
  estimatedAspectRatio: number;
  // 实际测量的宽高比（可选）
  measuredAspectRatio?: number;
  // 图片加载状态
  loadState: 'pending' | 'loading' | 'loaded' | 'error';
  // 图片分类（用于更精确的宽高比预估）
  category?: 'portrait' | 'landscape' | 'square' | 'panorama';
}

const HERO_IMAGES_JSON_PATH = '/data/json/hero_images.json';
const HERO_IMAGES_BASE = '/images/hero_page/';

// 模块级内存缓存
let cachedHeroImages: MasonryItem[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

// 根据文件名模式预估图片分类和宽高比
function estimateImageAspect(filename: string): { aspectRatio: number; category: 'portrait' | 'landscape' | 'square' | 'panorama' } {
  const name = filename.toLowerCase();
  
  // 根据文件名模式判断
  if (name.includes('portrait') || name.includes('vertical') || name.includes('person')) {
    return { aspectRatio: 1.5, category: 'portrait' };
  } else if (name.includes('panorama') || name.includes('wide') || name.includes('landscape')) {
    return { aspectRatio: 0.6, category: 'panorama' };
  } else if (name.includes('square')) {
    return { aspectRatio: 1.0, category: 'square' };
  }
  
  // 默认横屏
  return { aspectRatio: 0.8, category: 'landscape' };
}

export async function fetchHeroImages(): Promise<MasonryItem[]> {
  // 检查缓存是否有效
  const now = Date.now();
  if (cachedHeroImages && (now - cacheTimestamp < CACHE_DURATION)) {
    return cachedHeroImages;
  }

  const response = await fetch(HERO_IMAGES_JSON_PATH);
  
  if (!response.ok) {
    throw new Error(`加载英雄区图片数据失败: ${response.status}`);
  }
  
  const data: HeroImageItem[] = await response.json();
  
  
  const processedData = data.map((item) => {
    const { aspectRatio, category } = estimateImageAspect(item.filename);
    
    return {
      id: item.id,
      src: `${HERO_IMAGES_BASE}${item.filename}`,
      title: item.title,
      year: item.year,
      estimatedAspectRatio: aspectRatio,
      loadState: 'pending' as const,
      category,
    };
  });

  // 更新缓存
  cachedHeroImages = processedData;
  cacheTimestamp = now;

  return processedData;
}


