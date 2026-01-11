# Ralph 使用现有项目指南

## Ralph项目必需文件

Ralph需要以下文件才能运行：

```
your-project/
├── PROMPT.md           # 必须：项目需求和开发指令
├── @fix_plan.md        # 可选：任务优先级列表
├── @AGENT.md           # 可选：构建和运行说明
├── specs/              # 可选：详细规格文档
│   └── stdlib/
├── logs/               # 自动创建：执行日志
├── docs/generated/     # 自动创建：生成的文档
└── status.json         # 自动创建：运行状态
```

---

## 方案一：手动配置（推荐用于复杂项目）

### 步骤1：进入项目目录

```bash
cd /path/to/your/existing/project

# 例如你的taofen_web项目
cd S:/vibe_coding/taofen_web
```

### 步骤2：创建Ralph必需文件

```bash
# 创建目录结构
mkdir -p specs/stdlib logs docs/generated

# 创建PROMPT.md（最重要！）
touch PROMPT.md

# 创建任务计划文件（可选）
touch @fix_plan.md
touch @AGENT.md
```

### 步骤3：编写PROMPT.md

`PROMPT.md`是Ralph的核心文件，告诉它要做什么。以下是针对你现有项目的模板：

```markdown
# 项目开发指令

## 项目概述
[在这里简要描述你的项目]

## 当前状态
[描述项目当前的状态，例如：
- 已完成的功能
- 现存的问题
- 需要改进的地方]

## 开发目标

### 短期目标（优先）
1. [具体的可执行任务]
2. [具体的可执行任务]
3. [具体的可执行任务]

### 长期目标
1. [长期规划]
2. [长期规划]

## 技术栈
- 前端：[技术栈]
- 后端：[技术栈]
- 数据库：[技术栈]
- 其他工具：[工具列表]

## 开发规范

### 代码风格
- [你的代码风格要求]
- [命名规范]
- [注释要求]

### Git规范
- 提交信息格式
- 分支策略
- 代码审查要求

### 测试要求
- 单元测试覆盖率
- 集成测试要求
- E2E测试场景

## 具体任务

### 当前需要解决的问题
1. **问题1**
   - 描述：[详细描述]
   - 期望结果：[具体说明]
   - 优先级：高/中/低

2. **问题2**
   - 描述：[详细描述]
   - 期望结果：[具体说明]
   - 优先级：高/中/低

### 待实现的功能
1. **功能A**
   - 需求描述：[详细说明]
   - 技术方案：[实现思路]
   - 验收标准：[如何判断完成]

2. **功能B**
   - 需求描述：[详细说明]
   - 技术方案：[实现思路]
   - 验收标准：[如何判断完成]

## 重要约束

### 必须遵守
- [ ] [约束1，例如：不破坏现有API]
- [ ] [约束2，例如：保持向后兼容]
- [ ] [约束3，例如：性能要求]

### 不要做
- [ ] [不要重构X模块]
- [ ] [不要修改Y配置]
- [ ] [不要使用Z技术]

## 项目特定说明

### 关键文件说明
- `关键文件1`: [用途说明]
- `关键文件2`: [用途说明]

### 开发命令
```bash
# 启动开发服务器
npm run dev

# 运行测试
npm test

# 构建项目
npm run build
```

### 已知问题
- [已知问题1及其临时解决方案]
- [已知问题2及其临时解决方案]

## 停止条件

Ralph应该在以下情况停止：
1. [ ] 所有短期目标完成
2. [ ] 测试通过率达到X%
3. [ ] 没有明显的bug或错误
4. [ ] 代码符合所有规范要求

## 其他说明
[任何其他重要信息]
```

### 步骤4：（可选）创建@fix_plan.md

```markdown
# 任务优先级列表

## 🔥 高优先级（立即处理）

- [ ] 修复登录功能的bug
- [ ] 优化首页加载速度
- [ ] 添加单元测试覆盖核心功能

## ⚡ 中优先级（本周完成）

- [ ] 重构用户认证模块
- [ ] 更新API文档
- [ ] 添加错误处理中间件

## 📅 低优先级（后续优化）

- [ ] 升级依赖包版本
- [ ] 优化数据库查询
- [ ] 改进错误消息提示

## ✅ 已完成

- [ ] 初始化项目结构
- [ ] 配置开发环境
```

