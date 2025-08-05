# 前端架构重构计划

本文档旨在为 `frontend/src` 目录提供一个全面的重构方案，以解决当前代码结构存在的问题，并引入现代化的前端工程实践。

## 1. 现状分析

当前项目结构主要“按文件类型组织”，例如 `components`, `hooks`, `services`, `pages` 等。这种结构在项目初期易于理解，但随着业务复杂度的增加，暴露了以下问题：

- **低内聚、高耦合：** 实现一个完整功能（例如用户认证）的代码分散在多个目录中，导致模块内部联系松散，而模块之间依赖关系复杂。
- **可扩展性差：** 新增或修改功能时，需要在多个目录之间跳转，增加了心智负担和出错的风险。
- **职责不清晰：** `components` 目录中的组件是全局共享还是页面私有，界限模糊，容易造成滥用。
- **样式管理混乱：** 缺乏统一的样式方案，容易导致样式冲突和冗余。

## 2. 重构目标

本次重构的核心目标是转向“**按功能模块组织 (Feature-based)**”的架构，并达成以下目的：

- **高内聚、低耦合：** 将实现同一功能的代码（组件、Hooks、服务、类型等）集中到同一个模块文件夹下。
- **提升代码复用性：** 建立明确的共享组件库 (`components/ui`) 和通用逻辑库 (`lib`)。
- **集中化管理：** 引入全局状态管理方案，统一管理跨功能模块的共享状态。
- **现代化工具链：** 全面采用 **Tailwind CSS** 进行样式开发，提升开发效率和一致性。
- **提升项目可维护性与健壮性：** 引入自动化测试、标准化错误处理和开发规范，降低长期维护成本。

## 3. 规划的目录结构

```
frontend/src/
├── App.tsx
├── main.tsx
├── assets/              # 静态资源 (图片, 字体等)
├── components/
│   ├── ui/              # 1. 可复用的基础UI组件 (Button, Input, Card...)
│   └── layout/          # 2. 页面布局组件 (Header, Footer, Sidebar...)
├── features/            # 3. 核心业务功能模块
│   ├── authentication/  # (示例) 用户认证模块
│   │   ├── components/  # 该模块独有的组件
│   │   ├── hooks/       # 该模块独有的Hooks
│   │   ├── services.ts  # API请求
│   │   ├── types.ts     # 类型定义
│   │   └── index.ts     # 模块出口
│   └── timeline/        # (示例) 时间线模块
│       └── ...
├── hooks/               # 4. 全局可复用的Hooks
├── lib/                 # 5. 通用工具函数、常量等
│   └── utils.ts
├── services/            # 6. 全局API服务配置 (axios实例, 拦截器等)
├── store/               # 7. 集中状态管理 (Zustand / Redux)
│   ├── slices/          # 状态切片
│   └── index.ts
├── styles/              # 8. 全局样式和Tailwind CSS配置
│   └── globals.css
└── types/               # 9. 全局共享的类型定义
```

## 4. 重构路线图

重构将分阶段进行，以降低风险，确保项目在整个过程中的稳定性。

### 阶段一：基础建设 (Infrastructure Setup)

此阶段专注于搭建新结构的基础，不迁移任何业务逻辑。

- **步骤 1.1：创建新目录结构。**
  - 在 `src` 下创建 `assets`, `components/ui`, `components/layout`, `features`, `lib`, `services`, `store`, `styles`, `types` 目录。
- **步骤 1.2：集成与配置 Tailwind CSS。**
  - 安装并配置 `tailwind.config.js` 和 `postcss.config.js`。
  - 在 `styles/globals.css` 中引入 Tailwind 的基础、组件和工具类。
- **步骤 1.3：建立基础UI组件库。**
  - 在 `components/ui` 目录下创建几个原子化的、无业务逻辑的共享组件，例如 `Button.tsx`, `Input.tsx`, `Card.tsx`。这些组件将使用 Tailwind CSS 构建。

### 阶段二：试点功能迁移 (Pilot Feature Migration)

选择一个相对独立、业务逻辑简单的功能作为试点，验证新架构的可行性。

