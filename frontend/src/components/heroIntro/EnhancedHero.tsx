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

// 常量配置
const CONSTANTS = {
  HEADER_HEIGHT: 56,
  SCROLL_THRESHOLD: 8,
  ENTRANCE_ANIMATION_DELAY: 200,
  SMOOTH_SCROLL_RESTORE_DELAY: 100,
  CARD_SHADOW: '0 10px 24px rgba(0,0,0,0.10), 0 3px 10px rgba(0,0,0,0.06)',
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
    imageSrc: '/images/hero_page/070_韬奋像_70.jpg',
    imageAlt: '韬奋像',
    path: '/timeline'
  },
  {
    id: 1,
    title: '生活与书',
    description: '在纸与铅字之间，重访生活书店的生长与担当',
    imageSrc: '/images/hero_page/shenghuo_first.jpg',
    imageAlt: '生活书店',
    path: '/bookstore-timeline'
  },
  {
    id: 2,
    title: '笔下风骨',
    description: '从字里行间，见其思虑与炽热',
    imageSrc: '/images/hero_page/shenghuoxinqikan.jpg',
    imageAlt: '生活新期刊',
    path: '/handwriting'
  },
  {
    id: 3,
    title: '同道群像',
    description: '以人观史，勾连一个时代的脉络',
    imageSrc: '/images/hero_page/person_21609_3188023555816154777.jpg',
    imageAlt: '同道群像',
    path: '/relationships'
  }
];

// 样式配置
const TITLE_STYLES = {
  classic: {
    fontSize: 'text-[44px] sm:text-[60px] md:text-[80px] lg:text-[96px]',
    fontWeight: 'font-bold',
    tracking: 'tracking-[-0.02em]',
    lineHeight: '0.98'
  },
  editorial: {
    fontSize: 'text-[52px] sm:text-[72px] md:text-[92px] lg:text-[108px]',
    fontWeight: 'font-extrabold',
    tracking: 'tracking-[-0.035em]',
    lineHeight: '0.94'
  },
  monumental: {
    fontSize: 'text-[56px] sm:text-[72px] md:text-[88px] lg:text-[104px] xl:text-[120px]',
    fontWeight: 'font-black',
    tracking: 'tracking-[-0.03em]',
    lineHeight: '0.92'
  }
} as const;

