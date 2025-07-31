import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, BookOpen, TrendingUp, Users, Building } from 'lucide-react';

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

const typeIcons = {
  establishment: Building,
  expansion: MapPin,
  publication: BookOpen,
  milestone: TrendingUp,
  closure: Calendar
};

const typeColors = {
  establishment: 'bg-green-500',
  expansion: 'bg-blue-500',
  publication: 'bg-gold',
  milestone: 'bg-purple-500',
  closure: 'bg-red-500'
};

interface BookstoreTimelineModuleProps {
  className?: string;
}

export default function BookstoreTimelineModule({ className = '' }: BookstoreTimelineModuleProps) {
  const [selectedEvent, setSelectedEvent] = useState<BookstoreEvent | null>(null);
  const [visibleEvents, setVisibleEvents] = useState<Set<number>>(new Set());
  const timelineRef = useRef<HTMLDivElement>(null);

  // Calculate positions for stacked events
  const getEventPosition = (event: BookstoreEvent, index: number) => {
    const baseYear = 1932;
    const yearSpan = 1936 - baseYear + 1;
    const leftPercent = ((event.year - baseYear) / yearSpan) * 100;
    
    // Find events in the same year for stacking
    const sameYearEvents = bookstoreEvents.filter(e => e.year === event.year);
    const stackIndex = sameYearEvents.findIndex(e => e.id === event.id);
    const stackOffset = stackIndex * 120; // 120px vertical offset for each stack level
    
    return {
      left: `${leftPercent}%`,
      top: `${stackOffset}px`
    };
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const eventId = parseInt(entry.target.getAttribute('data-event-id') || '0');
            setVisibleEvents(prev => new Set([...prev, eventId]));
          }
        });
      },
      { threshold: 0.3 }
    );

    const eventElements = document.querySelectorAll('[data-event-id]');
    eventElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const IconComponent = (type: BookstoreEvent['type']) => {
    const Icon = typeIcons[type];
    return <Icon size={20} />;
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

        {/* Timeline Container */}
        <div className="relative" ref={timelineRef}>
          {/* Horizontal Timeline */}
          <div className="relative h-96 mb-12">
            {/* Timeline Line */}
            <div className="absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-gold/30 via-gold to-gold/30"></div>
            
            {/* Year Markers */}
            {[1932, 1933, 1934, 1935, 1936].map(year => (
              <div
                key={year}
                className="absolute top-0"
                style={{ left: `${((year - 1932) / 4) * 100}%` }}
              >
                <div className="w-4 h-4 bg-gold rounded-full transform -translate-x-1/2"></div>
                <div className="text-lg font-bold text-charcoal mt-2 transform -translate-x-1/2">
                  {year}
                </div>
              </div>
            ))}

            {/* Events */}
            {bookstoreEvents.map((event, index) => {
              const position = getEventPosition(event, index);
              return (
                <div
                  key={event.id}
                  data-event-id={event.id}
                  className={`absolute transform -translate-x-1/2 transition-all duration-1000 ${
                    visibleEvents.has(event.id)
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-4 opacity-0'
                  }`}
                  style={position}
                >
                  <div
                    className="bg-cream rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group w-64 mt-12"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-32 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1 rounded-full ${typeColors[event.type]} text-white`}>
                          {IconComponent(event.type)}
                        </div>
                        <span className="text-sm text-charcoal/60">{event.date}</span>
                      </div>
                      <h3 className="font-bold text-charcoal mb-1 group-hover:text-gold transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-sm text-charcoal/70 line-clamp-2">
                        {event.description}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-charcoal/60">
                        <MapPin size={12} className="mr-1" />
                        {event.location}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-cream rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img
                src={selectedEvent.image}
                alt={selectedEvent.title}
                className="w-full h-64 object-cover"
              />
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-full ${typeColors[selectedEvent.type]} text-white`}>
                  {IconComponent(selectedEvent.type)}
                </div>
                <div>
                  <div className="text-2xl font-bold text-gold">{selectedEvent.date}</div>
                  <div className="text-charcoal/60 flex items-center">
                    <MapPin size={16} className="mr-1" />
                    {selectedEvent.location}
                  </div>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-charcoal mb-4 font-serif">
                {selectedEvent.title}
              </h3>
              <p className="text-lg text-charcoal/80 mb-6 leading-relaxed">
                {selectedEvent.description}
              </p>
              <div className="mb-6">
                <h4 className="text-xl font-bold text-charcoal mb-3">详细信息</h4>
                <div className="space-y-3">
                  {selectedEvent.details.map((detail, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-gold rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-charcoal/70">{detail}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gold/10 p-4 rounded-lg">
                <h4 className="text-lg font-bold text-charcoal mb-2">历史影响</h4>
                <p className="text-charcoal/80">{selectedEvent.impact}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}