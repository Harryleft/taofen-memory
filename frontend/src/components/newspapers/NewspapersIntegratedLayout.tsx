import React, { useState, useEffect, useCallback, useRef, useReducer } from 'react';
import { NewspaperService, PublicationItem, IssueItem, PaginationParams } from './services';
import { InfiniteScrollIssueList } from './InfiniteScrollIssueList';
import { NewspapersBreadcrumb } from './NewspapersBreadcrumb';
import AppHeader from '@/components/layout/header/AppHeader.tsx';
import NewspapersLayout from './NewspapersLayout.tsx';
import { EmptyState } from './EmptyState';
import { NewspapersGuideArea } from './NewspapersGuideArea';

// ====================
// 常量配置
// ====================

/**
 * 移动端断点宽度
 * 小于等于此宽度视为移动端
 */
const MOBILE_BREAKPOINT = 768;

/**
 * 分页配置
 */
const PAGINATION = {
  DEFAULT_LIMIT: 20, // 默认每页数量
  BATCH_SIZE: 5,     // 并发请求批次大小
  RETRY_DELAY: 100, // 重试延迟(ms)
} as const;

/**
 * 触摸手势配置
 */
const TOUCH_GESTURE = {
  MIN_DRAG_DISTANCE: 50,   // 最小拖动距离
  CLOSE_THRESHOLD: 100,    // 关闭抽屉阈值
  TRANSFORM_THRESHOLD: 200, // 变换阈值
} as const;

/**
 * iframe 沙箱配置
 */
const IFRAME_SANDBOX = "allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation allow-modals";

// ====================
// 类型定义
// ====================

interface NewspapersIntegratedLayoutProps {
  onPublicationSelect?: (publicationId: string, publicationTitle: string) => void;
  onIssueSelect?: (issueId: string) => void;
}

/**
 * 组件状态类型
 */
interface NewspapersState {
  // 基础状态
  publications: PublicationItem[];
  selectedPublication: PublicationItem | null;
  selectedIssue: IssueItem | null;
  issues: IssueItem[];
  loading: boolean;
  error: string | null;
  
  // 布局状态
  sidebarOpen: boolean;
  isMobile: boolean;
  manifestUrl: string;
  
  // 无限滚动状态
  issuesPage: number;
  issuesHasMore: boolean;
  issuesLoadingMore: boolean;
  issuesError: string | null;
  issuesRetryCount: number;
  allIssuesLoaded: boolean;
  
  // 移动端抽屉状态
  drawerOpen: boolean;
  drawerMode: 'publications' | 'issues';
  
  // 触摸手势状态
  touchStartY: number;
  touchCurrentY: number;
  isDragging: boolean;
}

/**
 * 状态操作类型
 */
