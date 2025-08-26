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
      icon="📚"
      title="欢迎使用数字报刊系统"
      message="选择左侧的报刊开始浏览，系统将显示该报刊的所有期数列表。"
      steps={[
        {
          number: 1,
          text: "点击左侧报刊卡片，选择您要浏览的刊物"
        },
        {
          number: 2,
          text: "在期数列表中选择具体的期数进行阅读"
        },
        {
          number: 3,
          text: "使用查看器工具进行报刊阅读和导航"
        },
        {
          number: 4,
          text: "随时可以通过返回按钮回到上一级"
        }
      ]}
      variant="guide"
      className="newspapers-interface1__guide"
      action={
        <small>提示：系统支持键盘操作，使用Tab键导航，Enter键确认选择</small>
      }
    />
  );
};

export default NewspapersGuideArea;