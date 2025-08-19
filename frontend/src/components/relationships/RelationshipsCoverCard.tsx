// RelationshipsCoverCard.tsx - 人物关系页面专用封面卡片组件
'use client';

import React from 'react';
import { CoverCard } from '@/components/common/CoverCard';

export interface RelationshipsCoverCardProps {
  totalPersons: number;
  totalCategories?: number;
  className?: string;
}

export function RelationshipsCoverCard({ 
  totalPersons, 
  totalCategories = 4,
  className = '' 
}: RelationshipsCoverCardProps) {
  return (
    <CoverCard
      theme="timeline" // 复用timeline主题样式
      data={{
        title: "韬奋·人物星图",
        subtitle: "关系网络 · 历史群像",
        description: "这里汇聚着邹韬奋先生一生中的重要人物，从挚爱亲友到志同道合的战友，从学界泰斗到新闻界同仁。通过这张人物关系网络，我们可以深入了解那个时代知识分子的社交圈层和思想交流，感受韬奋先生如何在复杂的人际关系中坚持理想、传播真理。",
        stats: [
          { value: `${totalPersons}位`, label: "相关人物" },
          { value: `${totalCategories}类`, label: "关系分类" }
        ]
      }}
      className={className}
    />
  );
}

export default RelationshipsCoverCard;
