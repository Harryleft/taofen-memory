"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import { TimelineEvent } from "./timeline-data.ts";

interface TimelineNavigationProps {
  events: TimelineEvent[];
  activeEventId: string;
}

export function TimelineNavigation({
  events,
  activeEventId,
}: TimelineNavigationProps) {
  const [isVisible, setIsVisible] = useState(false);
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

  // 设置滚动监听
  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const activeIndex = events.findIndex(
    (event) => event.id === activeEventId,
  );

  // 获取当前活动事件的年份
  const getActiveYear = () => {
    const activeEvent = events.find(event => event.id === activeEventId);
    return activeEvent ? activeEvent.year : '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        x: isVisible ? 0 : 50,
      }}
      transition={{ duration: 0.3 }}
      className="fixed right-1/2 top-1/2 translate-x-1/2 -translate-y-1/2 z-20"
    >
      <div className="flex flex-col items-center">
        {/* 单个金色圆形年份标识 */}
        <motion.div
          className="relative"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* 金色圆形背景 */}
          <motion.div
            className="w-16 h-16 rounded-full flex items-center justify-center cursor-pointer"
            style={{
              backgroundColor: "var(--timeline-secondary)",
              border: "3px solid white",
              boxShadow: "0 0 25px rgba(196, 155, 97, 0.4), 0 6px 20px rgba(0,0,0,0.15)",
            }}
            animate={{
              boxShadow: [
                "0 0 25px rgba(196, 155, 97, 0.4), 0 6px 20px rgba(0,0,0,0.15)",
                "0 0 35px rgba(196, 155, 97, 0.6), 0 8px 25px rgba(0,0,0,0.2)",
                "0 0 25px rgba(196, 155, 97, 0.4), 0 6px 20px rgba(0,0,0,0.15)"
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* 动态年份文字 */}
            <motion.span
              key={activeEventId}
              initial={{ opacity: 0, scale: 0.8, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="font-bold text-white text-lg"
            >
              {getActiveYear()}
            </motion.span>
          </motion.div>

          {/* 脉冲效果 */}
          <motion.div
            className="absolute inset-0 rounded-full border-2"
            style={{
              borderColor: "var(--timeline-secondary)",
            }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

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
          <div className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
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
