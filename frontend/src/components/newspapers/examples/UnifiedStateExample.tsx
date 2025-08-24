/**
 * 使用示例 - 展示如何使用新的统一状态管理
 * 
 * Linus设计原则：
 * - 代码应该自解释
 * - 避免魔法数字和字符串
 * - 使用明确的类型和常量
 */

import React from 'react';
import { 
  NewspapersAppProvider, 
  useNewspapersApp, 
  useNewspapersState, 
  useNewspapersDerived,
  useNewspapersActions,
  NewspapersApiService,
  createNewspapersConfig,
  debugLog
} from './index';

// ==================== 配置示例 ====================

const config = createNewspapersConfig({
  enableCache: true,
  cacheTtl: 10 * 60 * 1000, // 10分钟缓存
  enableDebug: true,
  autoLoadPublications: true,
  defaultSettings: {
    theme: 'light',
    zoomLevel: 1,
    viewMode: 'double',
    autoRotate: false
  }
});

// ==================== 应用入口示例 ====================

function NewspapersApp() {
  return (
    <NewspapersAppProvider>
      <NewspapersLayout />
    </NewspapersAppProvider>
  );
}

// ==================== 布局组件示例 ====================

function NewspapersLayout() {
  const { state, derived, actions } = useNewspapersApp();
  
  debugLog('NewspapersLayout', '渲染', { 
    view: state.currentView,
    loading: state.loadingState,
    selectedPublication: derived.selectedPublication?.title 
  });
  
  return (
    <div className="newspapers-layout">
      <Header />
      <div className="main-content">
        {state.currentView === 'catalog' ? (
          <CatalogView />
        ) : (
          <ViewerView />
        )}
      </div>
    </div>
  );
}

// ==================== 头部组件示例 ====================

function Header() {
  const { state, actions } = useNewspapersApp();
  
  return (
    <header className="newspapers-header">
      <div className="header-content">
        <h1>数字报刊</h1>
        <div className="header-actions">
          <SearchBox />
          <SortSelector />
          <ViewToggle />
        </div>
      </div>
    </header>
  );
}

// ==================== 搜索组件示例 ====================

function SearchBox() {
  const { state, actions } = useNewspapersApp();
  
  return (
    <div className="search-box">
      <input
        type="text"
        placeholder="搜索刊物..."
        value={state.searchTerm}
        onChange={(e) => actions.setSearchTerm(e.target.value)}
      />
    </div>
  );
}

// ==================== 排序选择器示例 ====================

function SortSelector() {
  const { state, actions } = useNewspapersApp();
  
  return (
    <select
      value={state.sortOptions.field}
      onChange={(e) => actions.setSortBy({
        field: e.target.value as any,
        direction: 'asc'
      })}
    >
      <option value="title">按名称</option>
      <option value="date">按日期</option>
      <option value="issueCount">按期数</option>
    </select>
  );
}

// ==================== 视图切换示例 ====================

function ViewToggle() {
  const { state, actions } = useNewspapersApp();
  
  return (
    <div className="view-toggle">
      <button
        className={state.currentView === 'catalog' ? 'active' : ''}
        onClick={() => actions.setCurrentView('catalog')}
      >
        目录
      </button>
      <button
        className={state.currentView === 'viewer' ? 'active' : ''}
        onClick={() => actions.setCurrentView('viewer')}
      >
        查看
      </button>
    </div>
  );
}

// ==================== 目录视图示例 ====================

function CatalogView() {
  const { derived, actions } = useNewspapersApp();
  
  if (derived.isLoading) {
    return <div className="loading">加载中...</div>;
  }
  
  if (derived.errorMessage) {
    return (
      <div className="error">
        <p>{derived.errorMessage}</p>
        <button onClick={actions.clearError}>重试</button>
      </div>
    );
  }
  
  return (
    <div className="catalog-view">
      <PublicationList />
      <IssueList />
    </div>
  );
}

// ==================== 刊物列表示例 ====================

