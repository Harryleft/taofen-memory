import React from 'react';
import { IIIFCollectionItem } from './iiifTypes';

interface IssueCardProps {
  issue: IIIFCollectionItem;
  onClick: () => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue, onClick }) => {
  const title = issue.label.zh?.[0] || issue.label.en?.[0] || '未知期数';
  
  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-4"
      onClick={onClick}
    >
      <div className="aspect-[3/4] bg-gray-200 rounded-md mb-3 flex items-center justify-center">
        <span className="text-gray-500 text-sm">期数封面</span>
      </div>
      <h3 className="font-semibold text-gray-800 text-center text-sm truncate">{title}</h3>
      <p className="text-gray-500 text-xs text-center mt-1">点击浏览</p>
    </div>
  );
};