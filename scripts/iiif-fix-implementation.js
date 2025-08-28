#!/usr/bin/env node

/**
 * IIIF API修复实施脚本
 * 提供具体的修复代码和实施步骤
 */

console.log('=== IIIF API修复实施方案 ===\n');

// 1. URL修复逻辑
console.log('1. URL修复逻辑:');
console.log(`
// 在NewspaperService中添加URL修复函数
class NewspaperService {
  /**
   * 修复IIIF URL中的路径问题
   */
  static fixIIIFUrl(url: string): string {
    if (!url) return url;
    
    // 移除多余的iiif路径段
    const fixed = url.replace('/iiif/manifests', '/manifests');
    
    console.log('🔧 URL修复:', url, '->', fixed);
    return fixed;
  }
  
  /**
   * 构建代理URL（修复版本）
   */
  static buildProxyUrl(url: string): string {
    if (!url) return '';
    
    // 先修复URL
    const fixedUrl = this.fixIIIFUrl(url);
    
    if (isProduction) {
      // 生产环境：绝对不使用代理
      logProduction('buildProxyUrl - 直接访问:', fixedUrl);
      return fixedUrl;
    } else if (isDevelopment) {
      // 开发环境：可以选择使用代理
      if (fixedUrl.startsWith('https://')) {
        const proxyUrl = \`/proxy?url=\${encodeURIComponent(fixedUrl)}\`;
        logDevelopment('buildProxyUrl - 使用代理:', proxyUrl);
        return proxyUrl;
      }
    }
    
    // 默认情况：直接访问
    return fixedUrl;
  }
}
`);

// 2. 修复后的getPublications方法
console.log('\n2. 修复后的getPublications方法:');
console.log(`
static async getPublications(): Promise<PublicationItem[]> {
  const collectionUrl = this.buildProxyUrl('https://www.ai4dh.cn/iiif/3/manifests/collection.json');
  
  try {
    const response = await fetchWithProxy(collectionUrl);
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    const col = await response.json();
    
    // 修复子collection URL
    const fixedItems = (col.items || []).map((it: IIIFCollectionItem, i: number) => {
      const fixedCollectionId = this.fixIIIFUrl(it.id);
      
      return {
        i, 
        id: fixedCollectionId.match(/([^/]+)\\/collection\\.json$/)?.[1] || \`publication_\${i}\`,
        collection: fixedCollectionId,
        title: (it.label?.zh?.[0]) || (it.label?.['zh-CN']?.[0]) || (it.label?.en?.[0]) || '未知刊物',
        name: (it.label?.zh?.[0]) || (it.label?.['zh-CN']?.[0]) || (it.label?.en?.[0]) || '未知刊物',
        issueCount: 0,
        lastUpdated: null
      };
    });
    
    return fixedItems;
  } catch (e) { 
    console.error('加载刊物列表失败:', e);
    return []; 
  }
}
`);

// 3. 错误处理增强
console.log('\n3. 错误处理增强:');
console.log(`
// 在React组件中添加错误边界
const IIIFErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const handleError = (error) => {
      console.error('IIIF组件错误:', error);
      setHasError(true);
      setError(error);
    };
    
    // 添加全局错误监听
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  if (hasError) {
    return (
      <div className="error-fallback">
        <h3>数据加载失败</h3>
        <p>暂时无法加载刊物数据，请稍后重试。</p>
        <button onClick={() => setHasError(false)}>重试</button>
      </div>
    );
  }
  
  return children;
};

// 在NewspaperService中添加重试机制
class NewspaperService {
  static async fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetchWithProxy(url);
        if (response.ok) {
          return response;
        }
        
        // 如果是404错误，直接抛出，不需要重试
        if (response.status === 404) {
          throw new Error(\`HTTP error! status: 404\`);
        }
        
        // 其他错误等待后重试
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        lastError = error;
        console.warn(\`尝试 \${i + 1}/\${maxRetries} 失败:\`, error.message);
      }
    }
    
    throw lastError;
  }
}
`);

// 4. 监控和健康检查
console.log('\n4. 监控和健康检查:');
console.log(`
// IIIF健康检查服务
class IIIFHealthService {
  private static readonly HEALTH_CHECK_URL = 'https://www.ai4dh.cn/iiif/3/manifests/collection.json';
  
  static async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(this.HEALTH_CHECK_URL, {
        method: 'HEAD',
        timeout: 5000
      });
      
      return response.ok;
    } catch (error) {
      console.warn('IIIF健康检查失败:', error);
      return false;
    }
  }
  
  static async startPeriodicHealthCheck(interval = 30000) {
    const check = async () => {
      const healthy = await this.checkHealth();
      console.log(\`IIIF健康状态: \${healthy ? '正常' : '异常'}\`);
      
      // 如果不健康，可以触发报警
      if (!healthy) {
        this.triggerAlert();
      }
    };
    
    // 立即检查一次
    await check();
    
    // 定期检查
    setInterval(check, interval);
  }
  
  private static triggerAlert() {
    console.warn('⚠️ IIIF服务异常，请检查服务状态');
    // 可以发送到监控系统或通知管理员
  }
}
`);

// 5. 具体实施步骤
console.log('\n5. 具体实施步骤:');
console.log(`
步骤1: 修改NewspaperService
- 添加fixIIIFUrl函数
- 修改buildProxyUrl函数
- 更新getPublications方法
- 添加错误处理和重试机制

步骤2: 更新IIIFUrlBuilder
- 移除复杂的URL构建逻辑
- 简化为直接的URL修复
- 保持向后兼容性

步骤3: 添加错误边界组件
- 在顶层组件添加IIIFErrorBoundary
- 提供用户友好的错误提示
- 添加重试功能

步骤4: 实现健康检查
- 集成IIIFHealthService
- 定期检查服务状态
- 提供监控和报警

步骤5: 测试和验证
- 运行快速修复验证脚本
- 测试各种边界情况
- 确保用户体验不受影响

步骤6: 监控和维护
- 设置监控仪表板
- 记录错误和性能指标
- 定期检查和优化
`);

console.log('=== 实施方案完成 ===');
console.log('\n🎯 关键改进:');
console.log('✅ 移除了多余的iiif路径段');
console.log('✅ 增强了错误处理和重试机制');
console.log('✅ 添加了服务健康检查');
console.log('✅ 提供了用户友好的错误提示');
console.log('✅ 简化了URL构建逻辑');

console.log('\n🔧 技术栈:');
console.log('- TypeScript for type safety');
console.log('- React Error Boundaries');
console.log('- Retry mechanisms');
console.log('- Health monitoring');
console.log('- Logging and alerting');

console.log('\n🎉 预期效果:');
console.log('- 消除所有404错误');
console.log('- 提高系统稳定性');
console.log('- 改善用户体验');
console.log('- 便于维护和监控');