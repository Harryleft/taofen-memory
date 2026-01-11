# 邹韬奋数字叙事平台 - 代码修复与测试开发指令

## 项目概述

这是一个关于邹韬奋的沉浸式数字叙事平台，包含前端React应用、Node.js后端服务、缓存服务和IIIF图像服务。

**当前状态分析：**
- ✅ 6个核心模块已实现（HeroIntro、Timeline、Bookstore、Handwriting、Newspapers、Relationships）
- ⚠️ 存在代码质量问题需要修复
- ⚠️ 测试覆盖率不足，需要补充测试
- ⚠️ 部分测试套件存在错误

## 当前核心任务

### 🔥 优先级1：修复现有测试错误

#### 测试套件问题（必须立即修复）

**问题1：TestDataGenerator.ts 没有测试**
- 位置：`frontend/src/__tests__/utils/TestDataGenerator.ts`
- 错误：Test suite must contain at least one test
- 解决方案：为TestDataGenerator工具编写单元测试

**问题2：TimelineNavigation.test.tsx 模块解析失败**
- 位置：`frontend/src/__tests__/TimelineNavigation.test.tsx`
- 错误：Cannot find module 'react/jsx-runtime' from 'framer-motion'
- 根本原因：framer-motion在Jest环境下的配置问题
- 解决方案：修复Jest配置或framer-motion的mock配置

#### 验证命令
```bash
cd frontend
npm run test -- --watchAll=false
```

#### 成功标准
- ✅ 所有测试套件通过（4/4）
- ✅ 无测试运行错误
- ✅ 所有现有测试保持通过

---

### ⚡ 优先级2：修复ESLint错误

#### 必须修复的错误（Error级别）

**文件1：`src/components/iiif/iiifUrlBuilder.ts`**
```typescript
// 第6行：未使用的变量
- 删除 'isProduction' 或使用它

// 第120行：使用any类型
- 为函数参数添加明确的类型定义
```

**文件2：`src/components/newspapers/NewspapersIntegratedLayout.tsx`**
```typescript
// 第10行：未使用的变量
- 删除 'isDevelopment' 或使用它
```

**文件3：`src/components/newspapers/services.ts`**
```typescript
// 第10-16行：多处使用any类型
- 为所有函数参数添加明确的接口或类型定义
- 建议创建专门的类型定义文件
```

#### 验证命令
```bash
cd frontend
npm run lint
```

#### 成功标准
- ✅ 0个Error级别问题
- ✅ 警告级别可以在后续优化

---

### 📊 优先级3：补充测试覆盖

#### 高优先级模块（需要立即编写测试）

**1. 核心组件测试**
- `src/components/common/SafeDisplay.tsx` - 安全显示组件
- `src/components/handwriting/Toast.tsx` - 通知组件
- `src/components/newspapers/` - 报纸相关组件

**2. 工具函数测试**
- `src/components/iiif/iiifUrlBuilder.ts` - IIIF URL构建工具
- `src/hooks/useImageCache.ts` - 图片缓存Hook
- `src/components/newspapers/services.ts` - 报纸服务

**3. 集成测试**
- IIIF图像查看流程
- 报纸文章搜索和归档
- 时间轴导航交互

#### 测试框架和工具
```bash
# 单元测试框架：Jest + React Testing Library
# E2E测试：Playwright
# 测试覆盖率：npm run test:coverage

# 查看覆盖率报告
npm run test:coverage
```

#### 成功标准
- ✅ 核心组件测试覆盖率达到70%+
- ✅ 关键工具函数测试覆盖率达到80%+
- ✅ 所有新测试通过

---

### 🛠️ 优先级4：修复React Hooks警告

#### Hooks依赖问题

**文件1：`src/components/examples/IIIFCacheExample.tsx`**
```
第86行：useEffect缺少依赖 'loadImage'
- 添加loadImage到依赖数组，或用useCallback包装
```

**文件2：`src/hooks/useImageCache.ts`**
```
第343行：useCallback缺少依赖 'concurrency'
- 添加concurrency到依赖数组

第489行：ref清理函数问题
- 将ref值复制到局部变量后再使用
```

#### 成功标准
- ✅ 所有React Hooks警告消除
- ✅ Hooks依赖正确配置

---

### 🎨 优先级5：优化Fast Refresh警告（可选）

React Fast Refresh警告不影响功能，但影响开发体验。可以在上述任务完成后处理。

---

## 开发规范

### 代码修复原则

**1. 最小化改动原则**
- ✅ 只修复必要的部分
- ✅ 不重构 unrelated 代码
- ✅ 保持现有代码风格

**2. Git提交规范**
```bash
# 每完成一个小修复就提交
git add .
git commit -m "fix: 修复XX文件中的YY问题"

# 测试添加后单独提交
git add .
git commit -m "test: 为XX组件添加单元测试"
```

