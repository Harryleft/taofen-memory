import { memo } from 'react';
import { Search, FolderOpen, Calendar, SortAsc } from 'lucide-react';
import { categoryLabels } from '@/utils/handwritingUtils';

interface FilterControlsProps {
  searchTerm: string;
  filters: {
    selectedCategory: string;
    selectedYear: string;
    selectedSource: string;
    selectedTag: string;
    sortOrder: string;
  };
  uniqueYears: number[];
  uniqueSources: string[];
  uniqueTags: string[];
  onSearchChange: (term: string) => void;
  onFilterChange: (key: string, value: string) => void;
}

const HandwritingFilterControls = memo(({
  searchTerm,
  filters,
  uniqueYears,
  onSearchChange,
  onFilterChange
}: FilterControlsProps) => {
  return (
    <div className="space-y-4 mb-8">
      {/* 搜索栏 */}
      <div className="flex justify-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/60" size={20} />
          <input
            type="text"
            placeholder="搜索手迹（名称、原文、注释）..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 w-80"
          />
        </div>
      </div>
      
      {/* 筛选和排序控件 */}
      <div className="flex flex-wrap gap-4 justify-center">
        <div className="relative">
          <FolderOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/60" size={16} />
          <select
            value={filters.selectedCategory}
            onChange={(e) => onFilterChange('selectedCategory', e.target.value)}
            className="pl-10 pr-8 py-2 bg-white border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 appearance-none"
          >
            <option value="all">全部类型</option>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/60" size={16} />
          <select
            value={filters.selectedYear}
            onChange={(e) => onFilterChange('selectedYear', e.target.value)}
            className="pl-10 pr-8 py-2 bg-white border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 appearance-none"
          >
            <option value="all">全部年份</option>
            {uniqueYears.map(year => (
              <option key={year} value={year.toString()}>{year}年</option>
            ))}
          </select>
        </div>


        <div className="relative">
          <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/60" size={16} />
          <select
            value={filters.sortOrder}
            onChange={(e) => onFilterChange('sortOrder', e.target.value)}
            className="pl-10 pr-8 py-2 bg-white border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 appearance-none"
          >
            <option value="year_desc">时间（新到旧）</option>
            <option value="year_asc">时间（旧到新）</option>
            <option value="name_asc">名称（A-Z）</option>
            <option value="name_desc">名称（Z-A）</option>
          </select>
        </div>
      </div>
    </div>
  );
});

HandwritingFilterControls.displayName = 'HandwritingFilterControls';

export default HandwritingFilterControls;
