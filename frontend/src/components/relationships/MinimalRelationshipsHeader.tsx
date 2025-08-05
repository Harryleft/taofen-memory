import React from 'react';
import { Network } from 'lucide-react';
import MinimalHeader from '../common/MinimalHeader';
import { MinimalHeaderConfig, MINIMAL_COLORS, MINIMAL_SPACING } from '../../styles/minimalistHeader';

const MinimalRelationshipsHeader: React.FC = () => {
  const config: MinimalHeaderConfig = {
    moduleId: 'relationships',
    title: '人物关系',
    subtitle: '编织时代的人脉网络',
    description: '探索邹韬奋先生的社交网络，从师友同窗到革命伙伴，勾勒出一个时代知识分子的交往图谱。',
    icon: <Network size={24} strokeWidth={1.5} />,
    accentColor: 'gold',
    culturalElement: {
      text: '志同道合，薪火相传',
      position: 'bottom'
    }
  };

  return (
    <MinimalHeader config={config}>
      {/* 人物关系特有的极简网络装饰 */}
      <div 
        style={{
          marginTop: MINIMAL_SPACING.lg,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          height: '60px'
        }}
      >
        {/* 中心节点 - 韬奋 */}
        <div 
          style={{
            width: '8px',
            height: '8px',
            backgroundColor: MINIMAL_COLORS.accent.gold,
            borderRadius: '50%',
            position: 'relative',
            zIndex: 2
          }}
        />

        {/* 连接线和周围节点 - 极简几何 */}
        {/* 左上节点 */}
        <div 
          style={{
            position: 'absolute',
            left: 'calc(50% - 40px)',
            top: '10px',
            width: '4px',
            height: '4px',
            backgroundColor: MINIMAL_COLORS.primary.light,
            borderRadius: '50%',
            opacity: 0.6
          }}
        />
        <div 
          style={{
            position: 'absolute',
            left: 'calc(50% - 40px)',
            top: '10px',
            width: '35px',
            height: '1px',
            backgroundColor: MINIMAL_COLORS.primary.light,
            opacity: 0.3,
            transform: 'rotate(25deg)',
            transformOrigin: 'right center'
          }}
        />

        {/* 右上节点 */}
        <div 
          style={{
            position: 'absolute',
            right: 'calc(50% - 40px)',
            top: '10px',
            width: '4px',
            height: '4px',
            backgroundColor: MINIMAL_COLORS.primary.light,
            borderRadius: '50%',
            opacity: 0.6
          }}
        />
        <div 
          style={{
            position: 'absolute',
            right: 'calc(50% - 40px)',
            top: '10px',
            width: '35px',
            height: '1px',
            backgroundColor: MINIMAL_COLORS.primary.light,
            opacity: 0.3,
            transform: 'rotate(-25deg)',
            transformOrigin: 'left center'
          }}
        />

        {/* 左下节点 */}
        <div 
          style={{
            position: 'absolute',
            left: 'calc(50% - 30px)',
            bottom: '10px',
            width: '4px',
            height: '4px',
            backgroundColor: MINIMAL_COLORS.primary.light,
            borderRadius: '50%',
            opacity: 0.6
          }}
        />
        <div 
          style={{
            position: 'absolute',
            left: 'calc(50% - 30px)',
            bottom: '10px',
            width: '25px',
            height: '1px',
            backgroundColor: MINIMAL_COLORS.primary.light,
            opacity: 0.3,
            transform: 'rotate(-20deg)',
            transformOrigin: 'right center'
          }}
        />

        {/* 右下节点 */}
        <div 
          style={{
            position: 'absolute',
            right: 'calc(50% - 30px)',
            bottom: '10px',
            width: '4px',
            height: '4px',
            backgroundColor: MINIMAL_COLORS.primary.light,
            borderRadius: '50%',
            opacity: 0.6
          }}
        />
        <div 
          style={{
            position: 'absolute',
            right: 'calc(50% - 30px)',
            bottom: '10px',
            width: '25px',
            height: '1px',
            backgroundColor: MINIMAL_COLORS.primary.light,
            opacity: 0.3,
            transform: 'rotate(20deg)',
            transformOrigin: 'left center'
          }}
        />
      </div>

      {/* 关系类型 - 极简标签 */}
      <div 
        style={{
          marginTop: MINIMAL_SPACING.lg,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: MINIMAL_SPACING.lg
        }}
      >
        <div 
          style={{
            fontSize: '0.75rem',
            color: MINIMAL_COLORS.primary.medium,
            padding: `${MINIMAL_SPACING.xs} ${MINIMAL_SPACING.sm}`,
            border: `1px solid ${MINIMAL_COLORS.primary.light}`,
            borderRadius: '2px',
            opacity: 0.7
          }}
        >
          师友同窗
        </div>
        <div 
          style={{
            fontSize: '0.75rem',
            color: MINIMAL_COLORS.primary.medium,
            padding: `${MINIMAL_SPACING.xs} ${MINIMAL_SPACING.sm}`,
            border: `1px solid ${MINIMAL_COLORS.primary.light}`,
            borderRadius: '2px',
            opacity: 0.7
          }}
        >
          革命伙伴
        </div>
      </div>

      {/* 核心理念 */}
      <div 
        style={{
          marginTop: MINIMAL_SPACING.lg,
          fontSize: '0.875rem',
          color: MINIMAL_COLORS.primary.light,
          letterSpacing: '0.05em'
        }}
      >
        以文会友，以友辅仁
      </div>
    </MinimalHeader>
  );
};

export default MinimalRelationshipsHeader;