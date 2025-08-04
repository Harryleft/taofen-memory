import React from 'react';
import { BookOpen, ExternalLink, FileText } from 'lucide-react';
import { Person } from '../types/Person';
import { 
  RELATIONSHIPS_CONFIG, 
  modalStyles, 
  getAvatarContainerClass, 
  getCategoryBadgeClass, 
  getCategoryTagClass 
} from '../styles/relationships';

interface PersonDetailModalProps {
  person: Person | null;
  isOpen: boolean;
  onClose: () => void;
}

const PersonDetailModal: React.FC<PersonDetailModalProps> = ({ person, isOpen, onClose }) => {
  // 处理ESC键关闭
  React.useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, isOpen]);

  if (!person || !isOpen) return null;

  // 处理点击背景关闭
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className={modalStyles.backdrop}
      onClick={handleBackdropClick}
    >
      <div className={modalStyles.container}>
        {/* Header */}
        <div className={modalStyles.header.container}>
          <button 
            onClick={onClose}
            className={modalStyles.header.closeButton}
          >
            <span className={modalStyles.header.closeIcon}>×</span>
          </button>
          
          {person.img ? (
            <div className={modalStyles.header.avatarContainer}>
              <img 
                src={person.img} 
                alt={person.name}
                className={modalStyles.header.avatar}
              />
              <div className={getCategoryBadgeClass(person.category)}>
                <span className={modalStyles.header.categoryBadgeText}>{person.category.charAt(0)}</span>
              </div>
            </div>
          ) : (
            <div className={getAvatarContainerClass(person.category)}>
              <span className={modalStyles.header.avatarPlaceholderText}>{person.name.charAt(0)}</span>
            </div>
          )}
          
          <h2 className={modalStyles.header.name}>{person.name}</h2>
          <div className={getCategoryTagClass(person.category)}>
            {person.category}
          </div>
        </div>
        
        {/* 内容 */}
        <div className={modalStyles.content.container}>
          {/* 描述 */}
          {person.description && (
            <div className={modalStyles.content.section}>
              <h3 className={modalStyles.content.sectionTitle}>
                <FileText size={RELATIONSHIPS_CONFIG.ui.iconSizes.DETAIL_SECTION} className={modalStyles.content.sectionIcon} />
                人物简介
              </h3>
              <p className={modalStyles.content.description}>
                {person.description}
              </p>
            </div>
          )}
          
          {/* 来源 */}
          {person.sources && person.sources.length > 0 && (
            <div className={modalStyles.content.section}>
              <h3 className={modalStyles.content.sectionTitle}>
                <BookOpen size={RELATIONSHIPS_CONFIG.ui.iconSizes.DETAIL_SECTION} className={modalStyles.content.sectionIcon} />
                相关资料
              </h3>
              <div className={modalStyles.content.sourcesList}>
                {person.sources.map((source, index) => (
                  <div key={index} className={modalStyles.content.sourceItem}>
                    {source.url ? (
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={modalStyles.content.sourceLink}
                      >
                        <span className={modalStyles.content.sourceLinkText}>{source.title}</span>
                        <ExternalLink size={RELATIONSHIPS_CONFIG.ui.iconSizes.CATEGORY_BADGE} className={modalStyles.content.sourceLinkIcon} />
                      </a>
                    ) : (
                      <span className={modalStyles.content.sourceText}>{source.title}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>           
      </div>
    </div>
  );
};

export default PersonDetailModal;