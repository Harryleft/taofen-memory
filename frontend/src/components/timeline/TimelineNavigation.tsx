"use client";

import React from "react";
import { motion } from "framer-motion";
import { TimelineEvent } from "@/types/personTypes.ts";

interface TimelineNavigationProps {
  events: TimelineEvent[];
  activeEventId: string;
}

export function TimelineNavigation({
  events,
  activeEventId,
}: TimelineNavigationProps) {

  
  // 获取当前活动事件的年份
  const getActiveYear = () => {
    const activeEvent = events.find(event => event.id === activeEventId);
    return activeEvent ? activeEvent.year : '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{ duration: 0.3 }}
      className="fixed right-8 top-1/2 -translate-y-1/2 z-20"
    >
      <div className="flex flex-col items-center space-y-8">
        {/* 上方装饰箭头 */}
        <motion.div
          className="text-[var(--timeline-secondary)]"
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
        </motion.div>

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

        {/* 下方装饰箭头 */}
        <motion.div
          className="text-[var(--timeline-secondary)]"
          animate={{
            y: [0, 5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1, // 与上方箭头形成错位动画
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </motion.div>

      </div>
    </motion.div>
  );
}
