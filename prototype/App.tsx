import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, useLayoutEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ImageWithFallback } from './components/figma/ImageWithFallback';

// 类型定义
type TitleVariant = 'classic' | 'monumental' | 'editorial';

interface NavigationItem {
  label: string;
  to: string;
}

interface ModuleItem {
  id: number;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  path: string;
}

interface HeroPageBackdropProps {
  scrollY: number;
}

interface SiteLogoProps {
  className?: string;
  onClick?: () => void;
}

// 常量配置
const CONSTANTS = {
  HEADER_HEIGHT: 64,
  SCROLL_THRESHOLD: 8,
  ENTRANCE_ANIMATION_DELAY: 300,
  SMOOTH_SCROLL_RESTORE_DELAY: 100,
  YEAR_RANGE: '1895 - 1944',
  SUBTITLE: '沿邹韬奋的生活、事业与遗产，洞见时代精神'
} as const;

const NAVIGATION_ITEMS: NavigationItem[] = [
  { label: '岁月行履', to: '/timeline' },
  { label: '生活与书', to: '/bookstore-timeline' },
  { label: '笔下风骨', to: '/handwriting' },
  { label: '同道群像', to: '/relationships' }
];

const MODULE_ITEMS: ModuleItem[] = [
  {
    id: 0,
    title: '岁月行履',
    description: '循迹韬奋足音，见风云际会与初心不改',
    imageSrc: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
    imageAlt: '韬奋像',
    path: '/timeline'
  },
  {
    id: 1,
    title: '生活与书',
    description: '在纸与铅字之间，重访生活书店的生长与担当',
    imageSrc: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
    imageAlt: '生活书店',
    path: '/bookstore-timeline'
  },
  {
    id: 2,
    title: '笔下风骨',
    description: '从字里行间，见其思虑与炽热',
    imageSrc: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop',
    imageAlt: '生活新期刊',
    path: '/handwriting'
  },
  {
    id: 3,
    title: '同道群像',
    description: '以人观史，勾连一个时代的脉络',
    imageSrc: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    imageAlt: '同道群像',
    path: '/relationships'
  }
];

// 样式配置
const TITLE_STYLES = {
  classic: {
    fontSize: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
    fontWeight: 'font-bold',
    tracking: 'tracking-tight',
    lineHeight: 'leading-[0.95]'
  },
  editorial: {
    fontSize: 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl',
    fontWeight: 'font-black',
    tracking: 'tracking-tighter',
    lineHeight: 'leading-[0.9]'
  },
  monumental: {
    fontSize: 'text-6xl sm:text-7xl md:text-8xl lg:text-9xl',
    fontWeight: 'font-black',
    tracking: 'tracking-tighter',
    lineHeight: 'leading-[0.85]'
  }
} as const;

