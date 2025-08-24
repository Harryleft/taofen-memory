import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NewspaperService, PublicationItem } from './services';
import { NewspaperCard } from './NewspaperCard';
import AppHeader from '@/components/layout/header/AppHeader.tsx';

export const NewspaperListPage: React.FC = () => {
  console.log('🔍 [调试] NewspaperListPage 组件开始渲染');
  
  const [publications, setPublications] = useState<PublicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPublications = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔍 [调试] 开始加载刊物数据...');
        const collection = await NewspaperService.getPublications();
        console.log('🔍 [调试] 刊物数据加载成功:', collection);
        console.log('🔍 [调试] 数据类型:', typeof collection);
        console.log('🔍 [调试] publications 数据:', collection);
        console.log('🔍 [调试] publications 类型:', typeof collection);
        console.log('🔍 [调试] publications 是否为数组:', Array.isArray(collection));
        
        if (collection && collection.length > 0) {
          console.log('🔍 [调试] publications 长度:', collection.length);
          console.log('🔍 [调试] 第一个 publication:', collection[0]);
          console.log('🔍 [调试] 第一个 publication 的结构:', Object.keys(collection[0] || {}));
        }
        
        setPublications(collection || []);
      } catch (err) {
        console.error('🔍 [调试] 刊物数据加载失败:', err);
        console.error('🔍 [调试] 错误详情:', {
          message: err instanceof Error ? err.message : '未知错误',
          stack: err instanceof Error ? err.stack : '无堆栈信息',
          name: err instanceof Error ? err.name : '未知错误类型'
        });
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    loadPublications();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载刊物列表...</p>
          <div className="mt-2 p-2 bg-yellow-100 rounded text-sm">
            🔍 调试信息: 正在加载刊物数据...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">加载失败: {error}</p>
          <div className="mb-4 p-2 bg-red-100 rounded text-sm">
            🔍 调试信息: 加载失败 - {error}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  console.log('🔍 [调试] NewspaperListPage 准备渲染JSX');
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <div>🔍 调试: AppHeader 之前</div>
      <AppHeader moduleId="newspapers" />
      <div>🔍 调试: AppHeader 之后</div>
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">数字报刊</h1>
          <p className="text-gray-600">浏览历史报刊资料</p>
          <div className="mt-2 p-2 bg-blue-100 rounded text-sm">
            🔍 调试信息: 共找到 {publications.length} 个刊物
          </div>
        </div>

      {publications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无刊物数据</p>
          <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
            🔍 调试信息: 刊物列表为空
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {publications.map((publication) => {
            const publicationId = NewspaperService.extractPublicationId(publication.id);
            console.log('🔍 [调试] 处理刊物:', publication.title, 'ID:', publicationId);
            
            // 将 PublicationItem 转换为 IIIFCollectionItem 格式
            const iiifPublication: any = {
              id: publication.id,
              type: "Collection",
              label: {
                zh: [publication.title],
                en: [publication.title]
              }
            };
            
            return (
              <Link 
                key={publication.id} 
                to={`/newspaper/${publicationId}/issues`}
                className="block"
              >
                <NewspaperCard 
                  publication={iiifPublication} 
                  onClick={() => {}} 
                />
              </Link>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
};

export default NewspaperListPage;