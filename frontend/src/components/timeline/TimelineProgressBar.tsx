/**
 * @file TimelineProgressBar.tsx
 * @description 一个响应页面滚动位置的进度条组件，通常用于指示用户在时间轴页面上的浏览进度。
 * @module TimelineProgressBar
 */
import React, { useState, useEffect } from 'react';

/**
 * TimelineProgressBar 组件
 * @description 监听窗口滚动事件，并根据滚动百分比更新进度条的宽度。
 * @returns {JSX.Element} 渲染的进度条元素。
 */
const TimelineProgressBar: React.FC = () => {
    // 状态：存储当前的滚动进度百分比
  const [scrollProgress, setScrollProgress] = useState(0);

    // Effect Hook: 组件挂载时添加滚动事件监听器，卸载时移除
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="timeline-progress">
      <div
        className="timeline-progress-bar"
        style={{ width: `${scrollProgress}%` }}
      ></div>
    </div>
  );
};

export default TimelineProgressBar;
