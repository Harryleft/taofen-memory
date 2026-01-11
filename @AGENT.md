# 构建和运行说明

## 项目结构

```
taofen_web/
├── frontend/          # React前端应用
├── backend/           # Node.js后端服务
├── cache-service/     # Redis缓存服务
├── data/             # 数据文件
├── docs/             # 项目文档
├── diss/             # 讨论文档
└── scripts/          # 工具脚本
```

## 开发环境启动

### 前端开发
```bash
cd frontend
npm run dev          # 热更新开发服务器（端口5173）
npm run build        # 构建生产版本
npm run lint         # 代码检查
npm run test         # 运行测试
npm run test:coverage  # 测试覆盖率报告
```

### 后端开发
```bash
cd backend
npm run dev          # 开发服务器
npm start            # 生产服务器
npm test             # 运行测试
```

### 缓存服务
```bash
cd cache-service
npm run dev          # 开发服务器
npm start            # 生产服务器
npm run health       # 健康检查
```

## 测试命令

```bash
# 前端测试
cd frontend
npm run test -- --watchAll=false    # 运行所有测试一次
npm run test:coverage               # 生成覆盖率报告
npm run test:e2e                    # E2E测试
npm run test:performance            # 性能测试

# 后端测试
cd backend
npm test                             # 运行所有测试
```

## 验证命令

```bash
# 前端
cd frontend
npm run lint                         # 检查代码质量
npm run build                        # 验证构建成功

# 整体验证
docker-compose -f docker-compose.dev.yml up -d  # 启动开发环境
```

## 部署

```bash
# 生产环境
docker-compose up -d                 # 启动所有服务
docker-compose logs -f               # 查看日志
```

## 端口说明

- 前端开发服务器：http://localhost:5173
- 后端API：http://localhost:3001
- 缓存服务：http://localhost:3002
- IIIF服务：https://www.ai4dh.cn
