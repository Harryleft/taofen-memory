/**
 * Universal Viewer Hook - 优化查看器初始化和性能
 * 
 * 设计原则：
 * - 响应式：自动处理加载状态和错误
 * - 性能优化：防抖、缓存、懒加载
 * - 状态管理：集中管理查看器状态
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { IIIFUrlBuilder } from '../utils/iiifUrlBuilder';

export interface ViewerState {
  loading: boolean;
  error: string | null;
  manifestUrl: string;
  currentPublicationId: string;
  currentIssueId: string;
  viewerReady: boolean;
}

export interface ViewerConfig {
  publicationId: string;
  issueId: string;
  autoLoad?: boolean;
  useProxy?: boolean;
  enableCache?: boolean;
  retryCount?: number;
}

export interface UseUniversalViewerReturn {
  state: ViewerState;
  actions: {
    loadManifest: (publicationId: string, issueId: string) => Promise<void>;
    reloadViewer: () => void;
    switchIssue: (newIssueId: string) => Promise<void>;
    resetError: () => void;
    destroy: () => void;
  };
  iframeRef: React.RefObject<HTMLIFrameElement>;
}

// 简单的内存缓存
const manifestCache = new Map<string, any>();

export function useUniversalViewer(
  initialConfig: ViewerConfig
): UseUniversalViewerReturn {
  const {
    publicationId: initialPublicationId,
    issueId: initialIssueId,
    autoLoad = true,
    useProxy = false,
    enableCache = true,
    retryCount = 3
  } = initialConfig;

  // 状态管理
  const [state, setState] = useState<ViewerState>({
    loading: false,
    error: null,
    manifestUrl: '',
    currentPublicationId: initialPublicationId,
    currentIssueId: initialIssueId,
    viewerReady: false
  });

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 清理函数
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    retryCountRef.current = 0;
  }, []);

  // 加载manifest（核心逻辑）
  const loadManifest = useCallback(async (
    publicationId: string, 
    issueId: string
  ) => {
    if (!publicationId || !issueId) {
      setState(prev => ({ ...prev, error: '缺少必要的参数' }));
      return;
    }

    cleanup();
    abortControllerRef.current = new AbortController();

    try {
      setState(prev => ({ 
        ...prev, 
        loading: true, 
        error: null,
        currentPublicationId: publicationId,
        currentIssueId: issueId
      }));

      // 构建manifest URL
      const manifestUrl = IIIFUrlBuilder.buildManifestUrl(publicationId, issueId);
      const proxyUrl = IIIFUrlBuilder.getProxyUrl(manifestUrl, useProxy);

      // 检查缓存
      if (enableCache && manifestCache.has(proxyUrl)) {
        console.log('🎯 使用缓存的manifest:', proxyUrl);
        setState(prev => ({ 
          ...prev, 
          manifestUrl: proxyUrl,
          loading: false
        }));
        return;
      }

      // 验证manifest可访问性
      const response = await fetch(proxyUrl, {
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`Manifest加载失败: ${response.status} ${response.statusText}`);
      }

      const manifest = await response.json();
      
      // 缓存manifest
      if (enableCache) {
        manifestCache.set(proxyUrl, manifest);
      }

      console.log('✅ Manifest加载成功:', manifest);

      setState(prev => ({ 
        ...prev, 
        manifestUrl: proxyUrl,
        loading: false,
        error: null
      }));

      retryCountRef.current = 0;

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('请求被取消');
        return;
      }

      console.error('❌ Manifest加载失败:', error);
      
      // 重试逻辑
      if (retryCountRef.current < retryCount) {
        retryCountRef.current++;
        console.log(`🔄 重试加载 (${retryCountRef.current}/${retryCount})`);
        setTimeout(() => loadManifest(publicationId, issueId), 1000 * retryCountRef.current);
        return;
      }

      setState(prev => ({ 
        ...prev, 
        loading: false,
        error: error.message || '加载失败'
      }));
    }
  }, [useProxy, enableCache, retryCount, cleanup]);

  // 切换期数
  const switchIssue = useCallback(async (newIssueId: string) => {
    await loadManifest(state.currentPublicationId, newIssueId);
  }, [loadManifest, state.currentPublicationId]);

  // 重新加载查看器
  const reloadViewer = useCallback(() => {
    if (iframeRef.current && state.manifestUrl) {
      const timestamp = Date.now();
      const viewerUrl = IIIFUrlBuilder.buildViewerUrl(state.manifestUrl, {
        timestamp,
        embedded: true
      });
      
      iframeRef.current.src = viewerUrl;
      console.log('🔄 重新加载查看器:', viewerUrl);
    }
  }, [state.manifestUrl]);

  // 重置错误
  const resetError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // 销毁查看器
  const destroy = useCallback(() => {
    cleanup();
    setState(prev => ({ 
      ...prev, 
      loading: false,
      error: null,
      viewerReady: false
    }));
    
    if (iframeRef.current) {
      iframeRef.current.src = 'about:blank';
    }
  }, [cleanup]);

  // 自动加载
  useEffect(() => {
    if (autoLoad && !state.manifestUrl && !state.loading) {
      loadManifest(initialPublicationId, initialIssueId);
    }
  }, [autoLoad, initialPublicationId, initialIssueId, state.manifestUrl, state.loading, loadManifest]);

  // 监听iframe消息
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'uv-loaded') {
        console.log('✅ UV查看器加载完成:', event.data.manifestId);
        setState(prev => ({ ...prev, viewerReady: true }));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // 清理
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    state,
    actions: {
      loadManifest,
      reloadViewer,
      switchIssue,
      resetError,
      destroy
    },
    iframeRef
  };
}