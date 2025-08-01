import { useState, useCallback } from 'react';
import { BookItem } from '../types/bookTypes';

interface UseLightboxReturn {
  selectedItem: BookItem | null;
  currentIndex: number;
  openLightbox: (item: BookItem, displayedData: BookItem[]) => void;
  closeLightbox: () => void;
  nextItem: (displayedData: BookItem[]) => void;
  prevItem: (displayedData: BookItem[]) => void;
}

export const useLightbox = (): UseLightboxReturn => {
  const [selectedItem, setSelectedItem] = useState<BookItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = useCallback((item: BookItem, displayedData: BookItem[]) => {
    setSelectedItem(item);
    setCurrentIndex(displayedData.findIndex(i => i.id === item.id));
  }, []);

  const closeLightbox = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const nextItem = useCallback((displayedData: BookItem[]) => {
    if (!selectedItem || displayedData.length === 0) return;
    const newIndex = (currentIndex + 1) % displayedData.length;
    setCurrentIndex(newIndex);
    setSelectedItem(displayedData[newIndex]);
  }, [currentIndex, selectedItem]);

  const prevItem = useCallback((displayedData: BookItem[]) => {
    if (!selectedItem || displayedData.length === 0) return;
    const newIndex = currentIndex === 0 ? displayedData.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setSelectedItem(displayedData[newIndex]);
  }, [currentIndex, selectedItem]);

  return {
    selectedItem,
    currentIndex,
    openLightbox,
    closeLightbox,
    nextItem,
    prevItem
  };
};