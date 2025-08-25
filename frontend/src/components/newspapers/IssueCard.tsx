import React, { memo, useCallback } from 'react';
import { IssueItem } from './services';

interface IssueCardProps {
  issue: IssueItem;
  isSelected: boolean;
  onClick: (issue: IssueItem) => void;
}

// 优化：使用memo和自定义比较函数
export const IssueCard: React.FC<IssueCardProps> = memo(({
  issue,
  isSelected,
  onClick
}) => {
  // 优化：使用useCallback缓存点击处理函数
  const handleClick = useCallback(() => {
    onClick(issue);
  }, [issue, onClick]);

  return (
    <div
      className={`newspapers-issue-item ${isSelected ? 'newspapers-issue-item--selected' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`查看期数: ${issue.title}`}
    >
      <div className="newspapers-issue-item__title">
        {issue.title}
      </div>
      <div className="newspapers-issue-item__summary">
        {issue.summary}
      </div>
      <div className="newspapers-issue-item__action">
        <button 
          className="newspapers-issue-item__button"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          aria-label={`查看期数: ${issue.title}`}
        >
          查看本期
        </button>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // 优化：自定义比较函数，减少不必要的重新渲染
  return (
    prevProps.issue.manifest === nextProps.issue.manifest &&
    prevProps.issue.title === nextProps.issue.title &&
    prevProps.issue.summary === nextProps.issue.summary &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.onClick === nextProps.onClick
  );
});