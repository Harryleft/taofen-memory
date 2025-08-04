import React from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';
import { Person } from '../types/Person';

// 人物详情模态框配置常量
const MODAL_CONFIG = {
  ui: {
    iconSizes: {
      DETAIL_SECTION: 18,
      CATEGORY_BADGE: 16
    },
    avatarSizes: {
      DETAIL_AVATAR: 20,
      PLACEHOLDER_AVATAR: 20,
      CATEGORY_BADGE: 8
    },
    spacing: {
      SMALL: 2,
      MEDIUM: 4,
      LARGE: 6,
      XLARGE: 8
    },
    borders: {
      AVATAR_BORDER: 2,
      BADGE_BORDER: 3
    },
    positioning: {
      BADGE_OFFSET: 2,
      BUTTON_POSITION: 4
    }
  },
  animation: {
    HOVER_DURATION: 200,
    HOVER_SCALE: 110
  },
  layout: {
    zIndex: {
      MODAL: 9999
    },
    opacity: {
      MODAL_BACKDROP: 60,
      BUTTON_BG: 80,
      GRADIENT_START: 50,
      GRADIENT_END: 20
    },
    viewport: {
      MODAL_MAX_HEIGHT: 90
    }
  }
};

// 分类配置
const categories = [
  { id: '亲人家属', color: 'bg-warm-rose' },
  { id: '新闻出版', color: 'bg-gold' },
  { id: '学术文化', color: 'bg-heritage-blue' },
  { id: '政治社会', color: 'bg-sage-green' }
];

interface PersonDetailModalProps {
  person: Person | null;
  onClose: () => void;
}

const PersonDetailModal: React.FC<PersonDetailModalProps> = ({ person, onClose }) => {
  if (!person) return null;

  const getCategoryColor = (category: string) => {
    const categoryInfo = categories.find(cat => cat.id === category);
    return categoryInfo?.color || 'bg-gray-500';
  };

  // 处理ESC键关闭
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // 处理点击背景关闭
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-cream/50 to-gold/20 rounded-t-3xl p-8 text-center">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          >
            <span className="text-gray-600 text-lg leading-none">×</span>
          </button>
          
          {person.img ? (
            <div className="relative inline-block">
              <img 
                src={person.img} 
                alt={person.name}
                className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-white shadow-lg"
              />
              <div className={`absolute -bottom-2 -right-2 w-8 h-8 ${getCategoryColor(person.category)} rounded-full border-3 border-white flex items-center justify-center`}>
                <span className="text-white text-xs font-bold">{person.category.charAt(0)}</span>
              </div>
            </div>
          ) : (
            <div className={`w-20 h-20 ${getCategoryColor(person.category)} rounded-full flex items-center justify-center mx-auto shadow-lg`}>
              <span className="text-white font-bold text-2xl">{person.name.charAt(0)}</span>
            </div>
          )}
          
          <h2 className="text-2xl font-bold text-charcoal mt-4 mb-2">{person.name}</h2>
          <div className={`inline-block px-4 py-1 rounded-full text-sm font-medium text-white ${getCategoryColor(person.category)}`}>
            {person.category}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-8">
          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-charcoal mb-2 flex items-center gap-2">
              <BookOpen size={18} className="text-gold" />
              人物简介
            </h3>
            <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4 indent-8">{person.desc}</p>
          </div>
          
          {/* Sources */}
          {person.sources && person.sources.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-charcoal mb-2 flex items-center gap-2">
                <FileText size={18} className="text-gold" />
                相关资料
              </h3>
              <div className="space-y-2">
                {person.sources.map((source, index) => {
                  const hasLink = person.link && person.link[index];
                  return (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      {hasLink ? (
                        <a 
                          href={person.link[index]} 
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
  );
};

export default PersonDetailModal;