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
    const scrollToTop = () => {
      const currentScroll = window.pageYOffset;
      if (currentScroll > 0) {
        window.requestAnimationFrame(scrollToTop);
        window.scrollTo(0, currentScroll - currentScroll / 8);
      }
    };
    scrollToTop();
  };

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-20 right-4 z-40
        w-12 h-12 bg-white rounded-full
        shadow-lg flex items-center justify-center
        transition-all duration-300
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}
        ${isScrolling ? 'scale-95' : 'scale-100'}
        hover:bg-gray-50 active:bg-gray-100
        active:scale-95
        md:hidden
      `}
      aria-label="回到顶部"
    >
      <ChevronUp 
        size={24} 
        className="text-gray-600 transition-transform duration-300"
        style={{ transform: isScrolling ? 'translateY(-2px)' : 'translateY(0)' }}
      />
    </button>
  );
};

export default BackToTop;