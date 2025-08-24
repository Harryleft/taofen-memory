/**
 * Universal Viewer Context - 查看器状态管理
 * 
 * 设计原则：
 * - 集中管理：统一管理所有查看器相关状态
 * - 响应式：状态变化自动更新所有组件
 * - 可扩展：支持插件式功能扩展
 */

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { IIIFUrlBuilder } from '../utils/iiifUrlBuilder';
import { IIIFErrorHandler, IIIFError } from '../utils/errorHandler';

export interface ViewerState {
  // 基础状态
  isLoading: boolean;
  isError: boolean;
  error: IIIFError | null;
  
  // 当前查看内容
  currentPublicationId: string;
  currentIssueId: string;
  manifestUrl: string;
  
  // 查看器状态
  viewerReady: boolean;
  viewerVisible: boolean;
  
  // 用户偏好
  settings: {
    theme: 'light' | 'dark';
    zoomLevel: number;
    viewMode: 'single' | 'double' | 'grid';
    autoRotate: boolean;
  };
  
  // 历史记录
  history: Array<{
    publicationId: string;
    issueId: string;
    timestamp: number;
  }>;
  
  // 性能监控
  performance: {
    loadTime: number;
    renderTime: number;
    errorCount: number;
  };
}

type ViewerAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: IIIFError | null }
  | { type: 'SET_CURRENT_CONTENT'; payload: { publicationId: string; issueId: string; manifestUrl: string } }
  | { type: 'SET_VIEWER_READY'; payload: boolean }
  | { type: 'SET_VIEWER_VISIBLE'; payload: boolean }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<ViewerState['settings']> }
  | { type: 'ADD_TO_HISTORY'; payload: { publicationId: string; issueId: string } }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'UPDATE_PERFORMANCE'; payload: Partial<ViewerState['performance']> }
  | { type: 'RESET_STATE' };

const initialState: ViewerState = {
  isLoading: false,
  isError: false,
  error: null,
  currentPublicationId: '',
  currentIssueId: '',
  manifestUrl: '',
  viewerReady: false,
  viewerVisible: true,
  settings: {
    theme: 'light',
    zoomLevel: 1,
    viewMode: 'double',
    autoRotate: false
  },
  history: [],
  performance: {
    loadTime: 0,
    renderTime: 0,
    errorCount: 0
  }
};

function viewerReducer(state: ViewerState, action: ViewerAction): ViewerState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { 
        ...state, 
        isError: action.payload !== null,
        error: action.payload,
        isLoading: false
      };
    
    case 'SET_CURRENT_CONTENT':
      return {
        ...state,
        currentPublicationId: action.payload.publicationId,
        currentIssueId: action.payload.issueId,
        manifestUrl: action.payload.manifestUrl
      };
    
    case 'SET_VIEWER_READY':
      return { ...state, viewerReady: action.payload };
    
    case 'SET_VIEWER_VISIBLE':
      return { ...state, viewerVisible: action.payload };
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
    
    case 'ADD_TO_HISTORY':
      const newHistory = [
        ...state.history.slice(-49), // 保留最近50条记录
        {
          publicationId: action.payload.publicationId,
          issueId: action.payload.issueId,
          timestamp: Date.now()
        }
      ];
      return { ...state, history: newHistory };
    
    case 'CLEAR_HISTORY':
      return { ...state, history: [] };
    
    case 'UPDATE_PERFORMANCE':
      return {
        ...state,
        performance: { ...state.performance, ...action.payload }
      };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

interface ViewerContextValue {
  state: ViewerState;
  actions: {
    setLoading: (loading: boolean) => void;
    setError: (error: any) => void;
    clearError: () => void;
    loadContent: (publicationId: string, issueId: string) => Promise<void>;
    setViewerReady: (ready: boolean) => void;
    setViewerVisible: (visible: boolean) => void;
    updateSettings: (settings: Partial<ViewerState['settings']>) => void;
    addToHistory: (publicationId: string, issueId: string) => void;
    clearHistory: () => void;
    updatePerformance: (performance: Partial<ViewerState['performance']>) => void;
    resetState: () => void;
    canGoBack: () => boolean;
    goBack: () => boolean;
    canGoForward: () => boolean;
    goForward: () => boolean;
  };
}

const ViewerContext = createContext<ViewerContextValue | undefined>(undefined);

interface ViewerProviderProps {
  children: ReactNode;
  config?: {
    maxHistory?: number;
    enablePerformanceTracking?: boolean;
    autoSaveSettings?: boolean;
  };
}

