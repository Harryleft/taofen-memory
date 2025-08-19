import React, { useRef } from 'react';
import { BookOpen, ExternalLink, FileText, X, Link as LinkIcon, Tags } from 'lucide-react';
import { Person } from '@/types/Person.ts';
import { getCategoryClass } from '@/constants/relationshipsConstants';

interface PersonDetailModalProps {
  person: Person | null;
  isOpen: boolean;
  onClose: () => void;
}

const RelationshipPagePersonModal: React.FC<PersonDetailModalProps> = ({ person, isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const modalStartY = useRef(0);
  const isDragging = useRef(false);

  // 处理ESC键关闭和背景滚动
  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // 禁用背景滚动
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${window.scrollY}px`;

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      
      // 恢复背景滚动
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    };
  }, [onClose, isOpen]);

  // 处理触摸开始事件
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!modalRef.current) return;
    
    const touch = e.touches[0];
    touchStartY.current = touch.clientY;
    modalStartY.current = 0;
    isDragging.current = true;
    
    // 阻止背景滚动
    e.preventDefault();
  };

  // 处理触摸移动事件
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !modalRef.current) return;
    
    const touch = e.touches[0];
    const deltaY = touch.clientY - touchStartY.current;
    
    // 只允许向下拖动
    if (deltaY > 0) {
      modalStartY.current = deltaY;
      modalRef.current.style.transform = `translateY(${deltaY}px)`;
      modalRef.current.style.transition = 'none';
      modalRef.current.style.opacity = `${1 - deltaY / 300}`;
    }
  };

  // 处理触摸结束事件
  const handleTouchEnd = () => {
    if (!isDragging.current || !modalRef.current) return;
    
    isDragging.current = false;
    
    // 如果拖动距离超过100px，则关闭模态框
    if (modalStartY.current > 100) {
      onClose();
    } else {
      // 重置位置
      modalRef.current.style.transform = '';
      modalRef.current.style.opacity = '';
      modalRef.current.style.transition = 'all 0.3s ease';
    }
  };

  if (!person || !isOpen) return null;

  // 处理点击背景关闭
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 md:p-8"
      onClick={handleBackdropClick}
    >
      <div 
    ref={modalRef}
    className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto md:my-8 my-0"
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
  >
        {/* Header */}
        <div className="relative p-6 text-center border-b border-gray-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-4 md:p-5 hover:bg-gray-100 rounded-full transition-colors z-10 active:bg-gray-200"
            aria-label="关闭"
          >
            <X size={24} className="text-gray-500 md:w-5 md:h-5" />
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
          {/* <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryBgTailwindClassByName(person.category)} ${getCategoryTailwindClassByName(person.category)}`}>
            {person.category}
          </div> */}
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

          {/* 关系线索 */}
          {person.extra?.relationships && person.extra.relationships.length > 0 && (
            <div>
              <h3 className="flex items-center text-lg font-medium text-gray-900 mb-1">
                <Tags size={18} className="mr-2 text-gray-600" />
                关系线索
              </h3>
              <p className="text-xs text-gray-500 mb-3">以下关系类型、维度和证据摘要由 AI 根据人物资料与语境自动生成，仅供参考。</p>
              <div className="space-y-4">
                {person.extra.relationships
                  .slice() // 不修改原数组
                  .sort((a, b) => {
                    const aConf = a.confidence ?? 0;
                    const bConf = b.confidence ?? 0;
                    // 先按置信度排序，次按 evidence 数量
                    const byConf = bConf - aConf;
                    if (byConf !== 0) return byConf;
                    const ae = a.evidence?.length ?? 0;
                    const be = b.evidence?.length ?? 0;
                    return be - ae;
                  })
                  .slice(0, 5)
                  .map((rel, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {rel.relationshipType && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-800">
                            {rel.relationshipType}
                          </span>
                        )}
                        {rel.relationshipSubtype && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                            {rel.relationshipSubtype}
                          </span>
                        )}
                        {rel.strength && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                            强度: {rel.strength}
                          </span>
                        )}
                        {typeof rel.confidence === 'number' && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                            置信度: {Math.round(rel.confidence * 100)}%
                          </span>
                        )}
                        {rel.significance && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                            重要性: {rel.significance}
                          </span>
                        )}
                        {rel.emotionalTone && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                            情感: {rel.emotionalTone}
                          </span>
                        )}
                        {rel.aspects?.slice(0, 3).map((a) => (
                          <span key={a} className="px-2 py-0.5 text-xs rounded-full bg-white border border-gray-200 text-gray-700">
                            {a}
                          </span>
                        ))}
                      </div>
                      {rel.evidence && rel.evidence.length > 0 && (
                        <ul className="space-y-2 list-disc list-inside text-sm text-gray-700">
                          {rel.evidence.slice(0, 3).map((ev, i) => (
                            <li key={i} className="pl-1">
                              {ev.quote && (
                                <span className="">
                                  “{ev.quote}”
                                </span>
                              )}
                              {ev.source && (
                                <span className="ml-2 inline-flex items-center gap-1 text-blue-600">
                                  <LinkIcon size={14} /> {ev.source}
                                </span>
                              )}
                              {ev.context && (
                                <span className="ml-2 text-gray-500">({ev.context})</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
              </div>
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
        
        {/* 移动端底部操作栏 */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors active:bg-gray-300"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default RelationshipPagePersonModal;
