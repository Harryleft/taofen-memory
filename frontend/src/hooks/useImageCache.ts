/**
 * 手写体图片缓存React Hooks
 * 提供图片缓存、布局缓存和预加载队列管理功能
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { imageCacheService, type ImageDimensions, type LayoutCache, type PreloadQueue } from '@/services/cache/image-cache-service';

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
  const [stats, setStats] = useState<any>(null);
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
  } = {}
) => {
  const {
    enabled = true,
    priority = 'high',
    concurrency = 3
  } = options;

  const [loading, setLoading] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const loadingRef = useRef<Set<string>>(new Set());
  const maxConcurrencyRef = useRef(concurrency);

  const loadImage = useCallback(async (url: string): Promise<boolean> => {
    if (loadedImages.has(url) || failedImages.has(url) || loadingRef.current.has(url)) {
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

      setLoadedImages(prev => new Set(prev).add(url));
      return true;
    } catch (error) {
      setFailedImages(prev => new Set(prev).add(url));
      return false;
    } finally {
      loadingRef.current.delete(url);
    }
  }, [loadedImages, failedImages]);

  const preloadImages = useCallback(async (urls: string[], isPriority: boolean = false) => {
    if (!enabled || urls.length === 0) return;

    setLoading(true);

    try {
      const limitedConcurrency = isPriority ? Math.max(1, Math.floor(maxConcurrencyRef.current / 2)) : 1;
      const chunks: string[][] = [];
      
      for (let i = 0; i < urls.length; i += limitedConcurrency) {
        chunks.push(urls.slice(i, i + limitedConcurrency));
      }

      for (const chunk of chunks) {
        await Promise.all(chunk.map(url => loadImage(url)));
      }
    } catch (error) {
      console.error('Failed to preload images:', error);
    } finally {
      setLoading(false);
    }
  }, [enabled, loadImage]);

  const preloadCurrentImages = useCallback(() => {
    return preloadImages(currentImages, priority === 'high');
  }, [currentImages, priority, preloadImages]);

  const preloadNextImages = useCallback(() => {
    return preloadImages(nextImages, false);
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
    } catch (error) {
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