# 🎨 前端样式系统设计文档

## 📋 概述

本文档详细描述了项目的前端样式系统设计，包括设计令牌、组件样式、响应式设计等核心内容。

## 🏗️ 设计令牌系统

### 1. 色彩系统

#### 1.1 基础色彩
```javascript
// 主要色彩定义
colors: {
  // 基础色彩系统
  'primary': '#2C2C2C',           // 主要文字色
  'secondary': '#666666',         // 次要文字色
  'muted': '#999999',            // 静音文字色
  
  // 主题色
  'cream': '#FAF7F0',            // 主背景色
  'gold': '#B8860B',             // 主强调色
  'charcoal': '#2C2C2C',         // 主文字色
  'seal': '#DC2626',             // 错误/警告色
}
```

#### 1.2 语义化色彩
```javascript
// 语义化色彩系统
'warm-rose': '#8D6E63',        // 亲人家属 - 温暖克制的棕玫瑰色
'heritage-blue': '#1565C0',    // 学术文化 - 文化传承的深蓝色
'sage-green': '#689F38',       // 政治社会 - 稳重的橄榄绿
```

#### 1.3 分类色彩
```javascript
// 分类色彩系统
'category-gray': '#6b7280',    // 全部/默认分类
'category-red': '#ef4444',     // 家庭关系
'category-blue': '#3b82f6',    // 媒体关系
'category-green': '#10b981',   // 政治关系
'category-purple': '#8b5cf6',  // 学术关系
'category-orange': '#f97316',  // 其他关系
```

#### 1.4 功能色彩
```javascript
// 功能色彩系统
'accent-gold': '#D4AF37',      // 主要强调色
'accent-light-gold': '#F4E4BC', // 轻强调色

// 背景色彩系统
'bg-pure': '#FFFFFF',          // 纯白背景
'bg-warm': '#FEFEFE',          // 温暖背景
'bg-subtle': '#F8F8F8',        // 微妙背景
'bg-card': '#FFFFFF',          // 卡片背景

// 边框色彩系统
'border-light': 'rgba(0, 0, 0, 0.08)',
'border-medium': 'rgba(0, 0, 0, 0.12)',
'border-strong': 'rgba(0, 0, 0, 0.16)',
'border-gold': 'rgba(212, 175, 55, 0.3)',
```

### 2. 间距系统

```javascript
spacing: {
  'xs': '0.5rem',    // 8px
  'sm': '0.75rem',   // 12px
  'md': '1rem',      // 16px
  'lg': '1.25rem',   // 20px
  'xl': '1.5rem',    // 24px
  '2xl': '2rem',     // 32px
  '3xl': '2.5rem',   // 40px
  '4xl': '3rem',     // 48px
  '5xl': '4rem',     // 64px
  '6xl': '6rem',     // 96px
}
```

### 3. 圆角系统

```javascript
borderRadius: {
  'xs': '0.25rem',   // 4px
  'sm': '0.375rem',  // 6px
  'md': '0.5rem',    // 8px
  'lg': '0.75rem',   // 12px
  'xl': '1rem',      // 16px
  '2xl': '1.5rem',   // 24px
  '3xl': '2rem',     // 32px
  'full': '9999px',
}
```

### 4. 阴影系统

```javascript
boxShadow: {
  'xs': '0 1px 2px rgba(0, 0, 0, 0.05)',
  'sm': '0 1px 3px rgba(0, 0, 0, 0.1)',
  'md': '0 4px 6px rgba(0, 0, 0, 0.1)',
  'lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
  'xl': '0 20px 25px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px rgba(0, 0, 0, 0.15)',
  'inner': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
  'card': '0 2px 4px rgba(0, 0, 0, 0.04), 0 4px 8px rgba(0, 0, 0, 0.06), 0 8px 16px rgba(0, 0, 0, 0.08)',
  'hover': '0 8px 16px rgba(0, 0, 0, 0.08), 0 16px 32px rgba(0, 0, 0, 0.12), 0 24px 48px rgba(0, 0, 0, 0.16)',
}
```

### 5. 字体系统

```javascript
fontFamily: {
  'serif': ['EB Garamond', 'serif'],
  'sans': ['Noto Sans', 'sans-serif'],
  'song': ['SimSun', '宋体', 'NSimSun', 'serif'],
  'kai': ['KaiTi', 'STKaiti', '华文楷体', 'serif'],
  'fangsong': ['FangSong', 'STFangsong', '华文仿宋', 'serif'],
  'hei': ['SimHei', '黑体', 'Microsoft YaHei', 'sans-serif'],
  'pingfang': ['PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
  'times': ['Times New Roman', 'Georgia', 'serif'],
}
```

### 6. 动画系统

#### 6.1 动画定义
```javascript
animation: {
  'fade-in': 'fadeIn 0.5s ease-out',
  'slide-up': 'slideUp 0.6s ease-out',
  'float': 'float 3s ease-in-out infinite',
  'subtle-float': 'subtle-float 4s ease-in-out infinite',
  'slide-in-right': 'slideInFromRight 0.6s ease-out',
  'fade-in-up': 'fadeInUp 0.6s ease-out',
  'blob': 'blob 7s infinite',
  'card-enter': 'cardEnter 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
  'stagger-in': 'staggerIn 0.6s ease-out forwards',
}
```

