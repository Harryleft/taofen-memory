import React, { useState, useEffect } from 'react';

interface GuideTipProps {
  message: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  showDelay?: number;
  autoHide?: boolean;
  hideDelay?: number;
  children: React.ReactNode;
}

export const GuideTip: React.FC<GuideTipProps> = ({
  message,
  position = 'bottom',
  showDelay = 1000,
  autoHide = true,
  hideDelay = 5000,
  children
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, showDelay);

    if (autoHide) {
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, showDelay + hideDelay);

      return () => clearTimeout(hideTimer);
    }

    return () => clearTimeout(showTimer);
  }, [showDelay, autoHide, hideDelay]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  if (isDismissed) {
    return <>{children}</>;
  }

  return (
    <div className="newspapers-guide-tip">
      {children}
      {isVisible && (
        <div className={`newspapers-guide-tip__tooltip newspapers-guide-tip__tooltip--${position}`}>
          <div className="newspapers-guide-tip__content">
            <p className="newspapers-guide-tip__message">{message}</p>
            <button
              onClick={handleDismiss}
              className="newspapers-guide-tip__close"
              aria-label="关闭提示"
            >
              ✕
            </button>
          </div>
          <div className="newspapers-guide-tip__arrow"></div>
        </div>
      )}
    </div>
  );
};

export default GuideTip;