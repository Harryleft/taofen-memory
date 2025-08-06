import React from 'react';
import { BookOpen, ExternalLink, FileText, X } from 'lucide-react';
import { Person } from '../../types/Person.ts';
import { getCategoryClass, getCategoryBgTailwindClassByName, getCategoryTailwindClassByName } from '../../constants/relationshipsConstants';

interface PersonDetailModalProps {
  person: Person | null;
  isOpen: boolean;
  onClose: () => void;
}

const RelationshipPagePersonModal: React.FC<PersonDetailModalProps> = ({ person, isOpen, onClose }) => {
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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 text-center border-b border-gray-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>

          {person.img ? (
            <div className="mb-4">
              <div className="masonry-card-avatar-container position-center">
                <div className="masonry-avatar-container">
                  <img
                    src={person.img}
                    alt={person.name}
                    className="masonry-avatar-image"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <div className="masonry-card-avatar-container position-center">
                <div className="masonry-avatar-container">
                  <div className={`masonry-avatar-placeholder ${getCategoryClass(person.category)}`}>
                    {person.name.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          )}

          <h2 className="text-xl font-semibold text-gray-900 mb-2">{person.name}</h2>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryBgTailwindClassByName(person.category)} ${getCategoryTailwindClassByName(person.category)}`}>
            {person.category}
          </div>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-6">
          {/* 描述 */}
          {person.description && (
            <div>
              <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
                <FileText size={18} className="mr-2 text-gray-600" />
                人物简介
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {person.description}
              </p>
            </div>
          )}

          {/* 来源 */}
          {person.sources && person.sources.length > 0 && (
            <div>
              <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
                <BookOpen size={18} className="mr-2 text-gray-600" />
                相关资料
              </h3>
              <div className="space-y-3">
                {person.sources.map((source, index) => {
                  // 处理数据结构不匹配：将字符串数组转换为Source对象
                  const sourceTitle = typeof source === 'string' ? source : source.title;
                  const sourceUrl = typeof source === 'string' 
                    ? (person.link && person.link[index]) 
                    : source.url;
                  
                  // 如果没有链接或链接为空字符串，根据数据源类型添加默认链接
                  // if (!sourceUrl) {
                  //   switch (sourceTitle) {
                  //     case '上海图书馆人名规范库':
                  //       sourceUrl = 'http://data.library.sh.cn/';
                  //       break;
                  //     case '维基百科':
                  //       sourceUrl = 'https://zh.wikipedia.org/';
                  //       break;
                  //     default:
                  //       sourceUrl = '#'; // 默认链接，防止href为空
                  //       break;
                  //   }
                  // }
                  
                  return (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <a
                        href={sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between text-blue-600 hover:text-blue-800 transition-colors"
                        onClick={sourceUrl === '#' ? (e) => e.preventDefault() : undefined}
                      >
                        <span className="font-medium">{sourceTitle}</span>
                        <ExternalLink size={16} className="ml-2 flex-shrink-0" />
                      </a>
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

export default RelationshipPagePersonModal;
