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
  // 预留扩展字段，承载标签与权重信息，避免侵入现有字段
  extra?: {
    tags?: {
      relationshipTypes?: string[];
      aspects?: string[];
    };
    tier?: string;
    importance?: number;
  };
}