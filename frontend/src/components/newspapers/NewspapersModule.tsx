import React, { useState, useEffect } from 'react';
import { NewspaperService } from './services';
import { IIIFCollectionItem } from './iiifTypes';
import { NewspaperCard } from './NewspaperCard';
import { IssueCard } from './IssueCard';
import { ViewerPage } from './ViewerPage';

interface NewspapersModuleProps {
  onPublicationSelect?: (publicationId: string, publicationTitle: string) => void;
  onIssueSelect?: (issueId: string) => void;
}

export const NewspapersModule: React.FC<NewspapersModuleProps> = ({
  onPublicationSelect,
  onIssueSelect
}) => {
  const [currentView, setCurrentView] = useState<'publications' | 'issues' | 'viewer'>('publications');
  const [publications, setPublications] = useState<IIIFCollectionItem[]>([]);
  const [issues, setIssues] = useState<IIIFCollectionItem[]>([]);
  const [currentPublication, setCurrentPublication] = useState<{ id: string; title: string } | null>(null);
  const [currentIssue, setCurrentIssue] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载刊物列表
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

  // 加载期数列表
  useEffect(() => {
    if (currentView !== 'issues' || !currentPublication) return;

    const loadIssues = async () => {
      try {
        setLoading(true);
        setError(null);
        const collection = await NewspaperService.getIssues(currentPublication.id);
        setIssues(collection.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    loadIssues();
  }, [currentView, currentPublication]);

  const handlePublicationClick = (publication: IIIFCollectionItem) => {
    const publicationId = NewspaperService.extractPublicationId(publication.id);
    const title = publication.label.zh?.[0] || publication.label.en?.[0] || '未知刊物';
    
    setCurrentPublication({ id: publicationId, title });
    setCurrentView('issues');
    
    if (onPublicationSelect) {
      onPublicationSelect(publicationId, title);
    }
  };

  const handleIssueClick = (issue: IIIFCollectionItem) => {
    const issueId = NewspaperService.extractIssueId(issue.id);
    setCurrentIssue(issueId);
    setCurrentView('viewer');
    
    if (onIssueSelect) {
      onIssueSelect(issueId);
    }
  };

  const handleBackToPublications = () => {
    setCurrentView('publications');
    setCurrentPublication(null);
  };

  const handleBackToIssues = () => {
    setCurrentView('issues');
    setCurrentIssue(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
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
    <div className="space-y-6">
      {/* 查看器视图 */}
      {currentView === 'viewer' && currentPublication && currentIssue && (
        <div className="h-screen">
          <button
            onClick={handleBackToIssues}
            className="fixed top-4 left-4 z-50 bg-white text-blue-500 px-4 py-2 rounded-lg shadow-lg hover:bg-gray-50"
          >
            ← 返回期数列表
          </button>
          <ViewerPage publicationId={currentPublication.id} issueId={currentIssue} />
        </div>
      )}

      {/* 刊物和期数视图 */}
      {currentView !== 'viewer' && (
        <>
          {/* 导航标题 */}
          <div className="flex items-center justify-between">
            <div>
              {currentView === 'issues' && currentPublication && (
                <button
                  onClick={handleBackToPublications}
                  className="text-blue-500 hover:text-blue-600 mb-2 inline-flex items-center"
                >
                  ← 返回刊物列表
                </button>
              )}
              <h2 className="text-2xl font-bold text-gray-900">
                {currentView === 'issues' ? currentPublication?.title : '数字报刊'}
              </h2>
              <p className="text-gray-600 mt-1">
                {currentView === 'issues' 
                  ? '选择期数进行浏览' 
                  : '浏览历史报刊资料'
                }
              </p>
            </div>
          </div>

          {/* 内容区域 */}
          {currentView === 'publications' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {publications.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">暂无刊物数据</p>
                </div>
              ) : (
                publications.map((publication) => (
                  <div 
                    key={publication.id}
                    className="cursor-pointer"
                    onClick={() => handlePublicationClick(publication)}
                  >
                    <NewspaperCard publication={publication} onClick={() => {}} />
                  </div>
                ))
              )}
            </div>
          )}

          {currentView === 'issues' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {issues.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">暂无期数数据</p>
                </div>
              ) : (
                issues.map((issue) => (
                  <div 
                    key={issue.id}
                    className="cursor-pointer"
                    onClick={() => handleIssueClick(issue)}
                  >
                    <IssueCard issue={issue} onClick={() => {}} />
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};