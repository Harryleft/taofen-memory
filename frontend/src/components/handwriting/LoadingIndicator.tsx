import { memo } from 'react';

interface LoadingIndicatorProps {
  message?: string;
}

const LoadingIndicator = memo(({ message = "加载中..." }: LoadingIndicatorProps) => (
  <div className="flex justify-center items-center py-12">
    <div className="flex items-center gap-2 text-charcoal/60">
      <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
      <span>{message}</span>
    </div>
  </div>
));

LoadingIndicator.displayName = 'LoadingIndicator';

export default LoadingIndicator;