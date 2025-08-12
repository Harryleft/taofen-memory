import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HandwritingCacheManager, createHandwritingCacheManager, CACHE_STRATEGIES } from '@/lib/cache/RedisCacheManager';
import { computeFilteredItems } from '@/hooks/useHandwritingFilters';

// Mock Redis client
const mockRedis = {
  get: vi.fn(),
  setex: vi.fn(),
  del: vi.fn(),
  keys: vi.fn(),
  ping: vi.fn(),
  quit: vi.fn(),
  on: vi.fn(),
};

vi.mock('ioredis', () => ({
  default: vi.fn().mockImplementation(() => mockRedis),
}));

describe('HandwritingCacheManager', () => {
  let cacheManager: HandwritingCacheManager;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRedis.ping.mockResolvedValue('PONG');
    cacheManager = createHandwritingCacheManager();
  });

  afterEach(async () => {
    if (cacheManager) {
      await cacheManager.close();
    }
  });

  describe('Cache Operations', () => {
    it('should set and get cached data', async () => {
      const testData = { id: 1, name: 'test' };
      const cacheKey = 'test:key';

      mockRedis.get.mockResolvedValue(JSON.stringify(testData));

      await cacheManager.set(cacheKey, testData, CACHE_STRATEGIES.RAW_DATA);
      const result = await cacheManager.get(cacheKey);

      expect(result).toEqual(testData);
      expect(mockRedis.setex).toHaveBeenCalledWith(
        cacheKey,
        Math.floor(CACHE_STRATEGIES.RAW_DATA.ttl / 1000),
        JSON.stringify(testData)
      );
    });

    it('should return null for cache miss', async () => {
      const cacheKey = 'nonexistent:key';
      mockRedis.get.mockResolvedValue(null);

      const result = await cacheManager.get(cacheKey);

      expect(result).toBeNull();
    });

    it('should handle Redis errors gracefully', async () => {
      const cacheKey = 'error:key';
      mockRedis.get.mockRejectedValue(new Error('Redis connection failed'));

      const result = await cacheManager.get(cacheKey);

      expect(result).toBeNull();
    });

    it('should delete cached data', async () => {
      const cacheKey = 'delete:key';

      await cacheManager.delete(cacheKey);

      expect(mockRedis.del).toHaveBeenCalledWith(cacheKey);
    });

    it('should clear cache by pattern', async () => {
      const pattern = 'handwriting:*';
      mockRedis.keys.mockResolvedValue(['handwriting:data', 'handwriting:filtered']);

      await cacheManager.deleteByPattern(pattern);

      expect(mockRedis.keys).toHaveBeenCalledWith(pattern);
      expect(mockRedis.del).toHaveBeenCalledWith('handwriting:data', 'handwriting:filtered');
    });
  });

  describe('Cache Statistics', () => {
    it('should track cache hits and misses', async () => {
      const cacheKey = 'stats:key';
      const testData = { id: 1 };

      // Cache hit
      mockRedis.get.mockResolvedValue(JSON.stringify(testData));
      await cacheManager.get(cacheKey);

      // Cache miss
      mockRedis.get.mockResolvedValue(null);
      await cacheManager.get(cacheKey);

      const stats = cacheManager.getStats();

      expect(stats.totalRequests).toBe(2);
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(0.5);
    });

    it('should reset statistics', async () => {
      const cacheKey = 'reset:key';
      const testData = { id: 1 };

      // Generate some stats
      mockRedis.get.mockResolvedValue(JSON.stringify(testData));
      await cacheManager.get(cacheKey);

      // Reset stats
      cacheManager.resetStats();
      const stats = cacheManager.getStats();

      expect(stats.totalRequests).toBe(0);
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.hitRate).toBe(0);
    });
  });

  describe('Handwriting-specific Operations', () => {
    const mockHandwritingData = [
      {
        id: '1',
        title: 'Test Item 1',
        year: 1937,
        category: '题词',
        tags: ['1937年', '题词'],
        originalData: { 数据来源: '韬奋纪念馆' },
      },
      {
        id: '2',
        title: 'Test Item 2',
        year: 1938,
        category: '文稿',
        tags: ['1938年', '文稿'],
        originalData: { 数据来源: '私人收藏' },
      },
    ];

    it('should cache and retrieve handwriting data', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(mockHandwritingData));

      // Test setting data
      await cacheManager.setTransformedData(mockHandwritingData);

      // Test getting data
      const result = await cacheManager.getTransformedData();

      expect(result).toEqual(mockHandwritingData);
      expect(mockRedis.setex).toHaveBeenCalledWith(
        'handwriting:transformed:data',
        Math.floor(CACHE_STRATEGIES.TRANSFORMED_DATA.ttl / 1000),
        JSON.stringify(mockHandwritingData)
      );
    });

    it('should cache filtered results', async () => {
      const filters = {
        selectedCategory: '题词',
        selectedYear: 'all',
        selectedSource: 'all',
        selectedTag: 'all',
        sortOrder: 'year_desc',
      };
      const filteredData = [mockHandwritingData[0]];

      mockRedis.get.mockResolvedValue(JSON.stringify(filteredData));

      await cacheManager.setFilteredData(filters, filteredData);
      const result = await cacheManager.getFilteredData(filters);

      expect(result).toEqual(filteredData);
    });

    it('should cache metadata', async () => {
      const years = [1937, 1938];

      mockRedis.get.mockResolvedValue(JSON.stringify(years));

      await cacheManager.setMetadata('years', years);
      const result = await cacheManager.getMetadata('years');

      expect(result).toEqual(years);
    });
  });

  describe('Connection Management', () => {
    it('should check Redis connection status', async () => {
      mockRedis.ping.mockResolvedValue('PONG');

      const isConnected = await cacheManager.isRedisConnected();

      expect(isConnected).toBe(true);
      expect(mockRedis.ping).toHaveBeenCalled();
    });

    it('should handle connection errors', async () => {
      mockRedis.ping.mockRejectedValue(new Error('Connection failed'));

      const isConnected = await cacheManager.isRedisConnected();

      expect(isConnected).toBe(false);
    });

    it('should close Redis connection', async () => {
      await cacheManager.close();

      expect(mockRedis.quit).toHaveBeenCalled();
    });
  });
});

