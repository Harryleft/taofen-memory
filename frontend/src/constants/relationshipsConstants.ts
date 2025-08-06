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
    icon: Globe,
    color: 'gray'
  },
  {
    id: 'family',
    name: '亲人家属',
    icon: Heart,
    color: 'red'
  },
  {
    id: 'media',
    name: '新闻出版',
    icon: Book,
    color: 'blue'
  },
  {
    id: 'academic',
    name: '学术文化',
    icon: GraduationCap,
    color: 'purple'
  },
  {
    id: 'political',
    name: '政治社会',
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

// 获取分类颜色（为了向后兼容，但推荐使用CSS类）
export const getCategoryColor = (color: string): string => {
  // 这是一个CSS变量查询，实际值已经移到CSS文件中定义
  return `var(--category-color-${color})`;
};
