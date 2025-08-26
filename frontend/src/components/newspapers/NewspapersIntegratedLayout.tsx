import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NewspaperService, PublicationItem, IssueItem, PaginationParams } from './services';
import { InfiniteScrollIssueList } from './InfiniteScrollIssueList';
import { NewspapersBreadcrumb } from './NewspapersBreadcrumb';
import AppHeader from '@/components/layout/header/AppHeader.tsx';
import NewspapersLayout from './NewspapersLayout.tsx';
import { EmptyState } from './EmptyState';
import { NewspapersGuideArea } from './NewspapersGuideArea';

interface NewspapersIntegratedLayoutProps {
  onPublicationSelect?: (publicationId: string, publicationTitle: string) => void;
  onIssueSelect?: (issueId: string) => void;
}

export const NewspapersIntegratedLayout: React.FC<NewspapersIntegratedLayoutProps> = ({
  onPublicationSelect,
  onIssueSelect
}) => {
  // 简化的状态管理 - 只保留必要状态
  const [publications, setPublications] = useState<PublicationItem[]>([]);
  const [selectedPublication, setSelectedPublication] = useState<PublicationItem | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<IssueItem | null>(null);
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [manifestUrl, setManifestUrl] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);
  
  // 无限滚动相关状态
  const [issuesPage, setIssuesPage] = useState(0);
  const [issuesHasMore, setIssuesHasMore] = useState(true);
  const [issuesLoadingMore, setIssuesLoadingMore] = useState(false);
  const [issuesError, setIssuesError] = useState<string | null>(null);
  const [issuesRetryCount, setIssuesRetryCount] = useState(0);
  const [allIssuesLoaded, setAllIssuesLoaded] = useState(false);
  
  // 期数缓存
  const issuesCacheRef = useRef<Map<number, IssueItem[]>>(new Map());
  const selectedPublicationRef = useRef<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'publications' | 'issues'>('publications');
  
  // 渐进式重构开关 - 使用新的Grid布局
  const useNewLayout = true;
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchCurrentY, setTouchCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // 移动端检测和抽屉状态管理
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
        setDrawerOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 移动端返回键处理
  useEffect(() => {
    if (!isMobile) return;
    
    const handlePopState = (e: PopStateEvent) => {
      if (drawerOpen) {
        e.preventDefault();
        setDrawerOpen(false);
        window.history.pushState(null, '', window.location.pathname);
      }
    };

    if (drawerOpen) {
      window.history.pushState(null, '', window.location.pathname);
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isMobile, drawerOpen]);

  // 加载刊物列表 - 简化为单一数据源
  useEffect(() => {
    const loadPublications = async () => {
      try {
        setLoading(true);
        setError(null);
        const publicationsData = await NewspaperService.getPublications();
        setPublications(publicationsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    loadPublications();
  }, []);

  // 选择刊物 - 移动端打开期数抽屉
  const handlePublicationSelect = useCallback(async (publication: PublicationItem) => {
    try {
      setLoading(true);
      setError(null);
      
      setSelectedPublication(publication);
      selectedPublicationRef.current = publication.id;
      
      // 重置无限滚动状态
      setIssuesPage(0);
      setIssuesHasMore(true);
      setIssuesLoadingMore(false);
      setIssuesError(null);
      setIssuesRetryCount(0);
      setAllIssuesLoaded(false);
      issuesCacheRef.current.clear();
      
      // 加载第一期期数
      const publicationId = publication.id;
      console.log('Debug: publication.id =', publicationId);
      
      const paginationParams: PaginationParams = {
        page: 0,
        limit: 20
      };
      
      const response = await NewspaperService.getIssuesPaginated(publicationId, paginationParams);
      setIssues(response.data);
      setIssuesHasMore(response.hasMore);
      
      // 缓存第一期数据
      issuesCacheRef.current.set(0, response.data);
      
      // 自动选择第一期（如果有的话）
      if (response.data.length > 0) {
        const firstIssue = response.data[0];
        setSelectedIssue(firstIssue);
        setManifestUrl(firstIssue.manifest);
        
        if (onIssueSelect) {
          onIssueSelect(firstIssue.manifest, firstIssue.title);
        }
      } else {
        // 如果没有期数，清除选择
        setSelectedIssue(null);
        setManifestUrl('');
      }
      
      // 移动端自动打开期数抽屉
      if (isMobile) {
        setDrawerMode('issues');
        setDrawerOpen(true);
      }
      
      if (onPublicationSelect) {
        onPublicationSelect(publicationId, publication.title);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [isMobile, onPublicationSelect, onIssueSelect]);

  // 加载更多期数
  const loadMoreIssues = useCallback(async () => {
    if (!selectedPublicationRef.current || issuesLoadingMore || !issuesHasMore || allIssuesLoaded) {
      return;
    }

    try {
      setIssuesLoadingMore(true);
      setIssuesError(null);

      const nextPage = issuesPage + 1;
      
      // 检查缓存
      if (issuesCacheRef.current.has(nextPage)) {
        const cachedIssues = issuesCacheRef.current.get(nextPage)!;
        setIssues(prev => [...prev, ...cachedIssues]);
        setIssuesPage(nextPage);
        setIssuesLoadingMore(false);
        return;
      }

      const paginationParams: PaginationParams = {
        page: nextPage,
        limit: 20
      };

      const response = await NewspaperService.getIssuesPaginated(
        selectedPublicationRef.current, 
        paginationParams
      );

      if (response.data.length > 0) {
        setIssues(prev => [...prev, ...response.data]);
        setIssuesPage(nextPage);
        setIssuesHasMore(response.hasMore);
        
        // 缓存新数据
        issuesCacheRef.current.set(nextPage, response.data);

        // 如果没有更多数据了
        if (!response.hasMore) {
          setAllIssuesLoaded(true);
        }
      } else {
        setAllIssuesLoaded(true);
        setIssuesHasMore(false);
      }
    } catch (err) {
      console.error('加载更多期数失败:', err);
      setIssuesError(err instanceof Error ? err.message : '加载失败');
      setIssuesRetryCount(prev => prev + 1);
    } finally {
      setIssuesLoadingMore(false);
    }
  }, [issuesPage, issuesLoadingMore, issuesHasMore, allIssuesLoaded]);

  // 重试加载
  const retryLoadMore = useCallback(() => {
    setIssuesRetryCount(0);
    setIssuesError(null);
    loadMoreIssues();
  }, [loadMoreIssues]);

  // 加载查看器 - Linus式简化设计
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
      
      setManifestUrl(proxyManifestUrl);
      
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
      setError(err instanceof Error ? err.message : '查看器加载失败');
    }
  }, []);

  // 选择期数 - 移动端自动关闭抽屉
  const handleIssueSelect = useCallback(async (issue: IssueItem) => {
    if (!selectedPublication) return;
    
    try {
      setLoading(true);
      setError(null);
      
      setSelectedIssue(issue);
      
      // 移动端自动关闭抽屉
      if (isMobile) {
        setDrawerOpen(false);
      }
      
      const publicationId = selectedPublication.id;
      console.log('🔍 [DEBUG] 使用的publicationId:', publicationId);
      await loadViewer(issue);
      
      if (onIssueSelect) {
        onIssueSelect(issue.manifest);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '切换失败');
    } finally {
      setLoading(false);
    }
  }, [selectedPublication, isMobile, onIssueSelect, loadViewer]);

  // 加载查看器iframe
  useEffect(() => {
    if (!manifestUrl || loading) return;

    const timestamp = Date.now();
    const iframeSrc = `/uv_simple.html?v=${timestamp}#?iiifManifestId=${encodeURIComponent(manifestUrl)}&embedded=true`;
    
    if (iframeRef.current) {
      iframeRef.current.src = iframeSrc;
    }
  }, [manifestUrl, loading]);

  // 触摸手势处理
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isMobile) return;
    setTouchStartY(e.touches[0].clientY);
    setTouchCurrentY(e.touches[0].clientY);
    setIsDragging(true);
  }, [isMobile]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isMobile || !isDragging) return;
    
    const currentY = e.touches[0].clientY;
    setTouchCurrentY(currentY);
    
    const deltaY = currentY - touchStartY;
    const drawer = drawerRef.current;
    
    if (drawer) {
      if (drawerOpen && deltaY > 0) {
        // 向下滑动关闭抽屉
        const progress = Math.min(deltaY / 200, 1);
        drawer.style.transform = `translateY(${progress * 100}%)`;
      } else if (!drawerOpen && deltaY < -50) {
        // 向上滑动打开抽屉
        setDrawerOpen(true);
      }
    }
  }, [isMobile, isDragging, touchStartY, drawerOpen]);

  const handleTouchEnd = useCallback(() => {
    if (!isMobile || !isDragging) return;
    
    const deltaY = touchCurrentY - touchStartY;
    const drawer = drawerRef.current;
    
    if (drawer) {
      if (drawerOpen && deltaY > 100) {
        // 滑动距离足够，关闭抽屉
        setDrawerOpen(false);
      }
      
      // 重置位置
      drawer.style.transform = '';
    }
    
    setIsDragging(false);
    setTouchStartY(0);
    setTouchCurrentY(0);
  }, [isMobile, isDragging, touchStartY, touchCurrentY, drawerOpen]);

  // 面包屑导航处理函数
  const handleBreadcrumbRootSelect = useCallback(() => {
    setSelectedPublication(null);
    setSelectedIssue(null);
    setIssues([]);
    setManifestUrl('');
    setDrawerOpen(false);
  }, []);

  // 面包屑导航选择刊物
  const handleBreadcrumbPublicationSelect = useCallback(async (publication: PublicationItem) => {
    try {
      setLoading(true);
      setError(null);
      
      setSelectedPublication(publication);
      
      // 加载该刊物的期数列表
      const publicationId = publication.id;
      const issuesData = await NewspaperService.getIssues(publicationId);
      setIssues(issuesData);
      
      // 清除期数选择
      setSelectedIssue(null);
      setManifestUrl('');
      setDrawerOpen(false);
      
      if (onPublicationSelect) {
        onPublicationSelect(publicationId, publication.title);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [onPublicationSelect]);

  // 面包屑导航选择期数
  const handleBreadcrumbIssueSelect = useCallback(async (issue: IssueItem) => {
    if (!selectedPublication) return;
    
    try {
      setLoading(true);
      setError(null);
      
      setSelectedIssue(issue);
      
      // 加载查看器
      await loadViewer(issue);
      setDrawerOpen(false);
      
      if (onIssueSelect) {
        onIssueSelect(issue.manifest);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '切换失败');
    } finally {
      setLoading(false);
    }
  }, [selectedPublication, onIssueSelect, loadViewer]);

  // 打开刊物抽屉
  const openPublicationsDrawer = useCallback(() => {
    setDrawerMode('publications');
    setDrawerOpen(true);
  }, []);

  // 关闭抽屉
  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  // 键盘快捷键 - 保持现有功能
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 左右箭头切换期数
      if (issues.length > 0 && selectedIssue) {
        const currentIndex = issues.findIndex(issue => issue.manifest === selectedIssue.manifest);
        if (e.code === 'ArrowLeft' && currentIndex > 0) {
          handleIssueSelect(issues[currentIndex - 1]);
        } else if (e.code === 'ArrowRight' && currentIndex < issues.length - 1) {
          handleIssueSelect(issues[currentIndex + 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [issues, selectedIssue, handleIssueSelect]);

  // 移动端自动关闭侧边栏逻辑已整合到主检测函数中

  // 错误状态处理
  if (error) {
    return (
      <div className="newspapers-error">
        <div className="newspapers-error__content">
          <div className="newspapers-error__icon">❌</div>
          <h3 className="newspapers-error__title">加载失败</h3>
          <p className="newspapers-error__message">{error}</p>
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
  }

  // 新布局的内容渲染函数
  const renderNewLayoutContent = () => {
    if (loading && publications.length === 0) {
      return (
        <div className="newspapers-loading">
          <div className="newspapers-loading__content">
            <div className="newspapers-loading__spinner"></div>
            <p className="newspapers-loading__text">加载报刊数据...</p>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* 工具栏 */}
        <div className="newspapers-toolbar">
          <div className="newspapers-toolbar__left">
            {isMobile && (
              <button
                onClick={() => setDrawerOpen(true)}
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
                    if (issue) handleIssueSelect(issue);
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
                    const currentIndex = issues.findIndex(issue => issue.manifest === selectedIssue.manifest);
                    if (currentIndex > 0) {
                      handleIssueSelect(issues[currentIndex - 1]);
                    }
                  }}
                  disabled={issues.findIndex(issue => issue.manifest === selectedIssue.manifest) === 0}
                  className="newspapers-issue-nav__button"
                >
                  上一期
                </button>
                <button
                  onClick={() => {
                    const currentIndex = issues.findIndex(issue => issue.manifest === selectedIssue.manifest);
                    if (currentIndex < issues.length - 1) {
                      handleIssueSelect(issues[currentIndex + 1]);
                    }
                  }}
                  disabled={issues.findIndex(issue => issue.manifest === selectedIssue.manifest) === issues.length - 1}
                  className="newspapers-issue-nav__button"
                >
                  下一期
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* 主要内容区域 */}
        {selectedPublication ? (
          // 选择刊物后的查看器区域
          <div className="newspapers-viewer-container">
            {loading && (
              <div className="newspapers-loading">
                <div className="newspapers-loading__content">
                  <div className="newspapers-loading__spinner"></div>
                  <p className="newspapers-loading__text">加载中...</p>
                </div>
              </div>
            )}
            
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
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation allow-modals"
              />
            )}
          </div>
        ) : (
          // 未选择刊物时显示引导区域
          <NewspapersGuideArea />
        )}
      </>
    );
  };

  // 加载状态处理
  if (loading && publications.length === 0) {
    return (
      <div className="newspapers-loading">
        <div className="newspapers-loading__content">
          <div className="newspapers-loading__spinner"></div>
          <p className="newspapers-loading__text">加载报刊数据...</p>
        </div>
      </div>
    );
  }

  // 渐进式重构：根据开关选择布局方式
  if (useNewLayout) {
    return (
      <NewspapersLayout
        publications={publications}
        selectedPublication={selectedPublication}
        selectedIssue={selectedIssue}
        onPublicationSelect={handlePublicationSelect}
        onIssueSelect={handleIssueSelect}
        onRootSelect={handleBreadcrumbRootSelect}
        isMobile={isMobile}
        issues={issues}
        loading={loading}
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
      {isMobile && (
        <>
          {/* 抽屉遮罩 */}
          {drawerOpen && (
            <div 
              className="newspapers-drawer-overlay"
              onClick={closeDrawer}
            />
          )}
          
          {/* 底部抽屉 */}
          <div 
            ref={drawerRef}
            className={`newspapers-drawer ${drawerOpen ? 'newspapers-drawer--open' : ''}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="newspapers-drawer__header">
              <div className="newspapers-drawer__handle" />
              <h3 className="newspapers-drawer__title">
                {drawerMode === 'publications' ? '选择刊物' : selectedPublication?.title || '选择期数'}
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
              {drawerMode === 'publications' ? (
                // 刊物列表
                <div className="newspapers-publication-list">
                  {publications.map((publication) => (
                    <div
                      key={publication.id}
                      className={`newspapers-publication-item ${
                        selectedPublication?.id === publication.id
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
              ) : (
                // 期数列表 - 无限滚动
                <InfiniteScrollIssueList
                  issues={issues}
                  selectedIssue={selectedIssue}
                  loading={issuesLoadingMore}
                  hasMore={issuesHasMore}
                  onLoadMore={loadMoreIssues}
                  onIssueSelect={handleIssueSelect}
                  error={issuesError}
                  retryCount={issuesRetryCount}
                  onRetry={retryLoadMore}
                />
              )}
            </div>
          </div>
        </>
      )}
      
      {/* 面包屑导航 */}
      <NewspapersBreadcrumb
        publications={publications}
        selectedPublication={selectedPublication}
        selectedIssue={selectedIssue}
        onPublicationSelect={handleBreadcrumbPublicationSelect}
        onIssueSelect={handleBreadcrumbIssueSelect}
        onRootSelect={handleBreadcrumbRootSelect}
        isMobile={isMobile}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* 桌面端侧边栏 */}
        {!isMobile && (
          <div className={`newspapers-sidebar ${sidebarOpen ? 'newspapers-sidebar--open' : ''}`}>
          <div className="newspapers-sidebar__header">
            <h2 className="newspapers-sidebar__title">报刊列表</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="newspapers-sidebar-toggle"
              aria-label="关闭侧边栏"
            >
              ✕
            </button>
          </div>
          
          <div className="newspapers-sidebar__content newspapers-scrollbar-thin">
            <div className="newspapers-publication-list">
              {publications.map((publication) => (
                <div
                  key={publication.id}
                  className={`newspapers-publication-item ${
                    selectedPublication?.id === publication.id
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
          </div>
          </div>
        )}
        
        {/* 右侧主内容区域 */}
        <div className="newspapers-main">
          {/* 顶部工具栏 - 简化为核心控制 */}
          <div className="newspapers-toolbar">
            <div className="newspapers-toolbar__left">
              {isMobile && (
                <button
                  onClick={openPublicationsDrawer}
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
                      if (issue) handleIssueSelect(issue);
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
                      const currentIndex = issues.findIndex(issue => issue.manifest === selectedIssue.manifest);
                      if (currentIndex > 0) {
                        handleIssueSelect(issues[currentIndex - 1]);
                      }
                    }}
                    disabled={issues.findIndex(issue => issue.manifest === selectedIssue.manifest) === 0}
                    className="newspapers-issue-nav__button"
                  >
                    上一期
                  </button>
                  <button
                    onClick={() => {
                      const currentIndex = issues.findIndex(issue => issue.manifest === selectedIssue.manifest);
                      if (currentIndex < issues.length - 1) {
                        handleIssueSelect(issues[currentIndex + 1]);
                      }
                    }}
                    disabled={issues.findIndex(issue => issue.manifest === selectedIssue.manifest) === issues.length - 1}
                    className="newspapers-issue-nav__button"
                  >
                    下一期
                  </button>
                </div>
              )}
              
              {!isMobile && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="newspapers-sidebar-toggle"
                  aria-label={sidebarOpen ? "关闭侧边栏" : "打开侧边栏"}
                >
                  {sidebarOpen ? '◀' : '▶'}
                </button>
              )}
            </div>
          </div>
          
          {/* 右侧内容区域 - 一体化布局 */}
          <div className="newspapers-content">
            {!selectedPublication ? (
              // 未选择刊物时的欢迎界面
              <div className="newspapers-welcome">
                <div className="newspapers-welcome__content">
                  <div className="newspapers-welcome__icon">📰</div>
                  <h2 className="newspapers-welcome__title">欢迎使用数字报刊</h2>
                  <p className="newspapers-welcome__message">
                    请从左侧选择一个刊物开始浏览
                  </p>
                  {isMobile && (
                    <button
                      onClick={openPublicationsDrawer}
                      className="btn-newspapers"
                    >
                      选择刊物
                    </button>
                  )}
                </div>
              </div>
            ) : (
              // 选择刊物后的期数选择和查看器区域
              <div className="newspapers-issue-viewer">
                {/* 移动端隐藏期数选择区域 */}
                {isMobile ? null : (
                  <div className="newspapers-issue-selector">
                    <div className="newspapers-issue-selector__header">
                      <h3 className="newspapers-issue-selector__title">
                        {selectedPublication.title}
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
                      onLoadMore={loadMoreIssues}
                      onIssueSelect={handleIssueSelect}
                      error={issuesError}
                      retryCount={issuesRetryCount}
                      onRetry={retryLoadMore}
                    />
                  </div>
                )}
                
                {/* 查看器区域 */}
                <div className="newspapers-viewer-container">
                  {loading && (
                    <div className="newspapers-loading">
                      <div className="newspapers-loading__content">
                        <div className="newspapers-loading__spinner"></div>
                        <p className="newspapers-loading__text">加载中...</p>
                      </div>
                    </div>
                  )}
                  
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
                      sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation allow-modals"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};