/**
 * 手写体图片缓存React Hooks
 * 提供图片缓存、布局缓存和预加载队列管理功能
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { imageCacheService, type ImageDimensions, type LayoutCache, type PreloadQueue, type ImageCacheStats } from '@/services/cache/image-cache-service';

/**
 * 图片尺寸缓存Hook
 */
export const useImageDimensions = (imageUrls: string[]) => {
  const [dimensions, setDimensions] = useState<Record<string, ImageDimensions>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDimensions = useCallback(async (urls: string[]) => {
    if (urls.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const cachedDimensions = await imageCacheService.batchGetImageDimensions(urls);
      setDimensions(cachedDimensions);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取图片尺寸失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const cacheDimensions = useCallback(async (
    imageId: string,
    dims: ImageDimensions,
    ttl?: number
  ) => {
    try {
      await imageCacheService.cacheImageDimensions(imageId, dims, ttl);
      setDimensions(prev => ({ ...prev, [imageId]: dims }));
    } catch (err) {
      console.error('Failed to cache image dimensions:', err);
    }
  }, []);

  useEffect(() => {
    loadDimensions(imageUrls);
  }, [imageUrls, loadDimensions]);

  return {
    dimensions,
    loading,
    error,
    cacheDimensions,
    refetch: () => loadDimensions(imageUrls)
  };
};

/**
 * 瀑布流布局缓存Hook
 */
export const useLayoutCache = (
  items: string[],
  columns: number,
  viewport: { width: number; height: number }
) => {
  const [layout, setLayout] = useState<LayoutCache | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const layoutKey = imageCacheService.generateLayoutKey(items, columns, viewport);

  const loadLayout = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const cachedLayout = await imageCacheService.getLayout(layoutKey);
      setLayout(cachedLayout);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取布局缓存失败');
    } finally {
      setLoading(false);
    }
  }, [layoutKey]);

  const cacheLayout = useCallback(async (
    layoutData: { column: number; position: number }[],
    ttl?: number
  ) => {
    const newLayout: LayoutCache = {
      items,
      columns,
      viewport,
      layout: layoutData,
      calculatedAt: new Date()
    };

    try {
      await imageCacheService.cacheLayout(layoutKey, newLayout, ttl);
      setLayout(newLayout);
    } catch (err) {
      console.error('Failed to cache layout:', err);
    }
  }, [items, columns, viewport, layoutKey]);

  const clearLayout = useCallback(async () => {
    try {
      await imageCacheService.clearLayoutCache(layoutKey);
      setLayout(null);
    } catch (err) {
      console.error('Failed to clear layout cache:', err);
    }
  }, [layoutKey]);

  useEffect(() => {
    loadLayout();
  }, [loadLayout]);

  return {
    layout,
    loading,
    error,
    cacheLayout,
    clearLayout,
    refetch: loadLayout
  };
};

/**
 * 预加载队列管理Hook
 */
export const usePreloadQueue = (currentPage: number, itemsPerPage: number) => {
  const [queue, setQueue] = useState<PreloadQueue | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queueId = imageCacheService.generatePreloadQueueKey(currentPage, itemsPerPage);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const cachedQueue = await imageCacheService.getPreloadQueue(queueId);
      setQueue(cachedQueue);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取预加载队列失败');
    } finally {
      setLoading(false);
    }
  }, [queueId]);

  const updateQueue = useCallback(async (
    currentImages: string[],
    nextImages: string[],
    priority: 'high' | 'low' = 'high'
  ) => {
    const newQueue: PreloadQueue = {
      currentPage,
      nextPage: currentPage + 1,
      currentImages,
      nextImages,
      priority,
      timestamp: new Date()
    };

    try {
      await imageCacheService.cachePreloadQueue(queueId, newQueue);
      setQueue(newQueue);
    } catch (err) {
      console.error('Failed to cache preload queue:', err);
    }
  }, [currentPage, queueId]);

  const clearQueue = useCallback(async () => {
    try {
      await imageCacheService.clearImageCache(queueId);
      setQueue(null);
    } catch (err) {
      console.error('Failed to clear preload queue:', err);
    }
  }, [queueId]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  return {
    queue,
    loading,
    error,
    updateQueue,
    clearQueue,
    refetch: loadQueue
  };
};

/**
 * 图片缓存统计Hook
 */
export const useImageCacheStats = () => {
  const [stats, setStats] = useState<ImageCacheStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const cacheStats = await imageCacheService.getImageCacheStats();
      setStats(cacheStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取缓存统计失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    
    // 每30秒刷新一次统计信息
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    refetch: loadStats
  };
};

/**
 * 智能图片预加载Hook
 */
