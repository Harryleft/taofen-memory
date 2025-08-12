import React, { useEffect, useState } from 'react';
import { useHandwritingData } from '@/hooks/useHandwritingData.ts';
import { useHandwritingFilters } from '@/hooks/useHandwritingFilters.ts';

const SimpleTestPage = () => {
  const { handwritingItems, loading, error } = useHandwritingData();
  const [filterResults, setFilterResults] = useState<any>(null);
  
  useEffect(() => {
    if (handwritingItems.length > 0) {
      const filters = {
        searchTerm: '',
        selectedCategory: 'all',
        selectedYear: 'all',
        selectedSource: 'all',
        selectedTag: 'all',
        sortOrder: 'year_desc'
      };
      
      const { uniqueTags, filteredItems } = useHandwritingFilters(handwritingItems, filters);
      
      setFilterResults({
        totalItems: handwritingItems.length,
        uniqueTags: uniqueTags,
        filteredItemsCount: filteredItems.length,
        sampleTags: uniqueTags.slice(0, 10)
      });
      
      console.log('🔍 [SimpleTestPage] Filter results:', {
        uniqueTags,
        totalItems: handwritingItems.length,
        filteredItemsCount: filteredItems.length
      });
    }
  }, [handwritingItems]);
  
  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">简单标签测试页面</h1>
      
      {filterResults && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">基本信息</h2>
            <p>总条目数: {filterResults.totalItems}</p>
            <p>筛选后条目数: {filterResults.filteredItemsCount}</p>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">标签筛选器测试</h2>
            <p>唯一标签数量: {filterResults.uniqueTags.length}</p>
            <p>标签列表: {JSON.stringify(filterResults.uniqueTags)}</p>
            
            {/* 模拟筛选器 */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">选择标签：</label>
              <select className="px-4 py-2 bg-white border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 w-64">
                <option value="all">全部标签</option>
                {filterResults.uniqueTags.map((tag: string) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">检查是否包含目标标签</h2>
            <p>包含 '题词': {filterResults.uniqueTags.includes('题词') ? '✅ 是' : '❌ 否'}</p>
            <p>包含 '文稿': {filterResults.uniqueTags.includes('文稿') ? '✅ 是' : '❌ 否'}</p>
            <p>包含 '书简': {filterResults.uniqueTags.includes('书简') ? '✅ 是' : '❌ 否'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleTestPage;