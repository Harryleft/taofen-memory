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

// 本地图片数据源 - 使用public目录中的100张图片
const localBookImages = [
  'book_23416_-4998639186942255748.jpg', 'book_23417_-3852244789965758496.jpg', 'book_23418_4462283b97413ab9.jpg',
  'book_23419_-5632022676287629273.jpg', 'book_23420_-1855791942358398657.jpg', 'book_23421_-2042169621397586150.jpg',
  'book_23422_-7115342089587619670.jpg', 'book_23423_-8373031078909513017.jpg', 'book_23424_-2604910119916886782.jpg',
  'book_23425_-1785525125771768182.jpg', 'book_23426_-159901723489253475.jpg', 'book_23427_-3844244803203524888.jpg',
  'book_23428_-3837940625291627111.jpg', 'book_23429_-1477639427932003088.jpg', 'book_23430_-5562129265642608756.jpg',
  'book_23431_-7892229097442701058.jpg', 'book_23432_-2581749817470159686.jpg', 'book_23433_-3470636951303014949.jpg',
  'book_23434_-4623327514967615735.jpg', 'book_23435_-2087955644272572478.jpg', 'book_23436_-7714621659299364889.jpg',
  'book_23437_-3360823350712026630.jpg', 'book_23438_-2232596915751383319.jpg', 'book_23439_-1368073078858966529.jpg',
  'book_23440_-3658158069634473578.jpg', 'book_23441_-3916099362726884917.jpg', 'book_23442_-1255433671954459195.jpg',
  'book_23443_-4910439981153704181.jpg', 'book_23444_-2195130034922510191.jpg', 'book_23445_-2400332830789112399.jpg',
  'book_23446_-2224633863020081482.jpg', 'book_23447_-1075169616984349866.jpg', 'book_23448_-614297641780091019.jpg',
  'book_23450_-206594605777767237.jpg', 'book_23451_-1203391813805897094.jpg', 'book_23452_-3392186564342118941.jpg',
  'book_23453_-8880444755985866078.jpg', 'book_23454_2218799157042891040.jpg', 'book_23455_-1762059586010719922.jpg',
  'book_23456_1ce7a45c9c64e7f4.jpg', 'book_23457_-1262639379820779836.jpg', 'book_23458_-7405423048627670781.jpg',
  'book_23459_-1023150637824470312.jpg', 'book_23460_-4390334948177620911.jpg', 'book_23461_-3933660030092891077.jpg',
  'book_23462_-5613829804670559247.jpg', 'book_23463_-2427818215605441259.jpg', 'book_23464_-2873368441043783992.jpg',
  'book_23465_-4562298341534676269.jpg', 'book_23466_-5843245027255920579.jpg', 'book_23467_-2617235280630217202.jpg',
  'book_23468_-2671334620773387670.jpg', 'book_23469_-2187776683781714513.jpg', 'book_23470_-602075659643498126.jpg',
  'book_23471_-2644509536807637721.jpg', 'book_23472_-1989572025767284017.jpg', 'book_23473_-2954590327841336364.jpg',
  'book_23474_-4651111614700749285.jpg', 'book_23475_-1034410525894211916.jpg', 'book_23476_-595105627489718745.jpg',
  'book_23477_-3991236551704296356.jpg', 'book_23478_-8895852119986290089.jpg', 'book_23479_-1439028799579857153.jpg',
  'book_23480_-1547457762458899076.jpg', 'book_23481_-180202356580824528.jpg', 'book_23482_-6957774958998746588.jpg',
  'book_23483_-5377705342247136188.jpg', 'book_23484_-3040315155882100082.jpg', 'book_23485_-5290776177715764141.jpg',
  'book_23486_-4688878994957105004.jpg', 'book_23487_-4047036779909166305.jpg', 'book_23488_-4785127773021135834.jpg',
  'book_23489_-1527880107252110280.jpg', 'book_23490_-3991418640704574369.jpg', 'book_23491_-2428073741814601127.jpg',
  'book_23492_-7305900420622199491.jpg', 'book_23493_-1952208562218801929.jpg', 'book_23494_-356427460137905266.jpg',
  'book_23495_-1326261786250422145.jpg', 'book_23496_-3112494223028967790.jpg', 'book_23497_-3809915704416875526.jpg',
  'book_23498_-4931303133990783668.jpg', 'book_23499_-1453881322533276280.jpg', 'book_23500_-2113932888190620035.jpg',
  'book_23501_-1017525015100921835.jpg', 'book_23502_-2818108551734047517.jpg', 'book_23503_-2084525069930121299.jpg',
  'book_23504_-1287584600303781361.jpg', 'book_23505_-3805328362596780846.jpg', 'book_23506_-7138212249551494528.jpg',
  'book_23507_-2173593576125081931.jpg', 'book_23508_-2011166571240037922.jpg', 'book_23509_-1501405699926971148.jpg',
  'book_23510_-3190716059409031439.jpg', 'book_23511_-4584318985217195842.jpg', 'book_23512_-2896460916388493936.jpg',
  'book_23513_-1954720031557854277.jpg', 'book_23514_-3117046940985114847.jpg', 'book_23515_-2296156932798107117.jpg',
  'book_23516_-1537084324154895566.jpg', 'book_24033_5774757e61cccbd0.jpg'
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

    // Timeline configuration - 强制堆叠的图片时间线 + 响应式缩放
    const options = {
      height: '600px',
      start: new Date(1931, 0, 1),
      end: new Date(1937, 0, 1),
      orientation: 'bottom',
      stack: true,
      stackSubgroups: true,
      showCurrentTime: false,
      zoomMin: 1000 * 60 * 60 * 24 * 30, // 1 month - 允许更深层缩放
      zoomMax: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
      zoomable: true, // 确保缩放功能启用
      moveable: true, // 允许拖拽移动
      margin: {
        item: {
          horizontal: 2, // 进一步减少水平间距
          vertical: 2    // 进一步减少垂直间距
        },
        axis: 40
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
          style={{ height: '600px', border: '1px solid #FCD34D', borderRadius: '8px', backgroundColor: '#FFFEF7' }}
        />



        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16">
          <div className="text-center p-6 bg-cream rounded-lg">
            <div className="text-3xl font-bold text-gold mb-2">100</div>
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
            <div className="text-3xl font-bold text-gold mb-2">山峦</div>
            <div className="text-charcoal/70">起伏效果</div>
          </div>
        </div>
      </div>

    </section>
  );
}