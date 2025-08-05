# Timeline 组件重构迁移指南

## 概述

本指南帮助开发者从旧的 Timeline 架构迁移到新的高内聚低耦合架构。重构遵循以下核心原则：

- **高内聚**：相关功能聚合在一起，单一职责明确
- **低耦合**：组件间依赖关系清晰，易于测试和维护
- **关注点分离**：数据、逻辑、样式分离

## 架构对比

### 旧架构问题

```
旧架构存在的问题：
├── 数据管理分散（useTimelineData + personDataService）
├── 组件职责混乱（TimelineItem 承担过多责任）
├── 样式与逻辑混合
├── 类型定义不统一
└── 难以测试和维护
```

### 新架构优势

```
新架构设计：
├── 统一数据管理层
│   ├── types/timelineTypes.ts (统一类型定义)
│   ├── services/timelineDataService.ts (数据服务)
│   ├── services/dataTransformers.ts (数据转换)
│   └── hooks/useUnifiedTimelineData.ts (数据Hook)
├── 组件功能拆分
│   ├── events/ (事件相关组件)
│   ├── sections/ (分组相关组件)
│   └── styles/ (样式模块)
└── 样式与逻辑分离
    ├── timelineStyles.module.css (样式模块)
    └── 组件专注逻辑处理
```

## 迁移步骤

### 第一步：数据层迁移

#### 1.1 替换数据Hook

**旧代码：**
```typescript
// 旧的数据获取方式
import { useTimelineData } from '../hooks/useTimelineData';
import { personDataService } from '../services/personDataService';

const { data, loading, error } = useTimelineData();
const personData = await personDataService.loadZouTaofenData();
```

**新代码：**
```typescript
// 新的统一数据管理
import { useUnifiedTimelineData } from '../hooks/useUnifiedTimelineData';
import { DataSourceType } from '../types/timelineTypes';

const {
  data,
  loading,
  error,
  searchEvents,
  getEventsByYear,
  refreshData
} = useUnifiedTimelineData({
  dataSource: DataSourceType.MIXED, // 支持多种数据源
  enableCache: true,
  autoLoad: true
});
```

#### 1.2 类型定义迁移

**旧类型：**
```typescript
// 多个分散的类型定义
interface TimelineEvent { /* ... */ }
interface CoreEvent { /* ... */ }
interface PersonTimelineEvent { /* ... */ }
```

**新类型：**
```typescript
// 统一的类型定义
import { 
  BaseTimelineEvent, 
  CoreEventGroup, 
  TimelineData 
} from '../types/timelineTypes';
```

### 第二步：组件迁移

#### 2.1 TimelineItem 组件迁移

**旧组件：**
```typescript
// 旧的单体组件
import TimelineItem from './TimelineItem';

<TimelineItem 
  event={event} 
  isFeatured={isFeatured}
/>
```

**新组件：**
```typescript
// 新的拆分组件
import RefactoredTimelineItem from './events/RefactoredTimelineItem';

<RefactoredTimelineItem
  event={event}
  isFeatured={isFeatured}
  onPersonClick={handlePersonClick}
  onImageLoad={handleImageLoad}
  onImageError={handleImageError}
/>
```

#### 2.2 CoreEventSection 组件迁移

**旧组件：**
```typescript
// 旧的分组组件
import CoreEventSection from './CoreEventSection';

<CoreEventSection 
  coreEvent={coreEvent}
  timeline={timeline}
/>
```

**新组件：**
```typescript
// 新的重构分组组件
import RefactoredCoreEventSection from './sections/RefactoredCoreEventSection';

<RefactoredCoreEventSection
  coreEventGroup={coreEventGroup}
  sectionIndex={index}
  onPersonClick={handlePersonClick}
  expandable={true}
  defaultExpanded={true}
/>
```

#### 2.3 页面组件迁移

**旧页面：**
```typescript
// 旧的页面组件
import TimelinePage from './TimelinePage';

<TimelinePage />
```

**新页面：**
```typescript
// 新的重构页面组件
import RefactoredTimelinePage from './RefactoredTimelinePage';

<RefactoredTimelinePage
  dataSource={DataSourceType.MIXED}
  enableSearch={true}
  enableFiltering={true}
  onPersonClick={handlePersonClick}
/>
```

### 第三步：样式迁移

#### 3.1 CSS 模块化

**旧样式：**
```typescript
// 内联样式或全局CSS
<div className="timeline-item transform scale-1.1 mb-8">
```

