/**
 * @file TimelineCircularNavigation.tsx
 * @description 圆形时间导航栏组件，按照时间顺序在左侧展示年份导航
 * @module TimelineCircularNavigation
 */
import React, { useState, useEffect, useRef } from 'react';

interface TimelineYear {
  year: string;
  label: string;
  events: TimelineEvent[];
}

interface TimelineEvent {
  time: string;
  experience: string;
  image: string;
  location: string;
  timespot?: number;
}

interface CircularNavigationProps {
  years: TimelineYear[];
  currentYear: string;
  onYearChange: (year: string) => void;
}

const TimelineCircularNavigation: React.FC<CircularNavigationProps> = ({
  years,
  currentYear,
  onYearChange
}) => {
  const [activeYear, setActiveYear] = useState(currentYear);
  const [isExpanded, setIsExpanded] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // 处理年份点击
  const handleYearClick = (year: string) => {
    setActiveYear(year);
    onYearChange(year);
  };

  // 处理键盘导航
  const handleKeyDown = (e: React.KeyboardEvent, year: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleYearClick(year);
    }
  };

  // 点击外部关闭展开状态
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 计算圆形布局的角度
  const calculateYearPosition = (index: number, total: number) => {
    const angleStep = 360 / total;
    const angle = (index * angleStep - 90) * (Math.PI / 180); // 从顶部开始
    const radius = isExpanded ? 140 : 80; // 展开时半径更大
    
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    };
  };

  return (
    <div 
      ref={navRef}
      className="timeline-circular-nav fixed left-8 top-1/2 transform -translate-y-1/2 z-50"
    >
      {/* 中心控制按钮 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative w-16 h-16 bg-gradient-to-br from-gold to-gold-dark rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        aria-label={isExpanded ? "收起时间导航" : "展开时间导航"}
      >
        <div className="text-white text-center">
          <div className="text-lg font-bold">{activeYear}</div>
          <div className="text-xs opacity-80">导航</div>
        </div>
        
        {/* 展开指示器 */}
        <div className={`absolute inset-0 rounded-full border-2 border-white/30 transition-all duration-300 ${
          isExpanded ? 'scale-110 opacity-0' : 'scale-100 opacity-100'
        }`}></div>
      </button>

      {/* 年份圆形布局 */}
      <div className={`absolute inset-0 transition-all duration-500 ease-out ${
        isExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
      }`}>
        {years.map((yearData, index) => {
          const position = calculateYearPosition(index, years.length);
          const isActive = yearData.year === activeYear;
          
          return (
            <button
              key={yearData.year}
              onClick={() => handleYearClick(yearData.year)}
              onKeyDown={(e) => handleKeyDown(e, yearData.year)}
              className={`absolute w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 ${
                isActive 
                  ? 'bg-accent-primary text-white shadow-lg scale-110' 
                  : 'bg-white/90 text-accent-primary shadow-md hover:bg-white'
              }`}
              style={{
                left: `calc(50% + ${position.x}px - 24px)`,
                top: `calc(50% + ${position.y}px - 24px)`,
                transitionDelay: `${index * 50}ms`
              }}
              aria-label={`跳转到${yearData.year}年`}
              title={`${yearData.year}年 - ${yearData.events.length}个事件`}
            >
              <div className="text-center">
                <div className="font-bold">{yearData.year}</div>
                <div className="text-xs opacity-70">{yearData.events.length}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 年份标签（收起状态显示当前年份） */}
      {!isExpanded && (
        <div className="absolute left-20 top-1/2 transform -translate-y-1/2 bg-white/95 px-4 py-2 rounded-lg shadow-md">
          <div className="text-sm font-medium text-accent-primary">
            {activeYear}年
          </div>
          <div className="text-xs text-text-secondary mt-1">
            {years.find(y => y.year === activeYear)?.events.length || 0} 个事件
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineCircularNavigation;