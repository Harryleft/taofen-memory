/**
 * @file BookFiltersPanel.tsx
 * @description 书籍列表的筛选和操作面板组件。
 * @module components/bookstore/BookFiltersPanel
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Calendar, ChevronDown, Newspaper } from 'lucide-react';

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
  activeTab?: 'books' | 'newspapers';
  onTabChange?: (tabId: 'books' | 'newspapers') => void;
}

/**
 * @component BookFiltersPanel
 * @description 提供用户界面以对书籍列表进行筛选和操作。
 * - 包含一个文本输入框用于按关键词搜索。
 * - 提供一个自定义的下拉菜单用于按年份筛选。
 * - 包含一个按钮，用于触发数据导出功能。
 * - 包含一个按钮，用于跳转到数字报刊页面。
 * - 筛选状态由父组件通过 props 传入和控制。
 */
const BookFiltersPanel: React.FC<BookstoreFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedYear,
  setSelectedYear,
  uniqueYears,
  onDownload,
  activeTab = 'books',
}) => {
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // 处理点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setYearDropdownOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setYearDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);
  
  return (
  <div className="mb-8 space-y-4 mx-auto max-w-4xl">
    <div className="flex flex-wrap gap-2 items-center justify-center">
      <div className="bookstore-search-input-container min-w-64 max-w-md">
        <Search className="bookstore-search-input-icon" size={20} />
        <input
          type="text"
          placeholder="搜索书籍、作者、出版社..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bookstore-search-input font-serif"
        />
      </div>


      <div className="relative inline-block min-w-40" ref={dropdownRef}>
        <button 
          type="button"
          onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
          className="bookstore-year-button"
          aria-expanded={yearDropdownOpen}
          aria-haspopup="listbox"
          aria-label="选择年份"
        >
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/60" size={18} />
          <span className="font-medium">{selectedYear === 'all' ? '全部年份' : `${selectedYear}年`}</span>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <div className={`transform transition-transform duration-300 ${yearDropdownOpen ? 'rotate-180' : ''}`}>
              <ChevronDown className="h-5 w-5 text-primary/60" />
            </div>
          </div>
        </button>
        
        <div className={`bookstore-year-dropdown ${yearDropdownOpen ? 'open' : ''}`}>
          <div 
            className="py-1"
            role="listbox"
            aria-label="年份选项"
          >
            <button
              role="option"
              aria-selected={selectedYear === 'all' ? "true" : "false"}
              className={`bookstore-year-option ${selectedYear === 'all' ? 'selected' : ''}`}
              onClick={() => {
                setSelectedYear('all');
                setYearDropdownOpen(false);
              }}
            >
              <span className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-primary/60" />
                全部年份
              </span>
            </button>
            
            {uniqueYears.map(year => (
              <button
                key={year}
                role="option"
                aria-selected={selectedYear === year.toString() ? "true" : "false"}
                className={`bookstore-year-option ${selectedYear === year.toString() ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedYear(year.toString());
                  setYearDropdownOpen(false);
                }}
              >
                <span className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-primary/60" />
                  {year}年
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate('/newspapers')}
        className={`bookstore-download-button ${activeTab === 'newspapers' ? 'bg-blue-100 text-blue-700 border-blue-300' : ''}`}
        title="查看数字报刊"
      >
        <Newspaper size={18} className="mr-2" />
        <span>数字报刊</span>
      </button>

      <button
        onClick={onDownload}
        className="bookstore-download-button"
        title="下载数据"
      >
        <Download size={18} className="mr-2" />
        <span>导出数据</span>
      </button>
    </div>
  </div>
  );
};

export default BookFiltersPanel;