// HeroPageBackdrop Component
function HeroPageBackdrop({ scrollY }: HeroPageBackdropProps) {
  const transform = useMemo(() => {
    const translateY = scrollY * 0.5;
    const scale = 1 + (scrollY * 0.0002);
    return `translateY(${translateY}px) scale(${scale})`;
  }, [scrollY]);

  const opacity = useMemo(() => {
    return Math.max(0.1, 1 - (scrollY * 0.002));
  }, [scrollY]);

  return (
    <div 
      className="absolute inset-0 overflow-hidden"
      style={{ transform, opacity }}
    >
      {/* Main gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-red-50/40" />
      
      {/* Floating geometric shapes */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-amber-200/30 to-orange-300/20 rounded-full blur-xl animate-pulse" />
      <div className="absolute top-40 right-32 w-48 h-48 bg-gradient-to-tl from-red-200/25 to-pink-300/15 rounded-full blur-2xl" />
      <div className="absolute bottom-32 left-1/4 w-24 h-24 bg-gradient-to-r from-orange-300/20 to-amber-200/15 rounded-full blur-lg" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-white/5 to-white/20" />
    </div>
  );
}

// SiteLogo Component
function SiteLogo({ className = "", onClick }: SiteLogoProps) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 rounded-lg p-1 transition-all duration-300 ${className}`}
    >
      {/* Logo Icon */}
      <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
        <svg 
          className="w-5 h-5 text-white" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 11 5.16-1.261 9-5.45 9-11V7l-10-5z"/>
          <path d="M12 8v8M8 12l8 0" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      </div>
      
      {/* Logo Text */}
      <div className="flex flex-col items-start">
        <span className="font-bold text-xl text-gray-900 group-hover:text-amber-800 transition-colors duration-300">
          韬奋纪念馆
        </span>
        <span className="text-xs text-gray-500 leading-none mt-0.5 group-hover:text-amber-600 transition-colors duration-300">
          ZOU TAOFEN MEMORIAL
        </span>
      </div>
    </button>
  );
}

// Enhanced Hero Component
function EnhancedHero() {
  // Hooks
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const secondSectionRef = useRef<HTMLDivElement | null>(null);
  
  // State
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [activeModule, setActiveModule] = useState<number | null>(null);
  const [titleVariant, setTitleVariant] = useState<TitleVariant>('monumental');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 工具函数
  const scrollToModules = useCallback(() => {
    secondSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  }, []);

  const resetScrollPosition = useCallback(() => {
    const originalScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
    
    setScrollY(0);
    
    setTimeout(() => {
      document.documentElement.style.scrollBehavior = originalScrollBehavior;
    }, CONSTANTS.SMOOTH_SCROLL_RESTORE_DELAY);
  }, []);

  // 性能优化的滚动处理
  const handleScroll = useCallback(() => {
    let ticking = false;
    return () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
  }, []);

  // 处理卡片点击
  const handleCardClick = useCallback((modulePath: string) => {
    navigate(modulePath);
  }, [navigate]);

  // 处理导航
  const handleNavigation = useCallback((path: string) => {
    navigate(path);
    setIsMenuOpen(false); // 关闭移动端菜单
  }, [navigate]);

  const handleLogoClick = useCallback(() => {
    navigate('/');
    setIsMenuOpen(false);
  }, [navigate]);

  // Effects
  useLayoutEffect(() => {
    resetScrollPosition();
    
    const scrollHandler = handleScroll();
    window.addEventListener('scroll', scrollHandler, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', scrollHandler);
    };
  }, [resetScrollPosition, handleScroll]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, CONSTANTS.ENTRANCE_ANIMATION_DELAY);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    const variant = (searchParams.get('variant') || '').toLowerCase() as TitleVariant;
    if (['classic', 'editorial', 'monumental'].includes(variant)) {
      setTitleVariant(variant);
    }
  }, [searchParams]);

  // 阻止菜单打开时的背景滚动
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // 渲染组件
  const YearDivider = useMemo(() => (
    <div className="mb-12">
      <div className="inline-flex items-center gap-6">
        <div className="w-16 md:w-24 h-px bg-gradient-to-r from-transparent via-amber-600/70 to-transparent" />
        <span className="text-sm font-medium tracking-[0.3em] text-amber-800/80 uppercase">
          {CONSTANTS.YEAR_RANGE}
        </span>
        <div className="w-16 md:w-24 h-px bg-gradient-to-r from-transparent via-amber-600/70 to-transparent" />
      </div>
    </div>
  ), []);

  const Subtitle = useMemo(() => (
    <div className="mt-8 max-w-2xl mx-auto">
      <p className="text-lg md:text-xl text-gray-700/90 font-light leading-relaxed tracking-wide">
        {CONSTANTS.SUBTITLE}
      </p>
    </div>
  ), []);

  const TitleSection = useMemo(() => {
    const styles = TITLE_STYLES[titleVariant];
    
    if (titleVariant === 'classic') {
      return (
        <div className="space-y-8">
          {YearDivider}
          <h1
            className={`font-serif text-gray-900 ${styles.fontSize} ${styles.fontWeight} ${styles.tracking} ${styles.lineHeight}`}
          >
            邹韬奋
          </h1>
          {Subtitle}
        </div>
      );
    }
    
    if (titleVariant === 'editorial') {
      return (
        <div className="space-y-8">
          {YearDivider}
          <div className="relative inline-block">
            <h1
              className={`font-serif text-gray-900 ${styles.fontSize} ${styles.fontWeight} ${styles.tracking} ${styles.lineHeight}`}
            >
              邹韬奋
            </h1>
            <div className="absolute -bottom-3 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 rounded-full" />
          </div>
          {Subtitle}
        </div>
      );
    }
    
    // monumental (默认)
    return (
      <div className="space-y-12">
        {YearDivider}
        <div className="relative">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-100/40 via-orange-50/30 to-red-50/20 rounded-full blur-3xl scale-150" />
          </div>
          <h1
            className={`font-serif text-gray-900 ${styles.fontSize} ${styles.fontWeight} ${styles.tracking} ${styles.lineHeight}`}
            style={{ 
              textShadow: '0 8px 32px rgba(251, 191, 36, 0.15), 0 4px 16px rgba(0, 0, 0, 0.1)',
              backgroundImage: 'linear-gradient(135deg, #374151 0%, #1f2937 50%, #111827 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            邹韬奋
          </h1>
          <div className="mt-8 flex justify-center">
            <div className="w-32 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-full shadow-lg" />
          </div>
        </div>
        {Subtitle}
      </div>
    );
  }, [titleVariant, YearDivider, Subtitle]);

  // 桌面端导航按钮
  const DesktopNavigationButtons = useMemo(() => (
    <nav className="hidden md:flex items-center gap-8">
      {NAVIGATION_ITEMS.map((item) => (
        <button
          key={item.to}
          onClick={() => handleNavigation(item.to)}
          className="relative px-4 py-2 font-medium text-gray-700 hover:text-gray-900 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 group"
        >
          <span className="relative z-10">{item.label}</span>
          
          {/* Background hover effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Enhanced underline effect - expands from center */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 group-hover:w-full transition-all duration-300 ease-out" />
        </button>
      ))}
    </nav>
  ), [handleNavigation]);

  // 移动端汉堡菜单按钮
  const MobileMenuButton = useMemo(() => (
    <button
      onClick={() => setIsMenuOpen(!isMenuOpen)}
      className="md:hidden relative w-10 h-10 flex flex-col items-center justify-center space-y-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 rounded-lg transition-all duration-300"
      aria-label="菜单"
    >
      <span
        className={`block w-6 h-0.5 bg-gray-700 transition-all duration-300 ${
          isMenuOpen ? 'rotate-45 translate-y-2' : ''
        }`}
      />
      <span
        className={`block w-6 h-0.5 bg-gray-700 transition-all duration-300 ${
          isMenuOpen ? 'opacity-0' : ''
        }`}
      />
      <span
        className={`block w-6 h-0.5 bg-gray-700 transition-all duration-300 ${
          isMenuOpen ? '-rotate-45 -translate-y-2' : ''
        }`}
      />
    </button>
  ), [isMenuOpen]);

  // 移动端菜单
  const MobileMenu = useMemo(() => (
    <div
      className={`md:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xl transition-all duration-300 ${
        isMenuOpen 
          ? 'transform translate-y-0 opacity-100' 
          : 'transform -translate-y-full opacity-0 pointer-events-none'
      }`}
      style={{ paddingTop: `${CONSTANTS.HEADER_HEIGHT}px` }}
    >
      <nav className="px-6 py-8">
        <div className="space-y-6">
          {NAVIGATION_ITEMS.map((item, index) => (
            <button
              key={item.to}
              onClick={() => handleNavigation(item.to)}
              className="group block w-full text-left py-3 px-4 rounded-lg hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-orange-500/10 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              style={{
                animationDelay: `${index * 50}ms`,
                animation: isMenuOpen ? 'slideInFromRight 0.3s ease-out forwards' : 'none'
              }}
            >
              <span className="text-lg font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                {item.label}
              </span>
              <div className="w-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 group-hover:w-full transition-all duration-300 mt-1" />
            </button>
          ))}
        </div>
      </nav>
    </div>
  ), [isMenuOpen, handleNavigation]);

  const ModuleCard = useCallback(({ module }: { module: ModuleItem }) => {
    return (
      <div className="relative group overflow-visible">
        {/* Title Section - Centered vertically in the card with transparent background */}
        <div className="absolute top-1/2 left-0 right-0 z-30 overflow-visible transform -translate-y-1/2">
          <div className="relative overflow-visible">
            <div className="relative inline-block transform -translate-x-12 group-hover:-translate-x-8 transition-all duration-500 overflow-visible">
              {/* Title text with always transparent background */}
              <div className="relative px-8 py-4 bg-transparent">
                <h3 
                  className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-none tracking-tight whitespace-nowrap transition-colors duration-500"
                  style={{ 
                    textShadow: '2px 2px 8px rgba(0,0,0,0.8), 1px 1px 4px rgba(0,0,0,0.6)',
                    fontFamily: '"Helvetica Neue", Arial, sans-serif'
                  }}
                >
                  {module.title}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div 
          className="relative bg-white shadow-2xl rounded-lg transition-all duration-500 cursor-pointer transform group-hover:scale-[1.02] group-hover:-translate-y-1 overflow-hidden"
          onClick={() => handleCardClick(module.path)} 
          onMouseEnter={() => setActiveModule(module.id)} 
          onMouseLeave={() => setActiveModule(null)}
          style={{ aspectRatio: '4/3' }}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <ImageWithFallback 
              src={module.imageSrc}
              alt={module.imageAlt}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              style={{ filter: 'grayscale(20%) sepia(10%)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 via-transparent to-orange-900/20" />
          </div>
          
          {/* Content */}
          <div className="relative z-10 flex flex-col justify-end h-full p-8">
            <div className="transform transition-all duration-500">
              <p className="text-white/95 text-base md:text-lg leading-relaxed font-light">
                {module.description}
              </p>
            </div>
          </div>

          {/* Click hint overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
        </div>
      </div>
    );
  }, [handleCardClick]);

  const ScrollCue = useMemo(() => (
    <div className="absolute bottom-8 left-0 right-0 flex justify-center">
      <button
        aria-label="下滑查看更多"
        onClick={scrollToModules}
        className="group flex flex-col items-center text-gray-600 hover:text-gray-900 focus:outline-none transition-colors duration-300"
      >
        <span className="text-sm font-medium mb-2 opacity-80 group-hover:opacity-100 transition-opacity">
          探索更多
        </span>
        <div className="w-12 h-12 rounded-full border-2 border-current opacity-70 group-hover:opacity-100 flex items-center justify-center animate-bounce">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </button>
    </div>
  ), [scrollToModules]);

  // 计算头部样式
  const headerClassName = useMemo(() => 
    `fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrollY > CONSTANTS.SCROLL_THRESHOLD || isMenuOpen
        ? 'bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-sm' 
        : 'bg-transparent'
    }`, 
    [scrollY, isMenuOpen]
  );

  const titleAnimationClassName = useMemo(() => 
    `transform transition-all duration-1000 ease-out ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
    }`,
    [isVisible]
  );

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-orange-50/50 to-amber-50">
        {/* Header */}
        <header
          className={headerClassName}
          style={{ height: `${CONSTANTS.HEADER_HEIGHT}px` }}
        >
          <div className="w-full h-full px-4 md:px-8 flex items-center justify-between">
            <SiteLogo onClick={handleLogoClick} />          
            {DesktopNavigationButtons}
            {MobileMenuButton}
          </div>
        </header>

        {/* Mobile Menu */}
        {MobileMenu}

        {/* 渐变遮罩层 */}
        <div className="absolute inset-0 opacity-40">
          <HeroPageBackdrop scrollY={scrollY} />
        </div>      

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
          {/* 主标题系统 */}
          <div className="text-center mb-20 md:mb-32">
            <div className={titleAnimationClassName}>
              {TitleSection}
            </div>
          </div>

          {/* Scroll Cue */}
          {ScrollCue}
        </div>
      </section>

      {/* Modules Section */}
      <section 
        ref={secondSectionRef} 
        className="relative min-h-screen flex flex-col justify-center bg-gradient-to-b from-white to-gray-50 overflow-visible"
      >
        <div className="max-w-7xl mx-auto px-6 py-20 overflow-visible">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              探索历史足迹
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              通过不同的视角，深入了解邹韬奋的人生历程与时代贡献
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-20 max-w-6xl mx-auto overflow-visible">
            {MODULE_ITEMS.map((module) => (
              <ModuleCard key={module.id} module={module} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// Placeholder components for the different routes
function TimelinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">岁月行履</h1>
        <p className="text-lg text-gray-600">循迹韬奋足音，见风云际会与初心不改</p>
        <button 
          onClick={() => window.history.back()}
          className="mt-6 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          返回首页
        </button>
      </div>
    </div>
  );
}

function BookstoreTimelinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">生活与书</h1>
        <p className="text-lg text-gray-600">在纸与铅字之间，重访生活书店的生长与担当</p>
        <button 
          onClick={() => window.history.back()}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          返回首页
        </button>
      </div>
    </div>
  );
}

function HandwritingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">笔下风骨</h1>
        <p className="text-lg text-gray-600">从字里行间，见其思虑与炽热</p>
        <button 
          onClick={() => window.history.back()}
          className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          返回首页
        </button>
      </div>
    </div>
  );
}

function RelationshipsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">同道群像</h1>
        <p className="text-lg text-gray-600">以人观史，勾连一个时代的脉络</p>
        <button 
          onClick={() => window.history.back()}
          className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          返回首页
        </button>
      </div>
    </div>
  );
}

// Main App Component
export default function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          {/* Main routes */}
          <Route path="/" element={<EnhancedHero />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/bookstore-timeline" element={<BookstoreTimelinePage />} />
          <Route path="/handwriting" element={<HandwritingPage />} />
          <Route path="/relationships" element={<RelationshipsPage />} />
          
          {/* Handle preview page route - redirect to home */}
          <Route path="/preview_page.html" element={<Navigate to="/" replace />} />
          
          {/* Catch all other routes and redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}