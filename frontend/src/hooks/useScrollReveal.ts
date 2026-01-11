/**
 * @file useScrollReveal.ts
 * @description 滚动发现体验 Hook，监听元素进入视窗并触发动画
 * @module useScrollReveal
 */

import { useEffect, useRef, useState, useCallback } from 'react';

interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
  performanceMode?: boolean;
}

interface ScrollRevealResult {
  elementRef: (el: HTMLElement | null) => void;
  isRevealed: boolean;
}

/**
 * 滚动发现体验 Hook
 * @param {ScrollRevealOptions} options - 配置选项
 * @returns {ScrollRevealResult} 返回元素引用和是否已显示的状态
 */
export const useScrollReveal = (options: ScrollRevealOptions = {}): ScrollRevealResult => {
  const {
    threshold = 0.2,
    rootMargin = '0px',
    triggerOnce = true,
    delay = 0,
    performanceMode = false
  } = options;

  const [isRevealed, setIsRevealed] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 性能优化：使用 requestAnimationFrame
  const handleReveal = useCallback(() => {
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsRevealed(true);
      }, delay);
    } else {
      requestAnimationFrame(() => {
        setIsRevealed(true);
      });
    }
  }, [delay]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // 性能模式：使用更宽松的阈值
    const actualThreshold = performanceMode ? Math.min(threshold * 0.7, 0.1) : threshold;
    const actualRootMargin = performanceMode ? '50px' : rootMargin;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            handleReveal();
            if (triggerOnce) {
              observer.unobserve(element);
            }
          } else if (!triggerOnce) {
            setIsRevealed(false);
          }
        });
      },
      {
        threshold: actualThreshold,
        rootMargin: actualRootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [threshold, rootMargin, triggerOnce, handleReveal, performanceMode]);

  return {
    elementRef,
    isRevealed,
  };
};

/**
 * 批量滚动发现体验 Hook
 * @param {ScrollRevealOptions} options - 配置选项
 * @returns {(el: HTMLElement | null) => void} 设置元素引用的函数
 */
export const useBatchScrollReveal = (options: ScrollRevealOptions = {}) => {
  const {
    threshold = 0.2,
    rootMargin = '0px',
    triggerOnce = true,
  } = options;

  const elementsRef = useRef<(HTMLElement | null)[]>([]);
  const [revealedElements, setRevealedElements] = useState<Set<number>>(new Set());

  useEffect(() => {
    const elements = elementsRef.current.filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;
          const index = elements.indexOf(element);
          
          if (entry.isIntersecting && index !== -1) {
            setRevealedElements(prev => {
              const newSet = new Set(prev);
              newSet.add(index);
              return newSet;
            });
            
            if (triggerOnce) {
              observer.unobserve(element);
            }
          } else if (!triggerOnce && index !== -1) {
            setRevealedElements(prev => {
              const newSet = new Set(prev);
              newSet.delete(index);
              return newSet;
            });
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    elements.forEach(element => observer.observe(element));

    return () => {
      elements.forEach(element => observer.unobserve(element));
    };
  }, [threshold, rootMargin, triggerOnce]);

  const setElementRef = (index: number) => (el: HTMLElement | null) => {
    elementsRef.current[index] = el;
  };

  const isRevealed = (index: number) => revealedElements.has(index);

  return {
    setElementRef,
    isRevealed,
  };
};

export default useScrollReveal;