export const useSmartImagePreloader = (
  currentImages: string[],
  nextImages: string[] = [],
  options: {
    enabled?: boolean;
    priority?: 'high' | 'low';
    concurrency?: number;
    maxCacheSize?: number;
  } = {}
) => {
  const {
    enabled = true,
    priority = 'high',
    concurrency = 3,
    maxCacheSize = 50 // 降低最大缓存图片数量，防止内存占用过高
  } = options;

  const [loading, setLoading] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const loadingRef = useRef<Set<string>>(new Set());
  const maxConcurrencyRef = useRef(concurrency);
  const abortControllerRef = useRef<AbortController | null>(null);
  const preloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadImage = useCallback(async (url: string): Promise<boolean> => {
    if (loadedImages.has(url) || failedImages.has(url) || loadingRef.current.has(url)) {
      return false;
    }

    // 网络状况检测：如果连接不佳，降低并发数
    if (navigator.connection) {
      const connection = navigator.connection;
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        maxConcurrencyRef.current = 1;
      } else if (connection.effectiveType === '3g') {
        maxConcurrencyRef.current = 2;
      } else {
        maxConcurrencyRef.current = concurrency;
      }
    }

    // 检查是否被中止
    if (abortControllerRef.current?.signal.aborted) {
      return false;
    }

    loadingRef.current.add(url);

    try {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });

      // 智能LRU清理：如果超过最大缓存大小，删除最早的图片
      setLoadedImages(prev => {
        const newSet = new Set(prev).add(url);
        if (newSet.size > maxCacheSize) {
          // 转换为数组，删除最早的25%图片，避免频繁清理
          const urlsToDelete = Array.from(newSet).slice(0, Math.ceil(maxCacheSize * 0.25));
          urlsToDelete.forEach(urlToDelete => newSet.delete(urlToDelete));
          console.log(`[ImageCache] LRU清理: 删除${urlsToDelete.length}个早期图片，当前缓存大小: ${newSet.size}`);
        }
        return newSet;
      });

      // 同样清理failedImages，防止无限增长
      setFailedImages(prev => {
        if (prev.size > maxCacheSize) {
          const oldestUrl = Array.from(prev)[0];
          const newSet = new Set(prev);
          newSet.delete(oldestUrl);
          return newSet;
        }
        return prev;
      });

      return true;
    } catch {
      setFailedImages(prev => {
        const newSet = new Set(prev).add(url);
        // 限制失败图片的缓存大小
        if (newSet.size > Math.floor(maxCacheSize / 2)) {
          const oldestUrl = Array.from(newSet)[0];
          newSet.delete(oldestUrl);
        }
        return newSet;
      });
      return false;
    } finally {
      loadingRef.current.delete(url);
    }
  }, [loadedImages, failedImages, maxCacheSize]);

  const preloadImages = useCallback(async (urls: string[], isPriority: boolean = false) => {
    if (!enabled || urls.length === 0) return;

    // 过滤掉已经加载过或正在加载的图片
    const uniqueUrls = urls.filter(url => 
      !loadedImages.has(url) && 
      !failedImages.has(url) && 
      !loadingRef.current.has(url)
    );

    if (uniqueUrls.length === 0) return;

    // 创建新的AbortController
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setLoading(true);

    try {
      const limitedConcurrency = isPriority ? Math.max(1, Math.floor(maxConcurrencyRef.current / 2)) : 1;
      const chunks: string[][] = [];
      
      for (let i = 0; i < uniqueUrls.length; i += limitedConcurrency) {
        chunks.push(uniqueUrls.slice(i, i + limitedConcurrency));
      }

      for (const chunk of chunks) {
        // 检查是否被中止
        if (signal.aborted) break;
        await Promise.all(chunk.map(url => loadImage(url)));
      }
    } catch (err) {
      // 忽略AbortError，只记录其他错误
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Failed to preload images:', err);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [enabled, loadImage, loadedImages, failedImages]);

  const preloadCurrentImages = useCallback(() => {
    // 清除之前的防抖定时器
    if (preloadTimeoutRef.current) {
      clearTimeout(preloadTimeoutRef.current);
    }
    
    // 设置新的防抖定时器
    preloadTimeoutRef.current = setTimeout(() => {
      preloadImages(currentImages, priority === 'high');
    }, 300);
  }, [currentImages, priority, preloadImages]);

  const preloadNextImages = useCallback(() => {
    // 清除之前的防抖定时器
    if (preloadTimeoutRef.current) {
      clearTimeout(preloadTimeoutRef.current);
    }
    
    // 设置新的防抖定时器
    preloadTimeoutRef.current = setTimeout(() => {
      preloadImages(nextImages, false);
    }, 300);
  }, [nextImages, preloadImages]);

  useEffect(() => {
    if (enabled && currentImages.length > 0) {
      preloadCurrentImages();
    }
  }, [enabled, currentImages, preloadCurrentImages]);

  useEffect(() => {
    if (enabled && nextImages.length > 0 && currentImages.length > 0) {
      // 延迟预加载下一页图片
      const timer = setTimeout(() => {
        preloadNextImages();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [enabled, nextImages, currentImages, preloadNextImages]);

  return {
    loading,
    loadedImages: Array.from(loadedImages),
    failedImages: Array.from(failedImages),
    preloadCurrentImages,
    preloadNextImages,
    clearCache: () => {
      setLoadedImages(new Set());
      setFailedImages(new Set());
      loadingRef.current.clear();
    },
    abortPreloading: () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current);
        preloadTimeoutRef.current = null;
      }
      setLoading(false);
    }
  };
};

/**
 * 图片缓存健康检查Hook
 */
export const useImageCacheHealth = () => {
  const [isHealthy, setIsHealthy] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [checkInterval] = useState(30000); // 30秒检查一次

  const checkHealth = useCallback(async () => {
    try {
      // 尝试获取缓存统计来检查服务是否健康
      await imageCacheService.getImageCacheStats();
      setIsHealthy(true);
    } catch {
      setIsHealthy(false);
    } finally {
      setLastCheck(new Date());
    }
  }, []);

  useEffect(() => {
    checkHealth();

    const interval = setInterval(checkHealth, checkInterval);
    return () => clearInterval(interval);
  }, [checkHealth, checkInterval]);

  return {
    isHealthy,
    lastCheck,
    checkHealth
  };
};