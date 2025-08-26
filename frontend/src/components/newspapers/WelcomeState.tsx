import React from 'react';
import { GuideState } from './GuideState';

interface WelcomeStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * 欢迎状态组件 - 统一的欢迎界面显示
 * 
 * 功能：
 * - 显示欢迎图标、标题和描述
 * - 可选的操作按钮
 * - 统一的样式系统
 */
export const WelcomeState: React.FC<WelcomeStateProps> = ({
  icon = '🎉',
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
      variant="welcome"
      className={className}
    />
  );
};

export default WelcomeState;