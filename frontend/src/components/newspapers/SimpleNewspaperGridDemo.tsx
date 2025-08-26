import React from 'react';
import { SimpleNewspaperCard } from './SimpleNewspaperCard';
import { PublicationItem } from './services';

// 模拟6个报刊数据
const mockPublications: PublicationItem[] = [
  {
    i: 0,
    id: 'publication-1',
    collection: 'https://example.com/collection1.json',
    title: '生活周刊',
    name: '生活周刊',
    issueCount: 52,
    lastUpdated: '2023-12-01'
  },
  {
    i: 1,
    id: 'publication-2',
    collection: 'https://example.com/collection2.json',
    title: '大众生活周刊',
    name: '大众生活周刊',
    issueCount: 48,
    lastUpdated: '2023-11-28'
  },
  {
    i: 2,
    id: 'publication-3',
    collection: 'https://example.com/collection3.json',
    title: '申报副刊',
    name: '申报副刊',
    issueCount: 156,
    lastUpdated: '2023-12-05'
  },
  {
    i: 3,
    id: 'publication-4',
    collection: 'https://example.com/collection4.json',
    title: '新民晚报',
    name: '新民晚报',
    issueCount: 365,
    lastUpdated: '2023-12-10'
  },
  {
    i: 4,
    id: 'publication-5',
    collection: 'https://example.com/collection5.json',
    title: '文汇报',
    name: '文汇报',
    issueCount: 300,
    lastUpdated: '2023-12-08'
  },
  {
    i: 5,
    id: 'publication-6',
    collection: 'https://example.com/collection6.json',
    title: '解放日报',
    name: '解放日报',
    issueCount: 280,
    lastUpdated: '2023-12-09'
  }
];

interface SimpleNewspaperGridDemoProps {
  onPublicationSelect?: (publication: PublicationItem) => void;
  selectedPublicationId?: string;
}

export const SimpleNewspaperGridDemo: React.FC<SimpleNewspaperGridDemoProps> = ({
  onPublicationSelect,
  selectedPublicationId
}) => {
  const handlePublicationClick = (publication: PublicationItem) => {
    console.log('Selected publication:', publication.title);
    if (onPublicationSelect) {
      onPublicationSelect(publication);
    }
  };

  return (
    <div className="simple-newspaper-demo">
      <div className="newspapers-simple-grid">
        {mockPublications.map((publication) => (
          <SimpleNewspaperCard
            key={publication.id}
            publication={publication}
            isSelected={selectedPublicationId === publication.id}
            onClick={handlePublicationClick}
          />
        ))}
      </div>
    </div>
  );
};

export default SimpleNewspaperGridDemo;