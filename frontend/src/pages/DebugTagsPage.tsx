import React, { useEffect, useState } from 'react';
import { useHandwritingData } from '@/hooks/useHandwritingData.ts';
import { useHandwritingFilters } from '@/hooks/useHandwritingFilters.ts';

interface DebugInfo {
  totalItems: number;
  rawTags: {
    all: string[];
    unique: string[];
    count: number;
  };
  transformedTags: {
    all: string[];
    unique: string[];
    count: number;
  };
  filterTags: string[];
}

const DebugTagsPage = () => {
  const { handwritingItems, loading, error } = useHandwritingData();
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  
  // 在组件顶层调用Hook
  const filters = {
    searchTerm: '',
    selectedCategory: 'all',
    selectedYear: 'all',
    selectedSource: 'all',
    selectedTag: 'all',
    sortOrder: 'year_desc'
  };
  const { uniqueTags } = useHandwritingFilters(handwritingItems, filters);
  
  useEffect(() => {
    if (handwritingItems.length > 0) {
      // 分析原始数据中的标签
      const rawTags = handwritingItems.map(item => item.originalData.标签).filter(Boolean);
      const uniqueRawTags = [...new Set(rawTags)];
      
      // 分析转换后的标签
      const transformedTags = handwritingItems.flatMap(item => item.tags);
      const uniqueTransformedTags = [...new Set(transformedTags)];
      
      setDebugInfo({
        totalItems: handwritingItems.length,
        rawTags: {
          all: rawTags,
          unique: uniqueRawTags,
          count: rawTags.length
        },
        transformedTags: {
          all: transformedTags,
          unique: uniqueTransformedTags,
          count: transformedTags.length
        },
        filterTags: uniqueTags
      });
      
      console.log('🔍 [DebugTagsPage] Raw tags:', rawTags);
      console.log('🔍 [DebugTagsPage] Unique raw tags:', uniqueRawTags);
      console.log('🔍 [DebugTagsPage] Transformed tags:', transformedTags);
      console.log('🔍 [DebugTagsPage] Unique transformed tags:', uniqueTransformedTags);
      console.log('🔍 [DebugTagsPage] Filter tags:', uniqueTags);
    }
  }, [handwritingItems, uniqueTags]);
  
  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">标签调试页面</h1>
      
      {debugInfo && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">数据统计</h2>
            <p>总条目数: {debugInfo.totalItems}</p>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">原始标签 (JSON数据)</h2>
            <p>标签总数: {debugInfo.rawTags.count}</p>
            <p>唯一标签: {JSON.stringify(debugInfo.rawTags.unique)}</p>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">转换后标签 (item.tags)</h2>
            <p>标签总数: {debugInfo.transformedTags.count}</p>
            <p>唯一标签: {JSON.stringify(debugInfo.transformedTags.unique)}</p>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">过滤器标签 (uniqueTags)</h2>
            <p>唯一标签: {JSON.stringify(debugInfo.filterTags)}</p>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">前10个条目的详细标签信息</h2>
            {handwritingItems.slice(0, 10).map((item) => (
              <div key={item.id} className="mb-2 p-2 border rounded">
                <p><strong>ID:</strong> {item.id}</p>
                <p><strong>名称:</strong> {item.title}</p>
                <p><strong>原始标签:</strong> {item.originalData.标签}</p>
                <p><strong>转换后标签:</strong> {JSON.stringify(item.tags)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugTagsPage;