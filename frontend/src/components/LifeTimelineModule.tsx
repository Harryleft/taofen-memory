import React, { useEffect, useState, useRef } from 'react';
import { Calendar, MapPin, BookOpen, Users, Award, Heart } from 'lucide-react';

interface PersonRecord {
  id: number;
  date: string;
  content: string;
}

interface LifeEvent {
  id: number;
  year: number;
  date: string;
  title: string;
  description: string;
  location: string;
  category: 'birth' | 'education' | 'career' | 'publication' | 'social' | 'death';
  image: string;
  details: string[];
}

// 获取类别的函数
const getEventCategory = (content: string, year: number): LifeEvent['category'] => {
  if (year === 1895) return 'birth';
  if (year === 1944 || content.includes('逝世') || content.includes('病逝') || content.includes('去世')) return 'death';
  if (content.includes('学校') || content.includes('大学') || content.includes('毕业') || content.includes('入学') || content.includes('求学') || content.includes('圣约翰') || content.includes('南洋公学')) return 'education';
  if (content.includes('《生活》') || content.includes('生活书店') || content.includes('出版') || content.includes('周刊') || content.includes('杂志') || content.includes('《大众生活》') || content.includes('编辑') || content.includes('创办')) return 'publication';
  if (content.includes('工作') || content.includes('任职') || content.includes('主编') || content.includes('社长') || content.includes('职业教育') || content.includes('总经理')) return 'career';
  return 'social';
};

// 获取位置的函数
const getEventLocation = (content: string): string => {
  const locations = ['上海', '福建', '北京', '南京', '广州', '天津', '武汉', '重庆', '香港', '江西', '南昌', '永安'];
  for (const location of locations) {
    if (content.includes(location)) return location;
  }
  return '上海'; // 默认位置
};

// 获取标题的函数
const getEventTitle = (content: string, year: number): string => {
  if (year === 1895) return '出生于福建永安';
  if (year === 1944) return '逝世于上海';
  
  // 提取关键事件
  if (content.includes('《生活》周刊') && content.includes('创办')) return '创办《生活》周刊';
  if (content.includes('生活书店') && content.includes('创立')) return '创立生活书店';
  if (content.includes('《大众生活》')) return '创办《大众生活》';
  if (content.includes('职业教育') || content.includes('中华职业')) return '任职中华职业教育社';
  if (content.includes('圣约翰大学')) return '考入圣约翰大学';
  if (content.includes('南洋公学')) return '就读南洋公学';
  if (content.includes('七君子')) return '七君子事件';
  if (content.includes('救国会') || content.includes('救国运动')) return '参与救国运动';
  if (content.includes('生活出版合作社')) return '成立生活出版合作社';
  if (content.includes('《生活日报》')) return '筹办《生活日报》';
  
  // 默认使用前40个字符作为标题
  return content.substring(0, 40).replace(/[。，；：]/g, '').trim();
};

// 获取默认图片的函数
const getDefaultImage = (category: LifeEvent['category']): string => {
  const images = {
    birth: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=600',
    education: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=600',
    career: 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=600',
    publication: 'https://images.pexels.com/photos/1070945/pexels-photo-1070945.jpeg?auto=compress&cs=tinysrgb&w=600',
    social: 'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=600',
    death: 'https://images.pexels.com/photos/789555/pexels-photo-789555.jpeg?auto=compress&cs=tinysrgb&w=600'
  };
  return images[category];
};

const categoryIcons = {
  birth: Users,
  education: BookOpen,
  career: Award,
  publication: BookOpen,
  social: Heart,
  death: Calendar
};

const categoryColors = {
  birth: 'bg-blue-500',
  education: 'bg-green-500',
  career: 'bg-purple-500',
  publication: 'bg-gold',
  social: 'bg-pink-500',
  death: 'bg-gray-500'
};

interface LifeTimelineModuleProps {
  className?: string;
}

