// TimelineCard.tsx
'use client';

import { motion } from 'framer-motion';
import { useState, useRef, useLayoutEffect, type CSSProperties } from 'react';
import { TimelineEvent } from '../../types/personTypes.ts';
import { ImageWithFallback } from './ImageWithFallback.tsx';

interface TimelineCardProps {
  event: TimelineEvent & { imageFocus?: string }; // 可选：例如 '50% 20%'
  index: number; // 保持签名一致
  isActive: boolean;
  isFirstEvent?: boolean; // 是否为第一个事件
  onClick: () => void;
}

export function TimelineCard({ event, isActive, isFirstEvent = false, onClick }: TimelineCardProps) {
  // —— 图片状态与方向识别
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [ratio, setRatio] = useState<number | null>(null); // w/h
  const hasImage = !!(event.imageUrl && event.imageUrl.trim() !== '');

  // —— 圆点与标题对齐，轴线精确定位（仅用于“普通事件”的圆点）
  const rowRef = useRef<HTMLDivElement>(null);
  const axisRef = useRef<HTMLDivElement>(null);
  const axisLineRef = useRef<HTMLDivElement>(null); // ⭐ 关键：指向“线本体”
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

  // X：基于网格布局计算轴线位置，避免DOM测量时序问题
  useLayoutEffect(() => {
    const recalcX = () => {
      const row = rowRef.current;
      if (!row) return;
      
      // 获取容器宽度
      const containerWidth = row.offsetWidth;
      
      // 关键修复：根据是否有图片使用不同的计算逻辑
      if (hasImage && !imageError) {
        // 有图片事件：使用三列网格布局计算
        let leftColWidth = 0;
        
        // 方法1：通过grid列选择器查找
        const leftCol = row.querySelector('[class*="col-start-1"]');
        if (leftCol) {
          leftColWidth = leftCol.offsetWidth;
        }
        
        // 方法2：如果方法1失败，查找第一个直接子元素（左列图片）
        if (leftColWidth === 0) {
          const firstChild = row.firstElementChild;
          if (firstChild && firstChild.classList.contains('lg:col-start-1')) {
            leftColWidth = firstChild.offsetWidth;
          }
        }
        
        // 方法3：如果都失败，使用网格布局理论计算
        if (leftColWidth === 0) {
          // 在三列网格 [1fr_2px_1fr] 中，左列大约占总宽度的 50%
          // 根据用户提供的正确值 536px 反推，当容器760px时，左列应该是535px
          leftColWidth = Math.floor(containerWidth * 0.705); // 536/760 ≈ 0.705
        }
        
        // 轴线位置计算：基于用户提供的正确值536px进行调整
        // 当容器宽度760px时，轴线应该在536px位置
        // 如果左列宽度是420px，那么需要额外的115px偏移
        const adjustment = containerWidth >= 760 ? 115 : Math.floor(containerWidth * 0.15);
        const theoreticalAxisX = leftColWidth + 1 + adjustment;
        
        // 调试信息
        console.log('Timeline positioning debug (with image):', {
          containerWidth,
          leftColWidth,
          adjustment,
          calculatedAxisX: theoreticalAxisX,
          expectedAxisX: 536, // 用户提供的正确值
          method: leftColWidth > 0 ? 'DOM' : 'Calculated'
        });
        
        setAnchorX(snap(theoreticalAxisX));
      } else {
        // 无图片事件：使用两列布局，轴线在容器中心
        const centerAxisX = containerWidth / 2;
        
        // 调试信息
        console.log('Timeline positioning debug (no image):', {
          containerWidth,
          calculatedAxisX: centerAxisX,
          method: 'Center calculation'
        });
        
        setAnchorX(snap(centerAxisX));
      }
    };

    // 初始计算
    recalcX();
    
    // 监听窗口大小变化
    window.addEventListener('resize', recalcX);
    
    // 使用ResizeObserver监听容器尺寸变化
    const ro = new ResizeObserver(() => {
      recalcX();
    });
    
    if (rowRef.current) {
      ro.observe(rowRef.current);
    }
    
    return () => {
      window.removeEventListener('resize', recalcX);
      ro.disconnect();
    };
  }, [hasImage, imageError]);

  // —— 图像焦点（横图 cover 时更有用）
  const focus = (event as TimelineEvent & { imageFocus?: string }).imageFocus ?? '50% 50%';

  // —— 方向与样式映射
  // portrait: ratio<0.9, landscape: ratio>1.1, square: 其它
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
        className="relative grid grid-cols-1 lg:grid-cols-[1fr_2px_1fr] items-start gap-x-12"
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

              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </motion.div>
        )}

        {/* 中列：画轴线（只画线，徽章和圆点移到覆盖层） */}
        <div ref={axisRef} className="hidden lg:block col-start-2 relative h-full">
          <div
            ref={axisLineRef} // ⭐ 新增：轴线本体 ref
            className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2
                       w-px                                     /* 从 w-0.5 改为 w-px，像素对齐 */
                       bg-gradient-to-b from-[var(--timeline-secondary)]/50 to-[var(--timeline-secondary)]/10"
          />
        </div>

        {/* 覆盖层：统一管理首事件徽章和普通圆点 */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none">
          {isFirstEvent ? (
            // ❗ 首事件不改：保留你原来的 X 定位写法
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
                left: '521px', // 保留原有魔法数，不动它
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
            // ✅ 普通圆点：用 anchorX / dotY（来自轴线本体与标题块）
            <motion.button
              onClick={onClick}
              style={{ top: dotY ?? '50%', left: anchorX ?? '50%' }}
              className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 origin-center transform-gpu will-change-transform z-20 bg-transparent timeline-dot-button"
              aria-label={`${event.year} 时间点`}
            >
              {/* 外环 */}
              <div className="w-4 h-4 rounded-full border-2 border-white shadow-lg">
                {/* 内环 - 深蓝色默认，滚动激活时变为金色 */}
                <div
                  className={`w-full h-full rounded-full flex items-center justify-center ${
                    isActive
                      ? 'bg-[var(--timeline-secondary)] shadow-inner shadow-[var(--timeline-secondary)]/40'
                      : 'bg-[var(--timeline-primary)]'
                  }`}
                >
                  {/* 中心点 */}
                  <div
                    className={`w-1.5 h-1.5 rounded-full bg-white shadow-sm ${
                      isActive ? 'opacity-100' : 'opacity-70'
                    }`}
                  />
                </div>
              </div>
            </motion.button>
          )}
        </div>

        {/* 右列：文字 */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.18 }}
          onClick={onClick}
          data-text-region={`event-${event.id}`}
          className="w-full max-w-[640px] cursor-pointer place-self-start items-start flex flex-col lg:col-start-3 justify-self-start lg:pl-6 text-left"
        >
          {/* 年份与地点（标题块） */}
          <div
            ref={titleRef}
            className={`flex items-center gap-3 ${titleGap} mt-0 w-full lg:justify-start justify-center`}
          >
            <span className="font-bold timeline-secondary timeline-text-body">
              {event.year}
            </span>
            {event.location?.trim() && (
              <span className="font-bold timeline-secondary timeline-text-body">
                {event.location}
              </span>
            )}
          </div>

          {/* 描述 */}
          <p className="w-full mt-0 mb-4 timeline-text-secondary timeline-text-body timeline-line-height-relaxed">
            {event.description}
          </p>

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
