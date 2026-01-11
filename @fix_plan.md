# 任务优先级列表

## 🔥 高优先级（立即处理）

### 测试修复
- [ ] 修复TestDataGenerator.ts - 添加至少3个测试用例
- [ ] 修复TimelineNavigation.test.tsx - 解决framer-motion模块解析问题
- [ ] 验证所有测试套件通过 - 4/4 passed

### ESLint错误修复
- [ ] iiifUrlBuilder.ts - 删除未使用的isProduction变量
- [ ] iiifUrlBuilder.ts - 第120行消除any类型
- [ ] NewspapersIntegratedLayout.tsx - 删除未使用的isDevelopment变量
- [ ] services.ts - 为所有any类型添加明确类型定义

### React Hooks警告
- [ ] IIFCacheExample.tsx - 修复useEffect依赖
- [ ] useImageCache.ts - 修复useCallback依赖
- [ ] useImageCache.ts - 修复ref清理函数问题

## ⚡ 中优先级（本周完成）

### 核心组件测试
- [ ] SafeDisplay.tsx - 单元测试
- [ ] Toast.tsx - 单元测试
- [ ] iiifUrlBuilder.ts - 工具函数测试
- [ ] services.ts - 服务函数测试

### 测试覆盖率提升
- [ ] 核心组件覆盖率达到70%+
- [ ] 工具函数覆盖率达到80%+
- [ ] 生成覆盖率报告

## 📅 低优先级（后续优化）

- [ ] 减少Fast Refresh警告
- [ ] 添加typecheck脚本
- [ ] 添加E2E测试场景
- [ ] 性能测试和优化

## ✅ 已完成

- [x] 创建PROMPT.md开发指令
- [x] 创建Ralph目录结构
- [x] 分析现有测试和代码质量问题
