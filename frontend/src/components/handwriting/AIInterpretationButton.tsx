import { useState } from 'react';
import { Brain, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { aiService, type AIInterpretationResponse } from '@/services/aiService';
import { useToast } from './Toast';
import type { TransformedHandwritingItem } from '@/hooks/useHandwritingData.ts';

interface AIInterpretationButtonProps {
  item: TransformedHandwritingItem;
  onInterpretationReady: (interpretation: string) => void;
  className?: string;
}

// AI思考过程的步骤
const AI_THINKING_STEPS = [
  { id: 'analyzing', text: '正在分析原文...', duration: 1000 },
  { id: 'understanding', text: '正在理解背景...', duration: 1200 },
  { id: 'generating', text: '正在生成解读...', duration: 1500 },
  { id: 'polishing', text: '正在优化表达...', duration: 800 }
];

export const AIInterpretationButton = ({ 
  item, 
  onInterpretationReady, 
  className = '' 
}: AIInterpretationButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const { showSuccess, showError } = useToast();

  // 处理AI解读请求
  const handleInterpret = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    setCurrentStep(0);
    setProgress(0);

    try {
      // 模拟AI思考过程的步骤展示
      for (let i = 0; i < AI_THINKING_STEPS.length; i++) {
        setCurrentStep(i);
        setProgress(((i + 1) / AI_THINKING_STEPS.length) * 80); // 保留20%给实际API调用
        
        // 等待当前步骤的时间
        await new Promise(resolve => setTimeout(resolve, AI_THINKING_STEPS[i].duration));
      }

      // 实际API调用
      const response: AIInterpretationResponse = await aiService.interpretHandwriting({
        title: item.title,
        content: item.originalData.原文,
        notes: item.originalData.注释 || '',
        time: item.originalData.时间 || ''
      });

      setProgress(100);

      if (response.success && response.interpretation) {
        onInterpretationReady(response.interpretation);
        showSuccess('AI解读完成', '为您生成了智能解读内容');
      } else {
        setError(response.error || '解读失败，请稍后重试');
        showError('解读失败', response.error || '请稍后重试');
      }
    } catch (err) {
      setError('网络请求失败，请检查网络连接');
      showError('网络错误', '请检查网络连接后重试');
      console.error('AI解读请求失败:', err);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className={`ai-interpretation-container ${className}`}>
      {/* 主要按钮 */}
      <button
        onClick={handleInterpret}
        disabled={isLoading}
        className={`
          group relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
          transition-all duration-300 transform hover:scale-105 active:scale-95
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500
          ${isLoading 
            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg cursor-wait' 
            : error 
              ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-600 hover:from-red-100 hover:to-red-200 border border-red-200' 
              : 'bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-600 hover:from-cyan-100 hover:to-blue-100 shadow-md hover:shadow-lg border border-cyan-100'
          }
        `}
        title={error ? '点击重试' : 'AI智能解读'}
      >
        
        {/* 按钮图标 */}
        {isLoading ? (
          <div className="relative">
            <Loader2 className="w-4 h-4 animate-spin" />
            <div className="absolute -top-1 -right-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
            </div>
          </div>
        ) : error ? (
          <AlertCircle className="w-4 h-4" />
        ) : (
          <div className="relative">
            <Brain className="w-4 h-4" />
            <Sparkles className="absolute -top-1 -right-1 w-2 h-2 text-yellow-400 animate-pulse" />
          </div>
        )}
        
        {/* 按钮文字 */}
        <span className="relative z-10">
          {isLoading ? '解读中...' : error ? '重试' : 'AI解读'}
        </span>
        
        {/* 加载时的进度条 */}
        {isLoading && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </button>

      {/* 当前步骤提示 */}
      {isLoading && (
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-600 font-medium">
            {AI_THINKING_STEPS[currentStep]?.text}
          </p>
          <div className="flex justify-center gap-1 mt-2">
            {AI_THINKING_STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`
                  w-2 h-2 rounded-full transition-all duration-300
                  ${index <= currentStep 
                    ? 'bg-cyan-500 scale-110' 
                    : 'bg-gray-300'
                  }
                `}
              />
            ))}
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-red-700 font-medium">{error}</p>
              <p className="text-xs text-red-600 mt-1">请检查网络连接后重试</p>
            </div>
          </div>
        </div>
      )}


      {/* 使用提示 */}
      {!isLoading && !error && (
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500">
            <Brain className="w-3 h-3 inline mr-1" />
            点击获取AI智能解读，深入理解原文内涵
          </p>
        </div>
      )}
    </div>
  );
};