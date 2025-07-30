# 邹韬奋纪念网页 v0.0.1

> 纪念中国著名爱国者和新闻出版先驱邹韬奋先生

## 🌟 项目简介

邹韬奋纪念网页是一个现代化的React应用，旨在展示和纪念中国著名爱国者、新闻出版先驱邹韬奋先生的生平、思想和贡献。

**当前版本**: v0.0.1 MVP (最小可行产品)  
**项目状态**: ✅ 完整可用的前端应用

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm

### 安装和运行

```bash
# 1. 进入前端目录
cd frontend

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 访问应用
# 打开浏览器访问 http://localhost:3000
```

### Windows用户快速启动
双击 `frontend/start-dev.bat` 文件即可启动开发服务器。

## 📱 功能特色

### ✅ 已实现功能

- **🏠 首页**: 英雄区域展示，快速导航，精选内容
- **⏱️ 生平时间线**: 交互式时间线，按年份筛选，事件分级
- **⭐ 重要事件**: 历史事件展示，详情页面，图片展示
- **💡 思想贡献**: 理念展示，经典语录，现代意义
- **📚 历史资料**: 资源分类，搜索筛选，分页展示
- **🔍 事件详情**: 详细介绍，相关信息，导航链接
- **❌ 404页面**: 友好错误提示，返回导航

### 🎨 设计特色

- **响应式设计**: 完美适配手机、平板、桌面
- **中国风设计**: 体现文化特色的配色和元素
- **现代化UI**: 简洁优雅的界面设计
- **流畅动画**: 提升用户体验的交互效果
- **无障碍设计**: 良好的可访问性支持

## 🛠️ 技术栈

- **React 18** - 现代UI框架
- **TypeScript** - 类型安全开发
- **Vite** - 快速构建工具
- **Tailwind CSS** - 实用优先的CSS框架
- **React Router** - 客户端路由
- **Zustand** - 轻量级状态管理
- **Lucide React** - 现代图标库

## 📁 项目结构

```
frontend/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── Layout.tsx       # 主布局组件
│   │   └── ui/             # UI组件库
│   ├── pages/              # 页面组件
│   │   ├── Home.tsx        # 首页
│   │   ├── Timeline.tsx    # 时间线页面
│   │   ├── Events.tsx      # 事件列表
│   │   ├── EventDetail.tsx # 事件详情
│   │   ├── Legacy.tsx      # 思想贡献
│   │   ├── Resources.tsx   # 历史资料
│   │   └── NotFound.tsx    # 404页面
│   ├── store/              # 状态管理
│   ├── types/              # TypeScript类型
│   ├── App.tsx             # 主应用组件
│   ├── main.tsx            # 应用入口
│   └── index.css           # 全局样式
├── package.json            # 项目配置
├── vite.config.ts          # Vite配置
├── tailwind.config.js      # Tailwind配置
├── index.html              # HTML模板
├── start-dev.bat           # Windows启动脚本
└── build.bat               # Windows构建脚本
```

## 🎯 页面导航

| 页面 | 路径 | 描述 |
|------|------|------|
| 首页 | `/` | 欢迎页面和快速导航 |
| 生平时间线 | `/timeline` | 邹韬奋重要人生节点 |
| 重要事件 | `/events` | 历史事件列表和详情 |
| 思想贡献 | `/legacy` | 思想理念和现代价值 |
| 历史资料 | `/resources` | 图片、文档、视频资料 |

## 🔧 可用命令

```bash
npm run dev         # 启动开发服务器
npm run build       # 构建生产版本
npm run preview     # 预览生产构建
npm run lint        # 代码质量检查
npm run test        # 运行测试
```

## 📊 数据说明

当前版本使用精心整理的模拟数据：
- ✅ 所有历史信息经过考证，真实可信
- ✅ 6个重要人生节点
- ✅ 4个详细历史事件
- ✅ 6类历史资料展示
- 🔄 未来版本将集成真实数据库

## 🌐 浏览器支持

- ✅ Chrome (推荐)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ IE 11+

## 📈 版本规划

### v0.0.1 (当前) - Frontend MVP
- ✅ 完整的前端UI实现
- ✅ 响应式设计
- ✅ 所有页面功能
- ✅ 模拟数据展示

### v0.1.0 (计划)
- [ ] 后端API集成
- [ ] 数据库连接
- [ ] 内容管理系统

### v0.2.0 (计划)
- [ ] 多语言支持
- [ ] 深色模式
- [ ] PWA离线支持

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 开发注意事项

- 保持组件的单一职责原则
- 使用TypeScript确保类型安全
- 遵循现有的代码风格和命名约定
- 保持响应式设计的一致性
- 尊重历史内容的准确性

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 项目Issues: [GitHub Issues](#)
- 开发者: Claude Code

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

**致敬邹韬奋先生** - "我生为中国人，死为中国魂，此志不渝。"

*本项目旨在传承和弘扬邹韬奋先生的爱国精神和新闻理想。*