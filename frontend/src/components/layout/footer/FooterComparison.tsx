import React from 'react';
import { 
  ZoutaofenFooterResponsive, 
  ZoutaofenFooterMinimal, 
  ZoutaofenFooter 
} from './ZoutaofenFooter';

// 测试对比组件
const FooterComparison: React.FC = () => {
  return (
    <div className="footer-comparison bg-gray-100 min-h-screen p-8">
      <div className="comparison-container max-w-7xl mx-auto">
        <h1 className="comparison-title text-3xl font-bold text-center mb-8 text-gray-800">
          Footer 版本对比测试
        </h1>
        
        <div className="comparison-grid grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 响应式版本 */}
          <div className="version-card bg-white rounded-lg shadow-lg p-6">
            <h2 className="version-title text-xl font-semibold mb-4 text-blue-600">
              响应式版本 (Responsive)
            </h2>
            <div className="version-description mb-4 text-gray-600">
              <p className="mb-2">
                <strong>特点：</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>完整的四列导航布局</li>
                <li>完整的外部资源链接</li>
                <li>标准的版权信息</li>
                <li>移动端自适应</li>
                <li>中等间距设计</li>
              </ul>
            </div>
            <div className="version-demo border-2 border-dashed border-gray-300 rounded-lg p-4">
              <ZoutaofenFooterResponsive className="version-responsive" />
            </div>
          </div>
          
          {/* 极简版本 */}
          <div className="version-card bg-white rounded-lg shadow-lg p-6">
            <h2 className="version-title text-xl font-semibold mb-4 text-green-600">
              极简版本 (Minimal)
            </h2>
            <div className="version-description mb-4 text-gray-600">
              <p className="mb-2">
                <strong>特点：</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>简化的一列导航</li>
                <li>精简的外部资源链接</li>
                <li>紧凑的布局设计</li>
                <li>桌面端优化</li>
                <li>最小化间距</li>
              </ul>
            </div>
            <div className="version-demo border-2 border-dashed border-gray-300 rounded-lg p-4">
              <ZoutaofenFooterMinimal className="version-minimal" />
            </div>
          </div>
          
          {/* 完整版本 */}
          <div className="version-card bg-white rounded-lg shadow-lg p-6">
            <h2 className="version-title text-xl font-semibold mb-4 text-purple-600">
              完整版本 (Full)
            </h2>
            <div className="version-description mb-4 text-gray-600">
              <p className="mb-2">
                <strong>特点：</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>扩展的四列导航（每列6项）</li>
                <li>丰富的外部资源链接（5个）</li>
                <li>详细的版权信息</li>
                <li>大间距设计</li>
                <li>桌面端优先</li>
              </ul>
            </div>
            <div className="version-demo border-2 border-dashed border-gray-300 rounded-lg p-4">
              <ZoutaofenFooter className="version-full" />
            </div>
          </div>
        </div>
        
        {/* 技术规格说明 */}
        <div className="technical-specs mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="specs-title text-2xl font-semibold mb-6 text-gray-800">
            技术规格说明
          </h2>
          
          <div className="specs-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 响应式布局系统 */}
            <div className="spec-section">
              <h3 className="spec-subtitle text-lg font-semibold mb-3 text-blue-600">
                响应式布局系统
              </h3>
              <div className="spec-content text-sm text-gray-600">
                <ul className="space-y-2">
                  <li><strong>移动端：</strong>grid-cols-1, text-center</li>
                  <li><strong>平板端：</strong>md:grid-cols-2, md:text-left</li>
                  <li><strong>桌面端：</strong>lg:grid-cols-4, lg:gap-16</li>
                  <li><strong>断点：</strong>640px, 768px, 1024px</li>
                </ul>
              </div>
            </div>
            
            {/* 视觉设计系统 */}
            <div className="spec-section">
              <h3 className="spec-subtitle text-lg font-semibold mb-3 text-green-600">
                视觉设计系统
              </h3>
              <div className="spec-content text-sm text-gray-600">
                <ul className="space-y-2">
                  <li><strong>主题色：</strong>金色 (#fbbf24)</li>
                  <li><strong>背景：</strong>深色渐变</li>
                  <li><strong>文字：</strong>白色系</li>
                  <li><strong>动画：</strong>0.3s ease</li>
                </ul>
              </div>
            </div>
            
            {/* 技术栈 */}
            <div className="spec-section">
              <h3 className="spec-subtitle text-lg font-semibold mb-3 text-purple-600">
                技术栈配置
              </h3>
              <div className="spec-content text-sm text-gray-600">
                <ul className="space-y-2">
                  <li><strong>React：</strong>功能组件 + Hooks</li>
                  <li><strong>TypeScript：</strong>完整类型定义</li>
                  <li><strong>Tailwind CSS：</strong>V4.0 + 自定义CSS</li>
                  <li><strong>无障碍：</strong>ARIA标签 + 键盘导航</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* 性能优化 */}
          <div className="performance-section mt-6">
            <h3 className="spec-subtitle text-lg font-semibold mb-3 text-red-600">
              性能优化策略
            </h3>
            <div className="spec-content text-sm text-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">CSS优化</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>实用类优先</li>
                    <li>CSS变量系统</li>
                    <li>最小化自定义样式</li>
                    <li>响应式断点优化</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">可访问性</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>语义化HTML结构</li>
                    <li>ARIA标签支持</li>
                    <li>键盘导航优化</li>
                    <li>屏幕阅读器支持</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* 内容架构 */}
          <div className="content-architecture mt-6">
            <h3 className="spec-subtitle text-lg font-semibold mb-3 text-indigo-600">
              内容架构
            </h3>
            <div className="spec-content text-sm text-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium mb-2">主导航栏目</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>岁月行履 (Life Journey)</li>
                    <li>时光书影 (Books & Times)</li>
                    <li>笔下风骨 (Writing Style)</li>
                    <li>同行群像 (Contemporary Figures)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">外部资源</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>韬奋纪念馆</li>
                    <li>上海图书馆</li>
                    <li>维基百科</li>
                    <li>国家图书馆</li>
                    <li>学术研究</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">法律信息</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>版权声明</li>
                    <li>团队信息</li>
                    <li>竞赛信息</li>
                    <li>保留权利</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 使用说明 */}
        <div className="usage-guide mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="guide-title text-xl font-semibold mb-4 text-blue-800">
            使用说明
          </h2>
          <div className="guide-content text-sm text-blue-700">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">基本用法</h3>
                <pre className="bg-blue-100 p-3 rounded text-xs overflow-x-auto">
                  <code>{`import { ZoutaofenFooterResponsive } from './components/layout/footer/ZoutaofenFooter';

function App() {
  return (
    <div>
      {/* 页面内容 */}
      <ZoutaofenFooterResponsive />
    </div>
  );
}`}</code>
                </pre>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">版本选择</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><code>ZoutaofenFooterResponsive</code> - 响应式版本（推荐）</li>
                  <li><code>ZoutaofenFooterMinimal</code> - 极简版本（桌面端）</li>
                  <li><code>ZoutaofenFooter</code> - 完整版本（内容丰富）</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">自定义配置</h3>
                <p>可以通过传入 <code>config</code> 属性来自定义Footer内容：</p>
                <pre className="bg-blue-100 p-3 rounded text-xs overflow-x-auto">
                  <code>{`const customConfig = {
  primaryNavigation: { /* 自定义导航 */ },
  externalResources: { /* 自定义资源 */ },
  legal: { /* 自定义法律信息 */ },
  style: { /* 自定义样式 */ }
};

<ZoutaofenFooterResponsive config={customConfig} />`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterComparison;