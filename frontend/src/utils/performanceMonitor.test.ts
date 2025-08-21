// 性能监控修复验证测试
import PerformanceMonitor from './performanceMonitor';

// 测试标记命名一致性
console.log('=== 测试标记命名一致性 ===');

// 测试1: 不带hero-前缀的标记
PerformanceMonitor.markStart('data-fetch');
PerformanceMonitor.markEnd('data-fetch');

// 测试2: 带hero-前缀的标记
PerformanceMonitor.markStart('hero-initial-data-load');
PerformanceMonitor.markEnd('hero-initial-data-load');

// 测试3: 复杂标记名
PerformanceMonitor.markStart('hero-image-preload-fallback');
PerformanceMonitor.markEnd('hero-image-preload-fallback');

// 测试网络和内存信息更新
console.log('=== 测试网络和内存信息更新 ===');
PerformanceMonitor.updateNetworkInfo();
PerformanceMonitor.updateMemoryInfo();

// 测试获取性能指标
console.log('=== 测试获取性能指标 ===');
const metrics = PerformanceMonitor.getMetrics();
console.log('性能指标:', {
  customMarks: metrics.customMarks,
  network: metrics.network,
  memory: metrics.memory
});

// 测试便捷函数
console.log('=== 测试便捷函数 ===');
const result1 = measurePerformance('test-sync', () => {
  return Math.random();
});
console.log('同步测试结果:', result1);

measureAsyncPerformance('test-async', async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return Math.random();
}).then(result2 => {
  console.log('异步测试结果:', result2);
});

// 测试错误处理
console.log('=== 测试错误处理 ===');
try {
  // 测试不存在的标记
  PerformanceMonitor.markEnd('non-existent-mark');
} catch (error) {
  console.log('错误处理测试通过:', error.message);
}

console.log('所有测试完成！');