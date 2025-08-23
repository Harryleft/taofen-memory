import React from 'react';
import { IIIFCollectionItem } from './iiifTypes';

interface NewspaperCardProps {
  publication: IIIFCollectionItem;
  onClick: () => void;
}

export const NewspaperCard: React.FC<NewspaperCardProps> = ({ publication, onClick }) => {
  const title = publication.label.zh?.[0] || publication.label.en?.[0] || '未知刊物';
  
  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-4"
      onClick={onClick}
    >
      <div className="aspect-[3/4] bg-gray-200 rounded-md mb-3 flex items-center justify-center">
        <span className="text-gray-500 text-sm">刊物封面</span>
      </div>
      <h3 className="font-semibold text-gray-800 text-center truncate">{title}</h3>
      <p className="text-gray-500 text-sm text-center mt-1">点击查看期数</p>
    </div>
  );
};