/**
 * Header组件使用示例
 * 展示如何在各个模块中集成统一的Header设计
 */

import React from 'react';
import { BookOpen, Clock, PenTool, Network } from 'lucide-react';
import BaseHeader from './BaseHeader.tsx';
import { ModuleHeaderConfig } from '../../styles/commonHeader.ts';

// 示例1：书店模块Header（已有实现，这里展示如何迁移）
const BookstoreHeaderExample: React.FC = () => {
  const config: ModuleHeaderConfig = {
    moduleId: 'bookstore',
    icon: <BookOpen className="w-8 h-8 text-gold" />,
    title: '时光书影',
    subtitle: '生活书店出版印记',
    description: '穿越时光长河，重温那些承载着思想与智慧的珍贵典籍，感受邹韬奋先生倾注毕生心血的文化事业。',
    accentColor: 'gold',
    backgroundImage: 'placeholder',
    showDecorative: true
  };

  return <BaseHeader config={config} />;
};

// 示例2：自定义Header（展示高度定制化）
const CustomModuleHeader: React.FC = () => {
  const config: ModuleHeaderConfig = {
    moduleId: 'custom',
    icon: '📚', // 可以使用emoji
    title: '自定义模块',
    subtitle: '展示个性化定制',
    description: '这是一个展示如何高度定制Header的示例模块。',
    accentColor: 'purple',
    backgroundImage: '/path/to/actual/image.jpg', // 实际图片路径
    showDecorative: false, // 关闭装饰元素
    customStyles: {
      container: 'bg-purple-50/30',
      title: 'text-purple-800 text-4xl',
      description: 'text-purple-600 italic'
    }
  };

  return (
    <BaseHeader config={config}>
      {/* 自定义内容区域 */}
      <div className="mt-6 p-4 bg-purple-100/50 rounded-lg">
        <p className="text-purple-700 text-sm">
          这里可以添加模块特有的交互元素或额外信息
        </p>
      </div>
    </BaseHeader>
  );
};

// 示例3：最简Header（最小化配置）
const MinimalHeader: React.FC = () => {
  const config: ModuleHeaderConfig = {
    moduleId: 'minimal',
    title: '简约模块',
    description: '最简化的Header配置示例。'
  };

  return <BaseHeader config={config} />;
};

// 使用指南组件
const HeaderUsageGuide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-charcoal mb-4">Header组件使用指南</h1>
        <p className="text-charcoal/70">统一品牌展示，个性化模块表达</p>
      </div>
      
      {/* 配置说明 */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">配置参数说明</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">必需参数：</h3>
            <ul className="space-y-1 text-gray-600">
              <li>• <code>moduleId</code>: 模块唯一标识</li>
              <li>• <code>title</code>: 模块标题</li>
              <li>• <code>description</code>: 模块描述</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">可选参数：</h3>
            <ul className="space-y-1 text-gray-600">
              <li>• <code>icon</code>: 模块图标</li>
              <li>• <code>subtitle</code>: 副标题</li>
              <li>• <code>accentColor</code>: 主题色</li>
              <li>• <code>backgroundImage</code>: 背景图</li>
              <li>• <code>showDecorative</code>: 装饰元素</li>
              <li>• <code>customStyles</code>: 自定义样式</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* 示例展示 */}
      <div className="space-y-8">
        <BookstoreHeaderExample />
        <CustomModuleHeader />
        <MinimalHeader />
      </div>
      
      {/* 最佳实践 */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4 text-blue-800">最佳实践建议</h2>
        <ul className="space-y-2 text-blue-700">
          <li>• 保持品牌标题区域的一致性，体现"韬奋·时光"品牌</li>
          <li>• 根据模块特色选择合适的主题色和图标</li>
          <li>• 描述文字控制在1-2句话，简洁明了</li>
          <li>• 图片占位符便于后期替换为实际内容</li>
          <li>• 装饰元素可根据模块风格选择性使用</li>
        </ul>
      </div>
    </div>
  );
};

export default HeaderUsageGuide;
export { BookstoreHeaderExample, CustomModuleHeader, MinimalHeader };