- **步骤 2.1：选择试点功能。**
  - 建议选择一个独立的页面或功能，例如“用户登录/注册”或“关于我们”页面。
- **步骤 2.2：迁移代码到新模块。**
  - 为该功能创建一个新的模块文件夹，例如 `features/authentication`。
  - 将所有与该功能相关的代码（原 `pages`, `components`, `hooks` 中的部分）移动到新目录中。
- **步骤 2.3：重构试点功能。**
  - 使用阶段一创建的 `components/ui` 组件替换旧的UI组件。
  - 全面使用 Tailwind CSS 替代原有的 CSS 写法。

### 阶段三：建立集中状态管理 (Centralized State Management)

引入全局状态管理库，解决跨组件状态共享问题。

- **步骤 3.1：引入状态管理库。**
  - 根据项目需求选择并安装一个状态管理库（推荐 **Zustand** 或 **Redux Toolkit**）。
- **步骤 3.2：创建全局 Store。**
  - 在 `store` 目录下初始化 Store，并为需要全局共享的状态（如用户信息、主题等）创建 `slice`。
- **步骤 3.3：应用到试点功能。**
  - 将试点功能中需要全局共享的状态逻辑，迁移到 Store 中进行管理。

### 阶段四：全面推广和清理 (Full-scale Rollout & Cleanup)

将试点成功的经验推广到所有功能模块，并清理旧代码。

- **步骤 4.1：全面迁移。**
  - 按照阶段二的方法，将剩余的所有功能模块逐步迁移到 `features` 目录下。
- **步骤 4.2：沉淀共享逻辑。**
  - 在迁移过程中，将发现的可复用逻辑（非UI）沉淀到全局的 `hooks` 和 `lib` 目录中。
- **步骤 4.3：清理旧目录。**
  - 在所有功能都迁移完成后，安全地删除旧的 `pages`, `constants` 等不再使用的目录。
- **步骤 4.4：代码审查和文档更新。**
  - 对重构后的代码进行一次全面的审查，并更新项目文档，确保团队成员都能理解和遵循新的架构规范。

## 5. 关键支撑体系与风险控制

为了确保重构的顺利进行并提升最终产出的质量，以下支撑体系至关重要：

### 5.1. 测试策略

重构最大的风险是引入回归缺陷。必须建立严格的测试策略。

- **单元测试 (Unit Testing):** 使用 Vitest/Jest 为核心工具函数 (`lib`)、Hooks 和 UI 组件编写单元测试。
- **集成测试 (Integration Testing):** 确保在“试点功能迁移”阶段，新旧组件能够协同工作。
- **端到端测试 (E2E Testing):** (可选，推荐) 使用 Cypress 或 Playwright 对关键用户流程（如登录、购买）进行覆盖，确保核心功能在重构过程中始终可用。

### 5.2. 开发工具链与代码规范

统一的规范是团队协作和长期维护的基石。

- **代码格式化 (Formatting):** 强制使用 Prettier 进行代码自动格式化。
- **代码质量检查 (Linting):** 配置 ESLint，并集成推荐的规则集（如 `eslint-plugin-react`, `eslint-plugin-jsx-a11y`）。
- **提交卡点 (Pre-commit Hooks):** 使用 `husky` 和 `lint-staged` 在代码提交前自动运行格式化和 Lint 检查，从源头保证代码质量。

### 5.3. 统一错误处理与日志

- **前端错误边界 (Error Boundaries):** 在 React 组件树的顶层和关键功能模块层设置错误边界，防止因局部UI错误导致整个应用崩溃。
- **日志服务集成 (Logging Service):** 考虑集成 Sentry 等第三方服务，用于线上错误监控和性能分析。

### 5.4. 架构与组件文档

- **组件文档 (Component Documentation):** 强烈建议引入 **Storybook**。为 `components/ui` 中的每一个组件编写 story，这不仅是文档，也是一个隔离的开发和测试环境。
- **架构决策记录 (Architecture Decision Records - ADRs):** 对于重要的架构决策（如为何选择Zustand，为何采用此目录结构），创建简短的Markdown文档记录下来，便于未来追溯。