export default function LifeTimelineModule({ className = '' }: LifeTimelineModuleProps) {
  const [visibleEvents, setVisibleEvents] = useState<Set<number>>(new Set());
  const [selectedEvent, setSelectedEvent] = useState<LifeEvent | null>(null);
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 加载数据的useEffect
  useEffect(() => {
    const loadPersonData = async () => {
      try {
        const response = await fetch('/data/persons_clean.json');
        const data: PersonRecord[] = await response.json();
        
        // 筛选包含邹韬奋的记录
        const taoFenRecords = data.filter(record => 
          record.content.includes('邹韬奋') || record.content.includes('邹恩润')
        );
        
        // 转换为生活事件
        const lifeEvents: LifeEvent[] = [];
        
        taoFenRecords.forEach((record) => {
          const dateObj = new Date(record.date);
          const year = dateObj.getFullYear();
          
          // 只处理有效年份的数据
          if (year >= 1895 && year <= 1944 && record.content.length > 30) {
            const category = getEventCategory(record.content, year);
            const title = getEventTitle(record.content, year);
            const location = getEventLocation(record.content);
            
            // 格式化日期
            const formattedDate = `${year}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
            
            lifeEvents.push({
              id: record.id,
              year,
              date: formattedDate,
              title,
              description: record.content.substring(0, 120) + (record.content.length > 120 ? '...' : ''),
              location,
              category,
              image: getDefaultImage(category),
              details: [record.content]
            });
          }
        });
        
        // 按年份排序
        const sortedEvents = lifeEvents.sort((a, b) => a.year - b.year);
        
        setLifeEvents(sortedEvents);
      } catch (error) {
        console.error('加载人物数据失败:', error);
        // 如果加载失败，使用默认数据
        setLifeEvents([{
          id: 1,
          year: 1895,
          date: '1895年11月5日',
          title: '出生于福建永安',
          description: '邹韬奋出生于一个书香门第，原名邹恩润',
          location: '福建永安',
          category: 'birth',
          image: getDefaultImage('birth'),
          details: ['原名恩润，乳名荫书', '祖籍江西省鹰潭市余江区', '出生于书香门第']
        }]);
      } finally {
        setLoading(false);
      }
    };
    
    loadPersonData();
  }, []);

  // 观察器的useEffect
  useEffect(() => {
    if (lifeEvents.length === 0) return;
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const eventId = parseInt(entry.target.getAttribute('data-event-id') || '0');
            setVisibleEvents(prev => new Set([...prev, eventId]));
          }
        });
      },
      { threshold: 0.3, rootMargin: '50px' }
    );

    const eventElements = document.querySelectorAll('[data-event-id]');
    eventElements.forEach(el => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, [lifeEvents]);

  const IconComponent = (category: LifeEvent['category']) => {
    const Icon = categoryIcons[category];
    return <Icon size={24} />;
  };

  if (loading) {
    return (
      <section className={`py-20 bg-cream ${className}`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
            <p className="mt-4 text-charcoal/70">正在加载邹韬奋先生的人生轨迹...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-20 bg-cream ${className}`}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-charcoal mb-6 font-serif">人生大事</h2>
          <p className="text-xl text-charcoal/70 max-w-3xl mx-auto leading-relaxed">
            追溯邹韬奋先生的人生轨迹，感受一位文化先驱的成长历程与时代担当
          </p>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-gold/30 via-gold to-gold/30"></div>

          {/* Events */}
          <div className="space-y-24">
            {lifeEvents.map((event, index) => (
              <div
                key={event.id}
                data-event-id={event.id}
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'justify-start' : 'justify-end'
                }`}
              >
                {/* Event Card */}
                <div
                  className={`w-full max-w-lg transform transition-all duration-1000 ${
                    visibleEvents.has(event.id)
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-8 opacity-0'
                  } ${index % 2 === 0 ? 'pr-12' : 'pl-12'}`}
                >
                  <div 
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer group"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-full ${categoryColors[event.category]} text-white`}>
                          {IconComponent(event.category)}
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gold">{event.year}</div>
                          <div className="text-sm text-charcoal/60">{event.date}</div>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-charcoal mb-2 group-hover:text-gold transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-charcoal/70 mb-3">{event.description}</p>
                      <div className="flex items-center text-sm text-charcoal/60">
                        <MapPin size={16} className="mr-1" />
                        {event.location}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline Node */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gold rounded-full border-4 border-cream shadow-lg z-10"></div>

                {/* Year Label */}
                <div className={`absolute left-1/2 transform -translate-x-1/2 ${
                  index % 2 === 0 ? '-translate-x-20' : 'translate-x-20'
                } bg-gold text-cream px-3 py-1 rounded-full text-sm font-bold shadow-lg`}>
                  {event.year}
                </div>
              </div>
            ))}
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
                <div className={`p-3 rounded-full ${categoryColors[selectedEvent.category]} text-white`}>
                  {IconComponent(selectedEvent.category)}
                </div>
                <div>
                  <div className="text-3xl font-bold text-gold">{selectedEvent.year}</div>
                  <div className="text-charcoal/60">{selectedEvent.date}</div>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-charcoal mb-4 font-serif">
                {selectedEvent.title}
              </h3>
              <p className="text-lg text-charcoal/80 mb-6 leading-relaxed">
                {selectedEvent.description}
              </p>
              <div className="space-y-3">
                {selectedEvent.details.map((detail, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gold rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-charcoal/70">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}