import { useMemo, memo } from 'react';
import { ZoomIn } from 'lucide-react';

// 转换后的数据接口
interface TransformedHandwritingItem {
  id: string;
  title: string;
  year: number;
  date: string;
  category: 'letter' | 'manuscript' | 'note' | 'article';
  description: string;
  image: string;
  highResImage: string;
  tags: string[];
  dimensions: {
    width: number;
    height: number;
  };
  originalData: {
    id: string;
    名称: string;
    原文: string;
    时间: string;
    注释: string;
    数据来源: string;
    标签: string;
    图片位置: Array<{
      remote_url: string;
      local_path: string;
    }>;
  };
}

// 工具函数：高亮搜索文本
const highlightSearchText = (text: string, searchTerm: string): JSX.Element => {
  if (!searchTerm) return <>{text}</>;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <span key={`${index}-${part}`} className="bg-yellow-200 text-charcoal font-bold">
            {part}
          </span>
        ) : (
          <span key={`${index}-${part}`}>{part}</span>
        )
      )}
    </>
  );
};

const categoryLabels = {
  letter: '书信',
  manuscript: '手稿',
  note: '笔记',
  article: '文章'
};

const categoryColors = {
  letter: 'bg-blue-500',
  manuscript: 'bg-gold',
  note: 'bg-green-500',
  article: 'bg-purple-500'
};

interface HandwritingCardProps {
  item: TransformedHandwritingItem;
  isVisible: boolean;
  columnIndex: number;
  searchTerm: string;
  onCardClick: (item: TransformedHandwritingItem) => void;
}

const HandwritingCard = memo(({ 
  item, 
  isVisible, 
  columnIndex, 
  searchTerm, 
  onCardClick 
}: HandwritingCardProps) => {
  const highlightedTitle = useMemo(() => highlightSearchText(item.title, searchTerm), [item.title, searchTerm]);
  const highlightedDescription = useMemo(() => highlightSearchText(item.description, searchTerm), [item.description, searchTerm]);
  
    
  return (
    <div
      data-item-id={item.id}
      className={`group cursor-pointer transform transition-all duration-700 ${
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-8 opacity-0'
      }`}
      onClick={() => onCardClick(item)}
      style={{
        animationDelay: `${columnIndex * 100}ms`
      }}
    >
      <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
        <div className="relative overflow-hidden">
          <img
            src={item.image}
            alt={item.title}
            className="w-full object-cover group-hover:scale-110 transition-transform duration-700"
            style={{ height: `${item.dimensions.height}px` }}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
            <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={32} />
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs text-white ${categoryColors[item.category]}`}>
              {categoryLabels[item.category]}
            </span>
            <span className="text-xs text-charcoal/60">{item.year}年</span>
          </div>
          <h3 className="font-bold text-charcoal mb-2 group-hover:text-gold transition-colors">
            {highlightedTitle}
          </h3>
          <p className="text-sm text-charcoal/70 mb-2 line-clamp-2">
            {highlightedDescription}
          </p>
          <div className="flex flex-wrap gap-1">
            {item.tags.filter(tag => !tag.includes('年')).slice(0, 2).map((tag, index) => (
              <span key={index} className="text-xs bg-gold/10 text-gold px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

HandwritingCard.displayName = 'HandwritingCard';

export default HandwritingCard;
export type { TransformedHandwritingItem };