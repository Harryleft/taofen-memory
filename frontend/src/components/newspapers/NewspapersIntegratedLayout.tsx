import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NewspaperService, PublicationItem, IssueItem } from './services';
import AppHeader from '@/components/layout/header/AppHeader.tsx';

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
  
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 检测移动端和响应式处理
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // 选择刊物并加载期数 - 消除多层选择
  const handlePublicationSelect = useCallback(async (publication: PublicationItem) => {
    try {
      setLoading(true);
      setError(null);
      
      setSelectedPublication(publication);
      
      // 加载该刊物的期数列表
      const publicationId = NewspaperService.extractPublicationId(publication.id);
      const issuesData = await NewspaperService.getIssues(publicationId);
      setIssues(issuesData);
      
      // 自动选择第一个期数
      if (issuesData.length > 0) {
        const firstIssue = issuesData[0];
        setSelectedIssue(firstIssue);
        
        // 直接加载查看器
        await loadViewer(firstIssue, publicationId);
        
        if (onIssueSelect) {
          const issueId = NewspaperService.extractIssueId(firstIssue.manifest);
          onIssueSelect(issueId);
        }
      }
      
      if (onPublicationSelect) {
        onPublicationSelect(publicationId, publication.title);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [onPublicationSelect, onIssueSelect]);

  // 加载查看器 - 简化逻辑
  const loadViewer = useCallback(async (issue: IssueItem, publicationId: string) => {
    try {
      const issueId = NewspaperService.extractIssueId(issue.manifest);
      
      // 直接构建manifest URL，消除特殊情况
      const fullManifestUrl = issue.manifest.startsWith('http') 
        ? issue.manifest 
        : `https://www.ai4dh.cn/iiif/3/manifests/${publicationId}/${issueId}/manifest.json`;
      
      const proxyManifestUrl = NewspaperService.getProxyUrl(fullManifestUrl);
      setManifestUrl(proxyManifestUrl);
      
      // 验证manifest是否可访问
      const response = await fetch(proxyManifestUrl);
      if (!response.ok) {
        throw new Error(`Manifest加载失败: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '查看器加载失败');
    }
  }, []);

  // 选择期数 - 直接切换，无需额外确认
  const handleIssueSelect = useCallback(async (issue: IssueItem) => {
    if (!selectedPublication) return;
    
    try {
      setLoading(true);
      setError(null);
      
      setSelectedIssue(issue);
      
      // 直接加载查看器
      await loadViewer(issue, NewspaperService.extractPublicationId(selectedPublication.id));
      
      if (onIssueSelect) {
        const issueId = NewspaperService.extractIssueId(issue.manifest);
        onIssueSelect(issueId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '切换失败');
    } finally {
      setLoading(false);
    }
  }, [selectedPublication, onIssueSelect, loadViewer]);

  // 加载查看器iframe
  useEffect(() => {
    if (!manifestUrl || loading) return;

    const timestamp = Date.now();
    const iframeSrc = `/uv_simple.html?v=${timestamp}#?iiifManifestId=${encodeURIComponent(manifestUrl)}&embedded=true`;
    
    if (iframeRef.current) {
      iframeRef.current.src = iframeSrc;
    }
  }, [manifestUrl, loading]);

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

  return (
    <div className="newspapers-integrated-container">
      <AppHeader moduleId="newspapers" />
      
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧刊物选择 - 简化为单一列表 */}
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
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* 右侧主内容区域 */}
        <div className="newspapers-main">
          {/* 顶部工具栏 - 简化为核心控制 */}
          <div className="newspapers-toolbar">
            <div className="newspapers-toolbar__left">
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="newspapers-sidebar-toggle"
                  aria-label="打开侧边栏"
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
          
          {/* 查看器区域 */}
          <div className="newspapers-viewer">
            {!selectedPublication ? (
              <div className="newspapers-empty">
                <div className="newspapers-empty__content">
                  <div className="newspapers-empty__icon">📰</div>
                  <h2 className="newspapers-empty__title">欢迎使用数字报刊</h2>
                  <p className="newspapers-empty__message">
                    请从左侧选择一个刊物开始浏览
                  </p>
                  {isMobile && (
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="btn-newspapers"
                    >
                      选择刊物
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {loading && (
                  <div className="newspapers-loading">
                    <div className="newspapers-loading__content">
                      <div className="newspapers-loading__spinner"></div>
                      <p className="newspapers-loading__text">加载中...</p>
                    </div>
                  </div>
                )}
                
                <iframe
                  ref={iframeRef}
                  className="newspapers-viewer__iframe"
                  title="报刊查看器"
                  allowFullScreen
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};