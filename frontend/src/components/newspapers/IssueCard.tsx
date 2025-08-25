import React, { memo } from 'react';
import { IssueItem } from './services';

interface IssueCardProps {
  issue: IssueItem;
  isSelected: boolean;
  onClick: (issue: IssueItem) => void;
}

export const IssueCard: React.FC<IssueCardProps> = memo(({ issue, isSelected, onClick }) => {
  return (
    <div
      className={`newspapers-issue-item ${isSelected ? 'newspapers-issue-item--selected' : ''}`}
      onClick={() => onClick(issue)}
    >
      <div className="newspapers-issue-item__title">
        {issue.title}
      </div>
      <div className="newspapers-issue-item__summary">
        {issue.summary}
      </div>
      <div className="newspapers-issue-item__action">
        <button className="newspapers-issue-item__button">
          查看本期
        </button>
      </div>
    </div>
  );
});