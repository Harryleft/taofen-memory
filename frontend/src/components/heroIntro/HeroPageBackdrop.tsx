import { useEffect, useState, useRef } from 'react';

interface MasonryItem {
  id: number;
  src: string;
  title: string;
  year: string;
  aspectRatio?: number; // 宽高比，用于自适应高度计算
  calculatedHeight?: number; // 计算后的高度
}

// 使用真实的本地图片数据 - 移除固定高度，改为自适应
const masonryItems: MasonryItem[] = [
  {
    id: 1,
    src: '/images/hero_page/shenghuo_first.jpg',
    title: '生活周刊创刊号',
    year: '1925',
    aspectRatio: 0.7 // 高度/宽度比例
  },
  {
    id: 2,
    src: '/images/hero_page/shenghuoxinqikan.jpg',
    title: '生活新期刊',
    year: '1935',
    aspectRatio: 0.8
  },
  {
    id: 3,
    src: '/images/hero_page/070_韬奋像_70.jpg',
    title: '邹韬奋肖像',
    year: '1940',
    aspectRatio: 1.2
  },
  {
    id: 4,
    src: '/images/hero_page/shenghuodaily.jpg',
    title: '生活日报',
    year: '1932',
    aspectRatio: 0.75
  },
  {
    id: 5,
    src: '/images/hero_page/quanminkangzhan.jpg',
    title: '全民抗战',
    year: '1937',
    aspectRatio: 0.65
  },
  {
    id: 6,
    src: '/images/hero_page/shenhuorbao.jpg',
    title: '生活日报',
    year: '1930',
    aspectRatio: 0.85
  },
  {
    id: 7,
    src: '/images/hero_page/077_韬奋像_77.jpg',
    title: '韬奋先生照片',
    year: '1928',
    aspectRatio: 1.1
  },
  {
    id: 8,
    src: '/images/hero_page/068_韬奋像_68.jpg',
    title: '韬奋工作照',
    year: '1933',
    aspectRatio: 0.9
  },
  {
    id: 9,
    src: '/images/hero_page/074_韬奋像_74.jpg',
    title: '韬奋晚年照片',
    year: '1936',
    aspectRatio: 1.0
  },
  {
    id: 10,
    src: '/images/hero_page/person_21626_-5140615354747636853.jpg',
    title: '社会活动照片',
    year: '1939',
    aspectRatio: 0.6
  },
  {
    id: 11,
    src: '/images/hero_page/person_21609_3188023555816154777.jpg',
    title: '文化活动',
    year: '1934',
    aspectRatio: 0.8
  },
  {
    id: 12,
    src: '/images/hero_page/person_21628_-1981276088998818581.jpg',
    title: '历史文献',
    year: '1941',
    aspectRatio: 0.7
  }
];

interface HeroBackgroundProps {
  scrollY: number;
}

export default function HeroPageBackdrop({ scrollY }: HeroBackgroundProps) {
  const [columns, setColumns] = useState(4);
  const [containerHeight, setContainerHeight] = useState(0);
  const [columnWidth, setColumnWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 确保 scrollY 为有效数值，防止 NaN 或 undefined
  const safeScrollY = typeof scrollY === 'number' && !isNaN(scrollY) ? scrollY : 0;
  
  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // 设置列数
      let newColumns;
      if (width < 640) newColumns = 2;
      else if (width < 1024) newColumns = 3;
      else if (width < 1440) newColumns = 4;
      else newColumns = 5;
      
      setColumns(newColumns);
      setContainerHeight(height * 1.5); // 确保背景高度足够覆盖首屏
      setColumnWidth((width - (newColumns - 1) * 16) / newColumns); // 计算列宽，减去间距
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  const distributeItems = () => {
    const columnArrays: MasonryItem[][] = Array.from({ length: columns }, () => []);
    const columnHeights = new Array(columns).fill(0);

    // 复制并重复图片项目以确保填满屏幕
    const repeatedItems = [...masonryItems, ...masonryItems, ...masonryItems];

    repeatedItems.forEach((item) => {
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      const calculatedHeight = columnWidth * (item.aspectRatio || 0.8); // 根据宽高比计算高度
      
      columnArrays[shortestColumnIndex].push({
        ...item,
        calculatedHeight
      });
      columnHeights[shortestColumnIndex] += calculatedHeight + 16; // 16px gap
      
      // 如果最短列的高度已经超过容器高度，停止添加
      if (Math.min(...columnHeights) > containerHeight) {
        return;
      }
    });

    return columnArrays;
  };

  const columnArrays = distributeItems();

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ height: `${containerHeight}px` }}
    >
      <div 
        className="flex gap-4 h-full"
        style={{
          transform: `translateY(${safeScrollY * 0.5}px)`,
        }}
      >
        {columnArrays.map((column, columnIndex) => (
          <div key={columnIndex} className="flex-1 space-y-4">
            {column.map((item, itemIndex) => {
              const itemWithHeight = item as MasonryItem & { calculatedHeight: number };
              return (
                <div
                  key={`${item.id}-${columnIndex}-${itemIndex}`}
                  className="relative group overflow-hidden rounded-lg shadow-lg transform hover:scale-105 hover:shadow-2xl transition-transform duration-300"
                  style={{
                    height: `${itemWithHeight.calculatedHeight}px`,
                    transform: `translateY(${Math.sin((safeScrollY + itemIndex * 100) * 0.001) * 10}px)`,
                    animationDelay: `${itemIndex * 0.1}s`,
                  }}
                >
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-sm font-medium mb-1">{item.title}</h3>
                    <p className="text-xs opacity-80">{item.year}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}