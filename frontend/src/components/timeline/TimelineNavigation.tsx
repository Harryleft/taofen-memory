"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { TimelineEvent, periods } from "./timeline-data.ts";

interface TimelineNavigationProps {
  events: TimelineEvent[];
  activeEventId: string;
  onEventClick: (eventId: string) => void;
}

export function TimelineNavigation({
  events,
  activeEventId,
  onEventClick,
}: TimelineNavigationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () =>
      window.removeEventListener("scroll", handleScroll);
  }, []);

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

        {/* 时间节点容器 */}
        <div className="relative">
          {/* 主连接线 */}
          <div
            className="absolute left-1/2 top-0 w-0.5 h-full -translate-x-0.5"
            style={{
              borderLeft:
                "2px dashed var(--timeline-text-muted)",
              opacity: 0.3,
            }}
          />

          {/* 时间节点 */}
          <div className="relative space-y-8">
            {events.map((event, index) => {
              const isActive =
                activeEventId === event.id;
              const periodColor = getPeriodColor(event.period);

              return (
                <div
                  key={event.id}
                  className="relative flex items-center justify-center"
                >
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      scrollToEvent(event.id)
                    }
                    className={`relative transition-all duration-300 cursor-pointer border-2 border-white rounded-full flex items-center justify-center ${
                      isActive
                        ? "w-16 h-16 shadow-lg"
                        : "w-4 h-4 hover:w-6 hover:h-6"
                    }`}
                    style={{
                      backgroundColor: isActive
                        ? "var(--timeline-secondary)"
                        : periodColor,
                      boxShadow: isActive
                        ? `0 0 20px ${periodColor}40, 0 4px 12px rgba(0,0,0,0.15)`
                        : "var(--timeline-card-shadow)",
                    }}
                  >
                    {/* 年份文字（仅在激活时显示） */}
                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="font-bold text-white"
                        style={{
                          fontSize: "var(--text-caption)",
                        }}
                      >
                        {event.year}
                      </motion.span>
                    )}

                    {/* 内部高亮点（非激活状态） */}
                    {!isActive && (
                      <div className="w-1 h-1 rounded-full bg-white opacity-80" />
                    )}
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
                        borderColor:
                          "var(--timeline-secondary)",
                      }}
                    />
                  )}
                </div>
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
