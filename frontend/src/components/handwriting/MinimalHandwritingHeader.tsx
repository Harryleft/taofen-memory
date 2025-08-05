import React from 'react';
import { PenTool } from 'lucide-react';
import MinimalHeader from '../common/MinimalHeader';
import { MinimalHeaderConfig, MINIMAL_COLORS, MINIMAL_SPACING } from '../../styles/minimalistHeader';

const MinimalHandwritingHeader: React.FC = () => {
  const config: MinimalHeaderConfig = {
    moduleId: 'handwriting',
    title: '手稿文献',
    subtitle: '珍贵的笔墨印记',
    description: '收录邹韬奋先生的亲笔手稿、书信往来与重要文献，透过笔迹感受先生的思想脉络与人格魅力。',
    icon: <PenTool size={24} strokeWidth={1.5} />,
    accentColor: 'gold',
    culturalElement: {
      text: '墨香犹存，思想永恒',
      position: 'bottom'
    }
  };

  return (
    <MinimalHeader config={config}>
      {/* 手稿特有的极简装饰元素 */}
      <div 
        style={{
          marginTop: MINIMAL_SPACING.lg,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: MINIMAL_SPACING.lg
        }}
      >
        {/* 书信类别 */}
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
              width: '1px',
              height: '16px',
              backgroundColor: MINIMAL_COLORS.accent.gold,
              marginBottom: MINIMAL_SPACING.xs,
              opacity: 0.6
            }}
          />
          <span>书信手稿</span>
        </div>

        {/* 分隔符 */}
        <div 
          style={{
            width: '20px',
            height: '1px',
            backgroundColor: MINIMAL_COLORS.primary.light,
            opacity: 0.3
          }}
        />

        {/* 文献类别 */}
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
              width: '1px',
              height: '16px',
              backgroundColor: MINIMAL_COLORS.accent.gold,
              marginBottom: MINIMAL_SPACING.xs,
              opacity: 0.6
            }}
          />
          <span>重要文献</span>
        </div>
      </div>

      {/* 笔触装饰 - 极简抽象 */}
      <div 
        style={{
          marginTop: MINIMAL_SPACING.xl,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: MINIMAL_SPACING.xs
        }}
      >
        {/* 模拟毛笔笔触的极简表现 */}
        <div 
          style={{
            width: '2px',
            height: '8px',
            backgroundColor: MINIMAL_COLORS.accent.gold,
            opacity: 0.4,
            transform: 'rotate(-15deg)'
          }}
        />
        <div 
          style={{
            width: '12px',
            height: '1px',
            backgroundColor: MINIMAL_COLORS.accent.gold,
            opacity: 0.3
          }}
        />
        <div 
          style={{
            width: '1px',
            height: '4px',
            backgroundColor: MINIMAL_COLORS.accent.gold,
            opacity: 0.5,
            transform: 'rotate(20deg)'
          }}
        />
      </div>

      {/* 文化内涵 - 极简表达 */}
      <div 
        style={{
          marginTop: MINIMAL_SPACING.lg,
          fontSize: '0.875rem',
          color: MINIMAL_COLORS.primary.light,
          letterSpacing: '0.05em'
        }}
      >
        笔墨传情，文以载道
      </div>
    </MinimalHeader>
  );
};

export default MinimalHandwritingHeader;