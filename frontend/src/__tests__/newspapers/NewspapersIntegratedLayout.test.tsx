import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NewspapersIntegratedLayout } from '../components/newspapers/NewspapersIntegratedLayout';
import { NewspaperService } from '../components/newspapers/services';

// Mock NewspaperService
jest.mock('../components/newspapers/services', () => ({
  NewspaperService: {
    getPublications: jest.fn(),
    getIssues: jest.fn(),
    extractPublicationId: jest.fn(),
    extractIssueId: jest.fn(),
    getProxyUrl: jest.fn(),
  },
}));

const mockPublications = [
  {
    i: 0,
    id: 'test-publication-1',
    collection: 'https://example.com/collection.json',
    title: '测试刊物1',
    name: '测试刊物1',
    issueCount: 10,
    lastUpdated: '2024-01-01'
  },
  {
    i: 1,
    id: 'test-publication-2',
    collection: 'https://example.com/collection2.json',
    title: '测试刊物2',
    name: '测试刊物2',
    issueCount: 5,
    lastUpdated: '2024-01-02'
  }
];

const mockIssues = [
  {
    i: 0,
    manifest: 'https://example.com/issue1/manifest.json',
    title: '第1期',
    summary: '测试期数1'
  },
  {
    i: 1,
    manifest: 'https://example.com/issue2/manifest.json',
    title: '第2期',
    summary: '测试期数2'
  }
];

describe('NewspapersIntegratedLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  test('should render loading state initially', () => {
    (NewspaperService.getPublications as jest.Mock).mockResolvedValue(mockPublications);
    
    render(<NewspapersIntegratedLayout />);
    
    expect(screen.getByText('加载报刊数据...')).toBeInTheDocument();
  });

  test('should render publications list after loading', async () => {
    (NewspaperService.getPublications as jest.Mock).mockResolvedValue(mockPublications);
    
    render(<NewspapersIntegratedLayout />);
    
    await waitFor(() => {
      expect(screen.getByText('测试刊物1')).toBeInTheDocument();
      expect(screen.getByText('测试刊物2')).toBeInTheDocument();
    });
  });

  test('should load issues when publication is selected', async () => {
    (NewspaperService.getPublications as jest.Mock).mockResolvedValue(mockPublications);
    (NewspaperService.getIssues as jest.Mock).mockResolvedValue(mockIssues);
    (NewspaperService.extractPublicationId as jest.Mock).mockReturnValue('test-publication-1');
    (NewspaperService.extractIssueId as jest.Mock).mockReturnValue('issue1');
    
    render(<NewspapersIntegratedLayout />);
    
    await waitFor(() => {
      const publicationItem = screen.getByText('测试刊物1');
      fireEvent.click(publicationItem);
    });
    
    await waitFor(() => {
      expect(NewspaperService.getIssues).toHaveBeenCalledWith('test-publication-1');
    });
  });

  test('should show empty state when no publication is selected', async () => {
    (NewspaperService.getPublications as jest.Mock).mockResolvedValue(mockPublications);
    
    render(<NewspapersIntegratedLayout />);
    
    await waitFor(() => {
      expect(screen.getByText('请从左侧选择一个刊物开始浏览')).toBeInTheDocument();
    });
  });

  test('should handle error state', async () => {
    (NewspaperService.getPublications as jest.Mock).mockRejectedValue(new Error('加载失败'));
    
    render(<NewspapersIntegratedLayout />);
    
    await waitFor(() => {
      expect(screen.getByText('加载失败')).toBeInTheDocument();
    });
  });

  test('should handle mobile layout', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });
    
    (NewspaperService.getPublications as jest.Mock).mockResolvedValue(mockPublications);
    
    render(<NewspapersIntegratedLayout />);
    
    await waitFor(() => {
      // Should render mobile layout
      expect(screen.getByText('加载报刊数据...')).toBeInTheDocument();
    });
  });

  test('should toggle sidebar', async () => {
    (NewspaperService.getPublications as jest.Mock).mockResolvedValue(mockPublications);
    
    render(<NewspapersIntegratedLayout />);
    
    await waitFor(() => {
      const toggleButton = screen.getByRole('button', { name: /关闭侧边栏/ });
      fireEvent.click(toggleButton);
    });
    
    // Sidebar should be closed
    expect(screen.queryByText('测试刊物1')).not.toBeInTheDocument();
  });
});