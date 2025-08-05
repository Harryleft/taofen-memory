import React from 'react';
import { Clock } from 'lucide-react';
import MinimalHeader, { MinimalHeaderConfig } from '../layout/MinimalHeader';

const MinimalTimelineHeader: React.FC = () => {
  const config: MinimalHeaderConfig = {
    moduleId: 'timeline',
    title: '生平时光轴',
    subtitle: '追溯韬奋先生的人生足迹',
    description: '以时间为轴，梳理邹韬奋先生从求学、办报到投身抗日救国的人生历程，感受一代报人的家国情怀与时代担当。',
    icon: <Clock size={24} strokeWidth={1.5} />,
    accentColor: 'gold',
    culturalElement: {
      text: '一九八五年至一九四四年',
      position: 'top'
    }
  };

  return (
    <MinimalHeader config={config}>
      {/* 时间线特有的极简装饰元素 */}
      <div className="mt-8 flex justify-center items-center gap-12">
        {/* 起点 */}
        <div className="flex flex-col items-center text-xs text-primary-medium">
          <div className="w-1.5 h-1.5 bg-accent-gold rounded-full mb-1" />
          <span>1895</span>
          <span className="text-xs mt-0.5">福建永安</span>
        </div>

        {/* 连接线 */}
        <div className="w-30 h-px bg-primary-light opacity-30 relative">
          {/* 中间节点 */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-accent-gold rounded-full opacity-70" />
        </div>

        {/* 终点 */}
        <div className="flex flex-col items-center text-xs text-primary-medium">
          <div className="w-1.5 h-1.5 bg-accent-gold rounded-full mb-1" />
          <span>1944</span>
          <span className="text-xs mt-0.5">上海</span>
        </div>
      </div>

      {/* 核心理念 - 极简文字 */}
      <div className="mt-12 text-sm text-primary-light tracking-wider italic">
        "为了大众，奋斗终生"
      </div>
    </MinimalHeader>
  );
};

export default MinimalTimelineHeader;