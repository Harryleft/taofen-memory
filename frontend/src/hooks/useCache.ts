/**
 * 缓存管理React Hook
 * 提供缓存操作的便捷接口
 */

import { useState, useEffect, useCallback } from 'react';
import { cacheService, CacheStats } from '../services/cache/cache-service';

export interface UseCacheOptions {
  enabled?: boolean;
  ttl?: number;
  refreshInterval?: number;
}

export interface UseCacheResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setCache: (value: T) => Promise<void>;
  clearCache: () => Promise<void>;
}

/**
 * 通用缓存Hook
 */
export function useCache<T>(
  key: string,
  options: UseCacheOptions = {}
): UseCacheResult<T> {
  const { enabled = true, ttl, refreshInterval } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const response = await cacheService.get(key);
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || '获取缓存失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  }, [key, enabled]);

  const setCache = useCallback(async (value: T) => {
    try {
      const response = await cacheService.set(key, value, ttl);
      
      if (response.success) {
        setData(value);
      } else {
        setError(response.error || '设置缓存失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    }
  }, [key, ttl]);

  const clearCache = useCallback(async () => {
    try {
      const response = await cacheService.delete(key);
      
      if (response.success) {
        setData(null);
      } else {
        setError(response.error || '清除缓存失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    }
  }, [key]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (refreshInterval && enabled) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval, enabled]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    setCache,
    clearCache,
  };
}

/**
 * IIIF信息缓存Hook
 */
export function useIIIFInfo(identifier: string): UseCacheResult<unknown> {
  const key = cacheService.generateIIIFKey(identifier, 'info');

  const { data, loading, error, refetch } = useCache<unknown>(key, {
    enabled: !!identifier,
    ttl: 86400, // 24小时
    refreshInterval: 3600000, // 1小时
  });

  return {
    data,
    loading,
    error,
    refetch,
    setCache: async (value: unknown) => {
      // IIIF信息通常通过服务API设置，这里提供接口但建议使用服务API
      await cacheService.set(key, value, 86400);
    },
    clearCache: async () => {
      await cacheService.delete(key);
    },
  };
}

/**
 * 缓存统计Hook
 */
export function useCacheStats(): {
  stats: CacheStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await cacheService.getStats();
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.error || '获取缓存统计失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}

/**
 * 批量缓存Hook
 */
export function useBatchCache<T>(
  keys: string[]
): {
  data: Record<string, T | null>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<Record<string, T | null>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBatch = useCallback(async () => {
    if (keys.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const response = await cacheService.mget(keys);
      
      if (response.success && response.data) {
        const newData: Record<string, T | null> = {};
        keys.forEach((key, index) => {
          newData[key] = response.data[index];
        });
        setData(newData);
      } else {
        setError(response.error || '批量获取缓存失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  }, [keys]);

  useEffect(() => {
    fetchBatch();
  }, [fetchBatch]);

  return {
    data,
    loading,
    error,
    refetch: fetchBatch,
  };
}

/**
 * 缓存健康检查Hook
 */
export function useCacheHealth(): {
  healthy: boolean;
  loading: boolean;
  lastCheck: Date | null;
  check: () => Promise<void>;
} {
  const [healthy, setHealthy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    setLoading(true);
    
    try {
      const isHealthy = await cacheService.healthCheck();
      setHealthy(isHealthy);
      setLastCheck(new Date());
    } catch {
      setHealthy(false);
      setLastCheck(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    
    // 每30秒检查一次健康状态
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return {
    healthy,
    loading,
    lastCheck,
    check: checkHealth,
  };
}

/**
 * 缓存预取Hook
 */
export function useCachePrefetch(): {
  prefetch: (keys: string[]) => Promise<void>;
  prefetchIIIF: (identifiers: string[]) => Promise<void>;
  loading: boolean;
} {
  const [loading, setLoading] = useState(false);

  const prefetch = useCallback(async (keys: string[]) => {
    if (keys.length === 0) return;

    setLoading(true);
    
    try {
      // 批量获取缓存，未命中的会触发远程请求
      await cacheService.mget(keys);
    } catch (err) {
      console.error('缓存预取失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const prefetchIIIF = useCallback(async (identifiers: string[]) => {
    if (identifiers.length === 0) return;

    setLoading(true);
    
    try {
      await cacheService.prefetchIIIFInfo(identifiers);
    } catch (err) {
      console.error('IIIF预取失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    prefetch,
    prefetchIIIF,
    loading,
  };
}