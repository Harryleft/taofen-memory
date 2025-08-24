import { NewspaperService, PublicationItem, IssueItem } from '../components/newspapers/services';

// Mock fetch
global.fetch = jest.fn();

describe('NewspaperService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPublications', () => {
    test('should fetch publications successfully', async () => {
      const mockCollection = {
        items: [
          {
            id: 'https://example.com/test1/collection.json',
            label: { zh: ['测试刊物1'] }
          },
          {
            id: 'https://example.com/test2/collection.json',
            label: { 'zh-CN': ['测试刊物2'] }
          }
        ]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCollection)
      });

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: [] })
      });

      const result = await NewspaperService.getPublications();

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('测试刊物1');
      expect(result[1].title).toBe('测试刊物2');
    });

    test('should handle fetch error', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await NewspaperService.getPublications();

      expect(result).toEqual([]);
    });

    test('should handle HTTP error', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404
      });

      const result = await NewspaperService.getPublications();

      expect(result).toEqual([]);
    });
  });

  describe('getIssuesForPublication', () => {
    test('should fetch issues for publication', async () => {
      const mockIssues = {
        items: [
          {
            id: 'https://example.com/issue1/manifest.json',
            label: { 'zh-CN': ['第1期'] },
            summary: { 'zh-CN': ['测试期数1'] }
          },
          {
            id: 'https://example.com/issue2/manifest.json',
            label: { zh: ['第2期'] },
            summary: { zh: ['测试期数2'] }
          }
        ]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockIssues)
      });

      const result = await NewspaperService.getIssuesForPublication('https://example.com/collection.json');

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('第1期');
      expect(result[1].title).toBe('第2期');
    });

    test('should handle empty issues', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: [] })
      });

      const result = await NewspaperService.getIssuesForPublication('https://example.com/collection.json');

      expect(result).toEqual([]);
    });
  });

  describe('getManifest', () => {
    test('should fetch manifest with full URL', async () => {
      const mockManifest = {
        id: 'https://example.com/manifest.json',
        label: { zh: ['测试刊物'] },
        items: []
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockManifest)
      });

      const result = await NewspaperService.getManifest('https://example.com/manifest.json');

      expect(result.id).toBe('https://example.com/manifest.json');
      expect(fetch).toHaveBeenCalledWith('https://example.com/manifest.json');
    });

    test('should build manifest URL for manifest ID', async () => {
      const mockManifest = {
        id: 'https://www.ai4dh.cn/iiif/3/manifests/test/manifest.json',
        label: { zh: ['测试刊物'] },
        items: []
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockManifest)
      });

      const result = await NewspaperService.getManifest('test');

      expect(result.id).toBe('https://www.ai4dh.cn/iiif/3/manifests/test/manifest.json');
    });
  });

  describe('extractPublicationId', () => {
    test('should extract publication ID from collection URL', () => {
      const result = NewspaperService.extractPublicationId('https://example.com/test123/collection.json');
      expect(result).toBe('test123');
    });

    test('should return empty string for invalid URL', () => {
      const result = NewspaperService.extractPublicationId('invalid-url');
      expect(result).toBe('');
    });
  });

  describe('extractIssueId', () => {
    test('should extract issue ID from full URL', () => {
      const result = NewspaperService.extractIssueId('https://example.com/issue123/manifest.json');
      expect(result).toBe('issue123');
    });

    test('should extract issue ID from relative path', () => {
      const result = NewspaperService.extractIssueId('issue123/manifest.json');
      expect(result).toBe('issue123');
    });
  });

  describe('filterPublications', () => {
    const mockPublications: PublicationItem[] = [
      {
        i: 0,
        id: 'test1',
        collection: '',
        title: '人民日报',
        name: '人民日报',
        issueCount: 10,
        lastUpdated: '2024-01-01'
      },
      {
        i: 1,
        id: 'test2',
        collection: '',
        title: '光明日报',
        name: '光明日报',
        issueCount: 5,
        lastUpdated: '2024-01-02'
      }
    ];

    test('should filter publications by search term', () => {
      const result = NewspaperService.filterPublications(mockPublications, '人民');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('人民日报');
    });

    test('should sort publications by name', () => {
      const result = NewspaperService.filterPublications(mockPublications, '', 'name');
      expect(result[0].title).toBe('人民日报');
      expect(result[1].title).toBe('光明日报');
    });

    test('should sort publications by issue count', () => {
      const result = NewspaperService.filterPublications(mockPublications, '', 'count');
      expect(result[0].issueCount).toBe(10);
      expect(result[1].issueCount).toBe(5);
    });
  });

  describe('getProxyUrl', () => {
    test('should return proxy URL for external URLs in development', () => {
      const originalEnv = import.meta.env.DEV;
      Object.defineProperty(import.meta.env, 'DEV', { value: true });

      const result = NewspaperService.getProxyUrl('https://example.com/manifest.json');
      expect(result).toBe('/proxy?url=https%3A%2F%2Fexample.com%2Fmanifest.json');

      Object.defineProperty(import.meta.env, 'DEV', { value: originalEnv });
    });

    test('should return original URL in production', () => {
      const originalEnv = import.meta.env.DEV;
      Object.defineProperty(import.meta.env, 'DEV', { value: false });

      const result = NewspaperService.getProxyUrl('https://example.com/manifest.json');
      expect(result).toBe('https://example.com/manifest.json');

      Object.defineProperty(import.meta.env, 'DEV', { value: originalEnv });
    });
  });
});