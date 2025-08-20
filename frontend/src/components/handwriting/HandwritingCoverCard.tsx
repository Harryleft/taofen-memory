// HandwritingCoverCard.tsx - 手迹页面专用封面卡片组件
'use client';

import React from 'react';
import { CoverCard } from '@/components/common/CoverCard';

export interface HandwritingCoverCardProps {
  totalHandwritings?: number;
  className?: string;
}

export function HandwritingCoverCard({ 
  totalHandwritings = 0, 
  className = '' 
}: HandwritingCoverCardProps) {
  return (
    <CoverCard
      theme="timeline" // 复用timeline主题样式
      data={{
        title: "韬奋·笔下风骨",
        subtitle: "笔墨传承 · 历史见证",
        description: "邹韬奋先生手迹，见证知识分子心路历程与家国情怀。",
        stats: [
          { value: totalHandwritings > 0 ? `${totalHandwritings}份` : '加载中...', label: "珍贵手迹" },
          { value: "3类", label: "题词·文稿·书简" }
        ]
      }}
      className={className}
    />
  );
}

export default HandwritingCoverCard;
