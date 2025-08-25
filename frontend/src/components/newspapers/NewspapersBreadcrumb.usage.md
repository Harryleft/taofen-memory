# 面包屑导航组件使用说明

## 组件概述

`NewspapersBreadcrumb` 组件为数字报刊模块提供了面包屑导航功能，支持用户快速导航到不同层级。

## 功能特性

- **层级导航**: 支持 `数字报刊 › 刊物名称 › 期数标题` 三级导航
- **点击导航**: 点击非当前层级可快速跳转
- **响应式设计**: 移动端显示简化版本，桌面端显示完整面包屑
- **状态同步**: 与主组件状态完全同步

## 组件接口

```typescript
interface NewspapersBreadcrumbProps {
  publications: PublicationItem[];      // 刊物列表
  selectedPublication?: PublicationItem | null;  // 当前选中的刊物
  selectedIssue?: IssueItem | null;    // 当前选中的期数
  onPublicationSelect?: (publication: PublicationItem) => void;  // 刊物选择回调
  onIssueSelect?: (issue: IssueItem) => void;  // 期数选择回调
  onRootSelect?: () => void;           // 根目录选择回调
  isMobile?: boolean;                  // 是否移动端
}
```

## 使用示例

### 基本使用

```tsx
import { NewspapersBreadcrumb } from './NewspapersBreadcrumb';

function MyComponent() {
  return (
    <NewspapersBreadcrumb
      publications={publications}
      selectedPublication={selectedPublication}
      selectedIssue={selectedIssue}
      onPublicationSelect={handlePublicationSelect}
      onIssueSelect={handleIssueSelect}
      onRootSelect={handleRootSelect}
      isMobile={isMobile}
    />
  );
}
```

### 事件处理

```tsx
// 返回根目录
const handleRootSelect = () => {
  setSelectedPublication(null);
  setSelectedIssue(null);
  setIssues([]);
};

// 选择刊物
const handlePublicationSelect = (publication: PublicationItem) => {
  setSelectedPublication(publication);
  // 加载该刊物的期数...
};

// 选择期数
const handleIssueSelect = (issue: IssueItem) => {
  setSelectedIssue(issue);
  // 加载查看器...
};
```

## 样式定制

组件使用以下 CSS 类：

- `.newspapers-breadcrumb`: 面包屑容器
- `.newspapers-breadcrumb__list`: 面包屑列表
- `.newspapers-breadcrumb__item`: 面包屑项目
- `.newspapers-breadcrumb__link`: 可点击的面包屑链接
- `.newspapers-breadcrumb__text`: 当前项目文本
- `.newspapers-breadcrumb__separator`: 分隔符

移动端专用样式：

- `.newspapers-breadcrumb--mobile`: 移动端容器
- `.newspapers-breadcrumb__mobile-current`: 移动端当前项目
- `.newspapers-breadcrumb__mobile-back`: 移动端返回按钮

## 响应式行为

### 桌面端 (> 768px)
显示完整面包屑：`数字报刊 › 生活周刊 › 第01卷第002期`

### 移动端 (≤ 768px)
显示简化版本：`← 第01卷第002期`

## 测试

组件包含完整的单元测试，覆盖以下场景：

- 基本渲染测试
- 不同状态下的显示测试
- 点击事件测试
- 移动端适配测试

运行测试：
```bash
npm test -- NewspapersBreadcrumb.test.tsx
```

## 注意事项

1. 确保传入的 `publications` 数组不为空
2. 移动端模式下，返回按钮会自动导航到上一级
3. 当前层级（最后一个项目）不可点击
4. 组件会自动处理文本截断，避免溢出