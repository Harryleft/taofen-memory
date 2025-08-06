import React from 'react';
import { Search, Download } from 'lucide-react';

interface BookstoreFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  uniqueCategories: string[];
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  uniqueYears: number[];
  onDownload: () => void;
}

const BookFiltersPanel: React.FC<BookstoreFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  uniqueCategories,
  selectedYear,
  setSelectedYear,
  uniqueYears,
  onDownload,
}) => (
  <div className="mb-8 space-y-4 mx-auto max-w-4xl">
    <div className="flex flex-wrap gap-4 items-center justify-center">
      <div className="relative flex-1 min-w-64 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="搜索书籍、作者、出版社..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-serif"
        />
      </div>

      {uniqueCategories.length > 0 && (
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-serif"
        >
          <option value="all">全部类别</option>
          {uniqueCategories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      )}

      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-serif"
      >
        <option value="all">全部年份</option>
        {uniqueYears.map(year => (
          <option key={year} value={year.toString()}>{year}年</option>
        ))}
      </select>

      <button
        onClick={onDownload}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
        title="下载全部书籍数据为CSV文件"
      >
        <Download size={18} className="mr-2" />
        <span className="font-medium">导出数据</span>
      </button>
    </div>
  </div>
);

export default BookFiltersPanel;
