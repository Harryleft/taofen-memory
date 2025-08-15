/**
 * @file TimelineNavigation.test.tsx
 * @description TimelineNavigation组件的测试文件
 */
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
    year: '1915',
    label: '1915年的重要事件',
    events: [
      {
        time: '1915年',
        experience: '考入上海圣约翰大学',
        image: 'test-image-1.jpg',
        location: '上海'
      }
    ]
  },
  {
    year: '1922',
    label: '1922年的重要事件',
    events: [
      {
        time: '1922年',
        experience: '创办《生活》周刊',
        image: 'test-image-2.jpg',
        location: '上海'
      }
    ]
  },
  {
    year: '1926',
    label: '1926年的重要事件',
    events: [
      {
        time: '1926年',
        experience: '《生活》周刊影响力扩大',
        image: 'test-image-3.jpg',
        location: '上海'
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
    
    // 检查年份节点
    expect(screen.getByLabelText('跳转到1915年')).toBeInTheDocument();
    expect(screen.getByLabelText('跳转到1922年')).toBeInTheDocument();
    expect(screen.getByLabelText('跳转到1926年')).toBeInTheDocument();
    
    // 检查进度指示器
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
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
    const yearButton = screen.getByLabelText('跳转到1915年');
    fireEvent.click(yearButton);

    expect(mockOnYearChange).toHaveBeenCalledWith('1915');
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
    const progressBar = screen.getByText('2 / 3').nextElementSibling;
    expect(progressBar).toBeInTheDocument();
  });
});

