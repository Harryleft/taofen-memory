import { useState, useCallback, useEffect } from 'react';
import type { TransformedHandwritingItem } from './useHandwritingData';

interface LightboxState {
  selectedItem: TransformedHandwritingItem | null;
  currentIndex: number;
}

interface UseHandwritingLightboxReturn {
  lightbox: LightboxState;
  openLightbox: (item: TransformedHandwritingItem) => void;
  closeLightbox: () => void;
  nextItem: () => void;
  prevItem: () => void;
}

export const useHandwritingLightbox = (
  items: TransformedHandwritingItem[]
): UseHandwritingLightboxReturn => {
  const [lightbox, setLightbox] = useState<LightboxState>({
    selectedItem: null,
    currentIndex: 0
  });
  
  // 打开Lightbox
  const openLightbox = useCallback((item: TransformedHandwritingItem) => {
    setLightbox({
      selectedItem: item,
      currentIndex: items.findIndex(i => i.id === item.id)
    });
  }, [items]);
  
  // 关闭Lightbox
  const closeLightbox = useCallback(() => {
    setLightbox(prev => ({ ...prev, selectedItem: null }));
  }, []);
  
  // 下一个项目
  const nextItem = useCallback(() => {
    if (items.length === 0) return;
    
    const newIndex = (lightbox.currentIndex + 1) % items.length;
    setLightbox(prev => ({
      ...prev,
      currentIndex: newIndex,
      selectedItem: items[newIndex]
    }));
  }, [items, lightbox.currentIndex]);
  
  // 上一个项目
  const prevItem = useCallback(() => {
    if (items.length === 0) return;
    
    const newIndex = lightbox.currentIndex === 0 ? items.length - 1 : lightbox.currentIndex - 1;
    setLightbox(prev => ({
      ...prev,
      currentIndex: newIndex,
      selectedItem: items[newIndex]
    }));
  }, [items, lightbox.currentIndex]);
  
  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightbox.selectedItem) {
        switch (e.key) {
          case 'Escape':
            closeLightbox();
            break;
          case 'ArrowRight':
            nextItem();
            break;
          case 'ArrowLeft':
            prevItem();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox.selectedItem, closeLightbox, nextItem, prevItem]);
  
  return {
    lightbox,
    openLightbox,
    closeLightbox,
    nextItem,
    prevItem
  };
};

export default useHandwritingLightbox;