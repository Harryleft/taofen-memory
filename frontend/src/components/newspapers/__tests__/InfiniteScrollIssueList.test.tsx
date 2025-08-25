import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { InfiniteScrollIssueList } from '../InfiniteScrollIssueList';
import { IssueItem } from '../services';

const mockIssues: IssueItem[] = [
  {
    i: 0,
    manifest: 'https://example.com/manifest1.json',
    title: '第01卷第001期',
    summary: '测试期数1'
  },
  {
    i: 1,
    manifest: 'https://example.com/manifest2.json',
    title: '第01卷第002期',
    summary: '测试期数2'
  },
  {
    i: 2,
    manifest: 'https://example.com/manifest3.json',
    title: '第01卷第003期',
    summary: '测试期数3'
  }
];

describe('无限滚动加载功能测试', () => {
  beforeEach(() => {
    // 模拟 IntersectionObserver
    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    });
    window.IntersectionObserver = mockIntersectionObserver;
  });

  test('渲染期数列表', () => {
    const onLoadMore = jest.fn();
    const onIssueSelect = jest.fn();

    render(
      <InfiniteScrollIssueList
        issues={mockIssues}
        selectedIssue={null}
        loading={false}
        hasMore={true}
        onLoadMore={onLoadMore}
        onIssueSelect={onIssueSelect}
      />
    );

    expect(screen.getByText('第01卷第001期')).toBeInTheDocument();
    expect(screen.getByText('第01卷第002期')).toBeInTheDocument();
    expect(screen.getByText('第01卷第003期')).toBeInTheDocument();
  });

  test('显示加载状态', () => {
    const onLoadMore = jest.fn();
    const onIssueSelect = jest.fn();

    render(
      <InfiniteScrollIssueList
        issues={mockIssues}
        selectedIssue={null}
        loading={true}
        hasMore={true}
        onLoadMore={onLoadMore}
        onIssueSelect={onIssueSelect}
      />
    );

    expect(screen.getByText('加载更多...')).toBeInTheDocument();
  });

  test('显示错误状态', () => {
    const onLoadMore = jest.fn();
    const onIssueSelect = jest.fn();

    render(
      <InfiniteScrollIssueList
        issues={mockIssues}
        selectedIssue={null}
        loading={false}
        hasMore={true}
        onLoadMore={onLoadMore}
        onIssueSelect={onIssueSelect}
        error="网络连接失败"
        retryCount={1}
        onRetry={onLoadMore}
      />
    );

    expect(screen.getByText('加载失败')).toBeInTheDocument();
    expect(screen.getByText('重试 (1/3)')).toBeInTheDocument();
  });

  test('显示没有更多数据', () => {
    const onLoadMore = jest.fn();
    const onIssueSelect = jest.fn();

    render(
      <InfiniteScrollIssueList
        issues={mockIssues}
        selectedIssue={null}
        loading={false}
        hasMore={false}
        onLoadMore={onLoadMore}
        onIssueSelect={onIssueSelect}
      />
    );

    expect(screen.getByText('已加载全部期数')).toBeInTheDocument();
  });

  test('点击期数项目触发选择', () => {
    const onLoadMore = jest.fn();
    const onIssueSelect = jest.fn();

    render(
      <InfiniteScrollIssueList
        issues={mockIssues}
        selectedIssue={null}
        loading={false}
        hasMore={true}
        onLoadMore={onLoadMore}
        onIssueSelect={onIssueSelect}
      />
    );

    const issueItem = screen.getByText('第01卷第001期');
    fireEvent.click(issueItem);

    expect(onIssueSelect).toHaveBeenCalledWith(mockIssues[0]);
  });

  test('选中的期数高亮显示', () => {
    const onLoadMore = jest.fn();
    const onIssueSelect = jest.fn();

    render(
      <InfiniteScrollIssueList
        issues={mockIssues}
        selectedIssue={mockIssues[1]}
        loading={false}
        hasMore={true}
        onLoadMore={onLoadMore}
        onIssueSelect={onIssueSelect}
      />
    );

    const selectedIssueElement = screen.getByText('第01卷第002期');
    expect(selectedIssueElement.closest('.newspapers-issue-item--selected')).toBeInTheDocument();
  });

  test('重试按钮点击事件', () => {
    const onLoadMore = jest.fn();
    const onIssueSelect = jest.fn();

    render(
      <InfiniteScrollIssueList
        issues={mockIssues}
        selectedIssue={null}
        loading={false}
        hasMore={true}
        onLoadMore={onLoadMore}
        onIssueSelect={onIssueSelect}
        error="网络连接失败"
        retryCount={2}
        onRetry={onLoadMore}
      />
    );

    const retryButton = screen.getByText('重试 (2/3)');
    fireEvent.click(retryButton);

    expect(onLoadMore).toHaveBeenCalled();
  });

  test('超过重试次数不显示重试按钮', () => {
    const onLoadMore = jest.fn();
    const onIssueSelect = jest.fn();

    render(
      <InfiniteScrollIssueList
        issues={mockIssues}
        selectedIssue={null}
        loading={false}
        hasMore={true}
        onLoadMore={onLoadMore}
        onIssueSelect={onIssueSelect}
        error="网络连接失败"
        retryCount={3}
        onRetry={onLoadMore}
      />
    );

    expect(screen.getByText('加载失败')).toBeInTheDocument();
    expect(screen.queryByText('重试 (3/3)')).not.toBeInTheDocument();
  });

  test('空列表不显示内容', () => {
    const onLoadMore = jest.fn();
    const onIssueSelect = jest.fn();

    render(
      <InfiniteScrollIssueList
        issues={[]}
        selectedIssue={null}
        loading={false}
        hasMore={false}
        onLoadMore={onLoadMore}
        onIssueSelect={onIssueSelect}
      />
    );

    expect(screen.queryByText('已加载全部期数')).not.toBeInTheDocument();
    expect(screen.queryByText('加载更多...')).not.toBeInTheDocument();
    expect(screen.queryByText('加载失败')).not.toBeInTheDocument();
  });

  afterEach(() => {
    // 清理
    delete (window as any).IntersectionObserver;
  });
});