import React, { useEffect, useCallback, useRef, useReducer, useMemo, memo } from 'react';
import { NewspaperService, PublicationItem, IssueItem, PaginationParams } from './services';
import { InfiniteScrollIssueList } from './InfiniteScrollIssueList';
import { NewspapersBreadcrumb } from './NewspapersBreadcrumb';
import AppHeader from '@/components/layout/header/AppHeader.tsx';
import NewspapersLayout from './NewspapersLayout.tsx';
import { EmptyState } from './EmptyState';
import { NewspapersGuideArea } from './NewspapersGuideArea';
import { useTouchDrawer } from '../../hooks/useTouchDrawer.ts';

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
 * 布局状态类型（UI相关）
 */
interface LayoutState {
  // 布局控制
  sidebarOpen: boolean;
  isMobile: boolean;
  manifestUrl: string;
  
  // 移动端抽屉状态
  drawerOpen: boolean;
  drawerMode: 'publications' | 'issues';
}

/**
 * 数据状态类型（数据相关）
 */
interface DataState {
  // 基础数据
  publications: PublicationItem[];
  selectedPublication: PublicationItem | null;
  selectedIssue: IssueItem | null;
  issues: IssueItem[];
  
  // 加载状态
  loading: boolean;
  error: string | null;
  
  // 无限滚动状态
  issuesPage: number;
  issuesHasMore: boolean;
  issuesLoadingMore: boolean;
  issuesError: string | null;
  issuesRetryCount: number;
  allIssuesLoaded: boolean;
}

/**
 * 布局状态操作类型
 */
type LayoutAction = 
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'SET_MOBILE'; payload: boolean }
  | { type: 'SET_MANIFEST_URL'; payload: string }
  | { type: 'SET_DRAWER_OPEN'; payload: boolean }
  | { type: 'SET_DRAWER_MODE'; payload: 'publications' | 'issues' }
  | { type: 'RESET_LAYOUT_STATE' };

/**
 * 数据状态操作类型
 */
