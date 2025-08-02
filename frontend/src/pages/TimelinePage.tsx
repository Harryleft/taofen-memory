import React, { useEffect, useState, useRef } from 'react';
import { Calendar, MapPin, BookOpen, Users, Award, Heart } from 'lucide-react';

// Timeline data interfaces (matching timeline.json structure)
interface TimelineEventData {
  time: string;
  experience: string;
  image: string;
  location: string;
  timespot?: number; // 1 for background events
}

interface CoreEvent {
  core_event: string;
  timeline: TimelineEventData[];
}

interface TimelineData extends Array<CoreEvent> {}

// Converted timeline event for display
interface TimelineEvent {
  id: number;
  year: number;
  date: string;
  title: string;
  description: string;
  location: string;
  details: string[];
}

const getEventCategory = (description: string, year: number): string => {
  const desc = description.toLowerCase();
  
  if (year <= 1900 || desc.includes('出生') || desc.includes('生于')) {
    return 'birth';
  }
  
  if (desc.includes('学校') || desc.includes('大学') || desc.includes('教育') || 
      desc.includes('学习') || desc.includes('读书') || desc.includes('毕业')) {
    return 'education';
  }
  
  if (desc.includes('出版') || desc.includes('编辑') || desc.includes('书店') || 
      desc.includes('杂志') || desc.includes('周刊') || desc.includes('生活书店')) {
    return 'publication';
  }
  
  if (desc.includes('救国') || desc.includes('抗日') || desc.includes('政治') || 
      desc.includes('国民党') || desc.includes('七君子')) {
    return 'political';
  }
  
  if (desc.includes('社会') || desc.includes('组织') || desc.includes('团体') || 
      desc.includes('活动') || desc.includes('运动')) {
    return 'social';
  }
  
  if (desc.includes('家庭') || desc.includes('结婚') || desc.includes('子女') || 
      desc.includes('迁居') || desc.includes('居住')) {
    return 'family';
  }
  
  if (year >= 1944 || desc.includes('逝世') || desc.includes('病逝') || desc.includes('去世')) {
    return 'death';
  }
  
  return 'career';
};

const categoryIcons = {
  birth: Users,
  education: BookOpen,
  career: Award,
  publication: BookOpen,
  social: Heart,
  political: Users,
  family: Heart,
  death: Calendar
};

const categoryColors = {
  birth: 'bg-blue-500',
  education: 'bg-green-500',
  career: 'bg-purple-500',
  publication: 'bg-gold',
  social: 'bg-pink-500',
  political: 'bg-red-500',
  family: 'bg-pink-400',
  death: 'bg-gray-500'
};

const getDefaultImage = (category: string): string => {
  const images = {
    birth: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=600',
    education: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=600',
    career: 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=600',
    publication: 'https://images.pexels.com/photos/1070945/pexels-photo-1070945.jpeg?auto=compress&cs=tinysrgb&w=600',
    social: 'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=600',
    political: 'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=600',
    family: 'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=600',
    death: 'https://images.pexels.com/photos/789555/pexels-photo-789555.jpeg?auto=compress&cs=tinysrgb&w=600'
  };
  return images[category as keyof typeof images] || images.career;
};

export default function TimelinePage() {
  const [visibleEvents, setVisibleEvents] = useState<Set<number>>(new Set());
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const loadTimelineData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/timeline.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch timeline data: ${response.status}`);
        }
        const timelineData: TimelineData = await response.json();
        
        // Convert timeline data to timeline events
        const events: TimelineEvent[] = [];
        let eventId = 1;
        
        timelineData.forEach((coreEvent) => {
          coreEvent.timeline.forEach((event) => {
            // Skip background events for the timeline page
            if (event.timespot) return;
            
            // Extract year from time string
            const yearMatch = event.time.match(/(\d{4})/);
            const year = yearMatch ? parseInt(yearMatch[1]) : 1900;
            
            // Create title from experience (first sentence)
            const title = event.experience.split('。')[0];
            
            // Extract details (remaining sentences)
            const sentences = event.experience.split('。').filter(s => s.trim().length > 0);
            const details = sentences.length > 1 ? sentences.slice(1, 4).map(s => s.trim() + '。') : [];
            
            events.push({
              id: eventId++,
              year,
              date: event.time,
              title,
              description: event.experience,
              location: event.location || '未知',
              details
            });
          });
        });
        
        // Sort by year
        events.sort((a, b) => a.year - b.year);
        setTimelineEvents(events);
      } catch (err) {
        console.error('加载时间线数据失败:', err);
        setError('加载数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    loadTimelineData();
  }, []);

  useEffect(() => {
    if (timelineEvents.length === 0) return;
    
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
  }, [timelineEvents]);

  const IconComponent = (category: string) => {
    const Icon = categoryIcons[category as keyof typeof categoryIcons] || Users;
    return <Icon size={24} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
          <p className="mt-4 text-charcoal/70">正在加载邹韬奋先生的人生轨迹...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-gold text-cream rounded hover:bg-gold/80 transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-charcoal mb-6 font-serif">邹韬奋人生时间线</h1>
          <p className="text-xl text-charcoal/70 max-w-3xl mx-auto leading-relaxed">
            追溯邹韬奋先生的人生轨迹，感受一位文化先驱的成长历程与时代担当
          </p>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-gold/30 via-gold to-gold/30"></div>

          {/* Events */}
          <div className="space-y-24">
            {timelineEvents.map((event, index) => {
              const category = getEventCategory(event.description, event.year);
              return (
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
                          src={getDefaultImage(category)}
                          alt={event.title}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`p-2 rounded-full ${categoryColors[category as keyof typeof categoryColors] || 'bg-gray-500'} text-white`}>
                            {IconComponent(category)}
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
              );
            })}
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-cream rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img
                src={getDefaultImage(getEventCategory(selectedEvent.description, selectedEvent.year))}
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
                <div className={`p-3 rounded-full ${categoryColors[getEventCategory(selectedEvent.description, selectedEvent.year) as keyof typeof categoryColors] || 'bg-gray-500'} text-white`}>
                  {IconComponent(getEventCategory(selectedEvent.description, selectedEvent.year))}
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
    </div>
  );
}