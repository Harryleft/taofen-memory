import React from 'react';
import { Users, Network, Heart } from 'lucide-react';
import BaseHeader from '../common/BaseHeader';
import { ModuleHeaderConfig } from '../../styles/commonHeader';

const RelationshipsHeader: React.FC = () => {
  const config: ModuleHeaderConfig = {
    moduleId: 'relationships',
    icon: <Network className="w-8 h-8 text-blue-600" />,
    title: '人物关系',
    subtitle: '编织时代的人脉网络',
    description: '探索邹韬奋先生的社交网络，从师友同窗到革命伙伴，勾勒出一个时代知识分子的交往图谱。',
    accentColor: 'blue',
    backgroundImage: 'placeholder',
    showDecorative: true,
    customStyles: {
      container: 'relationships-header',
      title: 'text-blue-800',
      description: 'text-charcoal/70'
    }
  };

  return (
    <BaseHeader config={config}>
      {/* 人物关系特色装饰元素 */}
      <div className="flex items-center justify-center mt-6 mb-4">
        <div className="flex items-center space-x-6 text-charcoal/50">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span className="text-sm">师友同窗</span>
          </div>
          <div className="w-px h-4 bg-blue-300"></div>
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4" />
            <span className="text-sm">革命伙伴</span>
          </div>
        </div>
      </div>
      
      {/* 网络连线装饰 */}
      <div className="relative mt-8 h-12">
        {/* 中心节点 */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg z-10"></div>
        
        {/* 连接线和周围节点 */}
        <div className="absolute left-1/3 top-2 w-2 h-2 bg-blue-300 rounded-full"></div>
        <div className="absolute left-1/3 top-2 w-16 h-px bg-gradient-to-r from-blue-300/60 to-transparent transform rotate-12 origin-left"></div>
        
        <div className="absolute right-1/3 top-8 w-2 h-2 bg-blue-300 rounded-full"></div>
        <div className="absolute right-1/3 top-8 w-16 h-px bg-gradient-to-l from-blue-300/60 to-transparent transform -rotate-12 origin-right"></div>
        
        <div className="absolute left-2/5 bottom-2 w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
        <div className="absolute left-2/5 bottom-2 w-12 h-px bg-gradient-to-r from-blue-400/60 to-transparent transform rotate-45 origin-left"></div>
        
        <div className="absolute right-2/5 bottom-2 w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
        <div className="absolute right-2/5 bottom-2 w-12 h-px bg-gradient-to-l from-blue-400/60 to-transparent transform -rotate-45 origin-right"></div>
      </div>
    </BaseHeader>
  );
};

export default RelationshipsHeader;