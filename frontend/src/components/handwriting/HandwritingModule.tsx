import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Filter, Calendar, ZoomIn, Download, X, ChevronLeft, ChevronRight } from 'lucide-react';
import MinimalHandwritingHeader from './MinimalHandwritingHeader.tsx';

interface HandwritingItem {
  id: number;
  title: string;
  year: number;
  date: string;
  category: 'letter' | 'manuscript' | 'note' | 'article';
  description: string;
  image: string;
  highResImage: string;
  tags: string[];
  dimensions: {
    width: number;
    height: number;
  };
}

const handwritingItems: HandwritingItem[] = [
  {
    id: 1,
    title: '致友人书信',
    year: 1925,
    date: '1925年3月15日',
    category: 'letter',
    description: '邹韬奋写给友人的私人书信，展现其真挚的友谊和人文关怀',
    image: 'https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=400',
    highResImage: 'https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['友谊', '私人通信', '早期作品'],
    dimensions: { width: 300, height: 400 }
  },
  {
    id: 2,
    title: '《生活》周刊创刊词草稿',
    year: 1926,
    date: '1926年10月',
    category: 'manuscript',
    description: '《生活》周刊创刊词的手稿，记录了邹韬奋的办刊理念',
    image: 'https://images.pexels.com/photos/1070945/pexels-photo-1070945.jpeg?auto=compress&cs=tinysrgb&w=400',
    highResImage: 'https://images.pexels.com/photos/1070945/pexels-photo-1070945.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['创刊词', '办刊理念', '历史文献'],
    dimensions: { width: 350, height: 280 }
  },
  {
    id: 3,
    title: '读书笔记',
    year: 1928,
    date: '1928年7月',
    category: 'note',
    description: '邹韬奋阅读马克思主义著作时的读书笔记',
    image: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400',
    highResImage: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['读书笔记', '马克思主义', '思想发展'],
    dimensions: { width: 280, height: 350 }
  },
  {
    id: 4,
    title: '抗战文章草稿',
    year: 1937,
    date: '1937年8月',
    category: 'article',
    description: '抗日战争爆发后，邹韬奋撰写的抗战文章手稿',
    image: 'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=400',
    highResImage: 'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['抗战', '爱国主义', '时事评论'],
    dimensions: { width: 320, height: 420 }
  },
  {
    id: 5,
    title: '家书',
    year: 1940,
    date: '1940年12月',
    category: 'letter',
    description: '邹韬奋写给家人的书信，表达对家人的思念',
    image: 'https://images.pexels.com/photos/789555/pexels-photo-789555.jpeg?auto=compress&cs=tinysrgb&w=400',
    highResImage: 'https://images.pexels.com/photos/789555/pexels-photo-789555.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['家书', '亲情', '个人生活'],
    dimensions: { width: 290, height: 380 }
  },
  {
    id: 6,
    title: '出版计划草案',
    year: 1935,
    date: '1935年5月',
    category: 'manuscript',
    description: '生活书店出版计划的手写草案',
    image: 'https://images.pexels.com/photos/2041540/pexels-photo-2041540.jpeg?auto=compress&cs=tinysrgb&w=400',
    highResImage: 'https://images.pexels.com/photos/2041540/pexels-photo-2041540.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['出版计划', '商业文档', '书店经营'],
    dimensions: { width: 360, height: 300 }
  },
  {
    id: 7,
    title: '演讲稿',
    year: 1933,
    date: '1933年11月',
    category: 'manuscript',
    description: '邹韬奋在大学演讲的手稿',
    image: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=400',
    highResImage: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['演讲稿', '教育理念', '青年指导'],
    dimensions: { width: 310, height: 390 }
  },
  {
    id: 8,
    title: '日记片段',
    year: 1942,
    date: '1942年6月',
    category: 'note',
    description: '邹韬奋晚年的日记片段，记录其内心感受',
    image: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=400',
    highResImage: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['日记', '内心独白', '晚年思考'],
    dimensions: { width: 270, height: 360 }
  }
];

const categoryLabels = {
  letter: '书信',
  manuscript: '手稿',
  note: '笔记',
  article: '文章'
};

const categoryColors = {
  letter: 'bg-blue-500',
  manuscript: 'bg-gold',
  note: 'bg-green-500',
  article: 'bg-purple-500'
};

interface HandwritingModuleProps {
  className?: string;
}

