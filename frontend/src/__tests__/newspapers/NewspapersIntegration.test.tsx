import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { NewspapersIntegratedLayout } from '../components/newspapers/NewspapersIntegratedLayout';
import { NewspaperService } from '../components/newspapers/services';

// Mock NewspaperService with more realistic behavior
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
    title: '人民日报',
    name: '人民日报',
    issueCount: 10,
    lastUpdated: '2024-01-01'
  },
  {
    i: 1,
    id: 'test-publication-2',
    collection: 'https://example.com/collection2.json',
    title: '光明日报',
    name: '光明日报',
    issueCount: 5,
    lastUpdated: '2024-01-02'
  }
];

const mockIssues = [
  {
    i: 0,
    manifest: 'https://example.com/issue1/manifest.json',
    title: '第1期',
    summary: '2024年1月1日'
  },
  {
    i: 1,
    manifest: 'https://example.com/issue2/manifest.json',
    title: '第2期',
    summary: '2024年1月2日'
  }
];

describe('NewspapersIntegratedLayout Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  describe('Complete User Flow', () => {
    test('should handle complete user flow from load to viewing', async () => {
      // Setup mocks
      (NewspaperService.getPublications as jest.Mock).mockResolvedValue(mockPublications);
      (NewspaperService.getIssues as jest.Mock).mockResolvedValue(mockIssues);
      (NewspaperService.extractPublicationId as jest.Mock).mockReturnValue('test-publication-1');
      (NewspaperService.extractIssueId as jest.Mock).mockReturnValue('issue1');
      (NewspaperService.getProxyUrl as jest.Mock).mockReturnValue('https://proxy.example.com/manifest.json');

      // Mock fetch for manifest validation
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 'test-manifest' })
      });

      render(<NewspapersIntegratedLayout />);

      // Step 1: Initial loading state
      expect(screen.getByText('加载报刊数据...')).toBeInTheDocument();

      // Step 2: Publications loaded
      await waitFor(() => {
        expect(screen.getByText('人民日报')).toBeInTheDocument();
        expect(screen.getByText('光明日报')).toBeInTheDocument();
      });

      // Step 3: Select publication
      await act(async () => {
        const publicationItem = screen.getByText('人民日报');
        fireEvent.click(publicationItem);
      });

      // Verify service calls
      expect(NewspaperService.getIssues).toHaveBeenCalledWith('test-publication-1');

      // Step 4: Issues loaded and first issue selected
      await waitFor(() => {
        expect(screen.getByText('期数：')).toBeInTheDocument();
        const select = screen.getByRole('combobox');
        expect(select).toBeInTheDocument();
      });

      // Step 5: Switch between issues
      await act(async () => {
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: mockIssues[1].manifest } });
      });

      // Verify manifest URL is updated
      await waitFor(() => {
        expect(NewspaperService.getProxyUrl).toHaveBeenCalled();
      });
    });

    test('should handle keyboard navigation between issues', async () => {
      (NewspaperService.getPublications as jest.Mock).mockResolvedValue(mockPublications);
      (NewspaperService.getIssues as jest.Mock).mockResolvedValue(mockIssues);
      (NewspaperService.extractPublicationId as jest.Mock).mockReturnValue('test-publication-1');
      (NewspaperService.extractIssueId as jest.Mock).mockReturnValue('issue1');
      (NewspaperService.getProxyUrl as jest.Mock).mockReturnValue('https://proxy.example.com/manifest.json');

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 'test-manifest' })
      });

      render(<NewspapersIntegratedLayout />);

      // Load and select publication
      await waitFor(async () => {
        const publicationItem = screen.getByText('人民日报');
        fireEvent.click(publicationItem);
      });

      // Wait for issues to load
      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      // Test keyboard navigation
      const leftArrowPressEvent = new KeyboardEvent('keydown', { code: 'ArrowLeft' });
      const rightArrowPressEvent = new KeyboardEvent('keydown', { code: 'ArrowRight' });

      // Simulate keyboard events
      window.dispatchEvent(leftArrowPressEvent);
      window.dispatchEvent(rightArrowPressEvent);

      // Verify event listeners are working
      expect(window.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    test('should handle responsive layout changes', async () => {
      (NewspaperService.getPublications as jest.Mock).mockResolvedValue(mockPublications);

      render(<NewspapersIntegratedLayout />);

      // Start with desktop view
      await waitFor(() => {
        expect(screen.getByText('报刊列表')).toBeInTheDocument();
      });

      // Switch to mobile view
      await act(async () => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 768,
        });
        window.dispatchEvent(new Event('resize'));
      });

      // Verify mobile behavior
      await waitFor(() => {
        expect(screen.getByText('加载报刊数据...')).toBeInTheDocument();
      });

      // Switch back to desktop view
      await act(async () => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1024,
        });
        window.dispatchEvent(new Event('resize'));
      });

      // Verify desktop behavior
      await waitFor(() => {
        expect(screen.getByText('报刊列表')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle publication loading error gracefully', async () => {
      (NewspaperService.getPublications as jest.Mock).mockRejectedValue(new Error('网络错误'));

      render(<NewspapersIntegratedLayout />);

      await waitFor(() => {
        expect(screen.getByText('加载失败')).toBeInTheDocument();
        expect(screen.getByText('网络错误')).toBeInTheDocument();
        expect(screen.getByText('重新加载')).toBeInTheDocument();
      });

      // Test reload functionality
      const reloadButton = screen.getByText('重新加载');
      fireEvent.click(reloadButton);

      // Verify service is called again
      expect(NewspaperService.getPublications).toHaveBeenCalledTimes(2);
    });

    test('should handle issue loading error', async () => {
      (NewspaperService.getPublications as jest.Mock).mockResolvedValue(mockPublications);
      (NewspaperService.getIssues as jest.Mock).mockRejectedValue(new Error('期数加载失败'));

      render(<NewspapersIntegratedLayout />);

      // Load publications
      await waitFor(() => {
        expect(screen.getByText('人民日报')).toBeInTheDocument();
      });

      // Try to select publication
      await act(async () => {
        const publicationItem = screen.getByText('人民日报');
        fireEvent.click(publicationItem);
      });

      // Verify error is handled
      await waitFor(() => {
        expect(screen.getByText('加载失败')).toBeInTheDocument();
      });
    });
  });

  describe('State Management Integration', () => {
    test('should maintain proper state across interactions', async () => {
      (NewspaperService.getPublications as jest.Mock).mockResolvedValue(mockPublications);
      (NewspaperService.getIssues as jest.Mock).mockResolvedValue(mockIssues);
      (NewspaperService.extractPublicationId as jest.Mock).mockReturnValue('test-publication-1');
      (NewspaperService.extractIssueId as jest.Mock).mockReturnValue('issue1');

      render(<NewspapersIntegratedLayout />);

      // Initial state
      await waitFor(() => {
        expect(screen.getByText('请从左侧选择一个刊物开始浏览')).toBeInTheDocument();
      });

      // Select publication
      await act(async () => {
        const publicationItem = screen.getByText('人民日报');
        fireEvent.click(publicationItem);
      });

      // State after selection
      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
        expect(screen.getByText('期数：')).toBeInTheDocument();
      });

      // Toggle sidebar
      await act(async () => {
        const toggleButton = screen.getByRole('button', { name: /关闭侧边栏/ });
        fireEvent.click(toggleButton);
      });

      // Verify sidebar is closed
      expect(screen.queryByText('人民日报')).not.toBeInTheDocument();

      // Reopen sidebar
      await act(async () => {
        const toggleButton = screen.getByRole('button', { name: /打开侧边栏/ });
        fireEvent.click(toggleButton);
      });

      // Verify sidebar is reopened
      expect(screen.getByText('人民日报')).toBeInTheDocument();
    });
  });
});