type DataAction = 
  | { type: 'SET_PUBLICATIONS'; payload: PublicationItem[] }
  | { type: 'SET_SELECTED_PUBLICATION'; payload: PublicationItem | null }
  | { type: 'SET_SELECTED_ISSUE'; payload: IssueItem | null }
  | { type: 'SET_ISSUES'; payload: IssueItem[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ISSUES_PAGE'; payload: number }
  | { type: 'SET_ISSUES_HAS_MORE'; payload: boolean }
  | { type: 'SET_ISSUES_LOADING_MORE'; payload: boolean }
  | { type: 'SET_ISSUES_ERROR'; payload: string | null }
  | { type: 'SET_ISSUES_RETRY_COUNT'; payload: number }
  | { type: 'SET_ALL_ISSUES_LOADED'; payload: boolean }
  | { type: 'RESET_ISSUES_STATE' }
  | { type: 'RESET_DATA_STATE' };

// ====================
// 状态管理器
// ====================

/**
 * 布局状态初始值
 */
const initialLayoutState: LayoutState = {
  sidebarOpen: true,
  isMobile: false,
  manifestUrl: '',
  drawerOpen: false,
  drawerMode: 'publications',
};

/**
 * 数据状态初始值
 */
const initialDataState: DataState = {
  publications: [],
  selectedPublication: null,
  selectedIssue: null,
  issues: [],
  loading: false,
  error: null,
  issuesPage: 0,
  issuesHasMore: true,
  issuesLoadingMore: false,
  issuesError: null,
  issuesRetryCount: 0,
  allIssuesLoaded: false,
};

/**
 * 布局状态管理器
 */
const layoutReducer = (state: LayoutState, action: LayoutAction): LayoutState => {
  switch (action.type) {
    case 'SET_SIDEBAR_OPEN':
      return { ...state, sidebarOpen: action.payload };
    case 'SET_MOBILE':
      return { ...state, isMobile: action.payload };
    case 'SET_MANIFEST_URL':
      return { ...state, manifestUrl: action.payload };
    case 'SET_DRAWER_OPEN':
      return { ...state, drawerOpen: action.payload };
    case 'SET_DRAWER_MODE':
      return { ...state, drawerMode: action.payload };
    case 'RESET_LAYOUT_STATE':
      return { ...initialLayoutState };
    default:
      return state;
  }
};

/**
 * 数据状态管理器
 */
const dataReducer = (state: DataState, action: DataAction): DataState => {
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
    case 'RESET_DATA_STATE':
      return { ...initialDataState };
    default:
      return state;
  }
};

// ====================
// 提取的子组件
// ====================

/**
 * 错误状态组件
 */
const ErrorComponent = memo(() => (
  <div className="newspapers-error">
    <div className="newspapers-error__content">
      <div className="newspapers-error__icon">❌</div>
      <h3 className="newspapers-error__title">加载失败</h3>
      <p className="newspapers-error__message">请刷新页面重试</p>
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
));

/**
 * 加载状态组件
 */
const LoadingComponent = memo(({ message = "加载报刊数据..." }: { message?: string }) => (
  <div className="newspapers-loading">
    <div className="newspapers-loading__content">
      <div className="newspapers-loading__spinner"></div>
      <p className="newspapers-loading__text">{message}</p>
    </div>
  </div>
));

/**
 * 刊物列表组件
 */
const PublicationList = memo(({ 
  publications, 
  selectedPublication, 
  onPublicationSelect 
}: {
  publications: PublicationItem[];
  selectedPublication: PublicationItem | null;
  onPublicationSelect: (publication: PublicationItem) => void;
}) => (
  <div className="newspapers-publication-list">
    {publications.map((publication) => (
      <div
        key={publication.id}
        className={`newspapers-publication-item ${
          selectedPublication?.id === publication.id
            ? 'newspapers-publication-item--selected'
            : ''
        }`}
        onClick={() => onPublicationSelect(publication)}
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
));

/**
 * 移动端抽屉组件
 */
const MobileDrawer = memo(({ 
  isOpen, 
  mode, 
  selectedPublication, 
  publications, 
  issues, 
  selectedIssue, 
  loading, 
  hasMore, 
  error, 
  retryCount, 
  onClose, 
  onTouchStart, 
  onTouchMove, 
  onTouchEnd, 
  onPublicationSelect, 
  onIssueSelect, 
  onLoadMore, 
  onRetry 
}: {
  isOpen: boolean;
  mode: 'publications' | 'issues';
  selectedPublication: PublicationItem | null;
  publications: PublicationItem[];
  issues: IssueItem[];
  selectedIssue: IssueItem | null;
  loading: boolean;
  hasMore: boolean;
  error: string | null;
  retryCount: number;
  onClose: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onPublicationSelect: (publication: PublicationItem) => void;
  onIssueSelect: (issue: IssueItem) => void;
  onLoadMore: () => void;
  onRetry: () => void;
}) => {
  return (
    <>
      {/* 抽屉遮罩 */}
      {isOpen && (
        <div 
          className="newspapers-drawer-overlay"
          onClick={onClose}
        />
      )}
      
      {/* 底部抽屉 */}
      <div 
        className={`newspapers-drawer ${isOpen ? 'newspapers-drawer--open' : ''}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="newspapers-drawer__header">
          <div className="newspapers-drawer__handle" />
          <h3 className="newspapers-drawer__title">
            {mode === 'publications' ? '选择刊物' : selectedPublication?.title || '选择期数'}
          </h3>
          <button
            onClick={onClose}
            className="newspapers-drawer__close"
            aria-label="关闭抽屉"
          >
            ✕
          </button>
        </div>
        
        <div className="newspapers-drawer__content newspapers-scrollbar-thin">
          {mode === 'publications' ? (
            <PublicationList 
              publications={publications}
              selectedPublication={selectedPublication}
              onPublicationSelect={onPublicationSelect}
            />
          ) : (
            <InfiniteScrollIssueList
              issues={issues}
              selectedIssue={selectedIssue}
              loading={loading}
              hasMore={hasMore}
              onLoadMore={onLoadMore}
              onIssueSelect={onIssueSelect}
              error={error}
              retryCount={retryCount}
              onRetry={onRetry}
            />
          )}
        </div>
      </div>
    </>
  );
});

/**
 * 桌面端侧边栏组件
 */
const DesktopSidebar = memo(({ 
  isOpen, 
  publications, 
  selectedPublication, 
  onPublicationSelect, 
  onClose 
}: {
  isOpen: boolean;
  publications: PublicationItem[];
  selectedPublication: PublicationItem | null;
  onPublicationSelect: (publication: PublicationItem) => void;
  onClose: () => void;
}) => (
  <div className={`newspapers-sidebar ${isOpen ? 'newspapers-sidebar--open' : ''}`}>
    <div className="newspapers-sidebar__header">
      <h2 className="newspapers-sidebar__title">报刊列表</h2>
      <button
        onClick={onClose}
        className="newspapers-sidebar-toggle"
        aria-label="关闭侧边栏"
      >
        ✕
      </button>
    </div>
    
    <div className="newspapers-sidebar__content newspapers-scrollbar-thin">
      <PublicationList 
        publications={publications}
        selectedPublication={selectedPublication}
        onPublicationSelect={onPublicationSelect}
      />
    </div>
  </div>
));

/**
 * 欢迎界面组件
 */
const WelcomeScreen = memo(({ onOpenPublications }: { onOpenPublications: () => void }) => (
  <div className="newspapers-welcome">
    <div className="newspapers-welcome__content">
      <div className="newspapers-welcome__icon">📰</div>
      <h2 className="newspapers-welcome__title">欢迎使用数字报刊</h2>
      <p className="newspapers-welcome__message">
        请从左侧选择一个刊物开始浏览
      </p>
      <button
        onClick={onOpenPublications}
        className="btn-newspapers"
      >
        选择刊物
      </button>
    </div>
  </div>
));

/**
 * 新布局工具栏组件
 */
const NewLayoutToolbar = memo(({ 
  isMobile, 
  selectedPublication, 
  selectedIssue, 
  issues, 
  onToggleDrawer, 
  onIssueSelect 
}: {
  isMobile: boolean;
  selectedPublication: PublicationItem | null;
  selectedIssue: IssueItem | null;
  issues: IssueItem[];
  onToggleDrawer: () => void;
  onIssueSelect: (issue: IssueItem) => void;
}) => (
  <div className="newspapers-toolbar">
    <div className="newspapers-toolbar__left">
      {isMobile && (
        <button
          onClick={onToggleDrawer}
          className="newspapers-sidebar-toggle"
          aria-label="打开抽屉"
        >
          ☰
        </button>
      )}
      
      {selectedPublication && (
        <div className="newspapers-issue-selector">
          <label className="newspapers-issue-selector__label">
            期数：
          </label>
          <select
            value={selectedIssue?.manifest || ''}
            onChange={(e) => {
              const issue = issues.find(i => i.manifest === e.target.value);
              if (issue) onIssueSelect(issue);
            }}
            className="newspapers-issue-selector__select"
            disabled={issues.length === 0}
          >
            {issues.length === 0 ? (
              <option value="">暂无期数</option>
            ) : (
              issues.map((issue) => (
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
      {issues.length > 1 && selectedIssue && !isMobile && (
        <div className="newspapers-issue-nav">
          <button
            onClick={() => {
              const currentIndex = issues.findIndex(issue => issue.manifest === selectedIssue?.manifest);
              if (currentIndex > 0) {
                onIssueSelect(issues[currentIndex - 1]);
              }
            }}
            disabled={issues.findIndex(issue => issue.manifest === selectedIssue?.manifest) === 0}
            className="newspapers-issue-nav__button"
          >
            上一期
          </button>
          <button
            onClick={() => {
              const currentIndex = issues.findIndex(issue => issue.manifest === selectedIssue?.manifest);
              if (currentIndex < issues.length - 1) {
                onIssueSelect(issues[currentIndex + 1]);
              }
            }}
            disabled={issues.findIndex(issue => issue.manifest === selectedIssue?.manifest) === issues.length - 1}
            className="newspapers-issue-nav__button"
          >
            下一期
          </button>
        </div>
      )}
    </div>
  </div>
));

/**
 * 新布局查看器容器组件
 */
const NewLayoutViewerContainer = memo(({ 
  loading, 
  selectedIssue, 
  iframeRef 
}: {
  loading: boolean;
  selectedIssue: IssueItem | null;
  iframeRef: React.RefObject<HTMLIFrameElement>;
}) => (
  <div className="newspapers-viewer-container">
    {loading && <LoadingComponent message="加载中..." />}
    
    {!selectedIssue ? (
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
));

/**
 * 原布局工具栏组件
 */
const LegacyToolbar = memo(({ 
  isMobile, 
  selectedPublication, 
  selectedIssue, 
  issues, 
  onOpenPublicationsDrawer, 
  onIssueSelect, 
  onToggleSidebar, 
  sidebarOpen 
}: {
  isMobile: boolean;
  selectedPublication: PublicationItem | null;
  selectedIssue: IssueItem | null;
  issues: IssueItem[];
  onOpenPublicationsDrawer: () => void;
  onIssueSelect: (issue: IssueItem) => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}) => (
  <div className="newspapers-toolbar">
    <div className="newspapers-toolbar__left">
      {isMobile && (
        <button
          onClick={onOpenPublicationsDrawer}
          className="newspapers-sidebar-toggle"
          aria-label="打开刊物选择"
        >
          ☰
        </button>
      )}
      
      {selectedPublication && (
        <div className="newspapers-issue-selector">
          <label className="newspapers-issue-selector__label">
            期数：
          </label>
          <select
            value={selectedIssue?.manifest || ''}
            onChange={(e) => {
              const issue = issues.find(i => i.manifest === e.target.value);
              if (issue) onIssueSelect(issue);
            }}
            className="newspapers-issue-selector__select"
            disabled={issues.length === 0}
          >
            {issues.length === 0 ? (
              <option value="">暂无期数</option>
            ) : (
              issues.map((issue) => (
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
      {issues.length > 1 && selectedIssue && !isMobile && (
        <div className="newspapers-issue-nav">
          <button
            onClick={() => {
              const currentIndex = issues.findIndex(issue => issue.manifest === selectedIssue?.manifest);
              if (currentIndex > 0) {
                onIssueSelect(issues[currentIndex - 1]);
              }
            }}
            disabled={issues.findIndex(issue => issue.manifest === selectedIssue?.manifest) === 0}
            className="newspapers-issue-nav__button"
          >
            上一期
          </button>
          <button
            onClick={() => {
              const currentIndex = issues.findIndex(issue => issue.manifest === selectedIssue?.manifest);
              if (currentIndex < issues.length - 1) {
                onIssueSelect(issues[currentIndex + 1]);
              }
            }}
            disabled={issues.findIndex(issue => issue.manifest === selectedIssue?.manifest) === issues.length - 1}
            className="newspapers-issue-nav__button"
          >
            下一期
          </button>
        </div>
      )}
      
      {!isMobile && (
        <button
          onClick={onToggleSidebar}
          className="newspapers-sidebar-toggle"
          aria-label={sidebarOpen ? "关闭侧边栏" : "打开侧边栏"}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      )}
    </div>
  </div>
));

/**
 * 期数查看器组件
 */
const IssueViewer = memo(({ 
  isMobile, 
  selectedPublication, 
  issues, 
  selectedIssue, 
  loading, 
  issuesLoadingMore, 
  issuesHasMore, 
  issuesError, 
  issuesRetryCount, 
  iframeRef, 
  onIssueSelect, 
  onLoadMore, 
  onRetry 
}: {
  isMobile: boolean;
  selectedPublication: PublicationItem | null;
  issues: IssueItem[];
  selectedIssue: IssueItem | null;
  loading: boolean;
  issuesLoadingMore: boolean;
  issuesHasMore: boolean;
  issuesError: string | null;
  issuesRetryCount: number;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  onIssueSelect: (issue: IssueItem) => void;
  onLoadMore: () => void;
  onRetry: () => void;
}) => (
  <div className="newspapers-issue-viewer">
    {/* 移动端隐藏期数选择区域 */}
    {isMobile ? null : (
      <div className="newspapers-issue-selector">
        <div className="newspapers-issue-selector__header">
          <h3 className="newspapers-issue-selector__title">
            {selectedPublication?.title}
          </h3>
          <span className="newspapers-issue-selector__count">
            共 {issues.length} 期
          </span>
        </div>
        
        <InfiniteScrollIssueList
          issues={issues}
          selectedIssue={selectedIssue}
          loading={issuesLoadingMore}
          hasMore={issuesHasMore}
          onLoadMore={onLoadMore}
          onIssueSelect={onIssueSelect}
          error={issuesError}
          retryCount={issuesRetryCount}
          onRetry={onRetry}
        />
      </div>
    )}
    
    {/* 查看器区域 */}
    <div className="newspapers-viewer-container">
      {loading && <LoadingComponent message="加载中..." />}
      
      {!selectedIssue ? (
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
));

/**
 * 主内容区域组件
 */
const MainContent = memo(({ 
  selectedPublication, 
  isMobile, 
  selectedPublicationData, 
  issues, 
  selectedIssue, 
  loading, 
  issuesLoadingMore, 
  issuesHasMore, 
  issuesError, 
  issuesRetryCount, 
  iframeRef, 
  onIssueSelect, 
  onLoadMore, 
  onRetry 
}: {
  selectedPublication: PublicationItem | null;
  isMobile: boolean;
  selectedPublicationData: PublicationItem | null;
  issues: IssueItem[];
  selectedIssue: IssueItem | null;
  loading: boolean;
  issuesLoadingMore: boolean;
  issuesHasMore: boolean;
  issuesError: string | null;
  issuesRetryCount: number;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  onIssueSelect: (issue: IssueItem) => void;
  onLoadMore: () => void;
  onRetry: () => void;
}) => (
  <div className="newspapers-content">
    {!selectedPublication ? (
      <WelcomeScreen onOpenPublications={() => {}} />
    ) : (
      <IssueViewer
        isMobile={isMobile}
        selectedPublication={selectedPublicationData}
        issues={issues}
        selectedIssue={selectedIssue}
        loading={loading}
        issuesLoadingMore={issuesLoadingMore}
        issuesHasMore={issuesHasMore}
        issuesError={issuesError}
        issuesRetryCount={issuesRetryCount}
        iframeRef={iframeRef}
        onIssueSelect={onIssueSelect}
        onLoadMore={onLoadMore}
        onRetry={onRetry}
      />
    )}
  </div>
));

// ====================
// 工具函数
// ====================

/**
 * 创建状态操作函数
 */
/**
 * 创建布局状态操作函数
 */
const createLayoutActions = (dispatch: React.Dispatch<LayoutAction>) => ({
  setSidebarOpen: (open: boolean) => 
    dispatch({ type: 'SET_SIDEBAR_OPEN', payload: open }),
  setMobile: (mobile: boolean) => 
    dispatch({ type: 'SET_MOBILE', payload: mobile }),
  setManifestUrl: (url: string) => 
    dispatch({ type: 'SET_MANIFEST_URL', payload: url }),
  setDrawerOpen: (open: boolean) => 
    dispatch({ type: 'SET_DRAWER_OPEN', payload: open }),
  setDrawerMode: (mode: 'publications' | 'issues') => 
    dispatch({ type: 'SET_DRAWER_MODE', payload: mode }),
  resetLayoutState: () => 
    dispatch({ type: 'RESET_LAYOUT_STATE' }),
});

/**
 * 创建数据状态操作函数
 */
const createDataActions = (dispatch: React.Dispatch<DataAction>) => ({
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
  resetIssuesState: () => 
    dispatch({ type: 'RESET_ISSUES_STATE' }),
  resetDataState: () => 
    dispatch({ type: 'RESET_DATA_STATE' }),
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
  
  const [layoutState, layoutDispatch] = useReducer(layoutReducer, initialLayoutState);
  const [dataState, dataDispatch] = useReducer(dataReducer, initialDataState);
  
  const layoutActions = useMemo(() => createLayoutActions(layoutDispatch), [layoutDispatch]);
  const dataActions = useMemo(() => createDataActions(dataDispatch), [dataDispatch]);
  
  // 引用
  const issuesCacheRef = useRef<Map<number, IssueItem[]>>(new Map());
  const selectedPublicationRef = useRef<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  
  // 触摸手势处理
  const {
    touchStartY,
    touchCurrentY,
    isDragging,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useTouchDrawer({
    isMobile: layoutState.isMobile,
    drawerOpen: layoutState.drawerOpen,
    onDrawerOpen: layoutActions.setDrawerOpen,
    drawerRef,
  });
  
  // 合并状态和操作以保持向后兼容性
  const state = useMemo(() => ({
    ...layoutState,
    ...dataState,
    // 添加触摸手势状态
    touchStartY,
    touchCurrentY,
    isDragging,
  }), [layoutState, dataState, touchStartY, touchCurrentY, isDragging]);
  
  const actions = useMemo(() => ({
    ...layoutActions,
    ...dataActions
  }), [layoutActions, dataActions]);
  
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
  }, [state.issues, state.selectedIssue, handleIssueSelect]);

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
        {state.loading && state.publications.length === 0 ? (
          <LoadingComponent />
        ) : (
          <>
            <NewLayoutToolbar
              isMobile={state.isMobile}
              selectedPublication={state.selectedPublication}
              selectedIssue={state.selectedIssue}
              issues={state.issues}
              onToggleDrawer={() => actions.setDrawerOpen(true)}
              onIssueSelect={handleIssueSelect}
            />
            
            {/* 主要内容区域 */}
            {state.selectedPublication ? (
              <NewLayoutViewerContainer
                loading={state.loading}
                selectedIssue={state.selectedIssue}
                iframeRef={iframeRef}
              />
            ) : (
              <NewspapersGuideArea />
            )}
          </>
        )}
      </NewspapersLayout>
    );
  }

  // 原有的布局结构（保持兼容性）
  return (
    <div className="newspapers-integrated-container">
      <AppHeader moduleId="newspapers" />
      
      {/* 移动端抽屉 */}
      <MobileDrawer
        isOpen={state.drawerOpen}
        mode={state.drawerMode}
        selectedPublication={state.selectedPublication}
        publications={state.publications}
        issues={state.issues}
        selectedIssue={state.selectedIssue}
        loading={state.issuesLoadingMore}
        hasMore={state.issuesHasMore}
        error={state.issuesError}
        retryCount={state.issuesRetryCount}
        onClose={closeDrawer}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onPublicationSelect={handlePublicationSelect}
        onIssueSelect={handleIssueSelect}
        onLoadMore={loadMoreIssues}
        onRetry={retryLoadMore}
      />
      
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
        <DesktopSidebar
          isOpen={state.sidebarOpen}
          publications={state.publications}
          selectedPublication={state.selectedPublication}
          onPublicationSelect={handlePublicationSelect}
          onClose={() => actions.setSidebarOpen(false)}
        />
        
        {/* 右侧主内容区域 */}
        <div className="newspapers-main">
          {/* 顶部工具栏 - 简化为核心控制 */}
          <LegacyToolbar
            isMobile={state.isMobile}
            selectedPublication={state.selectedPublication}
            selectedIssue={state.selectedIssue}
            issues={state.issues}
            onOpenPublicationsDrawer={openPublicationsDrawer}
            onIssueSelect={handleIssueSelect}
            onToggleSidebar={() => actions.setSidebarOpen(!state.sidebarOpen)}
            sidebarOpen={state.sidebarOpen}
          />
          
          {/* 右侧内容区域 - 一体化布局 */}
          <MainContent
            selectedPublication={state.selectedPublication}
            isMobile={state.isMobile}
            selectedPublicationData={state.selectedPublication}
            issues={state.issues}
            selectedIssue={state.selectedIssue}
            loading={state.loading}
            issuesLoadingMore={state.issuesLoadingMore}
            issuesHasMore={state.issuesHasMore}
            issuesError={state.issuesError}
            issuesRetryCount={state.issuesRetryCount}
            iframeRef={iframeRef}
            onIssueSelect={handleIssueSelect}
            onLoadMore={loadMoreIssues}
            onRetry={retryLoadMore}
          />
        </div>
      </div>
    </div>
  );
};
