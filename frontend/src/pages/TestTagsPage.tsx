import React, { useEffect, useState } from 'react';
import { useHandwritingData } from '@/hooks/useHandwritingData.ts';

const TestTagsPage = () => {
  const { handwritingItems, loading, error } = useHandwritingData();
  const [testResults, setTestResults] = useState<any>(null);
  
  useEffect(() => {
    if (handwritingItems.length > 0) {
      // 测试前5个项目的标签
      const testItems = handwritingItems.slice(0, 5);
      const results = testItems.map(item => ({
        id: item.id,
        title: item.title,
        originalTag: item.originalData.标签,
        transformedTags: item.tags,
        hasRealTags: item.tags.some(tag => ['题词', '文稿', '书简'].includes(tag))
      }));
      
      setTestResults(results);
      console.log('🔍 [TestTagsPage] Test results:', results);
    }
  }, [handwritingItems]);
  
  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">标签测试页面</h1>
      
      {testResults && (
        <div className="space-y-4">
          {testResults.map((result: any) => (
            <div key={result.id} className="p-4 border rounded">
              <h3 className="font-bold">{result.title}</h3>
              <p><strong>原始标签:</strong> {result.originalTag}</p>
              <p><strong>转换后标签:</strong> {JSON.stringify(result.transformedTags)}</p>
              <p><strong>包含真实标签:</strong> {result.hasRealTags ? '是' : '否'}</p>
              
              {/* 模拟HandwritingCard的标签显示 */}
              <div className="mt-2">
                <strong>UI显示效果:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {result.transformedTags.slice(0, 2).map((tag: string, index: number) => (
                    <span key={index} className="text-xs bg-gold/10 text-gold px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestTagsPage;