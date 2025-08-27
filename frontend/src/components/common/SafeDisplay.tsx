/**
 * 安全显示组件 - 统一的文本显示防护机制
 * 
 * 特性：
 * - 自动过滤"0"、null、undefined等无效值
 * - 支持自定义验证函数
 * - 提供优雅的降级处理
 * - 开发环境调试支持
 */

import React from 'react';
import { renderSafeDescription } from '@/utils/personDescription';

export interface SafeDisplayProps {
  /** 要显示的值 */
  value: unknown;
  /** 当值无效时显示的降级内容 */
  fallback?: React.ReactNode;
  /** 自定义CSS类名 */
  className?: string;
  /** 最大显示长度 */
  maxLength?: number;
  /** 是否启用开发环境调试 */
  debug?: boolean;
  /** 自定义验证函数 */
  validator?: (value: unknown) => boolean;
  /** 自定义渲染函数 */
  render?: (safeValue: string) => React.ReactNode;
}

/**
 * 默认的显示值验证函数
 */
export const isValidDisplayValue = (value: unknown): boolean => {
  // 基本类型检查
  if (value === null || value === undefined) {
    return false;
  }
  
  // 数字0检查
  if (value === 0) {
    return false;
  }
  
  // 转换为字符串
  let strValue: string;
  try {
    strValue = String(value);
  } catch {
    return false;
  }
  
  const trimmed = strValue.trim();
  
  // 无效值检查
  const invalidValues = [
    '', '0', 'null', 'undefined', 'false', 'true',
    'NaN', 'Infinity', '-Infinity', 'none', 'None', 'NONE'
  ];
  
  if (invalidValues.includes(trimmed)) {
    return false;
  }
  
  // 防止纯数字或符号被意外显示
  if (/^[\d\s\W]+$/.test(trimmed) && trimmed.length < 2) {
    return false;
  }
  
  return trimmed.length > 0;
};

/**
 * 安全显示组件
 * 
 * 用法示例：
 * ```tsx
 * <SafeDisplay value={someText} fallback="暂无描述" />
 * <SafeDisplay value={description} maxLength={100} />
 * <SafeDisplay value={content} render={(text) => <strong>{text}</strong>} />
 * ```
 */
const SafeDisplay: React.FC<SafeDisplayProps> = ({
  value,
  fallback = null,
  className = '',
  maxLength,
  debug = false,
  validator = isValidDisplayValue,
  render
}) => {
  
  // 使用自定义验证函数或默认验证
  const isValid = validator(value);
  
  if (!isValid) {
    if (debug && process.env.NODE_ENV === 'development') {
      console.log('[SafeDisplay] 值无效，使用fallback:', { value, fallback });
    }
    return <>{fallback}</>;
  }
  
  // 使用renderSafeDescription进行最终清理
  const safeValue = renderSafeDescription(value, maxLength);
  
  if (!safeValue) {
    if (debug && process.env.NODE_ENV === 'development') {
      console.log('[SafeDisplay] 清理后值为空，使用fallback:', { value, fallback });
    }
    return <>{fallback}</>;
  }
  
  // 如果有自定义渲染函数，使用它
  if (render) {
    if (debug && process.env.NODE_ENV === 'development') {
      console.log('[SafeDisplay] 使用自定义渲染函数:', { safeValue });
    }
    return render(safeValue);
  }
  
  // 默认渲染
  if (debug && process.env.NODE_ENV === 'development') {
    console.log('[SafeDisplay] 默认渲染:', { safeValue });
  }
  
  return (
    <span className={className}>
      {safeValue}
    </span>
  );
};

export default SafeDisplay;