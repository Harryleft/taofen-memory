import { useEffect } from 'react';
import { ImagePreloader } from '@/utils/imagePreloader';
import type { TransformedHandwritingItem } from './useHandwritingData';

export const useHandwritingPreloader = (
  items: TransformedHandwritingItem[],
  currentPage: number,
  itemsPerPage: number
) => {
  useEffect(() => {
    if (items.length === 0) return;
    
    const startIndex = 0;
    const endIndex = currentPage * itemsPerPage;
    const currentItems = items.slice(startIndex, endIndex);
    
    // 预加载当前页面的图片
    const currentImages = currentItems.map(item => item.image);
    
    // 预加载下一页的图片（预取）
    const nextStartIndex = endIndex;
    const nextEndIndex = endIndex + itemsPerPage;
    const nextItems = items.slice(nextStartIndex, nextEndIndex);
    const nextImages = nextItems.map(item => item.image);
    
    // 执行智能预加载
    ImagePreloader.smartPreload(currentImages, nextImages, {
      priority: true,
      timeout: 3000,
      retryCount: 1
    });
  }, [items, currentPage, itemsPerPage]);
};

export default useHandwritingPreloader;