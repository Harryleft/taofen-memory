// 重构后的时间线页面组件 - 高内聚低耦合设计

import React, { useState, useCallback, useMemo } from 'react';
import { CoreEventGroup, DataSourceType } from '../../types/timelineTypes';
import { Person } from '../../types/Person';
import { useUnifiedTimelineData } from '../../hooks/useUnifiedTimelineData';
import RefactoredCoreEventSection from './sections/RefactoredCoreEventSection';
import TimelineHeader from './TimelineHeader';

interface RefactoredTimelinePageProps {
  dataSource?: DataSourceType;
  enableSearch?: boolean;
  enableFiltering?: boolean;
  className?: string;
  onPersonClick?: (person: Person) => void;
}

const RefactoredTimelinePage: React.FC<RefactoredTimelinePageProps> = ({
  dataSource = DataSourceType.STATIC_JSON,
  enableSearch = true,
  enableFiltering = true,
  className = '',
  onPersonClick
}) => {
  // 状态管理
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  // 数据管理
  const {
    timelineData,
    loading,
    error,
    loadData,
    refreshData,
    clearCache,
    searchEvents,
    getEventsByYear,
    getEventsByLocation
  } = useUnifiedTimelineData({
    sourceType: dataSource,
    enableCache: true,
    autoLoad: true
  });

  // 过滤后的数据
  const filteredData = useMemo(() => {
    if (!timelineData) return null;

    let filteredGroups = timelineData.groups;

    // 搜索过滤
    if (searchQuery.trim()) {
      const searchResults = searchEvents(searchQuery);
      const searchEventIds = new Set(searchResults.map(event => event.id));
      
      filteredGroups = filteredGroups.map((group: CoreEventGroup) => ({
        ...group,
        timeline: group.timeline.filter(event => searchEventIds.has(event.id))
      })).filter((group: CoreEventGroup) => group.timeline.length > 0);
    }

    // 年份过滤
    if (selectedYear) {
      const yearEvents = getEventsByYear(selectedYear);
      const yearEventIds = new Set(yearEvents.map(event => event.id));
      
      filteredGroups = filteredGroups.map((group: CoreEventGroup) => ({
        ...group,
        timeline: group.timeline.filter(event => yearEventIds.has(event.id))
      })).filter((group: CoreEventGroup) => group.timeline.length > 0);
    }

    // 地点过滤
    if (selectedLocation) {
      const locationEvents = getEventsByLocation(selectedLocation);
      const locationEventIds = new Set(locationEvents.map(event => event.id));
      
      filteredGroups = filteredGroups.map((group: CoreEventGroup) => ({
        ...group,
        timeline: group.timeline.filter(event => locationEventIds.has(event.id))
      })).filter((group: CoreEventGroup) => group.timeline.length > 0);
    }

    return {
      ...timelineData,
      groups: filteredGroups
    };
  }, [timelineData, searchQuery, selectedYear, selectedLocation, searchEvents, getEventsByYear, getEventsByLocation]);

  // 统计信息
  const stats = useMemo(() => {
    if (!filteredData) return null;
    
    const totalEvents = filteredData.groups.reduce(
      (sum: number, group: CoreEventGroup) => sum + group.timeline.length, 
      0
    );
    
    const years = new Set(
      filteredData.groups.flatMap((group: CoreEventGroup) => 
        group.timeline.map(event => new Date(event.time).getFullYear())
      )
    );
    
    const locations = new Set(
      filteredData.groups.flatMap((group: CoreEventGroup) => 
        group.timeline.map(event => event.location).filter(Boolean)
      )
    );

    return {
      totalEvents,
      totalGroups: filteredData.groups.length,
      yearRange: years.size > 0 ? {
        min: Math.min(...Array.from(years)),
        max: Math.max(...Array.from(years))
      } : null,
      uniqueLocations: Array.from(locations).sort()
    };
  }, [filteredData]);

  // 事件处理器
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleYearFilter = useCallback((year: number | null) => {
    setSelectedYear(year);
  }, []);

  const handleLocationFilter = useCallback((location: string | null) => {
    setSelectedLocation(location);
  }, []);

  const handleSectionToggle = useCallback((sectionIndex: number) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionIndex)) {
        newSet.delete(sectionIndex);
      } else {
        newSet.add(sectionIndex);
      }
      return newSet;
    });
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      await refreshData();
    } catch (error) {
      console.error('刷新数据失败:', error);
    }
  }, [refreshData]);

  const handleClearCache = useCallback(async () => {
    try {
      await clearCache();
      await loadData();
    } catch (error) {
      console.error('清除缓存失败:', error);
    }
  }, [clearCache, loadData]);

  // 渲染加载状态
  if (loading) {
    return (
      <div className={`timeline-page-loading ${className}`}>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
          <p className="text-charcoal/60 font-medium">加载时间线数据中...</p>
        </div>
      </div>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <div className={`timeline-page-error ${className}`}>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-red-500 text-6xl">⚠️</div>
          <h2 className="text-xl font-bold text-charcoal">数据加载失败</h2>
          <p className="text-charcoal/60 text-center max-w-md">
            {error.message || '无法加载时间线数据，请稍后重试'}
          </p>
          <div className="flex space-x-4">
            <button 
              onClick={handleRefresh}
              className="px-4 py-2 bg-gold text-white rounded-lg hover:bg-gold/80 transition-colors"
            >
              重新加载
            </button>
            <button 
              onClick={handleClearCache}
              className="px-4 py-2 border border-charcoal/20 text-charcoal rounded-lg hover:bg-charcoal/5 transition-colors"
            >
              清除缓存
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 渲染空数据状态
  if (!filteredData || filteredData.groups.length === 0) {
    return (
      <div className={`timeline-page-empty ${className}`}>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-charcoal/40 text-6xl">📅</div>
          <h2 className="text-xl font-bold text-charcoal">暂无数据</h2>
          <p className="text-charcoal/60 text-center max-w-md">
            {searchQuery || selectedYear || selectedLocation 
              ? '没有找到符合条件的事件，请尝试调整筛选条件' 
              : '时间线数据为空'}
          </p>
          {(searchQuery || selectedYear || selectedLocation) && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedYear(null);
                setSelectedLocation(null);
              }}
              className="px-4 py-2 bg-gold text-white rounded-lg hover:bg-gold/80 transition-colors"
            >
              清除筛选
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`refactored-timeline-page ${className}`}>
      {/* 页面头部 */}
      <TimelineHeader 
        stats={stats}
        searchQuery={searchQuery}
        selectedYear={selectedYear}
        selectedLocation={selectedLocation}
        availableYears={stats?.yearRange ? 
          Array.from({length: stats.yearRange.max - stats.yearRange.min + 1}, 
            (_, i) => stats.yearRange!.min + i) : []}
        availableLocations={stats?.uniqueLocations || []}
        onSearch={enableSearch ? handleSearch : undefined}
        onYearFilter={enableFiltering ? handleYearFilter : undefined}
        onLocationFilter={enableFiltering ? handleLocationFilter : undefined}
        onRefresh={handleRefresh}
        onClearCache={handleClearCache}
      />

      {/* 时间线内容 */}
      <main className="timeline-content">
        <div className="space-y-8">
          {filteredData.groups.map((coreEventGroup: CoreEventGroup, index: number) => (
            <RefactoredCoreEventSection
              key={`${coreEventGroup.core_event}-${index}`}
              coreEventGroup={coreEventGroup}
              sectionIndex={index}
              onPersonClick={onPersonClick}
              expandable={true}
              defaultExpanded={expandedSections.has(index)}
            />
          ))}
        </div>
      </main>

      {/* 页面底部信息 */}
      <footer className="mt-16 pt-8 border-t border-charcoal/10">
        <div className="text-center text-sm text-charcoal/50">
          <p>共 {stats?.totalEvents} 个事件，分布在 {stats?.totalGroups} 个主题中</p>
          {stats?.yearRange && (
            <p className="mt-1">
              时间跨度：{stats.yearRange.min} - {stats.yearRange.max}
            </p>
          )}
        </div>
      </footer>
    </div>
  );
};

export default RefactoredTimelinePage;

// 导出类型
export type { RefactoredTimelinePageProps };