# 时间线页面 UI 重设计方案（Phase 1 实施指引）

本文档定义时间线页面的视觉规范、信息架构与分阶段实施方案。本阶段聚焦“样式焕新”，不改变既有数据与组件契约。

## 设计目标
- 让“事件卡片”成为视觉主角，弱化中线与装饰金色。
- 建立清晰的信息层级（标题 > 年份/地点 > 正文）。
- 保持舒适行宽与留白，统一控件与卡片的气质。

## Design Tokens（CSS 变量）
- 背景与文本：
  - `--bg-cream: #FAF7F0`
  - `--text-charcoal: #1F2937`
  - `--text-muted: #6B7280`
- 强调与结构：
  - `--accent-gold: #B8860B`
  - `--surface: #FFFFFF`
  - `--border: rgba(0,0,0,.08)`
- 半径与阴影：
  - `--radius: 12px` / `--radius-sm: 8px`
  - `--shadow-sm: 0 1px 3px rgba(0,0,0,.06)`
  - `--shadow-md: 0 6px 24px rgba(0,0,0,.08)`

## 布局与模块
- 顶部标题区（沿用）
- 过滤栏（新增样式）：白底毛玻璃卡片、轻描边、紧凑输入
- 时间线主区：弱化中线与时间点，卡片成为阅读焦点
- 侧边目录：极简目录样式，活动项高亮但不过度抢眼

## Phase 1 改动范围
1) 在 `frontend/src/styles/timeline.css`：
   - 定义 Design Tokens。
   - 弱化 `.timeline-container::before` 渐变与宽度。
   - 降低 `.timeline-dot` 体积与高光。
   - 完善 `.timeline-sidenav*` 样式（玻璃卡片、对比度、hover/active）。
   - 新增 `.timeline-filter-card` 容器样式（吸顶工具条风格）。

2) 在 `frontend/src/pages/TimelinePage.tsx`：
   - 为过滤栏容器添加 `timeline-filter-card` 类以应用新样式。

## 不在本阶段执行
- 不调整子组件 `TimelineCoreEventSection` 与数据结构。
- 不引入复杂动效或虚拟滚动。

## 验收清单（Phase 1）
- 中线弱显、不喧宾夺主；时间点不再抢戏。
- 目录观感轻、易扫读；活动项高亮明显但克制。
- 过滤栏呈卡片化，输入框与整体 UI 风格一致。
- 在桌面与移动端均无遮挡和样式错位。

## 后续（Phase 2/3 概览）
- Phase 2：图文卡交错布局、首事件轻放大、统一 skeleton。
- Phase 3：顶部时间总览、目录联动动效与更丰富的可达性优化。


