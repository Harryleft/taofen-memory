# 陶芬网站设计系统规范

## 概述

本文档定义了韬奋网站的完整设计系统，包括字体层级、色彩系统、组件样式等规范，确保整个应用的视觉一致性和可维护性。

## 字体系统

### 字体层级

我们采用四级标题系统，每个层级都有明确的用途和样式定义：

#### H1 - 主标题
- **字体**: EB Garamond (serif)
- **大小**: 3rem (48px)
- **权重**: 700 (bold)
- **行高**: 1.1
- **用途**: 页面主标题、重要章节标题
- **CSS类**: `.text-5xl .font-bold .font-serif`

#### H2 - 次级标题
- **字体**: EB Garamond (serif)
- **大小**: 2.25rem (36px)
- **权重**: 600 (semibold)
- **行高**: 1.2
- **用途**: 章节标题、重要内容区块标题
- **CSS类**: `.text-4xl .font-semibold .font-serif`

#### H3 - 三级标题
- **字体**: EB Garamond (serif)
- **大小**: 1.875rem (30px)
- **权重**: 600 (semibold)
- **行高**: 1.3
- **用途**: 子章节标题、卡片标题
- **CSS类**: `.text-3xl .font-semibold .font-serif`

#### H4 - 四级标题
- **字体**: EB Garamond (serif)
- **大小**: 1.5rem (24px)
- **权重**: 600 (semibold)
- **行高**: 1.4
- **用途**: 小节标题、组件内标题
- **CSS类**: `.text-2xl .font-semibold .font-serif`

### 正文字体

#### 主要正文
- **字体**: Noto Sans (sans-serif)
- **大小**: 1rem (16px)
- **权重**: 400 (normal)
- **行高**: 1.6
- **CSS类**: `.text-base .font-normal .font-sans`

#### 辅助文本
- **字体**: Noto Sans (sans-serif)
- **大小**: 0.875rem (14px)
- **权重**: 400 (normal)
- **行高**: 1.5
- **CSS类**: `.text-sm .font-normal .font-sans`

#### 小号文本
- **字体**: Noto Sans (sans-serif)
- **大小**: 0.75rem (12px)
- **权重**: 400 (normal)
- **行高**: 1.4
- **CSS类**: `.text-xs .font-normal .font-sans`

## 色彩系统

### 主色调

#### Charcoal（炭黑色）- 主要文本色
```css
--charcoal-50: #f8f8f8;
--charcoal-100: #f0f0f0;
--charcoal-200: #e0e0e0;
--charcoal-300: #c0c0c0;
--charcoal-400: #a0a0a0;
--charcoal-500: #808080;
--charcoal-600: #606060;
--charcoal-700: #404040;
--charcoal-800: #2c2c2c; /* 主色 */
--charcoal-900: #1a1a1a;
```

#### Gold（金色）- 强调色
```css
--gold-50: #fefdf8;
--gold-100: #fdf9e7;
--gold-200: #fbf2c4;
--gold-300: #f7e896;
--gold-400: #f1d968;
--gold-500: #d4af37; /* 强调金色 */
--gold-600: #b8860b; /* 主金色 */
--gold-700: #9a6f09;
--gold-800: #7d5a07;
--gold-900: #654805;
```

### 语义化颜色

#### 关系类型色彩
- **亲人家属**: `#8D6E63` (warm-rose)
- **学术文化**: `#1565C0` (heritage-blue)
- **政治社会**: `#689F38` (sage-green)
- **重要标记**: `#DC2626` (seal)

### 中性色

#### 背景色系
- **纯白**: `#FFFFFF` (bg-pure)
- **暖白**: `#FEFEFE` (bg-warm)
- **浅灰**: `#F8F8F8` (bg-subtle)
- **米色**: `#FAF7F0` (cream)

#### 文本色系
- **主要文本**: `#2C2C2C` (primary-dark)
- **次要文本**: `#666666` (primary-medium)
- **辅助文本**: `#999999` (primary-light)

## 组件字体样式

### 导航组件
```css
.nav-primary {
  font-family: 'Noto Sans', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  color: var(--charcoal-800);
}

.nav-secondary {
  font-family: 'Noto Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--charcoal-600);
}
```

### 卡片组件
```css
.card-title {
  font-family: 'EB Garamond', serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--charcoal-800);
  line-height: 1.3;
}

.card-content {
  font-family: 'Noto Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--charcoal-600);
  line-height: 1.5;
}

.card-meta {
  font-family: 'Noto Sans', sans-serif;
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--charcoal-500);
  line-height: 1.4;
}
```

### 按钮组件
```css
.btn-primary {
  font-family: 'Noto Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--charcoal-800);
}

.btn-secondary {
  font-family: 'Noto Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--charcoal-600);
}
```

### 表单组件
```css
.form-label {
  font-family: 'Noto Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--charcoal-700);
}

.form-input {
  font-family: 'Noto Sans', sans-serif;
  font-size: 1rem;
  font-weight: 400;
  color: var(--charcoal-800);
}

.form-help {
  font-family: 'Noto Sans', sans-serif;
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--charcoal-500);
}
```

## 向后兼容性

### 现有类名映射

为保持向后兼容，现有的Tailwind类名将继续工作：

- `text-charcoal` → `text-charcoal-800`
- `text-charcoal/70` → `text-charcoal-600`
- `text-charcoal/60` → `text-charcoal-500`
- `border-gold/30` → `border-gold-300`
- `bg-gold/5` → `bg-gold-50`

### 渐进式迁移

1. **第一阶段**: 在CSS中定义颜色变量
2. **第二阶段**: 更新Tailwind配置使用新的色阶
3. **第三阶段**: 逐步替换组件中的硬编码颜色
4. **第四阶段**: 统一字体样式类名

## 使用指南

### 颜色选择原则

1. **主要内容**: 使用charcoal-800作为主文本色
2. **次要内容**: 使用charcoal-600作为次要文本色
3. **辅助信息**: 使用charcoal-500作为辅助文本色
4. **强调元素**: 使用gold-600作为强调色
5. **交互状态**: 使用gold-500作为悬停状态

### 字体使用原则

1. **标题**: 统一使用EB Garamond serif字体
2. **正文**: 统一使用Noto Sans sans-serif字体
3. **层级**: 严格按照H1-H4层级使用
4. **权重**: 标题使用600-700，正文使用400-500

### 响应式考虑

```css
/* 移动端字体调整 */
@media (max-width: 768px) {
  .text-5xl { font-size: 2.5rem; } /* H1 */
  .text-4xl { font-size: 2rem; }   /* H2 */
  .text-3xl { font-size: 1.75rem; } /* H3 */
  .text-2xl { font-size: 1.5rem; }  /* H4 */
}
```

## 实施计划

### 阶段一：基础设施（1-2天）
- [ ] 更新index.css添加CSS变量
- [ ] 更新tailwind.config.js添加色阶系统
- [ ] 创建字体样式工具类

### 阶段二：组件更新（3-5天）
- [ ] 更新bookstore组件样式
- [ ] 更新导航组件样式
- [ ] 更新卡片组件样式
- [ ] 更新表单组件样式

### 阶段三：测试验证（1-2天）
- [ ] 视觉回归测试
- [ ] 响应式测试
- [ ] 可访问性测试

### 阶段四：文档完善（1天）
- [ ] 更新组件文档
- [ ] 创建样式指南
- [ ] 培训开发团队

---

*最后更新: 2024年12月*
*版本: 1.0.0*