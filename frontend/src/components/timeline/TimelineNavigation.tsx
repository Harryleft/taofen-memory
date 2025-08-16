"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import { TimelineEvent, periods } from "./timeline-data.ts";

interface TimelineNavigationProps {
  events: TimelineEvent[];
  activeEventId: string;
  onEventClick: (eventId: string) => void;
}

interface EventPosition {
  id: string;
  top: number;
  height: number;
  center: number;
}

export function TimelineNavigation({
  events,
  activeEventId,
  onEventClick,
}: TimelineNavigationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [eventPositions, setEventPositions] = useState<EventPosition[]>([]);
  const navigationRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);

  // 使用防抖的滚动处理函数
  const handleScroll = useCallback(() => {
    if (!tickingRef.current) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        setIsVisible(scrollY > 100);
        lastScrollYRef.current = scrollY;
        tickingRef.current = false;
      });
      tickingRef.current = true;
    }
  }, []);

  // 计算事件位置
  const calculateEventPositions = useCallback(() => {
    try {
      const positions: EventPosition[] = [];
      
      events.forEach(event => {
        const element = document.getElementById(`event-${event.id}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          const scrollY = window.scrollY;
          
          positions.push({
            id: event.id,
            top: rect.top + scrollY,
            height: rect.height,
            center: rect.top + scrollY + rect.height / 2
          });
        }
      });
      
      setEventPositions(positions);
    } catch (error) {
      console.warn('[TimelineNavigation] Error calculating event positions:', error);
    }
  }, [events]);

  // 初始化位置计算和监听
  useEffect(() => {
    // 初始计算
    calculateEventPositions();
    
    // 设置滚动监听
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // 设置防抖的resize监听
    const debouncedResize = () => {
      if (!tickingRef.current) {
        requestAnimationFrame(() => {
          calculateEventPositions();
          tickingRef.current = false;
        });
        tickingRef.current = true;
      }
    };
    
    window.addEventListener("resize", debouncedResize, { passive: true });
    
    // 设置防抖的MutationObserver监听DOM变化
    let mutationTimeout: NodeJS.Timeout;
    const observer = new MutationObserver(() => {
      clearTimeout(mutationTimeout);
      mutationTimeout = setTimeout(() => {
        calculateEventPositions();
      }, 100); // 100ms防抖
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false
    });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", debouncedResize);
      observer.disconnect();
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [handleScroll, calculateEventPositions]);

  // 数据变化时重新计算位置
  useEffect(() => {
    calculateEventPositions();
  }, [events, calculateEventPositions]);

  // 计算导航节点在侧边栏中的位置
  const getNavNodePosition = (eventId: string) => {
    if (eventPositions.length === 0) return 0;
    
    const eventPos = eventPositions.find(pos => pos.id === eventId);
    if (!eventPos) return 0;
    
    // 获取所有事件的最小和最大位置
    const minTop = Math.min(...eventPositions.map(pos => pos.top));
    const maxCenter = Math.max(...eventPositions.map(pos => pos.center));
    const totalRange = maxCenter - minTop;
    
    // 计算相对位置（0-1之间）
    const relativePosition = totalRange > 0 ? (eventPos.center - minTop) / totalRange : 0;
    
    // 转换为像素位置，考虑导航栏的高度限制
    const navigationHeight = 600; // 导航栏的最大高度
    const nodePosition = relativePosition * navigationHeight;
    
    return Math.max(0, Math.min(navigationHeight, nodePosition));
  };

  const scrollToEvent = (eventId: string) => {
    const element = document.getElementById(`event-${eventId}`);
    if (element) {
      const offset = 100;
      const elementPosition =
        element.getBoundingClientRect().top +
        window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
    onEventClick(eventId);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  const getPeriodColor = (period: string) => {
    const periodData = periods.find((p) => p.id === period);
    return periodData?.color || "#7FA8CC";
  };

  const activeIndex = events.findIndex(
    (event) => event.id === activeEventId,
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        x: isVisible ? 0 : 50,
      }}
      transition={{ duration: 0.3 }}
      className="fixed right-12 top-1/2 -translate-y-1/2 z-20"
    >
      <div className="flex flex-col items-center">
        {/* 向上箭头 */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="w-10 h-10 rounded-full border-2 timeline-text-muted bg-white flex items-center justify-center mb-4 hover:border-[var(--timeline-secondary)] hover:bg-[var(--timeline-secondary)] hover:text-white transition-all duration-200 group timeline-card-shadow"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="timeline-text-muted group-hover:text-white"
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </motion.button>

        {/* 虚线连接 */}
        <div
          className="w-0.5 h-6 mb-4"
          style={{
            borderLeft: "2px dashed var(--timeline-text-muted)",
            opacity: 0.4,
          }}
        />

        {/* 简化的时间节点容器 - 仅显示金色圆形年份标识 */}
        <div className="relative" ref={navigationRef}>
          {/* 主连接线 */}
          <div
            className="absolute left-1/2 top-0 w-0.5 h-full -translate-x-0.5"
            style={{
              borderLeft: "2px dashed var(--timeline-text-muted)",
              opacity: 0.3,
            }}
          />

          {/* 时间节点 - 精确定位 */}
          <div className="relative" style={{ height: '600px' }}>
            {events.map((event, index) => {
              const isActive = activeEventId === event.id;
              const navPosition = getNavNodePosition(event.id);
              
              return (
                <motion.div
                  key={event.id}
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{ top: `${navPosition}px` }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <motion.button
                    whileHover={{ scale: isActive ? 1.1 : 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => scrollToEvent(event.id)}
                    className={`relative transition-all duration-300 cursor-pointer rounded-full flex items-center justify-center ${
                      isActive
                        ? "w-12 h-12 shadow-lg"
                        : "w-8 h-8"
                    }`}
                    style={{
                      backgroundColor: "var(--timeline-secondary)",
                      border: "2px solid white",
                      boxShadow: isActive
                        ? "0 0 20px rgba(196, 155, 97, 0.4), 0 4px 12px rgba(0,0,0,0.15)"
                        : "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    {/* 年份文字 */}
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="font-bold text-white"
                      style={{
                        fontSize: isActive ? "0.75rem" : "0.625rem",
                      }}
                    >
                      {event.year}
                    </motion.span>
                  </motion.button>

                  {/* 激活状态的脉冲效果 */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 rounded-full border-2"
                      style={{
                        borderColor: "var(--timeline-secondary)",
                      }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 虚线连接 */}
        <div
          className="w-0.5 h-6 mt-4"
          style={{
            borderLeft: "2px dashed var(--timeline-text-muted)",
            opacity: 0.4,
          }}
        />

        {/* 向下箭头 */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToBottom}
          className="w-10 h-10 rounded-full border-2 timeline-text-muted bg-white flex items-center justify-center mt-4 hover:border-[var(--timeline-secondary)] hover:bg-[var(--timeline-secondary)] hover:text-white transition-all duration-200 group timeline-card-shadow"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="timeline-text-muted group-hover:text-white"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </motion.button>

        {/* 进度指示器 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <div className="mb-1 timeline-text-muted timeline-text-caption-sm">
            {activeIndex + 1} / {events.length}
          </div>
          <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${((activeIndex + 1) / events.length) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
              className="h-full rounded-full bg-[var(--timeline-secondary)]"
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
