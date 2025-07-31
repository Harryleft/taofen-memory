import React, { useState, useEffect } from 'react';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Publication {
  id: number;
  title: string;
  year: number;
  type: string;
  image: string;
  description: string;
  category: string;
}

interface PublicationsGalleryProps {
  className?: string;
}

const publications: Publication[] = [
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

interface LightboxProps {
  item: Publication | null;
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

export default function PublicationsGallery({ className = '' }: PublicationsGalleryProps) {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<Publication | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredPublications = publications.filter(item => {
    const matchesFilter = filter === 'all' || item.category === filter;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const openLightbox = (item: Publication) => {
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

  return (
    <section className={`py-20 bg-cream ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-charcoal mb-6 font-serif">珍贵文献资料</h2>
          <p className="text-xl text-charcoal/70 max-w-3xl mx-auto leading-relaxed">
            探索邹韬奋先生的珍贵文献，感受那个时代的文化脉动
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/60" size={20} />
            <input
              type="text"
              placeholder="搜索文献资料..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 w-64"
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

        {/* Results count */}
        <div className="text-center mb-8">
          <p className="text-charcoal/60">
            找到 <span className="font-bold text-gold">{filteredPublications.length}</span> 件文献
          </p>
        </div>

        {/* Content Gallery */}
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

        {/* Empty state */}
        {filteredPublications.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-charcoal mb-2">未找到相关文献</h3>
            <p className="text-charcoal/60">请尝试调整搜索条件</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Lightbox
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onNext={nextItem}
        onPrev={prevItem}
      />
    </section>
  );
} 