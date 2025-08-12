import React from 'react';

interface SkeletonCardProps {
  height: number;
  index: number;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ height, index }) => {
  return (
    <div
      className="bg-white rounded-lg overflow-hidden shadow-lg"
      style={{
        animationDelay: `${index * 100}ms`,
        height: `${height}px`
      }}
    >
      {/* 图片占位符 */}
      <div 
        className="w-full bg-gray-200 animate-pulse"
        style={{ height: `${height * 0.7}px` }}
      />
      
      {/* 内容占位符 */}
      <div className="p-4 space-y-3">
        {/* 标签占位符 */}
        <div className="flex items-center gap-2">
          <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        {/* 标题占位符 */}
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>
        
        {/* 标签占位符 */}
        <div className="flex gap-2">
          <div className="w-12 h-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

interface SkeletonGridProps {
  columns: number;
  itemsPerColumn: number;
  heights: number[][];
}

export const HandwritingSkeletonGrid: React.FC<SkeletonGridProps> = ({
  columns, 
  itemsPerColumn, 
  heights 
}) => {
  // 生成随机的骨架屏高度
  const generateHeights = () => {
    const columnHeights: number[][] = [];
    
    for (let col = 0; col < columns; col++) {
      const columnHeight: number[] = [];
      for (let item = 0; item < itemsPerColumn; item++) {
        // 生成随机高度，模拟真实图片的高度变化
        const randomHeight = Math.floor(Math.random() * 100) + 250; // 250-350px
        columnHeight.push(randomHeight);
      }
      columnHeights.push(columnHeight);
    }
    
    return columnHeights;
  };

  const skeletonHeights = heights.length > 0 ? heights : generateHeights();

  return (
    <div className="flex gap-5">
      {Array.from({ length: columns }).map((_, columnIndex) => (
        <div key={columnIndex} className="flex-1 flex flex-col gap-5">
          {Array.from({ length: itemsPerColumn }).map((_, itemIndex) => (
            <SkeletonCard
              key={`${columnIndex}-${itemIndex}`}
              height={skeletonHeights[columnIndex]?.[itemIndex] || 280}
              index={itemIndex}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default HandwritingSkeletonGrid;
