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
  sources: Source[];
  link: string[];
}