function PublicationList() {
  const { derived, actions } = useNewspapersApp();
  
  return (
    <div className="publication-list">
      <h2>刊物列表</h2>
      <div className="publications-grid">
        {derived.filteredPublications.map(publication => (
          <PublicationCard 
            key={publication.id}
            publication={publication}
            isSelected={derived.selectedPublication?.id === publication.id}
            onSelect={() => actions.selectPublication(publication.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ==================== 刊物卡片示例 ====================

interface PublicationCardProps {
  publication: any;
  isSelected: boolean;
  onSelect: () => void;
}

function PublicationCard({ publication, isSelected, onSelect }: PublicationCardProps) {
  return (
    <div 
      className={`publication-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <div className="publication-cover">
        <img 
          src={`/api/placeholder/120/160`} 
          alt={publication.title}
        />
      </div>
      <div className="publication-info">
        <h3>{publication.title}</h3>
        <p>{publication.issueCount} 期</p>
        <p>{publication.lastUpdated || '未知日期'}</p>
      </div>
    </div>
  );
}

// ==================== 期数列表示例 ====================

function IssueList() {
  const { state, derived, actions } = useNewspapersApp();
  
  if (!derived.selectedPublication) {
    return null;
  }
  
  return (
    <div className="issue-list">
      <h2>{derived.selectedPublication.title} - 期数列表</h2>
      <div className="issues-grid">
        {state.issues.map(issue => (
          <IssueCard 
            key={issue.id}
            issue={issue}
            isSelected={derived.selectedIssue?.id === issue.id}
            onSelect={() => actions.selectIssue(issue.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ==================== 期数卡片示例 ====================

interface IssueCardProps {
  issue: any;
  isSelected: boolean;
  onSelect: () => void;
}

function IssueCard({ issue, isSelected, onSelect }: IssueCardProps) {
  return (
    <div 
      className={`issue-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <h3>{issue.title}</h3>
      <p>{issue.summary}</p>
    </div>
  );
}

// ==================== 查看器视图示例 ====================

function ViewerView() {
  const { derived, actions } = useNewspapersApp();
  
  if (!derived.selectedPublication || !derived.selectedIssue) {
    return (
      <div className="viewer-placeholder">
        <p>请选择一个期数进行查看</p>
        <button onClick={() => actions.setCurrentView('catalog')}>
          返回目录
        </button>
      </div>
    );
  }
  
  return (
    <div className="viewer-view">
      <ViewerHeader />
      <ViewerContent />
      <ViewerControls />
    </div>
  );
}

// ==================== 查看器头部示例 ====================

function ViewerHeader() {
  const { derived, actions } = useNewspapersApp();
  
  return (
    <div className="viewer-header">
      <button onClick={() => actions.setCurrentView('catalog')}>
        ← 返回
      </button>
      <h2>
        {derived.selectedPublication?.title} - {derived.selectedIssue?.title}
      </h2>
    </div>
  );
}

// ==================== 查看器内容示例 ====================

function ViewerContent() {
  const { state } = useNewspapersApp();
  
  if (!state.manifestUrl) {
    return <div className="loading">加载中...</div>;
  }
  
  return (
    <div className="viewer-content">
      {/* 这里可以集成实际的IIIF查看器 */}
      <div className="viewer-placeholder">
        <p>IIIF查看器内容</p>
        <p>Manifest URL: {state.manifestUrl}</p>
      </div>
    </div>
  );
}

// ==================== 查看器控制示例 ====================

function ViewerControls() {
  const { state, actions } = useNewspapersApp();
  
  return (
    <div className="viewer-controls">
      <button onClick={() => actions.updateSettings({ zoomLevel: state.settings.zoomLevel + 0.1 })}>
        放大
      </button>
      <button onClick={() => actions.updateSettings({ zoomLevel: Math.max(0.1, state.settings.zoomLevel - 0.1) })}>
        缩小
      </button>
      <select
        value={state.settings.viewMode}
        onChange={(e) => actions.updateSettings({ viewMode: e.target.value as any })}
      >
        <option value="single">单页</option>
        <option value="double">双页</option>
        <option value="grid">网格</option>
      </select>
    </div>
  );
}

// ==================== 性能优化示例 ====================

// 使用选择器减少重渲染
function OptimizedPublicationList() {
  const publications = useNewspapersDerived(d => d.filteredPublications);
  const loading = useNewspapersState(s => s.loadingState);
  const selectPublication = useNewspapersActions(a => a.selectPublication);
  
  if (loading.status === 'loading') {
    return <div className="loading">加载中...</div>;
  }
  
  return (
    <div className="publication-list">
      {publications.map(publication => (
        <PublicationCard 
          key={publication.id}
          publication={publication}
          isSelected={false}
          onSelect={() => selectPublication(publication.id)}
        />
      ))}
    </div>
  );
}

// ==================== 错误边界示例 ====================

class NewspapersErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    debugLog('NewspapersErrorBoundary', '捕获错误', { error, errorInfo });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>出现错误</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            重试
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// ==================== 完整应用示例 ====================

function CompleteNewspapersApp() {
  return (
    <NewspapersErrorBoundary>
      <NewspapersAppProvider>
        <NewspapersApp />
      </NewspapersAppProvider>
    </NewspapersErrorBoundary>
  );
}

export default CompleteNewspapersApp;