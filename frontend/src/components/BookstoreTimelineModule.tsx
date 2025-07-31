// @ts-ignore - react-chrono doesn't have proper TypeScript types
import { Chrono } from 'react-chrono';

interface BookstoreEvent {
  id: number;
  year: number;
  month: number;
  date: string;
  title: string;
  description: string;
  location: string;
  type: 'establishment' | 'expansion' | 'publication' | 'milestone' | 'closure';
  image: string;
  details: string[];
  impact: string;
}

const bookstoreEvents: BookstoreEvent[] = [
  {
    id: 1,
    year: 1932,
    month: 7,
    date: '1932年7月',
    title: '生活书店成立',
    description: '在上海正式成立生活书店，开启现代出版事业',
    location: '上海',
    type: 'establishment',
    image: 'https://images.pexels.com/photos/159832/shanghai-china-city-modern-159832.jpeg?auto=compress&cs=tinysrgb&w=600',
    details: [
      '注册资本5000元，员工12人',
      '以"为大众服务"为宗旨',
      '首批出版《生活》周刊合订本'
    ],
    impact: '奠定了现代进步出版事业的基础'
  },
  {
    id: 2,
    year: 1933,
    month: 3,
    date: '1933年3月',
    title: '北平分店开业',
    description: '在北平设立第一家分店，开始全国布局',
    location: '北平',
    type: 'expansion',
    image: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=600',
    details: [
      '选址在繁华的王府井大街',
      '主要销售进步书籍和期刊',
      '成为北方进步文化的重要阵地'
    ],
    impact: '扩大了进步思想在华北地区的影响'
  },
  {
    id: 3,
    year: 1933,
    month: 8,
    date: '1933年8月',
    title: '《大众生活》创刊',
    description: '创办《大众生活》周刊，发行量创新高',
    location: '上海',
    type: 'publication',
    image: 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=600',
    details: [
      '首期发行量达到5万份',
      '关注社会现实和民生问题',
      '成为最受欢迎的进步刊物'
    ],
    impact: '进一步扩大了生活书店的社会影响力'
  },
  {
    id: 4,
    year: 1934,
    month: 5,
    date: '1934年5月',
    title: '汉口分店成立',
    description: '在华中重镇汉口开设分店，完善中部布局',
    location: '汉口',
    type: 'expansion',
    image: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=600',
    details: [
      '位于汉口租界繁华地段',
      '服务华中地区读者',
      '建立区域发行网络'
    ],
    impact: '构建了覆盖华中的发行体系'
  },
  {
    id: 5,
    year: 1935,
    month: 2,
    date: '1935年2月',
    title: '发行量突破15万',
    description: '《大众生活》发行量突破15万份，创历史新高',
    location: '全国',
    type: 'milestone',
    image: 'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=600',
    details: [
      '成为当时发行量最大的周刊',
      '读者遍布全国各地',
      '影响力达到顶峰'
    ],
    impact: '确立了在中国出版界的领导地位'
  },
  {
    id: 6,
    year: 1935,
    month: 12,
    date: '1935年12月',
    title: '《大众生活》被迫停刊',
    description: '因政治压力，《大众生活》被迫停刊',
    location: '上海',
    type: 'closure',
    image: 'https://images.pexels.com/photos/789555/pexels-photo-789555.jpeg?auto=compress&cs=tinysrgb&w=600',
    details: [
      '遭到国民党当局查禁',
      '邹韬奋被迫流亡海外',
      '生活书店业务受到重创'
    ],
    impact: '标志着一个时代的结束，但精神影响延续至今'
  },
  {
    id: 7,
    year: 1936,
    month: 6,
    date: '1936年6月',
    title: '重庆分店开业',
    description: '在重庆开设分店，继续传播进步文化',
    location: '重庆',
    type: 'expansion',
    image: 'https://images.pexels.com/photos/2041540/pexels-photo-2041540.jpeg?auto=compress&cs=tinysrgb&w=600',
    details: [
      '选址在重庆市中心',
      '主要经营抗战文献',
      '成为西南地区文化中心'
    ],
    impact: '在抗战时期发挥了重要的文化宣传作用'
  }
];

