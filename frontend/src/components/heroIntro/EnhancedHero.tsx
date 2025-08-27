import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import HeroPageBackdrop from './HeroPageBackdrop.tsx';
import { CONFIG } from '@/constants/config';
import PersonDescription from '@/components/PersonDescription.tsx';

// ====== 类型定义 ======
type TitleVariant = 'classic' | 'monumental' | 'editorial';

interface ModuleItem {
  id: number;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  path: string;
}

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
    bgHero: 'from-[#FAF7F2] via-amber-50/30 to-[#FAF7F2]',
    bgModules: 'from-[#FAF7F2] to-amber-50/20'
  }
} as const;

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

// ====== 数据配置 ======

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
    path: '/bookstore'
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

// ====== 样式配置 ======
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

// ====== 工具函数 ======
const createGradientClasses = (gradient: string, opacity?: string) =>
  `bg-gradient-to-r ${gradient}${opacity ? `/${opacity}` : ''}`;

// ====== 子组件 ======

// ====== Custom Hooks ======
function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const motionListener = () => setReducedMotion(mediaQuery.matches);
    motionListener();
    mediaQuery.addEventListener?.('change', motionListener);

    return () => mediaQuery.removeEventListener?.('change', motionListener);
  }, []);

  return reducedMotion;
}

