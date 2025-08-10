import { useEffect, useState, useLayoutEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import HeroPageBackdrop from './HeroPageBackdrop.tsx';

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

// 统一颜色主题配置
const THEME = {
  colors: {
    primary: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f'
    },
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    },
    white: '#ffffff',
    black: '#000000'
  },
  gradients: {
    primary: 'from-amber-500 to-amber-600',
    primarySubtle: 'from-amber-500/10 to-amber-500/10',
    bgHero: 'from-slate-50 via-amber-50/30 to-amber-50',
    bgModules: 'from-white to-amber-50/20'
  }
} as const;

// 动画配置
const ANIMATION = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    extraSlow: '700ms'
  },
  easing: {
    easeOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
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
    imageSrc: '/images/hero_page/068_韬奋像_68.jpg',
    imageAlt: '韬奋像',
    path: '/timeline'
  },
  {
    id: 1,
    title: '时光书影',
    description: '在纸与铅字之间，重访生活书店的生长与担当',
    imageSrc: '/images/hero_page/shsdts.jpg',
    imageAlt: '生活书店',
    path: '/bookstore-timeline'
  },
  {
    id: 2,
    title: '笔下风骨',
    description: '从字里行间，见其思虑与炽热',
    imageSrc: '/images/hero_page/001.jpg',
    imageAlt: '生活期刊', 
    path: '/handwriting'
  },
  {
    id: 3,
    title: '同行群像',
    description: '以人观史，勾连一个时代的脉络',
    imageSrc: '/images/hero_page/30.jpg',
    imageAlt: '同行群像',
    path: '/relationships'
  }
];

// 优化的标题样式配置
const TITLE_STYLES = {
  classic: {
    fontSize: 'text-[40px] sm:text-[52px] md:text-[68px] lg:text-[84px] xl:text-[96px]',
    fontWeight: 'font-bold',
    tracking: 'tracking-[-0.02em]',
    lineHeight: '1.05'
  },
  editorial: {
    fontSize: 'text-[44px] sm:text-[60px] md:text-[76px] lg:text-[92px] xl:text-[104px]',
    fontWeight: 'font-extrabold',
    tracking: 'tracking-[-0.025em]',
    lineHeight: '1.02'
  },
  monumental: {
    fontSize: 'text-[48px] sm:text-[64px] md:text-[80px] lg:text-[96px] xl:text-[112px]',
    fontWeight: 'font-black',
    tracking: 'tracking-[-0.03em]',
    lineHeight: '0.98'
  }
} as const;

