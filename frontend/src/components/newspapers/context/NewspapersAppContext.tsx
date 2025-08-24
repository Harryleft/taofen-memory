/**
 * 统一的数字报刊状态管理
 * 
 * Linus设计原则：
 * - 单一数据源：所有状态集中管理
 * - 清晰数据流：用户操作 → 状态更新 → UI重渲染
 * - 消除特殊情况：重新设计数据结构避免条件判断
 * - 简单明了：用最直接的方式实现
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { NewspaperService, PublicationItem, IssueItem } from '../services';

// ==================== 核心数据模型 ====================

// 应用状态 - 扁平化设计，消除嵌套
export interface NewspapersAppState {
  // 数据状态
  publications: PublicationItem[];
  issues: IssueItem[];
  
  // 选择状态
  selectedPublicationId: string | null;
  selectedIssueId: string | null;
  
  // UI状态
  loading: boolean;
  error: string | null;
  searchTerm: string;
  sortBy: 'name' | 'date' | 'count';
  currentView: 'catalog' | 'viewer';
  sidebarCollapsed: boolean;
  
  // 查看器状态
  manifestUrl: string;
  viewerReady: boolean;
  
  // 用户设置
  settings: {
    theme: 'light' | 'dark';
    zoomLevel: number;
    viewMode: 'single' | 'double' | 'grid';
    autoRotate: boolean;
  };
}

// 计算属性 - 从状态派生，不存储重复数据
export interface DerivedState {
  filteredPublications: PublicationItem[];
  selectedPublication: PublicationItem | null;
  selectedIssue: IssueItem | null;
  canGoBack: boolean;
  canGoForward: boolean;
}

// ==================== 动作定义 ====================

type NewspapersAppAction =
  // 数据加载
  | { type: 'LOAD_PUBLICATIONS_START' }
  | { type: 'LOAD_PUBLICATIONS_SUCCESS'; payload: PublicationItem[] }
  | { type: 'LOAD_PUBLICATIONS_ERROR'; payload: string }
  | { type: 'LOAD_ISSUES_SUCCESS'; payload: IssueItem[] }
  | { type: 'LOAD_ISSUES_ERROR'; payload: string }
  | { type: 'LOAD_MANIFEST_SUCCESS'; payload: string }
  | { type: 'LOAD_MANIFEST_ERROR'; payload: string }
  
  // 选择操作
  | { type: 'SELECT_PUBLICATION'; payload: string | null }
  | { type: 'SELECT_ISSUE'; payload: string | null }
  
  // UI操作
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_SORT_BY'; payload: 'name' | 'date' | 'count' }
  | { type: 'SET_CURRENT_VIEW'; payload: 'catalog' | 'viewer' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_VIEWER_READY'; payload: boolean }
  
  // 设置
  | { type: 'UPDATE_SETTINGS'; payload: Partial<NewspapersAppState['settings']> }
  
  // 清理
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_STATE' };

// ==================== Reducer ====================

const initialState: NewspapersAppState = {
  publications: [],
  issues: [],
  selectedPublicationId: null,
  selectedIssueId: null,
  loading: false,
  error: null,
  searchTerm: '',
  sortBy: 'name',
  currentView: 'catalog',
  sidebarCollapsed: false,
  manifestUrl: '',
  viewerReady: false,
  settings: {
    theme: 'light',
    zoomLevel: 1,
    viewMode: 'double',
    autoRotate: false,
  }
};

function newspapersAppReducer(state: NewspapersAppState, action: NewspapersAppAction): NewspapersAppState {
  switch (action.type) {
    case 'LOAD_PUBLICATIONS_START':
      return { ...state, loading: true, error: null };
    
    case 'LOAD_PUBLICATIONS_SUCCESS':
      return { 
        ...state, 
        publications: action.payload,
        loading: false,
        error: null
      };
    
    case 'LOAD_PUBLICATIONS_ERROR':
      return { ...state, loading: false, error: action.payload };
    
    case 'LOAD_ISSUES_SUCCESS':
      return { 
        ...state, 
        issues: action.payload,
        loading: false,
        error: null,
        selectedIssueId: null // 清除之前选择的期数
      };
    
    case 'LOAD_ISSUES_ERROR':
      return { ...state, loading: false, error: action.payload };
    
    case 'LOAD_MANIFEST_SUCCESS':
      return { 
        ...state, 
        manifestUrl: action.payload,
        loading: false,
        error: null
      };
    
    case 'LOAD_MANIFEST_ERROR':
      return { ...state, loading: false, error: action.payload };
    
    case 'SELECT_PUBLICATION':
      return { 
        ...state, 
        selectedPublicationId: action.payload,
        issues: [], // 清除之前的期数列表
        selectedIssueId: null,
        manifestUrl: ''
      };
    
    case 'SELECT_ISSUE':
      return { ...state, selectedIssueId: action.payload };
    
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    
    case 'SET_SORT_BY':
      return { ...state, sortBy: action.payload };
    
    case 'SET_CURRENT_VIEW':
      return { ...state, currentView: action.payload };
    
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    
    case 'SET_VIEWER_READY':
      return { ...state, viewerReady: action.payload };
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

// ==================== Context ====================

interface NewspapersAppContextType {
  // 状态
  state: NewspapersAppState;
  derived: DerivedState;
  
  // 动作
  actions: {
    // 数据加载
    loadPublications: () => Promise<void>;
    loadIssues: (publicationId: string) => Promise<void>;
    loadManifest: (publicationId: string, issueId: string) => Promise<void>;
    
    // 选择操作
    selectPublication: (publicationId: string | null) => void;
    selectIssue: (issueId: string | null) => void;
    
    // UI操作
    setSearchTerm: (term: string) => void;
    setSortBy: (sortBy: 'name' | 'date' | 'count') => void;
    setCurrentView: (view: 'catalog' | 'viewer') => void;
    toggleSidebar: () => void;
    setViewerReady: (ready: boolean) => void;
    
    // 设置
    updateSettings: (settings: Partial<NewspapersAppState['settings']>) => void;
    
    // 清理
    clearError: () => void;
    resetState: () => void;
  };
}

const NewspapersAppContext = createContext<NewspapersAppContextType | undefined>(undefined);

// ==================== Provider ====================

interface NewspapersAppProviderProps {
  children: React.ReactNode;
}

export function NewspapersAppProvider({ children }: NewspapersAppProviderProps) {
  const [state, dispatch] = useReducer(newspapersAppReducer, initialState);

  // ==================== 计算属性 ====================

  const derived: DerivedState = {
    // 过滤和排序刊物
    filteredPublications: NewspaperService.filterPublications(
      state.publications,
      state.searchTerm,
      state.sortBy
    ),
    
    // 当前选择的刊物
    selectedPublication: state.publications.find(p => p.id === state.selectedPublicationId) || null,
    
    // 当前选择的期数
    selectedIssue: state.issues.find(i => i.manifest === state.selectedIssueId) || null,
    
    // 导航状态
    canGoBack: state.currentView === 'viewer',
    canGoForward: false // 简化实现
  };

  // ==================== 动作实现 ====================

  // 数据加载动作
  const loadPublications = useCallback(async () => {
    try {
      dispatch({ type: 'LOAD_PUBLICATIONS_START' });
      const publications = await NewspaperService.getPublications();
      dispatch({ type: 'LOAD_PUBLICATIONS_SUCCESS', payload: publications });
    } catch (error) {
      dispatch({ 
        type: 'LOAD_PUBLICATIONS_ERROR', 
        payload: error instanceof Error ? error.message : '加载刊物列表失败'
      });
    }
  }, []);

  const loadIssues = useCallback(async (publicationId: string) => {
    try {
      dispatch({ type: 'LOAD_PUBLICATIONS_START' }); // 复用loading状态
      
      const publication = state.publications.find(p => p.id === publicationId);
      if (!publication) {
        throw new Error('刊物不存在');
      }
      
      const issues = await NewspaperService.getIssuesForPublication(publication.collection);
      dispatch({ type: 'LOAD_ISSUES_SUCCESS', payload: issues });
    } catch (error) {
      dispatch({ 
        type: 'LOAD_ISSUES_ERROR', 
        payload: error instanceof Error ? error.message : '加载期数列表失败'
      });
    }
  }, [state.publications]);

  const loadManifest = useCallback(async (publicationId: string, issueId: string) => {
    try {
      dispatch({ type: 'LOAD_PUBLICATIONS_START' }); // 复用loading状态
      
      // 构建manifest URL
      let fullManifestUrl;
      if (issueId.startsWith('http')) {
        fullManifestUrl = issueId;
      } else {
        fullManifestUrl = `https://www.ai4dh.cn/iiif/3/manifests/${publicationId}/${issueId}/manifest.json`;
      }
      
      // 使用代理URL
      const proxyManifestUrl = NewspaperService.getProxyUrl(fullManifestUrl);
      
      // 验证manifest是否可访问
      const response = await fetch(proxyManifestUrl);
      if (!response.ok) {
        throw new Error(`Manifest加载失败: ${response.status} ${response.statusText}`);
      }
      
      await response.json(); // 验证JSON格式
      dispatch({ type: 'LOAD_MANIFEST_SUCCESS', payload: proxyManifestUrl });
      
    } catch (error) {
      dispatch({ 
        type: 'LOAD_MANIFEST_ERROR', 
        payload: error instanceof Error ? error.message : '加载Manifest失败'
      });
    }
  }, []);

  // 选择操作
  const selectPublication = useCallback((publicationId: string | null) => {
    dispatch({ type: 'SELECT_PUBLICATION', payload: publicationId });
  }, []);

  const selectIssue = useCallback((issueId: string | null) => {
    dispatch({ type: 'SELECT_ISSUE', payload: issueId });
  }, []);

  // UI操作
  const setSearchTerm = useCallback((term: string) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: term });
  }, []);

  const setSortBy = useCallback((sortBy: 'name' | 'date' | 'count') => {
    dispatch({ type: 'SET_SORT_BY', payload: sortBy });
  }, []);

  const setCurrentView = useCallback((view: 'catalog' | 'viewer') => {
    dispatch({ type: 'SET_CURRENT_VIEW', payload: view });
  }, []);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);

  const setViewerReady = useCallback((ready: boolean) => {
    dispatch({ type: 'SET_VIEWER_READY', payload: ready });
  }, []);

  // 设置
  const updateSettings = useCallback((settings: Partial<NewspapersAppState['settings']>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
    
    // 自动保存到localStorage
    try {
      const currentSettings = { ...state.settings, ...settings };
      localStorage.setItem('newspapers-settings', JSON.stringify(currentSettings));
    } catch (error) {
      console.warn('无法保存设置:', error);
    }
  }, [state.settings]);

  // 清理
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  // ==================== 副作用 ====================

  // 初始化时加载刊物列表
  useEffect(() => {
    loadPublications();
  }, [loadPublications]);

  // 初始化时加载保存的设置
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('newspapers-settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        updateSettings(settings);
      }
    } catch (error) {
      console.warn('无法加载保存的设置:', error);
    }
  }, [updateSettings]);

  // 自动加载期数（当选择刊物时）
  useEffect(() => {
    if (state.selectedPublicationId) {
      loadIssues(state.selectedPublicationId);
    }
  }, [state.selectedPublicationId, loadIssues]);

  // 自动加载manifest（当选择期数时）
  useEffect(() => {
    if (state.selectedPublicationId && state.selectedIssueId) {
      loadManifest(state.selectedPublicationId, state.selectedIssueId);
    }
  }, [state.selectedPublicationId, state.selectedIssueId, loadManifest]);

  // ==================== Context值 ====================

  const contextValue: NewspapersAppContextType = {
    state,
    derived,
    actions: {
      loadPublications,
      loadIssues,
      loadManifest,
      selectPublication,
      selectIssue,
      setSearchTerm,
      setSortBy,
      setCurrentView,
      toggleSidebar,
      setViewerReady,
      updateSettings,
      clearError,
      resetState
    }
  };

  return (
    <NewspapersAppContext.Provider value={contextValue}>
      {children}
    </NewspapersAppContext.Provider>
  );
}

// ==================== Hook ====================

export function useNewspapersApp(): NewspapersAppContextType {
  const context = useContext(NewspapersAppContext);
  if (!context) {
    throw new Error('useNewspapersApp must be used within a NewspapersAppProvider');
  }
  return context;
}

// ==================== 便捷Hook ====================

// 选择性状态hook - 减少重渲染
export function useNewspapersState<T>(selector: (state: NewspapersAppState) => T): T {
  const { state } = useNewspapersApp();
  return selector(state);
}

// 选择性派生状态hook
export function useNewspapersDerived<T>(selector: (derived: DerivedState) => T): T {
  const { derived } = useNewspapersApp();
  return selector(derived);
}

// 选择性动作hook
export function useNewspapersActions<T>(selector: (actions: NewspapersAppContextType['actions']) => T): T {
  const { actions } = useNewspapersApp();
  return selector(actions);
}