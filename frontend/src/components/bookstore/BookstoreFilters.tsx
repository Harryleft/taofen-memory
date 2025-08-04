import React from 'react';
import { Search, Download } from 'lucide-react';
import { BOOKSTORE_FONTS, BOOKSTORE_STYLES } from '../../styles/bookstore';

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
  <div className={BOOKSTORE_STYLES.filters.container}>
    <div className={BOOKSTORE_STYLES.filters.searchInput.container}>
      <Search className={BOOKSTORE_STYLES.filters.searchInput.icon} size={20} />
      <input
        type="text"
        placeholder="搜索书籍、作者、出版社..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={BOOKSTORE_STYLES.filters.searchInput.input}
        style={{ fontFamily: BOOKSTORE_FONTS.song }}
      />
    </div>
    
    
    <select
      value={selectedYear}
      onChange={(e) => setSelectedYear(e.target.value)}
      className={BOOKSTORE_STYLES.filters.select}
      style={{ fontFamily: BOOKSTORE_FONTS.song }}
    >
      <option value="all">全部年份</option>
      {uniqueYears.map(year => (
        <option key={year} value={year.toString()}>{year}年</option>
      ))}
    </select>

    <button
      onClick={onDownload}
      className={BOOKSTORE_STYLES.filters.downloadButton}
      style={{ fontFamily: BOOKSTORE_FONTS.kai }}
      title="下载全部书籍数据为CSV文件"
    >
      <Download size={18} className="text-gold" />
      <span className="font-medium">导出数据</span>
    </button>
  </div>
);

export default BookstoreFilters;
