import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NewspapersMobileLayout } from '../components/newspapers/NewspapersMobileLayout';
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
  }
];

const mockIssues = [
  {
    i: 0,
    manifest: 'https://example.com/issue1/manifest.json',
    title: '第1期',
    summary: '测试期数1'
  }
];

describe('NewspapersMobileLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render mobile layout', async () => {
    (NewspaperService.getPublications as jest.Mock).mockResolvedValue(mockPublications);
    
    render(<NewspapersMobileLayout />);
    
    await waitFor(() => {
      expect(screen.getByText('加载报刊数据...')).toBeInTheDocument();
    });
  });

  test('should handle publication selection in mobile', async () => {
    (NewspaperService.getPublications as jest.Mock).mockResolvedValue(mockPublications);
    (NewspaperService.getIssues as jest.Mock).mockResolvedValue(mockIssues);
    (NewspaperService.extractPublicationId as jest.Mock).mockReturnValue('test-publication-1');
    (NewspaperService.extractIssueId as jest.Mock).mockReturnValue('issue1');
    
    render(<NewspapersMobileLayout />);
    
    await waitFor(() => {
      const publicationItem = screen.getByText('测试刊物1');
      fireEvent.click(publicationItem);
    });
    
    await waitFor(() => {
      expect(NewspaperService.getIssues).toHaveBeenCalledWith('test-publication-1');
    });
  });

  test('should be responsive to window resize', async () => {
    (NewspaperService.getPublications as jest.Mock).mockResolvedValue(mockPublications);
    
    render(<NewspapersMobileLayout />);
    
    // Test resize behavior
    const resizeEvent = new Event('resize');
    window.dispatchEvent(resizeEvent);
    
    await waitFor(() => {
      expect(screen.getByText('加载报刊数据...')).toBeInTheDocument();
    });
  });
});