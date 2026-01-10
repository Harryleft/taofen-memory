# 开源准备检查清单

在将项目发布到GitHub等平台之前,请完成以下检查事项。

## ✅ 数据安全检查

### 1. 确认敏感数据已排除

- [ ] `.gitignore` 包含 `data/` 目录
- [ ] `.gitignore` 包含 `backend/.env` 文件
- [ ] `.gitignore` 包含 `frontend/.env.local` 文件
- [ ] 没有将真实图片数据提交到仓库
- [ ] 验证命令: `git ls-files | grep -E "^data/"` (应该为空)

### 2. 确认示例数据已添加

- [ ] `data-example/` 目录包含示例JSON文件
- [ ] 示例数据已脱敏处理
- [ ] 占位图片已生成
- [ ] 示例数据格式正确

### 3. 环境变量模板

- [ ] `backend/.env.example` 已创建
- [ ] `frontend/.env.example` 已创建
- [ ] 模板包含所有必要配置项
- [ ] 敏感信息已用占位符替换

## ✅ 文档完整性检查

### 1. README文档

- [ ] 项目概述清晰
- [ ] 功能特性列表完整
- [ ] 技术栈说明详细
- [ ] 快速开始指南可用
- [ ] 数据配置说明完整
- [ ] 贡献指南明确
- [ ] 许可证信息准确

### 2. 技术文档

- [ ] [数据配置指南](DATA_SETUP_GUIDE.md) 完整
- [ ] API文档清晰
- [ ] 部署文档准确
- [ ] 开发环境指南可用

### 3. 代码文档

- [ ] 复杂逻辑有注释
- [ ] API接口有说明
- [ ] 配置文件有注释

## ✅ 代码质量检查

### 1. 代码规范

- [ ] ESLint检查通过
- [ ] TypeScript类型检查通过
- [ ] 没有console.log调试代码
- [ ] 没有硬编码的敏感信息

### 2. 安全检查

- [ ] 没有硬编码的API密钥
- [ ] 没有硬编码的密码
- [ ] 依赖包没有已知安全漏洞
- [ ] 运行: `npm audit`

### 3. 功能测试

- [ ] 使用示例数据可以正常启动
- [ ] 所有主要功能可用
- [ ] 没有控制台错误
- [ ] 响应式布局正常

## ✅ 开源准备检查

### 1. 许可证

- [ ] 选择合适的开源许可证 (MIT/Apache 2.0/GPL等)
- [ ] LICENSE文件已添加
- [ ] 所有源文件头部包含许可证声明

### 2. 贡献指南

- [ ] CONTRIBUTING.md 文件存在
- [ ] 说明如何贡献代码
- [ ] 说明代码规范
- [ ] 说明Pull Request流程

### 3. Issue模板

- [ ] `.github/ISSUE_TEMPLATE/bug_report.md`
- [ ] `.github/ISSUE_TEMPLATE/feature_request.md`
- [ ] `.github/PULL_REQUEST_TEMPLATE.md`

### 4. 其他文件

- [ ] `.github/FUNDING.yml` (可选)
- [ ] `CODE_OF_CONDUCT.md` (可选)
- [ ] `SECURITY.md` (可选)

## ✅ 项目配置检查

### 1. package.json

- [ ] 项目名称准确
- [ ] 版本号正确
- [ ] 描述清晰
- [ ] 关键词完整
- [ ] 作者信息正确
- [ ] 仓库URL正确
- [ ] 主页URL正确
- [ ] bugs URL正确

### 2. Git配置

- [ ] .gitattributes 配置正确
- [ ] .gitignore 配置完整
- [ ] 提交信息规范明确

## ✅ CI/CD检查 (可选)

### 1. GitHub Actions

- [ ] CI配置文件存在 (.github/workflows/)
- [ ] 自动测试配置
- [ ] 自动部署配置 (如需要)

### 2. 代码质量工具

- [ ] Codecov配置 (代码覆盖率)
- [ ] Dependabot配置 (依赖更新)

## ✅ 最终检查

### 1. 数据安全验证

```bash
# 检查是否有敏感数据被提交
git grep -i "password" -- "*.js" "*.json" "*.ts" "*.tsx"
git grep -i "api_key" -- "*.js" "*.json" "*.ts" "*.tsx"
git grep -i "secret" -- "*.js" "*.json" "*.ts" "*.tsx"

# 检查data目录
git ls-files | grep "^data/"
```

### 2. 测试运行

```bash
# 安装依赖
npm install
cd frontend && npm install
cd ../backend && npm install

# 使用示例数据测试
# 设置环境变量 USE_SAMPLE_DATA=true
npm run dev
```

### 3. 文档链接检查

- [ ] README中的所有链接可访问
- [ ] 文档中的交叉引用正确
- [ ] 外部链接有效

## ✅ 发布前最后检查

### 1. 清理历史提交

```bash
# 检查是否有大文件
git rev-list --objects --all |
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' |
  awk '/^blob/ {print substr($0,6)}' |
  sort -n -k1 |
  tail -n 10
```

### 2. 创建发布标签

```bash
git tag -a v0.1.0 -m "首次公开发布"
git push origin v0.1.0
```

### 3. GitHub仓库设置

- [ ] 创建GitHub仓库
- [ ] 设置仓库描述
- [ ] 添加主题标签 (topics)
- [ ] 设置可见性 (Public)
- [ ] 启用Issues
- [ ] 启用Wiki (可选)
- [ ] 启用Discussions (可选)

## 📋 发布后的任务

- [ ] 在社交媒体上宣布
- [ ] 提交到相关目录
- [ ] 写博客介绍项目
- [ ] 收集反馈
- [ ] 持续维护更新

---

## 🚀 快速检查命令

```bash
# 一键检查脚本
echo "=== 数据安全检查 ==="
git ls-files | grep "^data/" && echo "❌ data目录被提交" || echo "✅ data目录已排除"

echo "\n=== 环境变量检查 ==="
git ls-files | grep "\.env$" && echo "❌ .env文件被提交" || echo "✅ .env文件已排除"

echo "\n=== 敏感信息检查 ==="
git grep -i "password\|api_key\|secret" -- "*.js" "*.json" "*.ts" "*.tsx" | head -5

echo "\n=== 代码检查 ==="
cd frontend && npm run lint && echo "✅ 代码检查通过" || echo "❌ 代码检查失败"
```

---

**准备完成后,你的项目就可以安全地开源了!** 🎉

如有疑问,请参考:
- [GitHub开源指南](https://opensource.guide/)
- [如何开源项目](https://docs.github.com/en/communities/setting-up-your-project-for-open-source)
