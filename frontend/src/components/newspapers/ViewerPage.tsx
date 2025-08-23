import React, { useState, useEffect, useRef } from 'react';
import { NewspaperService } from './services';

declare global {
  interface Window {
    UV: {
      init: (element: HTMLElement, options: any) => any;
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
  const uvInitialized = useRef(false);

  useEffect(() => {
    const loadManifest = async () => {
      if (!publicationId || !issueId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // 根据环境生成manifest URL，对路径进行URL编码
        const combinedId = `${publicationId}/${issueId}`;
        const encodedCombinedId = encodeURIComponent(combinedId);
        const manifestUrl = import.meta.env.DEV 
          ? `/iiif/3/manifests/${encodedCombinedId}/manifest.json`
          : `https://www.ai4dh.cn/iiif/3/manifests/${encodedCombinedId}/manifest.json`;
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
    if (!manifestUrl || loading || uvInitialized.current) return;

    const initUV = () => {
      try {
        console.log('=== 开始Universal Viewer初始化 ===');
        
        // 确保UV全局对象可用
        if (typeof window.UV === 'undefined') {
          console.log('UV未加载，开始加载UV库...');
          
          // 首先加载CSS
          const cssLink = document.createElement('link');
          cssLink.rel = 'stylesheet';
          cssLink.href = 'https://cdn.jsdelivr.net/npm/universalviewer@4.2.1/dist/uv.css';
          document.head.appendChild(cssLink);
          
          // 然后加载JS
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/universalviewer@4.2.1/dist/umd/UV.js';
          script.onload = () => {
            console.log('UV库加载完成，开始初始化...');
            initUVInternal();
          };
          script.onerror = () => {
            console.error('UV库加载失败');
            setError('UV库加载失败');
          };
          document.head.appendChild(script);
        } else {
          console.log('UV已存在，直接初始化...');
          initUVInternal();
        }
      } catch (err) {
        console.error('❌ UV初始化失败:', err);
        setError('查看器初始化失败: ' + err.message);
      }
    };

    const initUVInternal = () => {
      try {
        const uvElement = document.getElementById('uv');
        if (!uvElement) {
          console.error('UV容器元素未找到');
          setError('查看器容器未找到');
          return;
        }

        console.log('开始初始化Universal Viewer...');
        console.log('Manifest URL:', manifestUrl);

        // 清空容器
        uvElement.innerHTML = '';
        
        // 使用UV.init方法
        const uv = window.UV.init(uvElement, {
          manifest: manifestUrl,
          configUri: 'https://universalviewer.io/config.json',
          embedded: true
        });

        if (uv) {
          console.log('✅ Universal Viewer初始化成功');
          uvInitialized.current = true;
        } else {
          console.error('UV初始化返回null');
          setError('查看器初始化失败');
        }

        // 窗口大小变化时重新调整
        const handleResize = () => {
          try {
            if (uv && uv.resize) {
              uv.resize();
            }
          } catch (e) {
            console.warn('调整窗口大小时出错:', e);
          }
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          if (uv && uv.destroy) {
            uv.destroy();
          }
          uvInitialized.current = false;
        };
      } catch (err) {
        console.error('❌ UV内部初始化失败:', err);
        setError('查看器初始化失败: ' + err.message);
      }
    };

    initUV();
  }, [manifestUrl, loading]);

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
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-4"
          >
            重新加载页面
          </button>
          <button 
            onClick={() => {
              uvInitialized.current = false;
              const script = document.createElement('script');
              script.src = 'https://cdn.jsdelivr.net/npm/universalviewer@4.2.1/dist/umd/UV.js';
              script.onload = () => {
                console.log('UV库重新加载完成');
                window.location.reload();
              };
              document.head.appendChild(script);
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            重新加载UV库
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white">
      <div id="uv" className="w-full h-full">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">正在初始化查看器...</p>
            <p className="text-gray-400 text-sm mt-2">请稍候，首次加载可能需要几秒钟</p>
          </div>
        </div>
      </div>
    </div>
  );
};