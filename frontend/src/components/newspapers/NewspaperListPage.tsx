import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NewspaperService } from './services';
import { IIIFCollectionItem } from './iiifTypes';
import { NewspaperCard } from './NewspaperCard';
import AppHeader from '@/components/layout/header/AppHeader.tsx';

export const NewspaperListPage: React.FC = () => {
  const [publications, setPublications] = useState<IIIFCollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载刊物列表...</p>
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
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <AppHeader moduleId="newspapers" />
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">数字报刊</h1>
          <p className="text-gray-600">浏览历史报刊资料</p>
        </div>

      {publications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无刊物数据</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {publications.map((publication) => {
            const publicationId = NewspaperService.extractPublicationId(publication.id);
            return (
              <Link 
                key={publication.id} 
                to={`/newspapers/${publicationId}/issues`}
                className="block"
              >
                <NewspaperCard 
                  publication={publication} 
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