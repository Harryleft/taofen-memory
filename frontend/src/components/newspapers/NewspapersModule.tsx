/**
 * @file NewspapersModule.tsx
 * @description 数字报刊模块，用于在BookstoreTimelinePage中集成报刊功能
 * @module components/newspapers/NewspapersModule
 * @summary
 * 该组件是数字报刊功能的容器，负责展示报刊列表和筛选功能。
 * - 状态管理：使用useState管理筛选条件和加载状态
 * - 数据获取：通过NewspaperService获取报刊数据
 * - 响应式布局：复用BookstoreGrid的瀑布流布局
 * - 详情展示：通过Lightbox显示报刊详情
 */

import React, { useState, useEffect, useMemo } from 'react';
import { NewspaperService } from './services';
import { IIIFCollectionItem } from './iiifTypes';
import { NewspaperCard } from './NewspaperCard';
import { useLightbox } from '@/hooks/useLightbox';
import { useResponsiveColumns } from '@/hooks/useResponsiveColumns';

interface NewspapersModuleProps {
  className?: string;
}

// 配置常量
const COLUMN_GAP = 16; // px

export default function NewspapersModule({ className = '' }: NewspapersModuleProps) {
  // 状态管理
  const [publications, setPublications] = useState<IIIFCollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 响应式布局
  const { columns } = useResponsiveColumns();
  
  // 灯箱控制
  const {
    selectedItem,
    currentIndex,
    openLightbox,
    closeLightbox,
    nextItem,
    prevItem
  } = useLightbox();

  // 数据获取
  useEffect(() => {
    const loadPublications = async () => {
      try {
        setLoading(true);
        setError(null);
        const collection = await NewspaperService.getPublications();
        setPublications(collection.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    loadPublications();
  }, []);

  // 筛选逻辑
  const filteredPublications = useMemo(() => {
    if (!searchTerm) return publications;
    
    return publications.filter(publication => {
      const title = publication.label.zh?.[0] || publication.label.en?.[0] || '';
      return title.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [publications, searchTerm]);

  // 瀑布流布局
  const columnArrays = useMemo(() => {
    const arrays: IIIFCollectionItem[][] = Array.from({ length: columns }, () => []);
    
    // 简单的轮询分配，因为报刊卡片高度通常一致
    filteredPublications.forEach((item, index) => {
      arrays[index % columns].push(item);
    });

    return arrays;
  }, [filteredPublications, columns]);

  // 事件处理
  const handleOpenLightbox = (item: IIIFCollectionItem) => {
    openLightbox(item, filteredPublications);
  };

  // 加载状态
  if (loading) {
    return (
      <section className={`relative py-20 ${className}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-500 rounded-full animate-spin"></div>
            <span className="mt-4 text-lg text-gray-600 font-song">正在加载报刊数据...</span>
          </div>
        </div>
      </section>
    );
  }

  // 错误状态
  if (error) {
    return (
      <section className={`relative py-20 ${className}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">加载失败: {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              重试
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`relative py-20 ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        {/* 筛选控件 - 简化版，只保留搜索 */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="搜索报刊..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="text-sm text-gray-500">
              共 {filteredPublications.length} 种报刊
            </div>
          </div>
        </div>

        {/* 报刊网格 - 瀑布流布局 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredPublications.map((publication) => (
            <NewspaperCard
              key={publication.id}
              publication={publication}
              onClick={() => handleOpenLightbox(publication)}
            />
          ))}
        </div>

        {/* 空状态提示 */}
        {filteredPublications.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-xl font-bold text-charcoal mb-2" style={{fontFamily: "'KaiTi', 'STKaiti', '华文楷体', serif"}}>未找到相关报刊</h3>
            <p className="text-charcoal/60" style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif"}}>请尝试调整搜索条件</p>
          </div>
        )}
      </div>
    </section>
  );
}