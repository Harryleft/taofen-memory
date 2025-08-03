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
      <div className="relative z-10 text-center text-white max-w-7xl px-6">
        {/* Main Title */}
        <div 
          className={`transform transition-all duration-1000 mb-16 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight text-shadow-lg">
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
          
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px bg-gold flex-1 max-w-20" />
            <Scroll className="text-gold" size={24} />
            <div className="h-px bg-gold flex-1 max-w-20" />
          </div>
          
          <p className="text-xl md:text-2xl text-cream/95 leading-relaxed font-serif">
            新闻出版家 · 社会活动家 · 进步文化的先驱
          </p>
        </div>

        {/* Narrative Modules Grid */}
        <div 
          className={`transform transition-all duration-1000 delay-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Timeline Module */}
            <div 
              className="group relative bg-black/40 backdrop-blur-sm border border-gold/30 rounded-xl p-6 hover:bg-black/60 hover:border-gold/60 transition-all duration-500 cursor-pointer transform hover:scale-105 hover:shadow-2xl"
              onClick={() => window.location.href = '/timeline'}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-gold/30 transition-colors duration-300">
                  <Scroll className="text-gold" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-cream mb-3 group-hover:text-gold transition-colors duration-300">
                  人生大事
                </h3>
                <p className="text-cream/80 leading-relaxed mb-4">
                  追溯邹韬奋先生的人生轨迹，感受一位文化先驱的成长历程与时代担当
                </p>
                <div className="flex items-center text-gold/80 group-hover:text-gold transition-colors duration-300">
                  <span className="text-sm font-medium">探索时间线</span>
                  <ChevronDown className="ml-2 transform rotate-[-90deg] group-hover:translate-x-1 transition-transform duration-300" size={16} />
                </div>
              </div>
            </div>

            {/* Bookstore Module */}
            <div 
              className="group relative bg-black/40 backdrop-blur-sm border border-gold/30 rounded-xl p-6 hover:bg-black/60 hover:border-gold/60 transition-all duration-500 cursor-pointer transform hover:scale-105 hover:shadow-2xl"
              onClick={() => window.location.href = '/bookstore-timeline'}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-gold/30 transition-colors duration-300">
                  <svg className="w-6 h-6 text-gold" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-cream mb-3 group-hover:text-gold transition-colors duration-300">
                  生活书店
                </h3>
                <p className="text-cream/80 leading-relaxed mb-4">
                  探索生活书店的发展历程，了解进步出版事业的光辉足迹
                </p>
                <div className="flex items-center text-gold/80 group-hover:text-gold transition-colors duration-300">
                  <span className="text-sm font-medium">查看出版物</span>
                  <ChevronDown className="ml-2 transform rotate-[-90deg] group-hover:translate-x-1 transition-transform duration-300" size={16} />
                </div>
              </div>
            </div>

            {/* Handwriting Module */}
            <div 
              className="group relative bg-black/40 backdrop-blur-sm border border-gold/30 rounded-xl p-6 hover:bg-black/60 hover:border-gold/60 transition-all duration-500 cursor-pointer transform hover:scale-105 hover:shadow-2xl"
              onClick={() => window.location.href = '/handwriting'}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-gold/30 transition-colors duration-300">
                  <svg className="w-6 h-6 text-gold" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-cream mb-3 group-hover:text-gold transition-colors duration-300">
                  韬奋手迹
                </h3>
                <p className="text-cream/80 leading-relaxed mb-4">
                  欣赏邹韬奋先生的珍贵手稿，感受文字背后的思想力量
                </p>
                <div className="flex items-center text-gold/80 group-hover:text-gold transition-colors duration-300">
                  <span className="text-sm font-medium">查看手稿</span>
                  <ChevronDown className="ml-2 transform rotate-[-90deg] group-hover:translate-x-1 transition-transform duration-300" size={16} />
                </div>
              </div>
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