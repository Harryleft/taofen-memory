import React from 'react';
import { Network } from 'lucide-react';
import MinimalHeader, { MinimalHeaderConfig } from '../layout/MinimalHeader';

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
      <div className="mt-8 flex justify-center items-center relative h-15">
        {/* 中心节点 - 韬奋 */}
        <div className="w-2 h-2 bg-accent-gold rounded-full relative z-10" />

        {/* 连接线和周围节点 - 极简几何 */}
        {/* 左上节点 */}
        <div className="absolute left-[calc(50%-40px)] top-2.5 w-1 h-1 bg-primary-light rounded-full opacity-60" />
        <div className="absolute left-[calc(50%-40px)] top-2.5 w-9 h-px bg-primary-light opacity-30 rotate-[25deg] origin-right" />

        {/* 右上节点 */}
        <div className="absolute right-[calc(50%-40px)] top-2.5 w-1 h-1 bg-primary-light rounded-full opacity-60" />
        <div className="absolute right-[calc(50%-40px)] top-2.5 w-9 h-px bg-primary-light opacity-30 rotate-[-25deg] origin-left" />

        {/* 左下节点 */}
        <div className="absolute left-[calc(50%-30px)] bottom-2.5 w-1 h-1 bg-primary-light rounded-full opacity-60" />
        <div className="absolute left-[calc(50%-30px)] bottom-2.5 w-6 h-px bg-primary-light opacity-30 rotate-[-20deg] origin-right" />

        {/* 右下节点 */}
        <div className="absolute right-[calc(50%-30px)] bottom-2.5 w-1 h-1 bg-primary-light rounded-full opacity-60" />
        <div className="absolute right-[calc(50%-30px)] bottom-2.5 w-6 h-px bg-primary-light opacity-30 rotate-[20deg] origin-left" />
      </div>

      {/* 关系类型 - 极简标签 */}
      <div className="mt-8 flex justify-center items-center gap-8">
        <div className="text-xs text-primary-medium px-2 py-1 border border-primary-light rounded-sm opacity-70">
          师友同窗
        </div>
        <div className="text-xs text-primary-medium px-2 py-1 border border-primary-light rounded-sm opacity-70">
          革命伙伴
        </div>
      </div>

      {/* 核心理念 */}
      <div className="mt-8 text-sm text-primary-light tracking-wider">
        以文会友，以友辅仁
      </div>
    </MinimalHeader>
  );
};

export default MinimalRelationshipsHeader;