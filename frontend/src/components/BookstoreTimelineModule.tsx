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

// 本地图片数据源 - 随机选择50张书籍图片
const localBookImages = [
  'book_24033_5774757e61cccbd0.jpg', 'book_24887_0fe32f3001899765.jpg', 'book_24588_2e50371863f5a957.jpg',
  'book_24589_4faa030caf512a01.jpg', 'book_24009_a3cfb236f5490c96.jpg', 'book_23733_0efe86683a6e47cf.jpg',
  'book_24073_2ada7ba4866d8a72.jpg', 'book_24074_79870f9daf46b40a.jpg', 'book_24075_0a04886d23da0e0a.jpg',
  'book_24076_de4c835b4da33a9f.jpg', 'book_24077_de507994f4227af4.jpg', 'book_24078_61fb0e2502421083.jpg',
  'book_24079_083216c9bef7f1e3.jpg', 'book_24080_54f72e6ef053811d.jpg', 'book_24081_b604e0ab4263aa06.jpg',
  'book_24082_e98446d65dc8e442.jpg', 'book_24083_c3ba6e8e8c19a4b8.jpg', 'book_24084_ea791a622b7b02d6.jpg',
  'book_24085_082d3885b9a86191.jpg', 'book_24086_a6b109426ee95d0e.jpg', 'book_24087_7550d62518c03cff.jpg',
  'book_24088_6479729830409a6a.jpg', 'book_24089_1efb046cfed41253.jpg', 'book_24090_09f8a03bbec23545.jpg',
  'book_24091_519364addd1740b9.jpg', 'book_24092_d30159246d78fefd.jpg', 'book_23860_0f44a9a23f9a33b6.jpg',
  'book_23919_1176d3a14c04640b.jpg', 'book_23731_8adaa9332eaf67c6.jpg', 'book_24067_5caa926a9cee39cb.jpg',
  'book_24573_1815c8bdd1dba7c2.jpg', 'book_24574_e4ec602a098df987.jpg', 'book_24017_6ceca9569575216f.jpg',
  'book_24027_e5d1c5bbcab84c8c.jpg', 'book_24028_a3fc1d014749ec22.jpg', 'book_24656_db0d6b0e05b04116.jpg',
  'book_24657_135e9acdcec63606.jpg', 'book_24658_ea4d75e22f5f4e42.jpg', 'book_24660_c49c4e0b372ee847.jpg',
  'book_24661_0ae83db55287cfcb.jpg', 'book_24662_aa16dfd92d9f0ecd.jpg', 'book_24663_d2a4bbe4ae247997.jpg',
  'book_24664_592c2375da73eb7b.jpg', 'book_24665_267c9998a9448665.jpg', 'book_24666_bb3f78ed290ebe68.jpg',
  'book_24041_5ac125b65265454d.jpg', 'book_24667_654c8ea4571be528.jpg', 'book_24668_fa72a893da335324.jpg',
  'book_24042_4a9656f967141b6d.jpg', 'book_24669_18dee28d77ee2006.jpg', 'book_24670_35b664a2e361a2ce.jpg',
  'book_24043_61097f42afa08e7c.jpg', 'book_24672_ace02fedd520c9d9.jpg'
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
  
  return localBookImages.slice(0, 50).map((image, index) => ({
    id: index + 1,
    year: years[index % 5], // 循环分配到5年中
    month: 1,
    date: `${years[index % 5]}年`,
    title: titles[index % 20], // 循环使用标题
    description: `第${index + 1}本图书`,
    location: ['上海', '北平', '汉口', '重庆', '南京'][index % 5],
    type: ['establishment', 'expansion', 'publication', 'milestone', 'closure'][index % 5] as BookstoreEvent['type'],
    image: `/data/api_results/images/books/${image}`, // 本地图片路径
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

    // Timeline configuration - 简洁的图片时间线
    const options = {
      height: '300px',
      start: new Date(1931, 0, 1),
      end: new Date(1937, 0, 1),
      orientation: 'bottom',
      stack: true,
      showCurrentTime: false,
      zoomMin: 1000 * 60 * 60 * 24 * 365, // 1 year
      zoomMax: 1000 * 60 * 60 * 24 * 365 * 20, // 20 years
      margin: {
        item: {
          horizontal: 20,
          vertical: 10
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
          style={{ height: '300px', border: '1px solid #FCD34D', borderRadius: '8px', backgroundColor: '#FFFEF7' }}
        />



        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16">
          <div className="text-center p-6 bg-cream rounded-lg">
            <div className="text-3xl font-bold text-gold mb-2">50</div>
            <div className="text-charcoal/70">书籍图片</div>
          </div>
          <div className="text-center p-6 bg-cream rounded-lg">
            <div className="text-3xl font-bold text-gold mb-2">5</div>
            <div className="text-charcoal/70">发展年份</div>
          </div>
          <div className="text-center p-6 bg-cream rounded-lg">
            <div className="text-3xl font-bold text-gold mb-2">50</div>
            <div className="text-charcoal/70">本地图片</div>
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