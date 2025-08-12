import { useState, useCallback, useEffect } from 'react';

// 真实数据接口定义
export interface HandwritingItem {
  id: string;
  名称: string;
  原文: string;
  时间: string;
  注释: string;
  数据来源: string;
  标签: string;
  图片位置: Array<{
    remote_url: string;
    local_path: string;
  }>;
}

// 转换后的数据接口
export interface TransformedHandwritingItem {
  id: string;
  title: string;
  year: number;
  date: string;
  category: string;
  description: string;
  image: string;
  highResImage: string;
  tags: string[];
  dimensions: {
    width: number;
    height: number;
  };
  originalData: HandwritingItem;
}

// 数据获取函数
const fetchHandwritingData = async (): Promise<HandwritingItem[]> => {
  try {
    const response = await fetch('/data/json/taofen_handwriting_details.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching handwriting data:', error);
    throw error;
  }
};

// 工具函数：提取年份从时间字符串
const extractYearFromDateString = (dateString: string): number => {
  const yearMatch = dateString.match(/(\d{4})年/);
  return yearMatch ? parseInt(yearMatch[1]) : 1937;
};

// 工具函数：从标签获取主分类
const getMainCategory = (item: HandwritingItem): string => {
  // 使用JSON中的标签作为分类，如果没有标签则使用默认分类
  if (item.标签) {
    return item.标签.trim();
  }
  return '其他';
};

// 工具函数：生成标签
const generateTags = (item: HandwritingItem, year: number): string[] => {
  const tags: string[] = [];
  // 使用真实的【标签】字段，支持多个标签（用逗号分隔）
  if (item.标签) {
    const tagArray = item.标签.split(',').map(tag => tag.trim()).filter(Boolean);
    tags.push(...tagArray);
  }
  // 保留年份标签
  if (year) tags.push(`${year}年`);
  
    
  return tags;
};

// 工具函数：获取图片路径
const getImagePath = (item: HandwritingItem): string => {
  if (item.图片位置 && item.图片位置.length > 0) {
    return item.图片位置[0].local_path.replace('public/', '/');
  }
  return '/images/placeholder.png';
};

// 工具函数：数据转换
const transformHandwritingData = (data: HandwritingItem[]): TransformedHandwritingItem[] => {
  return data.map(item => {
    const year = extractYearFromDateString(item.时间);
    const category = getMainCategory(item);
    const tags = generateTags(item, year);
    const imagePath = getImagePath(item);
    
    return {
      id: item.id,
      title: item.名称,
      year,
      date: item.时间,
      category,
      description: item.注释 || item.原文.substring(0, 100) + '...',
      image: imagePath,
      highResImage: imagePath,
      tags,
      dimensions: {
        width: 320,
        height: Math.floor(Math.random() * 200) + 300
      },
      originalData: item
    };
  });
};

// 数据获取Hook
export const useHandwritingData = () => {
  const [handwritingItems, setHandwritingItems] = useState<TransformedHandwritingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 数据加载函数
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const rawData = await fetchHandwritingData();
      const transformedData = transformHandwritingData(rawData);
      setHandwritingItems(transformedData);
    } catch (err) {
      setError('加载手迹数据失败，请刷新页面重试');
      console.error('Failed to load handwriting data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 重新加载数据
  const refetch = useCallback(() => {
    loadData();
  }, [loadData]);

  // 组件挂载时自动加载数据
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    handwritingItems,
    loading,
    error,
    refetch
  };
};

export default useHandwritingData;