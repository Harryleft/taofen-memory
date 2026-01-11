import { memo } from 'react';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

const HandwritingErrorState = memo(({ error, onRetry }: ErrorStateProps) => (
  <div className="text-center py-12">
    <div className="text-6xl mb-4">❌</div>
    <h3 className="text-xl font-bold text-charcoal mb-2">加载失败</h3>
    <p className="text-charcoal/60 mb-4">{error}</p>
    <button 
      onClick={onRetry}
      className="bg-gold text-cream px-6 py-2 rounded-lg hover:bg-gold/90 transition-colors"
    >
      重新加载
    </button>
  </div>
));

HandwritingErrorState.displayName = 'HandwritingErrorState';

export default HandwritingErrorState;
