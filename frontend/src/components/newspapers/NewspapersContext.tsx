import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { NewspaperService, PublicationItem, IssueItem } from './services';

// 状态类型定义
interface NewspapersState {
  publications: PublicationItem[];
  filteredPublications: PublicationItem[];
  issues: IssueItem[];
  selectedPublication: PublicationItem | null;
  selectedIssue: IssueItem | null;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  sortBy: 'name' | 'date' | 'count';
  currentView: 'catalog' | 'viewer';
  sidebarCollapsed: boolean;
  manifestUrl: string;
}

// 动作类型定义
type NewspapersAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PUBLICATIONS'; payload: PublicationItem[] }
  | { type: 'SET_FILTERED_PUBLICATIONS'; payload: PublicationItem[] }
  | { type: 'SET_ISSUES'; payload: IssueItem[] }
  | { type: 'SELECT_PUBLICATION'; payload: PublicationItem | null }
  | { type: 'SELECT_ISSUE'; payload: IssueItem | null }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_SORT_BY'; payload: 'name' | 'date' | 'count' }
  | { type: 'SET_CURRENT_VIEW'; payload: 'catalog' | 'viewer' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_MANIFEST_URL'; payload: string }
  | { type: 'RESET_STATE' };

// 初始状态
const initialState: NewspapersState = {
  publications: [],
  filteredPublications: [],
  issues: [],
  selectedPublication: null,
  selectedIssue: null,
  loading: true,
  error: null,
  searchTerm: '',
  sortBy: 'name',
  currentView: 'catalog',
  sidebarCollapsed: false,
  manifestUrl: ''
};

// Reducer函数
const newspapersReducer = (state: NewspapersState, action: NewspapersAction): NewspapersState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_PUBLICATIONS':
      return { 
        ...state, 
        publications: action.payload,
        filteredPublications: action.payload
      };
    
    case 'SET_FILTERED_PUBLICATIONS':
      return { ...state, filteredPublications: action.payload };
    
    case 'SET_ISSUES':
      return { ...state, issues: action.payload };
    
    case 'SELECT_PUBLICATION':
      return { 
        ...state, 
        selectedPublication: action.payload,
        issues: [],
        selectedIssue: null,
        manifestUrl: ''
      };
    
    case 'SELECT_ISSUE':
      return { ...state, selectedIssue: action.payload };
    
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    
    case 'SET_SORT_BY':
      return { ...state, sortBy: action.payload };
    
    case 'SET_CURRENT_VIEW':
      return { ...state, currentView: action.payload };
    
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    
    case 'SET_MANIFEST_URL':
      return { ...state, manifestUrl: action.payload };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
};

// Context类型定义
interface NewspapersContextType {
  state: NewspapersState;
  actions: {
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setPublications: (publications: PublicationItem[]) => void;
    setFilteredPublications: (publications: PublicationItem[]) => void;
    setIssues: (issues: IssueItem[]) => void;
    selectPublication: (publication: PublicationItem | null) => void;
    selectIssue: (issue: IssueItem | null) => void;
    setSearchTerm: (term: string) => void;
    setSortBy: (sortBy: 'name' | 'date' | 'count') => void;
    setCurrentView: (view: 'catalog' | 'viewer') => void;
    toggleSidebar: () => void;
    setManifestUrl: (url: string) => void;
    resetState: () => void;
    loadPublications: () => Promise<void>;
    loadIssues: (publication: PublicationItem) => Promise<void>;
    loadManifest: (publicationId: string, issueId: string) => Promise<void>;
    filterAndSortPublications: () => void;
  };
}

// 创建Context
const NewspapersContext = createContext<NewspapersContextType | undefined>(undefined);

// Provider组件
interface NewspapersProviderProps {
  children: React.ReactNode;
}

