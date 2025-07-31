import { Timeline } from 'vis-timeline/esnext';
import { DataSet } from 'vis-data/esnext';
import 'vis-timeline/styles/vis-timeline-graph2d.css';
import { useEffect, useRef } from 'react';
import '../styles/vis-timeline-custom.css';

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

// 本地图片数据源 - 使用public目录中的图片
const localBookImages = [
  'book_24033_5774757e61cccbd0.jpg',
  'book_23416_-4998639186942255748.jpg',
  'book_23417_-3852244789965758496.jpg', 
  'book_23418_4462283b97413ab9.jpg',
  'book_23419_-5632022676287629273.jpg',
  'book_23420_-1855791942358398657.jpg',
  'book_23421_-2042169621397586150.jpg',
  'book_23422_-7115342089587619670.jpg',
  'book_23423_-8373031078909513017.jpg',
  'book_23424_-2604910119916886782.jpg'
];

// 生成时间线数据 - 使用本地图片，跨越1932-1936年
const generateTimelineData = (): BookstoreEvent[] => {
  const years = [1932, 1933, 1934, 1935, 1936];
  const titles = [
    '生活书店成立', '北平分店开业', '《大众生活》创刊', '汉口分店成立', '发行量突破',
    '重庆分店开业', '新书发行', '分店扩展', '读者活动', '文化传播',
    '出版高峰', '影响扩大', '社会反响', '文化交流', '读者增长',
    '书店网络', '文化事业', '社会进步', '思想传播', '文化建设'
  ];
  
  return localBookImages.map((image, index) => ({
    id: index + 1,
    year: years[index % 5], // 循环分配到5年中
    month: 1,
    date: `${years[index % 5]}年`,
    title: titles[index % 20], // 循环使用标题
    description: `第${index + 1}本图书`,
    location: ['上海', '北平', '汉口', '重庆', '南京'][index % 5],
    type: ['establishment', 'expansion', 'publication', 'milestone', 'closure'][index % 5] as BookstoreEvent['type'],
    image: `/images/books/${image}`, // public目录图片路径
    details: [],
    impact: ''
  }));
};

const bookstoreEvents: BookstoreEvent[] = generateTimelineData();

// Convert BookstoreEvent to vis-timeline format - 极简图片展示
const convertToVisTimelineItems = (events: BookstoreEvent[]) => {
  return events.map((event, index) => ({
    id: event.id,
    content: `
      <div class="timeline-item-wrapper">
        <img src="${event.image}" alt="${event.title}" class="timeline-thumbnail" loading="lazy" />
        <div class="timeline-item-label">${event.title}</div>
      </div>
    `,
    start: new Date(event.year, 0, 1), // 简化到年份，不用月份
    type: 'box',
    className: 'timeline-image-item'
  }));
};

interface BookstoreTimelineModuleProps {
  className?: string;
}

export default function BookstoreTimelineModule({ className = '' }: BookstoreTimelineModuleProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineInstance = useRef<Timeline | null>(null);

  useEffect(() => {
    if (!timelineRef.current) return;

    // Convert data to vis-timeline format
    const items = new DataSet(convertToVisTimelineItems(bookstoreEvents));

    // Timeline configuration - 强制堆叠的图片时间线
    const options = {
      height: '400px',
      start: new Date(1931, 0, 1),
      end: new Date(1937, 0, 1),
      orientation: 'bottom',
      stack: true,
      stackSubgroups: true,
      showCurrentTime: false,
      zoomMin: 1000 * 60 * 60 * 24 * 365, // 1 year
      zoomMax: 1000 * 60 * 60 * 24 * 365 * 20, // 20 years
      margin: {
        item: {
          horizontal: 5, // 减少水平间距
          vertical: 5    // 减少垂直间距
        },
        axis: 50
      },
      showMajorLabels: true,
      showMinorLabels: false, // 不显示月份
      format: {
        majorLabels: {
          year: 'YYYY年'
        }
      },
      template: function(item: any) {
        return item.content;
      }
    };

    // Create timeline without groups (简化版本)
    timelineInstance.current = new Timeline(timelineRef.current, items, options);

    return () => {
      if (timelineInstance.current) {
        timelineInstance.current.destroy();
      }
    };
  }, []);

  return (
    <section className={`py-20 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-charcoal mb-6 font-serif">生活书店历程</h2>
          <p className="text-xl text-charcoal/70 max-w-3xl mx-auto leading-relaxed">
            见证生活书店从创立到发展的完整历程，感受进步出版事业的时代脉动
          </p>
        </div>

        {/* Vis Timeline - 极简图片时间线 */}
        <div 
          ref={timelineRef} 
          className="w-full vis-timeline-container"
          style={{ height: '400px', border: '1px solid #FCD34D', borderRadius: '8px', backgroundColor: '#FFFEF7' }}
        />



        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16">
          <div className="text-center p-6 bg-cream rounded-lg">
            <div className="text-3xl font-bold text-gold mb-2">10</div>
            <div className="text-charcoal/70">书籍图片</div>
          </div>
          <div className="text-center p-6 bg-cream rounded-lg">
            <div className="text-3xl font-bold text-gold mb-2">5</div>
            <div className="text-charcoal/70">发展年份</div>
          </div>
          <div className="text-center p-6 bg-cream rounded-lg">
            <div className="text-3xl font-bold text-gold mb-2">Public</div>
            <div className="text-charcoal/70">图片目录</div>
          </div>
          <div className="text-center p-6 bg-cream rounded-lg">
            <div className="text-3xl font-bold text-gold mb-2">测试</div>
            <div className="text-charcoal/70">功能完整性</div>
          </div>
        </div>
      </div>

    </section>
  );
}