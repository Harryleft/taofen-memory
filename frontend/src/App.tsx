import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, BookOpen, Image, X, ChevronLeft, ChevronRight, MapPin, User, Clock, Menu } from 'lucide-react';
import EnhancedHero from './components/EnhancedHero';
import LifeTimelineModule from './components/LifeTimelineModule';
import BookstoreTimelineModule from './components/BookstoreTimelineModule';
import HandwritingModule from './components/HandwritingModule';

// Sample data for the memorial
const publications = [
  {
    id: 1,
    title: '生活周刊',
    year: 1925,
    type: 'magazine',
    image: 'https://images.pexels.com/photos/1070945/pexels-photo-1070945.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: '邹韬奋主编的第一本重要刊物，倡导进步思想',
    category: 'publication'
  },
  {
    id: 2,
    title: '大众生活',
    year: 1935,
    type: 'magazine',
    image: 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: '抗战时期重要的进步刊物',
    category: 'publication'
  },
  {
    id: 3,
    title: '手稿原件',
    year: 1940,
    type: 'manuscript',
    image: 'https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: '邹韬奋亲笔书写的重要文稿',
    category: 'manuscript'
  },
  {
    id: 4,
    title: '上海生活书店',
    year: 1932,
    type: 'photo',
    image: 'https://images.pexels.com/photos/159832/shanghai-china-city-modern-159832.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: '生活书店上海总店历史照片',
    category: 'photo'
  },
  {
    id: 5,
    title: '抗战文献',
    year: 1937,
    type: 'document',
    image: 'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: '抗日战争时期的重要文献资料',
    category: 'document'
  },
  {
    id: 6,
    title: '邹韬奋肖像',
    year: 1930,
    type: 'photo',
    image: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: '邹韬奋先生历史肖像照片',
    category: 'photo'
  }
];

const timelineEvents = [
  {
    year: 1895,
    title: '出生于福建永安',
    description: '邹韬奋出生于一个书香门第',
    icon: User
  },
  {
    year: 1921,
    title: '毕业于圣约翰大学',
    description: '获得文学学士学位，开始投身新闻事业',
    icon: BookOpen
  },
  {
    year: 1926,
    title: '创办《生活》周刊',
    description: '开始了其辉煌的出版生涯',
    icon: BookOpen
  },
  {
    year: 1932,
    title: '创立生活书店',
    description: '建立了全国性的进步出版发行网络',
    icon: MapPin
  },
  {
    year: 1944,
    title: '逝世于上海',
    description: '为中国的新闻出版事业奉献了一生',
    icon: Clock
  }
];

interface LightboxProps {
  item: typeof publications[0] | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

function Lightbox({ item, onClose, onNext, onPrev }: LightboxProps) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-6xl max-h-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-red-400 transition-colors z-10"
        >
          <X size={32} />
        </button>
        
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-yellow-400 transition-colors z-10"
        >
          <ChevronLeft size={48} />
        </button>
        
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-yellow-400 transition-colors z-10"
        >
          <ChevronRight size={48} />
        </button>
        
        <div className="bg-cream rounded-lg overflow-hidden shadow-2xl">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-96 object-cover"
          />
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <span className="bg-gold text-cream px-3 py-1 rounded-full text-sm font-medium">
                {item.year}
              </span>
              <span className="text-charcoal text-sm">{item.type}</span>
            </div>
            <h3 className="text-2xl font-bold text-charcoal mb-2">{item.title}</h3>
            <p className="text-charcoal/80">{item.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<typeof publications[0] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeSection, setActiveSection] = useState('overview');

  const filteredPublications = publications.filter(item => {
    const matchesFilter = filter === 'all' || item.category === filter;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const openLightbox = (item: typeof publications[0]) => {
    setSelectedItem(item);
    setCurrentIndex(filteredPublications.findIndex(p => p.id === item.id));
  };

  const nextItem = () => {
    const newIndex = (currentIndex + 1) % filteredPublications.length;
    setCurrentIndex(newIndex);
    setSelectedItem(filteredPublications[newIndex]);
  };

  const prevItem = () => {
    const newIndex = currentIndex === 0 ? filteredPublications.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setSelectedItem(filteredPublications[newIndex]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedItem) {
        if (e.key === 'Escape') setSelectedItem(null);
        if (e.key === 'ArrowRight') nextItem();
        if (e.key === 'ArrowLeft') prevItem();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, currentIndex]);

  const navigationItems = [
    { id: 'overview', label: '总览', icon: BookOpen },
    { id: 'timeline', label: '人生大事', icon: Clock },
    { id: 'bookstore', label: '生活书店', icon: MapPin },
    { id: 'handwriting', label: '韬奋手迹', icon: Image }
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Enhanced Hero Section */}
      <EnhancedHero />

      {/* Navigation */}
      <nav id="main-content" className="sticky top-0 bg-cream/95 backdrop-blur-sm border-b border-gold/20 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h2 className="text-2xl font-bold text-charcoal">数字人文纪念馆</h2>
              
              {/* Navigation Menu */}
              <div className="hidden md:flex items-center gap-6">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                        activeSection === item.id
                          ? 'bg-gold text-cream'
                          : 'text-charcoal hover:bg-gold/10 hover:text-gold'
                      }`}
                    >
                      <Icon size={18} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/60" size={20} />
                <input
                  type="text"
                  placeholder="搜索文献资料..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 bg-white border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
              >
                <option value="all">全部类型</option>
                <option value="publication">刊物</option>
                <option value="manuscript">手稿</option>
                <option value="photo">照片</option>
                <option value="document">文献</option>
              </select>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {/* Overview Section */}
        <section id="overview" className="max-w-7xl mx-auto px-6 py-12">
        {/* Content Gallery */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-charcoal mb-8 text-center">珍贵文献资料</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPublications.map((item) => (
              <div
                key={item.id}
                className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                onClick={() => openLightbox(item)}
              >
                <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
                  <div className="aspect-w-4 aspect-h-3 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-gold text-cream px-3 py-1 rounded-full text-sm font-medium">
                        {item.year}
                      </span>
                      <span className="text-charcoal/60 text-sm capitalize">{item.type}</span>
                    </div>
                    <h3 className="text-xl font-bold text-charcoal mb-2 group-hover:text-gold transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-charcoal/70 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>


        </section>

        {/* Life Timeline Module */}
        <LifeTimelineModule />

        {/* Bookstore Timeline Module */}
        <BookstoreTimelineModule />

        {/* Handwriting Module */}
        <HandwritingModule />
      </main>

      {/* Footer */}
      <footer className="bg-charcoal text-cream py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold mb-4">邹韬奋数字人文纪念馆</h3>
          <p className="text-cream/80 mb-6">传承文化，启迪未来</p>
          <p className="text-cream/60 text-sm">
            © 2025 数字人文纪念馆项目 · 致敬中国现代新闻出版业的先驱
          </p>
        </div>
      </footer>

      {/* Lightbox */}
      <Lightbox
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onNext={nextItem}
        onPrev={prevItem}
      />
    </div>
  );
}

export default App;