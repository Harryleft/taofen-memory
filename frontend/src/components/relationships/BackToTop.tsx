import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // 显示/隐藏按钮
      setIsVisible(scrollTop > 300);

      // 检测滚动状态
      setIsScrolling(true);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const scrollToTop = () => {
    const startScroll = window.pageYOffset;
    const startTime = performance.now();
    const duration = 800; // 动画持续时间
    
    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用缓动函数
      const easeInOutCubic = (t: number) => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };
      
      const currentScroll = startScroll * (1 - easeInOutCubic(progress));
      window.scrollTo(0, currentScroll);
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };
    
    requestAnimationFrame(animateScroll);
  };

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-20 right-4 z-40
        w-14 h-14 bg-white rounded-full
        shadow-lg flex items-center justify-center
        transition-all duration-300
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}
        ${isScrolling ? 'scale-95' : 'scale-100'}
        hover:bg-gray-50 active:bg-gray-100
        active:scale-95
        md:hidden
        /* 移动端优化 */
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
        min-height: 56px; /* iOS推荐的最小触摸目标 */
        min-width: 56px;
      `}
      aria-label="回到顶部"
      // 移动端触摸反馈
      onTouchStart={(e) => {
        const button = e.currentTarget;
        button.style.transform = 'scale(0.95)';
        button.style.transition = 'transform 0.1s ease';
      }}
      onTouchEnd={(e) => {
        const button = e.currentTarget;
        button.style.transform = '';
        button.style.transition = 'transform 0.3s ease';
      }}
    >
      <ChevronUp 
        size={28} 
        className="text-gray-600 transition-transform duration-300"
        style={{ transform: isScrolling ? 'translateY(-2px)' : 'translateY(0)' }}
      />
      {/* 移动端添加进度指示器 */}
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gray-400 opacity-20 animate-spin pointer-events-none" 
           style={{
             animationDuration: '2s',
             animationPlayState: isScrolling ? 'running' : 'paused'
           }}>
      </div>
    </button>
  );
};

export default BackToTop;