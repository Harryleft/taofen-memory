/**
 * @file TimelineNavigation.tsx
 * @description 时间轴右侧垂直导航组件 - 简化版本
 * @module TimelineNavigation
 */
import React, { useState, useEffect } from 'react';
import { TimelineData } from '@/hooks/useTimelineData';

interface TimelineNavigationProps {
  years: TimelineYear[];
  currentYear: string;
  onYearChange: (year: string) => void;
}

export function TimelineNavigation({ years, currentYear, onYearChange }: TimelineNavigationProps) {
  const [isVisible, setIsVisible] = useState(false);

  // 监听滚动显示/隐藏导航
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 从TimelineYear数据中提取所有年份
  const allYears = React.useMemo(() => {
    return years.map(yearData => yearData.year).sort();
  }, [years]);

  // 滚动到指定年份
  const scrollToYear = (year: string) => {
    const element = document.querySelector(`[data-year="${year}"]`);
    if (element) {
      const offset = 120;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    onYearChange(year);
  };

  // 滚动到顶部
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 滚动到底部
  const scrollToBottom = () => {
    window.scrollTo({ 
      top: document.documentElement.scrollHeight, 
      behavior: 'smooth' 
    });
  };

  return (
    <div
      className={`fixed right-12 top-1/2 -translate-y-1/2 z-20 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
      }`}
    >
      <div className="flex flex-col items-center">
        {/* 向上箭头 */}
        <button
          onClick={scrollToTop}
          className="w-10 h-10 rounded-full border-2 border-gray-400 bg-white flex items-center justify-center mb-4 hover:border-yellow-600 hover:bg-yellow-600 hover:text-white transition-all duration-200 group shadow-md"
          aria-label="回到顶部"
        >
          <svg 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5"
            className="text-gray-400 group-hover:text-white transition-colors duration-200"
          >
            <path d="M18 15l-6-6-6 6"/>
          </svg>
        </button>

        {/* 虚线连接 */}
        <div 
          className="w-0.5 h-6 mb-4"
          style={{
            borderLeft: '2px dashed #9CA3AF',
            opacity: 0.4
          }}
        />

        {/* 时间节点容器 */}
        <div className="relative">
          {/* 主连接线 */}
          <div 
            className="absolute left-1/2 top-0 w-0.5 h-full -translate-x-0.5"
            style={{
              borderLeft: '2px dashed #9CA3AF',
              opacity: 0.3
            }}
          />

          {/* 时间节点 */}
          <div className="relative space-y-8">
            {allYears.map((year) => {
              const isActive = currentYear === year;

              return (
                <div key={year} className="relative flex items-center justify-center">
                  <button
                    onClick={() => scrollToYear(year)}
                    className={`relative transition-all duration-300 cursor-pointer border-2 border-white rounded-full flex items-center justify-center ${
                      isActive 
                        ? 'w-16 h-16 shadow-lg'
                        : 'w-4 h-4 hover:w-6 hover:h-6 shadow-md'
                    }`}
                    style={{
                      backgroundColor: isActive ? '#D4A574' : '#D4A574',
                      boxShadow: isActive 
                        ? '0 0 20px rgba(212, 165, 116, 0.25), 0 4px 12px rgba(0,0,0,0.15)' 
                        : '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    aria-label={`跳转到${year}年`}
                  >
                    {/* 年份文字（仅在激活时显示） */}
                    {isActive && (
                      <span
                        style={{ 
                          fontSize: '12px',
                          color: 'white'
                        }}
                        className="font-bold"
                      >
                        {year}
                      </span>
                    )}

                    {/* 内部高亮点（非激活状态） */}
                    {!isActive && (
                      <div className="w-1 h-1 rounded-full bg-white opacity-80" />
                    )}
                  </button>

                  {/* 激活状态的脉冲效果 */}
                  {isActive && (
                    <div
                      className="absolute inset-0 rounded-full border-2 animate-pulse"
                      style={{ 
                        borderColor: '#D4A574',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 虚线连接 */}
        <div 
          className="w-0.5 h-6 mt-4"
          style={{
            borderLeft: '2px dashed #9CA3AF',
            opacity: 0.4
          }}
        />

        {/* 向下箭头 */}
        <button
          onClick={scrollToBottom}
          className="w-10 h-10 rounded-full border-2 border-gray-400 bg-white flex items-center justify-center mt-4 hover:border-yellow-600 hover:bg-yellow-600 hover:text-white transition-all duration-200 group shadow-md"
          aria-label="滚动到底部"
        >
          <svg 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5"
            className="text-gray-400 group-hover:text-white transition-colors duration-200"
          >
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>

        {/* 进度指示器 */}
        <div className="mt-6 text-center">
          <div 
            style={{ 
              fontSize: '10px',
              color: '#9CA3AF'
            }}
            className="mb-1"
          >
            {allYears.findIndex(y => y === currentYear) + 1} / {allYears.length}
          </div>
          <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ 
                backgroundColor: '#D4A574',
                width: `${((allYears.findIndex(y => y === currentYear) + 1) / allYears.length) * 100}%`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimelineNavigation;