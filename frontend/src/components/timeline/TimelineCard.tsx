// TimelineCard.tsx
'use client';

import { motion } from 'framer-motion';
import { useState, type CSSProperties } from 'react';
import { TimelineEvent } from './timeline-data.ts';
import { ImageWithFallback } from '../../../../example/邹韬奋竖轴时间轴页面/components/figma/ImageWithFallback.tsx';

interface TimelineCardProps {
  event: TimelineEvent & { imageFocus?: string }; // 可选：焦点，例 '50% 20%'
  index: number; // 保持签名一致，未使用
  isActive: boolean;
  onClick: () => void;
}

export function TimelineCard({ event, index: _index, isActive, onClick }: TimelineCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  const hasValidImage = !!(event.imageUrl && event.imageUrl.trim() !== '');
  const focus = (event as any).imageFocus ?? '50% 50%';

  return (
    <motion.section
      id={`event-${event.id}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.4, 0.0, 0.2, 1] }}
      className="relative mx-auto w-full max-w-6xl px-4 md:px-6 lg:px-8 mb-24"
    >
      {/* 三列：左(图) | 中(轴) | 右(文) */}
      <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_2px_1fr] items-start gap-x-12">
        {/* 左列：图片（统一可视高度，竖图 contain，横图 cover） */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full max-w-[420px] place-self-start lg:col-start-1 justify-self-end lg:pr-6"
        >
          {hasValidImage && !imageError ? (
            <div
              className="
                relative w-full h-[clamp(220px,26vw,360px)]
                overflow-hidden rounded-lg border-4 border-[var(--timeline-secondary)]
                shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group
                bg-white
              "
              onClick={onClick}
            >
              <ImageWithFallback
                src={event.imageUrl}
                alt={event.title}
                                 onLoad={(e: React.SyntheticEvent<HTMLImageElement>) => {
                   const img = e.currentTarget;
                   setIsPortrait(img.naturalHeight > img.naturalWidth);
                   setImageLoaded(true);
                 }}
                onError={() => setImageError(true)}
                className={[
                  'absolute inset-0 w-full h-full transition-all duration-500',
                  imageLoaded ? 'opacity-100' : 'opacity-0',
                  isPortrait ? 'object-contain p-3' : 'object-cover'
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
          ) : (
            <div className="w-full h-[clamp(220px,26vw,360px)] invisible" />
          )}
        </motion.div>

        {/* ✅ 轴线：保留在第 2 列（只有线，没有点） */}
        <div className="hidden lg:block col-start-2 relative h-full">
          <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-0.5
                          bg-gradient-to-b from-[var(--timeline-secondary)]/50 to-[var(--timeline-secondary)]/10" />
        </div>

        {/* ✅ 圆点：改为覆盖整行的绝对定位，锚在真正的 50% 上 */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none">
          <motion.button
            whileHover={{ boxShadow: '0 0 0 6px rgba(var(--timeline-secondary-rgb),0.25)' }}

            transition={{ type: 'tween', duration: 0.15 }}
            onClick={onClick}
            className={`pointer-events-auto
                        absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                        origin-center transform-gpu will-change-transform z-20
                        w-4 h-4 rounded-full border-4 border-white
                        ${isActive
                          ? 'bg-[var(--timeline-secondary)] shadow-lg shadow-[var(--timeline-secondary)]/30'
                          : 'bg-[var(--timeline-primary)] hover:bg-[var(--timeline-secondary)]'}`}
            aria-label={`${event.year} 时间点`}
          />
        </div>


        {/* 右列：文字（顶对齐、靠轴贴边） */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.18 }}
          onClick={onClick}
          className="w-full max-w-[640px] cursor-pointer items-start flex flex-col
            lg:col-start-3 justify-self-start lg:pl-6 text-left
            place-self-start lg:place-self-center lg:justify-center"
        >
          <div className="flex items-center gap-3 mb-3 mt-0 w-full lg:justify-start justify-center">
            <span className="font-bold timeline-secondary timeline-text-body">{event.year}</span>
            {event.location?.trim() && (
              <span className="font-bold timeline-secondary timeline-text-body">{event.location}</span>
            )}
          </div>

          <p className="w-full mt-0 mb-4 timeline-text-secondary timeline-text-body timeline-line-height-relaxed">
            {event.description}
          </p>

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
