import React, { useState, useEffect } from 'react';
import { Users, Heart, BookOpen, GraduationCap, Building, ExternalLink } from 'lucide-react';

interface Person {
  id: number;
  name: string;
  category: string;
  img: string;
  desc: string;
  sources: string[];
  link: string[];
}

interface RelationshipsData {
  persons: Person[];
}

const categories = [
  { id: 'all', name: '全部关系', icon: Users, color: 'bg-charcoal' },
  { id: '亲人家属', name: '亲人家属', icon: Heart, color: 'bg-seal' },
  { id: '新闻出版', name: '新闻出版', icon: BookOpen, color: 'bg-gold' },
  { id: '学术文化', name: '学术文化', icon: GraduationCap, color: 'bg-charcoal' },
  { id: '政治社会', name: '政治社会', icon: Building, color: 'bg-seal' }
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
        {/* 邹韬奋中心卡片 */}
        <div className="bg-gradient-to-br from-gold/20 to-cream/30 rounded-2xl p-10 mb-8 shadow-xl border border-gold/30">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <div className="relative">
                <img
                  src={taofen.img}
                  alt={taofen.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-gold shadow-lg"
                />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-4xl font-bold text-charcoal mb-2">{taofen.name}</h2>
              <p className="text-xl text-gray-600 mb-4">{taofen.desc}</p>
            </div>
          </div>
        </div>

        {/* 人物关系卡片网格 */}
        <div className="bg-cream/30 rounded-3xl p-8 shadow-xl border border-gray-200">          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPersons.map((person) => {
              const categoryInfo = categories.find(cat => cat.id === person.category);
              const Icon = categoryInfo?.icon || Users;
              
              return (
                <div
                  key={person.id}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-gray-200 group"
                  onClick={() => setSelectedPerson(person)}
                >
                  <div className="flex flex-col items-center text-center">
                    {/* 头像或占位符 */}
                    <div className="relative mb-4">
                      {person.img ? (
                        <img
                          src={person.img}
                          alt={person.name}
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 group-hover:border-gray-300 transition-colors"
                        />
                      ) : (
                        <div className={`w-20 h-20 rounded-full ${getCategoryColor(person.category)} flex items-center justify-center text-white text-2xl font-bold`}>
                          {person.name.charAt(0)}
                        </div>
                      )}
                      {/* 分类图标 */}
                      <div className={`absolute -bottom-1 -right-1 ${getCategoryColor(person.category)} rounded-full p-2 border-2 border-white`}>
                        <Icon size={16} className="text-white" />
                      </div>
                    </div>
                    
                    {/* 姓名 */}
                    <h3 className="text-lg font-semibold text-charcoal mb-2 group-hover:text-gold transition-colors">
                      {person.name}
                    </h3>
                    
                    {/* 关系描述 */}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {person.desc}
                    </p>
                    
                    {/* 分类标签 */}
                    <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(person.category)}`}>
                      {person.category}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredPersons.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">暂无相关人物</div>
              <div className="text-gray-500 text-sm">请尝试选择其他分类</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Person Detail Modal */}
      {selectedPerson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="text-center">
              {selectedPerson.img ? (
                <img 
                  src={selectedPerson.img} 
                  alt={selectedPerson.name}
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-4 border-gray-200"
                />
              ) : (
                <div className={`w-20 h-20 ${getCategoryColor(selectedPerson.category)} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <span className="text-white font-medium">{selectedPerson.name}</span>
                </div>
              )}
              <h2 className="text-xl font-bold text-gray-800 mb-2">{selectedPerson.name}</h2>
              <p className="text-gray-600 mb-4">{selectedPerson.category}</p>
              <p className="text-gray-700 mb-6">{selectedPerson.desc}</p>
              {selectedPerson.sources && selectedPerson.sources.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">相关资料：</h3>
                  <ul className="text-sm text-gray-500 space-y-1">
                    {selectedPerson.sources.map((source, index) => (
                      <li key={index}>{source}</li>
                    ))}
                  </ul>
                </div>
              )}
              <button 
                onClick={() => setSelectedPerson(null)}
                className="bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}