**3. 测试编写原则**
- ✅ 测试应该独立运行
- ✅ 测试应该快速执行
- ✅ 测试名称应该清晰描述测试内容
- ✅ 使用describe和it组织测试结构

**4. 类型安全原则**
- ✅ 消除所有any类型
- ✅ 使用明确的接口定义
- ✅ 启用strict模式类型检查

### 工具使用

**使用Google MCP搜索确认**
当遇到不确定的技术问题时：
- 搜索最新的解决方案
- 查找官方文档
- 参考类似项目的实现

**使用Web工具验证**
- 验证API使用是否正确
- 确认依赖版本兼容性
- 查找最佳实践

---

## 验证命令汇总

```bash
# 进入前端目录
cd frontend

# 1. 运行测试
npm run test -- --watchAll=false

# 2. 代码检查
npm run lint

# 3. 构建检查
npm run build

# 4. 测试覆盖率
npm run test:coverage

# 5. 类型检查（需要先添加脚本）
npm run typecheck
```

---

## 停止条件

Ralph应该在满足以下**所有**条件时停止：

### 必须满足（硬性条件）
- [ ] **所有测试套件通过** - 4/4测试套件无错误
- [ ] **0个ESLint Error** - 代码检查无错误
- [ ] **测试覆盖率提升** - 核心模块覆盖率从当前提升到60%+
- [ ] **React Hooks警告消除** - useEffect/useCallback依赖正确

### 可选条件（软性条件）
- [ ] Warning级别问题减少50%+
- [ ] Fast Refresh警告消除（可选）
- [ ] 添加typecheck脚本到package.json

---

## ⚠️ 重要：完成报告规则

**绝对不要提前报告完成！**

只有在以下情况才能认为任务完成：
1. ✅ **所有4个硬性条件都满足**（测试通过、0个ESLint错误、覆盖率60%+、Hooks警告消除）
2. ✅ **@fix_plan.md中所有21项任务都标记为已完成**
3. ✅ **验证命令全部通过**（`npm run test -- --watchAll=false`和`npm run lint`都成功）

**以下情况不表示完成：**
- ❌ 只是分析问题或确认状态
- ❌ 只完成部分任务
- ❌ 只修复了部分错误
- ❌ 只是理解了要求
- ❌ 运行了验证但仍有错误

**每次响应时必须明确：**
- 当前完成了哪些具体任务（引用@fix_plan.md中的项）
- 还有哪些任务待完成
- 不要使用"任务完成"、"全部完成"、"项目完成"等模糊表述，除非真的满足上述所有条件

---

## 重要约束

### 必须遵守
- ✅ **保持现有功能不被破坏** - 每次修改后验证现有功能正常
- ✅ **每次修复都要提交** - 一个修复一个commit，便于回溯
- ✅ **遵循项目规范** - 参考CLAUDE.md中的开发规范
- ✅ **使用中文沟通** - 所有提交信息、注释使用中文
- ✅ **增量式修改** - 一次只修复一个问题，不要大爆炸式改动

### 禁止事项
- ❌ **不要重构unrelated代码** - 只修复lint错误和测试问题
- ❌ **不要修改业务逻辑** - 保持现有功能不变
- ❌ **不要添加新功能** - 当前任务是修复和测试，不开发新功能
- ❌ **不要修改配置文件** - 除非是修复测试必需
- ❌ **不要大量修改文件结构** - 保持现有目录结构

---

## 工具和资源

### MCP工具使用
- **Google搜索**：查找技术问题的解决方案
- **Web读取**：查阅官方文档和最佳实践
- **GitHub搜索**：查找类似问题的讨论

### 项目文档
- `CLAUDE.md` - 项目开发规范
- `docs/` - 项目文档
- `diss/` - 讨论文档

### 测试文档
- React Testing Library: https://testing-library.com/react
- Jest文档: https://jestjs.io/
- Playwright文档: https://playwright.dev/

---

## 当前进度跟踪

### 测试状态
- 测试套件：2 failed, 2 passed (目标：4 passed)
- 测试用例：13 passed (目标：更多)
- 覆盖率：待统计 (目标：60%+)

### ESLint状态
- Error级别：9个 (目标：0)
- Warning级别：多个 (目标：减少50%+)

---

## 特殊说明

### 关于framer-motion测试问题
TimelineNavigation.test.tsx的framer-motion问题可能需要：
1. 检查Jest配置中的moduleNameMapper
2. 添加framer-motion的mock
3. 或考虑使用@testing-library/react-native的mock模式

优先尝试修复配置，如果配置复杂，可以考虑：
- 在测试中mock掉使用motion的部分
- 或为TimelineNavigation创建一个不依赖motion的测试版本

### 关于TestDataGenerator
这是一个工具文件，需要添加实际的测试用例，至少应该包括：
- 测试数据生成功能
- 边界情况处理
- 数据格式验证

---

**最后更新：2026-01-11**
**目标：代码质量达标，测试覆盖充分**
