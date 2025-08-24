/**
 * IIIF集成示例 - 展示如何使用优化后的IIIF组件
 * 
 * 这个示例展示了：
 * 1. 基本的IIIF manifest加载
 * 2. 错误处理和重试机制
 * 3. 用户设置管理
 * 4. 性能监控
 * 5. 自定义配置
 */

import React, { useState, useEffect } from 'react';
import { ViewerProvider } from '../context/ViewerContext';
import { OptimizedViewerPage } from '../OptimizedViewerPage';
import { NewspaperService, IssueItem } from '../services';

// 自定义错误边界组件
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// 配置面板组件
const ConfigPanel: React.FC<{
  config: any;
  onConfigChange: (config: any) => void;
}> = ({ config, onConfigChange }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4">
      <h3 className="font-bold mb-2">IIIF配置</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">代理设置</label>
          <select
            value={config.useProxy ? 'true' : 'false'}
            onChange={(e) => onConfigChange({ ...config, useProxy: e.target.value === 'true' })}
            className="w-full border rounded px-2 py-1"
          >
            <option value="true">使用代理</option>
            <option value="false">直接访问</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">缓存设置</label>
          <select
            value={config.enableCache ? 'true' : 'false'}
            onChange={(e) => onConfigChange({ ...config, enableCache: e.target.value === 'true' })}
            className="w-full border rounded px-2 py-1"
          >
            <option value="true">启用缓存</option>
            <option value="false">禁用缓存</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">重试次数</label>
          <input
            type="number"
            min="0"
            max="5"
            value={config.retryCount}
            onChange={(e) => onConfigChange({ ...config, retryCount: parseInt(e.target.value) })}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">调试模式</label>
          <select
            value={config.debugMode ? 'true' : 'false'}
            onChange={(e) => onConfigChange({ ...config, debugMode: e.target.value === 'true' })}
            className="w-full border rounded px-2 py-1"
          >
            <option value="true">启用</option>
            <option value="false">禁用</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// 性能监控组件
const PerformanceMonitor: React.FC = () => {
  const { state } = useViewerContext();
  
  return (
    <div className="bg-blue-50 p-4 rounded-lg mb-4">
      <h3 className="font-bold mb-2">性能监控</h3>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="font-medium">加载时间</div>
          <div className="text-blue-600">{state.performance.loadTime}ms</div>
        </div>
        <div>
          <div className="font-medium">渲染时间</div>
          <div className="text-blue-600">{state.performance.renderTime}ms</div>
        </div>
        <div>
          <div className="font-medium">错误计数</div>
          <div className={`text-${state.performance.errorCount > 0 ? 'red' : 'green'}-600`}>
            {state.performance.errorCount}
          </div>
        </div>
      </div>
    </div>
  );
};

// 主要示例组件
export const IIIFIntegrationExample: React.FC = () => {
  const [selectedPublication, setSelectedPublication] = useState('demo-newspaper');
  const [selectedIssue, setSelectedIssue] = useState('issue-001');
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [config, setConfig] = useState({
    useProxy: true,
    enableCache: true,
    retryCount: 3,
    debugMode: false
  });

  // 加载期数列表
  useEffect(() => {
    const loadIssues = async () => {
      try {
        // 这里使用示例数据，实际应用中应该从API获取
        const mockIssues: IssueItem[] = [
          {
            i: 0,
            manifest: 'issue-001/manifest.json',
            title: '第1期',
            summary: '2024年1月刊'
          },
          {
            i: 1,
            manifest: 'issue-002/manifest.json',
            title: '第2期',
            summary: '2024年2月刊'
          },
          {
            i: 2,
            manifest: 'issue-003/manifest.json',
            title: '第3期',
            summary: '2024年3月刊'
          }
        ];
        setIssues(mockIssues);
      } catch (error) {
        console.error('加载期数列表失败:', error);
      }
    };
    
    loadIssues();
  }, []);

  // 错误边界fallback
  const errorFallback = (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <h3 className="text-red-600 font-bold mb-2">❌ 组件加载失败</h3>
        <p className="text-gray-600 mb-4">请检查控制台获取详细错误信息</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          重新加载页面
        </button>
      </div>
    </div>
  );

  return (
    <ViewerProvider
      config={{
        maxHistory: 50,
        enablePerformanceTracking: true,
        autoSaveSettings: true
      }}
    >
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6">IIIF集成示例</h1>
          
          {/* 配置面板 */}
          <ConfigPanel config={config} onConfigChange={setConfig} />
          
          {/* 性能监控 */}
          {config.debugMode && <PerformanceMonitor />}
          
          {/* 刊物和期数选择 */}
          <div className="bg-white p-4 rounded-lg mb-4">
            <h3 className="font-bold mb-2">选择内容</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">刊物</label>
                <select
                  value={selectedPublication}
                  onChange={(e) => setSelectedPublication(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="demo-newspaper">示例刊物</option>
                  <option value="another-newspaper">其他刊物</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">期数</label>
                <select
                  value={selectedIssue}
                  onChange={(e) => setSelectedIssue(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                >
                  {issues.map((issue) => (
                    <option key={issue.i} value={issue.manifest.replace('/manifest.json', '')}>
                      {issue.title} - {issue.summary}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* 查看器 */}
          <ErrorBoundary fallback={errorFallback}>
            <OptimizedViewerPage
              publicationId={selectedPublication}
              issueId={selectedIssue}
              publicationTitle="示例刊物"
              allIssues={issues}
              onIssueSelect={(issue) => {
                console.log('选择了期数:', issue);
                setSelectedIssue(issue.manifest.replace('/manifest.json', ''));
              }}
            />
          </ErrorBoundary>
          
          {/* 使用说明 */}
          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <h3 className="font-bold mb-2">使用说明</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>使用配置面板调整IIIF设置</li>
              <li>选择不同的刊物和期数查看内容</li>
              <li>查看器支持单页/双页/网格视图模式</li>
              <li>支持缩放和旋转功能</li>
              <li>自动保存用户偏好设置</li>
              <li>提供详细的错误处理和重试机制</li>
            </ul>
          </div>
        </div>
      </div>
    </ViewerProvider>
  );
};

// 导出各个独立的组件供其他地方使用
export { OptimizedViewerPage, ViewerProvider, useViewerContext };

// 使用示例
export const BasicUsageExample: React.FC = () => {
  return (
    <ViewerProvider>
      <OptimizedViewerPage
        publicationId="example-publication"
        issueId="example-issue"
        publicationTitle="示例刊物"
      />
    </ViewerProvider>
  );
};

// 高级使用示例
export const AdvancedUsageExample: React.FC = () => {
  return (
    <ViewerProvider
      config={{
        maxHistory: 100,
        enablePerformanceTracking: true,
        autoSaveSettings: true
      }}
    >
      <div className="h-screen">
        <OptimizedViewerPage
          publicationId="advanced-publication"
          issueId="advanced-issue"
          publicationTitle="高级示例"
          onIssueSelect={(issue) => {
            console.log('用户选择了:', issue);
          }}
        />
      </div>
    </ViewerProvider>
  );
};