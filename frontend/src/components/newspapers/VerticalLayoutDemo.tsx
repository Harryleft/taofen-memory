import React, { useState } from 'react';
import { NewspapersLayout } from './NewspapersLayout';
import { PublicationItem, IssueItem } from './services';

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

// 模拟期数数据
const mockIssues: IssueItem[] = [
  {
    id: 'issue-1',
    manifest: 'https://example.com/manifest1.json',
    title: '2023年第1期',
    summary: '新年特刊',
    date: '2023-01-01'
  },
  {
    id: 'issue-2',
    manifest: 'https://example.com/manifest2.json',
    title: '2023年第2期',
    summary: '春节特别报道',
    date: '2023-01-15'
  },
  {
    id: 'issue-3',
    manifest: 'https://example.com/manifest3.json',
    title: '2023年第3期',
    summary: '春季生活指南',
    date: '2023-02-01'
  }
];

/**
 * 垂直布局演示组件 - 界面1
 * 
 * 展示新的垂直卡片布局和引导区域
 */
export const VerticalLayoutDemo: React.FC = () => {
  const [selectedPublication, setSelectedPublication] = useState<PublicationItem | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<IssueItem | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePublicationSelect = (publication: PublicationItem) => {
    console.log('Selected publication:', publication.title);
    setSelectedPublication(publication);
    setSelectedIssue(null);
    
    // 模拟加载期数
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleIssueSelect = (issue: IssueItem) => {
    console.log('Selected issue:', issue.title);
    setSelectedIssue(issue);
  };

  const handleRootSelect = () => {
    console.log('Back to root');
    setSelectedPublication(null);
    setSelectedIssue(null);
  };

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <NewspapersLayout
        publications={mockPublications}
        selectedPublication={selectedPublication}
        selectedIssue={selectedIssue}
        onPublicationSelect={handlePublicationSelect}
        onIssueSelect={handleIssueSelect}
        onRootSelect={handleRootSelect}
        isMobile={false}
        issues={mockIssues}
        loading={loading}
      >
        {/* 主内容区域 - 可以添加查看器或其他内容 */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          backgroundColor: '#f8f9fa',
          color: '#6c757d'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h2>数字报刊查看器</h2>
            <p>选择一个期数开始阅读</p>
            {selectedIssue && (
              <div>
                <p>当前选择: {selectedIssue.title}</p>
                <p>{selectedIssue.summary}</p>
              </div>
            )}
          </div>
        </div>
      </NewspapersLayout>
    </div>
  );
};

export default VerticalLayoutDemo;