describe('Filter Operations with Cache', () => {
  const mockHandwritingData = [
    {
      id: '1',
      title: '韬奋题词',
      year: 1937,
      category: '题词',
      tags: ['1937年', '题词'],
      originalData: { 原文: '这是韬奋的题词', 注释: '重要文献', 数据来源: '韬奋纪念馆' },
    },
    {
      id: '2',
      title: '文稿作品',
      year: 1938,
      category: '文稿',
      tags: ['1938年', '文稿'],
      originalData: { 原文: '这是文稿内容', 注释: '一般文献', 数据来源: '私人收藏' },
    },
  ];

  describe('computeFilteredItems', () => {
    it('should filter by search term', () => {
      const filters = {
        selectedCategory: 'all',
        selectedYear: 'all',
        selectedSource: 'all',
        selectedTag: 'all',
        sortOrder: 'year_desc',
      };

      const result = computeFilteredItems(mockHandwritingData, filters, '韬奋');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('韬奋题词');
    });

    it('should filter by category', () => {
      const filters = {
        selectedCategory: '题词',
        selectedYear: 'all',
        selectedSource: 'all',
        selectedTag: 'all',
        sortOrder: 'year_desc',
      };

      const result = computeFilteredItems(mockHandwritingData, filters, '');

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('题词');
    });

    it('should filter by year', () => {
      const filters = {
        selectedCategory: 'all',
        selectedYear: '1937',
        selectedSource: 'all',
        selectedTag: 'all',
        sortOrder: 'year_desc',
      };

      const result = computeFilteredItems(mockHandwritingData, filters, '');

      expect(result).toHaveLength(1);
      expect(result[0].year).toBe(1937);
    });

    it('should sort by year ascending', () => {
      const filters = {
        selectedCategory: 'all',
        selectedYear: 'all',
        selectedSource: 'all',
        selectedTag: 'all',
        sortOrder: 'year_asc',
      };

      const result = computeFilteredItems(mockHandwritingData, filters, '');

      expect(result[0].year).toBe(1937);
      expect(result[1].year).toBe(1938);
    });

    it('should sort by year descending', () => {
      const filters = {
        selectedCategory: 'all',
        selectedYear: 'all',
        selectedSource: 'all',
        selectedTag: 'all',
        sortOrder: 'year_desc',
      };

      const result = computeFilteredItems(mockHandwritingData, filters, '');

      expect(result[0].year).toBe(1938);
      expect(result[1].year).toBe(1937);
    });

    it('should handle empty search results', () => {
      const filters = {
        selectedCategory: 'all',
        selectedYear: 'all',
        selectedSource: 'all',
        selectedTag: 'all',
        sortOrder: 'year_desc',
      };

      const result = computeFilteredItems(mockHandwritingData, filters, '不存在的词');

      expect(result).toHaveLength(0);
    });
  });

  describe('Cache Key Generation', () => {
    it('should generate consistent hash for same filters', () => {
      const filters = {
        selectedCategory: '题词',
        selectedYear: '1937',
        selectedSource: '韬奋纪念馆',
        selectedTag: '题词',
        sortOrder: 'year_desc',
      };

      const hash1 = generateFilterHash(filters, '韬奋');
      const hash2 = generateFilterHash(filters, '韬奋');

      expect(hash1).toBe(hash2);
    });

    it('should generate different hash for different filters', () => {
      const filters1 = {
        selectedCategory: '题词',
        selectedYear: '1937',
        selectedSource: '韬奋纪念馆',
        selectedTag: '题词',
        sortOrder: 'year_desc',
      };

      const filters2 = {
        selectedCategory: '文稿',
        selectedYear: '1938',
        selectedSource: '私人收藏',
        selectedTag: '文稿',
        sortOrder: 'year_asc',
      };

      const hash1 = generateFilterHash(filters1, '韬奋');
      const hash2 = generateFilterHash(filters2, '文稿');

      expect(hash1).not.toBe(hash2);
    });
  });
});

// Helper function for testing
function generateFilterHash(filters: Record<string, unknown>, searchTerm: string): string {
  const filterString = JSON.stringify({
    searchTerm,
    selectedCategory: filters.selectedCategory,
    selectedYear: filters.selectedYear,
    selectedSource: filters.selectedSource,
    selectedTag: filters.selectedTag,
    sortOrder: filters.sortOrder,
  });
  
  let hash = 0;
  for (let i = 0; i < filterString.length; i++) {
    const char = filterString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}