import React, { useState, useEffect } from 'react';
import { NewspaperService } from './services';

declare global {
  interface Window {
    UV: {
      new: (config: { manifest: string; container: HTMLElement; configUri?: string }) => {
        destroy: () => void;
      };
    };
  }
}

interface ViewerPageProps {
  publicationId: string;
  issueId: string;
}

export const ViewerPage: React.FC<ViewerPageProps> = ({ publicationId, issueId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manifestUrl, setManifestUrl] = useState<string>('');

  useEffect(() => {
    const loadManifest = async () => {
      if (!publicationId || !issueId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // 根据环境生成manifest URL
        const manifestUrl = import.meta.env.DEV 
          ? `/iiif/3/manifests/${publicationId}/${issueId}/manifest.json`
          : `https://www.ai4dh.cn/iiif/3/manifests/${publicationId}/${issueId}/manifest.json`;
        setManifestUrl(manifestUrl);
        
        const manifest = await NewspaperService.getManifest(`${publicationId}/${issueId}`);
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

    const loadUV = () => {
      if (typeof window.UV === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://universalviewer.io/uv/uv.js';
        script.onload = initializeUV;
        document.head.appendChild(script);
      } else {
        initializeUV();
      }
    };

    const initializeUV = () => {
      try {
        const uvElement = document.getElementById('uv');
        if (uvElement) {
          const uv = new window.UV({
            manifest: manifestUrl,
            container: uvElement,
            configUri: 'https://universalviewer.io/config.json'
          });
          
          return () => {
            if (uv && uv.destroy) {
              uv.destroy();
            }
          };
        }
      } catch (err) {
        console.error('Failed to initialize UV:', err);
        setError('查看器初始化失败');
      }
    };

    loadUV();
  }, [manifestUrl, loading]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载查看器...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">加载失败: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-4"
          >
            重试
          </button>
          <Link 
            to={`/newspapers/${publicationId}/issues`}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 inline-block"
          >
            返回期数列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <div id="uv" className="w-full h-full">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">正在初始化查看器...</p>
          </div>
        </div>
      </div>
    </div>
  );
};