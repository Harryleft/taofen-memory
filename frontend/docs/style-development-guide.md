# 🛠️ 前端样式开发指南

## 📋 简介

本指南为前端开发人员提供样式开发的最佳实践和规范，确保代码质量和一致性。

## 🎯 开发原则

### 1. 设计令牌优先

**✅ 推荐做法：**
```css
/* 使用设计令牌 */
.button-primary {
  background-color: var(--gold);
  color: var(--bg-pure);
  border-radius: var(--radius-lg);
}

/* 使用 Tailwind 类 */
<button class="bg-gold text-white rounded-lg px-6 py-3">
  提交
</button>
```

**❌ 避免做法：**
```css
/* 硬编码值 */
.button-primary {
  background-color: #B8860B;
  color: #FFFFFF;
  border-radius: 8px;
}
```

### 2. 移动优先

**✅ 推荐做法：**
```css
/* 默认移动端样式 */
.card {
  padding: 1rem;
  margin-bottom: 1rem;
}

/* 逐步增强桌面端 */
@media (min-width: 768px) {
  .card {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
}
```

### 3. 性能优先

**✅ 推荐做法：**
```css
/* GPU 加速 */
.animated-element {
  transform: translateZ(0);
  will-change: transform, opacity;
  backface-visibility: hidden;
}

/* 简单选择器 */
.card-header { /* ... */ }
.card-body { /* ... */ }
```

**❌ 避免做法：**
```css
/* 复杂选择器 */
.container .content .card .header .title { /* ... */ }

/* 过度动画 */
.element {
  transition: all 0.5s ease;
  will-change: all;
}
```

## 🏗️ 文件结构

### 1. 样式文件组织

```
frontend/src/styles/
├── global.css              # 全局样式
├── components/             # 组件样式
│   ├── buttons.css        # 按钮样式
│   ├── cards.css          # 卡片样式
│   ├── forms.css          # 表单样式
│   └── navigation.css     # 导航样式
├── pages/                  # 页面特定样式
│   ├── home.css           # 首页样式
│   ├── relationships.css  # 关系页面样式
│   └── timeline.css       # 时间线页面样式
└── utilities/             # 工具类
    ├── animations.css     # 动画工具类
    └── responsive.css     # 响应式工具类
```

### 2. 文件命名规范

- 使用 kebab-case 命名：`button-primary.css`
- 页面样式以页面名命名：`home-page.css`
- 组件样式以组件名命名：`user-card.css`

## 🎨 样式编写规范

### 1. CSS 类命名

#### 1.1 BEM 方法论

```css
/* 块 */
.card { }

/* 元素 */
.card__header { }
.card__body { }
.card__footer { }

/* 修饰符 */
.card--featured { }
.card--compact { }
```

#### 1.2 功能性命名

```css
/* 功能性类名 */
.text-primary { color: var(--primary); }
.bg-cream { background-color: var(--cream); }
.rounded-lg { border-radius: var(--radius-lg); }

/* 状态类名 */
.is-active { }
.is-disabled { }
.is-loading { }
```

### 2. Tailwind 使用规范

#### 2.1 优先使用 Tailwind 类

```html
<!-- ✅ 推荐 -->
<div class="max-w-7xl mx-auto px-6 py-12 bg-white rounded-lg shadow-card">
  <h2 class="text-2xl font-bold text-primary mb-4">标题</h2>
  <p class="text-secondary leading-relaxed">内容</p>
</div>
```

#### 2.2 自定义类与 Tailwind 结合

```css
/* 在 CSS 文件中 */
.custom-card {
  @apply bg-white rounded-lg shadow-card p-6;
  
  /* 自定义样式 */
  background-image: linear-gradient(135deg, rgba(250, 247, 240, 0.8) 0%, rgba(255, 255, 255, 0.9) 100%);
  border: 1px solid rgba(212, 175, 55, 0.15);
}
```

### 3. 响应式设计

#### 3.1 使用 Tailwind 响应式前缀

```html
<!-- 响应式布局 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div class="col-span-1">内容</div>
</div>

<!-- 响应式文字 -->
<h1 class="text-2xl md:text-3xl lg:text-4xl">标题</h1>
```

#### 3.2 自定义响应式样式

```css
/* 使用设计令牌断点 */
@media (max-width: 640px) {
  .container {
    padding: 1rem;
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 2rem;
  }
}
```

## 🎯 组件开发指南

### 1. 卡片组件

```css
/* 基础卡片 */
.card {
  @apply bg-white rounded-xl shadow-card overflow-hidden;
  transform: translateZ(0);
  will-change: transform, box-shadow;
  backface-visibility: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover {
  @apply shadow-hover;
  transform: translateY(-4px);
}

.card__header {
  @apply p-6 border-b border-gray-100;
}

.card__body {
  @apply p-6;
}

.card__footer {
  @apply p-6 bg-gray-50 border-t border-gray-100;
}
```

### 2. 按钮组件

