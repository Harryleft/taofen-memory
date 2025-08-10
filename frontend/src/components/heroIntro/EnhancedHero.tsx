import { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, Scroll, Users, BookOpen, FileText } from 'lucide-react';
import HeroPageBackdrop from './HeroPageBackdrop.tsx';

export default function EnhancedHero() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [, setActiveModule] = useState<number | null>(null);
  const [titleVariant, setTitleVariant] = useState<'classic' | 'monumental' | 'editorial'>('monumental');
  const secondSectionRef = useRef<HTMLDivElement | null>(null);
  const scrollToModules = () => {
    if (secondSectionRef.current) {
      secondSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  // —

  // 使用 useLayoutEffect 在浏览器绘制前同步滚动位置，消除首帧闪动
  useLayoutEffect(() => {
    // 🔥 关键修复：临时禁用平滑滚动
    const originalScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    
    // 强制重置滚动位置（多重保险）
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
    
    // 设置初始状态
    setScrollY(0);
    
    // 恢复原始滚动行为（延迟恢复，确保重置完成）
    setTimeout(() => {
      document.documentElement.style.scrollBehavior = originalScrollBehavior;
    }, 100);

    // 优化滚动处理：使用 rAF (requestAnimationFrame) 提高性能
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    // 添加 passive: true 选项，告知浏览器我们的监听器不会阻止默认滚动行为
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 入场动画保持使用 useEffect
  useEffect(() => {
    // Trigger entrance animation with staggered timing
    setTimeout(() => {
      setIsVisible(true);
    }, 200);
  }, []);
  
  // 从 URL 读取 variant，支持：classic | monumental | editorial
  useEffect(() => {
    const variant = (searchParams.get('variant') || '').toLowerCase();
    if (variant === 'classic' || variant === 'editorial' || variant === 'monumental') {
      setTitleVariant(variant);
    }
  }, [searchParams]);

  // 添加 scrollY 状态变化的监听
  useEffect(() => {
    console.log('🔍 [EnhancedHero] scrollY 状态变化:', scrollY);
  }, [scrollY]);
  
  // —



  // 卡片舞台化：更强的前景清晰度与背景分离
  // 更轻的阴影，避免灰度感过重
  const CARD_SHADOW = '0 10px 24px rgba(0,0,0,0.10), 0 3px 10px rgba(0,0,0,0.06)';
  // 手札风格为主，不再使用"报纸"装饰

  // 渲染可切换的标题/副标题系统
  const renderYearDivider = () => (
    <div className="mb-8">
      <div className="inline-flex items-center gap-3 sm:gap-4">
        <div className="w-10 sm:w-16 md:w-24 h-px bg-black/70" />
        <span className="text-[12px] sm:text-[13px] text-gray-700 font-medium tracking-[0.25em]">
          1895 - 1944
        </span>
        <div className="w-10 sm:w-16 md:w-24 h-px bg-black/70" />
      </div>
    </div>
  );

  const renderRoles = () => (
    <div className="mt-4">
      <h2 className="QYzQ7d flow-root text-[16px] leading-[24px] tracking-[0.1px] text-gray-900 font-medium mb-3 max-h-[24px] overflow-hidden whitespace-nowrap">
        沿邹韬奋的生活、事业与遗产，洞见时代精神
      </h2>
    </div>
  );
  const renderTitleSection = () => {
    if (titleVariant === 'classic') {
      return (
        <>
          {/* 经典方案：克制与留白 */}
          {renderYearDivider()}
          <h1
            className="font-serif text-gray-900 text-[44px] sm:text-[60px] md:text-[80px] lg:text-[96px] font-bold tracking-[-0.02em]"
            style={{ lineHeight: '0.98' }}
          >
            邹韬奋
          </h1>
          {renderRoles()}
        </>
      );
    }
    if (titleVariant === 'editorial') {
      return (
        <>
          {/* 社论方案：信息统一与克制 */}
          {renderYearDivider()}
          <div className="relative inline-block">
            <h1
              className="font-serif text-gray-900 text-[52px] sm:text-[72px] md:text-[92px] lg:text-[108px] font-extrabold tracking-[-0.035em]"
              style={{ lineHeight: '0.94' }}
            >
              邹韬奋
            </h1>
            <div className="absolute -bottom-2 left-0 right-0 h-[3px] bg-black/80" />
          </div>
          {renderRoles()}
        </>
      );
    }
    // 默认：纪念碑式（monumental）
    return (
      <>
        {/* 年份标识 - 历史坐标，最上层 */}
        {renderYearDivider()}
        {/* 主标题容器 - 重新定义视觉重量 */}
        <div className="relative mb-12">
          {/* 主标题背景 - 极简而庄重 */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-50/30 via-transparent to-blue-50/30 rounded-full blur-3xl transform scale-125" />
          </div>
          {/* 主标题 - 采用更庄重的字体配置 */}
          <h1
            className="font-serif leading-none text-gray-900 text-[56px] sm:text-[72px] md:text-[88px] lg:text-[104px] xl:text-[120px] font-black tracking-[-0.03em]"
            style={{ 
              textShadow: '0 4px 8px rgba(0,0,0,0.12), 0 2px 4px rgba(255,255,255,0.95)',
              lineHeight: '0.92',
              fontWeight: 900
            }}
          >
            邹韬奋
          </h1>
          {/* 主标题下的装饰线 - 建立视觉锚点 */}
          <div className="mt-6 flex justify-center">
            <div className="w-24 h-1 bg-black rounded-full opacity-90" />
          </div>
        </div>
        {renderRoles()}
      </>
    );
  };

  return (
    <>
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-cream">
      {/* Header - fixed, minimal, Bauhaus-style */}
      <header
        className={`AFnmuc fixed top-0 left-0 right-0 z-[4504] transition-colors duration-300 ${
          scrollY > 8 ? 'bg-white/95 border-b border-gray-200' : 'bg-transparent'
        }`}
        style={{ height: '56px' }}
      >
        <div className="w-full h-full px-4 md:px-6 flex items-center justify-between text-gray-900">
          {/* Logo section */}
          {/* <div className="flex items-center">
            <img 
              src="/images/hero_page/taofen_name.svg" 
              alt="邹韬奋" 
              className="h-20 w-auto opacity-90 hover:opacity-100 transition-opacity duration-200"
            />
          </div> */}
          
          {/* Navigation section */}
          <nav className="hidden md:flex items-center gap-8 text-base">
            {[
              { label: '岁月行履', to: '/timeline' },
              { label: '生活与书', to: '/bookstore-timeline' },
              { label: '笔下风骨', to: '/handwriting' },
              { label: '同道群像', to: '/relationships' },
            ].map((item) => (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className="relative px-3 py-2 font-medium text-gray-800 hover:text-black transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-black after:w-0 hover:after:w-full after:transition-[width] after:duration-300"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* 渐变遮罩层 - 为文字内容提供更好的对比度保护 */}
      <div className="absolute inset-0 opacity-30">
        <HeroPageBackdrop scrollY={scrollY} />
      </div>      

      {/* 几何装饰元素层 - 优化色彩层次和透明度 */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-gold/20 to-gold/5 rounded-full blur-xl" />
        <div className="absolute bottom-32 right-32 w-48 h-48 bg-gradient-to-tl from-heritage-blue/20 to-heritage-blue/5 rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-sage-green/20 to-sage-green/5 rounded-full blur-lg" />
      </div>
      
      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        {/* 重新设计的主标题系统 - 垂直布局建立清晰层级 */}
        <div className="text-center mb-16 md:mb-20">
          <div 
            className={`transform transition-all duration-1200 ease-out ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}
          >
            {renderTitleSection()}
          </div>
        </div>

        {/* Scroll Cue */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <button
            aria-label="下滑查看更多"
            onClick={scrollToModules}
            className="text-black/60 hover:text-black focus:outline-none animate-subtle-float hover:animate-none">
            <svg width="48" height="48" viewBox="0 0 24 24" style={{ transform: 'matrix3d(1, 0, 0, 0, 0, -1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1)' }}>
              <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"></path>
            </svg>
          </button>
        </div>


      </div>
    </section>

    {/* Second Screen: Modules */}
    <section ref={secondSectionRef} className="relative min-h-screen flex flex-col justify-center bg-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Timeline Module */}
          <div 
            className="group relative bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:scale-105" 
            onClick={() => navigate('/timeline')} 
            onMouseEnter={() => setActiveModule(0)} 
            onMouseLeave={() => setActiveModule(null)}
            style={{ aspectRatio: '4/3' }}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src="/images/hero_page/070_韬奋像_70.jpg" 
                alt="韬奋像" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            </div>
            
            {/* Content */}
            <div className="relative z-10 flex flex-col justify-end h-full p-8">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
                岁月行履
              </h3>
              <p className="text-white/90 text-base leading-relaxed mb-4">
                循迹韬奋足音，见风云际会与初心不改
              </p>
            </div>
          </div>

          {/* Bookstore Module */}
          <div 
            className="group relative bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:scale-105" 
            onClick={() => navigate('/bookstore-timeline')} 
            onMouseEnter={() => setActiveModule(1)} 
            onMouseLeave={() => setActiveModule(null)}
            style={{ aspectRatio: '4/3' }}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src="/images/hero_page/shenghuo_first.jpg" 
                alt="生活书店" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            </div>
            
            {/* Content */}
            <div className="relative z-10 flex flex-col justify-end h-full p-8">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
                生活与书
              </h3>
              <p className="text-white/90 text-base leading-relaxed mb-4">
                在纸与铅字之间，重访生活书店的生长与担当
              </p>
            </div>
          </div>

          {/* Handwriting Module */}
          <div 
            className="group relative bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:scale-105" 
            onClick={() => navigate('/handwriting')} 
            onMouseEnter={() => setActiveModule(2)} 
            onMouseLeave={() => setActiveModule(null)}
            style={{ aspectRatio: '4/3' }}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src="/images/hero_page/shenghuoxinqikan.jpg" 
                alt="生活新期刊" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            </div>
            
            {/* Content */}
            <div className="relative z-10 flex flex-col justify-end h-full p-8">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
                笔下风骨
              </h3>
              <p className="text-white/90 text-base leading-relaxed mb-4">
                从字里行间，见其思慮与炽热
              </p>
            </div>
          </div>

          {/* Relationships Module */}
          <div 
            className="group relative bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:scale-105" 
            onClick={() => navigate('/relationships')} 
            onMouseEnter={() => setActiveModule(3)} 
            onMouseLeave={() => setActiveModule(null)}
            style={{ aspectRatio: '4/3' }}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src="/images/hero_page/person_21609_3188023555816154777.jpg" 
                alt="同道群像" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            </div>
            
            {/* Content */}
            <div className="relative z-10 flex flex-col justify-end h-full p-8">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
                同道群像
              </h3>
              <p className="text-white/90 text-base leading-relaxed mb-4">
                以人观史，勾连一个时代的脉络
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
