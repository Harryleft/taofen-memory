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
  aspectRatio?: number;
}

const HERO_IMAGES_JSON_PATH = '/data/json/hero_images.json';
const HERO_IMAGES_BASE = '/images/hero_page/';

// 模块级内存缓存
let cachedHeroImages: MasonryItem[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

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

  // 默认的宽高比作为保底，避免魔法数字散落各处
  const DEFAULT_ASPECT_RATIO = 0.8;

  const processedData = data.map((item) => ({
    id: item.id,
    src: `${HERO_IMAGES_BASE}${item.filename}`,
    title: item.title,
    year: item.year,
    aspectRatio: DEFAULT_ASPECT_RATIO,
  }));

  // 更新缓存
  cachedHeroImages = processedData;
  cacheTimestamp = now;

  return processedData;
}