### 步骤5：（可选）创建@AGENT.md

```markdown
# 构建和运行说明

## 开发环境启动

```bash
# 安装依赖
npm install

# 启动前端开发服务器
cd frontend && npm run dev

# 启动后端服务
cd backend && npm run dev

# 启动缓存服务
cd cache-service && npm run dev
```

## 测试

```bash
# 运行所有测试
npm test

# 运行前端测试
cd frontend && npm test

# 运行后端测试
cd backend && npm test
```

## 构建

```bash
# 构建生产版本
npm run build

# 构建前端
cd frontend && npm run build

# 构建后端
cd backend && npm run build
```

## 部署

```bash
# Docker部署
docker-compose up -d

# 查看日志
docker-compose logs -f
```
```

### 步骤6：运行Ralph

```bash
# 在项目根目录运行
ralph --monitor

# 或者不带监控（Git Bash方案）
ralph
```

---

## 方案二：使用ralph-setup（快速但不够灵活）

```bash
# 在现有项目旁边创建临时Ralph项目
ralph-setup temp-ralph
cd temp-ralph

# 复制模板文件到现有项目
cp PROMPT.md /path/to/existing/project/
cp @fix_plan.md /path/to/existing/project/
cp @AGENT.md /path/to/existing/project/
cp -r specs/ /path/to/existing/project/

# 进入现有项目
cd /path/to/existing/project

# 编辑PROMPT.md以适应你的项目
nano PROMPT.md

# 运行Ralph
ralph --monitor
```

---

## 方案三：使用ralph-import（如果有PRD）

如果你有项目需求文档（PRD）：

```bash
# 将PRD转换为Ralph项目
ralph-import your-prd.md project-name

# 这会自动生成：
# - PROMPT.md
# - @fix_plan.md
# - specs/requirements.md
# - 标准目录结构
```

---

## 实战示例：为taofen_web配置Ralph

```bash
# 1. 进入项目目录
cd S:/vibe_coding/taofen_web

# 2. 创建Ralph结构
mkdir -p specs/stdlib logs docs/generated
touch PROMPT.md @fix_plan.md @AGENT.md

# 3. 编辑PROMPT.md
code PROMPT.md
# 或
nano PROMPT.md

# 4. 编写PROMPT.md内容（参考上面的模板）

# 5. 运行Ralph
ralph --monitor
```

### 针对taofen_web的PROMPT.md示例

```markdown
# 邹韬奋数字叙事平台开发指令

## 项目概述
这是一个关于邹韬奋的沉浸式数字叙事平台，包含前端React应用、Node.js后端服务、缓存服务和IIIF图像服务。

## 当前状态
✅ 已完成模块：
- 首页瀑布流（HeroIntro）- 视差滚动效果
- 时间轴（Timeline）- 人生大事记展示
- 生活书店（Bookstore）- 书籍堆叠时间线
- 韬奋手迹（Handwriting）- IIIF图像查看
- 报刊文章（Newspapers）- 文章归档和搜索
- 人际关系（Relationships）- 社交网络可视化

🔧 当前技术栈：
- 前端：React 18 + TypeScript + Vite + TailwindCSS
- 后端：Node.js + Express + Redis
- 图像服务：IIIF (Cantaloupe)
- AI服务：GLM-4.5模型集成

## 开发目标

### 短期目标（本周）
1. 优化现有功能的性能和用户体验
2. 修复已知的bug和问题
3. 完善错误处理和边界情况
4. 提高测试覆盖率到80%+

### 中期目标（本月）
1. 添加用户个性化功能（收藏、笔记、分享）
2. 优化移动端响应式体验
3. 增强AI解读功能的准确性
4. 完善文档和注释

## 开发规范

### 代码规范
- 使用简体中文进行开发和沟通
- 遵循现有代码风格
- 清晰意图优于巧妙代码
- 增量进步优于大爆炸式改动

### Git规范
- 每次修改后都要提交
- 提交信息简明清晰
- 提交格式：`[类型] 简短描述`

### 质量门槛
- 测试已编写并通过
- 代码检查无警告
- 类型检查无错误

## 当前需要解决的任务

### 高优先级
1. **性能优化**
   - 优化图片加载策略
   - 实现更智能的缓存机制
   - 减少初始加载时间

2. **Bug修复**
   - 修复[具体bug描述]
   - 解决[具体问题]

3. **测试覆盖**
   - 为核心组件添加单元测试
   - 添加E2E测试场景
   - 测试覆盖率达到80%

### 中优先级
1. **功能增强**
   - 改进AI解读的准确性
   - 添加更多交互细节
   - 优化移动端体验

2. **代码质量**
   - 重构复杂组件
   - 改善错误处理
   - 完善类型定义

## 重要约束

### 必须遵守
- ✅ 保持现有功能不被破坏
- ✅ 遵循项目的CLAUDE.md规范
- ✅ 使用中文进行沟通和注释
- ✅ 每次修改后都要git提交

### 不要做
- ❌ 不要大规模重构未经批准
- ❌ 不要更改现有API接口
- ❌ 不要破坏热更新机制
- ❌ 不要添加不必要的依赖

## 开发命令

```bash
# 前端开发
cd frontend
npm run dev          # 热更新开发服务器（端口5173）
npm run build        # 构建生产版本
npm run lint         # 代码检查
npm run typecheck    # 类型检查
npm run test         # 运行测试

