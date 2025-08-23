import React, { useState, useEffect, useRef } from 'react';
import { NewspaperService } from './services';

interface ViewerPageProps {
  publicationId: string;
  issueId: string;
}

export const ViewerPage: React.FC<ViewerPageProps> = ({ publicationId, issueId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manifestUrl, setManifestUrl] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const loadManifest = async () => {
      if (!publicationId || !issueId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // 构建manifest URL
        const combinedId = `${publicationId}/${issueId}`;
        const manifestUrl = NewspaperService.getProxyUrl(
          `https://www.ai4dh.cn/iiif/3/manifests/${combinedId}/manifest.json`
        );
        setManifestUrl(manifestUrl);
        
        const manifest = await NewspaperService.getManifest(combinedId);
        console.log('Manifest loaded:', manifest);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    loadManifest();
  }, [publicationId, issueId]);

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
    <div className="h-screen bg-white">
      <div className="uv-frame-wrap h-full border border-gray-300 rounded-lg overflow-hidden">
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
  );
};