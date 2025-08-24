/**
 * 优化后的ViewerPage组件 - 使用新的架构
 * 
 * 优化点：
 * - 使用hook管理状态
 * - 统一错误处理
 * - 性能优化
 * - 更好的用户体验
 */

import React, { useEffect, useCallback } from 'react';
import { useUniversalViewer } from './hooks/useUniversalViewer';
import { useViewerContext } from './context/ViewerContext';
import { IIIFErrorHandler } from './utils/errorHandler';
import { IssueDrawer } from './IssueDrawer';
import { IssueItem } from './services';

interface OptimizedViewerPageProps {
  publicationId: string;
  issueId: string;
  publicationTitle?: string;
  allIssues?: IssueItem[];
  onIssueSelect?: (issue: IssueItem) => void;
}

export const OptimizedViewerPage: React.FC<OptimizedViewerPageProps> = ({
  publicationId,
  issueId,
  publicationTitle = '',
  allIssues = [],
  onIssueSelect
}) => {
  const { state: viewerState, actions: viewerActions } = useViewerContext();
  const { state, actions, iframeRef } = useUniversalViewer({
    publicationId,
    issueId,
    autoLoad: true,
    useProxy: true,
    enableCache: true,
    retryCount: 3
  });

  // 同步状态到context
  useEffect(() => {
    viewerActions.setLoading(state.loading);
    if (state.error) {
      viewerActions.setError(state.error);
    }
    viewerActions.setViewerReady(state.viewerReady);
  }, [state.loading, state.error, state.viewerReady, viewerActions]);

  // 处理期数选择
  const handleIssueSelect = useCallback(async (issue: IssueItem) => {
    try {
      viewerActions.setLoading(true);
      
      const newIssueId = issue.manifest.split('/').pop()?.replace('.json', '') || '';
      
      // 使用hook的switchIssue方法
      await actions.switchIssue(newIssueId);
      
      // 更新context历史记录
      viewerActions.addToHistory(publicationId, newIssueId);
      
      // 通知父组件
      if (onIssueSelect) {
        onIssueSelect(issue);
      }
      
    } catch (error) {
      viewerActions.setError(error);
    } finally {
      viewerActions.setLoading(false);
    }
  }, [publicationId, actions, viewerActions, onIssueSelect]);

  // 处理错误重试
  const handleRetry = useCallback(() => {
    viewerActions.clearError();
    actions.reloadViewer();
  }, [viewerActions, actions]);

  // 处理页面重新加载
  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);

  // 渲染加载状态
  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">加载查看器...</p>
        </div>
      </div>
    );
  }

  // 渲染错误状态
  if (state.error) {
    const iiifError = IIIFErrorHandler.handleError(state.error);
    const userMessage = IIIFErrorHandler.getUserFriendlyMessage(iiifError);
    const suggestion = IIIFErrorHandler.getRecoverySuggestion(iiifError);
    
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-md">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h3 className="font-bold">❌ 查看器加载失败</h3>
            <p className="text-sm mt-1">{userMessage}</p>
            <p className="text-xs mt-2 text-red-600">{suggestion}</p>
          </div>
          
          <div className="space-x-4">
            {iiifError.recoverable && (
              <button 
                onClick={handleRetry}
                className="btn-newspapers px-4 py-2 rounded"
              >
                重试
              </button>
            )}
            <button 
              onClick={handleReload}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              重新加载页面
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 渲染主界面
  return (
    <div className="h-screen bg-white flex">
      {/* 左侧主视图区域 */}
      <div className={`${viewerState.settings.viewMode === 'single' ? 'w-full' : 'w-[70%]'} h-full flex flex-col border-r border-gray-300`}>
        {/* 顶部工具栏 */}
        <div className="bg-gray-100 border-b border-gray-300 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="text-[var(--newspapers-button-bg)] hover:text-[var(--newspapers-button-hover)] font-medium">
              ← 返回书籍
            </button>
            <span className="text-gray-600">
              {publicationTitle} - {state.currentIssueId}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* 历史导航 */}
            {viewerActions.canGoBack() && (
              <button 
                onClick={viewerActions.goBack}
                className="text-gray-600 hover:text-gray-800"
                title="后退"
              >
                ←
              </button>
            )}
            
            {/* 视图模式切换 */}
            <select 
              value={viewerState.settings.viewMode}
              onChange={(e) => viewerActions.updateSettings({ 
                viewMode: e.target.value as 'single' | 'double' | 'grid' 
              })}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="single">单页</option>
              <option value="double">双页</option>
              <option value="grid">网格</option>
            </select>
            
            {/* 缩放控制 */}
            <select 
              value={viewerState.settings.zoomLevel}
              onChange={(e) => viewerActions.updateSettings({ 
                zoomLevel: Number(e.target.value) 
              })}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value={0.5}>50%</option>
              <option value={0.75}>75%</option>
              <option value={1}>100%</option>
              <option value={1.25}>125%</option>
              <option value={1.5}>150%</option>
              <option value={2}>200%</option>
            </select>
          </div>
        </div>
        
        {/* UV查看器区域 */}
        <div className="flex-1 bg-gray-50 relative">
          {state.loading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 m-4 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white text-lg">正在加载期数内容...</p>
              </div>
            </div>
          )}
          
          <div className="uv-frame-wrap h-full border border-gray-300 rounded-lg overflow-hidden m-4">
            <iframe
              ref={iframeRef}
              id="uv-frame"
              title="Universal Viewer"
              allowFullScreen
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
              onLoad={() => {
                console.log('Iframe加载完成');
                viewerActions.setViewerReady(true);
              }}
            />
          </div>
        </div>
        
        {/* 性能监控信息 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-100 border-t border-gray-300 p-2 text-xs text-gray-600">
            加载时间: {viewerState.performance.loadTime}ms | 
            错误计数: {viewerState.performance.errorCount} | 
            历史记录: {viewerState.history.length}
          </div>
        )}
      </div>
      
      {/* 右侧抽屉组件 */}
      {viewerState.settings.viewMode !== 'single' && (
        <IssueDrawer
          publicationTitle={publicationTitle}
          issues={allIssues}
          selectedIssue={allIssues.find(issue => 
            issue.manifest.includes(state.currentIssueId)
          )}
          onIssueSelect={handleIssueSelect}
          loading={state.loading}
        />
      )}
    </div>
  );
};