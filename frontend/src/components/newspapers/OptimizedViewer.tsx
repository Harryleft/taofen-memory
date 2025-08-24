import React, { useRef, useEffect, useCallback } from 'react';
import { useNewspapers } from './NewspapersContext';
import { NewspaperService, IssueItem } from './services';

interface OptimizedViewerProps {
  className?: string;
}

export const OptimizedViewer: React.FC<OptimizedViewerProps> = ({ className = '' }) => {
  const { state, actions } = useNewspapers();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const reloadTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    manifestUrl,
    selectedIssue,
    selectedPublication,
    loading,
    error
  } = state;

  // 构建iframe URL
  const buildIframeUrl = useCallback((url: string) => {
    const timestamp = Date.now();
    return `/uv_simple.html?v=${timestamp}#?iiifManifestId=${encodeURIComponent(url)}&embedded=true`;
  }, []);

  // 加载iframe
  const loadIframe = useCallback(() => {
    if (!manifestUrl || !iframeRef.current) return;

    const iframeSrc = buildIframeUrl(manifestUrl);
    console.log('Loading UV iframe:', iframeSrc);
    
    iframeRef.current.src = iframeSrc;
  }, [manifestUrl, buildIframeUrl]);

  // 重新加载查看器
  const reloadViewer = useCallback(() => {
    if (reloadTimeoutRef.current) {
      clearTimeout(reloadTimeoutRef.current);
    }

    reloadTimeoutRef.current = setTimeout(() => {
      loadIframe();
    }, 100);
  }, [loadIframe]);

  
  // 监听来自iframe的消息
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'uv-loaded') {
        console.log('UV查看器加载完成:', event.data.manifestId);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // 当manifestUrl变化时重新加载iframe
  useEffect(() => {
    if (manifestUrl && !loading) {
      loadIframe();
    }
  }, [manifestUrl, loading, loadIframe]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (reloadTimeoutRef.current) {
        clearTimeout(reloadTimeoutRef.current);
      }
    };
  }, []);

  // 错误状态
  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center max-w-md">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h3 className="font-bold">❌ 查看器加载失败</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <button 
            onClick={reloadViewer}
            className="btn-newspapers px-4 py-2 rounded mr-4"
          >
            重新加载查看器
          </button>
          <button 
            onClick={() => actions.loadPublications()}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            重新加载页面
          </button>
        </div>
      </div>
    );
  }

  // 加载状态
  if (loading || !manifestUrl) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">加载查看器...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* 查看器工具栏 */}
      <div className="bg-gray-100 border-b border-gray-300 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedIssue?.title || '报刊查看器'}
          </h2>
          {selectedPublication && (
            <span className="text-sm text-gray-600">
              刊物：{selectedPublication.title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={reloadViewer}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            🔄 刷新
          </button>
        </div>
      </div>
      
      {/* UV查看器区域 */}
      <div className="flex-1 bg-gray-50 relative">
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 m-4 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white text-lg">正在加载期数内容...</p>
            </div>
          </div>
        )}
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
  );
};