export default function EnhancedHero() {
  // Hooks
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const secondSectionRef = useRef<HTMLDivElement | null>(null);
  
  // State
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [activeModule, setActiveModule] = useState<number | null>(null);
  const [titleVariant, setTitleVariant] = useState<TitleVariant>('monumental');

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

  useEffect(() => {
    console.log('🔍 [EnhancedHero] scrollY 状态变化:', scrollY);
  }, [scrollY]);

  // 渲染组件
  const YearDivider = useMemo(() => (
    <div className="mb-8">
      <div className="inline-flex items-center gap-3 sm:gap-4">
        <div className="w-10 sm:w-16 md:w-24 h-px bg-black/70" />
        <span className="text-[12px] sm:text-[13px] text-gray-700 font-medium tracking-[0.25em]">
          {CONSTANTS.YEAR_RANGE}
        </span>
        <div className="w-10 sm:w-16 md:w-24 h-px bg-black/70" />
      </div>
    </div>
  ), []);

  const Roles = useMemo(() => (
    <div className="mt-4">
      <h2 className="QYzQ7d flow-root text-[16px] leading-[24px] tracking-[0.1px] text-gray-900 font-medium mb-3 max-h-[24px] overflow-hidden whitespace-nowrap">
        {CONSTANTS.SUBTITLE}
      </h2>
    </div>
  ), []);

  const TitleSection = useMemo(() => {
    const styles = TITLE_STYLES[titleVariant];
    
    if (titleVariant === 'classic') {
      return (
        <>
          {YearDivider}
          <h1
            className={`font-serif text-gray-900 ${styles.fontSize} ${styles.fontWeight} ${styles.tracking}`}
            style={{ lineHeight: styles.lineHeight }}
          >
            邹韬奋
          </h1>
          {Roles}
        </>
      );
    }
    
    if (titleVariant === 'editorial') {
      return (
        <>
          {YearDivider}
          <div className="relative inline-block">
            <h1
              className={`font-serif text-gray-900 ${styles.fontSize} ${styles.fontWeight} ${styles.tracking}`}
              style={{ lineHeight: styles.lineHeight }}
            >
              邹韬奋
            </h1>
            <div className="absolute -bottom-2 left-0 right-0 h-[3px] bg-black/80" />
          </div>
          {Roles}
        </>
      );
    }
    
    // monumental (默认)
    return (
      <>
        {YearDivider}
        <div className="relative mb-12">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-50/30 via-transparent to-blue-50/30 rounded-full blur-3xl transform scale-125" />
          </div>
          <h1
            className={`font-serif leading-none text-gray-900 ${styles.fontSize} ${styles.fontWeight} ${styles.tracking}`}
            style={{ 
              textShadow: '0 4px 8px rgba(0,0,0,0.12), 0 2px 4px rgba(255,255,255,0.95)',
              lineHeight: styles.lineHeight,
              fontWeight: 900
            }}
          >
            邹韬奋
          </h1>
          <div className="mt-6 flex justify-center">
            <div className="w-24 h-1 bg-black rounded-full opacity-90" />
          </div>
        </div>
        {Roles}
      </>
    );
  }, [titleVariant, YearDivider, Roles]);

  const NavigationButtons = useMemo(() => (
    <nav className="hidden md:flex items-center gap-8 text-base">
      {NAVIGATION_ITEMS.map((item) => (
        <button
          key={item.to}
          onClick={() => navigate(item.to)}
          className="relative px-3 py-2 font-medium text-gray-800 hover:text-black transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-black after:w-0 hover:after:w-full after:transition-[width] after:duration-300"
        >
          {item.label}
        </button>
      ))}
    </nav>
  ), [navigate]);

  const ModuleCard = useCallback(({ module }: { module: ModuleItem }) => (
    <div 
      key={module.id}
      className="group relative bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.08]" 
      onClick={() => navigate(module.path)} 
      onMouseEnter={() => setActiveModule(module.id)} 
      onMouseLeave={() => setActiveModule(null)}
      style={{ aspectRatio: '4/3' }}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={module.imageSrc}
          alt={module.imageAlt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full p-8">
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight -translate-x-2.5 group-hover:translate-x-0 transition-transform duration-300">
          {module.title}
        </h3>
        <p className="text-white/90 text-base leading-relaxed mb-4">
          {module.description}
        </p>
      </div>
    </div>
  ), [navigate]);

  const GeometricDecorations = useMemo(() => (
    <div className="absolute inset-0">
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-gold/20 to-gold/5 rounded-full blur-xl" />
      <div className="absolute bottom-32 right-32 w-48 h-48 bg-gradient-to-tl from-heritage-blue/20 to-heritage-blue/5 rounded-full blur-2xl" />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-sage-green/20 to-sage-green/5 rounded-full blur-lg" />
    </div>
  ), []);

  const ScrollCue = useMemo(() => (
    <div className="absolute bottom-4 left-0 right-0 flex justify-center">
      <button
        aria-label="下滑查看更多"
        onClick={scrollToModules}
        className="text-black/60 hover:text-black focus:outline-none animate-subtle-float hover:animate-none"
      >
        <svg width="48" height="48" viewBox="0 0 24 24" style={{ transform: 'matrix3d(1, 0, 0, 0, 0, -1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1)' }}>
          <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"></path>
        </svg>
      </button>
    </div>
  ), [scrollToModules]);

  // 计算头部样式
  const headerClassName = useMemo(() => 
    `AFnmuc fixed top-0 left-0 right-0 z-[4504] transition-colors duration-300 ${
      scrollY > CONSTANTS.SCROLL_THRESHOLD ? 'bg-white/95 border-b border-gray-200' : 'bg-transparent'
    }`, 
    [scrollY]
  );

  const titleAnimationClassName = useMemo(() => 
    `transform transition-all duration-1200 ease-out ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
    }`,
    [isVisible]
  );

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-cream">
        {/* Header */}
        <header
          className={headerClassName}
          style={{ height: `${CONSTANTS.HEADER_HEIGHT}px` }}
        >
          <div className="w-full h-full px-4 md:px-6 flex items-center justify-between text-gray-900">          
            {NavigationButtons}
          </div>
        </header>

        {/* 渐变遮罩层 */}
        <div className="absolute inset-0 opacity-30">
          <HeroPageBackdrop scrollY={scrollY} />
        </div>      

        {/* 几何装饰元素层 */}
        {GeometricDecorations}
        
        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          {/* 主标题系统 */}
          <div className="text-center mb-16 md:mb-20">
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
        className="relative min-h-screen flex flex-col justify-center bg-white"
      >
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {MODULE_ITEMS.map((module) => (
              <ModuleCard key={module.id} module={module} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}