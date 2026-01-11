import React from 'react';

// 生平时光轴模块的专属装饰元素
export const TimelineDecorativeElement = () => (
  <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200 -z-10" />
);

// 人物关系模块的专属装饰元素
export const RelationshipsDecorativeElement = () => (
  <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
);

// 手稿文献模块的专属装饰元素
export const HandwritingDecorativeElement = () => (
  <div className="absolute bottom-0 left-1/4 w-24 h-24 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
);