#### 6.2 关键帧定义
```javascript
keyframes: {
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
  slideUp: {
    '0%': { transform: 'translateY(20px)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
  float: {
    '0%, 100%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-10px)' },
  },
  // ... 更多动画定义
}
```

## 📱 响应式设计

### 1. 断点系统

```javascript
screens: {
  'xs': '475px',      // 超小屏幕
  'sm': '640px',      // 小屏幕
  'md': '768px',      // 中等屏幕
  'lg': '1024px',     // 大屏幕
  'xl': '1280px',     // 超大屏幕
  '2xl': '1536px',    // 2K 屏幕
}
```

### 2. 响应式策略

#### 2.1 移动优先
- 所有样式默认针对移动端设计
- 使用 `min-width` 断点逐步增强桌面端体验

#### 2.2 灵活布局
- 使用 Flexbox 和 Grid 实现自适应布局
- 避免固定宽度，使用相对单位和百分比

## 🎯 组件样式

### 1. 页面组件

#### 1.1 基础页面容器
```css
.page-container {
  @apply min-h-screen bg-cream;
}
```

#### 1.2 内容容器
```css
.content-container {
  @apply max-w-7xl mx-auto px-6 py-12;
}
```

### 2. 卡片组件

#### 2.1 基础卡片
```css
.card-base {
  @apply bg-white rounded-xl shadow-card overflow-hidden;
  transform: translateZ(0);
  will-change: transform, box-shadow;
  backface-visibility: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-base:hover {
  @apply shadow-hover;
  transform: translateY(-4px);
}
```

#### 2.2 特殊卡片变体
```css
/* Masonry 卡片 */
.masonry-card-base {
  @apply absolute cursor-pointer overflow-hidden;
  box-shadow: var(--shadow-card);
  background: linear-gradient(135deg, rgba(250, 247, 240, 0.8) 0%, rgba(255, 255, 255, 0.9) 100%);
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 16px;
  transform: translateZ(0);
  will-change: transform, box-shadow, opacity;
  backface-visibility: hidden;
}
```

### 3. 头像组件

#### 3.1 基础头像
```css
.avatar-container {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffffff 0%, #f8f8f8 100%);
  border: 3px solid rgba(212, 175, 55, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateZ(0);
  will-change: transform, border-color, box-shadow;
  backface-visibility: hidden;
}
```

### 4. 按钮组件

#### 4.1 基础按钮
```css
.button-base {
  @apply px-6 py-3 rounded-lg font-medium transition-all duration-300;
  transform: translateZ(0);
  will-change: transform, background-color;
  backface-visibility: hidden;
}

.button-primary {
  @apply bg-gold text-white hover:bg-gold/90 shadow-md hover:shadow-lg;
}

.button-secondary {
  @apply bg-white text-primary border border-gold/30 hover:bg-gold/5;
}
```

### 5. 表单组件

#### 5.1 输入框
```css
.input-base {
  @apply w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all duration-300;
}

.input-error {
  @apply border-red-500 focus:ring-red-500/50;
}
```

## 🎨 特殊效果

### 1. GPU 加速

所有动画元素都添加了 GPU 加速属性：
```css
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform, opacity, filter;
  backface-visibility: hidden;
}
```

### 2. 过渡动画

```javascript
transitionDuration: {
  'fast': '150ms',
  'normal': '300ms',
  'slow': '500ms',
}

transitionTimingFunction: {
  'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
  'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
}
```

### 3. 背景效果

```javascript
backgroundImage: {
  'noise': "url('data:image/svg+xml;base64,...')",
  'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
}
```

## 📋 使用指南

### 1. 颜色使用

```css
/* 使用设计令牌 */
.text-primary { color: var(--primary); }
.bg-cream { background-color: var(--cream); }
.border-category-red { border-color: var(--category-red); }
```

### 2. 间距使用

```css
/* 使用间距系统 */
.margin-md { margin: 1rem; }
.padding-lg { padding: 1.25rem; }
.gap-xl { gap: 1.5rem; }
```

### 3. 动画使用

```css
/* 使用统一动画 */
.animate-fade-in { animation: fadeIn 0.5s ease-out; }
.animate-slide-up { animation: slideUp 0.6s ease-out; }
.animate-float { animation: float 3s ease-in-out infinite; }
```

### 4. 响应式设计

```css
/* 使用统一断点 */
@media (max-width: 640px) { /* 移动端 */ }
@media (min-width: 641px) and (max-width: 768px) { /* 平板 */ }
@media (min-width: 769px) { /* 桌面端 */ }
```

## 🔧 维护指南

### 1. 新增颜色

1. 在 `tailwind.config.js` 中添加颜色定义
2. 确保颜色符合设计系统规范
3. 更新相关文档

### 2. 新增组件

1. 遵循现有的命名规范
2. 使用设计令牌而非硬编码值
3. 添加 GPU 加速属性
4. 测试响应式效果

### 3. 性能优化

1. 避免过于复杂的选择器
2. 使用 `will-change` 属性优化动画
3. 保持 CSS 文件大小合理
4. 定期清理未使用的样式

---

*文档版本: 1.0*
*最后更新: 2025-08-12*