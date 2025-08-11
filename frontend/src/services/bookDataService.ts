import { BookItem, FilterOptions, BookData, PaginatedResponse } from '../types/bookTypes';
import { fuzzyMatch } from '../utils/bookUtils';

let allBooksCache: BookItem[] | null = null;

export const loadAllBooksData = async (): Promise<BookItem[]> => {
  if (allBooksCache) return allBooksCache;
  
  const response = await fetch('/data/json/books.json');
  if (!response.ok) {
    throw new Error(`Failed to fetch books data: ${response.status}`);
  }
  
  const booksData: BookData[] = await response.json();
  
  allBooksCache = booksData
    .filter(book => book.image && book.year >= 1900 && book.year <= 1949)
    .map(book => {
      let category = '其他出版社';
      const isLifeBookstore = 
        book.publisher?.includes('生活书店') || 
        book.publisher?.includes('生活周刊社') ||
        book.publisher?.includes('读书生活出版社') ||
        book.publisher?.includes('读书生活社') ||
        book.publisher?.includes('生活出版社') ||
        book.publisher?.includes('新生活书店') ||
        book.writer?.includes('邹韬奋') ||
        book.writer?.includes('韬奋') ||
        book.writer?.includes('生活书店');
      
      if (isLifeBookstore) {
        category = '生活书店系';
      }
      
      return {
        id: book.id,
        title: book.bookname,
        year: book.year,
        author: book.writer || '佚名',
        publisher: book.publisher || '未知出版社',
        image: book.image,
        category,
        tags: [category, `${Math.floor(book.year / 10) * 10}年代`],
        dimensions: {
          width: 200,
          height: Math.floor(Math.random() * 100) + 250
        }
      };
    })
    .sort((a, b) => a.year - b.year);
    
  return allBooksCache;
};

export const loadBooksDataPaginated = async (
  page: number = 0,
  pageSize: number = 30,
  filters?: FilterOptions
): Promise<PaginatedResponse> => {
  const allBooks = await loadAllBooksData();
  
  let filteredBooks = allBooks;
  
  if (filters) {
    filteredBooks = allBooks.filter(item => {
      const matchesSearch = !filters.searchTerm || 
        fuzzyMatch(filters.searchTerm, item.title) ||
        fuzzyMatch(filters.searchTerm, item.author) ||
        fuzzyMatch(filters.searchTerm, item.publisher);
      
      const matchesYear = filters.year === 'all' || item.year.toString() === filters.year;
      const matchesCategory = filters.category === 'all' || item.category === filters.category;
      
      return matchesSearch && matchesYear && matchesCategory;
    });
  }
  
  const start = page * pageSize;
  const items = filteredBooks.slice(start, start + pageSize);
  const hasMore = start + pageSize < filteredBooks.length;
  
  return {
    items,
    hasMore,
    total: filteredBooks.length,
    currentPage: page
  };
};

export const clearBooksCache = (): void => {
  allBooksCache = null;
};