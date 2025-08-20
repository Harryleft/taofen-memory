import { useState, useEffect } from 'react';
import { Brain, Loader2, AlertCircle, Sparkles, Copy, Share2, ThumbsUp, ThumbsDown } from 'lucide-react';
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
  const [showActions, setShowActions] = useState(false);
  const { showSuccess, showError, showInfo } = useToast();

  // 处理AI解读请求
  const handleInterpret = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    setCurrentStep(0);
    setProgress(0);
    setShowActions(false);

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
        setShowActions(true);
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

  // 复制到剪贴板
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.originalData.原文);
      showSuccess('复制成功', '原文已复制到剪贴板');
    } catch (err) {
      showError('复制失败', '请手动复制原文内容');
      console.error('复制失败:', err);
    }
  };

  // 分享功能
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.originalData.原文,
          url: window.location.href
        });
        showSuccess('分享成功', '内容已分享');
      } catch (err) {
        // 用户取消分享时不显示错误
        if ((err as Error).name !== 'AbortError') {
          showError('分享失败', '请手动复制链接分享');
        }
      }
    } else {
      // 回退到复制链接
      try {
        await navigator.clipboard.writeText(window.location.href);
        showSuccess('链接已复制', '请粘贴分享给朋友');
      } catch (err) {
        showError('复制失败', '请手动复制链接');
      }
    }
  };

  // 评价功能
  const handleRate = (isPositive: boolean) => {
    // 这里可以发送评价到后端
    console.log('用户评价:', isPositive ? '赞' : '踩');
    showInfo('感谢反馈', isPositive ? '很高兴对您有帮助！' : '我们会继续改进');
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
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          ${isLoading 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg cursor-wait' 
            : error 
              ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-600 hover:from-red-100 hover:to-red-200 border border-red-200' 
              : 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 hover:from-blue-100 hover:to-purple-100 shadow-md hover:shadow-lg border border-blue-100'
          }
        `}
        title={error ? '点击重试' : 'AI智能解读'}
      >
        {/* 按钮背景装饰 */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
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
                    ? 'bg-blue-500 scale-110' 
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

      {/* 成功提示 */}
      {!isLoading && !error && showActions && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-xs text-green-700 font-medium">AI解读已完成</p>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md
                  bg-white text-gray-600 hover:bg-gray-50 border border-gray-200
                  transition-colors"
                title="复制原文"
              >
                <Copy className="w-3 h-3" />
                复制
              </button>
              
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md
                  bg-white text-gray-600 hover:bg-gray-50 border border-gray-200
                  transition-colors"
                title="分享"
              >
                <Share2 className="w-3 h-3" />
                分享
              </button>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleRate(true)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md
                  bg-white text-gray-600 hover:bg-green-50 hover:text-green-600 border border-gray-200
                  transition-colors"
                title="有用"
              >
                <ThumbsUp className="w-3 h-3" />
              </button>
              
              <button
                onClick={() => handleRate(false)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md
                  bg-white text-gray-600 hover:bg-red-50 hover:text-red-600 border border-gray-200
                  transition-colors"
                title="无用"
              >
                <ThumbsDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 使用提示 */}
      {!isLoading && !error && !showActions && (
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