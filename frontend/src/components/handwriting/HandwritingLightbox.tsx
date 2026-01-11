import { useMemo, useState, memo, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { categoryLabels, highlightSearchText } from '@/utils/handwritingUtils.ts';
import { AIInterpretationButton } from './AIInterpretationButton';
import { TypewriterText } from './TypewriterText';
import { Toast, useToast } from './Toast';
import type { TransformedHandwritingItem } from '@/hooks/useHandwritingData.ts';

interface LightboxProps {
  selectedItem: TransformedHandwritingItem;
  currentIndex: number;
  totalItems: number;
  searchTerm: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const HandwritingLightbox = memo(({
  selectedItem, 
  currentIndex, 
  totalItems, 
  searchTerm, 
  onClose, 
  onPrev, 
  onNext 
}: LightboxProps) => {
  const [aiInterpretation, setAiInterpretation] = useState<string>('');
  const [showAIInterpretation, setShowAIInterpretation] = useState(false);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [isFirstInterpretation, setIsFirstInterpretation] = useState(true);
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const { messages, removeToast } = useToast();

  const highlightedTitle = useMemo(() => highlightSearchText(selectedItem.title, searchTerm), [selectedItem.title, searchTerm]);
  const highlightedContent = useMemo(() => highlightSearchText(selectedItem.originalData.原文, searchTerm), [selectedItem.originalData.原文, searchTerm]);
  const highlightedNotes = useMemo(() => highlightSearchText(selectedItem.originalData.注释, searchTerm), [selectedItem.originalData.注释, searchTerm]);
  
  // 新增：智能高清图片选择
  const getHighResImageSrc = useMemo(() => {
    // 优先使用WebP版本
    if (selectedItem.optimizedImage) {
      return selectedItem.optimizedImage;
    }
    // 其次使用原图
    return selectedItem.highResImage;
  }, [selectedItem]);

  // 当切换到不同的手稿项目时，重置第一次解读状态
  useEffect(() => {
    setIsFirstInterpretation(true);
    setAiInterpretation('');
    setShowAIInterpretation(false);
    setIsTypingComplete(false);
    setImageStatus('loading');
  }, [selectedItem.id]); // 使用 selectedItem.id 作为依赖，确保项目切换时重置

  const handleInterpretationReady = (interpretation: string) => {
    setAiInterpretation(interpretation);
    setShowAIInterpretation(true);
    setIsTypingComplete(false);
    // 每次生成新解读后，标记为不是第一次
    setIsFirstInterpretation(false);
  };

  const handleTypingComplete = () => {
    setIsTypingComplete(true);
  };

  const handleImageLoad = () => {
    setImageStatus('loaded');
  };

  const handleImageError = () => {
    setImageStatus('error');
  };

  const toggleInterpretation = () => {
    if (aiInterpretation) {
      setShowAIInterpretation(!showAIInterpretation);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-6xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
        {/* Navigation */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          title="关闭详情"
        >
          <X size={24} />
        </button>
        
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          title="上一页"
        >
          <ChevronLeft size={32} />
        </button>
        
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          title="下一页"
        >
          <ChevronRight size={32} />
        </button>

        {/* Content */}
        <div className="flex flex-col lg:flex-row max-h-[90vh]">
          {/* Image */}
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-4">
            {selectedItem.highResImage ? (
              <>
                {imageStatus === 'loading' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600 text-sm">正在加载图片...</p>
                    </div>
                  </div>
                )}
                
                {imageStatus === 'error' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">图片无法加载</p>
                      <p className="text-gray-500 text-xs">请检查网络连接或图片链接</p>
                    </div>
                  </div>
                )}
                
                <img
                  src={getHighResImageSrc}
                  alt={selectedItem.title}
                  className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                    imageStatus === 'loaded' ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading="lazy"
                  fetchpriority="high"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 text-sm">暂无图片</p>
                <p className="text-gray-500 text-xs">此手迹项目暂无图片资源</p>
              </div>
            )}
          </div>
          
          {/* Details */}
          <div className="w-full lg:w-96 p-6 overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className={`handwriting-category-tag category-${selectedItem.category}`}>
                {categoryLabels[selectedItem.category]}
              </span>
              <span className="text-gold font-bold">{selectedItem.year}年</span>
            </div>
            
            <h3 className="text-2xl font-bold text-charcoal mb-2 font-serif">
              {highlightedTitle}
            </h3>
            
            <p className="text-charcoal/60 mb-4">{selectedItem.originalData.时间}</p>
            
            {/* AI解读按钮 - 移到更显眼的位置 */}
            <div className="mb-4">
              <AIInterpretationButton 
                item={selectedItem}
                onInterpretationReady={handleInterpretationReady}
              />
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-charcoal">
                  {showAIInterpretation ? 'AI解读' : '原文'}
                </h4>
                {aiInterpretation && (
                  <button
                    onClick={toggleInterpretation}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md
                      bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300
                      transition-colors"
                    title={showAIInterpretation ? '查看原文' : '查看AI解读'}
                  >
                    {showAIInterpretation ? (
                      <>
                        <EyeOff className="w-3 h-3" />
                        原文
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" />
                        解读
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="relative">
                <div className={`text-charcoal/80 leading-relaxed bg-gray-50 p-4 rounded-lg whitespace-pre-wrap transition-all duration-300
                  ${showAIInterpretation && aiInterpretation ? 'opacity-0 absolute inset-0' : 'opacity-100'}`}>
                  {highlightedContent}
                </div>
                {aiInterpretation && (
                  <div className={`text-blue-800/90 leading-relaxed bg-blue-50 p-4 rounded-lg transition-all duration-300
                    ${showAIInterpretation ? 'opacity-100 relative' : 'opacity-0 absolute inset-0'}`}>
                    {isFirstInterpretation ? (
                      <TypewriterText
                        text={aiInterpretation}
                        speed={25}
                        onComplete={handleTypingComplete}
                      />
                    ) : (
                      <div className="whitespace-pre-wrap">
                        {aiInterpretation}
                      </div>
                    )}
                    {isTypingComplete && isFirstInterpretation && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <div className="flex items-center gap-2 text-xs text-blue-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          AI解读完成
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="font-bold text-charcoal mb-2">注释</h4>
              <p className="text-charcoal/80 leading-relaxed bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                {highlightedNotes}
              </p>
            </div>
            
            <div className="mb-6">
              <h4 className="font-bold text-charcoal mb-2">数据来源</h4>
              {Boolean(selectedItem.originalData.图片位置) && 
               selectedItem.originalData.图片位置.length > 0 && 
               selectedItem.originalData.图片位置[0].remote_url ? (
                <a 
                  href={selectedItem.originalData.图片位置[0].remote_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold hover:text-gold/80 underline transition-colors"
                >
                  {selectedItem.originalData.数据来源}
                </a>
              ) : (
                <p className="text-charcoal/60">
                  {selectedItem.originalData.数据来源}
                </p>
              )}
            </div>
            
            <div className="mb-6">
              <h4 className="font-bold text-charcoal mb-2">标签</h4>
              <div className="flex flex-wrap gap-2">
                {selectedItem.tags.map((tag, index) => (
                  <span key={index} className="handwriting-tag-detail">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mt-4 text-sm text-charcoal/60 text-center">
              {currentIndex + 1} / {totalItems}
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast 提示 */}
      {messages.map(message => (
        <Toast key={message.id} message={message} onDismiss={removeToast} />
      ))}
    </div>
  );
});

HandwritingLightbox.displayName = 'HandwritingLightbox';

export default HandwritingLightbox;
