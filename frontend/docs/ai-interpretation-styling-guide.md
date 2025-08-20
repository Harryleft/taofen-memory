# AI解读标题样式使用指南

## 概述

本文档介绍了改进后的AI解读功能CSS样式，重点关注标题的颜色设计、可访问性和现代CSS最佳实践。

## 主要改进

### 1. 颜色系统一致性
- 使用项目设计系统中的金色(`--global-accent-secondary`)作为主要强调色
- 保持与整体蓝金配色的视觉一致性
- 提高对比度以符合WCAG 2.1 AA标准

### 2. 新增样式类

#### AI解读标题
```css
.ai-interpretation-title
```
- **用途**: 主要的AI解读标题
- **颜色**: 深蓝色渐变背景，白色文字
- **对比度**: > 7:1 (符合WCAG 2.1 AAA标准)

#### AI解读内容区域
```css
.ai-interpretation-content
```
- **用途**: AI解读内容的容器
- **背景**: 金色微渐变背景
- **边框**: 金色边框强调

#### AI解读内容高亮
```css
.ai-interpretation-highlight
```
- **用途**: 突出显示重要内容
- **背景**: 蓝金双色渐变
- **左边框**: 4px金色边框

### 3. 使用示例

#### 基本标题使用
```tsx
<div className="ai-interpretation-title">
  <Brain className="ai-interpretation-title-icon" />
  <span>AI解读</span>
</div>
```

#### 内容区域使用
```tsx
<div className="ai-interpretation-content">
  <h4 className="ai-interpretation-title">AI解读</h4>
  <div className="ai-interpretation-highlight">
    <TypewriterText text={interpretation} />
  </div>
</div>
```

### 4. 响应式设计

#### 移动端 (< 640px)
- 标题字体大小: 1rem
- 内容内边距: 1rem
- 整体缩放: 0.95

#### 平板端 (641px - 1024px)
- 标题字体大小: 1.0625rem
- 内容内边距: 1.25rem

#### 桌面端 (> 1024px)
- 标题字体大小: 1.125rem
- 内容内边距: 1.5rem

### 5. 可访问性支持

#### 高对比度模式
```css
@media (prefers-contrast: high) {
  /* 自动应用高对比度样式 */
}
```

#### 减少动画模式
```css
@media (prefers-reduced-motion: reduce) {
  /* 自动禁用动画效果 */
}
```

### 6. 动画效果

#### 悬停光晕效果
- 标题悬停时显示金色光晕
- 使用CSS `::before` 伪元素实现
- 支持 `pulse` 动画效果

#### 内容闪烁效果
- 内容区域有微妙的shimmer动画
- 从左到右的光线扫过效果
- 每3秒循环一次

### 7. 浏览器兼容性

#### 现代浏览器支持
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

#### CSS特性支持
- CSS变量 (Custom Properties)
- CSS Grid
- Flexbox
- 渐变背景
- 动画和过渡效果

### 8. 性能优化

#### CSS优化
- 使用CSS变量减少重复代码
- 使用 `will-change` 属性优化动画性能
- 合理使用 `transform` 和 `opacity` 进行动画

#### 动画优化
- 使用GPU加速的CSS属性
- 避免在动画中使用 `box-shadow` 和 `filter`
- 使用 `transform` 代替 `position` 变化

### 9. 未来扩展

#### 暗色模式支持
已预留暗色模式的CSS变量位置，可以轻松添加暗色主题。

#### 主题切换
基于CSS变量的设计，支持动态主题切换。

### 10. 注意事项

1. **颜色变量**: 确保在使用前已定义相应的CSS变量
2. **浏览器前缀**: 现代浏览器已无需添加前缀
3. **移动端优化**: 在小屏幕设备上自动调整大小
4. **可访问性**: 自动支持高对比度和减少动画模式

## 技术实现细节

### CSS变量使用
```css
/* 主要使用的设计系统变量 */
--global-accent-primary: #1B365D
--global-accent-secondary: #C49B61
--global-accent-tertiary: #D4A574
--global-radius-lg: 0.75rem
--global-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1)
```

### 渐变设计
使用现代CSS渐变技术创建视觉层次：
- 标题使用135度蓝色渐变
- 内容使用135度金蓝色渐变
- 高亮使用120度三色渐变

### 动画性能
所有动画都经过性能优化：
- 使用 `transform` 和 `opacity`
- 避免布局重排
- 支持硬件加速