# 后端开发
cd backend
npm run dev          # 开发服务器
npm start            # 生产服务器
npm test             # 运行测试

# 缓存服务
cd cache-service
npm run dev          # 开发服务器
npm start            # 生产服务器
npm run health       # 健康检查
```

## 停止条件

Ralph应该在以下情况停止：
1. ✅ 所有高优先级任务完成
2. ✅ 测试覆盖率达到80%+
3. ✅ 没有未修复的bug
4. ✅ 代码检查和类型检查全部通过
5. ✅ 性能指标达到预期

## 监控和调试

- 前端开发服务器：http://localhost:5173
- 后端API：http://localhost:3001
- 缓存服务：http://localhost:3002
- 日志目录：`logs/ralph.log`
- 状态文件：`status.json`

## 其他说明

- 项目使用热更新机制，不需要每次重启开发服务器
- 检测5173端口，如果已使用则直接使用现有服务
- 所有开发和沟通使用简体中文
- 详细开发规范见项目根目录的CLAUDE.md
```

---

## Ralph运行流程

一旦你配置好PROMPT.md并运行`ralph --monitor`，Ralph会：

1. 📋 读取PROMPT.md中的指令
2. 🤖 调用Claude Code执行开发任务
3. 📊 跟踪进度并更新日志
4. 🔄 持续迭代直到满足停止条件
5. 🛡️ 自动处理速率限制和错误

---

## 常见问题

### Q: Ralph会破坏我的现有代码吗？
A: Ralph使用Claude Code，它会先分析代码再修改。建议：
- 先在分支上测试
- 使用Git跟踪所有更改
- 查看logs/中的执行日志

### Q: 如何让Ralph专注于特定任务？
A: 在PROMPT.md中明确指定：
```markdown
## 当前重点任务
只关注以下任务，不要做其他事情：
1. 修复X bug
2. 添加Y功能
```

### Q: Ralph停止太早怎么办？
A: 检查@fix_plan.md，确保任务清晰明确：
```markdown
- [ ] 这个任务还没完成，具体需要...
```

### Q: 如何查看Ralph在做什么？
A:
```bash
# 实时日志
tail -f logs/ralph.log

# 当前状态
cat status.json | jq

# 或使用ralph-monitor
ralph-monitor
```

### Q: Ralph修改了不该修改的文件怎么办？
A:
```bash
# 查看Git差异
git diff

# 撤销更改
git checkout -- 文件路径

# 或回退到上一个提交
git reset --hard HEAD
```

---

## 下一步

1. 在你的现有项目中创建`PROMPT.md`
2. 详细描述你想要Ralph做什么
3. 运行`ralph --monitor`
4. 观察并监控进度
5. 必要时调整PROMPT.md中的指令

祝开发顺利！🚀
