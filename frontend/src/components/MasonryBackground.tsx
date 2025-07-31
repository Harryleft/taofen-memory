import React, { useEffect, useState } from 'react';

interface MasonryItem {
  id: number;
  src: string;
  height: number;
  title: string;
  year: string;
}

const masonryItems: MasonryItem[] = [
  {
    id: 1,
    src: 'https://images.pexels.com/photos/1070945/pexels-photo-1070945.jpeg?auto=compress&cs=tinysrgb&w=400',
    height: 280,
    title: '生活周刊',
    year: '1925'
  },
  {
    id: 2,
    src: 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=400',
    height: 320,
    title: '大众生活',
    year: '1935'
  },
  {
    id: 3,
    src: 'https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=400',
    height: 240,
    title: '手稿原件',
    year: '1940'
  },
  {
    id: 4,
    src: 'https://images.pexels.com/photos/159832/shanghai-china-city-modern-159832.jpeg?auto=compress&cs=tinysrgb&w=400',
    height: 300,
    title: '上海生活书店',
    year: '1932'
  },
  {
    id: 5,
    src: 'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=400',
    height: 260,
    title: '抗战文献',
    year: '1937'
  },
  {
    id: 6,
    src: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=400',
    height: 340,
    title: '历史照片',
    year: '1930'
  },
  {
    id: 7,
    src: 'https://images.pexels.com/photos/789555/pexels-photo-789555.jpeg?auto=compress&cs=tinysrgb&w=400',
    height: 290,
    title: '新闻报道',
    year: '1928'
  },
  {
    id: 8,
    src: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=400',
    height: 270,
    title: '出版物',
    year: '1933'
  },
  {
    id: 9,
    src: 'https://images.pexels.com/photos/2041540/pexels-photo-2041540.jpeg?auto=compress&cs=tinysrgb&w=400',
    height: 310,
    title: '文学作品',
    year: '1936'
  },
  {
    id: 10,
    src: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=400',
    height: 250,
    title: '社会活动',
    year: '1939'
  },
  {
    id: 11,
    src: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=400',
    height: 330,
    title: '教育理念',
    year: '1934'
  },
  {
    id: 12,
    src: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400',
    height: 280,
    title: '文化传承',
    year: '1941'
  }
];

interface MasonryBackgroundProps {
  scrollY: number;
}

export default function MasonryBackground({ scrollY }: MasonryBackgroundProps) {
  const [columns, setColumns] = useState(4);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) setColumns(2);
      else if (width < 1024) setColumns(3);
      else if (width < 1440) setColumns(4);
      else setColumns(5);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const distributeItems = () => {
    const columnArrays: MasonryItem[][] = Array.from({ length: columns }, () => []);
    const columnHeights = new Array(columns).fill(0);

    masonryItems.forEach((item) => {
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      columnArrays[shortestColumnIndex].push(item);
      columnHeights[shortestColumnIndex] += item.height + 16; // 16px gap
    });

    return columnArrays;
  };

  const columnArrays = distributeItems();

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div 
        className="flex gap-4 h-full"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`, // Parallax effect
        }}
      >
        {columnArrays.map((column, columnIndex) => (
          <div key={columnIndex} className="flex-1 flex flex-col gap-4">
            {column.map((item, itemIndex) => (
              <div
                key={item.id}
                className="relative group overflow-hidden rounded-lg shadow-lg transform transition-all duration-700 hover:scale-105"
                style={{
                  height: `${item.height}px`,
                  animationDelay: `${(columnIndex * 200) + (itemIndex * 100)}ms`,
                }}
              >
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <div className="text-xs font-medium text-gold mb-1">{item.year}</div>
                  <div className="text-sm font-semibold">{item.title}</div>
                </div>
                {/* Floating animation */}
                <div 
                  className="absolute inset-0"
                  style={{
                    animation: `float ${3 + (itemIndex % 3)}s ease-in-out infinite`,
                    animationDelay: `${itemIndex * 0.5}s`,
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}