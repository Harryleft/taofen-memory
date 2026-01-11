// HandwritingCoverCard.tsx - 手迹页面专用封面卡片组件
'use client';

import React from 'react';
import { CoverCard } from '@/components/common/CoverCard';

// 常量定义
const HANDWRITING_TITLE = "韬奋·笔下风骨";
const HANDWRITING_SUBTITLE = "笔墨传承 · 历史见证";
const HANDWRITING_DESCRIPTION = "邹韬奋先生手迹，见证知识分子心路历程与家国情怀。";
const HANDWRITING_CATEGORIES_COUNT = "3类";
const HANDWRITING_CATEGORIES_LABEL = "题词·文稿·书简";

export interface HandwritingCoverCardProps {
  totalHandwritings?: number;
  className?: string;
}

function getDisplayText(count: number): string {
  return count > 0 ? `${count}份` : '加载中...';
}

export function HandwritingCoverCard({ 
  totalHandwritings = 0, 
  className = '' 
}: HandwritingCoverCardProps) {
  const coverData = {
    title: HANDWRITING_TITLE,
    subtitle: HANDWRITING_SUBTITLE,
    description: HANDWRITING_DESCRIPTION,
    stats: [
      { 
        value: getDisplayText(totalHandwritings), 
        label: "珍贵手迹" 
      },
      { 
        value: HANDWRITING_CATEGORIES_COUNT, 
        label: HANDWRITING_CATEGORIES_LABEL 
      }
    ]
  };

  return (
    <CoverCard
      theme="timeline"
      data={coverData}
      className={className}
    />
  );
}

export default HandwritingCoverCard;
