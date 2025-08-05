import React from 'react';
import { BOOKSTORE_FONTS, BOOKSTORE_STYLES } from '../../styles/bookstore';

const BookstoreHeader = () => (
  <div className="relative text-center mb-20 overflow-hidden">
    {/* 装饰性背景元素 */}
    <div className="absolute inset-0 opacity-5">
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-radial from-gold/20 to-transparent rounded-full"></div>
      <div className="absolute top-8 left-1/4 w-2 h-2 bg-gold/30 rounded-full animate-pulse"></div>
      <div className="absolute top-12 right-1/3 w-1 h-1 bg-gold/40 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-4 left-1/3 w-1.5 h-1.5 bg-gold/25 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
    </div>
    
    {/* 主标题区域 */}
    <div className="relative z-10">
      {/* 装饰性顶部线条 */}
      <div className="flex items-center justify-center mb-8">
        <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent w-24"></div>
        <div className="mx-4 w-2 h-2 bg-gold/60 rounded-full"></div>
        <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent w-24"></div>
      </div>
      
      {/* 主标题 */}
      <div className="mb-6">
        <h1 className="text-6xl md:text-7xl font-bold text-charcoal mb-2 tracking-wide leading-tight" 
            style={{ fontFamily: BOOKSTORE_FONTS.fangsong }}>
          <span className="inline-block transform hover:scale-105 transition-transform duration-300">韬</span>
          <span className="inline-block transform hover:scale-105 transition-transform duration-300" style={{transitionDelay: '50ms'}}>奋</span>
          <span className="mx-2 text-gold/60">·</span>
          <span className="inline-block transform hover:scale-105 transition-transform duration-300" style={{transitionDelay: '100ms'}}>时</span>
          <span className="inline-block transform hover:scale-105 transition-transform duration-300" style={{transitionDelay: '150ms'}}>光</span>
          <span className="inline-block transform hover:scale-105 transition-transform duration-300" style={{transitionDelay: '200ms'}}>书</span>
          <span className="inline-block transform hover:scale-105 transition-transform duration-300" style={{transitionDelay: '250ms'}}>影</span>
        </h1>
        
        {/* 英文副标题 */}
        <div className="text-sm text-charcoal/50 tracking-[0.3em] font-light mb-4" 
             style={{ fontFamily: "'Times New Roman', serif" }}>
          TAOFEN BOOKSTORE HERITAGE
        </div>
      </div>
      
      {/* 中文描述 */}
      <div className="max-w-2xl mx-auto">
        <p className="text-xl text-charcoal/80 leading-relaxed mb-4" 
           style={{ fontFamily: BOOKSTORE_FONTS.kai }}>
          探寻生活书店出版文化印记
        </p>
        
        {/* 详细描述 */}
        {/* <p className="text-base text-charcoal/60 leading-relaxed max-w-xl mx-auto" 
           style={{ fontFamily: BOOKSTORE_FONTS.song }}>
          穿越时光长河，重温那些承载着思想与智慧的珍贵典籍，
          感受邹韬奋先生倾注毕生心血的文化事业
        </p> */}
      </div>
      
      {/* 装饰性底部元素 */}
      <div className="flex items-center justify-center mt-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-px bg-gradient-to-r from-transparent to-gold/30"></div>
          <div className="w-1 h-1 bg-gold/50 rounded-full"></div>
          <div className="w-2 h-px bg-gold/40"></div>
          <div className="w-1 h-1 bg-gold/50 rounded-full"></div>
          <div className="w-8 h-px bg-gradient-to-l from-transparent to-gold/30"></div>
        </div>
      </div>
    </div>
    
    {/* 底部渐变分隔 */}
    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent"></div>
  </div>
);

export default BookstoreHeader;
