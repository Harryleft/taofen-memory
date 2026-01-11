import React from 'react';
import { GuideState } from './GuideState';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * 空状态组件 - 统一的空状态显示
 * 
 * 功能：
 * - 显示空状态图标、标题和描述
 * - 可选的操作按钮
 * - 统一的样式系统
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📄',
  title,
  message,
  action,
  className = ''
}) => {
  return (
    <GuideState
      icon={icon}
      title={title}
      message={message}
      action={action}
      variant="empty"
      className={className}
    />
  );
};

export default EmptyState;