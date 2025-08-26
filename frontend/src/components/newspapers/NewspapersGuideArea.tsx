import React from 'react';

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
    <div className="newspapers-interface1__guide">
      <div className="newspapers-guide-content">
        <div className="newspapers-guide-content__icon">📚</div>
        <h2 className="newspapers-guide-content__title">欢迎使用数字报刊系统</h2>
        <p className="newspapers-guide-content__description">
          选择左侧的报刊开始浏览，系统将显示该报刊的所有期数列表。
        </p>
        
        <div className="newspapers-guide-content__steps">
          <div className="newspapers-guide-content__step">
            <div className="newspapers-guide-content__step-number">1</div>
            <div className="newspapers-guide-content__step-text">
              点击左侧报刊卡片，选择您要浏览的刊物
            </div>
          </div>
          
          <div className="newspapers-guide-content__step">
            <div className="newspapers-guide-content__step-number">2</div>
            <div className="newspapers-guide-content__step-text">
              在期数列表中选择具体的期数进行阅读
            </div>
          </div>
          
          <div className="newspapers-guide-content__step">
            <div className="newspapers-guide-content__step-number">3</div>
            <div className="newspapers-guide-content__step-text">
              使用查看器工具进行报刊阅读和导航
            </div>
          </div>
          
          <div className="newspapers-guide-content__step">
            <div className="newspapers-guide-content__step-number">4</div>
            <div className="newspapers-guide-content__step-text">
              随时可以通过返回按钮回到上一级
            </div>
          </div>
        </div>
        
        <p className="newspapers-guide-content__description">
          <small>提示：系统支持键盘操作，使用Tab键导航，Enter键确认选择</small>
        </p>
      </div>
    </div>
  );
};

export default NewspapersGuideArea;