// ====== 主组件 ======
export default function EnhancedHero() {
  // ====== Hooks ======
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const secondSectionRef = useRef<HTMLDivElement | null>(null);

  // Custom hooks
  const reducedMotion = useReducedMotion();

  // ====== State ======
  const [isVisible, setIsVisible] = useState(false);
  const [, setActiveModule] = useState<number | null>(null);
  const [titleVariant, setTitleVariant] = useState<TitleVariant>('monumental');

  // ====== 事件处理 ======
  const scrollToModules = useCallback(() => {
    secondSectionRef.current?.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start'
    });
  }, [reducedMotion]);

  const handleModuleClick = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const handleModuleKeyDown = useCallback((e: React.KeyboardEvent, path: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(path);
    }
  }, [navigate]);

  // ====== Effects ======
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), CONFIG.ANIMATION.DELAY.ENTRANCE);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const variant = (searchParams.get('variant') || '').toLowerCase() as TitleVariant;
    if (['classic', 'editorial', 'monumental'].includes(variant)) {
      setTitleVariant(variant);
    }
  }, [searchParams]);

  // ====== 渲染辅助组件 ======
  const YearDivider = useMemo(() => (
    <div className="mb-12">
      <div className="inline-flex items-center gap-6">
        <div className="w-16 md:w-24 h-px bg-gradient-to-r from-transparent via-black/70 to-transparent" />
        <span className="text-sm font-medium tracking-[0.3em] text-black/80 uppercase">
          {CONFIG.META.YEAR_RANGE}
        </span>
        <div className="w-16 md:w-24 h-px bg-gradient-to-r from-transparent via-black/70 to-transparent" />
      </div>
    </div>
  ), []);

  const Subtitle = useMemo(() => (
    <div className="mt-8 max-w-2xl mx-auto">
      <p className="text-lg md:text-xl text-gray-800 font-light leading-relaxed tracking-wide">
        {CONFIG.META.SUBTITLE}
      </p>
    </div>
  ), []);

  const TitleSection = useMemo(() => {
    const styles = TITLE_STYLES[titleVariant];
    const baseClasses = `font-serif text-gray-900 ${styles.fontSize} ${styles.fontWeight} ${styles.tracking}`;

    const titleConfigs = {
      classic: () => (
        <div className="space-y-8">
          {YearDivider}
          <h1 className={`${baseClasses} ${styles.lineHeight}`}>邹韬奋</h1>
          {Subtitle}
        </div>
      ),
      editorial: () => (
        <div className="space-y-8">
          {YearDivider}
          <div className="relative inline-block">
            <h1 className={`${baseClasses} ${styles.lineHeight}`}>邹韬奋</h1>
            <div className="absolute -bottom-3 left-0 right-0 h-1 bg-gradient-to-r from-black/80 to-black/60 rounded-full" />
          </div>
          {Subtitle}
        </div>
      ),
      monumental: () => (
        <div className="space-y-8">
          {YearDivider}
          <div className="relative">
            <div className="absolute inset-0 -z-10">
              <div className="absolute inset-0 bg-gradient-to-b from-gray-100/30 via-gray-50/20 to-gray-100/10 rounded-full blur-3xl scale-150" />
            </div>
            <h1
              className={`${baseClasses} ${styles.lineHeight}`}
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
            <div className="mt-4 flex justify-center">
              <div className="w-32 h-1 bg-gradient-to-r from-black/80 to-black/60 rounded-full shadow-lg" />
            </div>
          </div>
          {Subtitle}
        </div>
      )
    };

    return titleConfigs[titleVariant]();
  }, [titleVariant, YearDivider, Subtitle]);

  const ModuleCard = useCallback(({ module }: { module: ModuleItem }) => (
    <div className="relative group overflow-visible">
      {/* Title Overlay */}
      <div className="absolute top-1/2 left-0 right-0 z-30 overflow-visible transform -translate-y-1/2">
        <div className="relative overflow-visible">
          <div className={`relative inline-block transform -translate-x-5 group-hover:-translate-x-1 transition-all duration-[${ANIMATION.duration.slow}] overflow-visible`}>
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
        onClick={() => handleModuleClick(module.path)}
        onMouseEnter={() => setActiveModule(module.id)}
        onMouseLeave={() => setActiveModule(null)}
        style={{ aspectRatio: '3/2' }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => handleModuleKeyDown(e, module.path)}
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
            <PersonDescription 
              description={module.description}
              maxLength={120}
              className="text-white/95 text-base md:text-lg leading-relaxed font-light"
              compact={false}
            />
          </div>
        </div>

        {/* Hover Overlay */}
        <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-[${ANIMATION.duration.normal}] pointer-events-none`} />
      </div>
    </div>
  ), [handleModuleClick, handleModuleKeyDown, setActiveModule]);

  const ScrollCue = useMemo(() => (
    <div className="absolute bottom-8 left-0 right-0 flex justify-center">
      <button
        aria-label="下滑查看更多"
        onClick={scrollToModules}
        className={`group flex flex-col items-center text-gray-600 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 rounded-lg transition-colors duration-[${ANIMATION.duration.normal}] p-2`}
      >
        <div className="flex items-center justify-center animate-bounce">
          <svg className="w-8 h-8" fill="none" stroke="var(--global-accent-secondary)" viewBox="0 0 24 24" aria-hidden="true">
            {/* 第三层 (最远) */}
            <polyline points="6,9 12,15 18,9" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      opacity="0.4"
                      transform="translate(0, 16)"/>
            
            {/* 第二层 (中间) */}
            <polyline points="6,9 12,15 18,9" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      opacity="0.7"
                      transform="translate(0, 8)"/>
            
            {/* 第一层 (最近) */}
            <polyline points="6,9 12,15 18,9" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      opacity="1.0"/>
          </svg>
        </div>
      </button>
    </div>
  ), [scrollToModules]);

  // ====== 计算样式 ======
  const titleAnimationClassName = useMemo(() =>
    `transform transition-all duration-1000 ease-out ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
    }`,
    [isVisible]
  );

  // ====== 主渲染 ======
  return (
    <>
      {/* Skip Link */}
      <a
        href="#modules"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] bg-black text-white px-3 py-2 rounded"
      >
        跳到主要内容
      </a>

      {/* Hero Section */}
      <section className={`relative min-h-screen flex flex-col justify-center overflow-hidden ${createGradientClasses(`bg-gradient-to-br ${THEME.gradients.bgHero}`)}`}>
        {/* Background */}
        <div className="absolute inset-0 opacity-40">
          <HeroPageBackdrop />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-20 md:mb-32">
            <div className={titleAnimationClassName}>
              {TitleSection}
            </div>
          </div>
          {ScrollCue}
        </div>
      </section>

      {/* Modules Section */}
      <section
        ref={secondSectionRef}
        className={`relative min-h-screen flex flex-col justify-center ${createGradientClasses(`bg-gradient-to-b ${THEME.gradients.bgModules}`)} overflow-visible`}
        id="modules"
        aria-label="模块展示区域"
      >
        <div className="max-w-7xl mx-auto px-6 py-20 overflow-visible">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              探索邹韬奋先生足迹
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
