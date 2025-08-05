import React from 'react';
import { Clock } from 'lucide-react';
import MinimalHeader from '../common/MinimalHeader';
import { MinimalHeaderConfig, MINIMAL_COLORS, MINIMAL_SPACING } from '../../styles/minimalistHeader';

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
      <div 
        style={{
          marginTop: MINIMAL_SPACING.lg,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: MINIMAL_SPACING.xl
        }}
      >
        {/* 起点 */}
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: MINIMAL_COLORS.primary.medium
          }}
        >
          <div 
            style={{
              width: '6px',
              height: '6px',
              backgroundColor: MINIMAL_COLORS.accent.gold,
              borderRadius: '50%',
              marginBottom: MINIMAL_SPACING.xs
            }}
          />
          <span>1895</span>
          <span style={{ fontSize: '0.625rem', marginTop: '2px' }}>福建永安</span>
        </div>

        {/* 连接线 */}
        <div 
          style={{
            width: '120px',
            height: '1px',
            backgroundColor: MINIMAL_COLORS.primary.light,
            opacity: 0.3,
            position: 'relative'
          }}
        >
          {/* 中间节点 */}
          <div 
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '4px',
              height: '4px',
              backgroundColor: MINIMAL_COLORS.accent.gold,
              borderRadius: '50%',
              opacity: 0.7
            }}
          />
        </div>

        {/* 终点 */}
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: MINIMAL_COLORS.primary.medium
          }}
        >
          <div 
            style={{
              width: '6px',
              height: '6px',
              backgroundColor: MINIMAL_COLORS.accent.gold,
              borderRadius: '50%',
              marginBottom: MINIMAL_SPACING.xs
            }}
          />
          <span>1944</span>
          <span style={{ fontSize: '0.625rem', marginTop: '2px' }}>上海</span>
        </div>
      </div>

      {/* 核心理念 - 极简文字 */}
      <div 
        style={{
          marginTop: MINIMAL_SPACING.xl,
          fontSize: '0.875rem',
          color: MINIMAL_COLORS.primary.light,
          letterSpacing: '0.1em',
          fontStyle: 'italic'
        }}
      >
        "为了大众，奋斗终生"
      </div>
    </MinimalHeader>
  );
};

export default MinimalTimelineHeader;