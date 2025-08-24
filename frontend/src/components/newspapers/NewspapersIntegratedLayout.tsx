import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NewspaperService, PublicationItem, IssueItem } from './services';
import { IIIFUrlBuilder } from './utils';
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

  // 选择刊物并加载期数 - 一体化交互
  const handlePublicationSelect = useCallback(async (publication: PublicationItem) => {
    try {
      setLoading(true);
      setError(null);
      
      setSelectedPublication(publication);
      
      // 加载该刊物的期数列表 - publication.id已经是正确的ID，无需再次提取
      const publicationId = publication.id;
      console.log('Debug: publication.id =', publicationId); // 调试日志
      const issuesData = await NewspaperService.getIssues(publicationId);
      setIssues(issuesData);
      
      // 在一体化布局中，不自动选择期数，让用户在右侧选择
      setSelectedIssue(null);
      setManifestUrl('');
      
      if (onPublicationSelect) {
        onPublicationSelect(publicationId, publication.title);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [onPublicationSelect]);

  // 加载查看器 - 使用新的URL构建工具
  const loadViewer = useCallback(async (issue: IssueItem, publicationId: string) => {
    try {
      console.log('🔍 [DEBUG] 开始加载查看器:');
      console.log('🔍 [DEBUG] Issue:', issue);
      console.log('🔍 [DEBUG] publicationId:', publicationId);
      console.log('🔍 [DEBUG] issue.manifest:', issue.manifest);
      console.log('🔍 [DEBUG] issue.manifest 类型:', typeof issue.manifest);
      
      // 使用统一的URL构建工具
      let manifestUrl;
      
      if (issue.manifest.includes('collection.json')) {
        console.log('🔍 [DEBUG] 检测到collection.json，需要提取真正的manifest ID');
        const issueId = NewspaperService.extractIssueId(issue.manifest);
        console.log('🔍 [DEBUG] 提取的issueId:', issueId);
        
        if (!issueId) {
          console.error('🔍 [DEBUG] issueId为空，无法构建manifest URL');
          throw new Error('无法解析期数ID');
        }
        
        // 直接构建manifest URL，不经过collection
        manifestUrl = IIIFUrlBuilder.buildManifest(`${publicationId}/${issueId}`, { proxy: true });
      } else {
        console.log('🔍 [DEBUG] 尝试直接使用issue.manifest');
        
        try {
          // 首先尝试直接使用issue.manifest作为完整URL
          const components = IIIFUrlBuilder.parse(issue.manifest);
          console.log('🔍 [DEBUG] 解析的URL组件:', components);
          
          if (components.type === 'manifests' && components.resourcePath.includes('collection.json')) {
            console.log('🔍 [DEBUG] 检测到collection.json，需要转换为manifest');
            // 如果是collection.json，提取ID并构建manifest URL
            const collectionId = NewspaperService.extractPublicationId(components.resourcePath);
            if (collectionId && collectionId !== publicationId) {
              console.log('🔍 [DEBUG] 使用collectionId作为issueId:', collectionId);
              manifestUrl = IIIFUrlBuilder.buildManifest(`${publicationId}/${collectionId}`, { proxy: true });
            } else {
              console.log('🔍 [DEBUG] 无法从collection.json提取有效的issueId');
              throw new Error('无法从collection.json提取期数ID');
            }
          } else {
            manifestUrl = IIIFUrlBuilder.build(components, { proxy: true });
          }
        } catch (error) {
          console.log('🔍 [DEBUG] 解析失败，尝试构建新的URL:', error);
          // 如果解析失败，构建新的URL
          const issueId = NewspaperService.extractIssueId(issue.manifest);
          console.log('🔍 [DEBUG] 使用extractIssueId结果:', issueId);
          
          if (!issueId) {
            console.error('🔍 [DEBUG] issueId为空，无法构建manifest URL');
            throw new Error('无法解析期数 ID');
          }
          
          manifestUrl = IIIFUrlBuilder.buildManifest(`${publicationId}/${issueId}`, { proxy: true });
        }
      }
      
      console.log('🔍 [DEBUG] 最终manifest URL:', manifestUrl);
      
      // 验证URL格式
      if (!IIIFUrlBuilder.validate(manifestUrl)) {
        console.error('🔍 [DEBUG] 构建的URL格式无效:', manifestUrl);
        throw new Error('构建的manifest URL格式无效');
      }
      
      // 修复URL中的常见问题
      const fixedUrl = IIIFUrlBuilder.fix(manifestUrl);
      console.log('🔍 [DEBUG] 修复后的URL:', fixedUrl);
      
      setManifestUrl(fixedUrl);
      
      // 验证manifest是否可访问
      console.log('🔍 [DEBUG] 开始验证manifest可访问性...');
      const response = await fetch(fixedUrl);
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

  // 选择期数 - 直接切换，无需额外确认
  const handleIssueSelect = useCallback(async (issue: IssueItem) => {
    if (!selectedPublication) return;
    
    try {
      setLoading(true);
      setError(null);
      
      setSelectedIssue(issue);
      
      // 直接加载查看器 - selectedPublication.id已经是正确的ID
      const publicationId = selectedPublication.id;
      console.log('🔍 [DEBUG] 使用的publicationId:', publicationId);
      await loadViewer(issue, publicationId);
      
      if (onIssueSelect) {
        // Linus式设计：直接使用manifest URL作为ID，避免复杂的提取逻辑
        onIssueSelect(issue.manifest);
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
        {/* 左侧刊物选择 - 一体化布局 */}
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
                      onClick={() => setSidebarOpen(true)}
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
                {/* 期数选择区域 */}
                <div className="newspapers-issue-selector">
                  <div className="newspapers-issue-selector__header">
                    <h3 className="newspapers-issue-selector__title">
                      {selectedPublication.title}
                    </h3>
                    <span className="newspapers-issue-selector__count">
                      共 {issues.length} 期
                    </span>
                  </div>
                  
                  <div className="newspapers-issue-list">
                    {issues.length === 0 ? (
                      <div className="newspapers-issue-list__empty">
                        <div className="newspapers-issue-list__empty-icon">📄</div>
                        <p>暂无期数</p>
                      </div>
                    ) : (
                      issues.map((issue) => (
                        <div
                          key={issue.manifest}
                          className={`newspapers-issue-item ${
                            selectedIssue?.manifest === issue.manifest
                              ? 'newspapers-issue-item--selected'
                              : ''
                          }`}
                          onClick={() => handleIssueSelect(issue)}
                        >
                          <div className="newspapers-issue-item__title">
                            {issue.title}
                          </div>
                          <div className="newspapers-issue-item__summary">
                            {issue.summary}
                          </div>
                          <div className="newspapers-issue-item__action">
                            <button className="newspapers-issue-item__button">
                              查看本期
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
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