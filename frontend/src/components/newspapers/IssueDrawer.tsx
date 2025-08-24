import React from 'react';
import { IssueItem } from './services';

interface IssueDrawerProps {
  publicationTitle: string;
  issues: IssueItem[];
  selectedIssue: IssueItem | null;
  onIssueSelect: (issue: IssueItem) => void;
  isOpen?: boolean;
  loading?: boolean;
}

export const IssueDrawer: React.FC<IssueDrawerProps> = ({
  publicationTitle,
  issues,
  selectedIssue,
  onIssueSelect,
  isOpen = true,
  loading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="w-[30%] h-full bg-white border-l border-gray-300 flex flex-col">
      {/* 抽屉标题 */}
      <div className="bg-[var(--drawer-header-bg)] text-[var(--drawer-header-text)] p-4">
        <h2 className="text-lg font-semibold">刊物：{publicationTitle}</h2>
        <p className="text-sm opacity-90">期数清单（按时间倒序）</p>
      </div>
      
      {/* 期数列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mb-2"></div>
              <p className="text-gray-600">加载期数列表...</p>
            </div>
          ) : issues.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              暂无期数数据
            </div>
          ) : (
            issues.map((issue) => (
              <div 
                key={issue.manifest}
                className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                  selectedIssue?.manifest === issue.manifest
                    ? 'bg-[rgba(196,155,97,0.1)] border-[var(--newspapers-button-bg)]'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => onIssueSelect(issue)}
              >
                <span className="font-medium text-gray-800">{issue.title}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};