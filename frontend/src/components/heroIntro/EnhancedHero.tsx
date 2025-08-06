import { useEffect, useState } from 'react';
import { ChevronDown, Scroll, Users, BookOpen, FileText, Network } from 'lucide-react';
import HeroPageBackdrop from './HeroPageBackdrop.tsx';

export default function EnhancedHero() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [activeModule, setActiveModule] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    // Trigger entrance animation with staggered timing
    setTimeout(() => setIsVisible(true), 200);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-cream">
      {/* 背景图案层 - 调整 opacity 值来控制背景图片的显示强度 */}
      {/* opacity-5 = 5%, opacity-10 = 10%, opacity-15 = 15%, opacity-20 = 20% */}
      <div className="absolute inset-0 opacity-50">
        <HeroPageBackdrop scrollY={scrollY} />
      </div>
      
      {/* 几何装饰元素层 - 调整 /数字 来控制颜色透明度 */}
      {/* /5 = 5%, /10 = 10%, /15 = 15%, /20 = 20% */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-gold/15 to-transparent rounded-full blur-xl" />
        <div className="absolute bottom-32 right-32 w-48 h-48 bg-gradient-to-tl from-heritage-blue/15 to-transparent rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-sage-green/15 to-transparent rounded-full blur-lg" />
      </div>
      
      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        {/* Main Title Section */}
        <div className="text-center mb-20">
          <div 
            className={`transform transition-all duration-1200 ease-out mb-8 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}
          >
            
            {/* Main Title */}
            <h1 className="text-7xl md:text-9xl font-bold mb-8 leading-none text-primary-dark font-serif">
              <span className="inline-block transform hover:scale-105 transition-all duration-500 hover:text-gold">
                邹
              </span>
              <span className="inline-block transform hover:scale-105 transition-all duration-500 delay-75 hover:text-gold">
                韬
              </span>
              <span className="inline-block transform hover:scale-105 transition-all duration-500 delay-150 hover:text-gold">
                奋
              </span>
            </h1>
            
            {/* Decorative Line */}
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent flex-1 max-w-32" />
              <div className="w-2 h-2 bg-gold rounded-full" />
              <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent flex-1 max-w-32" />
            </div>
            
            {/* Description */}
            <p className="text-xl md:text-2xl text-primary-medium leading-relaxed font-serif max-w-3xl mx-auto">
              新闻出版家 · 社会活动家 · 进步文化的先驱
            </p>
          </div>
        </div>

        {/* Navigation Modules */}
        <div 
          className={`transform transition-all duration-1200 ease-out delay-400 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* Timeline Module */}
            {/* 导航卡片背景透明度 - 调整 bg-white/数字 来控制卡片背景透明度 */}
            {/* bg-white/60 = 60%, bg-white/70 = 70%, bg-white/80 = 80%, bg-white/90 = 90% */}
            <div 
              className="group relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 hover:bg-white hover:border-gold/30 hover:shadow-xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
              onClick={() => window.location.href = '/timeline'}
              onMouseEnter={() => setActiveModule(0)}
              onMouseLeave={() => setActiveModule(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-heritage-blue/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-gold/20 to-gold/10 rounded-2xl flex items-center justify-center mb-6 group-hover:from-gold/30 group-hover:to-gold/20 transition-all duration-300 flex-shrink-0">
                  <Scroll className="text-gold group-hover:scale-110 transition-transform duration-300" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-gold transition-colors duration-300 font-serif flex-shrink-0">
                  人生大事
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6 text-sm flex-grow">
                  追溯邹韬奋先生的人生轨迹，感受文化先驱的成长历程
                </p>
                <div className="flex items-center text-gold group-hover:text-gold/80 transition-colors duration-300 flex-shrink-0">
                  <span className="text-sm font-medium">探索时间线</span>
                  <ChevronDown className="ml-2 transform rotate-[-90deg] group-hover:translate-x-1 transition-transform duration-300" size={14} />
                </div>
              </div>
            </div>

            {/* Bookstore Module */}
            <div 
              className="group relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 hover:bg-white hover:border-heritage-blue/30 hover:shadow-xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
              onClick={() => window.location.href = '/bookstore-timeline'}
              onMouseEnter={() => setActiveModule(1)}
              onMouseLeave={() => setActiveModule(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-heritage-blue/5 to-gold/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-heritage-blue/20 to-heritage-blue/10 rounded-2xl flex items-center justify-center mb-6 group-hover:from-heritage-blue/30 group-hover:to-heritage-blue/20 transition-all duration-300 flex-shrink-0">
                  <BookOpen className="text-heritage-blue group-hover:scale-110 transition-transform duration-300" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-heritage-blue transition-colors duration-300 font-serif flex-shrink-0">
                  生活书店
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6 text-sm flex-grow">
                  探索生活书店的发展历程，了解进步出版事业的光辉足迹
                </p>
                <div className="flex items-center text-heritage-blue group-hover:text-heritage-blue/80 transition-colors duration-300 flex-shrink-0">
                  <span className="text-sm font-medium">查看出版物</span>
                  <ChevronDown className="ml-2 transform rotate-[-90deg] group-hover:translate-x-1 transition-transform duration-300" size={14} />
                </div>
              </div>
            </div>

            {/* Handwriting Module */}
            <div 
              className="group relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 hover:bg-white hover:border-sage-green/30 hover:shadow-xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
              onClick={() => window.location.href = '/handwriting'}
              onMouseEnter={() => setActiveModule(2)}
              onMouseLeave={() => setActiveModule(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-sage-green/5 to-gold/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-sage-green/20 to-sage-green/10 rounded-2xl flex items-center justify-center mb-6 group-hover:from-sage-green/30 group-hover:to-sage-green/20 transition-all duration-300 flex-shrink-0">
                  <FileText className="text-sage-green group-hover:scale-110 transition-transform duration-300" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-sage-green transition-colors duration-300 font-serif flex-shrink-0">
                  韬奋手迹
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6 text-sm flex-grow">
                  欣赏邹韬奋先生的珍贵手稿，感受文字背后的思想力量
                </p>
                <div className="flex items-center text-sage-green group-hover:text-sage-green/80 transition-colors duration-300 flex-shrink-0">
                  <span className="text-sm font-medium">查看手稿</span>
                  <ChevronDown className="ml-2 transform rotate-[-90deg] group-hover:translate-x-1 transition-transform duration-300" size={14} />
                </div>
              </div>
            </div>

            {/* Relationships Module */}
            <div 
              className="group relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 hover:bg-white hover:border-warm-rose/30 hover:shadow-xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
              onClick={() => window.location.href = '/relationships'}
              onMouseEnter={() => setActiveModule(3)}
              onMouseLeave={() => setActiveModule(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-warm-rose/5 to-heritage-blue/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-warm-rose/20 to-warm-rose/10 rounded-2xl flex items-center justify-center mb-6 group-hover:from-warm-rose/30 group-hover:to-warm-rose/20 transition-all duration-300 flex-shrink-0">
                  <Users className="text-warm-rose group-hover:scale-110 transition-transform duration-300" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-warm-rose transition-colors duration-300 font-serif flex-shrink-0">
                  人脉网络
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6 text-sm flex-grow">
                  探索邹韬奋先生的社会关系网络，了解其人际交往轨迹
                </p>
                <div className="flex items-center text-warm-rose group-hover:text-warm-rose/80 transition-colors duration-300 flex-shrink-0">
                  <span className="text-sm font-medium">查看关系</span>
                  <ChevronDown className="ml-2 transform rotate-[-90deg] group-hover:translate-x-1 transition-transform duration-300" size={14} />
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
