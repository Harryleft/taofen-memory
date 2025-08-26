import React from 'react';

interface GuideStateStep {
  number: number;
  text: string;
}

interface GuideStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  steps?: GuideStateStep[];
  action?: React.ReactNode;
  variant?: 'guide' | 'empty' | 'welcome';
  className?: string;
}

/**
 * 统一的引导状态组件
 * 
 * 功能：
 * - 支持三种变体：guide（引导）、empty（空状态）、welcome（欢迎）
 * - 统一的样式系统
 * - 可配置的步骤说明
 * - 响应式设计
 */
export const GuideState: React.FC<GuideStateProps> = ({
  icon = '📚',
  title,
  message,
  steps = [],
  action,
  variant = 'guide',
  className = ''
}) => {
  return (
    <div className={`newspapers-guide-state newspapers-guide-state--${variant} ${className}`}>
      <div className="newspapers-guide-state__content">
        <div className="newspapers-guide-state__icon">{icon}</div>
        <h2 className="newspapers-guide-state__title">{title}</h2>
        <p className="newspapers-guide-state__message">{message}</p>
        
        {steps.length > 0 && (
          <div className="newspapers-guide-state__steps">
            {steps.map((step, index) => (
              <div key={index} className="newspapers-guide-state__step">
                <div className="newspapers-guide-state__step-number">{step.number}</div>
                <div className="newspapers-guide-state__step-text">{step.text}</div>
              </div>
            ))}
          </div>
        )}
        
        {action && (
          <div className="newspapers-guide-state__action">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuideState;