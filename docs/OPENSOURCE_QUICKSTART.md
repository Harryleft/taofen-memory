# 开源快速指南

## ✅ 已完成的配置

### 1. 数据安全
- ✅ `.gitignore` 配置正确,真实数据(`data/`)不会被提交
- ✅ 环境变量文件(`.env`, `.env.local`)不会被提交
- ✅ 示例数据目录(`data-example/`)已添加到版本控制

### 2. 示例数据
- ✅ 7个JSON数据文件(书籍、人物、时间轴等)
- ✅ 43张SVG占位图片
- ✅ 完整的数据格式示例

### 3. 文档
- ✅ README更新(新增数据配置章节)
- ✅ 数据配置指南(`docs/DATA_SETUP_GUIDE.md`)
- ✅ 开源检查清单(`docs/OPENSOURCE_CHECKLIST.md`)

### 4. 开发工具
- ✅ 占位图片生成脚本(`scripts/generate-placeholder-images.js`)
- ✅ 环境变量模板(`backend/.env.example`, `frontend/.env.example`)

## 🚀 下一步:开源发布

### 方案一:直接公开仓库(推荐新手)

**优点**:
- ✅ 开发者克隆后即可使用示例数据运行项目
- ✅ 无需准备真实数据即可体验完整功能
- ✅ 适合技术展示和代码学习

**步骤**:
1. 在GitHub创建公开仓库
2. 推送代码: `git push origin master`
3. 在README添加项目介绍和使用说明
4. 完成开源检查清单中的事项

### 方案二:私有仓库 + 申请访问(适合保护数据)

**优点**:
- ✅ 真实数据不公开
- ✅ 可以控制访问权限
- ✅ 适合团队协作开发

**步骤**:
1. 在GitHub创建私有仓库
2. 推送代码
3. 设置仓库为可搜索(可选)
4. 有兴趣的开发者可以申请访问权限

### 方案三:分离敏感数据(推荐生产)

**优点**:
- ✅ 代码公开,数据私有
- ✅ 使用环境变量配置数据源
- ✅ 最灵活的方案

**步骤**:
1. 创建公开仓库存放代码
2. 创建私有仓库存放真实数据
3. 使用环境变量或配置文件指向数据源
4. 提供数据获取说明

## 📝 开发者使用说明

### 使用示例数据运行

```bash
# 1. 克隆项目
git clone https://github.com/your-org/taofen_web.git
cd taofen_web

# 2. 安装依赖
cd frontend && npm install
cd ../backend && npm install

# 3. 配置环境变量
cd backend && cp .env.example .env
# 编辑.env: USE_SAMPLE_DATA=true

cd ../frontend && cp .env.example .env.local
# 编辑.env.local: VITE_USE_SAMPLE_DATA=true

# 4. 启动服务
cd backend && npm run dev  # 终端1
cd frontend && npm run dev # 终端2

# 5. 访问应用
# 打开浏览器: http://localhost:5173
```

### 使用真实数据运行

参考: [docs/DATA_SETUP_GUIDE.md](DATA_SETUP_GUIDE.md)

## 🔒 数据安全验证

### 快速检查命令

```bash
# 验证data目录未被提交
git ls-files | grep "^data/"
# 应该输出为空

# 验证环境变量未被提交
git ls-files | grep "\.env$"
# 应该输出为空

# 验证示例数据已包含
git ls-files | grep "data-example/"
# 应该显示示例数据文件列表
```

## 📋 开源前检查清单

在发布前,请确保:

- [ ] 阅读并完成 [docs/OPENSOURCE_CHECKLIST.md](OPENSOURCE_CHECKLIST.md)
- [ ] README文档完整清晰
- [ ] 所有链接可访问
- [ ] 使用示例数据可以正常运行
- [ ] 选择合适的开源许可证
- [ ] 删除敏感信息和密钥
- [ ] 检查依赖包安全性: `npm audit`

## 🎯 推荐的开源策略

### 对于韬奋项目,我推荐**方案一:直接公开仓库**

**理由**:
1. ✅ **文化传承价值大于数据保密**
   - 邹韬奋是历史人物,相关资料具有社会教育价值
   - 公开可以促进学术研究和文化传播

2. ✅ **技术展示重点**
   - 项目亮点是技术实现(AI、IIIF、React等)
   - 示例数据足以展示功能特性

3. ✅ **降低参与门槛**
   - 开发者克隆即可运行,无需额外配置
   - 利于社区贡献和推广

4. ✅ **真实数据可后续补充**
   - 如有合作机构,可提供真实数据访问
   - 或通过API接口访问受保护的数据源

### 数据脱敏建议

如果仍担心真实数据,可以:

1. **部分脱敏**
   - 图片:使用占位图或低分辨率版本
   - 文字:保留公开出版物的内容
   - 手迹:使用示例或简化版本

2. **数据分级**
   - 公开数据:已公开的历史文献
   - 受限数据:需要授权的高清图片
   - 敏感数据:个人隐私信息

3. **提供数据获取方式**
   - 说明如何申请真实数据访问
   - 提供数据合作联系方式

## 💡 后续优化建议

1. **添加更多示例**
   - 不同类型的人物关系
   - 更多时间轴事件
   - 丰富的书籍样本

2. **改善占位图**
   - 使用更美观的设计
   - 添加项目Logo
   - 包含功能说明

3. **完善文档**
   - 视频教程
   - API文档
   - 架构设计文档

4. **社区建设**
   - 贡献指南
   - Issue模板
   - PR模板

---

**准备就绪?现在就可以开源了!** 🎉

需要帮助?参考:
- [GitHub开源指南](https://opensource.guide/)
- [如何选择许可证](https://choosealicense.com/)
