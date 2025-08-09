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

export async function fetchHeroImages(): Promise<MasonryItem[]> {
  const response = await fetch(HERO_IMAGES_JSON_PATH);
  if (!response.ok) {
    throw new Error(`加载英雄区图片数据失败: ${response.status}`);
  }
  const data: HeroImageItem[] = await response.json();

  // 默认的宽高比作为保底，避免魔法数字散落各处
  const DEFAULT_ASPECT_RATIO = 0.8;

  return data.map((item) => ({
    id: item.id,
    src: `${HERO_IMAGES_BASE}${item.filename}`,
    title: item.title,
    year: item.year,
    aspectRatio: DEFAULT_ASPECT_RATIO,
  }));
}


