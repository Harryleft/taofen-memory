import { useState, useEffect, useRef } from 'react';
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
  
  // 用于中断请求的控制器
  const abortControllerRef = useRef<AbortController | null>(null);
  // 用于跟踪当前请求的item ID
  const currentItemIdRef = useRef<string>('');

  // 重置所有状态到默认值
  const resetToDefaultState = () => {
    setIsLoading(false);
    setError(null);
    setCurrentStep(0);
    setProgress(0);
    currentItemIdRef.current = '';
    
    // 中断正在进行的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  // 当item变化时，重置状态并中断正在进行的请求
  useEffect(() => {
    // 如果当前有正在进行的请求，且item ID发生了变化
    if (isLoading && currentItemIdRef.current !== item.id) {
      console.log('用户翻页，中断正在进行的AI解读请求');
      resetToDefaultState();
    }
    
    // 更新当前item ID
    currentItemIdRef.current = item.id;
  }, [item.id, isLoading]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // 处理AI解读请求
  const handleInterpret = async () => {
    if (isLoading) return;

    // 创建新的AbortController
    abortControllerRef.current = new AbortController();
    currentItemIdRef.current = item.id;

    setIsLoading(true);
    setError(null);
    setCurrentStep(0);
    setProgress(0);

    try {
      // 模拟AI思考过程的步骤展示
      for (let i = 0; i < AI_THINKING_STEPS.length; i++) {
        // 检查是否被中断
        if (abortControllerRef.current?.signal.aborted) {
          console.log('AI解读步骤被中断');
          return;
        }

        setCurrentStep(i);
        setProgress(((i + 1) / AI_THINKING_STEPS.length) * 80);
        
        // 等待当前步骤的时间，但可以被中断
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(resolve, AI_THINKING_STEPS[i].duration);
          
          // 监听中断信号
          abortControllerRef.current?.signal.addEventListener('abort', () => {
            clearTimeout(timeout);
            reject(new Error('Aborted'));
          });
        });
      }

      // 检查是否被中断
      if (abortControllerRef.current?.signal.aborted) {
        console.log('AI解读API调用被中断');
        return;
      }

      // 实际API调用
      const response: AIInterpretationResponse = await aiService.interpretHandwriting({
        title: item.title,
        content: item.originalData.原文,
        notes: item.originalData.注释 || '',
        time: item.originalData.时间 || ''
      });

      // 再次检查是否被中断
      if (abortControllerRef.current?.signal.aborted) {
        console.log('AI解读结果处理被中断');
        return;
      }

      setProgress(100);

      if (response.success && response.interpretation) {
        onInterpretationReady(response.interpretation);
        showSuccess('AI解读完成', '为您生成了智能解读内容');
      } else {
        setError(response.error || '解读失败，请稍后重试');
        showError('解读失败', response.error || '请稍后重试');
      }
    } catch (err) {
      // 如果是中断错误，不显示错误提示
      if (err instanceof Error && err.message === 'Aborted') {
        console.log('AI解读被用户中断');
        return;
      }
      
      setError('网络请求失败，请检查网络连接');
      showError('网络错误', '请检查网络连接后重试');
      console.error('AI解读请求失败:', err);
    } finally {
      // 只有在没有被中断的情况下才重置loading状态
      if (!abortControllerRef.current?.signal.aborted) {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    }
  };


  return (
    <div className={`ai-interpretation-container ${className}`}>
      {/* 主要按钮 */}
      <button
        onClick={handleInterpret}
        disabled={isLoading}
        className={`
          ai-interpretation-button
          group relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
          active:scale-95
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500
          ${isLoading 
            ? 'bg-cyan-500 text-white shadow-lg cursor-wait ai-loading-state' 
            : error 
              ? 'bg-red-100 text-red-600 border border-red-200 ai-error-state' 
              : 'bg-cyan-100 text-cyan-600 border border-cyan-200 ai-normal-state'
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
      {/* {!isLoading && !error && (
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500">
            <Brain className="w-3 h-3 inline mr-1" />
            点击获取AI智能解读，深入理解原文内涵
          </p>
        </div>
      )} */}
    </div>
  );
};