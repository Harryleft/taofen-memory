import { useState } from 'react';
import { Brain, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { aiService, type AIInterpretationResponse } from '@/services/aiService';
import type { TransformedHandwritingItem } from '@/hooks/useHandwritingData.ts';

interface AIInterpretationButtonProps {
  item: TransformedHandwritingItem;
  onInterpretationReady: (interpretation: string) => void;
  className?: string;
}

export const AIInterpretationButton = ({ 
  item, 
  onInterpretationReady, 
  className = '' 
}: AIInterpretationButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInterpret = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response: AIInterpretationResponse = await aiService.interpretHandwriting({
        title: item.title,
        content: item.originalData.原文,
        notes: item.originalData.注释 || '',
        time: item.originalData.时间 || ''
      });

      if (response.success && response.interpretation) {
        onInterpretationReady(response.interpretation);
      } else {
        setError(response.error || '解读失败，请稍后重试');
      }
    } catch (err) {
      setError('网络请求失败，请检查网络连接');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    handleInterpret();
  };

  return (
    <div className={`ai-interpretation-container ${className}`}>
      <button
        onClick={handleInterpret}
        disabled={isLoading}
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
          transition-all duration-200
          ${isLoading 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-blue-50 text-blue-600 hover:bg-blue-100 active:bg-blue-200'
          }
          ${error ? 'ring-2 ring-red-200' : ''}
        `}
        title={error ? '点击重试' : 'AI智能解读'}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            解读中...
          </>
        ) : error ? (
          <>
            <AlertCircle className="w-4 h-4" />
            重试
          </>
        ) : (
          <>
            <Brain className="w-4 h-4" />
            AI解读
          </>
        )}
      </button>

      {error && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
          {error}
        </div>
      )}

      <div className="mt-1 text-xs text-gray-500">
        {isLoading && '正在为您生成智能解读，请稍候...'}
        {!isLoading && !error && '点击获取AI智能解读'}
      </div>
    </div>
  );
};