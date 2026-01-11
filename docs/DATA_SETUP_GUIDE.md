# 数据配置指南

本文档说明如何为项目配置真实数据,以便在开源后保护敏感数据的同时,让其他开发者能够使用示例数据运行项目。

## 📋 目录

- [数据安全策略](#数据安全策略)
- [快速开始](#快速开始)
- [使用示例数据](#使用示例数据)
- [配置真实数据](#配置真实数据)
- [数据格式说明](#数据格式说明)
- [常见问题](#常见问题)

---

## 数据安全策略

### 敏感数据保护

项目采用以下策略保护敏感数据:

1. **Git忽略**: 所有真实数据目录(`data/`)已添加到`.gitignore`
2. **示例数据**: 提供`data-example/`目录包含脱敏的示例数据
3. **环境变量**: 使用`.env.example`模板,不提交真实配置
4. **占位图片**: 使用SVG占位图替代真实图片

### 数据目录结构

```
taofen_web/
├── data/                    # 真实数据 (不提交到Git)
│   ├── json/               # JSON数据文件
│   └── api_results/        # API结果和图片
│
├── data-example/           # 示例数据 (提交到Git)
│   ├── json/              # 示例JSON数据
│   └── images/            # 占位图片
│
└── backend/
    ├── .env.example       # 环境变量模板
    └── .env               # 真实环境变量 (不提交)
```

---

## 快速开始

### 使用示例数据 (推荐新手)

1. **克隆项目**
   ```bash
   git clone https://github.com/your-org/taofen_web.git
   cd taofen_web
   ```

2. **安装依赖**
   ```bash
   # 前端
   cd frontend
   npm install

   # 后端
   cd ../backend
   npm install
   ```

3. **配置环境变量**
   ```bash
   # 后端
   cd backend
   cp .env.example .env
   # 编辑 .env 文件,设置 USE_SAMPLE_DATA=true

   # 前端
   cd ../frontend
   cp .env.example .env.local
   # 编辑 .env.local 文件,设置 VITE_USE_SAMPLE_DATA=true
   ```

4. **启动服务**
   ```bash
   # 后端
   cd backend
   npm run dev

   # 前端 (新终端)
   cd frontend
   npm run dev
   ```

5. **访问应用**
   打开浏览器访问: http://localhost:5173

### 使用真实数据 (生产环境)

参考下面的 [配置真实数据](#配置真实数据) 章节。

---

## 使用示例数据

### 示例数据说明

项目包含以下示例数据文件:

| 文件 | 说明 | 数量 |
|------|------|------|
| `books.json` | 书籍信息 | 3条示例 |
| `hero_images.json` | 首页图片 | 6张占位图 |
| `timeline.json` | 时间轴事件 | 3个时期 |
| `persons.json` | 人物信息 | 3个示例人物 |
| `relationships.json` | 人际关系网络 | 示例网络 |
| `newspapers_info.json` | 报刊文章 | 3篇示例 |
| `taofen_handwriting_details.json` | 手迹详情 | 3个示例 |

### 占位图片

示例数据使用SVG占位图片,特点:

- ✅ 文件小,加载快
- ✅ 可自定义文字和尺寸
- ✅ 适合开发和演示
- ⚠️ 不适合生产环境

### 生成更多占位图片

```bash
# 生成占位图片
node scripts/generate-placeholder-images.js
```

---

## 配置真实数据

### 步骤1: 准备数据目录

```bash
# 在项目根目录创建data目录
mkdir -p data/json
mkdir -p data/images/books
mkdir -p data/images/manuscripts
mkdir -p data/images/timeline_images
```

### 步骤2: 配置环境变量

**后端配置** (`backend/.env`):

```bash
# 关闭示例数据模式
USE_SAMPLE_DATA=false

# 设置真实数据路径
DATA_PATH=/path/to/your/data

# 配置IIIF服务
IIIF_BASE_URL=https://your-iiif-server.com/iiif/2
IIIF_AUTH_USERNAME=your_username
IIIF_AUTH_PASSWORD=your_password

# 配置Redis
REDIS_URL=redis://:your_password@localhost:6379

# 配置AI服务
AI_API_KEY=your_ai_api_key
```

**前端配置** (`frontend/.env.local`):

```bash
# 关闭示例数据模式
VITE_USE_SAMPLE_DATA=false

# 配置API地址
VITE_API_BASE_URL=http://localhost:3001
```

### 步骤3: 准备JSON数据文件

#### books.json 格式

```json
[
  {
    "id": 1,
    "year": 1926,
    "bookname": "书名",
    "writer": "作者",
    "publisher": "出版社",
    "image": "/images/books/cover.jpg"
  }
]
```

#### hero_images.json 格式

```json
[
  {
    "id": 1,
    "filename": "image.jpg",
    "title": "图片标题",
    "year": "1925"
  }
]
```

#### timeline.json 格式

```json
[
  {
    "core_event": "时期名称",
    "timeline": [
      {
        "time": "1895年",
        "experience": "事件描述",
        "image": "/images/timeline/event.jpg",
        "location": "地点"
      }
    ]
  }
]
```

### 步骤4: 处理图片资源

#### 选项1: 本地图片

将图片放到 `data/images/` 对应目录:

```
data/images/
├── books/              # 书籍封面
├── manuscripts/        # 手迹文献
├── timeline_images/    # 时间轴图片
└── newspapers/         # 报刊图片
```

#### 选项2: IIIF服务

配置IIIF服务器,在JSON中使用IIIF URL:

```json
{
  "image": "https://iiif-server.com/iiif/2/book_id/full/500,/0/default.jpg"
}
```

#### 选项3: CDN

将图片上传到CDN,在JSON中使用CDN URL:

```json
{
  "image": "https://cdn.example.com/images/book.jpg"
}
```

---

## 数据格式说明

### JSON数据规范

#### 通用字段

- `id`: 唯一标识符 (数字或字符串)
- `image`: 图片路径 (相对路径或完整URL)
- `year/year`: 年份信息
- `description/description`: 描述信息

#### 特殊字段

**时间轴数据**:
- `core_event`: 核心时期名称
- `time`: 事件时间
- `location`: 事件地点
- `timespot`: 是否为关键事件 (可选,0/1)

**关系网络数据**:
- `nodes`: 节点数组 (人物)
- `links`: 关系数组 (连接)
- `source/target`: 关系连接的节点ID
- `relationship`: 关系类型

**手迹数据**:
- `ai_interpretation`: AI解读结果
- `content`: OCR识别内容

### 图片规范

#### 推荐格式

- **封面图**: JPEG, 400x600px
- **手迹图**: JPEG/PNG, 600x800px
- **时间轴**: JPEG, 800x600px
- **报刊图**: JPEG, 800x1000px

#### 优化建议

1. **压缩图片**: 使用TinyPNG等工具压缩
2. **使用WebP**: 现代浏览器支持更好
3. **提供多尺寸**: 适应不同设备
4. **使用CDN**: 加速加载

---

## 常见问题

### Q1: 如何确认是否使用示例数据?

**A**: 检查环境变量:

```bash
# 后端
grep USE_SAMPLE_DATA backend/.env

# 前端
grep VITE_USE_SAMPLE_DATA frontend/.env.local
```

### Q2: 示例数据不够用怎么办?

**A**: 有两种方案:

1. **复制示例数据**: 复制`data-example/`到`data/`,然后修改内容
2. **生成占位图**: 运行`node scripts/generate-placeholder-images.js`

### Q3: 如何保护真实数据不被提交?

**A**: 确保`.gitignore`包含:

```gitignore
# 敏感数据
data/
backend/.env
frontend/.env.local

# 保留示例
!data-example/
```

验证命令:
```bash
git check-ignore data/
# 应该输出: data/
```

### Q4: 生产环境如何配置?

**A**:

1. 设置 `USE_SAMPLE_DATA=false`
2. 配置真实的IIIF服务器或CDN
3. 使用环境变量管理敏感配置
4. 启用Redis缓存
5. 配置HTTPS

### Q5: 图片加载失败怎么办?

**A**: 检查:

1. 图片路径是否正确
2. 文件是否存在
3. 权限是否正确
4. URL是否可访问

调试命令:
```bash
# 检查文件
ls -la data/images/books/

# 测试URL
curl -I https://your-image-url.com/image.jpg
```

### Q6: 如何贡献数据改进?

**A**:

1. 不要直接修改真实数据
2. 在`data-example/`中添加示例
3. 更新本文档说明新格式
4. 提交Pull Request

---

## 附录

### 相关文档

- [本地开发环境指南](本地开发环境指南.md)
- [阿里云ECS部署完整教程](阿里云ECS部署完整教程.md)
- [AI环境配置指南](AI_ENV_SETUP.md)

### 工具脚本

- [生成占位图片](../scripts/generate-placeholder-images.js)
- [数据验证脚本](../scripts/validate-data.js) (待实现)

### 支持与反馈

如有问题,请:
- 提交 [Issue](https://github.com/your-org/taofen_web/issues)
- 查看 [Discussions](https://github.com/your-org/taofen_web/discussions)
- 联系维护者

---

**最后更新**: 2026-01-10
**维护者**: Taofen Web Team
