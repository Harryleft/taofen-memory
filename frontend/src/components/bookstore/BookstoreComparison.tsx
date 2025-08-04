import React, { useState } from 'react';
import BookstoreOriginal from './index';
import BookstoreRedesigned from './BookstoreRedesigned';

type Version = 'original' | 'redesigned';

/**
 * 书店组件对比测试页面
 * 
 * 用于对比原版本和重新设计版本的性能差异
 */
const BookstoreComparison: React.FC = () => {
  const [currentVersion, setCurrentVersion] = useState<Version>('redesigned');
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    renderCount: number;
    lastRenderTime: number;
  }>({ renderCount: 0, lastRenderTime: 0 });

  // 性能监控
  React.useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      setPerformanceMetrics(prev => ({
        renderCount: prev.renderCount + 1,
        lastRenderTime: endTime - startTime
      }));
    };
  });

  const handleVersionSwitch = (version: Version) => {
    setCurrentVersion(version);
    // 重置性能指标
    setPerformanceMetrics({ renderCount: 0, lastRenderTime: 0 });
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* 版本切换控制栏 */}
      <div className="bg-charcoal text-cream py-4 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-bold">书店组件对比测试</h2>
              <div className="flex bg-charcoal/50 rounded-lg p-1">
                <button
                  onClick={() => handleVersionSwitch('original')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    currentVersion === 'original'
                      ? 'bg-cream text-charcoal'
                      : 'text-cream hover:bg-charcoal/30'
                  }`}
                >
                  原版本
                </button>
                <button
                  onClick={() => handleVersionSwitch('redesigned')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    currentVersion === 'redesigned'
                      ? 'bg-cream text-charcoal'
                      : 'text-cream hover:bg-charcoal/30'
                  }`}
                >
                  重新设计版本
                </button>
              </div>
            </div>
            
            {/* 性能指标显示 */}
            <div className="flex items-center space-x-6 text-sm">
              <div className="text-cream/80">
                渲染次数: <span className="text-cream font-mono">{performanceMetrics.renderCount}</span>
              </div>
              <div className="text-cream/80">
                最后渲染耗时: <span className="text-cream font-mono">{performanceMetrics.lastRenderTime.toFixed(2)}ms</span>
              </div>
            </div>
          </div>
          
          {/* 版本说明 */}
          <div className="mt-3 text-sm text-cream/70">
            {currentVersion === 'original' && (
              <p>
                <strong>原版本特点：</strong> 使用复杂的状态管理、交叉观察器 + 滚动事件、频繁的重新渲染检测
              </p>
            )}
            {currentVersion === 'redesigned' && (
              <p>
                <strong>重新设计版本特点：</strong> 虚拟化滚动、简化状态管理、按需渲染、优化滚动流畅度
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 渲染对应版本的组件 */}
      <div className="relative">
        {currentVersion === 'original' && <BookstoreOriginal />}
        {currentVersion === 'redesigned' && <BookstoreRedesigned />}
      </div>

      {/* 性能测试说明 */}
      <div className="fixed bottom-4 right-4 bg-charcoal/90 text-cream p-4 rounded-lg max-w-sm text-sm">
        <h3 className="font-bold mb-2">性能测试指南</h3>
        <ul className="space-y-1 text-cream/80">
          <li>• 打开浏览器开发者工具</li>
          <li>• 观察Console中的渲染日志</li>
          <li>• 测试滚动流畅度</li>
          <li>• 比较内存使用情况</li>
          <li>• 注意首屏加载速度</li>
        </ul>
      </div>
    </div>
  );
};

export default BookstoreComparison;