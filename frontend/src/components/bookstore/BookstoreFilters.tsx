import React from 'react';
import { Search, Download } from 'lucide-react';
import { BookItem } from '../../types/bookTypes';

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

const BookstoreFilters: React.FC<BookstoreFiltersProps> = ({
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
  <div className="flex flex-wrap gap-4 mb-8 justify-center">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/60" size={20} />
      <input
        type="text"
        placeholder="搜索书籍、作者、出版社..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10 pr-4 py-2 bg-white border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 w-80"
        style={{ fontFamily: "'SimSun', '宋体', 'NSimSun', serif" }}
      />
    </div>
    
    <select
      value={selectedCategory}
      onChange={(e) => setSelectedCategory(e.target.value)}
      className="px-4 py-2 bg-white border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
      style={{ fontFamily: "'SimSun', '宋体', 'NSimSun', serif" }}
    >
      <option value="all">全部出版社</option>
      {uniqueCategories.map(category => (
        <option key={category} value={category}>{category}</option>
      ))}
    </select>
    
    <select
      value={selectedYear}
      onChange={(e) => setSelectedYear(e.target.value)}
      className="px-4 py-2 bg-white border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
      style={{ fontFamily: "'SimSun', '宋体', 'NSimSun', serif" }}
    >
      <option value="all">全部年份</option>
      {uniqueYears.map(year => (
        <option key={year} value={year.toString()}>{year}年</option>
      ))}
    </select>

    <button
      onClick={onDownload}
      className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gold/30 text-charcoal rounded-lg hover:bg-gold/5 hover:border-gold/60 focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all duration-300 shadow-sm hover:shadow-md"
      style={{ fontFamily: "'KaiTi', 'STKaiti', '华文楷体', serif" }}
      title="下载全部书籍数据为CSV文件"
    >
      <Download size={18} className="text-gold" />
      <span className="font-medium">导出数据</span>
    </button>
  </div>
);

export default BookstoreFilters;