export default function HandwritingModule({ className = '' }: HandwritingModuleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<HandwritingItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const [columns, setColumns] = useState(4);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const masonryRef = useRef<HTMLDivElement>(null);

  // Responsive columns
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) setColumns(1);
      else if (width < 768) setColumns(2);
      else if (width < 1024) setColumns(3);
      else setColumns(4);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Intersection Observer for lazy loading
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const itemId = parseInt(entry.target.getAttribute('data-item-id') || '0');
            setVisibleItems(prev => new Set([...prev, itemId]));
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    return () => observerRef.current?.disconnect();
  }, []);

  // Filter items
  const filteredItems = handwritingItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesYear = selectedYear === 'all' || item.year.toString() === selectedYear;
    
    return matchesSearch && matchesCategory && matchesYear;
  });

  // Masonry layout calculation
  const distributeItems = useCallback(() => {
    const columnArrays: HandwritingItem[][] = Array.from({ length: columns }, () => []);
    const columnHeights = new Array(columns).fill(0);

    filteredItems.forEach((item) => {
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      columnArrays[shortestColumnIndex].push(item);
      columnHeights[shortestColumnIndex] += item.dimensions.height + 20; // 20px gap
    });

    return columnArrays;
  }, [filteredItems, columns]);

  const columnArrays = distributeItems();

  // Lightbox navigation
  const openLightbox = (item: HandwritingItem) => {
    setSelectedItem(item);
    setCurrentIndex(filteredItems.findIndex(i => i.id === item.id));
  };

  const nextItem = () => {
    const newIndex = (currentIndex + 1) % filteredItems.length;
    setCurrentIndex(newIndex);
    setSelectedItem(filteredItems[newIndex]);
  };

  const prevItem = () => {
    const newIndex = currentIndex === 0 ? filteredItems.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setSelectedItem(filteredItems[newIndex]);
  };

  // Keyboard navigation
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

  // Observe items when they mount
  useEffect(() => {
    const items = document.querySelectorAll('[data-item-id]');
    items.forEach(item => observerRef.current?.observe(item));
  }, [filteredItems]);

  const uniqueYears = [...new Set(handwritingItems.map(item => item.year))].sort();

  return (
    <>
      <MinimalHandwritingHeader />
      <section className={`py-20 bg-cream ${className}`}>
        <div className="max-w-7xl mx-auto px-6">

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/60" size={20} />
            <input
              type="text"
              placeholder="搜索手迹..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 w-64"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-white border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
          >
            <option value="all">全部类型</option>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 bg-white border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
          >
            <option value="all">全部年份</option>
            {uniqueYears.map(year => (
              <option key={year} value={year.toString()}>{year}年</option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <div className="text-center mb-8">
          <p className="text-charcoal/60">
            找到 <span className="font-bold text-gold">{filteredItems.length}</span> 件手迹
          </p>
        </div>

        {/* Masonry Grid */}
        <div ref={masonryRef} className="flex gap-5">
          {columnArrays.map((column, columnIndex) => (
            <div key={columnIndex} className="flex-1 flex flex-col gap-5">
              {column.map((item) => (
                <div
                  key={item.id}
                  data-item-id={item.id}
                  className={`group cursor-pointer transform transition-all duration-700 ${
                    visibleItems.has(item.id)
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-8 opacity-0'
                  }`}
                  onClick={() => openLightbox(item)}
                  style={{
                    animationDelay: `${columnIndex * 100}ms`
                  }}
                >
                  <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                    <div className="relative overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full object-cover group-hover:scale-110 transition-transform duration-700"
                        style={{ height: `${item.dimensions.height}px` }}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                        <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={32} />
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs text-white ${categoryColors[item.category]}`}>
                          {categoryLabels[item.category]}
                        </span>
                        <span className="text-xs text-charcoal/60">{item.year}年</span>
                      </div>
                      <h3 className="font-bold text-charcoal mb-2 group-hover:text-gold transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-charcoal/70 mb-2 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="text-xs bg-gold/10 text-gold px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📜</div>
            <h3 className="text-xl font-bold text-charcoal mb-2">未找到相关手迹</h3>
            <p className="text-charcoal/60">请尝试调整搜索条件</p>
          </div>
        )}
        </div>

        {/* Lightbox */}
        {selectedItem && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-6xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
            {/* Navigation */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <X size={24} />
            </button>
            
            <button
              onClick={prevItem}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <ChevronLeft size={32} />
            </button>
            
            <button
              onClick={nextItem}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <ChevronRight size={32} />
            </button>

            {/* Content */}
            <div className="flex flex-col lg:flex-row max-h-[90vh]">
              {/* Image */}
              <div className="flex-1 flex items-center justify-center bg-gray-100 p-4">
                <img
                  src={selectedItem.highResImage}
                  alt={selectedItem.title}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              
              {/* Details */}
              <div className="w-full lg:w-96 p-6 overflow-y-auto">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm text-white ${categoryColors[selectedItem.category]}`}>
                    {categoryLabels[selectedItem.category]}
                  </span>
                  <span className="text-gold font-bold">{selectedItem.year}年</span>
                </div>
                
                <h3 className="text-2xl font-bold text-charcoal mb-2 font-serif">
                  {selectedItem.title}
                </h3>
                
                <p className="text-charcoal/60 mb-4">{selectedItem.date}</p>
                
                <p className="text-charcoal/80 mb-6 leading-relaxed">
                  {selectedItem.description}
                </p>
                
                <div className="mb-6">
                  <h4 className="font-bold text-charcoal mb-2">标签</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map((tag, index) => (
                      <span key={index} className="bg-gold/10 text-gold px-3 py-1 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className="flex-1 bg-gold text-cream px-4 py-2 rounded-lg hover:bg-gold/90 transition-colors flex items-center justify-center gap-2">
                    <Download size={16} />
                    下载高清图
                  </button>
                </div>
                
                <div className="mt-4 text-sm text-charcoal/60 text-center">
                  {currentIndex + 1} / {filteredItems.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </section>
    </>
  );
}
