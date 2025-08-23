import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { NewspaperService } from './services';
import { IIIFCollectionItem } from './iiifTypes';
import { IssueCard } from './IssueCard';
import AppHeader from '@/components/layout/header/AppHeader.tsx';

export const IssueListPage: React.FC = () => {
  const { publicationId } = useParams<{ publicationId: string }>();
  const [issues, setIssues] = useState<IIIFCollectionItem[]>([]);
  const [publicationTitle, setPublicationTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadIssues = async () => {
      if (!publicationId) return;
      
      try {
        setLoading(true);
        setError(null);
        const collection = await NewspaperService.getIssues(publicationId);
        setIssues(collection.items || []);
        setPublicationTitle(collection.label.zh?.[0] || collection.label.en?.[0] || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    loadIssues();
  }, [publicationId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载期数列表...</p>
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
          <Link 
            to="/newspapers" 
            className="text-blue-500 hover:text-blue-600 mb-4 inline-block"
          >
            ← 返回刊物列表
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{publicationTitle}</h1>
          <p className="text-gray-600">选择期数进行浏览</p>
        </div>

      {issues.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无期数数据</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {issues.map((issue) => {
            const issueId = NewspaperService.extractIssueId(issue.id);
            return (
              <Link 
                key={issue.id} 
                to={`/newspapers/${publicationId}/issues/${issueId}/viewer`}
                className="block"
              >
                <IssueCard 
                  issue={issue} 
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