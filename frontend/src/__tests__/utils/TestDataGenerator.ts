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

  static generateNetworkDelayResponse(data: any, delay: number = 1000) {
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