type NewspapersAction = 
  | { type: 'SET_PUBLICATIONS'; payload: PublicationItem[] }
  | { type: 'SET_SELECTED_PUBLICATION'; payload: PublicationItem | null }
  | { type: 'SET_SELECTED_ISSUE'; payload: IssueItem | null }
  | { type: 'SET_ISSUES'; payload: IssueItem[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'SET_MOBILE'; payload: boolean }
  | { type: 'SET_MANIFEST_URL'; payload: string }
  | { type: 'SET_ISSUES_PAGE'; payload: number }
  | { type: 'SET_ISSUES_HAS_MORE'; payload: boolean }
  | { type: 'SET_ISSUES_LOADING_MORE'; payload: boolean }
  | { type: 'SET_ISSUES_ERROR'; payload: string | null }
  | { type: 'SET_ISSUES_RETRY_COUNT'; payload: number }
  | { type: 'SET_ALL_ISSUES_LOADED'; payload: boolean }
  | { type: 'SET_DRAWER_OPEN'; payload: boolean }
  | { type: 'SET_DRAWER_MODE'; payload: 'publications' | 'issues' }
  | { type: 'SET_TOUCH_START_Y'; payload: number }
  | { type: 'SET_TOUCH_CURRENT_Y'; payload: number }
  | { type: 'SET_IS_DRAGGING'; payload: boolean }
  | { type: 'RESET_ISSUES_STATE' }
  | { type: 'RESET_STATE' };

// ====================
// 状态管理器
// ====================

/**
 * 初始状态
 */
const initialState: NewspapersState = {
  publications: [],
  selectedPublication: null,
  selectedIssue: null,
  issues: [],
  loading: false,
  error: null,
  sidebarOpen: true,
  isMobile: false,
  manifestUrl: '',
  issuesPage: 0,
  issuesHasMore: true,
  issuesLoadingMore: false,
  issuesError: null,
  issuesRetryCount: 0,
  allIssuesLoaded: false,
  drawerOpen: false,
  drawerMode: 'publications',
  touchStartY: 0,
  touchCurrentY: 0,
  isDragging: false,
};

/**
 * 状态管理器 - 使用 useReducer 统一管理状态
 */
const newspapersReducer = (state: NewspapersState, action: NewspapersAction): NewspapersState => {
  switch (action.type) {
    case 'SET_PUBLICATIONS':
      return { ...state, publications: action.payload };
    case 'SET_SELECTED_PUBLICATION':
      return { ...state, selectedPublication: action.payload };
    case 'SET_SELECTED_ISSUE':
      return { ...state, selectedIssue: action.payload };
    case 'SET_ISSUES':
      return { ...state, issues: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SIDEBAR_OPEN':
      return { ...state, sidebarOpen: action.payload };
    case 'SET_MOBILE':
      return { ...state, isMobile: action.payload };
    case 'SET_MANIFEST_URL':
      return { ...state, manifestUrl: action.payload };
    case 'SET_ISSUES_PAGE':
      return { ...state, issuesPage: action.payload };
    case 'SET_ISSUES_HAS_MORE':
      return { ...state, issuesHasMore: action.payload };
    case 'SET_ISSUES_LOADING_MORE':
      return { ...state, issuesLoadingMore: action.payload };
    case 'SET_ISSUES_ERROR':
      return { ...state, issuesError: action.payload };
    case 'SET_ISSUES_RETRY_COUNT':
      return { ...state, issuesRetryCount: action.payload };
    case 'SET_ALL_ISSUES_LOADED':
      return { ...state, allIssuesLoaded: action.payload };
    case 'SET_DRAWER_OPEN':
      return { ...state, drawerOpen: action.payload };
    case 'SET_DRAWER_MODE':
      return { ...state, drawerMode: action.payload };
    case 'SET_TOUCH_START_Y':
      return { ...state, touchStartY: action.payload };
    case 'SET_TOUCH_CURRENT_Y':
      return { ...state, touchCurrentY: action.payload };
    case 'SET_IS_DRAGGING':
      return { ...state, isDragging: action.payload };
    case 'RESET_ISSUES_STATE':
      return {
        ...state,
        issuesPage: 0,
        issuesHasMore: true,
        issuesLoadingMore: false,
        issuesError: null,
        issuesRetryCount: 0,
        allIssuesLoaded: false,
        issues: [],
      };
    case 'RESET_STATE':
      return { ...initialState };
    default:
      return state;
  }
};

// ====================
// 工具函数
// ====================

/**
 * 创建状态操作函数
 */
const createActions = (dispatch: React.Dispatch<NewspapersAction>) => ({
  setPublications: (publications: PublicationItem[]) => 
    dispatch({ type: 'SET_PUBLICATIONS', payload: publications }),
  setSelectedPublication: (publication: PublicationItem | null) => 
    dispatch({ type: 'SET_SELECTED_PUBLICATION', payload: publication }),
  setSelectedIssue: (issue: IssueItem | null) => 
    dispatch({ type: 'SET_SELECTED_ISSUE', payload: issue }),
  setIssues: (issues: IssueItem[]) => 
    dispatch({ type: 'SET_ISSUES', payload: issues }),
  setLoading: (loading: boolean) => 
    dispatch({ type: 'SET_LOADING', payload: loading }),
  setError: (error: string | null) => 
    dispatch({ type: 'SET_ERROR', payload: error }),
  setSidebarOpen: (open: boolean) => 
    dispatch({ type: 'SET_SIDEBAR_OPEN', payload: open }),
  setMobile: (mobile: boolean) => 
    dispatch({ type: 'SET_MOBILE', payload: mobile }),
  setManifestUrl: (url: string) => 
    dispatch({ type: 'SET_MANIFEST_URL', payload: url }),
  setIssuesPage: (page: number) => 
    dispatch({ type: 'SET_ISSUES_PAGE', payload: page }),
  setIssuesHasMore: (hasMore: boolean) => 
    dispatch({ type: 'SET_ISSUES_HAS_MORE', payload: hasMore }),
  setIssuesLoadingMore: (loading: boolean) => 
    dispatch({ type: 'SET_ISSUES_LOADING_MORE', payload: loading }),
  setIssuesError: (error: string | null) => 
    dispatch({ type: 'SET_ISSUES_ERROR', payload: error }),
  setIssuesRetryCount: (count: number) => 
    dispatch({ type: 'SET_ISSUES_RETRY_COUNT', payload: count }),
  setAllIssuesLoaded: (loaded: boolean) => 
    dispatch({ type: 'SET_ALL_ISSUES_LOADED', payload: loaded }),
  setDrawerOpen: (open: boolean) => 
    dispatch({ type: 'SET_DRAWER_OPEN', payload: open }),
  setDrawerMode: (mode: 'publications' | 'issues') => 
    dispatch({ type: 'SET_DRAWER_MODE', payload: mode }),
  setTouchStartY: (y: number) => 
    dispatch({ type: 'SET_TOUCH_START_Y', payload: y }),
  setTouchCurrentY: (y: number) => 
    dispatch({ type: 'SET_TOUCH_CURRENT_Y', payload: y }),
  setIsDragging: (dragging: boolean) => 
    dispatch({ type: 'SET_IS_DRAGGING', payload: dragging }),
  resetIssuesState: () => 
    dispatch({ type: 'RESET_ISSUES_STATE' }),
  resetState: () => 
    dispatch({ type: 'RESET_STATE' }),
});

/**
 * 数字报刊一体化布局组件
 * 
 * 主要功能：
 * 1. 刊物列表展示和选择
 * 2. 期数列表展示和选择（支持无限滚动）
 * 3. 报刊查看器集成
 * 4. 响应式布局（桌面端/移动端）
 * 5. 面包屑导航
 * 6. 键盘快捷键支持
 * 
 * 架构特点：
 * - 使用 useReducer 统一管理状态
 * - 职责分离，拆分为多个子组件函数
 * - 提取公共常量和配置
 * - 完善的错误处理和加载状态
 */
export const NewspapersIntegratedLayout: React.FC<NewspapersIntegratedLayoutProps> = ({
  onPublicationSelect,
  onIssueSelect
}) => {
  // ====================
  // 状态管理
  // ====================
  
  const [state, dispatch] = useReducer(newspapersReducer, initialState);
  const actions = createActions(dispatch);
  
  // 引用
  const issuesCacheRef = useRef<Map<number, IssueItem[]>>(new Map());
  const selectedPublicationRef = useRef<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  
  // ====================
  // 副作用和事件监听
  // ====================
  
  /**
   * 移动端检测和响应式布局管理
   */
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
      actions.setMobile(mobile);
      if (mobile) {
        actions.setSidebarOpen(false);
        actions.setDrawerOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [actions]);

  /**
   * 移动端返回键处理
   */
  useEffect(() => {
    if (!state.isMobile) return;
    
    const handlePopState = (e: PopStateEvent) => {
      if (state.drawerOpen) {
        e.preventDefault();
        actions.setDrawerOpen(false);
        window.history.pushState(null, '', window.location.pathname);
      }
    };

    if (state.drawerOpen) {
      window.history.pushState(null, '', window.location.pathname);
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [state.isMobile, state.drawerOpen, actions]);

  /**
   * 初始化加载刊物列表
   */
  useEffect(() => {
    const loadPublications = async () => {
      try {
        actions.setLoading(true);
        actions.setError(null);
        const publicationsData = await NewspaperService.getPublications();
        actions.setPublications(publicationsData);
      } catch (err) {
        actions.setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        actions.setLoading(false);
      }
    };

    loadPublications();
  }, [actions]);

  /**
   * 查看器 iframe 加载
   */
  useEffect(() => {
    if (!state.manifestUrl || state.loading) return;

    const timestamp = Date.now();
    const iframeSrc = `/uv_simple.html?v=${timestamp}#?iiifManifestId=${encodeURIComponent(state.manifestUrl)}&embedded=true`;
    
    if (iframeRef.current) {
      iframeRef.current.src = iframeSrc;
    }
  }, [state.manifestUrl, state.loading]);

  /**
   * 键盘快捷键支持
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 左右箭头切换期数
      if (state.issues.length > 0 && state.selectedIssue) {
        const currentIndex = state.issues.findIndex(issue => issue.manifest === state.selectedIssue?.manifest);
        if (e.code === 'ArrowLeft' && currentIndex > 0) {
          handleIssueSelect(state.issues[currentIndex - 1]);
        } else if (e.code === 'ArrowRight' && currentIndex < state.issues.length - 1) {
          handleIssueSelect(state.issues[currentIndex + 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.issues, state.selectedIssue]);

  // ====================
  // 核心业务逻辑
  // ====================
  
  /**
   * 选择刊物并加载第一期
   */
  const handlePublicationSelect = useCallback(async (publication: PublicationItem) => {
    try {
      actions.setLoading(true);
      actions.setError(null);
      
      actions.setSelectedPublication(publication);
      selectedPublicationRef.current = publication.id;
      
      // 重置无限滚动状态
      actions.resetIssuesState();
      issuesCacheRef.current.clear();
      
      // 加载第一期期数
      const publicationId = publication.id;
      console.log('Debug: publication.id =', publicationId);
      
      const paginationParams: PaginationParams = {
        page: 0,
        limit: PAGINATION.DEFAULT_LIMIT
      };
      
      const response = await NewspaperService.getIssuesPaginated(publicationId, paginationParams);
      actions.setIssues(response.data);
      actions.setIssuesHasMore(response.hasMore);
      
      // 缓存第一期数据
      issuesCacheRef.current.set(0, response.data);
      
      // 自动选择第一期（如果有的话）
      if (response.data.length > 0) {
        const firstIssue = response.data[0];
        actions.setSelectedIssue(firstIssue);
        
        // 使用代理URL构建方式，避免CORS问题
        const proxyManifestUrl = NewspaperService.getProxyUrl(firstIssue.manifest);
        actions.setManifestUrl(proxyManifestUrl);
        
        if (onIssueSelect) {
          onIssueSelect(proxyManifestUrl, firstIssue.title);
        }
      } else {
        // 如果没有期数，清除选择
        actions.setSelectedIssue(null);
        actions.setManifestUrl('');
      }
      
      // 移动端自动打开期数抽屉
      if (state.isMobile) {
        actions.setDrawerMode('issues');
        actions.setDrawerOpen(true);
      }
      
      if (onPublicationSelect) {
        onPublicationSelect(publicationId, publication.title);
      }
    } catch (err) {
      actions.setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      actions.setLoading(false);
    }
  }, [state.isMobile, onPublicationSelect, onIssueSelect, actions]);

  /**
   * 加载更多期数（无限滚动）
   */
  const loadMoreIssues = useCallback(async () => {
    if (!selectedPublicationRef.current || state.issuesLoadingMore || !state.issuesHasMore || state.allIssuesLoaded) {
      return;
    }

    try {
      actions.setIssuesLoadingMore(true);
      actions.setIssuesError(null);

      const nextPage = state.issuesPage + 1;
      
      // 检查缓存
      if (issuesCacheRef.current.has(nextPage)) {
        const cachedIssues = issuesCacheRef.current.get(nextPage)!;
        actions.setIssues([...state.issues, ...cachedIssues]);
        actions.setIssuesPage(nextPage);
        actions.setIssuesLoadingMore(false);
        return;
      }

      const paginationParams: PaginationParams = {
        page: nextPage,
        limit: PAGINATION.DEFAULT_LIMIT
      };

      const response = await NewspaperService.getIssuesPaginated(
        selectedPublicationRef.current, 
        paginationParams
      );

      if (response.data.length > 0) {
        actions.setIssues([...state.issues, ...response.data]);
        actions.setIssuesPage(nextPage);
        actions.setIssuesHasMore(response.hasMore);
        
        // 缓存新数据
        issuesCacheRef.current.set(nextPage, response.data);

        // 如果没有更多数据了
        if (!response.hasMore) {
          actions.setAllIssuesLoaded(true);
        }
      } else {
        actions.setAllIssuesLoaded(true);
        actions.setIssuesHasMore(false);
      }
    } catch (err) {
      console.error('加载更多期数失败:', err);
      actions.setIssuesError(err instanceof Error ? err.message : '加载失败');
      actions.setIssuesRetryCount(state.issuesRetryCount + 1);
    } finally {
      actions.setIssuesLoadingMore(false);
    }
  }, [state.issuesPage, state.issuesLoadingMore, state.issuesHasMore, state.allIssuesLoaded, state.issues, state.issuesRetryCount, actions]);

  /**
   * 重试加载期数
   */
  const retryLoadMore = useCallback(() => {
    actions.setIssuesRetryCount(0);
    actions.setIssuesError(null);
    loadMoreIssues();
  }, [loadMoreIssues, actions]);

  /**
   * 加载查看器
   */
  const loadViewer = useCallback(async (issue: IssueItem) => {
    try {
      console.log('🔍 [DEBUG] 开始加载查看器:');
      console.log('🔍 [DEBUG] Issue:', issue);
      console.log('🔍 [DEBUG] issue.manifest:', issue.manifest);
      
      // Linus式设计：直接使用issue.manifest，它已经是完整的manifest URL
      const fullManifestUrl = issue.manifest;
      console.log('🔍 [DEBUG] 完整manifest URL:', fullManifestUrl);
      
      // 使用简化的代理处理
      const proxyManifestUrl = NewspaperService.getProxyUrl(fullManifestUrl);
      console.log('🔍 [DEBUG] 代理manifest URL:', proxyManifestUrl);
      
      actions.setManifestUrl(proxyManifestUrl);
      
      // 验证manifest是否可访问
      console.log('🔍 [DEBUG] 开始验证manifest可访问性...');
      const response = await fetch(proxyManifestUrl);
      console.log('🔍 [DEBUG] HTTP响应状态:', response.status);
      
      if (!response.ok) {
        console.error('🔍 [DEBUG] Manifest加载失败:', response.status, response.statusText);
        throw new Error(`Manifest加载失败: ${response.status} ${response.statusText}`);
      }
      
      console.log('🔍 [DEBUG] Manifest加载成功!');
    } catch (err) {
      console.error('🔍 [DEBUG] Viewer load error:', err);
      actions.setError(err instanceof Error ? err.message : '查看器加载失败');
    }
  }, [actions]);

  /**
   * 选择期数
   */
  const handleIssueSelect = useCallback(async (issue: IssueItem) => {
    if (!state.selectedPublication) return;
    
    try {
      actions.setLoading(true);
      actions.setError(null);
      
      actions.setSelectedIssue(issue);
      
      // 移动端自动关闭抽屉
      if (state.isMobile) {
        actions.setDrawerOpen(false);
      }
      
      const publicationId = state.selectedPublication.id;
      console.log('🔍 [DEBUG] 使用的publicationId:', publicationId);
      await loadViewer(issue);
      
      if (onIssueSelect) {
        onIssueSelect(issue.manifest);
      }
    } catch (err) {
      actions.setError(err instanceof Error ? err.message : '切换失败');
    } finally {
      actions.setLoading(false);
    }
  }, [state.selectedPublication, state.isMobile, onIssueSelect, loadViewer, actions]);

  // ====================
  // 触摸手势处理
  // ====================
  
  /**
   * 触摸开始
   */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!state.isMobile) return;
    actions.setTouchStartY(e.touches[0].clientY);
    actions.setTouchCurrentY(e.touches[0].clientY);
    actions.setIsDragging(true);
  }, [state.isMobile, actions]);

  /**
   * 触摸移动
   */
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!state.isMobile || !state.isDragging) return;
    
    const currentY = e.touches[0].clientY;
    actions.setTouchCurrentY(currentY);
    
    const deltaY = currentY - state.touchStartY;
    const drawer = drawerRef.current;
    
    if (drawer) {
      if (state.drawerOpen && deltaY > 0) {
        // 向下滑动关闭抽屉
        const progress = Math.min(deltaY / TOUCH_GESTURE.TRANSFORM_THRESHOLD, 1);
        drawer.style.transform = `translateY(${progress * 100}%)`;
      } else if (!state.drawerOpen && deltaY < -TOUCH_GESTURE.MIN_DRAG_DISTANCE) {
        // 向上滑动打开抽屉
        actions.setDrawerOpen(true);
      }
    }
  }, [state.isMobile, state.isDragging, state.touchStartY, state.drawerOpen, actions]);

  /**
   * 触摸结束
   */
  const handleTouchEnd = useCallback(() => {
    if (!state.isMobile || !state.isDragging) return;
    
    const deltaY = state.touchCurrentY - state.touchStartY;
    const drawer = drawerRef.current;
    
    if (drawer) {
      if (state.drawerOpen && deltaY > TOUCH_GESTURE.CLOSE_THRESHOLD) {
        // 滑动距离足够，关闭抽屉
        actions.setDrawerOpen(false);
      }
      
      // 重置位置
      drawer.style.transform = '';
    }
    
    actions.setIsDragging(false);
    actions.setTouchStartY(0);
    actions.setTouchCurrentY(0);
  }, [state.isMobile, state.isDragging, state.touchStartY, state.touchCurrentY, state.drawerOpen, actions]);

  // ====================
  // 面包屑导航处理
  // ====================
  
  /**
   * 返回根目录
   */
  const handleBreadcrumbRootSelect = useCallback(() => {
    actions.setSelectedPublication(null);
    actions.setSelectedIssue(null);
    actions.setIssues([]);
    actions.setManifestUrl('');
    actions.setDrawerOpen(false);
  }, [actions]);

  /**
   * 选择刊物（面包屑）
   */
  const handleBreadcrumbPublicationSelect = useCallback(async (publication: PublicationItem) => {
    try {
      actions.setLoading(true);
      actions.setError(null);
      
      actions.setSelectedPublication(publication);
      
      // 加载该刊物的期数列表
      const publicationId = publication.id;
      const issuesData = await NewspaperService.getIssues(publicationId);
      actions.setIssues(issuesData);
      
      // 清除期数选择
      actions.setSelectedIssue(null);
      actions.setManifestUrl('');
      actions.setDrawerOpen(false);
      
      if (onPublicationSelect) {
        onPublicationSelect(publicationId, publication.title);
      }
    } catch (err) {
      actions.setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      actions.setLoading(false);
    }
  }, [onPublicationSelect, actions]);

  /**
   * 选择期数（面包屑）
   */
  const handleBreadcrumbIssueSelect = useCallback(async (issue: IssueItem) => {
    if (!state.selectedPublication) return;
    
    try {
      actions.setLoading(true);
      actions.setError(null);
      
      actions.setSelectedIssue(issue);
      
      // 加载查看器
      await loadViewer(issue);
      actions.setDrawerOpen(false);
      
      if (onIssueSelect) {
        onIssueSelect(issue.manifest);
      }
    } catch (err) {
      actions.setError(err instanceof Error ? err.message : '切换失败');
    } finally {
      actions.setLoading(false);
    }
  }, [state.selectedPublication, onIssueSelect, loadViewer, actions]);

  // ====================
  // 抽屉控制
  // ====================
  
  /**
   * 打开刊物抽屉
   */
  const openPublicationsDrawer = useCallback(() => {
    actions.setDrawerMode('publications');
    actions.setDrawerOpen(true);
  }, [actions]);

  /**
   * 关闭抽屉
   */
  const closeDrawer = useCallback(() => {
    actions.setDrawerOpen(false);
  }, [actions]);

  // ====================
  // 子组件函数
  // ====================
  
  /**
   * 错误状态组件
   */
  const ErrorComponent = () => (
    <div className="newspapers-error">
      <div className="newspapers-error__content">
        <div className="newspapers-error__icon">❌</div>
        <h3 className="newspapers-error__title">加载失败</h3>
        <p className="newspapers-error__message">{state.error}</p>
        <div className="newspapers-error__actions">
          <button
            onClick={() => window.location.reload()}
            className="btn-newspapers"
          >
            重新加载
          </button>
        </div>
      </div>
    </div>
  );

  /**
   * 加载状态组件
   */
  const LoadingComponent = ({ message = "加载报刊数据..." }: { message?: string }) => (
    <div className="newspapers-loading">
      <div className="newspapers-loading__content">
        <div className="newspapers-loading__spinner"></div>
        <p className="newspapers-loading__text">{message}</p>
      </div>
    </div>
  );

  /**
   * 新布局工具栏组件
   */
  const NewLayoutToolbar = () => (
    <div className="newspapers-toolbar">
      <div className="newspapers-toolbar__left">
        {state.isMobile && (
          <button
            onClick={() => actions.setDrawerOpen(true)}
            className="newspapers-sidebar-toggle"
            aria-label="打开抽屉"
          >
            ☰
          </button>
        )}
        
        {state.selectedPublication && (
          <div className="newspapers-issue-selector">
            <label className="newspapers-issue-selector__label">
              期数：
            </label>
            <select
              value={state.selectedIssue?.manifest || ''}
              onChange={(e) => {
                const issue = state.issues.find(i => i.manifest === e.target.value);
                if (issue) handleIssueSelect(issue);
              }}
              className="newspapers-issue-selector__select"
              disabled={state.issues.length === 0}
            >
              {state.issues.length === 0 ? (
                <option value="">暂无期数</option>
              ) : (
                state.issues.map((issue) => (
                  <option key={issue.manifest} value={issue.manifest}>
                    {issue.title}
                  </option>
                ))
              )}
            </select>
          </div>
        )}
      </div>
      
      <div className="newspapers-toolbar__right">
        {state.issues.length > 1 && state.selectedIssue && !state.isMobile && (
          <div className="newspapers-issue-nav">
            <button
              onClick={() => {
                const currentIndex = state.issues.findIndex(issue => issue.manifest === state.selectedIssue?.manifest);
                if (currentIndex > 0) {
                  handleIssueSelect(state.issues[currentIndex - 1]);
                }
              }}
              disabled={state.issues.findIndex(issue => issue.manifest === state.selectedIssue?.manifest) === 0}
              className="newspapers-issue-nav__button"
            >
              上一期
            </button>
            <button
              onClick={() => {
                const currentIndex = state.issues.findIndex(issue => issue.manifest === state.selectedIssue?.manifest);
                if (currentIndex < state.issues.length - 1) {
                  handleIssueSelect(state.issues[currentIndex + 1]);
                }
              }}
              disabled={state.issues.findIndex(issue => issue.manifest === state.selectedIssue?.manifest) === state.issues.length - 1}
              className="newspapers-issue-nav__button"
            >
              下一期
            </button>
          </div>
        )}
      </div>
    </div>
  );

  /**
   * 新布局查看器容器组件
   */
  const NewLayoutViewerContainer = () => (
    <div className="newspapers-viewer-container">
      {state.loading && <LoadingComponent message="加载中..." />}
      
      {!state.selectedIssue ? (
        <EmptyState
          icon={
            <div className="newspapers-viewer-placeholder__icon">📖</div>
          }
          title="选择期数开始阅读"
          message="请从左侧选择一个期数开始阅读"
          className="newspapers-viewer-placeholder"
        />
      ) : (
        <iframe
          ref={iframeRef}
          className="newspapers-viewer__iframe"
          title="报刊查看器"
          allowFullScreen
          sandbox={IFRAME_SANDBOX}
        />
      )}
    </div>
  );

  /**
   * 新布局内容渲染函数
   */
  const renderNewLayoutContent = () => {
    if (state.loading && state.publications.length === 0) {
      return <LoadingComponent />;
    }

    return (
      <>
        <NewLayoutToolbar />
        
        {/* 主要内容区域 */}
        {state.selectedPublication ? (
          <NewLayoutViewerContainer />
        ) : (
          <NewspapersGuideArea />
        )}
      </>
    );
  };

  /**
   * 刊物列表组件
   */
  const PublicationList = () => (
    <div className="newspapers-publication-list">
      {state.publications.map((publication) => (
        <div
          key={publication.id}
          className={`newspapers-publication-item ${
            state.selectedPublication?.id === publication.id
              ? 'newspapers-publication-item--selected'
              : ''
          }`}
          onClick={() => handlePublicationSelect(publication)}
        >
          <h3 className="newspapers-publication__title">
            {publication.title}
          </h3>
          <p className="newspapers-publication__summary">
            {publication.summary || '暂无描述'}
          </p>
          <div className="newspapers-publication__meta">
            <span className="newspapers-publication__count">
              {publication.issueCount} 期
            </span>
            {publication.lastUpdated && (
              <span className="newspapers-publication__updated">
                最新: {publication.lastUpdated}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  /**
   * 移动端抽屉组件
   */
  const MobileDrawer = () => {
    if (!state.isMobile) return null;
    
    return (
      <>
        {/* 抽屉遮罩 */}
        {state.drawerOpen && (
          <div 
            className="newspapers-drawer-overlay"
            onClick={closeDrawer}
          />
        )}
        
        {/* 底部抽屉 */}
        <div 
          ref={drawerRef}
          className={`newspapers-drawer ${state.drawerOpen ? 'newspapers-drawer--open' : ''}`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="newspapers-drawer__header">
            <div className="newspapers-drawer__handle" />
            <h3 className="newspapers-drawer__title">
              {state.drawerMode === 'publications' ? '选择刊物' : state.selectedPublication?.title || '选择期数'}
            </h3>
            <button
              onClick={closeDrawer}
              className="newspapers-drawer__close"
              aria-label="关闭抽屉"
            >
              ✕
            </button>
          </div>
          
          <div className="newspapers-drawer__content newspapers-scrollbar-thin">
            {state.drawerMode === 'publications' ? (
              <PublicationList />
            ) : (
              <InfiniteScrollIssueList
                issues={state.issues}
                selectedIssue={state.selectedIssue}
                loading={state.issuesLoadingMore}
                hasMore={state.issuesHasMore}
                onLoadMore={loadMoreIssues}
                onIssueSelect={handleIssueSelect}
                error={state.issuesError}
                retryCount={state.issuesRetryCount}
                onRetry={retryLoadMore}
              />
            )}
          </div>
        </div>
      </>
    );
  };

  /**
   * 桌面端侧边栏组件
   */
  const DesktopSidebar = () => {
    if (state.isMobile) return null;
    
    return (
      <div className={`newspapers-sidebar ${state.sidebarOpen ? 'newspapers-sidebar--open' : ''}`}>
        <div className="newspapers-sidebar__header">
          <h2 className="newspapers-sidebar__title">报刊列表</h2>
          <button
            onClick={() => actions.setSidebarOpen(false)}
            className="newspapers-sidebar-toggle"
            aria-label="关闭侧边栏"
          >
            ✕
          </button>
        </div>
        
        <div className="newspapers-sidebar__content newspapers-scrollbar-thin">
          <PublicationList />
        </div>
      </div>
    );
  };

  /**
   * 原布局工具栏组件
   */
  const LegacyToolbar = () => (
    <div className="newspapers-toolbar">
      <div className="newspapers-toolbar__left">
        {state.isMobile && (
          <button
            onClick={openPublicationsDrawer}
            className="newspapers-sidebar-toggle"
            aria-label="打开刊物选择"
          >
            ☰
          </button>
        )}
        
        {state.selectedPublication && (
          <div className="newspapers-issue-selector">
            <label className="newspapers-issue-selector__label">
              期数：
            </label>
            <select
              value={state.selectedIssue?.manifest || ''}
              onChange={(e) => {
                const issue = state.issues.find(i => i.manifest === e.target.value);
                if (issue) handleIssueSelect(issue);
              }}
              className="newspapers-issue-selector__select"
              disabled={state.issues.length === 0}
            >
              {state.issues.length === 0 ? (
                <option value="">暂无期数</option>
              ) : (
                state.issues.map((issue) => (
                  <option key={issue.manifest} value={issue.manifest}>
                    {issue.title}
                  </option>
                ))
              )}
            </select>
          </div>
        )}
      </div>
      
      <div className="newspapers-toolbar__right">
        {state.issues.length > 1 && state.selectedIssue && !state.isMobile && (
          <div className="newspapers-issue-nav">
            <button
              onClick={() => {
                const currentIndex = state.issues.findIndex(issue => issue.manifest === state.selectedIssue?.manifest);
                if (currentIndex > 0) {
                  handleIssueSelect(state.issues[currentIndex - 1]);
                }
              }}
              disabled={state.issues.findIndex(issue => issue.manifest === state.selectedIssue?.manifest) === 0}
              className="newspapers-issue-nav__button"
            >
              上一期
            </button>
            <button
              onClick={() => {
                const currentIndex = state.issues.findIndex(issue => issue.manifest === state.selectedIssue?.manifest);
                if (currentIndex < state.issues.length - 1) {
                  handleIssueSelect(state.issues[currentIndex + 1]);
                }
              }}
              disabled={state.issues.findIndex(issue => issue.manifest === state.selectedIssue?.manifest) === state.issues.length - 1}
              className="newspapers-issue-nav__button"
            >
              下一期
            </button>
          </div>
        )}
        
        {!state.isMobile && (
          <button
            onClick={() => actions.setSidebarOpen(!state.sidebarOpen)}
            className="newspapers-sidebar-toggle"
            aria-label={state.sidebarOpen ? "关闭侧边栏" : "打开侧边栏"}
          >
            {state.sidebarOpen ? '◀' : '▶'}
          </button>
        )}
      </div>
    </div>
  );

  /**
   * 欢迎界面组件
   */
  const WelcomeScreen = () => (
    <div className="newspapers-welcome">
      <div className="newspapers-welcome__content">
        <div className="newspapers-welcome__icon">📰</div>
        <h2 className="newspapers-welcome__title">欢迎使用数字报刊</h2>
        <p className="newspapers-welcome__message">
          请从左侧选择一个刊物开始浏览
        </p>
        {state.isMobile && (
          <button
            onClick={openPublicationsDrawer}
            className="btn-newspapers"
          >
            选择刊物
          </button>
        )}
      </div>
    </div>
  );

  /**
   * 期数查看器组件
   */
  const IssueViewer = () => (
    <div className="newspapers-issue-viewer">
      {/* 移动端隐藏期数选择区域 */}
      {state.isMobile ? null : (
        <div className="newspapers-issue-selector">
          <div className="newspapers-issue-selector__header">
            <h3 className="newspapers-issue-selector__title">
              {state.selectedPublication?.title}
            </h3>
            <span className="newspapers-issue-selector__count">
              共 {state.issues.length} 期
            </span>
          </div>
          
          <InfiniteScrollIssueList
            issues={state.issues}
            selectedIssue={state.selectedIssue}
            loading={state.issuesLoadingMore}
            hasMore={state.issuesHasMore}
            onLoadMore={loadMoreIssues}
            onIssueSelect={handleIssueSelect}
            error={state.issuesError}
            retryCount={state.issuesRetryCount}
            onRetry={retryLoadMore}
          />
        </div>
      )}
      
      {/* 查看器区域 */}
      <div className="newspapers-viewer-container">
        {state.loading && <LoadingComponent message="加载中..." />}
        
        {!state.selectedIssue ? (
          <div className="newspapers-viewer-placeholder">
            <div className="newspapers-viewer-placeholder__content">
              <div className="newspapers-viewer-placeholder__icon">📖</div>
              <h3 className="newspapers-viewer-placeholder__title">
                选择期数开始阅读
              </h3>
              <p className="newspapers-viewer-placeholder__message">
                请从上方选择一个期数开始阅读
              </p>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            className="newspapers-viewer__iframe"
            title="报刊查看器"
            allowFullScreen
            sandbox={IFRAME_SANDBOX}
          />
        )}
      </div>
    </div>
  );

  /**
   * 主内容区域组件
   */
  const MainContent = () => (
    <div className="newspapers-content">
      {!state.selectedPublication ? (
        <WelcomeScreen />
      ) : (
        <IssueViewer />
      )}
    </div>
  );

  // ====================
  // 渲染逻辑
  // ====================
  
  // 错误状态处理
  if (state.error) {
    return <ErrorComponent />;
  }

  // 初始加载状态处理
  if (state.loading && state.publications.length === 0) {
    return <LoadingComponent />;
  }

  // 渐进式重构开关 - 使用新的Grid布局
  const useNewLayout = true;

  // 新布局渲染
  if (useNewLayout) {
    return (
      <NewspapersLayout
        publications={state.publications}
        selectedPublication={state.selectedPublication}
        selectedIssue={state.selectedIssue}
        onPublicationSelect={handlePublicationSelect}
        onIssueSelect={handleIssueSelect}
        onRootSelect={handleBreadcrumbRootSelect}
        isMobile={state.isMobile}
        issues={state.issues}
        loading={state.loading}
      >
        {/* 新布局的主内容区域 */}
        {renderNewLayoutContent()}
      </NewspapersLayout>
    );
  }

  // 原有的布局结构（保持兼容性）
  return (
    <div className="newspapers-integrated-container">
      <AppHeader moduleId="newspapers" />
      
      {/* 移动端抽屉 */}
      <MobileDrawer />
      
      {/* 面包屑导航 */}
      <NewspapersBreadcrumb
        publications={state.publications}
        selectedPublication={state.selectedPublication}
        selectedIssue={state.selectedIssue}
        onPublicationSelect={handleBreadcrumbPublicationSelect}
        onIssueSelect={handleBreadcrumbIssueSelect}
        onRootSelect={handleBreadcrumbRootSelect}
        isMobile={state.isMobile}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* 桌面端侧边栏 */}
        <DesktopSidebar />
        
        {/* 右侧主内容区域 */}
        <div className="newspapers-main">
          {/* 顶部工具栏 - 简化为核心控制 */}
          <LegacyToolbar />
          
          {/* 右侧内容区域 - 一体化布局 */}
          <MainContent />
        </div>
      </div>
    </div>
  );
};