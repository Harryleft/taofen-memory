/**
 * @file TimelineNavigation.test.tsx
 * @description TimelineNavigation组件的测试文件
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimelineNavigation } from '@/components/timeline/TimelineNavigation';
import { TimelineEvent } from '@/types/personTypes.ts';

// Mock window.scrollTo
const mockScrollTo = jest.fn();
Object.defineProperty(window, 'scrollTo', {
  value: mockScrollTo,
  writable: true
});

// Mock document.querySelector
const mockQuerySelector = jest.fn();
Object.defineProperty(document, 'querySelector', {
  value: mockQuerySelector,
  writable: true
});

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
    id: "1909",
    year: 1909,
    title: "1909年：考入福州工业学校",
    description: "与胞叔邹国珂一同考入福州工业学校。",
    details: ["地点：福建, 福州"],
    imageUrl: "/images/timeline_images/taofen_fuzhougongye.jpg",
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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该正确渲染导航组件', () => {
    const mockOnEventClick = jest.fn();
    
    render(
      <TimelineNavigation
        events={mockEvents}
        activeEventId="1922"
        onEventClick={mockOnEventClick}
      />
    );

    // 检查向上箭头按钮
    expect(screen.getByLabelText('回到顶部')).toBeInTheDocument();
    
    // 检查向下箭头按钮
    expect(screen.getByLabelText('滚动到底部')).toBeInTheDocument();
    
    // 检查年份节点（应该从timeline中提取的年份：1895, 1900, 1909, 1922）
    expect(screen.getByLabelText('跳转到1895年')).toBeInTheDocument();
    expect(screen.getByLabelText('跳转到1900年')).toBeInTheDocument();
    expect(screen.getByLabelText('跳转到1909年')).toBeInTheDocument();
    expect(screen.getByLabelText('跳转到1922年')).toBeInTheDocument();
    
    // 检查进度指示器（1922是第4个年份，总共4个年份）
    expect(screen.getByText('4 / 4')).toBeInTheDocument();
  });

  it('应该显示激活状态的年份节点', () => {
    const mockOnEventClick = jest.fn();
    
    render(
      <TimelineNavigation
        events={mockEvents}
        activeEventId="1922"
        onEventClick={mockOnEventClick}
      />
    );

    // 检查激活的年份节点是否显示年份文字
    const activeButton = screen.getByLabelText('跳转到1922年');
    expect(activeButton).toHaveTextContent('1922');
  });

  it('应该处理年份点击事件', () => {
    const mockOnEventClick = jest.fn();
    const mockElement = {
      getBoundingClientRect: () => ({ top: 100 }),
      offsetTop: 500
    };
    jest.spyOn(document, 'getElementById').mockReturnValue(mockElement);
    
    render(
      <TimelineNavigation
        events={mockEvents}
        activeEventId="1922"
        onEventClick={mockOnEventClick}
      />
    );

    // 点击年份节点
    const yearButton = screen.getByLabelText('跳转到1895年');
    fireEvent.click(yearButton);

    expect(mockOnEventClick).toHaveBeenCalledWith('1895');
    expect(mockScrollTo).toHaveBeenCalled();
  });

  it('应该处理向上箭头点击事件', () => {
    const mockOnEventClick = jest.fn();
    
    render(
      <TimelineNavigation
        events={mockEvents}
        activeEventId="1922"
        onEventClick={mockOnEventClick}
      />
    );

    // 点击向上箭头
    const upButton = screen.getByLabelText('回到顶部');
    fireEvent.click(upButton);

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth'
    });
  });

  it('应该处理向下箭头点击事件', () => {
    const mockOnEventClick = jest.fn();
    
    render(
      <TimelineNavigation
        events={mockEvents}
        activeEventId="1922"
        onEventClick={mockOnEventClick}
      />
    );

    // 点击向下箭头
    const downButton = screen.getByLabelText('滚动到底部');
    fireEvent.click(downButton);

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  });

  it('应该正确计算进度条宽度', () => {
    const mockOnEventClick = jest.fn();
    
    render(
      <TimelineNavigation
        events={mockEvents}
        activeEventId="1922"
        onEventClick={mockOnEventClick}
      />
    );

    // 检查进度条
    const progressBar = screen.getByText('4 / 4').nextElementSibling;
    expect(progressBar).toBeInTheDocument();
  });

  it('应该正确处理没有当前年份的情况', () => {
    const mockOnEventClick = jest.fn();
    
    render(
      <TimelineNavigation
        events={mockEvents}
        activeEventId=""
        onEventClick={mockOnEventClick}
      />
    );

    // 应该仍然渲染所有年份节点
    expect(screen.getByLabelText('跳转到1895年')).toBeInTheDocument();
    expect(screen.getByLabelText('跳转到1900年')).toBeInTheDocument();
    
    // 进度显示应该是 0 / 4
    expect(screen.getByText('0 / 4')).toBeInTheDocument();
  });

  it('应该从timeline中正确提取年份', () => {
    const mockOnEventClick = jest.fn();
    
    // 测试数据包含重复年份的情况
    const mockEventsWithDuplicates: TimelineEvent[] = [
      {
        id: "1900_1",
        year: 1900,
        title: "事件1",
        description: "事件1描述",
        details: ["地点1"],
        imageUrl: "",
        period: "early"
      },
      {
        id: "1900_2",
        year: 1900,
        title: "事件2",
        description: "事件2描述",
        details: ["地点2"],
        imageUrl: "",
        period: "early"
      },
      {
        id: "1910",
        year: 1910,
        title: "事件3",
        description: "事件3描述",
        details: ["地点3"],
        imageUrl: "",
        period: "early"
      }
    ];
    
    render(
      <TimelineNavigation
        events={mockEventsWithDuplicates}
        activeEventId="1900"
        onEventClick={mockOnEventClick}
      />
    );

    // 应该只显示唯一年份：1900, 1910
    expect(screen.getByLabelText('跳转到1900年')).toBeInTheDocument();
    expect(screen.getByLabelText('跳转到1910年')).toBeInTheDocument();
    
    // 进度显示应该是 1 / 2
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });
});
