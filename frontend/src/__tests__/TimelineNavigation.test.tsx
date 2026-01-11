/**
 * @file TimelineNavigation.test.tsx
 * @description TimelineNavigation组件的测试文件
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { TimelineNavigation } from '@/components/timeline/TimelineNavigation';
import { TimelineEvent } from '@/types/personTypes.ts';

const mockEvents: TimelineEvent[] = [
  {
    id: "1895",
    year: 1895,
    title: "1895年：出生于福建永安",
    description: "11月5日，邹韬奋出生于福建省永安市。",
    details: ["地点：福建, 永安"],
    imageUrl: "/images/timeline_images/taofen_children.jpg",
    period: "early"
  },
  {
    id: "1900",
    year: 1900,
    title: "1900年：迁居福州",
    description: "父亲去福州任候补，全家迁往。",
    details: ["地点：福建, 福州"],
    imageUrl: "/images/timeline_images/taofen_father.jpg",
    period: "early"
  },
  {
    id: "1922",
    year: 1922,
    title: "1922年：担任编辑",
    description: "韬奋担任编辑股主任，主持《教育与职业》月刊。",
    details: ["地点：上海"],
    imageUrl: "",
    period: "middle"
  }
];

describe('TimelineNavigation', () => {
  it('应该正确渲染导航组件', () => {
    render(
      <TimelineNavigation
        events={mockEvents}
        activeEventId="1922"
      />
    );

    // 检查容器存在
    const container = screen.getByText('1922');
    expect(container).toBeInTheDocument();
  });

  it('应该显示当前活动事件的年份', () => {
    render(
      <TimelineNavigation
        events={mockEvents}
        activeEventId="1922"
      />
    );

    // 应该显示1922年的文字
    expect(screen.getByText('1922')).toBeInTheDocument();
  });

  it('应该显示不同的活动年份', () => {
    const { rerender } = render(
      <TimelineNavigation
        events={mockEvents}
        activeEventId="1895"
      />
    );

    // 应该显示1895
    expect(screen.getByText('1895')).toBeInTheDocument();

    // 重新渲染为1900
    rerender(
      <TimelineNavigation
        events={mockEvents}
        activeEventId="1900"
      />
    );

    // 应该显示1900
    expect(screen.getByText('1900')).toBeInTheDocument();
  });

  it('应该处理未找到活动事件的情况', () => {
    render(
      <TimelineNavigation
        events={mockEvents}
        activeEventId="nonexistent"
      />
    );

    // 应该不显示任何年份（或显示空字符串）
    const yearText = screen.queryByText(/\d{4}/);
    expect(yearText).not.toBeInTheDocument();
  });

  it('应该正确渲染装饰箭头', () => {
    render(
      <TimelineNavigation
        events={mockEvents}
        activeEventId="1922"
      />
    );

    // 检查SVG箭头元素存在
    const svgs = document.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('应该有正确的CSS类名', () => {
    render(
      <TimelineNavigation
        events={mockEvents}
        activeEventId="1922"
      />
    );

    // 检查年份圆圈的类名
    const yearText = screen.getByText('1922');
    expect(yearText).toHaveClass('font-bold', 'text-white', 'text-lg');
  });
});
