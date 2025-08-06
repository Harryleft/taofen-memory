/**
 * @file BookFiltersPanel.tsx
 * @description 书籍列表的筛选和操作面板组件。
 * @module components/bookstore/BookFiltersPanel
 */

import React, { useState } from 'react';
import { Search, Download, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * @interface BookFiltersPanelProps
 * @description BookFiltersPanel 组件的 props 定义。
 * @property {string} searchTerm - 当前的搜索关键词。
 * @property {(term: string) => void} setSearchTerm - 更新搜索关键词的回调函数。
 * @property {string} selectedCategory - 当前选中的分类。
 * @property {(category: string) => void} setSelectedCategory - 更新选中分类的回调函数。
 * @property {string[]} uniqueCategories - 所有唯一的分类列表。
 * @property {string} selectedYear - 当前选中的年份。
 * @property {(year: string) => void} setSelectedYear - 更新选中年份的回调函数。
 * @property {number[]} uniqueYears - 所有唯一的年份列表。
 * @property {() => void} onDownload - 点击“导出数据”按钮时触发的回调函数。
 */
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

/**
 * @component BookFiltersPanel
 * @description 提供用户界面以对书籍列表进行筛选和操作。
 * - 包含一个文本输入框用于按关键词搜索。
 * - 提供一个自定义的下拉菜单用于按年份筛选。
 * - 包含一个按钮，用于触发数据导出功能。
 * - 筛选状态由父组件通过 props 传入和控制。
 */
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
}) => {
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  
  return (
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


      <div className="relative inline-block min-w-40">
        <button 
          type="button"
          onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
          className="flex items-center w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-serif bg-white text-left"
        >
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <span>{selectedYear === 'all' ? '全部年份' : `${selectedYear}年`}</span>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            {yearDropdownOpen ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </div>
        </button>
        
        {yearDropdownOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div 
              className="py-1 divide-y divide-gray-100"
              onClick={() => setYearDropdownOpen(false)}
            >
              <button
                className={`block w-full px-4 py-2 text-left hover:bg-blue-50 ${selectedYear === 'all' ? 'bg-blue-100 font-medium' : ''}`}
                onClick={() => setSelectedYear('all')}
              >
                全部年份
              </button>
              
              {uniqueYears.map(year => (
                <button
                  key={year}
                  className={`block w-full px-4 py-2 text-left hover:bg-blue-50 ${selectedYear === year.toString() ? 'bg-blue-100 font-medium' : ''}`}
                  onClick={() => setSelectedYear(year.toString())}
                >
                  {year}年
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

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
};

export default BookFiltersPanel;
