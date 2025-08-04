import React, { useState, useEffect } from 'react';
import { Users, Heart, BookOpen, GraduationCap, Building, ExternalLink} from 'lucide-react';
import MasonryGrid from '../components/MasonryGrid';
import { Person } from '../types/Person';

interface RelationshipsData {
  persons: Person[];
}

// 关系页面配置常量
const RELATIONSHIPS_CONFIG = {
  // 人物相关配置
  person: {
    TAOFEN_ID: 499 // 邹韬奋的唯一标识ID，用于过滤和定义
  },
  
  // UI尺寸配置
  ui: {
    // 图标尺寸配置
    iconSizes: {
      CATEGORY_BUTTON: 18, // 分类按钮中的图标尺寸
      DETAIL_SECTION: 18,  // 详情页面章节标题图标尺寸
      CATEGORY_BADGE: 16   // 人物分类徽章图标尺寸
    },
    
    // 头像尺寸配置
    avatarSizes: {
      DETAIL_AVATAR: 20,      // 详情页面头像尺寸 (w-20 h-20)
      PLACEHOLDER_AVATAR: 24, // 无头像时占位符尺寸 (w-24 h-24)
      CATEGORY_BADGE: 8       // 分类徽章尺寸 (w-8 h-8)
    },
    
    // 间距配置
    spacing: {
      SMALL: 2,    // 小间距，用于紧密元素间距 (mb-2)
      MEDIUM: 4,   // 中等间距，用于按钮内边距和一般间距 (p-4, gap-4)
      LARGE: 6,    // 大间距，用于章节间距 (py-6, mb-6)
      XLARGE: 8,   // 超大间距，用于内容区域内边距 (p-8)
      XXLARGE: 12  // 最大间距，用于页面级别间距 (py-12)
    },
    
    // 边框宽度配置
    borders: {
      AVATAR_BORDER: 4, // 头像边框宽度 (border-4)
      BADGE_BORDER: 3   // 分类徽章边框宽度 (border-3)
    },
    
    // 位置偏移配置
    positioning: {
      BADGE_OFFSET: 2,    // 分类徽章位置偏移 (-bottom-2 -right-2)
      BUTTON_POSITION: 4  // 关闭按钮位置偏移 (top-4 right-4)
    }
  },
  
  // 动画配置
  animation: {
    TRANSITION_DURATION: 300, // 标准过渡动画时长 (duration-300)
    HOVER_DURATION: 200,      // 悬停动画时长 (duration-200)
    HOVER_SCALE: 110          // 悬停缩放比例 (hover:scale-110)
  },
  
  // 布局配置
  layout: {
    // Z-index层级配置
    zIndex: {
      HEADER: 40, // 页面头部固定层级 (z-40)
      MODAL: 50   // 模态框层级 (z-50)
    },
    
    // 透明度配置
    opacity: {
      HEADER_BG: 90,       // 头部背景透明度 (bg-cream/90)
      MODAL_BACKDROP: 60,  // 模态框背景遮罩透明度 (bg-black/60)
      BUTTON_BG: 80,       // 按钮背景透明度 (bg-white/80)
      GRADIENT_START: 50,  // 渐变起始透明度 (from-cream/50)
      GRADIENT_END: 20,    // 渐变结束透明度 (to-gold/20)
      CONTENT_BG: 30       // 内容区域背景透明度 (bg-cream/30)
    },
    
    // 视口相关配置
    viewport: {
      MODAL_MAX_HEIGHT: 90 // 模态框最大高度占视口比例 (max-h-[90vh])
    }
  }
};

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
        const filteredPersons = data.persons.filter(person => person.id !== RELATIONSHIPS_CONFIG.person.TAOFEN_ID);
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
    id: RELATIONSHIPS_CONFIG.person.TAOFEN_ID,
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
      <div className={`bg-cream/${RELATIONSHIPS_CONFIG.layout.opacity.HEADER_BG} backdrop-blur-sm border-b border-gray-200 sticky top-0 z-${RELATIONSHIPS_CONFIG.layout.zIndex.HEADER}`}>
        <div className={`max-w-7xl mx-auto px-${RELATIONSHIPS_CONFIG.ui.spacing.LARGE} py-${RELATIONSHIPS_CONFIG.ui.spacing.LARGE}`}>
          <div className="text-center">
            <h1 className={`text-4xl font-bold text-gray-800 mb-${RELATIONSHIPS_CONFIG.ui.spacing.SMALL}`}>邹韬奋人脉网络</h1>
            <p className="text-gray-600">探索一位文化先驱的社会关系图谱</p>
          </div>
          
          {/* Category Filter */}
          <div className={`flex flex-wrap justify-center gap-${RELATIONSHIPS_CONFIG.ui.spacing.MEDIUM} mt-${RELATIONSHIPS_CONFIG.ui.spacing.LARGE}`}>
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-${RELATIONSHIPS_CONFIG.ui.spacing.MEDIUM} py-${RELATIONSHIPS_CONFIG.ui.spacing.SMALL} rounded-full transition-all duration-${RELATIONSHIPS_CONFIG.animation.TRANSITION_DURATION} ${
                    selectedCategory === category.id
                      ? `${category.color} text-white shadow-lg`
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <Icon size={RELATIONSHIPS_CONFIG.ui.iconSizes.CATEGORY_BUTTON} />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`max-w-7xl mx-auto px-${RELATIONSHIPS_CONFIG.ui.spacing.LARGE} py-${RELATIONSHIPS_CONFIG.ui.spacing.XXLARGE}`}>
        {/* 人物关系瀑布流 */}
        <div className={`bg-cream/${RELATIONSHIPS_CONFIG.layout.opacity.CONTENT_BG} rounded-3xl p-${RELATIONSHIPS_CONFIG.ui.spacing.XLARGE} shadow-xl border border-gray-200`}>
          <h2 className={`text-2xl font-bold text-charcoal mb-${RELATIONSHIPS_CONFIG.ui.spacing.LARGE} text-center`}>
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
        <div className={`fixed inset-0 bg-black/${RELATIONSHIPS_CONFIG.layout.opacity.MODAL_BACKDROP} backdrop-blur-sm flex items-center justify-center z-${RELATIONSHIPS_CONFIG.layout.zIndex.MODAL} p-${RELATIONSHIPS_CONFIG.ui.spacing.MEDIUM}`}>
          <div className={`bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[${RELATIONSHIPS_CONFIG.layout.viewport.MODAL_MAX_HEIGHT}vh] overflow-y-auto`}>
            {/* Header */}
            <div className={`relative bg-gradient-to-br from-cream/${RELATIONSHIPS_CONFIG.layout.opacity.GRADIENT_START} to-gold/${RELATIONSHIPS_CONFIG.layout.opacity.GRADIENT_END} rounded-t-3xl p-${RELATIONSHIPS_CONFIG.ui.spacing.XLARGE} text-center`}>
              <button 
                onClick={() => setSelectedPerson(null)}
                className={`absolute top-${RELATIONSHIPS_CONFIG.ui.positioning.BUTTON_POSITION} right-${RELATIONSHIPS_CONFIG.ui.positioning.BUTTON_POSITION} w-${RELATIONSHIPS_CONFIG.ui.avatarSizes.CATEGORY_BADGE} h-${RELATIONSHIPS_CONFIG.ui.avatarSizes.CATEGORY_BADGE} bg-white/${RELATIONSHIPS_CONFIG.layout.opacity.BUTTON_BG} hover:bg-white rounded-full flex items-center justify-center transition-all duration-${RELATIONSHIPS_CONFIG.animation.HOVER_DURATION} hover:scale-${RELATIONSHIPS_CONFIG.animation.HOVER_SCALE}`}
              >
                <span className="text-gray-600 text-lg leading-none">×</span>
              </button>
              
              {selectedPerson.img ? (
                <div className="relative inline-block">
                  <img 
                    src={selectedPerson.img} 
                    alt={selectedPerson.name}
                    className={`w-${RELATIONSHIPS_CONFIG.ui.avatarSizes.DETAIL_AVATAR} h-${RELATIONSHIPS_CONFIG.ui.avatarSizes.DETAIL_AVATAR} rounded-full mx-auto object-cover border-${RELATIONSHIPS_CONFIG.ui.borders.AVATAR_BORDER} border-white shadow-lg`}
                  />
                  <div className={`absolute -bottom-${RELATIONSHIPS_CONFIG.ui.positioning.BADGE_OFFSET} -right-${RELATIONSHIPS_CONFIG.ui.positioning.BADGE_OFFSET} w-${RELATIONSHIPS_CONFIG.ui.avatarSizes.CATEGORY_BADGE} h-${RELATIONSHIPS_CONFIG.ui.avatarSizes.CATEGORY_BADGE} ${getCategoryColor(selectedPerson.category)} rounded-full border-${RELATIONSHIPS_CONFIG.ui.borders.BADGE_BORDER} border-white flex items-center justify-center`}>
                    {categories.find(cat => cat.id === selectedPerson.category)?.icon && 
                      React.createElement(categories.find(cat => cat.id === selectedPerson.category)!.icon, { size: RELATIONSHIPS_CONFIG.ui.iconSizes.CATEGORY_BADGE, className: "text-white" })
                    }
                  </div>
                </div>
              ) : (
                <div className={`w-${RELATIONSHIPS_CONFIG.ui.avatarSizes.PLACEHOLDER_AVATAR} h-${RELATIONSHIPS_CONFIG.ui.avatarSizes.PLACEHOLDER_AVATAR} ${getCategoryColor(selectedPerson.category)} rounded-full flex items-center justify-center mx-auto shadow-lg`}>
                  <span className="text-white font-bold text-2xl">{selectedPerson.name.charAt(0)}</span>
                </div>
              )}
              
              <h2 className={`text-2xl font-bold text-charcoal mt-${RELATIONSHIPS_CONFIG.ui.spacing.MEDIUM} mb-${RELATIONSHIPS_CONFIG.ui.spacing.SMALL}`}>{selectedPerson.name}</h2>
              <div className={`inline-block px-${RELATIONSHIPS_CONFIG.ui.spacing.MEDIUM} py-1 rounded-full text-sm font-medium text-white ${getCategoryColor(selectedPerson.category)}`}>
                {selectedPerson.category}
              </div>
            </div>
            
            {/* Content */}
            <div className={`p-${RELATIONSHIPS_CONFIG.ui.spacing.XLARGE}`}>
              {/* Description */}
              <div className={`mb-${RELATIONSHIPS_CONFIG.ui.spacing.LARGE}`}>
                <h3 className={`text-lg font-semibold text-charcoal mb-${RELATIONSHIPS_CONFIG.ui.spacing.SMALL} flex items-center gap-${RELATIONSHIPS_CONFIG.ui.spacing.SMALL}`}>
                  <BookOpen size={RELATIONSHIPS_CONFIG.ui.iconSizes.DETAIL_SECTION} className="text-gold" />
                  人物简介
                </h3>
                <p className={`text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-${RELATIONSHIPS_CONFIG.ui.spacing.MEDIUM} indent-8`}>{selectedPerson.desc}</p>
              </div>
              
              {/* Sources */}
              {selectedPerson.sources && selectedPerson.sources.length > 0 && (
                <div className={`mb-${RELATIONSHIPS_CONFIG.ui.spacing.LARGE}`}>
                  <h3 className={`text-lg font-semibold text-charcoal mb-${RELATIONSHIPS_CONFIG.ui.spacing.SMALL} flex items-center gap-${RELATIONSHIPS_CONFIG.ui.spacing.SMALL}`}>
                    <ExternalLink size={RELATIONSHIPS_CONFIG.ui.iconSizes.DETAIL_SECTION} className="text-gold" />
                    相关资料
                  </h3>
                  <div className={`space-y-${RELATIONSHIPS_CONFIG.ui.spacing.SMALL}`}>
                    {selectedPerson.sources.map((source, index) => {
                      const hasLink = selectedPerson.link && selectedPerson.link[index];
                      return (
                        <div key={index} className={`bg-gray-50 rounded-lg p-${RELATIONSHIPS_CONFIG.ui.spacing.MEDIUM} hover:bg-gray-100 transition-colors`}>
                          {hasLink ? (
                            <a 
                              href={selectedPerson.link[index]} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center justify-between text-gray-700 hover:text-gold transition-colors group"
                            >
                              <span className="flex-1">{source}</span>
                              <ExternalLink size={RELATIONSHIPS_CONFIG.ui.iconSizes.CATEGORY_BADGE} className={`text-gray-400 group-hover:text-gold ml-${RELATIONSHIPS_CONFIG.ui.spacing.SMALL}`} />
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