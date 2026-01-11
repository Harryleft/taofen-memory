import { memo } from 'react';

interface EmptyStateProps {
  message?: string;
}

const HandwritingEmptyState = memo(({ message = "未找到相关手迹" }: EmptyStateProps) => (
  <div className="text-center py-12">
    <div className="text-6xl mb-4">📜</div>
    <h3 className="text-xl font-bold text-charcoal mb-2">{message}</h3>
    <p className="text-charcoal/60">请尝试调整搜索条件</p>
  </div>
));

HandwritingEmptyState.displayName = 'HandwritingEmptyState';

export default HandwritingEmptyState;
