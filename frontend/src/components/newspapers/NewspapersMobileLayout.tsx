import React, { useState, useEffect, useCallback } from 'react';
import { NewspaperService, PublicationItem, IssueItem } from './services';

interface NewspapersMobileLayoutProps {
  onPublicationSelect?: (publicationId: string, publicationTitle: string) => void;
  onIssueSelect?: (issueId: string) => void;
}

export const NewspapersMobileLayout: React.FC<NewspapersMobileLayoutProps> = ({
  onPublicationSelect,
  onIssueSelect
}) => {
  const [publications, setPublications] = useState<PublicationItem[]>([]);
  const [selectedPublication, setSelectedPublication] = useState<PublicationItem | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<IssueItem | null>(null);
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPublications, setShowPublications] = useState(true);
  const [manifestUrl, setManifestUrl] = useState<string>('');

  // 加载刊物列表
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

  // 选择刊物
  const handlePublicationSelect = useCallback(async (publication: PublicationItem) => {
    try {
      setLoading(true);
      setError(null);
      
      setSelectedPublication(publication);
      
      // 加载期数
      const publicationId = NewspaperService.extractPublicationId(publication.id);
      const issuesData = await NewspaperService.getIssues(publicationId);
      setIssues(issuesData);
      
      // 自动选择第一个期数
      if (issuesData.length > 0) {
        const firstIssue = issuesData[0];
        setSelectedIssue(firstIssue);
        
        // 加载查看器
        await loadViewer(firstIssue, publicationId);
        
        if (onIssueSelect) {
          const issueId = NewspaperService.extractIssueId(firstIssue.manifest);
          onIssueSelect(issueId);
        }
      }
      
      if (onPublicationSelect) {
        onPublicationSelect(publicationId, publication.title);
      }
      
      // 切换到查看器
      setShowPublications(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [onPublicationSelect, onIssueSelect]);

  // 加载查看器
  const loadViewer = useCallback(async (issue: IssueItem, publicationId: string) => {
    try {
      const issueId = NewspaperService.extractIssueId(issue.manifest);
      
      let fullManifestUrl;
      if (issue.manifest.startsWith('http')) {
        fullManifestUrl = issue.manifest;
      } else {
        fullManifestUrl = `https://www.ai4dh.cn/iiif/3/manifests/${publicationId}/${issueId}/manifest.json`;
      }
      
      const proxyManifestUrl = NewspaperService.getProxyUrl(fullManifestUrl);
      setManifestUrl(proxyManifestUrl);
      
      const response = await fetch(proxyManifestUrl);
      if (!response.ok) {
        throw new Error(`Manifest加载失败: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '查看器加载失败');
    }
  }, []);

  // 选择期数
  const handleIssueSelect = useCallback(async (issue: IssueItem) => {
    if (!selectedPublication) return;
    
    try {
      setLoading(true);
      setError(null);
      
      setSelectedIssue(issue);
      
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

  // 返回刊物列表
  const handleBackToPublications = () => {
    setShowPublications(true);
    setSelectedPublication(null);
    setSelectedIssue(null);
    setIssues([]);
  };

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

  if (showPublications) {
    // 刊物列表视图
    return (
      <div className="newspapers-integrated-container">
        <div className="newspapers-main">
          <div className="newspapers-toolbar">
            <div className="newspapers-toolbar__left">
              <h1 className="newspapers-sidebar__title">数字报刊</h1>
            </div>
          </div>
          
          <div className="newspapers-viewer">
            <div className="newspapers-sidebar__content newspapers-scrollbar-thin">
              <div className="newspapers-publication-list">
                {publications.map((publication) => (
                  <div
                    key={publication.id}
                    className="newspapers-publication-item"
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
        </div>
      </div>
    );
  }

  // 查看器视图
  return (
    <div className="newspapers-integrated-container">
      <div className="newspapers-main">
        <div className="newspapers-toolbar">
          <div className="newspapers-toolbar__left">
            <button
              onClick={handleBackToPublications}
              className="newspapers-sidebar-toggle"
              aria-label="返回刊物列表"
            >
              ←
            </button>
            
            {selectedPublication && (
              <div className="newspapers-issue-selector">
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
        </div>
        
        <div className="newspapers-viewer">
          {loading && (
            <div className="newspapers-loading">
              <div className="newspapers-loading__content">
                <div className="newspapers-loading__spinner"></div>
                <p className="newspapers-loading__text">加载中...</p>
              </div>
            </div>
          )}
          
          {manifestUrl && (
            <iframe
              src={`/uv_simple.html?v=${Date.now()}#?iiifManifestId=${encodeURIComponent(manifestUrl)}&embedded=true`}
              className="newspapers-viewer__iframe"
              title="报刊查看器"
              allowFullScreen
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
            />
          )}
        </div>
      </div>
    </div>
  );
};