export function ViewerProvider({ children, config = {} }: ViewerProviderProps) {
  const [state, dispatch] = useReducer(viewerReducer, initialState);
  
  const {
    maxHistory = 50,
    enablePerformanceTracking = true,
    autoSaveSettings = true
  } = config;

  // 性能监控
  const trackPerformance = useCallback((metric: string, value: number) => {
    if (!enablePerformanceTracking) return;
    
    dispatch({
      type: 'UPDATE_PERFORMANCE',
      payload: { [metric]: value }
    });
  }, [enablePerformanceTracking]);

  // 设置加载状态
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  // 设置错误
  const setError = useCallback((error: any) => {
    const iiifError = IIIFErrorHandler.handleError(error);
    IIIFErrorHandler.logError(iiifError);
    
    dispatch({ type: 'SET_ERROR', payload: iiifError });
    
    // 更新错误计数
    trackPerformance('errorCount', state.performance.errorCount + 1);
  }, [state.performance.errorCount, trackPerformance]);

  // 清除错误
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // 加载内容
  const loadContent = useCallback(async (publicationId: string, issueId: string) => {
    const startTime = Date.now();
    
    try {
      setLoading(true);
      clearError();
      
      // 构建manifest URL
      const manifestUrl = IIIFUrlBuilder.buildManifestUrl(publicationId, issueId);
      
      // 验证manifest可访问性
      const response = await fetch(manifestUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const manifest = await response.json();
      
      // 更新状态
      dispatch({
        type: 'SET_CURRENT_CONTENT',
        payload: { publicationId, issueId, manifestUrl }
      });
      
      // 添加到历史记录
      dispatch({
        type: 'ADD_TO_HISTORY',
        payload: { publicationId, issueId }
      });
      
      // 记录性能
      const loadTime = Date.now() - startTime;
      trackPerformance('loadTime', loadTime);
      
      console.log('✅ 内容加载成功:', { publicationId, issueId, loadTime });
      
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setError, trackPerformance]);

  // 其他actions
  const setViewerReady = useCallback((ready: boolean) => {
    dispatch({ type: 'SET_VIEWER_READY', payload: ready });
  }, []);

  const setViewerVisible = useCallback((visible: boolean) => {
    dispatch({ type: 'SET_VIEWER_VISIBLE', payload: visible });
  }, []);

  const updateSettings = useCallback((settings: Partial<ViewerState['settings']>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
    
    // 自动保存设置到localStorage
    if (autoSaveSettings) {
      const currentSettings = { ...state.settings, ...settings };
      localStorage.setItem('viewer-settings', JSON.stringify(currentSettings));
    }
  }, [state.settings, autoSaveSettings]);

  const addToHistory = useCallback((publicationId: string, issueId: string) => {
    dispatch({ type: 'ADD_TO_HISTORY', payload: { publicationId, issueId } });
  }, []);

  const clearHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_HISTORY' });
  }, []);

  const updatePerformance = useCallback((performance: Partial<ViewerState['performance']>) => {
    dispatch({ type: 'UPDATE_PERFORMANCE', payload: performance });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  // 历史记录导航
  const canGoBack = useCallback(() => {
    return state.history.length > 1;
  }, [state.history.length]);

  const goBack = useCallback(() => {
    if (state.history.length > 1) {
      const previous = state.history[state.history.length - 2];
      loadContent(previous.publicationId, previous.issueId);
      return true;
    }
    return false;
  }, [state.history, loadContent]);

  const canGoForward = useCallback(() => {
    return false; // 简化实现，实际应该维护前进历史
  }, []);

  const goForward = useCallback(() => {
    return false; // 简化实现
  }, []);

  // 初始化时加载保存的设置
  React.useEffect(() => {
    if (autoSaveSettings) {
      try {
        const savedSettings = localStorage.getItem('viewer-settings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          updateSettings(settings);
        }
      } catch (error) {
        console.warn('无法加载保存的设置:', error);
      }
    }
  }, [autoSaveSettings, updateSettings]);

  const value: ViewerContextValue = {
    state,
    actions: {
      setLoading,
      setError,
      clearError,
      loadContent,
      setViewerReady,
      setViewerVisible,
      updateSettings,
      addToHistory,
      clearHistory,
      updatePerformance,
      resetState,
      canGoBack,
      goBack,
      canGoForward,
      goForward
    }
  };

  return (
    <ViewerContext.Provider value={value}>
      {children}
    </ViewerContext.Provider>
  );
}

export function useViewerContext() {
  const context = useContext(ViewerContext);
  if (context === undefined) {
    throw new Error('useViewerContext must be used within a ViewerProvider');
  }
  return context;
}