export const NewspapersProvider: React.FC<NewspapersProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(newspapersReducer, initialState);

  // 防抖计时器
  const debounceRef = React.useRef<NodeJS.Timeout>();

  // 基础动作
  const actions = {
    setLoading: useCallback((loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    }, []),

    setError: useCallback((error: string | null) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    }, []),

    setPublications: useCallback((publications: PublicationItem[]) => {
      dispatch({ type: 'SET_PUBLICATIONS', payload: publications });
    }, []),

    setFilteredPublications: useCallback((publications: PublicationItem[]) => {
      dispatch({ type: 'SET_FILTERED_PUBLICATIONS', payload: publications });
    }, []),

    setIssues: useCallback((issues: IssueItem[]) => {
      dispatch({ type: 'SET_ISSUES', payload: issues });
    }, []),

    selectPublication: useCallback((publication: PublicationItem | null) => {
      dispatch({ type: 'SELECT_PUBLICATION', payload: publication });
    }, []),

    selectIssue: useCallback((issue: IssueItem | null) => {
      dispatch({ type: 'SELECT_ISSUE', payload: issue });
    }, []),

    setSearchTerm: useCallback((term: string) => {
      dispatch({ type: 'SET_SEARCH_TERM', payload: term });
    }, []),

    setSortBy: useCallback((sortBy: 'name' | 'date' | 'count') => {
      dispatch({ type: 'SET_SORT_BY', payload: sortBy });
    }, []),

    setCurrentView: useCallback((view: 'catalog' | 'viewer') => {
      dispatch({ type: 'SET_CURRENT_VIEW', payload: view });
    }, []),

    toggleSidebar: useCallback(() => {
      dispatch({ type: 'TOGGLE_SIDEBAR' });
    }, []),

    setManifestUrl: useCallback((url: string) => {
      dispatch({ type: 'SET_MANIFEST_URL', payload: url });
    }, []),

    resetState: useCallback(() => {
      dispatch({ type: 'RESET_STATE' });
    }, [])
  };

  // 加载刊物列表
  const loadPublications = useCallback(async () => {
    try {
      actions.setLoading(true);
      actions.setError(null);
      
      const publications = await NewspaperService.getPublications();
      actions.setPublications(publications);
      
    } catch (err) {
      actions.setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      actions.setLoading(false);
    }
  }, [actions]);

  // 加载期数列表
  const loadIssues = useCallback(async (publication: PublicationItem) => {
    try {
      actions.setLoading(true);
      actions.setError(null);
      
      const publicationId = NewspaperService.extractPublicationId(publication.id);
      const issues = await NewspaperService.getIssues(publicationId);
      
      actions.setIssues(issues);
      
      // 自动选择第一个期数
      if (issues.length > 0) {
        actions.selectIssue(issues[0]);
      }
      
    } catch (err) {
      actions.setError(err instanceof Error ? err.message : '加载期数失败');
    } finally {
      actions.setLoading(false);
    }
  }, [actions]);

  // 加载manifest
  const loadManifest = useCallback(async (publicationId: string, issueId: string) => {
    try {
      actions.setLoading(true);
      actions.setError(null);
      
      // 构建完整的manifest URL
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
      actions.setManifestUrl(proxyManifestUrl);
      
    } catch (err) {
      actions.setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      actions.setLoading(false);
    }
  }, [actions]);

  // 过滤和排序刊物
  const filterAndSortPublications = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const filtered = NewspaperService.filterPublications(
        state.publications, 
        state.searchTerm, 
        state.sortBy
      );
      actions.setFilteredPublications(filtered);
    }, 300);
  }, [state.publications, state.searchTerm, state.sortBy, actions]);

  // 自动触发过滤和排序
  useEffect(() => {
    filterAndSortPublications();
    
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [state.publications, state.searchTerm, state.sortBy, filterAndSortPublications]);

  // 初始化时加载刊物列表
  useEffect(() => {
    loadPublications();
  }, [loadPublications]);

  // 清理防抖计时器
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // 使用useMemo优化actions对象
  const memoizedActions = React.useMemo(() => ({
    ...actions,
    loadPublications,
    loadIssues,
    loadManifest,
    filterAndSortPublications
  }), [actions, loadPublications, loadIssues, loadManifest, filterAndSortPublications]);

  const contextValue: NewspapersContextType = {
    state,
    actions: memoizedActions
  };

  return (
    <NewspapersContext.Provider value={contextValue}>
      {children}
    </NewspapersContext.Provider>
  );
};

// Hook函数
export const useNewspapers = (): NewspapersContextType => {
  const context = useContext(NewspapersContext);
  if (!context) {
    throw new Error('useNewspapers must be used within a NewspapersProvider');
  }
  return context;
};