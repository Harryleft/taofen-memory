// 测试数据生成器
export class TestDataGenerator {
  static generatePublications(count: number = 10) {
    return Array.from({ length: count }, (_, i) => ({
      i: i,
      id: `test-publication-${i}`,
      collection: `https://example.com/publication${i}/collection.json`,
      title: `测试刊物${i + 1}`,
      name: `测试刊物${i + 1}`,
      issueCount: Math.floor(Math.random() * 50) + 1,
      lastUpdated: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
    }));
  }

  static generateIssues(publicationId: string, count: number = 12) {
    return Array.from({ length: count }, (_, i) => ({
      i: i,
      manifest: `https://example.com/${publicationId}/issue${i + 1}/manifest.json`,
      title: `第${i + 1}期`,
      summary: `2024年${String(Math.floor(i / 12) + 1).padStart(2, '0')}月${String((i % 12) + 1).padStart(2, '0')}日`
    }));
  }

  static generateManifest(issueId: string) {
    return {
      id: `https://example.com/${issueId}/manifest.json`,
      label: { zh: [`测试期数 ${issueId}`] },
      type: 'Manifest',
      items: Array.from({ length: 8 }, (_, i) => ({
        id: `https://example.com/${issueId}/page${i + 1}.jpg`,
        type: 'Canvas',
        label: { zh: [`第${i + 1}页`] }
      }))
    };
  }

  static generateErrorResponse(message: string = 'Test Error') {
    return {
      ok: false,
      status: 500,
      statusText: message,
      json: () => Promise.reject(new Error(message))
    };
  }

  static generateNetworkDelayResponse(data: unknown, delay: number = 1000) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ok: true,
          json: () => Promise.resolve(data)
        });
      }, delay);
    });
  }
}

// 单元测试
describe('TestDataGenerator', () => {
  describe('generatePublications', () => {
    it('should generate default 10 publications', () => {
      const publications = TestDataGenerator.generatePublications();
      expect(publications).toHaveLength(10);
    });

    it('should generate specified number of publications', () => {
      const count = 5;
      const publications = TestDataGenerator.generatePublications(count);
      expect(publications).toHaveLength(count);
    });

    it('should generate publications with correct structure', () => {
      const publications = TestDataGenerator.generatePublications(1);
      expect(publications[0]).toHaveProperty('id');
      expect(publications[0]).toHaveProperty('title');
      expect(publications[0]).toHaveProperty('name');
      expect(publications[0]).toHaveProperty('collection');
      expect(publications[0]).toHaveProperty('issueCount');
      expect(publications[0]).toHaveProperty('lastUpdated');
    });

    it('should generate unique IDs for each publication', () => {
      const publications = TestDataGenerator.generatePublications(10);
      const ids = publications.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(10);
    });
  });

  describe('generateIssues', () => {
    it('should generate default 12 issues', () => {
      const issues = TestDataGenerator.generateIssues('pub-1');
      expect(issues).toHaveLength(12);
    });

    it('should generate specified number of issues', () => {
      const count = 6;
      const issues = TestDataGenerator.generateIssues('pub-1', count);
      expect(issues).toHaveLength(count);
    });

    it('should include publicationId in manifest URLs', () => {
      const pubId = 'test-pub-123';
      const issues = TestDataGenerator.generateIssues(pubId, 3);
      issues.forEach(issue => {
        expect(issue.manifest).toContain(pubId);
      });
    });
  });

  describe('generateManifest', () => {
    it('should generate manifest with correct structure', () => {
      const manifest = TestDataGenerator.generateManifest('issue-1');
      expect(manifest).toHaveProperty('id');
      expect(manifest).toHaveProperty('label');
      expect(manifest).toHaveProperty('type');
      expect(manifest).toHaveProperty('items');
    });

    it('should be Manifest type', () => {
      const manifest = TestDataGenerator.generateManifest('issue-1');
      expect(manifest.type).toBe('Manifest');
    });

    it('should generate 8 items by default', () => {
      const manifest = TestDataGenerator.generateManifest('issue-1');
      expect(manifest.items).toHaveLength(8);
    });

    it('should include issueId in manifest ID', () => {
      const issueId = 'test-issue-456';
      const manifest = TestDataGenerator.generateManifest(issueId);
      expect(manifest.id).toContain(issueId);
    });
  });

  describe('generateErrorResponse', () => {
    it('should generate error response with default message', () => {
      const error = TestDataGenerator.generateErrorResponse();
      expect(error.ok).toBe(false);
      expect(error.status).toBe(500);
      expect(error.statusText).toBe('Test Error');
    });

    it('should generate error response with custom message', () => {
      const customMessage = 'Custom Error Message';
      const error = TestDataGenerator.generateErrorResponse(customMessage);
      expect(error.statusText).toBe(customMessage);
    });
  });

  describe('generateNetworkDelayResponse', () => {
    it('should resolve after specified delay', async () => {
      const startTime = Date.now();
      const delay = 100;
      const response = await TestDataGenerator.generateNetworkDelayResponse({ test: 'data' }, delay);
      const endTime = Date.now();
      const elapsed = endTime - startTime;

      expect(response).toHaveProperty('ok', true);
      expect(elapsed).toBeGreaterThanOrEqual(delay);
    });

    it('should use 1000ms as default delay', async () => {
      const startTime = Date.now();
      await TestDataGenerator.generateNetworkDelayResponse({ test: 'data' });
      const endTime = Date.now();
      const elapsed = endTime - startTime;

      expect(elapsed).toBeGreaterThanOrEqual(1000);
    });
  });
});