/**
 * @file TimelineNavigation.test.tsx
 * @description TimelineNavigation组件的测试文件
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimelineNavigation } from '@/components/timeline/TimelineNavigation';

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

const mockYears = [
  {
    core_event: "1. 幼年生活",
    timeline: [
      {
        time: "1895年",
        experience: "11月5日，邹韬奋出生于福建省永安市。",
        image: "/images/timeline_images/taofen_children.jpg",
        location: "福建, 永安"
      },
      {
        time: "1900年",
        experience: "父亲去福州任候补，全家迁往。",
        image: "/images/timeline_images/taofen_father.jpg",
        location: "福建, 福州"
      }
    ]
  },
  {
    core_event: "2. 求学时期",
    timeline: [
      {
        time: "1909年",
        experience: "与胞叔邹国珂一同考入福州工业学校。",
        image: "/images/timeline_images/taofen_fuzhougongye.jpg",
        location: "福建, 福州"
      },
      {
        time: "1922年",
        experience: "韬奋担任编辑股主任，主持《教育与职业》月刊。",
        image: "",
        location: "上海"
      }
    ]
  }
];

describe('TimelineNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该正确渲染导航组件', () => {
    const mockOnYearChange = jest.fn();
    
    render(
      <TimelineNavigation
        years={mockYears}
        currentYear="1922"
        onYearChange={mockOnYearChange}
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
    const mockOnYearChange = jest.fn();
    
    render(
      <TimelineNavigation
        years={mockYears}
        currentYear="1922"
        onYearChange={mockOnYearChange}
      />
    );

    // 检查激活的年份节点是否显示年份文字
    const activeButton = screen.getByLabelText('跳转到1922年');
    expect(activeButton).toHaveTextContent('1922');
  });

  it('应该处理年份点击事件', () => {
    const mockOnYearChange = jest.fn();
    const mockElement = {
      getBoundingClientRect: () => ({ top: 100 }),
      offsetTop: 500
    };
    mockQuerySelector.mockReturnValue(mockElement);
    
    render(
      <TimelineNavigation
        years={mockYears}
        currentYear="1922"
        onYearChange={mockOnYearChange}
      />
    );

    // 点击年份节点
    const yearButton = screen.getByLabelText('跳转到1895年');
    fireEvent.click(yearButton);

    expect(mockOnYearChange).toHaveBeenCalledWith('1895');
    expect(mockScrollTo).toHaveBeenCalled();
  });

  it('应该处理向上箭头点击事件', () => {
    const mockOnYearChange = jest.fn();
    
    render(
      <TimelineNavigation
        years={mockYears}
        currentYear="1922"
        onYearChange={mockOnYearChange}
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
    const mockOnYearChange = jest.fn();
    
    render(
      <TimelineNavigation
        years={mockYears}
        currentYear="1922"
        onYearChange={mockOnYearChange}
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
    const mockOnYearChange = jest.fn();
    
    render(
      <TimelineNavigation
        years={mockYears}
        currentYear="1922"
        onYearChange={mockOnYearChange}
      />
    );

    // 检查进度条
    const progressBar = screen.getByText('4 / 4').nextElementSibling;
    expect(progressBar).toBeInTheDocument();
  });

  it('应该正确处理没有当前年份的情况', () => {
    const mockOnYearChange = jest.fn();
    
    render(
      <TimelineNavigation
        years={mockYears}
        currentYear=""
        onYearChange={mockOnYearChange}
      />
    );

    // 应该仍然渲染所有年份节点
    expect(screen.getByLabelText('跳转到1895年')).toBeInTheDocument();
    expect(screen.getByLabelText('跳转到1900年')).toBeInTheDocument();
    
    // 进度显示应该是 0 / 4
    expect(screen.getByText('0 / 4')).toBeInTheDocument();
  });

  it('应该从timeline中正确提取年份', () => {
    const mockOnYearChange = jest.fn();
    
    // 测试数据包含重复年份的情况
    const mockYearsWithDuplicates = [
      {
        core_event: "测试事件1",
        timeline: [
          { time: "1900年", experience: "事件1", image: "", location: "地点1" },
          { time: "1900年", experience: "事件2", image: "", location: "地点2" }
        ]
      },
      {
        core_event: "测试事件2", 
        timeline: [
          { time: "1910年", experience: "事件3", image: "", location: "地点3" }
        ]
      }
    ];
    
    render(
      <TimelineNavigation
        years={mockYearsWithDuplicates}
        currentYear="1900"
        onYearChange={mockOnYearChange}
      />
    );

    // 应该只显示唯一年份：1900, 1910
    expect(screen.getByLabelText('跳转到1900年')).toBeInTheDocument();
    expect(screen.getByLabelText('跳转到1910年')).toBeInTheDocument();
    
    // 进度显示应该是 1 / 2
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });
});
