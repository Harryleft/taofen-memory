export interface Source {
  title: string;
  url?: string;
}

export interface Person {
  id: number;
  name: string;
  category: string;
  img: string;
  description: string;
  sources: Source[] | string[]; // 支持两种格式：对象数组或字符串数组
  link: string[];
}