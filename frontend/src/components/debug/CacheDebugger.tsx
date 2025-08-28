/**
 * 缓存调试组件
 * 用于开发环境查看和管理缓存状态
 */

import React, { useState } from 'react';
import { useCacheStats, useCacheHealth, useCachePrefetch } from '../hooks/useCache';
import { cacheService } from '../services/cache/cache-service';

export const CacheDebugger: React.FC = () => {
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useCacheStats();
  const { healthy, loading: healthLoading, lastCheck, check: checkHealth } = useCacheHealth();
  const { prefetch, prefetchIIIF, loading: prefetchLoading } = useCachePrefetch();
  
  const [customKey, setCustomKey] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [customTTL, setCustomTTL] = useState('3600');
  const [operationResult, setOperationResult] = useState<string | null>(null);

  const handleSetCache = async () => {
    if (!customKey || !customValue) {
      setOperationResult('请输入键和值');
      return;
    }

    try {
      const result = await cacheService.set(customKey, JSON.parse(customValue), parseInt(customTTL));
      setOperationResult(result.success ? '设置成功' : `设置失败: ${result.error}`);
    } catch (err) {
      setOperationResult(`设置失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  };

  const handleGetCache = async () => {
    if (!customKey) {
      setOperationResult('请输入键');
      return;
    }

    try {
      const result = await cacheService.get(customKey);
      if (result.success && result.data) {
        setCustomValue(JSON.stringify(result.data, null, 2));
        setOperationResult('获取成功');
      } else {
        setOperationResult(`获取失败: ${result.error}`);
      }
    } catch (err) {
      setOperationResult(`获取失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  };

  const handleDeleteCache = async () => {
    if (!customKey) {
      setOperationResult('请输入键');
      return;
    }

    try {
      const result = await cacheService.delete(customKey);
      setOperationResult(result.success ? '删除成功' : `删除失败: ${result.error}`);
    } catch (err) {
      setOperationResult(`删除失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  };

  const handleClearAllCache = async () => {
    try {
      const result = await cacheService.clear();
      setOperationResult(result.success ? `清空成功，删除了 ${result.result} 个键` : `清空失败: ${result.error}`);
    } catch (err) {
      setOperationResult(`清空失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  };

  const handlePrefetchIIIF = async () => {
    const identifiers = ['book_23416', 'book_23417', 'book_23418']; // 示例ID
    try {
      await prefetchIIIF(identifiers);
      setOperationResult('IIIF预取完成');
    } catch (err) {
      setOperationResult(`IIIF预取失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  };

  return (
    <div className="cache-debugger p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">缓存调试器</h3>
      
      {/* 服务状态 */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">服务状态</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-white rounded border">
            <div className="text-sm text-gray-600">健康状态</div>
            <div className={`font-medium ${healthy ? 'text-green-600' : 'text-red-600'}`}>
              {healthLoading ? '检查中...' : healthy ? '✅ 健康' : '❌ 异常'}
            </div>
            <div className="text-xs text-gray-500">
              最后检查: {lastCheck?.toLocaleTimeString() || '从未'}
            </div>
          </div>
          
          <div className="p-3 bg-white rounded border">
            <div className="text-sm text-gray-600">内存使用</div>
            <div className="font-medium">
              {statsLoading ? '加载中...' : stats?.memory_used?.used || 'N/A'}
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            refetchStats();
            checkHealth();
          }}
          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          刷新状态
        </button>
      </div>

      {/* 缓存操作 */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">缓存操作</h4>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="键名"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              className="flex-1 px-2 py-1 border rounded"
            />
            <button
              onClick={handleGetCache}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              获取
            </button>
          </div>
          
          <textarea
            placeholder="值 (JSON格式)"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            className="w-full px-2 py-1 border rounded h-20 font-mono text-sm"
          />
          
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="TTL (秒)"
              value={customTTL}
              onChange={(e) => setCustomTTL(e.target.value)}
              className="w-24 px-2 py-1 border rounded"
            />
            <button
              onClick={handleSetCache}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              设置
            </button>
            <button
              onClick={handleDeleteCache}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              删除
            </button>
          </div>
        </div>
      </div>

      {/* 批量操作 */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">批量操作</h4>
        <div className="space-y-2">
          <button
            onClick={handleClearAllCache}
            className="w-full px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            清空所有缓存
          </button>
          <button
            onClick={handlePrefetchIIIF}
            disabled={prefetchLoading}
            className="w-full px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            {prefetchLoading ? '预取中...' : '预取IIIF数据'}
          </button>
        </div>
      </div>

      {/* 操作结果 */}
      {operationResult && (
        <div className={`p-3 rounded ${
          operationResult.includes('成功') 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {operationResult}
        </div>
      )}

      {/* 错误信息 */}
      {statsError && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
          获取统计信息失败: {statsError}
        </div>
      )}

      {/* 详细统计 */}
      {stats && (
        <div className="mt-4 p-3 bg-white rounded border">
          <h4 className="font-medium mb-2">详细统计</h4>
          <pre className="text-xs text-gray-600 overflow-auto">
            {JSON.stringify(stats, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default CacheDebugger;