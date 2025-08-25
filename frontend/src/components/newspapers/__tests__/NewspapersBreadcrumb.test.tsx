import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NewspapersBreadcrumb } from '../NewspapersBreadcrumb';
import { PublicationItem, IssueItem } from '../services';

// 模拟数据
const mockPublications: PublicationItem[] = [
  {
    i: 0,
    id: 'test-publication-1',
    collection: 'https://example.com/collection.json',
    title: '生活周刊',
    name: '生活周刊',
    issueCount: 10,
    lastUpdated: '2023-01-01'
  }
];

const mockSelectedPublication: PublicationItem = {
  i: 0,
  id: 'test-publication-1',
  collection: 'https://example.com/collection.json',
  title: '生活周刊',
  name: '生活周刊',
  issueCount: 10,
  lastUpdated: '2023-01-01'
};

const mockSelectedIssue: IssueItem = {
  i: 0,
  manifest: 'https://example.com/manifest.json',
  title: '第01卷第002期',
  summary: '测试期数摘要'
};

describe('NewspapersBreadcrumb', () => {
  test('renders root breadcrumb only when no selection', () => {
    const onRootSelect = jest.fn();
    
    render(
      <NewspapersBreadcrumb
        publications={mockPublications}
        selectedPublication={null}
        selectedIssue={null}
        onRootSelect={onRootSelect}
      />
    );

    expect(screen.getByText('数字报刊')).toBeInTheDocument();
    expect(screen.queryByText('生活周刊')).not.toBeInTheDocument();
    expect(screen.queryByText('第01卷第002期')).not.toBeInTheDocument();
  });

  test('renders publication breadcrumb when publication is selected', () => {
    const onPublicationSelect = jest.fn();
    
    render(
      <NewspapersBreadcrumb
        publications={mockPublications}
        selectedPublication={mockSelectedPublication}
        selectedIssue={null}
        onPublicationSelect={onPublicationSelect}
      />
    );

    expect(screen.getByText('数字报刊')).toBeInTheDocument();
    expect(screen.getByText('生活周刊')).toBeInTheDocument();
    expect(screen.queryByText('第01卷第002期')).not.toBeInTheDocument();
  });

  test('renders full breadcrumb when issue is selected', () => {
    const onIssueSelect = jest.fn();
    
    render(
      <NewspapersBreadcrumb
        publications={mockPublications}
        selectedPublication={mockSelectedPublication}
        selectedIssue={mockSelectedIssue}
        onIssueSelect={onIssueSelect}
      />
    );

    expect(screen.getByText('数字报刊')).toBeInTheDocument();
    expect(screen.getByText('生活周刊')).toBeInTheDocument();
    expect(screen.getByText('第01卷第002期')).toBeInTheDocument();
  });

  test('calls onRootSelect when root breadcrumb is clicked', () => {
    const onRootSelect = jest.fn();
    
    render(
      <NewspapersBreadcrumb
        publications={mockPublications}
        selectedPublication={mockSelectedPublication}
        selectedIssue={mockSelectedIssue}
        onRootSelect={onRootSelect}
      />
    );

    fireEvent.click(screen.getByText('数字报刊'));
    expect(onRootSelect).toHaveBeenCalled();
  });

  test('calls onPublicationSelect when publication breadcrumb is clicked', () => {
    const onPublicationSelect = jest.fn();
    
    render(
      <NewspapersBreadcrumb
        publications={mockPublications}
        selectedPublication={mockSelectedPublication}
        selectedIssue={mockSelectedIssue}
        onPublicationSelect={onPublicationSelect}
      />
    );

    fireEvent.click(screen.getByText('生活周刊'));
    expect(onPublicationSelect).toHaveBeenCalledWith(mockSelectedPublication);
  });

  test('shows mobile view on mobile', () => {
    const onRootSelect = jest.fn();
    
    render(
      <NewspapersBreadcrumb
        publications={mockPublications}
        selectedPublication={mockSelectedPublication}
        selectedIssue={mockSelectedIssue}
        onRootSelect={onRootSelect}
        isMobile={true}
      />
    );

    // 移动端应该只显示当前项目的简化视图
    expect(screen.getByText('第01卷第002期')).toBeInTheDocument();
    expect(screen.getByText('←')).toBeInTheDocument();
  });

  test('mobile back button works correctly', () => {
    const onPublicationSelect = jest.fn();
    
    render(
      <NewspapersBreadcrumb
        publications={mockPublications}
        selectedPublication={mockSelectedPublication}
        selectedIssue={mockSelectedIssue}
        onPublicationSelect={onPublicationSelect}
        isMobile={true}
      />
    );

    fireEvent.click(screen.getByText('←'));
    expect(onPublicationSelect).toHaveBeenCalledWith(mockSelectedPublication);
  });
});