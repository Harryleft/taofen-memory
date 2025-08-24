import React, { useCallback, useEffect } from 'react';
import { useNewspapers } from './NewspapersContext';
import { NewspaperService, PublicationItem, IssueItem } from './services';
import { OptimizedViewer } from './OptimizedViewer';
import { OptimizedIssueSelector } from './OptimizedIssueSelector';
import AppHeader from '@/components/layout/header/AppHeader.tsx';

interface NewspapersIntegratedModuleProps {
  onPublicationSelect?: (publicationId: string, publicationTitle: string) => void;
  onIssueSelect?: (issueId: string) => void;
}

export const NewspapersIntegratedModule: React.FC<NewspapersIntegratedModuleProps> = ({
  onPublicationSelect,
  onIssueSelect
}) => {
  const { state, actions } = useNewspapers();
  
  const {
    publications,
    selectedPublication,
    selectedIssue,
    issues,
    loading,
    error,
    sidebarCollapsed
  } = state;

  // 选择刊物并加载期数
  const handlePublicationSelect = useCallback(async (publication: PublicationItem) => {
    try {
      actions.selectPublication(publication);
      await actions.loadIssues(publication);
      
      if (onPublicationSelect) {
        const publicationId = NewspaperService.extractPublicationId(publication.id);
        onPublicationSelect(publicationId, publication.title);
      }
    } catch (err) {
      console.error('加载期数失败:', err);
    }
  }, [actions, onPublicationSelect]);

  // 选择期数
  const handleIssueSelect = useCallback((issue: IssueItem) => {
    actions.selectIssue(issue);
    
    if (onIssueSelect && selectedPublication) {
      const issueId = NewspaperService.extractIssueId(issue.manifest);
      onIssueSelect(issueId);
      
      // 加载manifest
      const publicationId = NewspaperService.extractPublicationId(selectedPublication.id);
      actions.loadManifest(publicationId, issueId);
    }
  }, [actions, selectedPublication, onIssueSelect]);

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 空格键切换侧边栏
      if (e.code === 'Space' && !e.target.matches('input, textarea, select')) {
        e.preventDefault();
        actions.toggleSidebar();
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
  }, [issues, selectedIssue, handleIssueSelect, actions]);

  // 错误状态处理
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">加载失败: {error}</p>
          <button 
            onClick={() => actions.loadPublications()}
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
                onClick={() => actions.toggleSidebar()}
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
                      onClick={() => actions.toggleSidebar()}
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
                <OptimizedIssueSelector />
                
                {/* 查看器区域 */}
                <div className="flex-1">
                  <OptimizedViewer />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};