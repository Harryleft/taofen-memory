import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NewspapersIntegratedLayout } from '../NewspapersIntegratedLayout';
import { NewspaperService } from '../services';

// 模拟 NewspaperService
jest.mock('../services', () => ({
  NewspaperService: {
    getPublications: jest.fn(),
    getIssuesPaginated: jest.fn(),
    getProxyUrl: jest.fn(),
  }
}));

const mockPublications = [
  {
    i: 0,
    id: 'test-pub-1',
    collection: 'https://example.com/collection.json',
    title: '生活周刊',
    name: '生活周刊',
    issueCount: 10,
    lastUpdated: '2023-01-01'
  },
  {
    i: 1,
    id: 'test-pub-2',
    collection: 'https://example.com/collection2.json',
    title: '新闻日报',
    name: '新闻日报',
    issueCount: 20,
    lastUpdated: '2023-01-02'
  }
];

const mockIssues = [
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
  }
];

describe('移动端抽屉功能测试', () => {
  beforeEach(() => {
    // 重置所有模拟函数
    jest.clearAllMocks();
    
    // 模拟 API 调用
    (NewspaperService.getPublications as jest.Mock).mockResolvedValue(mockPublications);
    (NewspaperService.getIssuesPaginated as jest.Mock).mockResolvedValue({
      data: mockIssues,
      hasMore: true
    });
    (NewspaperService.getProxyUrl as jest.Mock).mockImplementation((url: string) => 
      `/api/proxy?url=${encodeURIComponent(url)}`
    );
  });

  test('移动端初始状态不显示抽屉', async () => {
    render(<NewspapersIntegratedLayout />);
    
    // 等待数据加载
    await waitFor(() => {
      expect(screen.getByText('生活周刊')).toBeInTheDocument();
    });

    // 移动端抽屉不应该可见
    expect(screen.queryByText('选择刊物')).not.toBeInTheDocument();
  });

  test('移动端点击菜单按钮打开刊物抽屉', async () => {
    render(<NewspapersIntegratedLayout />);
    
    // 等待数据加载
    await waitFor(() => {
      expect(screen.getByText('生活周刊')).toBeInTheDocument();
    });

    // 模拟移动端环境
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    // 触发 resize 事件
    window.dispatchEvent(new Event('resize'));

    // 点击菜单按钮
    const menuButton = screen.getByRole('button', { name: /打开刊物选择/ });
    fireEvent.click(menuButton);

    // 抽屉应该打开
    await waitFor(() => {
      expect(screen.getByText('选择刊物')).toBeInTheDocument();
    });
  });

  test('移动端选择刊物后自动切换到期数抽屉', async () => {
    render(<NewspapersIntegratedLayout />);
    
    // 等待数据加载
    await waitFor(() => {
      expect(screen.getByText('生活周刊')).toBeInTheDocument();
    });

    // 模拟移动端环境
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    // 触发 resize 事件
    window.dispatchEvent(new Event('resize'));

    // 打开抽屉
    const menuButton = screen.getByRole('button', { name: /打开刊物选择/ });
    fireEvent.click(menuButton);

    // 选择刊物
    const publicationItem = screen.getByText('生活周刊');
    fireEvent.click(publicationItem);

    // 应该切换到期数抽屉
    await waitFor(() => {
      expect(screen.getByText('生活周刊')).toBeInTheDocument(); // 抽屉标题应该是刊物名称
      expect(screen.getByText('第01卷第001期')).toBeInTheDocument(); // 期数列表应该显示
    });
  });

  test('移动端选择期数后自动关闭抽屉', async () => {
    render(<NewspapersIntegratedLayout />);
    
    // 等待数据加载
    await waitFor(() => {
      expect(screen.getByText('生活周刊')).toBeInTheDocument();
    });

    // 模拟移动端环境
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    // 触发 resize 事件
    window.dispatchEvent(new Event('resize'));

    // 打开抽屉并选择刊物
    const menuButton = screen.getByRole('button', { name: /打开刊物选择/ });
    fireEvent.click(menuButton);

    const publicationItem = screen.getByText('生活周刊');
    fireEvent.click(publicationItem);

    // 等待期数加载
    await waitFor(() => {
      expect(screen.getByText('第01卷第001期')).toBeInTheDocument();
    });

    // 选择期数
    const issueItem = screen.getByText('第01卷第001期');
    fireEvent.click(issueItem);

    // 抽屉应该关闭
    await waitFor(() => {
      expect(screen.queryByText('选择刊物')).not.toBeInTheDocument();
      expect(screen.queryByText('生活周刊')).not.toBeInTheDocument(); // 抽屉标题
    });
  });

  test('移动端抽屉遮罩点击关闭抽屉', async () => {
    render(<NewspapersIntegratedLayout />);
    
    // 等待数据加载
    await waitFor(() => {
      expect(screen.getByText('生活周刊')).toBeInTheDocument();
    });

    // 模拟移动端环境
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    // 触发 resize 事件
    window.dispatchEvent(new Event('resize'));

    // 打开抽屉
    const menuButton = screen.getByRole('button', { name: /打开刊物选择/ });
    fireEvent.click(menuButton);

    // 抽屉应该打开
    await waitFor(() => {
      expect(screen.getByText('选择刊物')).toBeInTheDocument();
    });

    // 点击遮罩关闭抽屉
    const overlay = screen.getByRole('button', { name: /关闭抽屉/ });
    fireEvent.click(overlay);

    // 抽屉应该关闭
    await waitFor(() => {
      expect(screen.queryByText('选择刊物')).not.toBeInTheDocument();
    });
  });

  test('移动端触摸手势功能', async () => {
    render(<NewspapersIntegratedLayout />);
    
    // 等待数据加载
    await waitFor(() => {
      expect(screen.getByText('生活周刊')).toBeInTheDocument();
    });

    // 模拟移动端环境
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    // 触发 resize 事件
    window.dispatchEvent(new Event('resize'));

    // 打开抽屉
    const menuButton = screen.getByRole('button', { name: /打开刊物选择/ });
    fireEvent.click(menuButton);

    // 抽屉应该打开
    await waitFor(() => {
      expect(screen.getByText('选择刊物')).toBeInTheDocument();
    });

    // 模拟触摸事件需要 DOM 元素，这里主要测试触摸事件处理器是否被正确绑定
    const drawer = screen.getByText('选择刊物').closest('.newspapers-drawer');
    expect(drawer).toHaveAttribute('onTouchStart');
    expect(drawer).toHaveAttribute('onTouchMove');
    expect(drawer).toHaveAttribute('onTouchEnd');
  });

  test('移动端返回键处理', async () => {
    const mockPushState = jest.fn();
    const mockAddEventListener = jest.fn();
    const mockRemoveEventListener = jest.fn();

    // 模拟 history API
    Object.defineProperty(window, 'history', {
      writable: true,
      configurable: true,
      value: {
        pushState: mockPushState,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      },
    });

    render(<NewspapersIntegratedLayout />);
    
    // 等待数据加载
    await waitFor(() => {
      expect(screen.getByText('生活周刊')).toBeInTheDocument();
    });

    // 模拟移动端环境
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    // 触发 resize 事件
    window.dispatchEvent(new Event('resize'));

    // 打开抽屉
    const menuButton = screen.getByRole('button', { name: /打开刊物选择/ });
    fireEvent.click(menuButton);

    // 验证 history.pushState 被调用
    await waitFor(() => {
      expect(mockPushState).toHaveBeenCalled();
      expect(mockAddEventListener).toHaveBeenCalledWith('popstate', expect.any(Function));
    });
  });

  afterEach(() => {
    // 清理
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });
});