**新样式：**
```typescript
// CSS 模块
import styles from './styles/timelineStyles.module.css';

<div className={`${styles.timelineItem} ${styles.timelineItemFeatured}`}>
```

## 功能对比

### 数据管理功能

| 功能 | 旧架构 | 新架构 |
|------|--------|--------|
| 数据源支持 | 分散管理 | 统一配置 |
| 缓存机制 | 无 | 内置缓存 |
| 搜索功能 | 手动实现 | 内置搜索 |
| 过滤功能 | 分散逻辑 | 统一过滤 |
| 错误处理 | 基础处理 | 完善错误处理 |
| 加载状态 | 简单状态 | 详细状态管理 |

### 组件功能

| 功能 | 旧架构 | 新架构 |
|------|--------|--------|
| 职责分离 | 混合职责 | 单一职责 |
| 可复用性 | 低 | 高 |
| 可测试性 | 困难 | 容易 |
| 可维护性 | 困难 | 容易 |
| 性能优化 | 有限 | 优化良好 |

## 最佳实践

### 1. 数据管理

```typescript
// ✅ 推荐：使用统一数据管理
const { data, loading, error, searchEvents } = useUnifiedTimelineData({
  dataSource: DataSourceType.MIXED,
  enableCache: true,
  autoLoad: true
});

// ❌ 避免：直接调用多个数据服务
const timelineData = await fetch('/api/timeline');
const personData = await personDataService.loadData();
```

### 2. 组件设计

```typescript
// ✅ 推荐：单一职责组件
<TimelineEventContent event={event} isFeatured={isFeatured} />
<TimelineEventImage event={event} onLoad={handleLoad} />
<PersonLinkRenderer text={text} onPersonClick={handleClick} />

// ❌ 避免：单体组件承担多个职责
<TimelineItem 
  event={event} 
  showImage={true} 
  handlePersonLinks={true} 
  renderContent={true}
/>
```

### 3. 样式管理

```typescript
// ✅ 推荐：CSS 模块
import styles from './timelineStyles.module.css';
<div className={styles.timelineItem}>

// ❌ 避免：内联样式
<div style={{ transform: 'scale(1.1)', marginBottom: '2rem' }}>
```

## 性能优化

### 1. 数据缓存

```typescript
// 新架构自动缓存数据
const { data } = useUnifiedTimelineData({
  enableCache: true, // 启用缓存
  cacheTimeout: 5 * 60 * 1000 // 5分钟缓存
});
```

### 2. 组件懒加载

```typescript
// 支持组件懒加载
const RefactoredTimelinePage = React.lazy(() => 
  import('./RefactoredTimelinePage')
);
```

### 3. 虚拟化支持

```typescript
// 为大数据集准备的虚拟化支持
const { data, loading } = useUnifiedTimelineData({
  enableVirtualization: true,
  itemHeight: 200
});
```

## 测试策略

### 1. 数据层测试

```typescript
// 测试数据服务
import { timelineDataService } from '../services/timelineDataService';

test('should load timeline data', async () => {
  const data = await timelineDataService.loadData(DataSourceType.STATIC_JSON);
  expect(data).toBeDefined();
  expect(data.coreEventGroups).toBeInstanceOf(Array);
});
```

### 2. 组件测试

```typescript
// 测试组件渲染
import { render, screen } from '@testing-library/react';
import RefactoredTimelineItem from './RefactoredTimelineItem';

test('should render timeline item', () => {
  const mockEvent = { /* mock data */ };
  render(<RefactoredTimelineItem event={mockEvent} />);
  expect(screen.getByText(mockEvent.experience)).toBeInTheDocument();
});
```

## 故障排除

### 常见问题

1. **类型错误**
   - 确保使用新的统一类型定义
   - 检查导入路径是否正确

2. **样式问题**
   - 确保 CSS 模块正确导入
   - 检查 Tailwind CSS 配置

3. **数据加载问题**
   - 检查数据源配置
   - 确认网络请求正常

### 调试技巧

```typescript
// 启用调试模式
const { data, loading, error } = useUnifiedTimelineData({
  debug: true, // 启用调试日志
  dataSource: DataSourceType.MIXED
});
```

## 总结

重构后的 Timeline 组件架构具有以下优势：

1. **高内聚**：相关功能聚合，职责明确
2. **低耦合**：组件间依赖清晰，易于维护
3. **可扩展**：支持多种数据源和功能扩展
4. **可测试**：组件拆分便于单元测试
5. **高性能**：内置缓存和优化机制

按照本指南进行迁移，可以获得更好的代码质量和开发体验。