// src/types/bookTypes.ts

// 原始书籍数据结构
export interface BookData {
  id: number;
  year: number;
  bookname: string;
  writer: string;
  publisher: string;
  image: string;
}

// 在应用中使用的卡片展示数据结构
export interface BookItem {
  id: number;
  title: string;
  year: number;
  author: string;
  publisher: string;
  image: string;
  category: string;
  tags: string[];
  dimensions: {
    width: number;
    height: number;
  };
}

// 分页API响应的数据结构
export interface PaginatedResponse {
  items: BookItem[];
  hasMore: boolean;
  total: number;
  currentPage: number;
}

// 筛选选项的数据结构
export interface FilterOptions {
  category: string;
  year: string;
  searchTerm: string;
}
