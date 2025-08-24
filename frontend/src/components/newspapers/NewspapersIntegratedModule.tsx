import React, { useState, useEffect, useCallback } from 'react';
import { NewspaperService, PublicationItem, IssueItem } from './services';
import { NewspaperCard } from './NewspaperCard';
import AppHeader from '@/components/layout/header/AppHeader.tsx';

interface NewspapersIntegratedModuleProps {
  onPublicationSelect?: (publicationId: string, publicationTitle: string) => void;
  onIssueSelect?: (issueId: string) => void;
}

export const NewspapersIntegratedModule: React.FC<NewspapersIntegratedModuleProps> = ({
  onPublicationSelect,
  onIssueSelect
}) => {
  // 状态管理 - 简化为核心状态
  const [publications, setPublications] = useState<PublicationItem[]>([]);
  const [selectedPublication, setSelectedPublication] = useState<PublicationItem | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<IssueItem | null>(null);
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 加载刊物列表
  useEffect(() => {
    const loadPublications = async () => {
      try {
        setLoading(true);
        setError(null);
        const publicationsData = await NewspaperService.getPublications();
        setPublications(publicationsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    loadPublications();
  }, []);

  // 选择刊物并加载期数
  const handlePublicationSelect = useCallback(async (publication: PublicationItem) => {
    try {
      setSelectedPublication(publication);
      
      // 加载该刊物的期数列表
      const publicationId = NewspaperService.extractPublicationId(publication.id);
      const issuesData = await NewspaperService.getIssues(publicationId);
      setIssues(issuesData);
      
      // 如果有期数，自动选择第一个
      if (issuesData.length > 0) {
        setSelectedIssue(issuesData[0]);
        if (onIssueSelect) {
          const issueId = NewspaperService.extractIssueId(issuesData[0].manifest);
          onIssueSelect(issueId);
        }
      }
      
      if (onPublicationSelect) {
        onPublicationSelect(publicationId, publication.title);
      }
    } catch (err) {
      console.error('加载期数失败:', err);
    }
  }, [onPublicationSelect, onIssueSelect]);

  // 选择期数 - 直接切换，无需额外确认
  const handleIssueSelect = useCallback((issue: IssueItem) => {
    setSelectedIssue(issue);
    if (onIssueSelect) {
      const issueId = NewspaperService.extractIssueId(issue.manifest);
      onIssueSelect(issueId);
    }
  }, [onIssueSelect]);

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 空格键切换侧边栏
      if (e.code === 'Space' && !e.target.matches('input, textarea, select')) {
        e.preventDefault();
        setSidebarCollapsed(!sidebarCollapsed);
      }
      
      // 左右箭头切换期数
      if (issues.length > 0 && selectedIssue) {
        const currentIndex = issues.findIndex(issue => issue.manifest === selectedIssue.manifest);
        if (e.code === 'ArrowLeft' && currentIndex > 0) {
          handleIssueSelect(issues[currentIndex - 1]);
        } else if (e.code === 'ArrowRight' && currentIndex < issues.length - 1) {
          handleIssueSelect(issues[currentIndex + 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [issues, selectedIssue, handleIssueSelect, sidebarCollapsed]);

  // 错误状态处理
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">加载失败: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-newspapers px-4 py-2 rounded"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  // 加载状态处理
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">加载报刊数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <AppHeader moduleId="newspapers" />
      
      {/* 主要内容区域 */}
      <div className="flex-1 flex">
        {/* 左侧刊物列表 */}
        {!sidebarCollapsed && (
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            {/* 刊物列表标题 */}
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">报刊列表</h2>
              <p className="text-sm text-gray-600">选择刊物开始浏览</p>
            </div>
            
            {/* 刊物列表 */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {publications.map((publication) => (
                  <div
                    key={publication.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      selectedPublication?.id === publication.id
                        ? 'border-[var(--newspapers-button-bg)] bg-[rgba(196,155,97,0.1)]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handlePublicationSelect(publication)}
                  >
                    <h3 className="font-medium text-gray-900 mb-1">{publication.title}</h3>
                    <p className="text-sm text-gray-600">
                      {publication.summary || '暂无描述'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* 右侧内容区域 */}
        <div className={`${sidebarCollapsed ? 'w-full' : 'flex-1'} flex flex-col`}>
          {/* 顶部工具栏 */}
          <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {selectedPublication && (
                <h1 className="text-xl font-semibold text-gray-900">
                  {selectedPublication.title}
                </h1>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="text-[var(--newspapers-button-bg)] hover:text-[var(--newspapers-button-hover)] font-medium"
              >
                {sidebarCollapsed ? '展开侧栏' : '收起侧栏'}
              </button>
            </div>
          </div>
          
          {/* 内容区域 */}
          <div className="flex-1 bg-gray-50">
            {!selectedPublication ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4">📰</div>
                  <h2 className="text-2xl font-semibold text-gray-700 mb-2">欢迎使用数字报刊</h2>
                  <p className="text-gray-600 mb-4">请从左侧选择一个刊物开始浏览</p>
                  {!sidebarCollapsed && (
                    <button
                      onClick={() => setSidebarCollapsed(true)}
                      className="btn-newspapers px-4 py-2 rounded"
                    >
                      收起侧栏
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                {/* 期数选择器 */}
                <div className="bg-white border-b border-gray-200 p-4">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">选择期数：</label>
                    <select
                      value={selectedIssue?.manifest || ''}
                      onChange={(e) => {
                        const issue = issues.find(i => i.manifest === e.target.value);
                        if (issue) handleIssueSelect(issue);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--newspapers-button-bg)]"
                      disabled={issues.length === 0}
                    >
                      {issues.length === 0 ? (
                        <option value="">暂无期数</option>
                      ) : (
                        issues.map((issue) => (
                          <option key={issue.manifest} value={issue.manifest}>
                            {issue.title}
                          </option>
                        ))
                      )}
                    </select>
                    
                    {/* 期数导航按钮 */}
                    {issues.length > 1 && selectedIssue && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const currentIndex = issues.findIndex(issue => issue.manifest === selectedIssue.manifest);
                            if (currentIndex > 0) {
                              handleIssueSelect(issues[currentIndex - 1]);
                            }
                          }}
                          disabled={issues.findIndex(issue => issue.manifest === selectedIssue.manifest) === 0}
                          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                          上一期
                        </button>
                        <button
                          onClick={() => {
                            const currentIndex = issues.findIndex(issue => issue.manifest === selectedIssue.manifest);
                            if (currentIndex < issues.length - 1) {
                              handleIssueSelect(issues[currentIndex + 1]);
                            }
                          }}
                          disabled={issues.findIndex(issue => issue.manifest === selectedIssue.manifest) === issues.length - 1}
                          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                          下一期
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 查看器区域 */}
                <div className="flex-1">
                  {selectedIssue ? (
                    <div className="h-full">
                      {/* 这里可以嵌入实际的查看器组件 */}
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-6xl mb-4">📄</div>
                          <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            {selectedIssue.title}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            刊物：{selectedPublication?.title}
                          </p>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                            <p className="text-sm text-blue-800">
                              <strong>查看器预览</strong><br />
                              这里将显示报刊的实际内容<br />
                              当前选择了：{selectedIssue.title}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="text-6xl mb-4">📋</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">选择期数</h3>
                        <p className="text-gray-600">请从上方下拉菜单中选择一个期数</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};