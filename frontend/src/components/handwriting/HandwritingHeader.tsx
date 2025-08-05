import React from 'react';
import { PenTool, FileText, Scroll } from 'lucide-react';
import BaseHeader from '../common/BaseHeader';
import { ModuleHeaderConfig } from '../../styles/commonHeader';

const HandwritingHeader: React.FC = () => {
  const config: ModuleHeaderConfig = {
    moduleId: 'handwriting',
    icon: <PenTool className="w-8 h-8 text-slate-700" />,
    title: '手稿文献',
    subtitle: '珍贵的笔墨印记',
    description: '收录邹韬奋先生的亲笔手稿、书信往来与重要文献，透过笔迹感受先生的思想脉络与人格魅力。',
    accentColor: 'slate',
    backgroundImage: 'placeholder',
    showDecorative: true,
    customStyles: {
      container: 'handwriting-header',
      title: 'text-slate-800',
      description: 'text-charcoal/70'
    }
  };

  return (
    <BaseHeader config={config}>
      {/* 手写稿特色装饰元素 */}
      <div className="flex items-center justify-center mt-6 mb-4">
        <div className="flex items-center space-x-6 text-charcoal/50">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span className="text-sm">书信手稿</span>
          </div>
          <div className="w-px h-4 bg-slate-300"></div>
          <div className="flex items-center space-x-2">
            <Scroll className="w-4 h-4" />
            <span className="text-sm">重要文献</span>
          </div>
        </div>
      </div>
      
      {/* 墨迹纹理装饰 */}
      <div className="relative mt-8">
        {/* 模拟毛笔笔触 */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-2">
          <div className="flex items-center space-x-1">
            <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-slate-400 to-transparent opacity-60"></div>
            <div className="w-1 h-1 bg-slate-500 rounded-full opacity-70"></div>
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-slate-400 to-transparent opacity-60"></div>
          </div>
        </div>
        
        {/* 印章风格装饰 */}
        <div className="absolute right-1/4 top-2 w-6 h-6 border border-red-400/40 rounded-sm flex items-center justify-center">
          <div className="w-2 h-2 bg-red-400/30 rounded-full"></div>
        </div>
      </div>
    </BaseHeader>
  );
};

export default HandwritingHeader;