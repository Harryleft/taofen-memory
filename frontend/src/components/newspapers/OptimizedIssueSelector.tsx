import React from 'react';
import { useNewspapers } from './NewspapersContext';
import { NewspaperService, IssueItem } from './services';

interface OptimizedIssueSelectorProps {
  className?: string;
}

export const OptimizedIssueSelector: React.FC<OptimizedIssueSelectorProps> = ({ className = '' }) => {
  const { state, actions } = useNewspapers();
  
  const {
    issues,
    selectedIssue,
    loading,
    selectedPublication
  } = state;

  // 处理期数选择
  const handleIssueSelect = (issue: IssueItem) => {
    actions.selectIssue(issue);
    
    // 加载manifest
    if (selectedPublication) {
      const publicationId = NewspaperService.extractPublicationId(selectedPublication.id);
      const issueId = NewspaperService.extractIssueId(issue.manifest);
      actions.loadManifest(publicationId, issueId);
    }
  };

  // 导航到上一个期数
  const handlePreviousIssue = () => {
    if (!selectedIssue || issues.length === 0) return;
    
    const currentIndex = issues.findIndex(issue => issue.manifest === selectedIssue.manifest);
    if (currentIndex > 0) {
      handleIssueSelect(issues[currentIndex - 1]);
    }
  };

  // 导航到下一个期数
  const handleNextIssue = () => {
    if (!selectedIssue || issues.length === 0) return;
    
    const currentIndex = issues.findIndex(issue => issue.manifest === selectedIssue.manifest);
    if (currentIndex < issues.length - 1) {
      handleIssueSelect(issues[currentIndex + 1]);
    }
  };

  // 获取当前期数的索引
  const getCurrentIndex = () => {
    if (!selectedIssue) return -1;
    return issues.findIndex(issue => issue.manifest === selectedIssue.manifest);
  };

  const currentIndex = getCurrentIndex();

  if (!selectedPublication) {
    return null;
  }

  return (
    <div className={`bg-white border-b border-gray-200 p-4 ${className}`}>
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">选择期数：</label>
        
        {/* 期数下拉选择器 */}
        <select
          value={selectedIssue?.manifest || ''}
          onChange={(e) => {
            const issue = issues.find(i => i.manifest === e.target.value);
            if (issue) handleIssueSelect(issue);
          }}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--newspapers-button-bg)] min-w-48"
          disabled={issues.length === 0 || loading}
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
        {issues.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousIssue}
              disabled={currentIndex <= 0 || loading}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← 上一期
            </button>
            
            <span className="text-sm text-gray-600">
              {currentIndex >= 0 ? `${currentIndex + 1} / ${issues.length}` : '-/-'}
            </span>
            
            <button
              onClick={handleNextIssue}
              disabled={currentIndex >= issues.length - 1 || loading}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一期 →
            </button>
          </div>
        )}
        
        {/* 加载状态指示器 */}
        {loading && (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            <span className="text-sm text-gray-600">加载中...</span>
          </div>
        )}
      </div>
    </div>
  );
};