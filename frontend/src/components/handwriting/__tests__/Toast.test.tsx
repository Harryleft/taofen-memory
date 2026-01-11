/**
 * Toast组件单元测试
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Toast, useToast } from '../Toast';

describe('Toast组件', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Toast渲染', () => {
    it('应该渲染success类型的Toast', () => {
      const message = {
        id: '1',
        type: 'success' as const,
        title: '成功',
        message: '操作成功完成'
      };
      const onDismiss = jest.fn();

      render(<Toast message={message} onDismiss={onDismiss} />);

      expect(screen.getByText('成功')).toBeInTheDocument();
      expect(screen.getByText('操作成功完成')).toBeInTheDocument();
      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('应该渲染error类型的Toast', () => {
      const message = {
        id: '2',
        type: 'error' as const,
        title: '错误',
        message: '操作失败'
      };
      const onDismiss = jest.fn();

      render(<Toast message={message} onDismiss={onDismiss} />);

      expect(screen.getByText('错误')).toBeInTheDocument();
      expect(screen.getByText('操作失败')).toBeInTheDocument();
      expect(screen.getByText('✕')).toBeInTheDocument();
    });

    it('应该渲染warning类型的Toast', () => {
      const message = {
        id: '3',
        type: 'warning' as const,
        title: '警告',
        message: '请注意'
      };
      const onDismiss = jest.fn();

      render(<Toast message={message} onDismiss={onDismiss} />);

      expect(screen.getByText('警告')).toBeInTheDocument();
      expect(screen.getByText('⚠')).toBeInTheDocument();
    });

    it('应该渲染info类型的Toast', () => {
      const message = {
        id: '4',
        type: 'info' as const,
        title: '信息',
        message: '提示'
      };
      const onDismiss = jest.fn();

      render(<Toast message={message} onDismiss={onDismiss} />);

      expect(screen.getByText('信息')).toBeInTheDocument();
      expect(screen.getByText('ℹ')).toBeInTheDocument();
    });

    it('应该在没有message时不显示消息内容', () => {
      const message = {
        id: '5',
        type: 'info' as const,
        title: '仅标题'
      };
      const onDismiss = jest.fn();

      render(<Toast message={message} onDismiss={onDismiss} />);

      expect(screen.getByText('仅标题')).toBeInTheDocument();
      // 不应该有额外的p元素
      const paragraphs = screen.queryAllByText(/.*/, { selector: 'p' });
      expect(paragraphs.length).toBe(0);
    });
  });

  describe('Toast交互', () => {
    it('应该在关闭按钮点击后消失', () => {
      const message = {
        id: '6',
        type: 'info' as const,
        title: '测试'
      };
      const onDismiss = jest.fn();

      render(<Toast message={message} onDismiss={onDismiss} />);

      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);

      // 等待动画完成
      waitFor(() => {
        expect(onDismiss).toHaveBeenCalledWith('6');
      });
    });

    it('应该在指定时间后自动消失', () => {
      const message = {
        id: '7',
        type: 'info' as const,
        title: '自动消失',
        duration: 3000
      };
      const onDismiss = jest.fn();

      render(<Toast message={message} onDismiss={onDismiss} />);

      // 快进时间
      jest.advanceTimersByTime(3000);
      jest.advanceTimersByTime(300); // 等待退出动画

      expect(onDismiss).toHaveBeenCalledWith('7');
    });

    it('应该使用默认duration（3000ms）', () => {
      const message = {
        id: '8',
        type: 'info' as const,
        title: '默认时间'
      };
      const onDismiss = jest.fn();

      render(<Toast message={message} onDismiss={onDismiss} />);

      jest.advanceTimersByTime(3000);
      jest.advanceTimersByTime(300);

      expect(onDismiss).toHaveBeenCalledWith('8');
    });
  });

  describe('useToast Hook', () => {
    it('应该添加新的Toast消息', () => {
      const TestComponent = () => {
        const { messages, addToast } = useToast();
        return (
          <div>
            <button onClick={() => addToast({
              type: 'success',
              title: '测试',
              message: '消息'
            })}>
              添加Toast
            </button>
            <div data-testid="toast-count">{messages.length}</div>
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByTestId('toast-count')).toHaveTextContent('0');

      fireEvent.click(screen.getByText('添加Toast'));

      expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
    });

    it('应该移除指定的Toast消息', () => {
      const TestComponent = () => {
        const { messages, addToast, removeToast } = useToast();

        return (
          <div>
            <button onClick={() => addToast({
              type: 'info',
              title: '测试'
            })}>
              添加
            </button>
            {messages.map(msg => (
              <button
                key={msg.id}
                onClick={() => removeToast(msg.id)}
              >
                移除-{msg.id}
              </button>
            ))}
            <div data-testid="toast-count">{messages.length}</div>
          </div>
        );
      };

      render(<TestComponent />);

      // 添加Toast
      fireEvent.click(screen.getByText('添加'));
      expect(screen.getByTestId('toast-count')).toHaveTextContent('1');

      // 移除Toast
      const removeButton = screen.getByText(/移除-/);
      fireEvent.click(removeButton);
      expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
    });

    it('应该提供便捷方法来添加不同类型的Toast', () => {
      const TestComponent = () => {
        const { showSuccess, showError, showInfo, showWarning } = useToast();

        return (
          <div>
            <button onClick={() => showSuccess('成功标题', '成功消息')}>Success</button>
            <button onClick={() => showError('错误标题', '错误消息')}>Error</button>
            <button onClick={() => showInfo('信息标题', '信息消息')}>Info</button>
            <button onClick={() => showWarning('警告标题', '警告消息')}>Warning</button>
          </div>
        );
      };

      render(<TestComponent />);

      // 测试所有便捷方法是否可以正常调用
      expect(() => fireEvent.click(screen.getByText('Success'))).not.toThrow();
      expect(() => fireEvent.click(screen.getByText('Error'))).not.toThrow();
      expect(() => fireEvent.click(screen.getByText('Info'))).not.toThrow();
      expect(() => fireEvent.click(screen.getByText('Warning'))).not.toThrow();
    });

    it('应该为每个Toast生成唯一ID', () => {
      const TestComponent = () => {
        const { messages, addToast } = useToast();

        return (
          <div>
            <button onClick={() => addToast({ type: 'info', title: '1' })}>
              添加1
            </button>
            <button onClick={() => addToast({ type: 'info', title: '2' })}>
              添加2
            </button>
            <div data-testid="ids">{messages.map(m => m.id).join(',')}</div>
          </div>
        );
      };

      render(<TestComponent />);

      fireEvent.click(screen.getByText('添加1'));
      fireEvent.click(screen.getByText('添加2'));

      const idsText = screen.getByTestId('ids').textContent;
      const ids = idsText ? idsText.split(',') : [];

      expect(ids.length).toBe(2);
      expect(ids[0]).not.toBe(ids[1]); // ID应该不同
    });
  });
});
