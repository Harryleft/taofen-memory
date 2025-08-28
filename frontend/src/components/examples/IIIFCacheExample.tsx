/**
 * IIIF缓存使用示例组件
 * 展示如何使用缓存功能优化IIIF图像加载
 */

import React, { useState, useEffect } from 'react';
import { useIIIFInfo, useCachePrefetch } from '../hooks/useCache';
import { IIIFUrlBuilder } from '../components/iiif/iiifUrlBuilder';

interface IIIFImage {
  identifier: string;
  title: string;
  description?: string;
}

const sampleImages: IIIFImage[] = [
  {
    identifier: 'book_23416',
    title: '韬奋手稿示例 1',
    description: '邹韬奋早期手稿作品'
  },
  {
    identifier: 'book_23417',
    title: '韬奋手稿示例 2',
    description: '邹韬奋中期手稿作品'
  },
  {
    identifier: 'book_23418',
    title: '韬奋手稿示例 3',
    description: '邹韬奋后期手稿作品'
  }
];

export const IIIFCacheExample: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<IIIFImage>(sampleImages[0]);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [cacheStats, setCacheStats] = useState({ hits: 0, misses: 0 });

  const { data: iiifInfo, loading: infoLoading, refetch: refetchInfo } = useIIIFInfo(selectedImage.identifier);
  const { prefetchIIIF, loading: prefetchLoading } = useCachePrefetch();

  // 加载图像
  const loadImage = async () => {
    setLoading(true);
    try {
      const url = await IIIFUrlBuilder.getIIIFImage(selectedImage.identifier, {
        region: 'full',
        size: '400,600',
        rotation: '0',
        quality: 'default'
      });
      setImageUrl(url);
    } catch (error) {
      console.error('加载图像失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 预取所有示例图像
  const prefetchAll = async () => {
    try {
      await prefetchIIIF(sampleImages.map(img => img.identifier));
      alert('预取完成！现在尝试切换图像查看缓存效果。');
    } catch (error) {
      console.error('预取失败:', error);
      alert('预取失败，请查看控制台。');
    }
  };

  // 清空IIIF缓存
  const clearCache = async () => {
    try {
      await IIIFUrlBuilder.clearIIIFCache();
      setCacheStats({ hits: 0, misses: 0 });
      alert('缓存已清空');
    } catch (error) {
      console.error('清空缓存失败:', error);
    }
  };

  // 选择图像时自动加载
  useEffect(() => {
    loadImage();
  }, [selectedImage]);

  // 监听缓存命中/未命中
  useEffect(() => {
    const originalLog = console.log;
    console.log = (...args) => {
      if (args[0] && typeof args[0] === 'string') {
        if (args[0].includes('缓存命中')) {
          setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }));
        } else if (args[0].includes('缓存未命中')) {
          setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
        }
      }
      originalLog(...args);
    };

    return () => {
      console.log = originalLog;
    };
  }, []);

  return (
    <div className="iiif-cache-example p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">IIIF缓存示例</h2>
      
      {/* 控制面板 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">控制面板</h3>
        
        {/* 图像选择 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">选择图像：</label>
          <div className="grid grid-cols-3 gap-2">
            {sampleImages.map((image) => (
              <button
                key={image.identifier}
                onClick={() => setSelectedImage(image)}
                className={`p-2 rounded border text-left ${
                  selectedImage.identifier === image.identifier
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">{image.title}</div>
                <div className="text-xs opacity-75">{image.identifier}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={loadImage}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '加载中...' : '重新加载图像'}
          </button>
          
          <button
            onClick={refetchInfo}
            disabled={infoLoading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {infoLoading ? '获取信息中...' : '重新获取IIIF信息'}
          </button>
          
          <button
            onClick={prefetchAll}
            disabled={prefetchLoading}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            {prefetchLoading ? '预取中...' : '预取所有图像'}
          </button>
          
          <button
            onClick={clearCache}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            清空缓存
          </button>
        </div>

        {/* 缓存统计 */}
        <div className="mt-4 p-3 bg-white rounded border">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">缓存统计：</span>
            <div className="space-x-4 text-sm">
              <span className="text-green-600">命中: {cacheStats.hits}</span>
              <span className="text-red-600">未命中: {cacheStats.misses}</span>
              <span className="text-blue-600">
                命中率: {cacheStats.hits + cacheStats.misses > 0 
                  ? Math.round((cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100) 
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 图像显示 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 图像预览 */}
        <div>
          <h3 className="text-lg font-semibold mb-3">图像预览</h3>
          <div className="border rounded-lg p-4 bg-gray-50">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <div className="text-sm text-gray-600">加载中...</div>
                </div>
              </div>
            ) : imageUrl ? (
              <img
                src={imageUrl}
                alt={selectedImage.title}
                className="max-w-full h-auto rounded shadow-md"
                onLoad={() => console.log('🖼️ 图像加载完成')}
                onError={() => console.error('❌ 图像加载失败')}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                点击"加载图像"按钮
              </div>
            )}
          </div>
        </div>

        {/* IIIF信息 */}
        <div>
          <h3 className="text-lg font-semibold mb-3">IIIF信息</h3>
          <div className="border rounded-lg p-4 bg-gray-50">
            {infoLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                  <div className="text-sm text-gray-600">获取IIIF信息中...</div>
                </div>
              </div>
            ) : iiifInfo ? (
              <div className="space-y-2">
                <div>
                  <span className="font-medium">标识符：</span>
                  <span className="ml-2 font-mono text-sm">{selectedImage.identifier}</span>
                </div>
                <div>
                  <span className="font-medium">标题：</span>
                  <span className="ml-2">{iiifInfo.label?.['zh-cn'] || iiifInfo.label || '未知'}</span>
                </div>
                <div>
                  <span className="font-medium">尺寸：</span>
                  <span className="ml-2">
                    {iiifInfo.width} × {iiifInfo.height}
                  </span>
                </div>
                <div>
                  <span className="font-medium">格式：</span>
                  <span className="ml-2">{iiifInfo.formats?.join(', ') || '未知'}</span>
                </div>
                <div>
                  <span className="font-medium">质量：</span>
                  <span className="ml-2">{iiifInfo.qualities?.join(', ') || '未知'}</span>
                </div>
                <div className="mt-4">
                  <h4 className="font-medium mb-2">原始数据：</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(iiifInfo, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                点击"获取IIIF信息"按钮
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 使用说明 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">使用说明</h3>
        <ul className="text-sm space-y-1 text-gray-700">
          <li>• 选择不同的图像查看缓存效果</li>
          <li>• 首次加载时会从远程获取，后续从缓存获取</li>
          <li>• 使用"预取所有图像"可以提前缓存所有图像</li>
          <li>• 查看控制台日志了解详细的缓存命中情况</li>
          <li>• 缓存统计会实时更新命中率</li>
        </ul>
      </div>
    </div>
  );
};

export default IIIFCacheExample;