import React from 'react';
import { 
  renderSafeDescription, 
  getDescriptionPreview,
  isDescriptionTooLong 
} from '@/utils/personDescription';

interface PersonDescriptionProps {
  /** 人物描述文本 */
  description: unknown;
  /** 最大显示长度（可选） */
  maxLength?: number;
  /** CSS类名 */
  className?: string;
  /** 是否显示为预览模式（更简洁的样式） */
  isPreview?: boolean;
  /** 当没有有效描述时显示的占位符 */
  placeholder?: React.ReactNode;
  /** 点击事件处理 */
  onClick?: () => void;
  /** 鼠标悬停时显示完整内容的工具提示 */
  showTooltip?: boolean;
  /** 自定义渲染函数 */
  render?: (descriptionText: string) => React.ReactNode;
}

/**
 * 人物描述通用组件
 * 
 * 特性：
 * - 自动过滤"0"、null、undefined等无效值
 * - 支持长度限制和截断
 * - 支持工具提示显示完整内容
 * - 统一的样式和行为
 * - 完全的可访问性支持
 */
const PersonDescription: React.FC<PersonDescriptionProps> = ({
  description,
  maxLength = 80,
  className = '',
  isPreview = false,
  placeholder = null,
  onClick,
  showTooltip = true,
  render,
}) => {
  // 获取安全的描述文本
  const descriptionText = renderSafeDescription(description, maxLength);
  
  // 如果没有有效描述，显示占位符或不渲染
  if (!descriptionText) {
    return placeholder ? <div className={className}>{placeholder}</div> : null;
  }
  
  // 如果有自定义渲染函数，使用它
  if (render) {
    return render(descriptionText);
  }
  
  // 检查是否需要工具提示
  const needsTooltip = showTooltip && isDescriptionTooLong(description, maxLength);
  const tooltipText = needsTooltip ? getDescriptionPreview(description, 200) : undefined;
  
  // 基础样式类
  const baseClasses = isPreview 
    ? 'text-sm text-gray-600 leading-relaxed' 
    : 'text-gray-700 leading-relaxed';
  
  // 组合所有CSS类
  const combinedClasses = `${baseClasses} ${className}`.trim();
  
  const renderContent = () => (
    <span 
      className={combinedClasses}
      onClick={onClick}
      title={tooltipText}
      style={{
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {descriptionText}
    </span>
  );
  
  return renderContent();
};

export default PersonDescription;