```css
/* 按钮基础样式 */
.btn {
  @apply inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-300;
  transform: translateZ(0);
  will-change: transform, background-color;
  backface-visibility: hidden;
  border: none;
  cursor: pointer;
}

/* 按钮变体 */
.btn--primary {
  @apply bg-gold text-white hover:bg-gold/90 shadow-md hover:shadow-lg;
}

.btn--secondary {
  @apply bg-white text-primary border border-gold/30 hover:bg-gold/5;
}

.btn--ghost {
  @apply bg-transparent text-gold hover:bg-gold/10;
}

/* 按钮状态 */
.btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.btn--loading {
  @apply relative pointer-events-none;
}

.btn--loading::after {
  content: '';
  @apply absolute inset-0 bg-white/20 rounded-lg;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### 3. 表单组件

```css
/* 输入框 */
.form-input {
  @apply w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all duration-300;
}

.form-input:focus {
  @apply border-gold;
}

.form-input--error {
  @apply border-red-500 focus:ring-red-500/50;
}

.form-label {
  @apply block text-sm font-medium text-primary mb-2;
}

.form-error {
  @apply text-red-500 text-sm mt-1;
}

/* 选择框 */
.form-select {
  @apply w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent;
}
```

## 🎨 动画开发

### 1. 使用 Tailwind 动画

```html
<!-- 淡入动画 -->
<div class="animate-fade-in">
  内容
</div>

<!-- 滑入动画 -->
<div class="animate-slide-up">
  内容
</div>

<!-- 悬浮动画 -->
<div class="animate-float">
  内容
</div>
```

### 2. 自定义动画

```css
/* 自定义关键帧 */
@keyframes slideInFromRight {
  0% {
    opacity: 0;
    transform: translateX(100%);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 使用自定义动画 */
.slide-in-right {
  animation: slideInFromRight 0.6s ease-out;
}
```

### 3. 性能优化动画

```css
/* GPU 加速动画 */
.optimized-animation {
  transform: translateZ(0);
  will-change: transform, opacity;
  backface-visibility: hidden;
  animation: slideUp 0.6s ease-out;
}

/* 交错动画 */
.stagger-item {
  opacity: 0;
  transform: translateY(20px);
}

.stagger-item:nth-child(1) { animation-delay: 0.1s; }
.stagger-item:nth-child(2) { animation-delay: 0.2s; }
.stagger-item:nth-child(3) { animation-delay: 0.3s; }

.stagger-item.animate {
  animation: slideUp 0.6s ease-out forwards;
}
```

## 📱 响应式开发

### 1. 布局策略

```css
/* Flexbox 布局 */
.flex-container {
  @apply flex flex-col md:flex-row gap-6;
}

.flex-item {
  @apply flex-1;
}

/* Grid 布局 */
.grid-container {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}
```

### 2. 图片响应式

```css
/* 响应式图片 */
.responsive-img {
  @apply w-full h-auto object-cover;
  max-width: 100%;
  height: auto;
}

/* 图片占位符 */
.img-placeholder {
  @apply bg-gray-200 animate-pulse;
  aspect-ratio: 16/9;
}
```

### 3. 字体响应式

```css
/* 响应式字体 */
.responsive-text {
  @apply text-lg md:text-xl lg:text-2xl;
}

/* 行高响应式 */
.responsive-leading {
  @apply leading-relaxed md:leading-loose;
}
```

## 🔧 调试和测试

### 1. 样式调试

```css
/* 调试边框 */
.debug * {
  outline: 1px solid red;
}

/* 调试布局 */
.debug-layout {
  background-image: 
    linear-gradient(rgba(255, 0, 0, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 0, 0, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

### 2. 性能测试

```bash
# 检查 CSS 文件大小
npm run build:css

# 检查未使用的样式
npm run purgecss

# 性能分析
npm run analyze
```

### 3. 浏览器兼容性

```css
/* 浏览器前缀 */
.transform {
  -webkit-transform: translateZ(0);
  -moz-transform: translateZ(0);
  -ms-transform: translateZ(0);
  transform: translateZ(0);
}

/* 特性查询 */
@supports (display: grid) {
  .grid-container {
    display: grid;
  }
}
```

## 🚀 最佳实践

### 1. 性能最佳实践

- 使用 GPU 加速动画
- 避免过于复杂的选择器
- 使用 `will-change` 属性
- 保持 CSS 文件大小合理
- 使用 CSS 压缩

### 2. 可维护性最佳实践

- 遵循设计令牌系统
- 使用语义化类名
- 保持样式结构清晰
- 添加必要的注释
- 定期重构和优化

### 3. 团队协作最佳实践

- 遵循统一的编码规范
- 使用版本控制
- 定期代码审查
- 保持文档更新
- 分享最佳实践

## 📚 参考资料

- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [CSS-Tricks](https://css-tricks.com/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Google Web Fundamentals](https://developers.google.com/web/fundamentals)

---

*文档版本: 1.0*
*最后更新: 2025-08-12*