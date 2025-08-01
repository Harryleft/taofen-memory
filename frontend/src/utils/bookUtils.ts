import { BookItem } from '../types/bookTypes';
import { searchKeywordMap } from '../constants/bookConstants';

// 通用模糊搜索函数
export const fuzzyMatch = (searchTerm: string, targetText: string): boolean => {
  const lowerSearchTerm = searchTerm.toLowerCase();
  const lowerTargetText = targetText.toLowerCase();
  
  if (lowerTargetText.includes(lowerSearchTerm)) {
    return true;
  }
  
  const mappedKeywords = searchKeywordMap[searchTerm];
  if (mappedKeywords) {
    return mappedKeywords.some(keyword => 
      lowerTargetText.includes(keyword.toLowerCase())
    );
  }
  
  if (searchTerm.length > 1) {
    const chars = searchTerm.split('');
    let lastIndex = -1;
    const allCharsFound = chars.every(char => {
      const index = lowerTargetText.indexOf(char, lastIndex + 1);
      if (index > lastIndex) {
        lastIndex = index;
        return true;
      }
      return false;
    });
    if (allCharsFound) return true;
  }
  
  return false;
};

// CSV生成功能
export const generateCSV = (books: BookItem[]): string => {
  const headers = ['书名', '作者', '出版社', '出版年份', '分类', '书籍ID'];
  const csvContent = [
    headers.join(','),
    ...books.map(book => [
      `"${book.title.replace(/"/g, '""')}"`,
      `"${book.author.replace(/"/g, '""')}"`,
      `"${book.publisher.replace(/"/g, '""')}"`,
      book.year,
      `"${book.category}"`,
      book.id
    ].join(','))
  ].join('\n');
  
  return csvContent;
};

// CSV下载功能
export const downloadCSV = (books: BookItem[]) => {
  const csvContent = generateCSV(books);
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `韬奋时光书影_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};
