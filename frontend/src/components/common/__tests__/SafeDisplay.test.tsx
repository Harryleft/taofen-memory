/**
 * SafeDisplay组件单元测试
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import SafeDisplay, { isValidDisplayValue } from '../SafeDisplay';

describe('SafeDisplay组件', () => {
  describe('isValidDisplayValue验证函数', () => {
    it('应该拒绝null和undefined', () => {
      expect(isValidDisplayValue(null)).toBe(false);
      expect(isValidDisplayValue(undefined)).toBe(false);
    });

    it('应该拒绝数字0', () => {
      expect(isValidDisplayValue(0)).toBe(false);
    });

    it('应该拒绝无效字符串', () => {
      expect(isValidDisplayValue('')).toBe(false);
      expect(isValidDisplayValue('0')).toBe(false);
      expect(isValidDisplayValue('null')).toBe(false);
      expect(isValidDisplayValue('undefined')).toBe(false);
    });

    it('应该接受有效的字符串', () => {
      expect(isValidDisplayValue('Hello')).toBe(true);
      expect(isValidDisplayValue('测试文本')).toBe(true);
      expect(isValidDisplayValue('123')).toBe(true);
    });

    it('应该接受非零数字', () => {
      expect(isValidDisplayValue(1)).toBe(true);
      expect(isValidDisplayValue(100)).toBe(true);
      expect(isValidDisplayValue(-1)).toBe(true);
    });
  });

  describe('组件渲染', () => {
    it('应该渲染有效的值', () => {
      render(<SafeDisplay value="有效的文本" />);
      expect(screen.getByText('有效的文本')).toBeInTheDocument();
    });

    it('应该在值无效时显示fallback', () => {
      render(
        <SafeDisplay
          value={null}
          fallback="暂无数据"
        />
      );
      expect(screen.getByText('暂无数据')).toBeInTheDocument();
    });

    it('应该正确应用className', () => {
      const { container } = render(
        <SafeDisplay
          value="测试"
          className="test-class"
        />
      );
      const span = container.querySelector('span');
      expect(span).toHaveClass('test-class');
    });

    it('应该截断超过maxLength的文本', () => {
      render(
        <SafeDisplay
          value="这是一段很长的文本，应该被截断"
          maxLength={10}
        />
      );
      expect(screen.getByText('这是一段很长的')).toBeInTheDocument();
    });

    it('应该使用自定义验证函数', () => {
      const customValidator = jest.fn().mockReturnValue(true);
      render(
        <SafeDisplay
          value="custom"
          validator={customValidator}
        />
      );
      expect(customValidator).toHaveBeenCalledWith('custom');
      expect(screen.getByText('custom')).toBeInTheDocument();
    });

    it('应该使用自定义渲染函数', () => {
      const customRender = jest.fn().mockReturnValue(<strong>强化的文本</strong>);
      render(
        <SafeDisplay
          value="测试"
          render={customRender}
        />
      );
      expect(customRender).toHaveBeenCalledWith('测试');
      expect(screen.getByText('强化的文本')).toBeInTheDocument();
    });

    it('应该在debug模式下输出日志', () => {
      const consoleLog = jest.spyOn(console, 'log').mockImplementation();
      process.env.NODE_ENV = 'development';

      render(
        <SafeDisplay
          value={null}
          fallback="fallback"
          debug={true}
        />
      );

      expect(consoleLog).toHaveBeenCalledWith(
        '[SafeDisplay]',
        '值无效，使用fallback:',
        { value: null, fallback: 'fallback' }
      );

      consoleLog.mockRestore();
      process.env.NODE_ENV = 'test';
    });

    it('应该处理边界情况', () => {
      // 测试对象
      const { container: container1 } = render(
        <SafeDisplay value={{ toString: () => 'object' }} />
      );
      expect(container1.textContent).toBe('object');

      // 测试数组
      const { container: container2 } = render(
        <SafeDisplay value={[1, 2, 3].toString()} />
      );
      expect(container2.textContent).toBe('1,2,3');
    });
  });

  describe('默认行为', () => {
    it('应该在无fallback时显示空内容', () => {
      const { container } = render(<SafeDisplay value={null} />);
      expect(container.textContent).toBe('');
    });

    it('应该传递额外的props到span元素', () => {
      const { container } = render(
        <SafeDisplay
          value="测试"
          data-testid="safe-display"
        />
      );
      const span = container.querySelector('[data-testid="safe-display"]');
      expect(span).toBeInTheDocument();
    });
  });
});
