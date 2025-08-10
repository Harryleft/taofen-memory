import { useEffect, useState, useLayoutEffect } from 'react';
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
    
    const handleScroll = () => {
      const newScrollY = window.scrollY;
      setScrollY(newScrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    
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
      <div className="inline-flex items-center gap-3 text-gray-900">
        <span className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold tracking-[0.08em]">新闻记者</span>
        <span className="opacity-90 leading-none text-[18px] sm:text-[20px] md:text-[22px]">·</span>
        <span className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold tracking-[0.08em]">出版家</span>
      </div>
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
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-cream">
      {/* 背景图案层 - 保持适中的透明度以确保背景图片可见 */}
      <div className="absolute inset-0 opacity-40">
        <HeroPageBackdrop scrollY={scrollY} />
      </div>
      
      {/* 渐变遮罩层 - 为文字内容提供更好的对比度保护 */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/10 to-white/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-white/15 via-transparent to-white/15" />
      
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

        {/* Navigation Modules */}
        <div 
          className={`transform transition-all duration-1200 ease-out delay-400 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* Timeline Module */}
            {/* 舞台化：不透明纸白表面 + 双层阴影 + 左侧色条 + 背景弱化层 */}
            <div 
              className="group relative bg-amber-50/70 border border-amber-200/80 rounded-2xl p-8 transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
              onClick={() => navigate('/timeline')}
              onMouseEnter={() => setActiveModule(0)}
              onMouseLeave={() => setActiveModule(null)}
              style={{ boxShadow: CARD_SHADOW, isolation: 'isolate' }}
            >
              {/* 手札装饰：纸张细纹理 */}
              <div
                aria-hidden
                className="absolute inset-0 rounded-2xl pointer-events-none mix-blend-multiply"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0 1px, rgba(0,0,0,0) 1px 3px), radial-gradient(1px 1px at 12% 18%, rgba(0,0,0,0.03) 0 1px, transparent 1px), radial-gradient(1px 1px at 68% 76%, rgba(0,0,0,0.025) 0 1px, transparent 1px), radial-gradient(1px 1px at 32% 62%, rgba(0,0,0,0.02) 0 1px, transparent 1px)',
                  opacity: 0.8,
                }}
              />
              {/* 半调网点移除，保持更纯粹的手札纸面 */}
              {/* 背景弱化舞台（仅在卡片区域下方生效） */}
              <div aria-hidden className="absolute left-0 right-0 bottom-[-6px] h-3 pointer-events-none rounded-b-2xl" style={{ backgroundImage:'repeating-linear-gradient(135deg, rgba(0,0,0,0.10) 0 2px, rgba(0,0,0,0) 2px 6px)', opacity:.35, filter:'blur(0.2px)'}} />
              <div aria-hidden className="absolute inset-0 rounded-2xl pointer-events-none mix-blend-multiply" style={{ backgroundImage:'repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0 1px, rgba(0,0,0,0) 1px 3px), radial-gradient(1px 1px at 12% 18%, rgba(0,0,0,0.03) 0 1px, transparent 1px), radial-gradient(1px 1px at 68% 76%, rgba(0,0,0,0.025) 0 1px, transparent 1px), radial-gradient(1px 1px at 32% 62%, rgba(0,0,0,0.02) 0 1px, transparent 1px)', opacity:.8 }} />
              {/* 半调网点移除 */}
              <div className="absolute -inset-3 rounded-3xl -z-10 backdrop-blur-sm backdrop-brightness-105 backdrop-saturate-90" />
              {/* 左侧色条 */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl bg-amber-600" />
              <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-heritage-blue/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-amber-400/10 rounded-2xl flex items-center justify-center mb-6 group-hover:from-amber-500/30 group-hover:to-amber-400/20 transition-all duration-300 flex-shrink-0">
                  <Scroll className="text-gold group-hover:scale-110 transition-transform duration-300" size={26} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-gold transition-colors duration-300 font-serif flex-shrink-0">
                  岁月行履
                </h3>
                <p className="text-gray-800 leading-relaxed mb-6 text-sm flex-grow">
                  循迹韬奋足音，见风云际会与初心不改
                </p>
                <div className="flex items-center text-gold group-hover:text-gold/80 transition-colors duration-300 flex-shrink-0">
                  <span className="text-sm font-medium">探索</span>
                  <ChevronDown className="ml-2 transform rotate-[-90deg] group-hover:translate-x-1 transition-transform duration-300" size={14} />
                </div>
              </div>
            </div>

            {/* Bookstore Module */}
            <div 
              className="group relative bg-amber-50/70 border border-amber-200/80 rounded-2xl p-8 transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
              onClick={() => navigate('/bookstore-timeline')}
              onMouseEnter={() => setActiveModule(1)}
              onMouseLeave={() => setActiveModule(null)}
              style={{ boxShadow: CARD_SHADOW, isolation: 'isolate' }}
            >
              <div aria-hidden className="absolute left-0 right-0 bottom-[-6px] h-3 pointer-events-none rounded-b-2xl" style={{ backgroundImage:'repeating-linear-gradient(135deg, rgba(0,0,0,0.10) 0 2px, rgba(0,0,0,0) 2px 6px)', opacity:.35, filter:'blur(0.2px)'}} />
              <div aria-hidden className="absolute inset-0 rounded-2xl pointer-events-none mix-blend-multiply" style={{ backgroundImage:'repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0 1px, rgba(0,0,0,0) 1px 3px), radial-gradient(1px 1px at 12% 18%, rgba(0,0,0,0.03) 0 1px, transparent 1px), radial-gradient(1px 1px at 68% 76%, rgba(0,0,0,0.025) 0 1px, transparent 1px), radial-gradient(1px 1px at 32% 62%, rgba(0,0,0,0.02) 0 1px, transparent 1px)', opacity:.8 }} />
              {/* 半调网点移除 */}
              <div className="absolute -inset-3 rounded-3xl -z-10 backdrop-blur-sm backdrop-brightness-105 backdrop-saturate-90" />
              <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl bg-blue-600" />
              <div className="absolute inset-0 bg-gradient-to-br from-heritage-blue/5 to-gold/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col h-full">
     
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-400/10 rounded-2xl flex items-center justify-center mb-6 group-hover:from-blue-500/30 group-hover:to-blue-400/20 transition-all duration-300 flex-shrink-0">
                  <BookOpen className="text-heritage-blue group-hover:scale-110 transition-transform duration-300" size={26} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-heritage-blue transition-colors duration-300 font-serif flex-shrink-0">
                  生活与书
                </h3>
                <p className="text-gray-800 leading-relaxed mb-6 text-sm flex-grow">
                  在纸与铅字之间，重访生活书店的生长与担当
                </p>
                <div className="flex items-center text-heritage-blue group-hover:text-heritage-blue/80 transition-colors duration-300 flex-shrink-0">
                  <span className="text-sm font-medium">重访</span>
                  <ChevronDown className="ml-2 transform rotate-[-90deg] group-hover:translate-x-1 transition-transform duration-300" size={14} />
                </div>
              </div>
            </div>

            {/* Handwriting Module */}
            <div 
              className="group relative bg-amber-50/70 border border-amber-200/80 rounded-2xl p-8 transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
              onClick={() => navigate('/handwriting')}
              onMouseEnter={() => setActiveModule(2)}
              onMouseLeave={() => setActiveModule(null)}
              style={{ boxShadow: CARD_SHADOW, isolation: 'isolate' }}
            >
              <div aria-hidden className="absolute left-0 right-0 bottom-[-6px] h-3 pointer-events-none rounded-b-2xl" style={{ backgroundImage:'repeating-linear-gradient(135deg, rgba(0,0,0,0.10) 0 2px, rgba(0,0,0,0) 2px 6px)', opacity:.35, filter:'blur(0.2px)'}} />
              <div aria-hidden className="absolute inset-0 rounded-2xl pointer-events-none mix-blend-multiply" style={{ backgroundImage:'repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0 1px, rgba(0,0,0,0) 1px 3px), radial-gradient(1px 1px at 12% 18%, rgba(0,0,0,0.03) 0 1px, transparent 1px), radial-gradient(1px 1px at 68% 76%, rgba(0,0,0,0.025) 0 1px, transparent 1px), radial-gradient(1px 1px at 32% 62%, rgba(0,0,0,0.02) 0 1px, transparent 1px)', opacity:.8 }} />
              {/* 半调网点移除 */}
              <div className="absolute -inset-3 rounded-3xl -z-10 backdrop-blur-sm backdrop-brightness-105 backdrop-saturate-90" />
              <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl bg-emerald-600" />
              <div className="absolute inset-0 bg-gradient-to-br from-sage-green/5 to-gold/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-emerald-400/10 rounded-2xl flex items-center justify-center mb-6 group-hover:from-emerald-500/30 group-hover:to-emerald-400/20 transition-all duration-300 flex-shrink-0">
                  <FileText className="text-sage-green group-hover:scale-110 transition-transform duration-300" size={26} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-sage-green transition-colors duration-300 font-serif flex-shrink-0">
                  笔下风骨
                </h3>
                <p className="text-gray-800 leading-relaxed mb-6 text-sm flex-grow">
                  从字里行间，见其思虑与炽热
                </p>
                <div className="flex items-center text-sage-green group-hover:text-sage-green/80 transition-colors duration-300 flex-shrink-0">
                  <span className="text-sm font-medium">展开</span>
                  <ChevronDown className="ml-2 transform rotate-[-90deg] group-hover:translate-x-1 transition-transform duration-300" size={14} />
                </div>
              </div>
            </div>

            {/* Relationships Module */}
            <div 
              className="group relative bg-amber-50/70 border border-amber-200/80 rounded-2xl p-8 transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
              onClick={() => navigate('/relationships')}
              onMouseEnter={() => setActiveModule(3)}
              onMouseLeave={() => setActiveModule(null)}
              style={{ boxShadow: CARD_SHADOW, isolation: 'isolate' }}
            >
              <div aria-hidden className="absolute left-0 right-0 bottom-[-6px] h-3 pointer-events-none rounded-b-2xl" style={{ backgroundImage:'repeating-linear-gradient(135deg, rgba(0,0,0,0.10) 0 2px, rgba(0,0,0,0) 2px 6px)', opacity:.35, filter:'blur(0.2px)'}} />
              <div aria-hidden className="absolute inset-0 rounded-2xl pointer-events-none mix-blend-multiply" style={{ backgroundImage:'repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0 1px, rgba(0,0,0,0) 1px 3px), radial-gradient(1px 1px at 12% 18%, rgba(0,0,0,0.03) 0 1px, transparent 1px), radial-gradient(1px 1px at 68% 76%, rgba(0,0,0,0.025) 0 1px, transparent 1px), radial-gradient(1px 1px at 32% 62%, rgba(0,0,0,0.02) 0 1px, transparent 1px)', opacity:.8 }} />
              {/* 半调网点移除 */}
              <div className="absolute -inset-3 rounded-3xl -z-10 backdrop-blur-sm backdrop-brightness-105 backdrop-saturate-90" />
              <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl bg-rose-600" />
              <div className="absolute inset-0 bg-gradient-to-br from-warm-rose/5 to-heritage-blue/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-500/20 to-rose-400/10 rounded-2xl flex items-center justify-center mb-6 group-hover:from-rose-500/30 group-hover:to-rose-400/20 transition-all duration-300 flex-shrink-0">
                  <Users className="text-warm-rose group-hover:scale-110 transition-transform duration-300" size={26} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-warm-rose transition-colors duration-300 font-serif flex-shrink-0">
                  同道群像
                </h3>
                <p className="text-gray-800 leading-relaxed mb-6 text-sm flex-grow">
                  以人观史，勾连一个时代的脉络
                </p>
                <div className="flex items-center text-warm-rose group-hover:text-warm-rose/80 transition-colors duration-300 flex-shrink-0">
                  <span className="text-sm font-medium">查看</span>
                  <ChevronDown className="ml-2 transform rotate-[-90deg] group-hover:translate-x-1 transition-transform duration-300" size={14} />
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </section>
  );
}
