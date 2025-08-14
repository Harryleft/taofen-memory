# Header 背景色动态切换方案分析

## 问题概述

### 当前状态
- **所有页面**：Header都使用透明背景 (`backgroundColor: 'transparent'`)
- **首页**：在EnhancedHero中直接使用BaseHeader组件
- **其他页面**：使用AppHeader组件，传入moduleId
- **问题**：首页第一屏幕应该透明，滚动后变白；其他页面应该直接白色背景

### 需求分析
1. **首页第一屏幕**：Header背景透明
2. **首页滚动后**：Header背景变为白色
3. **其他页面**：Header背景直接为白色

## 现有架构分析

### 组件结构
```
AppHeader (接收moduleId)
└── BaseHeader (接收config)
    ├── HeroLayout
    ├── SiteLogo
    ├── DesktopNavigation
    ├── MobileMenuButton
    └── MobileMenu
```

### 配置系统
- `header.configs.tsx`: 定义所有页面的header配置
- 支持三种背景色：`'transparent' | 'white' | 'gradient'`
- 当前所有页面都配置为 `'transparent'`

### 页面使用方式
1. **首页** (`HomePage.tsx`): 
   ```tsx
   // 在EnhancedHero中直接使用
   <BaseHeader config={headerConfigs.home} />
   ```
2. **其他页面**: 
   ```tsx
   <AppHeader moduleId="timeline" />
   ```

## 解决方案

### 推荐方案：统一AppHeader + 滚动监听

#### 优点
- 架构统一，所有页面使用相同的组件
- 逻辑集中，易于维护
- 性能好，只在首页监听滚动
- 配置驱动，保持现有设计模式

#### 实现步骤

##### 1. 修改首页使用AppHeader
```tsx
// HomePage.tsx
function HomePage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <AppHeader moduleId="home" />
      <EnhancedHero />
      {/* ... */}
    </div>
  );
}
```

##### 2. 修改EnhancedHero移除Header
```tsx
// EnhancedHero.tsx
export default function EnhancedHero() {
  return (
    <>
      {/* 移除 <BaseHeader config={headerConfigs.home} /> */}
      {/* 其他内容保持不变 */}
    </>
  );
}
```

##### 3. 在AppHeader中添加滚动监听
```tsx
// AppHeader.tsx
import { useLocation } from 'react-router-dom';

const AppHeader: React.FC<AppHeaderProps> = ({ moduleId }) => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  
  // 获取基础配置
  const baseConfig = headerConfigs[moduleId] || headerConfigs.default;
  
  // 监听滚动（只在首页）
  useEffect(() => {
    if (location.pathname === '/') {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 100);
      };
      
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [location.pathname]);
  
  // 动态计算背景色
  const effectiveConfig = useMemo(() => {
    if (location.pathname === '/') {
      return {
        ...baseConfig,
        backgroundColor: isScrolled ? 'white' : 'transparent'
      };
    }
    return {
      ...baseConfig,
      backgroundColor: 'white'
    };
  }, [baseConfig, location.pathname, isScrolled]);
  
  return <BaseHeader config={effectiveConfig} />;
};
```

##### 4. 调整header配置
```tsx
// header.configs.tsx
export const headerConfigs: Record<string, HeaderConfig> = {
  home: {
    // ... 其他配置保持不变
    backgroundColor: 'transparent', // 基础配置，会被AppHeader动态调整
  },
  // 其他页面配置保持不变
};
```

## 技术实现细节

### 滚动监听优化
- 只在首页 (`pathname === '/'`) 添加滚动监听
- 使用 `useEffect` 清理事件监听器
- 滚动阈值设为 `100px`，可以根据需要调整

### 性能考虑
- 使用 `useMemo` 避免不必要的配置对象重建
- 只在必要时才重新计算背景色
- 滚动事件使用节流（如果需要进一步优化）

### 过渡动画
- BaseHeader已有 `transition-all duration-700` 类
- 背景色切换会有平滑过渡效果

## 实施计划

### 第一阶段：架构统一
1. 修改HomePage使用AppHeader
2. 修改EnhancedHero移除重复的Header
3. 确保功能正常

### 第二阶段：动态背景
1. 在AppHeader中添加滚动监听逻辑
2. 实现动态背景色计算
3. 测试滚动效果

### 第三阶段：优化调整
1. 调整滚动阈值
2. 优化性能（如果需要）
3. 确保所有页面正常工作

## 风险评估

### 低风险
- 修改是增量式的，可以逐步测试
- 不影响现有功能逻辑
- 可以随时回滚

### 注意事项
- 确保移动端滚动正常
- 测试页面切换时的状态重置
- 验证滚动监听器的正确添加和移除

## 总结

这个方案通过统一AppHeader的使用方式，并在其中添加智能的滚动监听逻辑，可以优雅地实现首页第一屏幕透明、滚动后变白，其他页面直接白色的需求。方案保持了现有架构的优点，同时提供了所需的功能扩展。