import React, { useState, useEffect } from 'react';
import { Users, Home, BookOpen, GraduationCap, Landmark } from 'lucide-react';
import MasonryGrid from '../components/MasonryGrid';
import PersonDetailModal from '../components/PersonDetailModal';
import { Person } from '../types/Person';
import { useRelationshipsData } from '../hooks/useRelationshipsData';

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
      PLACEHOLDER_AVATAR: 20, // 无头像时占位符尺寸 (w-24 h-24)
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
      AVATAR_BORDER: 2, // 头像边框宽度 (border-4)
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
  { id: '亲人家属', name: '亲人家属', icon: Home, color: 'bg-rose-400' },
  { id: '新闻出版', name: '新闻出版', icon: BookOpen, color: 'bg-gold' },
  { id: '学术文化', name: '学术文化', icon: GraduationCap, color: 'bg-heritage-blue' },
  { id: '政治社会', name: '政治社会', icon: Landmark, color: 'bg-sage-green' }
];

export default function RelationshipsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const { persons, loading, error } = useRelationshipsData();

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

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>数据加载失败，请稍后重试。</p>
          <p className="text-sm text-gray-500">{error.message}</p>
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
      
      {/* Person Detail Modal */}
      <PersonDetailModal 
        person={selectedPerson}
        onClose={() => setSelectedPerson(null)}
        getCategoryColor={getCategoryColor}
      />
    </div>
  );
}