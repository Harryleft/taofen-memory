import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  message: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  action,
  className = ''
}) => {
  return (
    <div className={`newspapers-empty-state ${className}`}>
      <div className="newspapers-empty-state__content">
        <div className="newspapers-empty-state__icon">
          {icon}
        </div>
        <h3 className="newspapers-empty-state__title">
          {title}
        </h3>
        <p className="newspapers-empty-state__message">
          {message}
        </p>
        {action && (
          <div className="newspapers-empty-state__action">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;