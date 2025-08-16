// TimelineCard.tsx
'use client';

import { motion } from 'framer-motion';
import { useState, useRef, useLayoutEffect, type CSSProperties } from 'react';
import { TimelineEvent } from './timeline-data.ts';
import { ImageWithFallback } from '../../../../example/邹韬奋竖轴时间轴页面/components/figma/ImageWithFallback.tsx';

interface TimelineCardProps {
  event: TimelineEvent & { imageFocus?: string }; // 可选：例如 '50% 20%'
  index: number; // 保持签名一致
  isActive: boolean;
  onClick: () => void;
}

export function TimelineCard({ event, isActive, onClick }: TimelineCardProps) {
  // —— 图片状态与方向识别
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [ratio, setRatio] = useState<number | null>(null); // w/h
  const hasImage = !!(event.imageUrl && event.imageUrl.trim() !== '');

  // —— 圆点与标题对齐
  const rowRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [dotY, setDotY] = useState<number | null>(null);

  useLayoutEffect(() => {
    const row = rowRef.current;
    const title = titleRef.current;
    if (!row || !title) return;
    const rowRect = row.getBoundingClientRect();
    const tRect = title.getBoundingClientRect();
    setDotY(tRect.top - rowRect.top + tRect.height / 2);
  }, [imageLoaded, hasImage, event.year, event.location, event.title]);

  // —— 图像焦点（横图 cover 时更有用）
  const focus = (event as any).imageFocus ?? '50% 50%';

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

  const imgFitClass =
    variant === 'portrait' ? 'object-contain' : 'object-cover';

  const imgPaddingClass =
    variant === 'portrait' ? 'p-4' : variant === 'square' ? 'p-3' : 'p-2';

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

        {/* 中列：仅画轴线（点改为覆盖层，避免 2px 列抖动） */}
        <div className="hidden lg:block col-start-2 relative h-full">
          <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-0.5 bg-gradient-to-b from-[var(--timeline-secondary)]/50 to-[var(--timeline-secondary)]/10" />
        </div>

        {/* 覆盖层里的圆点：与标题行中线对齐 */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none">
          <motion.button
            whileHover={{ scale: 1.12 }}
            transition={{ type: 'tween', duration: 0.15 }}
            onClick={onClick}
            style={{ top: dotY ?? '50%' }}
            className={`pointer-events-auto absolute left-1/2 -translate-x-1/2 -translate-y-1/2 origin-center transform-gpu will-change-transform z-20 w-4 h-4 rounded-full border-4 border-white ${
              isActive
                ? 'bg-[var(--timeline-secondary)] shadow-lg shadow-[var(--timeline-secondary)]/30'
                : 'bg-[var(--timeline-primary)] hover:bg-[var(--timeline-secondary)]'
            }`}
            aria-label={`${event.year} 时间点`}
          />
        </div>

        {/* 右列：文字 */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.18 }}
          onClick={onClick}
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
