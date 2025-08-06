import { Heart, Globe, Book, GraduationCap, LandPlot } from 'lucide-react';

// 关系类型配置
export const RELATIONSHIPS_CONFIG = {
  ui: {
    iconSizes: {
      CATEGORY_BUTTON: 18
    }
  }
};

// 关系分类
export const RELATIONSHIPS_CATEGORIES = [
  {
    id: 'all',
    name: '全部',
    nameInData: 'all',
    icon: Globe,
    color: 'gray'
  },
  {
    id: 'family',
    name: '亲人家属',
    nameInData: '亲人家属',
    icon: Heart,
    color: 'red'
  },
  {
    id: 'media',
    name: '新闻出版',
    nameInData: '新闻出版',
    icon: Book,
    color: 'blue'
  },
  {
    id: 'academic',
    name: '学术文化',
    nameInData: '学术文化',
    icon: GraduationCap,
    color: 'purple'
  },
  {
    id: 'political',
    name: '政治社会',
    nameInData: '政治社会',
    icon: LandPlot,
    color: 'green'
  }
];

// 获取分类颜色类名（用于CSS类）
export const getCategoryColorClass = (color: string): string => {
  return `category-color-${color}`;
};

// 获取分类背景色类名（用于CSS类）
export const getCategoryBgClass = (color: string): string => {
  return `category-bg-${color}`;
};

// 获取分类颜色的 Tailwind 类名（推荐使用）
export const getCategoryTailwindClass = (color: string): string => {
  return `text-category-${color}`;
};

// 获取分类背景色的 Tailwind 类名（推荐使用）
export const getCategoryBgTailwindClass = (color: string): string => {
  return `bg-category-${color}`;
};

// 根据分类名称获取对应的颜色
export const getCategoryColorByName = (categoryName: string): string => {
  const category = RELATIONSHIPS_CATEGORIES.find(cat => cat.nameInData === categoryName);
  return category ? category.color : 'gray';
};

// 根据分类名称获取 Tailwind 文本颜色类名
export const getCategoryTailwindClassByName = (categoryName: string): string => {
  const color = getCategoryColorByName(categoryName);
  return getCategoryTailwindClass(color);
};

// 根据分类名称获取 Tailwind 背景颜色类名
export const getCategoryBgTailwindClassByName = (categoryName: string): string => {
  const color = getCategoryColorByName(categoryName);
  return getCategoryBgTailwindClass(color);
};

// 分类名映射函数（保持向后兼容）
export const getCategoryClass = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    '亲人家属': 'family',
    '新闻出版': 'media', 
    '学术文化': 'academic',
    '政治社会': 'political',
    '全部': 'all'
  };
  return categoryMap[category] || 'all';
};
