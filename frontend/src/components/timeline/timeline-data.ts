export interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  description: string;
  details: string[];
  imageUrl: string;
  location: string;
  period: 'early' | 'middle' | 'late';
}

export const timelineEvents: TimelineEvent[] = [
  {
    id: '1895',
    year: 1895,
    title: '诞生于福建永安',
    description: '邹韬奋出生于福建永安县一个小商人家庭，原名邹恩润。',
    details: [
      '父亲邹国珍经营茶叶生意',
      '家境虽不富裕但重视教育',
      '自幼聪颖好学，展现出过人的文学天赋'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    location: '福建永安',
    period: 'early'
  },
  {
    id: '1900',
    year: 1900,
    title: '开始接受传统教育',
    description: '5岁的邹韬奋开始在私塾接受传统的四书五经教育。',
    details: [
      '在私塾学习古文经典',
      '展现出优异的记忆力和理解力',
      '为日后的文学创作奠定了深厚的古文基础'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    location: '福建永安',
    period: 'early'
  },
  {
    id: '1915',
    year: 1915,
    title: '考入上海圣约翰大学',
    description: '20岁的邹韬奋以优异成绩考入上海圣约翰大学文科。',
    details: [
      '主修英语文学专业',
      '积极参与学生社团活动',
      '开始接触西方进步思想和民主理念'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop',
    location: '上海',
    period: 'early'
  },
  {
    id: '1922',
    year: 1922,
    title: '创办《生活》周刊',
    description: '邹韬奋创办了著名的《生活》周刊，开启了新闻出版事业的辉煌历程。',
    details: [
      '以"服务社会，教育民众"为办刊宗旨',
      '倡导科学理性的生活方式',
      '很快成为当时最具影响力的刊物之一'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop',
    location: '上海',
    period: 'middle'
  },
  {
    id: '1926',
    year: 1926,
    title: '《生活》周刊影响力扩大',
    description: '《生活》周刊发行量突破10万份，成为全国最有影响力的期刊。',
    details: [
      '发行量达到15万份的高峰',
      '读者遍布全国各大城市',
      '成为青年知识分子的精神食粮'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=300&fit=crop',
    location: '上海',
    period: 'middle'
  },
  {
    id: '1932',
    year: 1932,
    title: '流亡欧洲考察',
    description: '因政治压力被迫流亡欧洲，考察西方新闻出版事业。',
    details: [
      '游历英、法、德、苏等多个国家',
      '深入了解西方新闻出版业的运作模式',
      '撰写了大量考察报告和游记'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&h=300&fit=crop',
    location: '欧洲',
    period: 'middle'
  },
  {
    id: '1935',
    year: 1935,
    title: '创办生活书店',
    description: '回国后创办生活书店，推动进步文化传播。',
    details: [
      '建立了覆盖全国的发行网络',
      '出版了大量进步文学作品',
      '为抗日救亡运动提供了重要的舆论阵地'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
    location: '上海',
    period: 'middle'
  },
  {
    id: '1937',
    year: 1937,
    title: '投身抗日救亡运动',
    description: '全面抗战爆发后，邹韬奋积极投身抗日救亡运动。',
    details: [
      '发表了大量抗日文章和演讲',
      '组织文化界人士支援前线',
      '用笔杆子为抗战胜利贡献力量'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=300&fit=crop',
    location: '全国各地',
    period: 'late'
  },
  {
    id: '1941',
    year: 1941,
    title: '在上海坚持办刊',
    description: '在极其困难的条件下，继续在上海坚持办刊和出版工作。',
    details: [
      '克服物资短缺和政治压力',
      '坚持发出进步的声音',
      '成为黑暗中的一盏明灯'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1526220362219-d2419bbe8089?w=400&h=300&fit=crop',
    location: '上海',
    period: 'late'
  },
  {
    id: '1944',
    year: 1944,
    title: '病逝于上海',
    description: '7月24日，邹韬奋因病在上海逝世，享年49岁。',
    details: [
      '临终前仍在关心国家和民族的命运',
      '留下了丰富的文化遗产',
      '被誉为"人民的出版家"'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop',
    location: '上海',
    period: 'late'
  }
];

export const periods = [
  { id: 'early', name: '求学成长期', color: '#A7C4E0', years: '1895-1921' },
  { id: 'middle', name: '事业发展期', color: '#7FA8CC', years: '1922-1936' },
  { id: 'late', name: '救亡图存期', color: '#5B8CB8', years: '1937-1944' }
] as const;