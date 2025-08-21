// 性能监控修复验证脚本
// 在浏览器控制台中运行此脚本来验证修复

console.log('=== 性能监控修复验证 ===');

// 测试1: 验证标记命名一致性
console.log('1. 测试标记命名一致性');
try {
  PerformanceMonitor.markStart('data-fetch');
  PerformanceMonitor.markEnd('data-fetch');
  console.log('✅ 不带hero-前缀的标记测试通过');
} catch (error) {
  console.log('❌ 不带hero-前缀的标记测试失败:', error.message);
}

try {
  PerformanceMonitor.markStart('hero-initial-data-load');
  PerformanceMonitor.markEnd('hero-initial-data-load');
  console.log('✅ 带hero-前缀的标记测试通过');
} catch (error) {
  console.log('❌ 带hero-前缀的标记测试失败:', error.message);
}

// 测试2: 验证网络和内存信息更新
console.log('2. 测试网络和内存信息更新');
try {
  PerformanceMonitor.updateNetworkInfo();
  PerformanceMonitor.updateMemoryInfo();
  console.log('✅ 网络和内存信息更新测试通过');
} catch (error) {
  console.log('❌ 网络和内存信息更新测试失败:', error.message);
}

// 测试3: 验证获取性能指标
console.log('3. 测试获取性能指标');
try {
  const metrics = PerformanceMonitor.getMetrics();
  console.log('✅ 获取性能指标测试通过');
  console.log('性能指标数量:', metrics.customMarks?.length || 0);
} catch (error) {
  console.log('❌ 获取性能指标测试失败:', error.message);
}

// 测试4: 验证错误处理
console.log('4. 测试错误处理');
try {
  PerformanceMonitor.markEnd('non-existent-mark');
  console.log('✅ 错误处理测试通过（无异常抛出）');
} catch (error) {
  console.log('❌ 错误处理测试失败:', error.message);
}

// 测试5: 验证便捷函数
console.log('5. 测试便捷函数');
try {
  const result = measurePerformance('test-sync', () => {
    return Math.random();
  });
  console.log('✅ 便捷函数测试通过，结果:', result);
} catch (error) {
  console.log('❌ 便捷函数测试失败:', error.message);
}

console.log('=== 验证完成 ===');