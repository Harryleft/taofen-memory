import React, { useState, useEffect, useRef } from 'react';
import { NewspaperService, PublicationItem, IssueItem } from './services';
import { ViewerPage } from './ViewerPage';

interface NewspapersModuleProps {
  onPublicationSelect?: (publicationId: string, publicationTitle: string) => void;
  onIssueSelect?: (issueId: string) => void;
}

export const NewspapersModule: React.FC<NewspapersModuleProps> = ({
  onPublicationSelect,
  onIssueSelect
}) => {
  const [allPublications, setAllPublications] = useState<PublicationItem[]>([]);
  const [filteredPublications, setFilteredPublications] = useState<PublicationItem[]>([]);
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [selectedPublication, setSelectedPublication] = useState<PublicationItem | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<IssueItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'count'>('name');
  const [currentView, setCurrentView] = useState<'catalog' | 'viewer'>('catalog');

  // 防抖函数
  const debounceRef = useRef<NodeJS.Timeout>();

  // 加载刊物列表
  useEffect(() => {
    const loadPublications = async () => {
      try {
        setLoading(true);
        setError(null);
        const publications = await NewspaperService.getPublications();
        setAllPublications(publications);
        setFilteredPublications(publications);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    loadPublications();
  }, []);

  // 搜索和排序功能
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const filtered = NewspaperService.filterPublications(allPublications, searchTerm, sortBy);
      setFilteredPublications(filtered);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [allPublications, searchTerm, sortBy]);

  // 处理刊物选择
  const handlePublicationChange = async (collectionUrl: string) => {
    if (!collectionUrl) {
      setSelectedPublication(null);
      setIssues([]);
      return;
    }

    const publication = allPublications.find(pub => pub.collection === collectionUrl);
    if (!publication) return;

    setSelectedPublication(publication);
    setLoading(true);
    
    try {
      const issueList = await NewspaperService.getIssuesForPublication(collectionUrl);
      setIssues(issueList);
      
      if (onPublicationSelect) {
        const publicationId = NewspaperService.extractPublicationId(collectionUrl);
        onPublicationSelect(publicationId, publication.title);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载期数失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理期数选择
  const handleIssueClick = (issue: IssueItem) => {
    setSelectedIssue(issue);
    setCurrentView('viewer');
    
    if (onIssueSelect) {
      const issueId = NewspaperService.extractIssueId(issue.manifest);
      onIssueSelect(issueId);
    }
  };

  // 返回目录视图
  const handleBackToCatalog = () => {
    setCurrentView('catalog');
    setSelectedIssue(null);
  };

  // 清除搜索
  const clearSearch = () => {
    setSearchTerm('');
  };

  // 计算总期数
  const totalIssues = allPublications.reduce((sum, pub) => sum + pub.issueCount, 0);

  if (loading && allPublications.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">加载刊物列表...</p>
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

  // 查看器视图
  if (currentView === 'viewer' && selectedPublication && selectedIssue) {
    const publicationId = NewspaperService.extractPublicationId(selectedPublication.collection);
    const issueId = NewspaperService.extractIssueId(selectedIssue.manifest);
    
    // 处理期数选择
    const handleViewerIssueSelect = (issue: IssueItem) => {
      setSelectedIssue(issue);
      const newIssueId = NewspaperService.extractIssueId(issue.manifest);
      if (onIssueSelect) {
        onIssueSelect(newIssueId);
      }
    };

    // 处理期数预览
    const handleViewerIssuePreview = (issue: IssueItem) => {
      setSelectedIssue(issue);
      const newIssueId = NewspaperService.extractIssueId(issue.manifest);
      if (onIssueSelect) {
        onIssueSelect(newIssueId);
      }
    };
    
    return (
      <div className="h-screen">
        <ViewerPage 
          publicationId={publicationId} 
          issueId={issueId}
          publicationTitle={selectedPublication.title}
          allIssues={issues}
          onIssueSelect={handleViewerIssueSelect}
          onIssuePreview={handleViewerIssuePreview}
        />
      </div>
    );
  }

  // 目录视图
  return (
    <div className="space-y-6">
      {/* 搜索和过滤 */}
      <div className="search-container flex gap-4 items-center p-4 bg-gray-50 rounded-lg border">
        <div className="search-box flex-1 relative">
          <input
            type="text"
            id="publication-search"
            placeholder="搜索刊物名称..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          )}
        </div>
        <div className="sort-controls flex items-center gap-2">
          <label htmlFor="sort-select">排序：</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'count')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">按名称</option>
            <option value="date">按日期</option>
            <option value="count">按期数</option>
          </select>
        </div>
      </div>

      {/* 刊物选择器 */}
      <div className="publication-selector">
        <label htmlFor="publication-select" className="block text-sm font-medium text-gray-700 mb-2">
          <strong>选择刊物：</strong>
        </label>
        <select
          id="publication-select"
          onChange={(e) => handlePublicationChange(e.target.value)}
          value={selectedPublication?.collection || ''}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">请选择刊物</option>
          {filteredPublications.map((pub) => (
            <option 
              key={pub.collection} 
              value={pub.collection}
              data-name={pub.name}
              data-count={pub.issueCount}
            >
              {pub.title} ({pub.issueCount}期){pub.lastUpdated ? ` - ${pub.lastUpdated}` : ''}
            </option>
          ))}
        </select>
        <div className="publication-count text-sm text-gray-600 mt-1">
          共 {filteredPublications.length} 个刊物，总计 {totalIssues} 期
        </div>
      </div>

      {/* 期数列表 */}
      <div className="catalog-list">
        {selectedPublication ? (
          loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mb-2"></div>
              <p className="text-gray-600">正在加载期刊目录...</p>
            </div>
          ) : issues.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              未找到期刊数据
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {issues.map((issue) => (
                <div
                  key={issue.manifest}
                  className={`catalog-item bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
                    selectedIssue?.manifest === issue.manifest ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => handleIssueClick(issue)}
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{issue.title}</h3>
                  <p className="text-sm text-gray-600">{issue.summary}</p>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-8 text-gray-500">
            请先选择刊物
          </div>
        )}
      </div>
    </div>
  );
};