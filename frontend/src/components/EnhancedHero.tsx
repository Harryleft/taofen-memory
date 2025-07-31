import React, { useEffect, useState } from 'react';
import { ChevronDown, Scroll } from 'lucide-react';
import MasonryBackground from './MasonryBackground';

export default function EnhancedHero() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 300);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContent = () => {
    const nextSection = document.querySelector('#main-content');
    nextSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Masonry Background */}
      <MasonryBackground scrollY={scrollY} />
      
      {/* Multi-layer Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60" />
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/20 to-black/40" />
      
      {/* Noise Texture */}
      <div className="absolute inset-0 bg-noise opacity-10" />
      
      {/* Content Container */}
      <div className="relative z-10 text-center text-white max-w-5xl px-6">
        {/* Main Title */}
        <div 
          className={`transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <h1 className="text-7xl md:text-9xl font-bold mb-6 leading-tight text-shadow-lg">
            <span className="inline-block transform hover:scale-105 transition-transform duration-300">
              邹
            </span>
            <span className="inline-block transform hover:scale-105 transition-transform duration-300 delay-100">
              韬
            </span>
            <span className="inline-block transform hover:scale-105 transition-transform duration-300 delay-200">
              奋
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <div 
          className={`transform transition-all duration-1000 delay-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px bg-gold flex-1 max-w-20" />
            <Scroll className="text-gold" size={24} />
            <div className="h-px bg-gold flex-1 max-w-20" />
          </div>
          
          <p className="text-xl md:text-3xl mb-8 text-cream/95 leading-relaxed font-serif">
            新闻出版家 · 社会活动家 · 进步文化的先驱
          </p>
        </div>

        {/* Description */}
        <div 
          className={`transform transition-all duration-1000 delay-500 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <p className="text-lg md:text-xl mb-12 text-cream/85 max-w-3xl mx-auto leading-relaxed">
            探索一位杰出文化人士的思想历程，感受那个时代的文化脉动与社会变迁。
            在历史的长河中，追寻进步思想的光芒。
          </p>
        </div>

        {/* CTA Buttons */}
        <div 
          className={`transform transition-all duration-1000 delay-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button 
              onClick={scrollToContent}
              className="group bg-gold hover:bg-gold/90 text-cream px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              <span className="flex items-center gap-2">
                开始探索
                <ChevronDown className="group-hover:translate-y-1 transition-transform duration-300" size={20} />
              </span>
            </button>
            <button className="group border-2 border-cream/50 hover:border-cream text-cream hover:bg-cream/10 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105">
              <span className="flex items-center gap-2">
                <Scroll size={20} />
                数字档案
              </span>
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div 
          className={`transform transition-all duration-1000 delay-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <div className="flex flex-col items-center">
            <p className="text-cream/70 text-sm mb-4 font-medium tracking-wide">
              向下滚动探索更多
            </p>
            <div 
              className="animate-bounce cursor-pointer p-2 rounded-full hover:bg-white/10 transition-colors duration-300"
              onClick={scrollToContent}
            >
              <ChevronDown className="text-gold" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 border border-gold/30 rounded-full animate-pulse" />
      <div className="absolute bottom-20 right-20 w-16 h-16 border border-gold/20 rounded-full animate-pulse delay-1000" />
      <div className="absolute top-1/3 right-10 w-12 h-12 border border-gold/25 rounded-full animate-pulse delay-500" />
    </section>
  );
}