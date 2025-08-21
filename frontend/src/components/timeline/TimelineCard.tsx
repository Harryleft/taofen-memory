// TimelineCard.tsx
'use client';

import { motion } from 'framer-motion';
import { useState, useRef, useLayoutEffect, type CSSProperties } from 'react';
import { TimelineEvent } from '@/types/personTypes.ts';
import { ImageWithFallback } from './ImageWithFallback.tsx';
import PersonDescription from '@/components/PersonDescription.tsx';

interface TimelineCardProps {
  event: TimelineEvent & { imageFocus?: string }; // 可选：例如 '50% 20%'
  index: number; // 保持签名一致
  isActive: boolean;
  isFirstEvent?: boolean; // 是否为第一个事件
  isLastEvent?: boolean; // 是否为最后一个事件
  onClick: () => void;
}

export function TimelineCard({ event, isActive, isFirstEvent = false, isLastEvent = false, onClick }: TimelineCardProps) {
  // —— 图片状态与方向识别
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [ratio, setRatio] = useState<number | null>(null); // w/h
  const hasImage = !!(event.imageUrl && event.imageUrl.trim() !== '');

  // —— 圆点与标题对齐，轴线精确定位
  const rowRef = useRef<HTMLDivElement>(null);
  const axisRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [dotY, setDotY] = useState<number | null>(null);
  const [anchorX, setAnchorX] = useState<number | null>(null);

  // —— 第一个事件徽章垂直偏移（不改它的 X 定位）
  const firstEventVerticalOffset = isFirstEvent ? -4 : 0; // 向上偏移4px以对齐视觉中心

  // —— 坐标对齐到像素栅格，避免 0.5px 抖动
  const snap = (v: number) => Math.round(v);

  // Y：用 ResizeObserver + resize，文本换行/图片加载后都能刷新
  useLayoutEffect(() => {
    const recalcY = () => {
      const row = rowRef.current;
      const title = titleRef.current;
      if (!row || !title) return;
      const rowRect = row.getBoundingClientRect();
      const tRect = title.getBoundingClientRect();
      setDotY(snap(tRect.top - rowRect.top + tRect.height / 2));
    };

    recalcY();
    window.addEventListener('resize', recalcY);

    const ro = new ResizeObserver(recalcY);
    if (titleRef.current) ro.observe(titleRef.current);
    if (rowRef.current) ro.observe(rowRef.current);

    return () => {
      window.removeEventListener('resize', recalcY);
      ro.disconnect();
    };
  }, []);

  // X：基于轴线容器中心计算，增加容错性
  useLayoutEffect(() => {
    const recalcX = () => {
      const row = rowRef.current;
      const axisContainer = axisRef.current;
      if (!row || !axisContainer) return;
      
      // 检查轴线容器是否可见
      const computedStyle = window.getComputedStyle(axisContainer);
      if (computedStyle.display === 'none') return;
      
      const rowRect = row.getBoundingClientRect();
      const axisContainerRect = axisContainer.getBoundingClientRect();
      
      // 计算轴线容器中心相对于父容器的位置
      const axisX = axisContainerRect.left - rowRect.left + axisContainerRect.width / 2;
      setAnchorX(snap(axisX));
    };

    const debounce = (func: () => void, delay: number) => {
      let timeout: number;
      return () => {
        clearTimeout(timeout);
        timeout = window.setTimeout(func, delay);
      };
    };
    
    const debouncedRecalcX = debounce(recalcX, 16);

    // 初始计算 - 增加延迟确保DOM渲染完成
    const timer = setTimeout(recalcX, 100);
    
    // 监听窗口大小变化
    window.addEventListener('resize', debouncedRecalcX);
    
    const ro = new ResizeObserver(debouncedRecalcX);
    if (rowRef.current) {
      ro.observe(rowRef.current);
    }
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', debouncedRecalcX);
      ro.disconnect();
    };
  }, []);

  // —— 图像焦点（横图 cover 时更有用）
  const focus = (event as TimelineEvent & { imageFocus?: string }).imageFocus ?? '50% 50%';

  // —— 方向与样式映射
  const variant: 'portrait' | 'landscape' | 'square' =
    ratio == null
      ? 'landscape'
      : ratio < 0.9
      ? 'portrait'
      : ratio > 1.1
      ? 'landscape'
      : 'square';

  const frameBorderClass =
    variant === 'portrait'
      ? 'timeline-card-vintage-border-portrait rounded-2xl'
      : variant === 'landscape'
      ? 'timeline-card-vintage-border-landscape rounded-xl'
      : 'timeline-card-vintage-border-square rounded-2xl';

  const imgFitClass = variant === 'portrait' ? 'object-contain' : 'object-cover';
  const imgPaddingClass = variant === 'portrait' ? 'p-4' : variant === 'square' ? 'p-3' : 'p-2';

  // —— 无图事件：收紧外边距
  const sectionMargin = hasImage ? 'mb-24' : 'mb-12 lg:mb-16';
  const titleGap = hasImage ? 'mb-3' : 'mb-2';

  return (
    <motion.section
      id={`event-${event.id}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.4, 0.0, 0.2, 1] }}
      className={`relative mx-auto w-full max-w-6xl px-4 md:px-6 lg:px-8 ${sectionMargin}`}
    >
      {/* 三列：左(图) | 中(轴) | 右(文) */}
      <div
        ref={rowRef}
        className="relative grid grid-cols-1 lg:grid-cols-[1fr_8px_1fr] items-start gap-x-12"
      >
        {/* 左列：图片（无图则不渲染） */}
        {hasImage && !imageError && (
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full max-w-[420px] place-self-start lg:col-start-1 justify-self-end lg:pr-6"
          >
            <div
              className={[
                'relative w-full h-[clamp(220px,26vw,360px)]',
                'overflow-hidden timeline-card-paper-texture',
                'shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group',
                frameBorderClass,
              ].join(' ')}
              onClick={onClick}
            >
              <ImageWithFallback
                src={event.imageUrl!}
                alt={event.title}
                onLoad={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  const img = e.currentTarget as HTMLImageElement;
                  setRatio(img.naturalWidth / img.naturalHeight);
                  setImageLoaded(true);
                }}
                onError={() => setImageError(true)}
                className={[
                  'absolute inset-0 w-full h-full transition-all duration-500',
                  imageLoaded ? 'opacity-100' : 'opacity-0',
                  imgFitClass,
                  imgPaddingClass,
                ].join(' ')}
                style={{ objectPosition: focus as CSSProperties['objectPosition'] }}
              />

              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-[var(--timeline-secondary)] border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </motion.div>
        )}

        {/* 中列：轴线容器 - 修复尺寸和定位 */}
        <div ref={axisRef} className="hidden lg:flex col-start-2 relative self-stretch w-2 justify-center">
          {/* 主轴线 - 使用timeline.css专属样式 */}
          <div
            className="absolute w-0.5 bg-[var(--timeline-secondary)]"
            style={{
              top: isFirstEvent ? `${dotY ?? 50}px` : '-96px',
              bottom: isLastEvent ? `calc(100% - ${dotY ?? 50}px + 200px)` : '-285px',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        </div>

        {/* 移动端轴线 - 使用timeline.css专属样式 */}
        <div 
          className="lg:hidden absolute w-0.5 bg-[var(--timeline-secondary)]/40 top-0 bottom-0"
          style={{
            left: '2rem', // 固定在左边距离
          }}
        />

        {/* 覆盖层：统一管理首事件徽章和普通圆点 */}
        <div className="absolute inset-0 pointer-events-none z-10">
          {isFirstEvent ? (
            // 首事件徽章
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: 0.3,
                type: 'spring',
                stiffness: 100,
              }}
              style={{
                top: `${(dotY ?? 50) + firstEventVerticalOffset}px`,
                left: `${(anchorX ?? 260) - 23}px`, // 使用动态计算的位置
              }}
              className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 origin-center transform-gpu will-change-transform z-20 timeline-first-event-badge"
              onClick={onClick}
            >
              {/* 外环 */}
              <div className="timeline-first-event-badge-outer">
                {/* 内环 */}
                <div className="timeline-first-event-badge-inner">
                  {/* 核心图标 */}
                  <div className="timeline-first-event-badge-icon">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-white"
                    >
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            // 普通圆点
            <motion.button
              onClick={onClick}
              style={{ 
                top: `${dotY ?? 50}px`, 
                left: `${anchorX ?? 260}px`
              }}
              className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 origin-center transform-gpu will-change-transform z-20 timeline-dot-button"
              aria-label={`${event.year} 时间点`}
            >
              {/* 外环 - 白色边框 */}
              <div className="w-4 h-4 rounded-full border-2 border-white shadow-lg bg-white">
                {/* 内环 - 主色彩填充 */}
                <div
                  className={`w-full h-full rounded-full flex items-center justify-center transition-colors duration-200 ${
                    isActive
                      ? 'bg-[var(--timeline-secondary)] shadow-inner shadow-[var(--timeline-secondary)]/40'
                      : 'bg-[var(--timeline-primary)]'
                  }`}
                >
                  {/* 中心点 - 白色高光 */}
                  <div
                    className={`rounded-full bg-white shadow-sm transition-opacity duration-200 ${
                      isActive ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </div>
              </div>
            </motion.button>
          )}

          {/* 移动端圆点 */}
          <div className="lg:hidden absolute pointer-events-none">
            <motion.button
              onClick={onClick}
              style={{ 
                top: `${dotY ?? 50}px`, 
                left: '2rem'
              }}
              className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-md"
            >
              <div className={`w-full h-full rounded-full ${isActive ? 'bg-[var(--timeline-secondary)]' : 'bg-[var(--timeline-primary)]'}`} />
            </motion.button>
          </div>
        </div>

        {/* 右列：文字 */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.18 }}
          onClick={onClick}
          data-text-region={`event-${event.id}`}
          className="w-full max-w-[640px] cursor-pointer place-self-start items-start flex flex-col lg:col-start-3 justify-self-start lg:pl-6 text-left ml-16 lg:ml-0"
        >
          {/* 年份与地点（标题块） */}
          <div
            ref={titleRef}
            className={`flex items-center gap-3 ${titleGap} mt-0 w-full lg:justify-start justify-start`}
          >
            <span className="font-bold timeline-secondary timeline-text-body">
              {event.year}
            </span>
            {event.location?.trim().length > 0 && (
              <span className="font-bold timeline-secondary timeline-text-body">
                {event.location}
              </span>
            )}
          </div>

          {/* 描述 */}
          <div className="w-full mt-0 mb-4">
            <PersonDescription 
              description={event.description}
              maxLength={300}
              className="timeline-text-secondary timeline-text-body timeline-line-height-relaxed"
              compact={false}
            />
          </div>

          {/* 激活条（可选） */}
          {isActive && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              className="h-1 bg-[var(--timeline-secondary)] rounded-full mt-4 w-full lg:origin-left origin-center"
            />
          )}
        </motion.div>
      </div>
    </motion.section>
  );
}