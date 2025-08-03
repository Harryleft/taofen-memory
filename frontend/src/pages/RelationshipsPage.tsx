import React, { useState } from 'react';
import { Users, Heart, BookOpen, GraduationCap, Building } from 'lucide-react';

interface Person {
  id: string;
  name: string;
  avatar: string;
  category: 'family' | 'publishing' | 'academic' | 'political';
  relationship: string;
  description: string;
  connections?: string[]; // IDs of connected people
}

const mockPersons: Person[] = [
  // 亲人家属
  {
    id: 'family-1',
    name: '邹母',
    avatar: '/api/placeholder/80/80',
    category: 'family',
    relationship: '母亲',
    description: '慈祥的母亲，对韬奋的成长影响深远'
  },
  {
    id: 'family-2', 
    name: '沈粹缜',
    avatar: '/api/placeholder/80/80',
    category: 'family',
    relationship: '妻子',
    description: '贤内助，支持韬奋的事业发展'
  },
  {
    id: 'family-3',
    name: '邹嘉骊',
    avatar: '/api/placeholder/80/80', 
    category: 'family',
    relationship: '长子',
    description: '继承父志，从事新闻出版工作'
  },
  
  // 新闻出版界
  {
    id: 'publishing-1',
    name: '胡愈之',
    avatar: '/api/placeholder/80/80',
    category: 'publishing',
    relationship: '同事',
    description: '生活书店重要合作伙伴'
  },
  {
    id: 'publishing-2',
    name: '艾思奇',
    avatar: '/api/placeholder/80/80',
    category: 'publishing',
    relationship: '作者',
    description: '哲学家，生活书店重要作者'
  },
  {
    id: 'publishing-3',
    name: '茅盾',
    avatar: '/api/placeholder/80/80',
    category: 'publishing',
    relationship: '文友',
    description: '著名作家，文学界挚友'
  },
  
  // 学术文化界
  {
    id: 'academic-1',
    name: '蔡元培',
    avatar: '/api/placeholder/80/80',
    category: 'academic',
    relationship: '前辈',
    description: '教育家，思想启蒙者'
  },
  {
    id: 'academic-2',
    name: '鲁迅',
    avatar: '/api/placeholder/80/80',
    category: 'academic',
    relationship: '师友',
    description: '文学巨匠，思想导师'
  },
  {
    id: 'academic-3',
    name: '巴金',
    avatar: '/api/placeholder/80/80',
    category: 'academic',
    relationship: '文友',
    description: '作家，文学界好友'
  },
  
  // 政治社会界
  {
    id: 'political-1',
    name: '宋庆龄',
    avatar: '/api/placeholder/80/80',
    category: 'political',
    relationship: '同志',
    description: '革命家，共同理想的战友'
  },
  {
    id: 'political-2',
    name: '史良',
    avatar: '/api/placeholder/80/80',
    category: 'political',
    relationship: '同志',
    description: '法学家，民主人士'
  },
  {
    id: 'political-3',
    name: '沈钧儒',
    avatar: '/api/placeholder/80/80',
    category: 'political',
    relationship: '同志',
    description: '法学家，救国会领袖'
  }
];

const categories = [
  { id: 'all', name: '全部关系', icon: Users, color: 'bg-blue-500' },
  { id: 'family', name: '亲人家属', icon: Heart, color: 'bg-pink-500' },
  { id: 'publishing', name: '新闻出版', icon: BookOpen, color: 'bg-green-500' },
  { id: 'academic', name: '学术文化', icon: GraduationCap, color: 'bg-purple-500' },
  { id: 'political', name: '政治社会', icon: Building, color: 'bg-orange-500' }
];

export default function RelationshipsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const filteredPersons = selectedCategory === 'all' 
    ? mockPersons 
    : mockPersons.filter(person => person.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    const categoryInfo = categories.find(cat => cat.id === category);
    return categoryInfo?.color || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-pink-200 sticky top-0 z-40">
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
        {/* Network Visualization */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 mb-8 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {selectedCategory === 'all' ? '完整关系网络' : categories.find(cat => cat.id === selectedCategory)?.name}
          </h2>
          
          {/* Central Figure - 邹韬奋 */}
          <div className="relative flex flex-col items-center">
            {/* SVG for connection lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{zIndex: 1}}>
              {filteredPersons.map((person, index) => {
                const totalPersons = filteredPersons.length;
                const angle = (index * 2 * Math.PI) / totalPersons;
                const radius = 200; // Distance from center
                const centerX = '50%';
                const centerY = '200px'; // Adjust based on central figure position
                const endX = `calc(50% + ${Math.cos(angle) * radius}px)`;
                const endY = `calc(200px + ${Math.sin(angle) * radius}px)`;
                
                return (
                  <line
                    key={`line-${person.id}`}
                    x1={centerX}
                    y1={centerY}
                    x2={endX}
                    y2={endY}
                    stroke="white"
                    strokeWidth="2"
                    opacity="0.8"
                  />
                );
              })}
            </svg>
            
            <div className="relative mb-12" style={{zIndex: 2}}>
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                <span className="text-white font-bold text-xl">邹韬奋</span>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">核心</span>
              </div>
            </div>
            
            {/* People positioned in circle */}
            <div className="relative w-full max-w-6xl h-96">
              {filteredPersons.map((person, index) => {
                const categoryInfo = categories.find(cat => cat.id === person.category);
                const totalPersons = filteredPersons.length;
                const angle = (index * 2 * Math.PI) / totalPersons;
                const radius = 200;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                return (
                  <div 
                    key={person.id} 
                    className="absolute flex flex-col items-center group"
                    style={{
                      left: `calc(50% + ${x}px - 40px)`,
                      top: `calc(50% + ${y}px - 40px)`,
                      zIndex: 2
                    }}
                  >
                    {/* Person Avatar */}
                    <div 
                      className={`w-20 h-20 ${categoryInfo?.color || 'bg-gray-500'} rounded-full flex items-center justify-center cursor-pointer transform transition-all duration-300 group-hover:scale-110 shadow-lg`}
                      onClick={() => setSelectedPerson(person)}
                    >
                      <span className="text-white font-medium text-sm text-center px-2">
                        {person.name}
                      </span>
                    </div>
                    
                    {/* Person Info */}
                    <div className="mt-3 text-center">
                      <h3 className="font-semibold text-gray-800 text-sm">{person.name}</h3>
                      <p className="text-xs text-gray-600 mt-1">{person.relationship}</p>
                    </div>
                    
                    {/* Hover Details */}
                    <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 w-48">
                      <p className="text-sm text-gray-700">{person.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.slice(1).map((category) => {
            const count = mockPersons.filter(person => person.category === category.id).length;
            const Icon = category.icon;
            return (
              <div key={category.id} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg">
                <div className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <Icon className="text-white" size={24} />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{category.name}</h3>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-600">位重要人物</p>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Person Detail Modal */}
      {selectedPerson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="text-center">
              <div className={`w-20 h-20 ${getCategoryColor(selectedPerson.category)} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <span className="text-white font-medium">{selectedPerson.name}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">{selectedPerson.name}</h2>
              <p className="text-gray-600 mb-4">{selectedPerson.relationship}</p>
              <p className="text-gray-700 mb-6">{selectedPerson.description}</p>
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