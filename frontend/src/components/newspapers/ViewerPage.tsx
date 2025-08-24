import React, { useState, useEffect, useRef } from 'react';
import { NewspaperService, IssueItem } from './services';
import { IssueDrawer } from './IssueDrawer';

interface ViewerPageProps {
  publicationId: string;
  issueId: string;
  publicationTitle?: string;
  allIssues?: IssueItem[];
  onIssueSelect?: (issue: IssueItem) => void;
  onIssuePreview?: (issue: IssueItem) => void;
}

export const ViewerPage: React.FC<ViewerPageProps> = ({ 
  publicationId, 
  issueId, 
  publicationTitle = '',
  allIssues = [],
  onIssueSelect,
  onIssuePreview 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manifestUrl, setManifestUrl] = useState<string>('');
  const [selectedIssue, setSelectedIssue] = useState<IssueItem | null>(null);
  const [issues, setIssues] = useState<IssueItem[]>(allIssues);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const loadManifest = async () => {
      if (!publicationId || !issueId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // 构建完整的manifest URL
        let fullManifestUrl;
        if (issueId.startsWith('http')) {
          // 如果issueId是完整URL，直接使用
          fullManifestUrl = issueId;
        } else {
          // 否则构建完整URL：https://www.ai4dh.cn/iiif/3/manifests/{publicationId}/{issueId}/manifest.json
          fullManifestUrl = `https://www.ai4dh.cn/iiif/3/manifests/${publicationId}/${issueId}/manifest.json`;
        }
        
        // 设置用于UV查看器的manifest URL（使用代理）
        const proxyManifestUrl = NewspaperService.getProxyUrl(fullManifestUrl);
        setManifestUrl(proxyManifestUrl);
        
        console.log('🔍 [调试] 完整manifest URL:', fullManifestUrl);
        console.log('🔍 [调试] 代理manifest URL:', proxyManifestUrl);
        
        // 验证manifest是否可访问
        const response = await fetch(proxyManifestUrl);
        if (!response.ok) {
          throw new Error(`Manifest加载失败: ${response.status} ${response.statusText}`);
        }
        
        const manifest = await response.json();
        console.log('✅ Manifest加载成功:', manifest);
      } catch (err) {
        console.error('❌ Manifest加载失败:', err);
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    loadManifest();
  }, [publicationId, issueId]);

  // 设置当前选择的期数
  useEffect(() => {
    if (allIssues.length > 0 && issueId) {
      const currentIssue = allIssues.find(issue => 
        NewspaperService.extractIssueId(issue.manifest) === issueId
      );
      setSelectedIssue(currentIssue || null);
      setIssues(allIssues);
    }
  }, [allIssues, issueId]);

  // 如果没有期数数据，主动获取
  useEffect(() => {
    const loadIssuesIfNeeded = async () => {
      if (issues.length === 0 && publicationId && !issuesLoading) {
        setIssuesLoading(true);
        try {
          console.log('🔍 [调试] 主动获取期数数据，publicationId:', publicationId);
          
          // 构建collection URL
          const collectionUrl = `https://www.ai4dh.cn/iiif/3/manifests/${publicationId}/collection.json`;
          console.log('🔍 [调试] 构建的collection URL:', collectionUrl);
          
          const issueList = await NewspaperService.getIssuesForPublication(collectionUrl);
          console.log('🔍 [调试] 获取到的期数列表:', issueList);
          
          setIssues(issueList);
          
          // 设置当前选择的期数
          if (issueId) {
            const currentIssue = issueList.find(issue => 
              NewspaperService.extractIssueId(issue.manifest) === issueId
            );
            setSelectedIssue(currentIssue || null);
          }
        } catch (err) {
          console.error('❌ 获取期数列表失败:', err);
        } finally {
          setIssuesLoading(false);
        }
      }
    };

    loadIssuesIfNeeded();
  }, [publicationId, issueId, issues.length, issuesLoading]);

  useEffect(() => {
    if (!manifestUrl || loading) return;

    // 构建iframe URL
    const timestamp = Date.now();
    const iframeSrc = `/uv_simple.html?v=${timestamp}#?iiifManifestId=${encodeURIComponent(manifestUrl)}&embedded=true`;
    
    console.log('Loading UV iframe:', iframeSrc);
    
    if (iframeRef.current) {
      iframeRef.current.src = iframeSrc;
    }
  }, [manifestUrl, loading]);

  // 监听来自iframe的消息
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'uv-loaded') {
        console.log('UV查看器加载完成:', event.data.manifestId);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // 重新加载UV查看器
  const reloadViewer = () => {
    if (iframeRef.current) {
      const timestamp = Date.now();
      const iframeSrc = `/uv_simple.html?v=${timestamp}#?iiifManifestId=${encodeURIComponent(manifestUrl)}&embedded=true`;
      iframeRef.current.src = iframeSrc;
    }
  };

  // 处理期数选择
  const handleIssueSelect = (issue: IssueItem) => {
    if (onIssueSelect) {
      onIssueSelect(issue);
    }
  };

  // 处理期数预览
  const handleIssuePreview = (issue: IssueItem) => {
    if (onIssuePreview) {
      onIssuePreview(issue);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">加载查看器...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-md">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h3 className="font-bold">❌ 查看器加载失败</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <button 
            onClick={reloadViewer}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-4"
          >
            重新加载查看器
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            重新加载页面
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex">
      {/* 左侧主视图区域 - 70%宽度 */}
      <div className="w-[70%] h-full flex flex-col border-r border-gray-300">
        {/* 顶部工具栏 */}
        <div className="bg-gray-100 border-b border-gray-300 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              ← 返回书籍
            </button>
          </div>
        </div>
        
        {/* UV查看器区域 */}
        <div className="flex-1 bg-gray-50 relative">
          <div className="uv-frame-wrap h-full border border-gray-300 rounded-lg overflow-hidden m-4">
            <iframe
              ref={iframeRef}
              id="uv-frame"
              title="Universal Viewer"
              allowFullScreen
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
            />
          </div>
        </div>
      </div>
      
      {/* 右侧抽屉组件 */}
      <IssueDrawer
        publicationTitle={publicationTitle}
        issues={issues}
        selectedIssue={selectedIssue}
        onIssueSelect={handleIssueSelect}
        onIssuePreview={handleIssuePreview}
        loading={issuesLoading}
      />
    </div>
  );
};