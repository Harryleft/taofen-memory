import React from 'react';
import { IssueItem } from './services';

interface IssueDrawerProps {
  publicationTitle: string;
  issues: IssueItem[];
  selectedIssue: IssueItem | null;
  onIssueSelect: (issue: IssueItem) => void;
  onIssuePreview: (issue: IssueItem) => void;
  isOpen?: boolean;
}

export const IssueDrawer: React.FC<IssueDrawerProps> = ({
  publicationTitle,
  issues,
  selectedIssue,
  onIssueSelect,
  onIssuePreview,
  isOpen = true
}) => {
  if (!isOpen) return null;

  return (
    <div className="w-[30%] h-full bg-white border-l border-gray-300 flex flex-col">
      {/* 抽屉标题 */}
      <div className="bg-blue-600 text-white p-4">
        <h2 className="text-lg font-semibold">刊物：{publicationTitle}</h2>
        <p className="text-sm opacity-90">期数清单（按时间倒序）</p>
      </div>
      
      {/* 期数列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {issues.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              暂无期数数据
            </div>
          ) : (
            issues.map((issue) => (
              <div 
                key={issue.manifest}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  selectedIssue?.manifest === issue.manifest
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span className="font-medium text-gray-800">{issue.title}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onIssuePreview(issue);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded hover:bg-blue-50"
                  >
                    预览
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onIssueSelect(issue);
                    }}
                    className="text-green-600 hover:text-green-800 text-sm px-2 py-1 rounded hover:bg-green-50"
                  >
                    在UV打开
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};