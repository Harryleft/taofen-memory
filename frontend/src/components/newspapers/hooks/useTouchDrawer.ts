import { useCallback, useRef, useState } from 'react';

/**
 * 触摸手势配置
 */
const TOUCH_GESTURE = {
  MIN_DRAG_DISTANCE: 50,   // 最小拖动距离
  CLOSE_THRESHOLD: 100,    // 关闭抽屉阈值
  TRANSFORM_THRESHOLD: 200, // 变换阈值
} as const;

/**
 * Hook 选项接口
 */
interface UseTouchDrawerOptions {
  isMobile: boolean;
  drawerOpen: boolean;
  onDrawerOpen: (open: boolean) => void;
  drawerRef?: React.RefObject<HTMLDivElement>;
}

/**
 * Hook 返回值接口
 */
interface UseTouchDrawerReturn {
  touchStartY: number;
  touchCurrentY: number;
  isDragging: boolean;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
}

/**
 * 移动端触摸手势抽屉 Hook
 * 
 * 功能：
 * - 处理触摸开始、移动、结束事件
 * - 管理拖拽状态和位置
 * - 控制抽屉的打开/关闭动画
 * - 提供流畅的触摸交互体验
 * 
 * @param options Hook 配置选项
 * @returns 触摸状态和事件处理函数
 */
export const useTouchDrawer = (options: UseTouchDrawerOptions): UseTouchDrawerReturn => {
  const { isMobile, drawerOpen, onDrawerOpen, drawerRef } = options;
  
  // 触摸状态
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchCurrentY, setTouchCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  /**
   * 触摸开始处理
   */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isMobile) return;
    
    setTouchStartY(e.touches[0].clientY);
    setTouchCurrentY(e.touches[0].clientY);
    setIsDragging(true);
  }, [isMobile]);

  /**
   * 触摸移动处理
   */
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isMobile || !isDragging) return;
    
    const currentY = e.touches[0].clientY;
    setTouchCurrentY(currentY);
    
    const deltaY = currentY - touchStartY;
    const drawer = drawerRef?.current;
    
    if (drawer) {
      if (drawerOpen && deltaY > 0) {
        // 向下滑动关闭抽屉 - 应用变换效果
        const progress = Math.min(deltaY / TOUCH_GESTURE.TRANSFORM_THRESHOLD, 1);
        drawer.style.transform = `translateY(${progress * 100}%)`;
      } else if (!drawerOpen && deltaY < -TOUCH_GESTURE.MIN_DRAG_DISTANCE) {
        // 向上滑动打开抽屉
        onDrawerOpen(true);
      }
    }
  }, [isMobile, isDragging, touchStartY, drawerOpen, onDrawerOpen, drawerRef]);

  /**
   * 触摸结束处理
   */
  const handleTouchEnd = useCallback(() => {
    if (!isMobile || !isDragging) return;
    
    const deltaY = touchCurrentY - touchStartY;
    const drawer = drawerRef?.current;
    
    if (drawer) {
      if (drawerOpen && deltaY > TOUCH_GESTURE.CLOSE_THRESHOLD) {
        // 滑动距离足够，关闭抽屉
        onDrawerOpen(false);
      }
      
      // 重置抽屉位置
      drawer.style.transform = '';
    }
    
    // 重置触摸状态
    setIsDragging(false);
    setTouchStartY(0);
    setTouchCurrentY(0);
  }, [isMobile, isDragging, touchStartY, touchCurrentY, drawerOpen, onDrawerOpen, drawerRef]);

  return {
    touchStartY,
    touchCurrentY,
    isDragging,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};