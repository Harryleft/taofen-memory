import React from 'react';
import { GuideState } from './GuideState';

/**
 * 报刊引导区域组件 - 界面1右侧专用
 * 
 * 功能：
 * - 显示操作说明和使用指引
 * - 空状态样式设计
 * - 响应式布局适配
 */
export const NewspapersGuideArea: React.FC = () => {
  return (
    <GuideState
      icon="📜"
      title="与韬奋先生对话"
      message="每一份报刊都是韬奋先生'以笔为剑'的战场，每一篇文章都承载着知识分子的家国情怀。选择左侧报刊，聆听历史的回响，感受思想的力量。"
      steps={[
        {
          number: 1,
          text: "择一份报刊，走近一个时代"
        },
        {
          number: 2,
          text: "选一期内容，感受一段历史"
        },
        {
          number: 3,
          text: "用心品读，与先贤对话"
        }        
      ]}
      variant="guide"
      className="newspapers-interface1__guide"
    />
  );
};

export default NewspapersGuideArea;