// SiteLogo Component
function SiteLogo({ className = "", onClick }: SiteLogoProps) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 rounded-lg p-1 transition-all duration-[${ANIMATION.duration.normal}] ${className}`}
      aria-label="韬奋纪念馆首页"
    >
      {/* Logo Icon - 灰黑书页 + 琥珀书签（与当前灰黑/金色体系协调） */}
      <div
          className="w-9 h-9 rounded-lg bg-gray-900 text-white ring-1 ring-amber-400/20 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-[${ANIMATION.duration.normal}] transform">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor"
             viewBox="0 0 24 24">
          <rect x="3" y="6" width="18" height="12" rx="2" strokeWidth="1.5"/>
          <rect x="6" y="3" width="12" height="8" rx="1" strokeWidth="1.5"
                fill="currentColor" fillOpacity="0.2"/>
          <circle cx="8" cy="12" r="1" fill="currentColor"/>
          <circle cx="12" cy="12" r="1" fill="currentColor"/>
          <circle cx="16" cy="12" r="1" fill="currentColor"/>
          <circle cx="10" cy="15" r="1" fill="currentColor"/>
          <circle cx="14" cy="15" r="1" fill="currentColor"/>
        </svg>
      </div>

      {/* Logo Text */}
      <div className="flex flex-col items-start">
        <span
            className={`font-bold text-xl text-gray-900 transition-all duration-[${ANIMATION.duration.normal}] group-hover:shadow-sm`}>
          韬奋 · 纪念
        </span>
        <span
            className={`text-xs text-gray-500 leading-none mt-0.5 transition-all duration-[${ANIMATION.duration.normal}] font-medium tracking-wide group-hover:shadow-sm`}>
          TAOFEN MEMORIAL
        </span>
      </div>
    </button>
  );
}

export default function EnhancedHero() {
  // Hooks
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const secondSectionRef = useRef<HTMLDivElement | null>(null);

  // State
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [, setActiveModule] = useState<number | null>(null);
  const [titleVariant, setTitleVariant] = useState<TitleVariant>('monumental');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 工具函数
  const scrollToModules = useCallback(() => {
    secondSectionRef.current?.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start'
    });
  }, [reducedMotion]);

  const resetScrollPosition = useCallback(() => {
    const originalScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';

    // 多重保险重置滚动位置
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

  // Effects
  useLayoutEffect(() => {
    resetScrollPosition();

    const scrollHandler = handleScroll();

    window.addEventListener('scroll', scrollHandler, { passive: true });

    // reduced-motion
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    const motionListener = () => setReducedMotion(m.matches);
    motionListener();
    m.addEventListener?.('change', motionListener);

    return () => {
      window.removeEventListener('scroll', scrollHandler);
      m.removeEventListener?.('change', motionListener);
    };
  }, [resetScrollPosition, handleScroll]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), CONSTANTS.ENTRANCE_ANIMATION_DELAY);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const variant = (searchParams.get('variant') || '').toLowerCase() as TitleVariant;
    if (['classic', 'editorial', 'monumental'].includes(variant)) {
      setTitleVariant(variant);
    }
  }, [searchParams]);

  // 处理导航
  const handleNavigation = useCallback((path: string) => {
    navigate(path);
    setIsMenuOpen(false); // 关闭移动端菜单
  }, [navigate]);

  const handleLogoClick = useCallback(() => {
    navigate('/');
    setIsMenuOpen(false);
  }, [navigate]);

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
        <div className="w-16 md:w-24 h-px bg-gradient-to-r from-transparent via-black/70 to-transparent" />
        <span className="text-sm font-medium tracking-[0.3em] text-black/80 uppercase">
          {CONSTANTS.YEAR_RANGE}
        </span>
        <div className="w-16 md:w-24 h-px bg-gradient-to-r from-transparent via-black/70 to-transparent" />
      </div>
    </div>
  ), []);

  const Subtitle = useMemo(() => (
    <div className="mt-8 max-w-2xl mx-auto">
      <p className="text-lg md:text-xl text-gray-800 font-light leading-relaxed tracking-wide">
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
            <div className={`absolute -bottom-3 left-0 right-0 h-1 bg-gradient-to-r from-black/80 to-black/60 rounded-full`} />
          </div>
          {Subtitle}
        </div>
      );
    }

    // monumental (默认)
    return (
      <div className="space-y-8">
        {YearDivider}
        <div className="relative">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-100/30 via-gray-50/20 to-gray-100/10 rounded-full blur-3xl scale-150" />
          </div>
          <h1
            className={`font-serif text-gray-900 ${styles.fontSize} ${styles.fontWeight} ${styles.tracking} ${styles.lineHeight}`}
            style={{
              textShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08)',
              backgroundImage: 'linear-gradient(135deg, #374151 0%, #1f2937 50%, #111827 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            邹韬奋
          </h1>
          <div className="mt-8 flex justify-center">
            <div className={`w-32 h-1 bg-gradient-to-r from-black/80 to-black/60 rounded-full shadow-lg`} />
          </div>
        </div>
        {Subtitle}
      </div>
    );
  }, [titleVariant, YearDivider, Subtitle]);

  // 桌面端导航按钮
  const DesktopNavigationButtons = useMemo(() => (
    <nav className="hidden md:flex items-center gap-8" aria-label="主导航">
      {NAVIGATION_ITEMS.map((item) => (
        <button
          key={item.to}
          onClick={() => handleNavigation(item.to)}
          className={`relative px-4 py-2 font-medium text-gray-700 hover:text-gray-900 transition-all duration-[${ANIMATION.duration.normal}] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 group`}
        >
          <span className="relative z-10 group-hover:shadow-sm">{item.label}</span>

          {/* Background hover effect */}
          <div className={`absolute inset-0 bg-gradient-to-r ${THEME.gradients.primarySubtle} rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-[${ANIMATION.duration.normal}]`} />

          {/* Enhanced underline effect - expands from center */}
          <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r ${THEME.gradients.primary} group-hover:w-full transition-all duration-[${ANIMATION.duration.normal}] ${ANIMATION.easing.easeOut}`} />
        </button>
      ))}
    </nav>
  ), [handleNavigation]);

  // 移动端汉堡菜单按钮
  const MobileMenuButton = useMemo(() => (
    <button
      onClick={() => setIsMenuOpen(!isMenuOpen)}
      className={`md:hidden relative w-10 h-10 flex flex-col items-center justify-center space-y-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 rounded-lg transition-all duration-[${ANIMATION.duration.normal}] hover:bg-gray-50 hover:shadow-sm`}
      aria-label="菜单"
      aria-expanded={isMenuOpen}
      aria-controls="mobile-menu"
    >
      <span
        className={`block w-6 h-0.5 bg-gray-700 transition-all duration-[${ANIMATION.duration.normal}] ${
          isMenuOpen ? 'rotate-45 translate-y-2' : ''
        }`}
      />
      <span
        className={`block w-6 h-0.5 bg-gray-700 transition-all duration-[${ANIMATION.duration.normal}] ${
          isMenuOpen ? 'opacity-0' : ''
        }`}
      />
      <span
        className={`block w-6 h-0.5 bg-gray-700 transition-all duration-[${ANIMATION.duration.normal}] ${
          isMenuOpen ? '-rotate-45 -translate-y-2' : ''
        }`}
      />
    </button>
  ), [isMenuOpen]);

  // 移动端菜单
  const MobileMenu = useMemo(() => (
    <div
      id="mobile-menu"
      className={`md:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xl transition-all duration-[${ANIMATION.duration.normal}] ${
        isMenuOpen 
          ? 'transform translate-y-0 opacity-100' 
          : 'transform -translate-y-full opacity-0 pointer-events-none'
      }`}
      style={{ paddingTop: `${CONSTANTS.HEADER_HEIGHT}px` }}
    >
      <nav className="px-6 py-8" aria-label="移动端导航">
        <div className="space-y-6">
          {NAVIGATION_ITEMS.map((item, index) => (
            <button
              key={item.to}
              onClick={() => handleNavigation(item.to)}
              className={`group block w-full text-left py-3 px-4 rounded-lg hover:bg-gradient-to-r ${THEME.gradients.primarySubtle} transition-all duration-[${ANIMATION.duration.normal}] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500`}
              style={{
                animationDelay: `${index * 50}ms`,
                animation: isMenuOpen ? 'slideInFromRight 0.3s ease-out forwards' : 'none'
              }}
            >
              <span className={`text-lg font-medium text-gray-700 group-hover:text-gray-900 group-hover:shadow-sm transition-colors duration-[${ANIMATION.duration.fast}]`}>
                {item.label}
              </span>
              <div className={`w-0 h-0.5 bg-gradient-to-r ${THEME.gradients.primary} group-hover:w-full transition-all duration-[${ANIMATION.duration.normal}] mt-1`} />
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
            <div className={`relative inline-block transform -translate-x-5 group-hover:-translate-x-1 transition-all duration-[${ANIMATION.duration.slow}] overflow-visible`}>
              {/* Title text with always transparent background */}
              <div className="relative px-18 py-4 bg-transparent">
                <h3
                  className={`text-2xl md:text-3xl lg:text-4xl font-black text-white leading-none tracking-tight whitespace-nowrap transition-colors duration-[${ANIMATION.duration.slow}]`}
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
          className={`relative bg-white shadow-2xl rounded-lg transition-all duration-[${ANIMATION.duration.slow}] cursor-pointer transform group-hover:scale-[1.08] group-hover:-translate-y-1.5 overflow-hidden`}
          onClick={() => navigate(module.path)}
          onMouseEnter={() => setActiveModule(module.id)}
          onMouseLeave={() => setActiveModule(null)}
          style={{ aspectRatio: '3/2' }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate(module.path);
            }
          }}
          aria-label={`查看${module.title}详情`}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={module.imageSrc}
              alt={module.imageAlt}
              className={`w-full h-full object-cover transition-transform duration-[${ANIMATION.duration.extraSlow}] group-hover:scale-105`}
              style={{ filter: 'grayscale(20%) sepia(10%)' }}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/15 via-transparent to-gray-900/10" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-end h-full p-8">
            <div className={`transform transition-all duration-[${ANIMATION.duration.slow}]`}>
              <p className="text-white/95 text-base md:text-lg leading-relaxed font-light">
                {module.description}
              </p>
            </div>
          </div>

          {/* Click hint overlay */}
          <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-[${ANIMATION.duration.normal}] pointer-events-none`} />
        </div>
      </div>
    );
  }, [navigate, setActiveModule]);

  const ScrollCue = useMemo(() => (
    <div className="absolute bottom-8 left-0 right-0 flex justify-center">
      <button
        aria-label="下滑查看更多"
        onClick={scrollToModules}
        className={`group flex flex-col items-center text-gray-600 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 rounded-lg transition-colors duration-[${ANIMATION.duration.normal}] p-2`}
      >
        <div className="w-12 h-12 rounded-full border-2 border-current opacity-70 group-hover:opacity-100 flex items-center justify-center animate-bounce">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </button>
    </div>
  ), [scrollToModules]);

  // 计算头部样式
  const headerClassName = useMemo(() =>
    `fixed top-0 left-0 right-0 z-50 transition-all duration-[${ANIMATION.duration.slow}] ${
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
      {/* 跳过到主内容（键盘可见） */}
      <a
        href="#modules"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] bg-black text-white px-3 py-2 rounded"
      >
        跳到主要内容
      </a>

      {/* Hero Section */}
      <section className={`relative min-h-screen flex flex-col justify-center overflow-hidden bg-gradient-to-br ${THEME.gradients.bgHero}`}>
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
        className={`relative min-h-screen flex flex-col justify-center bg-gradient-to-b ${THEME.gradients.bgModules} overflow-visible`}
        id="modules"
        aria-label="模块展示区域"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-20 max-w-6xl mx-auto overflow-visible -ml-2.5">
            {MODULE_ITEMS.map((module) => (
              <ModuleCard key={module.id} module={module} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
