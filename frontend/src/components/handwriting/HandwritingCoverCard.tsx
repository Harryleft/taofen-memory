// HandwritingCoverCard.tsx - 手迹页面专用封面卡片组件
'use client';

import React from 'react';
import { CoverCard } from '@/components/common/CoverCard';

export interface HandwritingCoverCardProps {
  totalHandwritings: number;
  className?: string;
}

export function HandwritingCoverCard({ 
  totalHandwritings, 
  className = '' 
}: HandwritingCoverCardProps) {
  return (
    <CoverCard
      theme="timeline" // 复用timeline主题样式
      data={{
        title: "韬奋·墨迹流年",
        subtitle: "笔墨传承 · 历史见证",
        description: "这里珍藏着邹韬奋先生一生的手迹真迹，从早期的求学笔记到后期的抗战檄文，每一页手稿都承载着深厚的历史内涵和人文精神。通过这些珍贵的手迹，我们可以触摸到那个风云激荡年代里，一位知识分子的心路历程和家国情怀。",
        stats: [
          { value: `${totalHandwritings}份`, label: "珍贵手迹" },
          { value: "3类", label: "题词·文稿·书简" }
        ]
      }}
      className={className}
    />
  );
}

export default HandwritingCoverCard;
