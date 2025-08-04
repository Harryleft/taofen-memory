import React, { useState, useEffect } from 'react';
import { Users, Heart, BookOpen, GraduationCap, Building, ExternalLink} from 'lucide-react';
import MasonryGrid from '../components/MasonryGrid';
import { Person } from '../types/Person';

interface RelationshipsData {
  persons: Person[];
}

const categories = [
  { id: 'all', name: '全部关系', icon: Users, color: 'bg-charcoal' },
  { id: '亲人家属', name: '亲人家属', icon: Heart, color: 'bg-warm-rose' },
  { id: '新闻出版', name: '新闻出版', icon: BookOpen, color: 'bg-gold' },
  { id: '学术文化', name: '学术文化', icon: GraduationCap, color: 'bg-heritage-blue' },
  { id: '政治社会', name: '政治社会', icon: Building, color: 'bg-sage-green' }
];

export default function RelationshipsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载真实数据
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data/relationships.json');
        const data: RelationshipsData = await response.json();
        // 过滤掉邹韬奋本人，只保留其他人物
        const filteredPersons = data.persons.filter(person => person.id !== 499);
        setPersons(filteredPersons);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load relationships data:', error);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // ESC键关闭详情卡片
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedPerson) {
        setSelectedPerson(null);
      }
    };

    if (selectedPerson) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedPerson]);

  // 过滤后的人物列表
  const filteredPersons = selectedCategory === 'all' 
    ? persons 
    : persons.filter(person => person.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    const categoryInfo = categories.find(cat => cat.id === category);
    return categoryInfo?.color || 'bg-gray-500';
  };

  // 邹韬奋的基本信息
  const taofen: Person = {
    id: 499,
    name: '邹韬奋',
    category: '邹韬奋',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/%E9%82%B9%E9%9F%AC%E5%A5%8B_%E9%9D%92%E5%B9%B4%E6%97%B6%E6%9C%9F.JPG/330px-%E9%82%B9%E9%9F%AC%E5%A5%8B_%E9%9D%92%E5%B9%B4%E6%97%B6%E6%9C%9F.JPG',
    desc: '文化先驱，新闻出版家',
    sources: [],
    link: []
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-charcoal mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-cream/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">邹韬奋人脉网络</h1>
            <p className="text-gray-600">探索一位文化先驱的社会关系图谱</p>
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                    selectedCategory === category.id
                      ? `${category.color} text-white shadow-lg`
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <Icon size={18} />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* 人物关系瀑布流 */}
        <div className="bg-cream/30 rounded-3xl p-8 shadow-xl border border-gray-200">
          <h2 className="text-2xl font-bold text-charcoal mb-6 text-center">
            {selectedCategory === 'all' ? '全部关系人物' : categories.find(cat => cat.id === selectedCategory)?.name}
            <span className="text-lg font-normal text-gray-500 ml-2">({filteredPersons.length}人)</span>
          </h2>
          
          {filteredPersons.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">暂无相关人物</div>
              <div className="text-gray-500 text-sm">请尝试选择其他分类</div>
            </div>
          ) : (
            <MasonryGrid
              items={filteredPersons}
              onItemClick={setSelectedPerson}
              getCategoryColor={getCategoryColor}
              categories={categories}
            />
          )}
        </div>
      </div>
      
      {/* Person Detail Modal */}
      {selectedPerson && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-cream/50 to-gold/20 rounded-t-3xl p-8 text-center">
              <button 
                onClick={() => setSelectedPerson(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              >
                <span className="text-gray-600 text-lg leading-none">×</span>
              </button>
              
              {selectedPerson.img ? (
                <div className="relative inline-block">
                  <img 
                    src={selectedPerson.img} 
                    alt={selectedPerson.name}
                    className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white shadow-lg"
                  />
                  <div className={`absolute -bottom-2 -right-2 w-8 h-8 ${getCategoryColor(selectedPerson.category)} rounded-full border-3 border-white flex items-center justify-center`}>
                    {categories.find(cat => cat.id === selectedPerson.category)?.icon && 
                      React.createElement(categories.find(cat => cat.id === selectedPerson.category)!.icon, { size: 16, className: "text-white" })
                    }
                  </div>
                </div>
              ) : (
                <div className={`w-24 h-24 ${getCategoryColor(selectedPerson.category)} rounded-full flex items-center justify-center mx-auto shadow-lg`}>
                  <span className="text-white font-bold text-2xl">{selectedPerson.name.charAt(0)}</span>
                </div>
              )}
              
              <h2 className="text-2xl font-bold text-charcoal mt-4 mb-2">{selectedPerson.name}</h2>
              <div className={`inline-block px-4 py-1 rounded-full text-sm font-medium text-white ${getCategoryColor(selectedPerson.category)}`}>
                {selectedPerson.category}
              </div>
            </div>
            
            {/* Content */}
            <div className="p-8">
              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-charcoal mb-3 flex items-center gap-2">
                  <BookOpen size={18} className="text-gold" />
                  人物简介
                </h3>
                <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4 indent-8">{selectedPerson.desc}</p>
              </div>
              
              {/* Sources */}
              {selectedPerson.sources && selectedPerson.sources.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-charcoal mb-3 flex items-center gap-2">
                    <ExternalLink size={18} className="text-gold" />
                    相关资料
                  </h3>
                  <div className="space-y-2">
                    {selectedPerson.sources.map((source, index) => {
                      const hasLink = selectedPerson.link && selectedPerson.link[index];
                      return (
                        <div key={index} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                          {hasLink ? (
                            <a 
                              href={selectedPerson.link[index]} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center justify-between text-gray-700 hover:text-gold transition-colors group"
                            >
                              <span className="flex-1">{source}</span>
                              <ExternalLink size={16} className="text-gray-400 group-hover:text-gold ml-2" />
                            </a>
                          ) : (
                            <span className="text-gray-700">{source}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}             
              
            </div>           
            
          </div>
        </div>
      )}
    </div>
  );
}