import React from 'react';
import { PenTool } from 'lucide-react';
import MinimalHeader, { MinimalHeaderConfig } from '../layout/MinimalHeader';

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
      <div className="mt-8 flex justify-center items-center gap-8">
        {/* 书信类别 */}
        <div className="flex flex-col items-center text-xs text-primary-medium">
          <div className="w-px h-4 bg-accent-gold mb-1 opacity-60" />
          <span>书信手稿</span>
        </div>

        {/* 分隔符 */}
        <div className="w-5 h-px bg-primary-light opacity-30" />

        {/* 文献类别 */}
        <div className="flex flex-col items-center text-xs text-primary-medium">
          <div className="w-px h-4 bg-accent-gold mb-1 opacity-60" />
          <span>重要文献</span>
        </div>
      </div>

      {/* 笔触装饰 - 极简抽象 */}
      <div className="mt-12 flex justify-center items-center gap-1">
        {/* 模拟毛笔笔触的极简表现 */}
        <div className="w-0.5 h-2 bg-accent-gold opacity-40 -rotate-12" />
        <div className="w-3 h-px bg-accent-gold opacity-30" />
        <div className="w-px h-1 bg-accent-gold opacity-50 rotate-12" />
      </div>

      {/* 文化内涵 - 极简表达 */}
      <div className="mt-8 text-sm text-primary-light tracking-wider">
        笔墨传情，文以载道
      </div>
    </MinimalHeader>
  );
};

export default MinimalHandwritingHeader;