// Icons are handled by react-chrono internally

// Convert BookstoreEvent to react-chrono TimelineItemModel format
const convertToChronoItems = (events: BookstoreEvent[]) => {
  return events.map((event) => ({
    title: event.date,
    cardTitle: event.title,
    cardSubtitle: `${event.location} · ${event.type}`,
    cardDetailedText: [
      event.description,
      '',
      '详细信息：',
      ...event.details,
      '',
      `历史影响：${event.impact}`
    ],
    media: {
      type: 'IMAGE' as const,
      source: {
        url: event.image
      },
      name: event.title
    }
  }));
};

interface BookstoreTimelineModuleProps {
  className?: string;
}

export default function BookstoreTimelineModule({ className = '' }: BookstoreTimelineModuleProps) {
  // Convert events to react-chrono format
  const chronoItems = convertToChronoItems(bookstoreEvents);
  
  // Custom theme for react-chrono to match project design
  const chronoTheme = {
    primary: '#F59E0B',           // gold color
    secondary: '#FEF3C7',         // cream color
    cardBgColor: '#FEF3C7',       // cream background
    cardForeColor: '#374151',     // charcoal text
    titleColor: '#374151',        // charcoal
    titleColorActive: '#F59E0B',  // gold for active
    cardTitleColor: '#374151',    // charcoal
    cardSubtitleColor: '#6B7280', // gray
    cardDetailsColor: '#374151',  // charcoal
    iconBackgroundColor: '#F59E0B', // gold
    timelinePointDimension: 16,
    cardHeight: 250,
    cardWidth: 400,
    fontSizes: {
      cardSubtitle: '0.9rem',
      cardText: '0.95rem',
      cardTitle: '1.1rem',
      title: '1rem'
    }
  };

  return (
    <section className={`py-20 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-charcoal mb-6 font-serif">生活书店历程</h2>
          <p className="text-xl text-charcoal/70 max-w-3xl mx-auto leading-relaxed">
            见证生活书店从创立到发展的完整历程，感受进步出版事业的时代脉动
          </p>
        </div>

        {/* React Chrono Timeline */}
        <div className="w-full" style={{ height: '600px' }}>
          <Chrono
            items={chronoItems}
            mode="VERTICAL_ALTERNATING"
            theme={chronoTheme}
            slideShow={false}
            enableOutline={true}
            cardHeight={250}
            disableNavOnKey={false}
            scrollable={{ scrollbar: false }}
            fontSizes={{
              cardSubtitle: '0.9rem',
              cardText: '0.95rem',
              cardTitle: '1.2rem',
              title: '1rem'
            }}
            mediaSettings={{
              align: 'center',
              fit: 'cover'
            }}
            classNames={{
              card: 'timeline-card',
              cardMedia: 'timeline-media',
              cardSubTitle: 'timeline-subtitle',
              cardText: 'timeline-text',
              cardTitle: 'timeline-title'
            }}
          />
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16">
          <div className="text-center p-6 bg-cream rounded-lg">
            <div className="text-3xl font-bold text-gold mb-2">7</div>
            <div className="text-charcoal/70">重要事件</div>
          </div>
          <div className="text-center p-6 bg-cream rounded-lg">
            <div className="text-3xl font-bold text-gold mb-2">5</div>
            <div className="text-charcoal/70">发展年份</div>
          </div>
          <div className="text-center p-6 bg-cream rounded-lg">
            <div className="text-3xl font-bold text-gold mb-2">15万</div>
            <div className="text-charcoal/70">最高发行量</div>
          </div>
          <div className="text-center p-6 bg-cream rounded-lg">
            <div className="text-3xl font-bold text-gold mb-2">全国</div>
            <div className="text-charcoal/70">影响范围</div>
          </div>
        </div>
      </div>

    </section>
  );
}