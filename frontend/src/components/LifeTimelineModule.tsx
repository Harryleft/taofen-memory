import React, { useEffect, useState, useRef } from 'react';
import { Calendar, MapPin, BookOpen, Users, Award, Heart } from 'lucide-react';

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

const lifeEvents: LifeEvent[] = [
  {
    id: 1,
    year: 1895,
    date: '1895年11月5日',
    title: '出生于福建永安',
    description: '邹韬奋出生于一个书香门第，原名邹恩润',
    location: '福建永安',
    category: 'birth',
    image: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=600',
    details: [
      '父亲邹国珍是清朝举人，母亲陈氏出身书香世家',
      '幼年即显露出对文字的敏感和兴趣',
      '家庭环境为其后来的文化事业奠定基础'
    ]
  },
  {
    id: 2,
    year: 1913,
    date: '1913年9月',
    title: '考入圣约翰大学',
    description: '以优异成绩考入上海圣约翰大学文科',
    location: '上海',
    category: 'education',
    image: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=600',
    details: [
      '在校期间积极参与学生活动',
      '开始接触西方进步思想',
      '培养了国际化视野和现代教育理念'
    ]
  },
  {
    id: 3,
    year: 1921,
    date: '1921年7月',
    title: '毕业并开始新闻生涯',
    description: '获得文学学士学位，开始投身新闻事业',
    location: '上海',
    category: 'career',
    image: 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=600',
    details: [
      '进入中华职业教育社工作',
      '开始为《教育与职业》杂志撰稿',
      '确立了教育救国的理想'
    ]
  },
  {
    id: 4,
    year: 1926,
    date: '1926年10月',
    title: '创办《生活》周刊',
    description: '创办并主编《生活》周刊，开始了辉煌的出版生涯',
    location: '上海',
    category: 'publication',
    image: 'https://images.pexels.com/photos/1070945/pexels-photo-1070945.jpeg?auto=compress&cs=tinysrgb&w=600',
    details: [
      '提出"暗中摸索，努力向前"的办刊方针',
      '关注社会现实，倡导进步思想',
      '发行量迅速增长，影响力日益扩大'
    ]
  },
  {
    id: 5,
    year: 1932,
    date: '1932年7月',
    title: '创立生活书店',
    description: '建立了全国性的进步出版发行网络',
    location: '上海',
    category: 'publication',
    image: 'https://images.pexels.com/photos/159832/shanghai-china-city-modern-159832.jpeg?auto=compress&cs=tinysrgb&w=600',
    details: [
      '建立覆盖全国的发行网络',
      '出版大量进步书籍和刊物',
      '成为中国现代出版业的重要力量'
    ]
  },
  {
    id: 6,
    year: 1935,
    date: '1935年2月',
    title: '创办《大众生活》',
    description: '创办《大众生活》周刊，继续传播进步思想',
    location: '上海',
    category: 'publication',
    image: 'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=600',
    details: [
      '面向更广泛的读者群体',
      '关注抗日救亡运动',
      '发行量创历史新高'
    ]
  },
  {
    id: 7,
    year: 1944,
    date: '1944年7月24日',
    title: '逝世于上海',
    description: '为中国的新闻出版事业奉献了一生',
    location: '上海',
    category: 'death',
    image: 'https://images.pexels.com/photos/789555/pexels-photo-789555.jpeg?auto=compress&cs=tinysrgb&w=600',
    details: [
      '临终前仍关心国家前途和民族命运',
      '留下丰富的文化遗产',
      '被誉为"人民的新闻工作者"'
    ]
  }
];

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
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
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
  }, []);

  const IconComponent = (category: LifeEvent['category']) => {
    const Icon = categoryIcons[category];
    return <Icon size={24} />;
  };

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