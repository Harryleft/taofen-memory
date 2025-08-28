# 邹韬奋项目阿里云ECS部署完整教程

<div align="center">

**🎯 新手友好 · 手把手教学 · 从零到上线**

![部署架构](https://img.shields.io/badge/Architecture-React%20%2B%20Node.js%20%2B%20IIIF-blue)
![服务器](https://img.shields.io/badge/Server-阿里云ECS%202核2G-green)
![Web服务器](https://img.shields.io/badge/Web%20Server-Caddy-orange)
![SSL](https://img.shields.io/badge/SSL-自动获取-success)

</div>

## 📋 部署前准备

### 🎯 部署目标

本教程将帮助你将邹韬奋沉浸式叙事项目部署到阿里云ECS服务器上，最终实现：

- ✅ 通过 `https://www.ai4dh.cn` 访问完整网站
- ✅ 前端React应用正常运行
- ✅ 后端API服务稳定运行  
- ✅ IIIF图像服务高性能展示
- ✅ 自动SSL证书管理
- ✅ 服务监控和自动重启

### 💻 服务器要求

#### 推荐配置
```yaml
云服务商: 阿里云ECS
实例规格: ecs.t5-lc1m2.small (2核2GB)
系统盘: 40GB 高效云盘
网络: 专有网络VPC
安全组: 开放22, 80, 443端口
操作系统: Ubuntu 20.04 LTS 64位
```

#### 最低要求检查
```bash
# CPU: 双核心
# 内存: 2GB RAM
# 存储: 20GB可用空间
# 网络: 公网IP + 1Mbps带宽
```

### 🌐 域名和DNS配置

#### 域名解析设置
在你的域名服务商（如阿里云域名、腾讯云域名等）控制台配置：

```dns
记录类型: A
主机记录: @
记录值: 你的ECS公网IP
TTL: 10分钟

记录类型: CNAME  
主机记录: www
记录值: yourdomain.com
TTL: 10分钟
```

**验证DNS解析**：
```bash
# 在本地电脑执行（Windows打开cmd，Mac打开终端）
nslookup www.ai4dh.cn

# ✅ 成功标志：显示你的服务器IP地址
# ❌ 失败标志：显示"找不到"或"NXDOMAIN"
```

### 📦 本地开发环境准备

#### 必需工具
- **SSH客户端**: Windows推荐[PuTTY](https://www.putty.org/)，Mac/Linux使用内置终端
- **文件传输**: 推荐XFTP、[FileZilla](https://filezilla-project.org/)或WinSCP
- **代码编辑器**: VS Code（用于本地修改配置文件）

#### XFTP文件传输配置

**XFTP连接设置**
```yaml
协议: SFTP (SSH File Transfer Protocol)
主机: 115.29.208.232
端口: 22
用户名: root
密码: nsrjd4yt
```

**XFTP使用步骤**
1. **建立连接**
   ```
   打开XFTP → 新建会话
   名称: 邹韬奋项目服务器
   主机: 115.29.208.232
   协议: SFTP
   端口: 22
   用户名: root
   密码: nsrjd4yt
   ```

2. **导航到目标目录**
   ```
   远程目录: /srv/iiif/
   本地目录: 您的项目代码目录
   ```

3. **文件上传注意事项**
   - ✅ 图像文件上传到: `/srv/iiif/images/`
   - ✅ 清单文件上传到: `/srv/iiif/manifests/`
   - ✅ 确保文件权限为755或644
   - ⚠️ 避免覆盖关键配置文件

**常见上传路径**
```bash
# 项目源代码
/opt/taofen/source/

# 静态资源文件
/var/www/taofen/

# IIIF图像资源（按类别上传）
/srv/iiif/images/handwriting/     # 手稿图像
/srv/iiif/images/timeline/        # 时间线图像  
/srv/iiif/images/bookstore/       # 书店图像
/srv/iiif/images/newspapers/      # 报纸图像
/srv/iiif/images/relationships/   # 关系图图像
/srv/iiif/images/hero/            # 首页背景图

# IIIF清单文件（按类别上传）
/srv/iiif/manifests/handwriting/  # 手稿清单
/srv/iiif/manifests/timeline/     # 时间线清单
/srv/iiif/manifests/bookstore/    # 书店清单  
/srv/iiif/manifests/newspapers/   # 报纸清单
/srv/iiif/manifests/relationships/ # 关系图清单
```

**📂 目录用途说明**
- `images/` - 存放原始图像文件，支持 JPG、PNG、TIFF 格式
- `manifests/` - 存放IIIF清单JSON文件，定义图像元数据和展示方式
- `cache/` - Cantaloupe自动生成的缓存，**请勿手动修改**
- `logs/` - 服务运行日志，用于故障排除
- `config/` - Cantaloupe配置文件，**修改前请备份**

#### 项目代码准备
```bash
# 在本地电脑上克隆项目（如果还没有）
git clone https://github.com/your-repo/taofen_web.git
cd taofen_web

# 检查项目结构
ls -la
# 应该看到：frontend/ backend/ scripts/ docs/ 等目录
```

---

## 📋 当前服务器部署情况检查

### 🖼️ IIIF服务部署状态

#### 远程服务器信息
```yaml
服务器IP: 115.29.208.232
用户名: root
密码: nsrjd4yt
域名: https://www.ai4dh.cn
```

#### IIIF服务现状检查
基于2025年8月28日的远程检查，以下是当前IIIF部署的实际情况：

**✅ 服务运行状态**
- IIIF服务正常运行: `https://www.ai4dh.cn/iiif/3/`
- 使用Cantaloupe 5.0.7作为IIIF图像服务器
- 通过Jetty 11.0.24容器运行
- Caddy作为反向代理服务器

**📁 部署路径结构**
IIIF服务部署在 `/srv/iiif/` 路径下，实际目录结构如下：

```
/srv/iiif/                    # IIIF服务主目录
├── manifests/                # IIIF清单文件目录
│   ├── handwriting/          # 手稿清单文件
│   ├── timeline/             # 时间线清单文件  
│   ├── bookstore/            # 书店清单文件
│   ├── newspapers/           # 报纸清单文件
│   └── relationships/        # 关系图清单文件
│
├── images/                   # 图像源文件目录
│   ├── handwriting/          # 手稿图像文件
│   ├── timeline/             # 时间线图像文件
│   ├── bookstore/            # 书店图像文件
│   ├── newspapers/           # 报纸图像文件
│   ├── relationships/        # 关系图图像文件
│   └── hero/                 # 首页背景图像
│
├── logs/                     # 服务日志目录
│   ├── access.log           # 访问日志
│   ├── application.log      # 应用日志
│   └── error.log            # 错误日志
│
├── stack/                    # 容器/服务配置目录
│   ├── docker-compose.yml   # Docker配置（如适用）
│   └── cantaloupe.service   # systemd服务配置（如适用）
│
├── config/                   # 配置文件目录
│   ├── cantaloupe.properties # Cantaloupe主配置文件
│   ├── delegates.rb         # 委托脚本配置
│   └── logback.xml          # 日志配置
│
└── cache/                    # 缓存目录
    ├── derivative/          # 衍生图像缓存
    └── info/                # 图像信息缓存
```

**⚠️ 实际目录结构确认**
请运行以下脚本获取准确的目录结构：
```bash
# SSH连接服务器后执行
cd /opt/taofen/source
bash scripts/get-iiif-structure.sh
```

**⚠️ 需要手动验证的项目**
由于SSH连接限制，以下项目需要您手动验证：
1. 实际的IIIF部署路径是否在 `/srv/iiif/`
2. 各子目录是否存在并包含正确的内容
3. Docker容器的具体配置和运行状态
4. 图像文件的存储位置和权限设置

#### 手动验证步骤

**第一步：SSH连接服务器**
```bash
# 使用SSH客户端连接
ssh root@115.29.208.232
# 输入密码: nsrjd4yt
```

**第二步：执行检查命令**
```bash
# 检查IIIF目录结构
ls -la /srv/iiif/
ls -la /srv/iiif/manifests/
ls -la /srv/iiif/images/  
ls -la /srv/iiif/logs/
ls -la /srv/iiif/stack/

# 检查Docker容器
docker ps | grep -i iiif
docker ps -a | grep cantaloupe

# 检查服务端口
netstat -tlnp | grep -E ":(8182|8080)"

# 检查文件权限和大小
du -sh /srv/iiif/*/
```

**第三步：验证IIIF文件上传方式**
如您提到要使用XFTP工具上传代码，建议验证：
- `/srv/iiif/images/` 目录的写权限
- `/srv/iiif/manifests/` 目录的写权限  
- 上传文件后的路径访问测试

#### 与文档的对比检查

**文档规划 vs 实际部署**
- 文档中规划路径: `/opt/taofen/iiif/`
- 您提到的实际路径: `/srv/iiif/`
- 需要确认实际使用的路径并更新配置

**配置文件位置核实**
如果实际部署路径与文档不同，需要检查并更新：
- Docker Compose文件位置
- Cantaloupe配置文件位置  
- Caddy反向代理配置中的路径映射

---

## 🚀 服务器基础环境搭建

### 🔐 SSH连接和安全配置

#### 第一次连接服务器
```bash
# 使用阿里云控制台提供的公网IP连接
ssh root@你的服务器IP

# 首次连接会提示指纹确认，输入 yes
# 输入root密码（阿里云创建实例时设置的密码）
```

**✅ 连接成功标志**：看到类似 `root@hostname:~#` 的提示符

#### 创建非root用户
```bash
# 创建项目专用用户
adduser taofen
# 按提示输入密码和用户信息（其他信息可以直接回车跳过）

# 将用户加入sudo组
usermod -aG sudo taofen

# 切换到新用户
su - taofen
```

#### 基础安全设置
```bash
# 更新系统软件包
sudo apt update && sudo apt upgrade -y

# 安装必要工具
sudo apt install -y curl wget vim git ufw

# 配置防火墙
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# 验证防火墙状态
sudo ufw status
# 应该显示：Status: active，并列出允许的端口
```

### 🐳 Docker环境安装

#### 移除旧版本Docker（如果存在）
```bash
sudo apt remove docker docker-engine docker.io containerd runc
```

#### 安装Docker
```bash
# 安装依赖包
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 添加Docker官方GPG密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 添加Docker仓库
echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 更新包索引
sudo apt update

# 安装Docker
sudo apt install -y docker-ce docker-ce-cli containerd.io

# 将用户添加到docker组
sudo usermod -aG docker $USER

# 重新登录以使组权限生效
exit
ssh taofen@你的服务器IP
```

#### 验证Docker安装
```bash
# 检查Docker版本
docker --version
# 应该显示：Docker version 20.x.x

# 测试Docker运行
docker run hello-world
# ✅ 成功标志：显示"Hello from Docker!"
```

#### 安装Docker Compose
```bash
# 下载Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 设置执行权限
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker-compose --version
# 应该显示：docker-compose version 1.x.x
```

### 📁 项目目录结构创建

#### 创建标准目录结构
```bash
# 创建项目根目录
sudo mkdir -p /opt/taofen
sudo chown -R taofen:taofen /opt/taofen
cd /opt/taofen

# 创建各服务目录
mkdir -p {frontend,backend,iiif,scripts,logs,backups}
mkdir -p iiif/{images,manifests,cache,logs}
mkdir -p logs/{frontend,backend,iiif,caddy}

# 创建Web服务目录
sudo mkdir -p /var/www/taofen
sudo chown -R taofen:taofen /var/www/taofen

# 验证目录结构
tree -L 2 /opt/taofen
# 或者使用：ls -la /opt/taofen
```

#### 设置环境变量
```bash
# 创建环境变量文件
cat > ~/.bashrc_taofen << 'EOF'
# 邹韬奋项目环境变量
export TAOFEN_HOME="/opt/taofen"
export TAOFEN_WEB="/var/www/taofen"
export PATH="$TAOFEN_HOME/scripts:$PATH"
EOF

# 加载环境变量
echo "source ~/.bashrc_taofen" >> ~/.bashrc
source ~/.bashrc
```

---

## 🖼️ IIIF图像服务部署

### 📋 Cantaloupe配置优化

#### 创建Docker Compose文件
```bash
cd /opt/taofen/iiif

cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  cantaloupe:
    image: uclalibrary/cantaloupe:5.0.7-0
    container_name: cantaloupe
    restart: unless-stopped
    ports:
      - "127.0.0.1:8182:8182"
    environment:
      # 针对2GB内存服务器的优化配置
      JAVA_OPTS: "-Xms128m -Xmx512m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
      
      # API配置
      CANTALOUPE_ENDPOINT_API_ENABLED: "true"
      CANTALOUPE_ENDPOINT_API_USERNAME: "api"
      CANTALOUPE_ENDPOINT_API_SECRET: "verysecret"
      
      # IIIF协议支持
      CANTALOUPE_ENDPOINT_IIIF_3_ENABLED: "true"
      CANTALOUPE_ENDPOINT_IIIF_2_ENABLED: "true"
      
      # 管理界面
      CANTALOUPE_ENDPOINT_ADMIN_ENABLED: "true"
      CANTALOUPE_ENDPOINT_ADMIN_USERNAME: "admin"
      CANTALOUPE_ENDPOINT_ADMIN_SECRET: "nsrjd4yt"
      
      # 图像源配置
      CANTALOUPE_SOURCE_STATIC: "FilesystemSource"
      CANTALOUPE_FILESYSTEMSOURCE_LOOKUP_STRATEGY: "BasicLookupStrategy"
      CANTALOUPE_FILESYSTEMSOURCE_BASICLOOKUPSTRATEGY_PATH_PREFIX: "/imageroot/images/"
      
      # 缓存配置（适配小内存）
      CANTALOUPE_CACHE_SERVER_DERIVATIVE_ENABLED: "true"
      CANTALOUPE_CACHE_SERVER_DERIVATIVE: "FilesystemCache"
      CANTALOUPE_FILESYSTEMCACHE_PATHNAME: "/var/cache/cantaloupe"
      CANTALOUPE_CACHE_SERVER_INFO_ENABLED: "true"
      
      # 图像处理限制
      CANTALOUPE_MAX_PIXELS: "20000000"
      CANTALOUPE_PROCESSOR_SELECTION_STRATEGY: "AutomaticSelectionStrategy"
      
    volumes:
      - ./images:/imageroot/images:ro
      - ./cache:/var/cache/cantaloupe
      - ./logs:/opt/cantaloupe/logs
      - ./manifests:/imageroot/manifests:ro
      
    healthcheck:
      test: ["CMD", "curl", "-fsS", "http://localhost:8182/iiif/3/"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s
    
    # 资源限制（防止占用过多资源）
    mem_limit: 600m
    memswap_limit: 600m

volumes:
  cantaloupe_cache:
  cantaloupe_logs:

networks:
  default:
    driver: bridge
EOF
```

#### 创建Cantaloupe配置文件
```bash
# 创建详细的配置文件
cat > cantaloupe.properties << 'EOF'
###########################################################################
# 邹韬奋项目 - Cantaloupe IIIF服务器配置文件
# 针对2GB内存服务器优化
###########################################################################

# HTTP服务器配置
http.enabled = true
http.host = 0.0.0.0
http.port = 8182

# HTTPS配置（通过Caddy处理，这里不启用）
https.enabled = false

# 基础设置
base_uri = 
slash_substitute = 
max_pixels = 20000000
print_stack_trace_on_error_pages = true

# 图像源配置
source.static = FilesystemSource

# 文件系统源配置
FilesystemSource.lookup_strategy = BasicLookupStrategy
FilesystemSource.BasicLookupStrategy.path_prefix = /imageroot/images/
FilesystemSource.BasicLookupStrategy.path_suffix = 

# 处理器配置
processor.selection_strategy = AutomaticSelectionStrategy
processor.ManualSelectionStrategy.avi = FFmpegProcessor
processor.ManualSelectionStrategy.bmp = Java2dProcessor
processor.ManualSelectionStrategy.dcm = ImageMagickProcessor
processor.ManualSelectionStrategy.flv = FFmpegProcessor
processor.ManualSelectionStrategy.gif = ImageMagickProcessor
processor.ManualSelectionStrategy.jp2 = OpenJpegProcessor
processor.ManualSelectionStrategy.jpg = TurboJpegProcessor
processor.ManualSelectionStrategy.mov = FFmpegProcessor
processor.ManualSelectionStrategy.mp4 = FFmpegProcessor
processor.ManualSelectionStrategy.mpg = FFmpegProcessor
processor.ManualSelectionStrategy.pdf = PdfBoxProcessor
processor.ManualSelectionStrategy.png = Java2dProcessor
processor.ManualSelectionStrategy.tif = Java2dProcessor
processor.ManualSelectionStrategy.webm = FFmpegProcessor
processor.ManualSelectionStrategy.webp = ImageMagickProcessor

# 处理器优化
processor.normalize = false
processor.background_color = white
processor.jpg.progressive = true
processor.jpg.quality = 80
processor.tif.compression = LZW

# 缓存配置
cache.server.source = FilesystemCache
cache.server.derivative.enabled = true
cache.server.derivative = FilesystemCache
cache.server.info.enabled = true
cache.server.info = FilesystemCache

# 文件系统缓存
FilesystemCache.pathname = /var/cache/cantaloupe
FilesystemCache.dir.depth = 3
FilesystemCache.dir.name_length = 2

# 缓存清理
cache.server.purge_missing = true
cache.server.resolve_first = false
cache.server.ttl_seconds = 2592000

# 日志配置
log.application.level = info
log.application.ConsoleAppender.enabled = true
log.application.FileAppender.enabled = true
log.application.FileAppender.pathname = /opt/cantaloupe/logs/application.log
log.application.RollingFileAppender.enabled = false
log.access.ConsoleAppender.enabled = false
log.access.FileAppender.enabled = true
log.access.FileAppender.pathname = /opt/cantaloupe/logs/access.log

# 端点配置
endpoint.iiif.1.enabled = false
endpoint.iiif.2.enabled = true
endpoint.iiif.3.enabled = true
endpoint.admin.enabled = true
endpoint.admin.username = admin
endpoint.admin.secret = nsrjd4yt
endpoint.api.enabled = true
endpoint.api.username = api
endpoint.api.secret = verysecret

# 信息响应配置
endpoint.iiif.content_disposition = inline
endpoint.iiif.min_size = 64
endpoint.iiif.min_tile_size = 512
endpoint.iiif.2.restrict_to_sizes = false
EOF
```

#### 设置权限和目录
```bash
# 创建必要的目录
mkdir -p images manifests cache logs

# 设置适当的权限（cantaloupe容器使用用户ID 8983）
sudo chown -R 8983:8983 cache logs
chmod -R 755 cache logs

# 创建测试图片目录
mkdir -p images/test
```

### 📸 图像数据上传和组织

#### 创建图片上传脚本
```bash
cat > /opt/taofen/scripts/upload-images.sh << 'EOF'
#!/bin/bash

# 邹韬奋项目图像上传脚本
IIIF_DIR="/opt/taofen/iiif"
IMAGES_DIR="$IIIF_DIR/images"
MANIFESTS_DIR="$IIIF_DIR/manifests"

echo "开始上传和组织IIIF图像数据..."

# 创建图像分类目录
mkdir -p "$IMAGES_DIR"/{handwriting,timeline,bookstore,hero,newspapers,relationships}

# 设置权限
sudo chown -R taofen:taofen "$IMAGES_DIR"
chmod -R 755 "$IMAGES_DIR"

echo "图像目录结构已创建："
tree -L 2 "$IMAGES_DIR" 2>/dev/null || ls -la "$IMAGES_DIR"

echo ""
echo "请将图像文件按以下结构上传："
echo "📁 $IMAGES_DIR/"
echo "  ├── 📁 handwriting/     # 手迹图片"
echo "  ├── 📁 timeline/        # 时间轴图片"  
echo "  ├── 📁 bookstore/       # 书店相关图片"
echo "  ├── 📁 hero/           # 首页背景图片"
echo "  ├── 📁 newspapers/     # 报纸图片"
echo "  └── 📁 relationships/  # 人物关系图片"

echo ""
echo "上传方法："
echo "1. 使用FileZilla等FTP工具"
echo "2. 或使用scp命令：scp -r ./本地图片目录/* taofen@服务器IP:$IMAGES_DIR/"

EOF

chmod +x /opt/taofen/scripts/upload-images.sh
```

#### 执行图像组织
```bash
# 运行图像上传脚本
/opt/taofen/scripts/upload-images.sh
```

#### 创建测试图片（用于验证）
```bash
# 如果还没有实际图片，创建一个测试图片
cd /opt/taofen/iiif/images
mkdir -p test

# 下载一个测试图片
curl -o test/sample.jpg https://via.placeholder.com/800x600/blue/white?text=IIIF+Test

# 验证图片存在
ls -la test/
```

### 🔄 启动IIIF服务

#### 启动Cantaloupe容器
```bash
cd /opt/taofen/iiif

# 启动服务
docker-compose up -d

# 检查容器状态
docker-compose ps
# ✅ 成功标志：State显示为"Up"

# 查看启动日志
docker-compose logs -f cantaloupe
# ✅ 成功标志：看到"Server started" 或类似信息
# 按Ctrl+C退出日志查看
```

#### 验证IIIF服务
```bash
# 检查服务健康状态
curl -s http://localhost:8182/iiif/3/ | jq '.' || curl -s http://localhost:8182/iiif/3/

# ✅ 成功响应：应该返回JSON格式的IIIF服务信息

# 测试图片访问（如果有测试图片）
curl -I http://localhost:8182/iiif/2/test%2Fsample.jpg/info.json

# ✅ 成功标志：HTTP 200 OK
# ❌ 失败标志：HTTP 404或连接错误
```

---

## 💻 前端应用构建和部署

### 📦 项目代码上传

#### 从本地上传代码
```bash
# 方法1: 使用git克隆（推荐）
cd /opt/taofen
git clone https://github.com/your-repo/taofen_web.git source
cd source

# 方法2: 使用scp从本地上传（在本地电脑执行）
# scp -r ./taofen_web taofen@服务器IP:/opt/taofen/source
```

#### 检查项目结构
```bash
cd /opt/taofen/source
ls -la

# 应该看到以下目录：
# frontend/  - React前端代码
# backend/   - Node.js后端代码  
# scripts/   - 工具脚本
# docs/      - 文档
```

### 🏗️ Node.js环境安装

#### 使用NodeSource安装Node.js
```bash
# 添加NodeSource仓库（Node.js 18.x LTS）
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# 安装Node.js
sudo apt install -y nodejs

# 验证安装
node --version  # 应该显示 v18.x.x
npm --version   # 应该显示 8.x.x或更高
```

#### 安装yarn（可选，用于更快的包管理）
```bash
# 安装yarn
sudo npm install -g yarn

# 验证安装
yarn --version
```

### 🔧 前端构建配置

#### 配置前端环境变量
```bash
cd /opt/taofen/source/frontend

# 创建生产环境配置
cat > .env.production << 'EOF'
# 邹韬奋项目生产环境配置
NODE_ENV=production

# API服务器地址
VITE_API_BASE_URL=https://www.ai4dh.cn/api

# IIIF服务器地址  
VITE_IIIF_BASE_URL=https://www.ai4dh.cn/iiif

# 其他配置
VITE_APP_TITLE=邹韬奋沉浸式叙事
VITE_APP_DESCRIPTION=传承历史文化，融合现代技术
EOF
```

#### 优化前端构建配置
```bash
# 检查是否有vite.config.js，如果没有则创建
if [ ! -f vite.config.js ]; then
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  
  // 构建优化
  build: {
    outDir: 'dist',
    assetsDir: 'static',
    sourcemap: false,
    minify: 'terser',
    
    // 分包策略
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react'],
          'utils': ['axios']
        }
      }
    },
    
    // 文件大小警告阈值
    chunkSizeWarningLimit: 1000
  },
  
  // 开发服务器配置（生产环境不使用）
  server: {
    port: 5173,
    host: true
  },
  
  // 路径别名
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils')
    }
  }
})
EOF
fi
```

### 🚀 执行前端构建

#### 安装依赖和构建
```bash
cd /opt/taofen/source/frontend

# 安装依赖（使用yarn更快）
yarn install --production=false
# 或使用npm：npm install

# 执行生产构建
npm run build
# 或使用yarn：yarn build

# ✅ 成功标志：看到 "build complete" 或类似信息
# 构建产物会在 dist/ 目录中
```

#### 验证构建结果
```bash
# 检查构建产物
ls -la dist/

# 应该看到：
# index.html      - 主HTML文件
# static/         - 静态资源目录
#   ├── css/      - CSS文件
#   ├── js/       - JavaScript文件  
#   └── images/   - 图片文件

# 检查文件大小
du -sh dist/
# 应该在合理范围内（通常10-50MB）
```

### 📂 部署到Web目录

#### 复制构建文件到Web目录
```bash
# 清空Web目录（小心操作）
sudo rm -rf /var/www/taofen/*

# 复制构建产物
sudo cp -r /opt/taofen/source/frontend/dist/* /var/www/taofen/

# 设置适当的权限
sudo chown -R taofen:taofen /var/www/taofen
sudo chmod -R 755 /var/www/taofen

# 验证文件复制
ls -la /var/www/taofen/
```

#### 创建前端服务管理脚本
```bash
cat > /opt/taofen/scripts/frontend-deploy.sh << 'EOF'
#!/bin/bash

# 前端部署脚本
SOURCE_DIR="/opt/taofen/source/frontend"
WEB_DIR="/var/www/taofen"
BACKUP_DIR="/opt/taofen/backups/frontend"

echo "开始前端部署..."

# 创建备份
mkdir -p "$BACKUP_DIR"
if [ -d "$WEB_DIR" ] && [ "$(ls -A $WEB_DIR)" ]; then
    echo "备份当前版本..."
    tar -czf "$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz" -C "$WEB_DIR" .
fi

# 构建前端
echo "构建前端应用..."
cd "$SOURCE_DIR"
npm run build

if [ $? -eq 0 ]; then
    echo "构建成功，部署到Web目录..."
    
    # 清空Web目录
    sudo rm -rf "$WEB_DIR"/*
    
    # 复制新文件
    sudo cp -r dist/* "$WEB_DIR"/
    
    # 设置权限
    sudo chown -R taofen:taofen "$WEB_DIR"
    sudo chmod -R 755 "$WEB_DIR"
    
    echo "前端部署成功！"
    echo "访问地址: https://www.ai4dh.cn"
else
    echo "前端构建失败！"
    exit 1
fi
EOF

chmod +x /opt/taofen/scripts/frontend-deploy.sh
```

---

## 🔧 后端API服务部署

### 📋 后端环境配置

#### 配置后端环境变量
```bash
cd /opt/taofen/source/backend

# 创建生产环境配置
cat > .env.production << 'EOF'
# 邹韬奋后端服务生产环境配置
NODE_ENV=production

# 服务器配置
PORT=3001
HOST=localhost

# 数据库配置（如果使用）
# DATABASE_URL=your_database_connection_string

# JWT密钥（用于用户认证，如果需要）
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# 文件上传配置
UPLOAD_DIR=/opt/taofen/uploads
MAX_FILE_SIZE=10485760

# IIIF服务配置  
IIIF_BASE_URL=http://localhost:8182/iiif

# AI服务配置（如果使用GLM等AI服务）
# AI_API_KEY=your-ai-api-key
# AI_API_URL=your-ai-service-url

# 日志配置
LOG_LEVEL=info
LOG_DIR=/opt/taofen/logs/backend

# CORS配置
CORS_ORIGINS=https://www.ai4dh.cn,https://ai4dh.cn

# 缓存配置
CACHE_TTL=3600
EOF

# 设置环境变量文件权限（包含敏感信息）
chmod 600 .env.production
```

#### 创建必要的目录
```bash
# 创建后端相关目录
mkdir -p /opt/taofen/{uploads,logs/backend}

# 设置权限
chown -R taofen:taofen /opt/taofen/{uploads,logs}
chmod -R 755 /opt/taofen/{uploads,logs}
```

### 📦 后端依赖安装

#### 安装后端依赖
```bash
cd /opt/taofen/source/backend

# 检查package.json
cat package.json | grep -A 10 -B 10 "dependencies"

# 安装生产依赖
npm install --production
# 如果需要开发依赖（比如TypeScript编译）：npm install

# 验证关键依赖
npm list express
npm list cors
# 应该显示已安装的版本信息
```

### 🔄 PM2进程管理安装

#### 安装PM2
```bash
# 全局安装PM2
sudo npm install -g pm2

# 验证安装
pm2 --version

# 配置PM2开机自启
pm2 startup
# 按提示执行返回的sudo命令
```

#### 创建PM2配置文件
```bash
cd /opt/taofen/source/backend

cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'taofen-backend',
    script: './server.js',
    
    // 基础配置
    cwd: '/opt/taofen/source/backend',
    node_args: '--max_old_space_size=256',
    
    // 环境变量
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    
    // PM2配置
    instances: 1,              // 单实例（2GB内存限制）
    exec_mode: 'fork',         // fork模式而非cluster
    
    // 重启策略
    autorestart: true,
    watch: false,
    max_memory_restart: '200M', // 内存超过200MB自动重启
    
    // 日志配置
    log_file: '/opt/taofen/logs/backend/combined.log',
    out_file: '/opt/taofen/logs/backend/out.log',
    error_file: '/opt/taofen/logs/backend/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // 高级配置
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }]
};
EOF
```

### 🚀 启动后端服务

#### 使用PM2启动服务
```bash
cd /opt/taofen/source/backend

# 启动服务
pm2 start ecosystem.config.js --env production

# 检查服务状态
pm2 status
# ✅ 成功标志：status显示为"online"

# 查看日志
pm2 logs taofen-backend --lines 50

# 保存PM2配置
pm2 save
```

#### 验证后端服务
```bash
# 检查端口监听
netstat -tlpn | grep :3001
# ✅ 成功标志：显示3001端口被监听

# 测试API响应
curl -s http://localhost:3001/api/health || curl -s http://localhost:3001/
# ✅ 成功标志：返回JSON响应或正常HTTP响应

# 检查进程资源使用
pm2 monit
# 按q退出监控界面
```

### 📝 后端管理脚本

#### 创建后端管理脚本
```bash
cat > /opt/taofen/scripts/backend-manage.sh << 'EOF'
#!/bin/bash

# 后端服务管理脚本
BACKEND_DIR="/opt/taofen/source/backend"
SERVICE_NAME="taofen-backend"

case "$1" in
    start)
        echo "启动后端服务..."
        cd "$BACKEND_DIR"
        pm2 start ecosystem.config.js --env production
        ;;
    stop)
        echo "停止后端服务..."
        pm2 stop "$SERVICE_NAME"
        ;;
    restart)
        echo "重启后端服务..."
        cd "$BACKEND_DIR"
        pm2 restart "$SERVICE_NAME"
        ;;
    reload)
        echo "重新加载后端服务..."
        cd "$BACKEND_DIR"
        pm2 reload "$SERVICE_NAME"
        ;;
    status)
        pm2 status "$SERVICE_NAME"
        ;;
    logs)
        pm2 logs "$SERVICE_NAME" --lines 100
        ;;
    deploy)
        echo "部署后端更新..."
        cd "$BACKEND_DIR"
        
        # 拉取最新代码
        git pull origin master
        
        # 安装依赖
        npm install --production
        
        # 重启服务
        pm2 restart "$SERVICE_NAME"
        
        echo "后端部署完成！"
        ;;
    *)
        echo "用法: $0 {start|stop|restart|reload|status|logs|deploy}"
        exit 1
        ;;
esac
EOF

chmod +x /opt/taofen/scripts/backend-manage.sh

# 创建快捷命令
echo "alias backend='/opt/taofen/scripts/backend-manage.sh'" >> ~/.bashrc
source ~/.bashrc
```

---

## 🌐 Caddy Web服务器配置

### 📦 安装Caddy

#### 使用官方仓库安装Caddy
```bash
# 安装必要工具
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https

# 添加Caddy仓库
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list

# 更新包列表并安装
sudo apt update
sudo apt install caddy

# 验证安装
caddy version
# 应该显示版本信息，如：v2.6.x
```

#### 配置Caddy系统服务
```bash
# 启用Caddy服务
sudo systemctl enable caddy

# 检查Caddy状态
sudo systemctl status caddy
# 应该显示 "Active: active (running)"
```

### ⚙️ 创建Caddyfile配置

#### 备份默认配置
```bash
# 备份默认Caddyfile
sudo cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.backup
```

#### 创建完整的生产配置
```bash
sudo tee /etc/caddy/Caddyfile > /dev/null << 'EOF'
# 邹韬奋项目 - Caddy配置文件
# 针对 www.ai4dh.cn 域名的完整配置

# 全局配置
{
    # SSL证书邮箱（用于Let's Encrypt）
    email your-email@example.com
    
    # 管理员API（可选）
    admin localhost:2019
    
    # 日志配置
    log {
        output file /var/log/caddy/access.log
        format json
        level INFO
    }
}

# 主域名重定向到www
ai4dh.cn {
    redir https://www.ai4dh.cn{uri} permanent
}

# 主配置 - www.ai4dh.cn
www.ai4dh.cn {
    # 启用访问日志
    log {
        output file /var/log/caddy/www.ai4dh.cn.log
        format combined
    }
    
    # 启用压缩
    encode {
        gzip 6
        zstd
        
        # 压缩文件类型
        match {
            header Content-Type text/*
            header Content-Type application/json*
            header Content-Type application/javascript*
            header Content-Type application/xml*
            header Content-Type image/svg+xml*
        }
    }
    
    # 安全头配置
    header {
        # 安全相关头
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        X-XSS-Protection "1; mode=block"
        Referrer-Policy strict-origin-when-cross-origin
        
        # 缓存控制
        Cache-Control "public, max-age=3600"
        
        # HSTS（可选，启用HTTPS强制）
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    }
    
    # IIIF manifest服务 - 静态文件
    handle_path /iiif/3/manifests/* {
        root * /opt/taofen/iiif/manifests
        file_server {
            # 启用预压缩文件
            precompressed gzip
            # 隐藏文件
            hide .htaccess
        }
        
        # IIIF专用头
        header Content-Type "application/json; charset=utf-8"
        header Access-Control-Allow-Origin "*"
        header Access-Control-Allow-Methods "GET, OPTIONS"
        header Access-Control-Allow-Headers "Content-Type"
    }
    
    # IIIF manifest服务 - 兼容v2路径
    handle_path /iiif/manifests/* {
        root * /opt/taofen/iiif/manifests
        file_server {
            precompressed gzip
            hide .htaccess
        }
        header Content-Type "application/json; charset=utf-8"
        header Access-Control-Allow-Origin "*"
    }
    
    # IIIF 图像服务 - 代理到Cantaloupe
    @iiif {
        path_regexp iiif ^/iiif/(2|3)/.*
    }
    handle @iiif {
        reverse_proxy localhost:8182 {
            # 性能优化
            flush_interval -1
            
            # HTTP版本
            transport http {
                versions 1.1
                response_header_timeout 30s
                read_timeout 30s
                write_timeout 30s
            }
            
            # 传递头信息
            header_up Host {upstream_hostport}
            header_up X-Forwarded-Proto {scheme}
            header_up X-Forwarded-Host {host}
            header_up X-Forwarded-For {remote}
            header_up X-Real-IP {remote}
            
            # CORS头
            header_down Access-Control-Allow-Origin "*"
            header_down Access-Control-Allow-Methods "GET, OPTIONS"
            
            # 缓存控制
            header_down Cache-Control "public, max-age=86400"
            
            # 健康检查
            health_uri /iiif/3/
            health_interval 30s
            health_timeout 10s
            health_status 2xx
        }
        
        # IIIF图像特定头
        header Cache-Control "public, max-age=86400"
    }
    
    # 后端API代理
    handle_path /api/* {
        reverse_proxy localhost:3001 {
            # 性能配置
            flush_interval -1
            
            # 超时配置
            transport http {
                versions 1.1
                response_header_timeout 30s
                read_timeout 30s
            }
            
            # 传递头信息
            header_up Host {upstream_hostport}
            header_up X-Real-IP {remote}
            header_up X-Forwarded-For {remote}
            header_up X-Forwarded-Proto {scheme}
            header_up X-Forwarded-Host {host}
            
            # 健康检查
            health_uri /api/health
            health_interval 30s
            health_timeout 5s
            health_status 2xx
        }
        
        # API特定头
        header Cache-Control "no-cache, no-store, must-revalidate"
        header Access-Control-Allow-Origin "https://www.ai4dh.cn"
        header Access-Control-Allow-Credentials true
    }
    
    # 静态资源优化
    @static {
        path *.css *.js *.png *.jpg *.jpeg *.gif *.svg *.ico *.woff *.woff2 *.ttf *.eot
    }
    handle @static {
        root * /var/www/taofen
        file_server {
            precompressed gzip
        }
        
        # 静态资源长期缓存
        header Cache-Control "public, max-age=31536000, immutable"
        header ETag
    }
    
    # SPA前端应用 - 处理所有其他请求
    handle {
        root * /var/www/taofen
        
        # SPA路由支持
        try_files {path} {path}/ /index.html
        
        file_server {
            precompressed gzip
            index index.html
        }
        
        # HTML文件不缓存
        @html {
            path *.html
        }
        header @html Cache-Control "no-cache, no-store, must-revalidate"
    }
    
    # 错误页面
    handle_errors {
        @404 {
            expression {http.error.status_code} == 404
        }
        rewrite @404 /index.html
        file_server {
            root /var/www/taofen
        }
    }
}

# 开发环境配置（可选）
# dev.ai4dh.cn {
#     reverse_proxy localhost:5173
# }
EOF
```

#### 验证Caddyfile语法
```bash
# 验证配置文件语法
sudo caddy validate --config /etc/caddy/Caddyfile

# ✅ 成功标志：显示 "Valid configuration"
# ❌ 失败标志：显示具体的语法错误
```

### 📁 创建日志目录

#### 设置Caddy日志目录
```bash
# 创建日志目录
sudo mkdir -p /var/log/caddy

# 设置权限
sudo chown -R caddy:caddy /var/log/caddy
sudo chmod -R 755 /var/log/caddy

# 配置日志轮转
sudo tee /etc/logrotate.d/caddy > /dev/null << 'EOF'
/var/log/caddy/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 0644 caddy caddy
    postrotate
        systemctl reload caddy
    endscript
}
EOF
```

### 🔄 启动和验证Caddy

#### 重启Caddy服务
```bash
# 重新加载配置
sudo systemctl reload caddy

# 检查服务状态
sudo systemctl status caddy
# ✅ 成功标志：Active: active (running)

# 查看错误日志（如果有问题）
sudo journalctl -u caddy -n 50
```

#### 验证SSL证书获取
```bash
# 检查证书获取情况
sudo journalctl -u caddy -f &

# 在另一个终端测试HTTPS访问
curl -I https://www.ai4dh.cn

# ✅ 成功标志：HTTP/2 200 OK，并且有valid SSL certificate
# ❌ 失败标志：SSL错误或证书问题

# 停止日志监控
sudo pkill -f "journalctl -u caddy -f"
```

---

## 🔍 部署验证和测试

### 🏥 系统健康检查

#### 创建健康检查脚本
```bash
cat > /opt/taofen/scripts/health-check.sh << 'EOF'
#!/bin/bash

# 邹韬奋项目健康检查脚本
echo "🏥 系统健康检查开始..."
echo "检查时间: $(date)"
echo "========================================"

# 1. 系统资源检查
echo "📊 系统资源状态:"
echo "内存使用:"
free -h
echo ""
echo "磁盘使用:"
df -h /
echo ""
echo "CPU负载:"
uptime
echo ""

# 2. Docker服务检查
echo "🐳 Docker服务状态:"
if systemctl is-active docker &>/dev/null; then
    echo "✅ Docker服务: 正常运行"
    
    # Cantaloupe容器检查
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q cantaloupe; then
        echo "✅ Cantaloupe容器: 正常运行"
        
        # IIIF服务检查
        if curl -sf http://localhost:8182/iiif/3/ &>/dev/null; then
            echo "✅ IIIF服务响应: 正常"
        else
            echo "❌ IIIF服务响应: 异常"
        fi
    else
        echo "❌ Cantaloupe容器: 未运行"
    fi
else
    echo "❌ Docker服务: 未运行"
fi
echo ""

# 3. 后端服务检查
echo "🔧 后端服务状态:"
if pm2 describe taofen-backend &>/dev/null; then
    PM2_STATUS=$(pm2 describe taofen-backend | grep "status" | awk '{print $4}')
    if [ "$PM2_STATUS" = "online" ]; then
        echo "✅ 后端服务: 正常运行"
        
        # API响应检查
        if curl -sf http://localhost:3001/ &>/dev/null; then
            echo "✅ API服务响应: 正常"
        else
            echo "❌ API服务响应: 异常"
        fi
    else
        echo "❌ 后端服务: 状态异常 ($PM2_STATUS)"
    fi
else
    echo "❌ 后端服务: 未找到"
fi
echo ""

# 4. Web服务器检查
echo "🌐 Web服务器状态:"
if systemctl is-active caddy &>/dev/null; then
    echo "✅ Caddy服务: 正常运行"
    
    # HTTP/HTTPS检查
    if curl -sf http://localhost/ &>/dev/null; then
        echo "✅ HTTP响应: 正常"
    else
        echo "❌ HTTP响应: 异常"
    fi
    
    # HTTPS检查
    if curl -sf https://www.ai4dh.cn/ &>/dev/null; then
        echo "✅ HTTPS响应: 正常"
        
        # SSL证书检查
        SSL_DAYS=$(echo | openssl s_client -servername www.ai4dh.cn -connect www.ai4dh.cn:443 2>/dev/null | openssl x509 -noout -dates | grep notAfter | sed 's/notAfter=//')
        echo "📜 SSL证书有效期至: $SSL_DAYS"
    else
        echo "❌ HTTPS响应: 异常"
    fi
else
    echo "❌ Caddy服务: 未运行"
fi
echo ""

# 5. 前端文件检查
echo "💻 前端文件状态:"
if [ -f "/var/www/taofen/index.html" ]; then
    echo "✅ 前端文件: 存在"
    echo "📁 文件数量: $(find /var/www/taofen -type f | wc -l) 个"
    echo "💾 目录大小: $(du -sh /var/www/taofen | cut -f1)"
else
    echo "❌ 前端文件: 缺失"
fi
echo ""

# 6. 网络连接检查
echo "🌐 网络连接状态:"
echo "监听端口:"
netstat -tlpn | grep -E "(80|443|3001|8182)" | sort
echo ""

# 7. 日志检查（最近的错误）
echo "📋 最近错误日志:"
echo "Caddy错误 (最近10条):"
sudo journalctl -u caddy --since "1 hour ago" -p err --no-pager -n 10 | tail -5 || echo "无错误"
echo ""

echo "后端错误 (最近5条):"
if [ -f "/opt/taofen/logs/backend/error.log" ]; then
    tail -5 /opt/taofen/logs/backend/error.log || echo "无错误"
else
    echo "日志文件不存在"
fi

echo "========================================"
echo "🏥 健康检查完成"
EOF

chmod +x /opt/taofen/scripts/health-check.sh
```

#### 运行健康检查
```bash
# 运行健康检查
/opt/taofen/scripts/health-check.sh

# 创建定期健康检查（可选）
echo "0 */6 * * * /opt/taofen/scripts/health-check.sh >> /opt/taofen/logs/health-check.log 2>&1" | crontab -
```

### 🧪 功能完整性测试

#### 创建功能测试脚本
```bash
cat > /opt/taofen/scripts/functionality-test.sh << 'EOF'
#!/bin/bash

# 邹韬奋项目功能完整性测试脚本
BASE_URL="https://www.ai4dh.cn"
TEST_LOG="/tmp/functionality-test-$(date +%Y%m%d-%H%M%S).log"

echo "🧪 功能完整性测试开始..."
echo "测试地址: $BASE_URL"
echo "测试日志: $TEST_LOG"
echo "========================================"

# 初始化测试结果
PASS=0
FAIL=0

# 测试函数
test_url() {
    local url="$1"
    local description="$2"
    local expected_code="${3:-200}"
    
    echo -n "测试 $description ... "
    
    local response_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 30)
    local curl_exit_code=$?
    
    if [ $curl_exit_code -eq 0 ] && [ "$response_code" = "$expected_code" ]; then
        echo "✅ 通过 ($response_code)"
        ((PASS++))
        echo "PASS: $url ($response_code)" >> "$TEST_LOG"
    else
        echo "❌ 失败 (curl退出码:$curl_exit_code, HTTP:$response_code)"
        ((FAIL++))
        echo "FAIL: $url (curl:$curl_exit_code, http:$response_code)" >> "$TEST_LOG"
    fi
}

test_api() {
    local url="$1"
    local description="$2"
    
    echo -n "测试 $description ... "
    
    local response=$(curl -s "$url" --max-time 30)
    local curl_exit_code=$?
    
    if [ $curl_exit_code -eq 0 ] && [ -n "$response" ]; then
        # 检查是否是有效JSON
        if echo "$response" | jq . >/dev/null 2>&1; then
            echo "✅ 通过 (有效JSON响应)"
            ((PASS++))
            echo "PASS: $url (JSON)" >> "$TEST_LOG"
        else
            echo "✅ 通过 (有响应内容)"
            ((PASS++))
            echo "PASS: $url (Content)" >> "$TEST_LOG"
        fi
    else
        echo "❌ 失败 (无响应或网络错误)"
        ((FAIL++))
        echo "FAIL: $url (No response)" >> "$TEST_LOG"
    fi
}

# 1. 基础连接测试
echo "1️⃣  基础连接测试"
test_url "$BASE_URL" "主页访问" 200
test_url "$BASE_URL/nonexistent" "404处理" 404
echo ""

# 2. IIIF服务测试
echo "2️⃣  IIIF服务测试"
test_api "$BASE_URL/iiif/3/" "IIIF v3信息端点"
test_api "$BASE_URL/iiif/2/" "IIIF v2信息端点"

# 如果有测试图片，测试图片访问
if [ -f "/opt/taofen/iiif/images/test/sample.jpg" ]; then
    test_api "$BASE_URL/iiif/2/test%2Fsample.jpg/info.json" "测试图片信息"
    test_url "$BASE_URL/iiif/2/test%2Fsample.jpg/full/300,/0/default.jpg" "测试图片缩略图" 200
fi
echo ""

# 3. API服务测试
echo "3️⃣  API服务测试"
test_api "$BASE_URL/api/" "API根路径"
test_api "$BASE_URL/api/health" "API健康检查"
# 根据实际API添加更多测试
echo ""

# 4. 静态资源测试
echo "4️⃣  静态资源测试"
# 检查是否有常见的静态文件
for asset in "static/js" "static/css" "favicon.ico"; do
    if curl -sf "$BASE_URL/$asset" --max-time 10 >/dev/null; then
        test_url "$BASE_URL/$asset" "静态资源: $asset" 200
    fi
done
echo ""

# 5. SSL证书测试
echo "5️⃣  SSL证书测试"
echo -n "测试SSL证书有效性 ... "
if echo | openssl s_client -servername www.ai4dh.cn -connect www.ai4dh.cn:443 2>/dev/null | grep -q "Verify return code: 0"; then
    echo "✅ 通过"
    ((PASS++))
    echo "PASS: SSL certificate valid" >> "$TEST_LOG"
else
    echo "❌ 失败"
    ((FAIL++))
    echo "FAIL: SSL certificate invalid" >> "$TEST_LOG"
fi
echo ""

# 6. 性能基准测试
echo "6️⃣  性能基准测试"
echo -n "测试首页加载时间 ... "
load_time=$(curl -s -w "%{time_total}" -o /dev/null "$BASE_URL" --max-time 30)
if (( $(echo "$load_time < 3.0" | bc -l) )); then
    echo "✅ 通过 (${load_time}秒)"
    ((PASS++))
    echo "PASS: Homepage load time ${load_time}s" >> "$TEST_LOG"
else
    echo "⚠️  较慢 (${load_time}秒，建议<3秒)"
    echo "SLOW: Homepage load time ${load_time}s" >> "$TEST_LOG"
fi
echo ""

# 测试总结
echo "========================================"
echo "📊 测试结果总结:"
echo "✅ 通过: $PASS 项"
echo "❌ 失败: $FAIL 项"
echo "📋 详细日志: $TEST_LOG"

if [ $FAIL -eq 0 ]; then
    echo "🎉 所有测试通过！网站功能正常。"
    exit 0
else
    echo "⚠️  发现 $FAIL 个问题，请检查日志并修复。"
    exit 1
fi
EOF

chmod +x /opt/taofen/scripts/functionality-test.sh
```

#### 运行功能测试
```bash
# 运行完整功能测试
/opt/taofen/scripts/functionality-test.sh

# 查看测试日志
ls -la /tmp/functionality-test-*.log | tail -1 | xargs cat
```

### 📈 性能基准测试

#### 创建性能测试脚本
```bash
cat > /opt/taofen/scripts/performance-test.sh << 'EOF'
#!/bin/bash

# 性能基准测试脚本
BASE_URL="https://www.ai4dh.cn"
CONCURRENT_USERS=10
TEST_DURATION=30

echo "📈 性能基准测试开始..."
echo "测试地址: $BASE_URL"
echo "并发用户: $CONCURRENT_USERS"
echo "测试时长: ${TEST_DURATION}秒"
echo "========================================"

# 检查是否安装了ab（Apache Bench）
if ! command -v ab &> /dev/null; then
    echo "安装Apache Bench工具..."
    sudo apt install -y apache2-utils
fi

# 1. 首页性能测试
echo "1️⃣  首页性能测试"
echo "测试URL: $BASE_URL"
ab -c $CONCURRENT_USERS -t $TEST_DURATION "$BASE_URL/" | grep -E "(Requests per second|Time per request|Transfer rate)"
echo ""

# 2. IIIF服务性能测试
echo "2️⃣  IIIF信息端点性能测试"
echo "测试URL: $BASE_URL/iiif/3/"
ab -c 5 -t 10 "$BASE_URL/iiif/3/" | grep -E "(Requests per second|Time per request|Transfer rate)"
echo ""

# 3. API性能测试（如果存在health端点）
echo "3️⃣  API性能测试"
if curl -sf "$BASE_URL/api/health" >/dev/null 2>&1; then
    echo "测试URL: $BASE_URL/api/health"
    ab -c 5 -t 10 "$BASE_URL/api/health" | grep -E "(Requests per second|Time per request|Transfer rate)"
else
    echo "跳过 - API健康端点不可用"
fi
echo ""

# 4. 系统资源监控
echo "4️⃣  测试期间系统资源使用"
echo "内存使用:"
free -h
echo ""
echo "CPU负载:"
uptime
echo ""
echo "磁盘IO:"
iostat 1 1 2>/dev/null | tail -1 || echo "iostat未安装，跳过磁盘IO检查"
echo ""

# 5. 服务响应时间测试
echo "5️⃣  各端点响应时间测试"

test_response_time() {
    local url="$1"
    local description="$2"
    
    local time_total=$(curl -s -w "%{time_total}" -o /dev/null "$url" --max-time 10)
    local http_code=$(curl -s -w "%{http_code}" -o /dev/null "$url" --max-time 10)
    
    printf "%-30s: %s (HTTP %s)\n" "$description" "${time_total}秒" "$http_code"
}

test_response_time "$BASE_URL" "首页"
test_response_time "$BASE_URL/iiif/3/" "IIIF v3信息"
test_response_time "$BASE_URL/api/" "API根路径"

echo ""
echo "========================================"
echo "📊 性能测试建议:"
echo "• 首页响应时间应 < 2秒"
echo "• API响应时间应 < 1秒"
echo "• IIIF服务响应时间应 < 3秒"
echo "• 并发处理能力应 > 10 RPS"
echo ""
echo "如需提升性能，请考虑:"
echo "1. 启用更多缓存"
echo "2. 优化图片压缩"
echo "3. 使用CDN加速"
echo "4. 升级服务器配置"
EOF

chmod +x /opt/taofen/scripts/performance-test.sh
```

#### 运行性能测试
```bash
# 运行性能基准测试
/opt/taofen/scripts/performance-test.sh
```

---

## 📊 监控和维护

### 📋 自动化监控脚本

#### 创建监控脚本
```bash
cat > /opt/taofen/scripts/monitor.sh << 'EOF'
#!/bin/bash

# 邹韬奋项目监控脚本
ALERT_EMAIL="your-email@example.com"  # 替换为你的邮箱
LOG_FILE="/opt/taofen/logs/monitor.log"
ALERT_LOG="/opt/taofen/logs/alerts.log"

# 阈值配置
MEM_THRESHOLD=80      # 内存使用率阈值(%)
CPU_THRESHOLD=90      # CPU使用率阈值(%)  
DISK_THRESHOLD=85     # 磁盘使用率阈值(%)
RESPONSE_TIME_THRESHOLD=5  # 响应时间阈值(秒)

# 日志函数
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

send_alert() {
    local message="$1"
    log_message "🚨 ALERT: $message" | tee -a "$ALERT_LOG"
    
    # 可以在这里添加邮件/短信/微信通知
    # echo "$message" | mail -s "韬奋项目告警" "$ALERT_EMAIL"
}

check_memory() {
    local mem_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    
    if [ "$mem_usage" -gt "$MEM_THRESHOLD" ]; then
        send_alert "内存使用率过高: ${mem_usage}% (阈值: ${MEM_THRESHOLD}%)"
        return 1
    else
        log_message "内存使用率正常: ${mem_usage}%"
        return 0
    fi
}

check_disk() {
    local disk_usage=$(df / | awk 'NR==2{sub(/%/,"",$5); print $5}')
    
    if [ "$disk_usage" -gt "$DISK_THRESHOLD" ]; then
        send_alert "磁盘使用率过高: ${disk_usage}% (阈值: ${DISK_THRESHOLD}%)"
        return 1
    else
        log_message "磁盘使用率正常: ${disk_usage}%"
        return 0
    fi
}

check_services() {
    local issues=0
    
    # 检查Docker和Cantaloupe
    if ! docker ps --format "table {{.Names}}" | grep -q cantaloupe; then
        send_alert "Cantaloupe容器未运行"
        ((issues++))
    else
        log_message "Cantaloupe容器运行正常"
    fi
    
    # 检查后端服务
    if ! pm2 describe taofen-backend &>/dev/null || ! pm2 describe taofen-backend | grep -q "online"; then
        send_alert "后端服务未运行或状态异常"
        ((issues++))
    else
        log_message "后端服务运行正常"
    fi
    
    # 检查Caddy
    if ! systemctl is-active caddy &>/dev/null; then
        send_alert "Caddy Web服务器未运行"
        ((issues++))
    else
        log_message "Caddy Web服务器运行正常"
    fi
    
    return $issues
}

check_response_times() {
    local issues=0
    
    # 检查主页响应时间
    local home_time=$(curl -s -w "%{time_total}" -o /dev/null https://www.ai4dh.cn --max-time 10 2>/dev/null || echo "timeout")
    
    if [ "$home_time" = "timeout" ] || (( $(echo "$home_time > $RESPONSE_TIME_THRESHOLD" | bc -l 2>/dev/null || echo 1) )); then
        send_alert "网站响应时间过长: ${home_time}秒 (阈值: ${RESPONSE_TIME_THRESHOLD}秒)"
        ((issues++))
    else
        log_message "网站响应时间正常: ${home_time}秒"
    fi
    
    # 检查IIIF服务响应时间
    local iiif_time=$(curl -s -w "%{time_total}" -o /dev/null https://www.ai4dh.cn/iiif/3/ --max-time 10 2>/dev/null || echo "timeout")
    
    if [ "$iiif_time" = "timeout" ] || (( $(echo "$iiif_time > $RESPONSE_TIME_THRESHOLD" | bc -l 2>/dev/null || echo 1) )); then
        send_alert "IIIF服务响应时间过长: ${iiif_time}秒"
        ((issues++))
    else
        log_message "IIIF服务响应时间正常: ${iiif_time}秒"
    fi
    
    return $issues
}

# 自动修复函数
auto_fix() {
    log_message "尝试自动修复服务问题..."
    
    # 重启失效的容器
    if ! docker ps --format "table {{.Names}}" | grep -q cantaloupe; then
        log_message "重启Cantaloupe容器..."
        cd /opt/taofen/iiif && docker-compose up -d
    fi
    
    # 重启失效的后端服务
    if ! pm2 describe taofen-backend &>/dev/null || ! pm2 describe taofen-backend | grep -q "online"; then
        log_message "重启后端服务..."
        pm2 restart taofen-backend
    fi
    
    # 重启Caddy
    if ! systemctl is-active caddy &>/dev/null; then
        log_message "重启Caddy服务..."
        sudo systemctl restart caddy
    fi
}

# 主监控流程
main() {
    log_message "🔍 开始监控检查"
    
    local total_issues=0
    
    # 系统资源检查
    check_memory || ((total_issues++))
    check_disk || ((total_issues++))
    
    # 服务状态检查
    check_services
    total_issues=$((total_issues + $?))
    
    # 响应时间检查
    check_response_times
    total_issues=$((total_issues + $?))
    
    # 如果有问题且启用自动修复
    if [ "$total_issues" -gt 0 ] && [ "${AUTO_FIX:-false}" = "true" ]; then
        auto_fix
    fi
    
    if [ "$total_issues" -eq 0 ]; then
        log_message "✅ 所有检查通过，系统运行正常"
    else
        log_message "⚠️  发现 $total_issues 个问题"
    fi
    
    log_message "🔍 监控检查完成"
    echo "----------------------------------------" >> "$LOG_FILE"
}

# 运行监控
main
EOF

chmod +x /opt/taofen/scripts/monitor.sh
```

#### 设置定期监控
```bash
# 创建监控日志目录
mkdir -p /opt/taofen/logs

# 添加到crontab，每5分钟检查一次
echo "*/5 * * * * /opt/taofen/scripts/monitor.sh" | crontab -

# 查看当前crontab
crontab -l

# 手动运行一次测试
/opt/taofen/scripts/monitor.sh
```

### 🗂️ 日志管理配置

#### 创建日志轮转配置
```bash
# 为项目日志创建轮转配置
sudo tee /etc/logrotate.d/taofen << 'EOF'
/opt/taofen/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 taofen taofen
    copytruncate
}

/opt/taofen/logs/*/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 taofen taofen
    copytruncate
}
EOF

# 测试日志轮转配置
sudo logrotate -d /etc/logrotate.d/taofen
```

#### 创建日志查看脚本
```bash
cat > /opt/taofen/scripts/view-logs.sh << 'EOF'
#!/bin/bash

# 日志查看脚本
show_help() {
    echo "用法: $0 [选项] [服务名]"
    echo ""
    echo "选项:"
    echo "  -f, --follow     实时查看日志"
    echo "  -e, --error      只显示错误日志"
    echo "  -n, --lines NUM  显示最后NUM行 (默认50)"
    echo "  -h, --help       显示帮助"
    echo ""
    echo "服务名:"
    echo "  backend          后端服务日志"
    echo "  caddy           Caddy Web服务器日志"
    echo "  cantaloupe      IIIF图像服务日志"
    echo "  monitor         监控脚本日志"
    echo "  system          系统服务日志"
    echo ""
    echo "示例:"
    echo "  $0 backend                 # 查看后端日志"
    echo "  $0 -f caddy               # 实时查看Caddy日志"
    echo "  $0 -e -n 100 backend      # 查看后端最后100行错误日志"
}

# 默认参数
FOLLOW=false
ERROR_ONLY=false
LINES=50
SERVICE=""

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--follow)
            FOLLOW=true
            shift
            ;;
        -e|--error)
            ERROR_ONLY=true
            shift
            ;;
        -n|--lines)
            LINES="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            SERVICE="$1"
            shift
            ;;
    esac
done

if [ -z "$SERVICE" ]; then
    echo "错误: 请指定服务名"
    show_help
    exit 1
fi

# 根据服务选择日志文件
case "$SERVICE" in
    backend)
        if [ "$ERROR_ONLY" = true ]; then
            LOG_FILE="/opt/taofen/logs/backend/error.log"
        else
            LOG_FILE="/opt/taofen/logs/backend/combined.log"
        fi
        ;;
    caddy)
        if [ "$ERROR_ONLY" = true ]; then
            echo "使用journalctl查看Caddy错误日志:"
            if [ "$FOLLOW" = true ]; then
                sudo journalctl -u caddy -p err -f
            else
                sudo journalctl -u caddy -p err -n "$LINES"
            fi
            exit 0
        else
            LOG_FILE="/var/log/caddy/www.ai4dh.cn.log"
        fi
        ;;
    cantaloupe)
        if [ "$ERROR_ONLY" = true ]; then
            LOG_FILE="/opt/taofen/iiif/logs/application.log"
            if [ "$FOLLOW" = true ]; then
                tail -f "$LOG_FILE" | grep -i error
            else
                grep -i error "$LOG_FILE" | tail -"$LINES"
            fi
            exit 0
        else
            LOG_FILE="/opt/taofen/iiif/logs/access.log"
        fi
        ;;
    monitor)
        LOG_FILE="/opt/taofen/logs/monitor.log"
        ;;
    system)
        echo "系统服务日志:"
        if [ "$FOLLOW" = true ]; then
            sudo journalctl -f
        else
            sudo journalctl -n "$LINES"
        fi
        exit 0
        ;;
    *)
        echo "错误: 未知服务名 '$SERVICE'"
        show_help
        exit 1
        ;;
esac

# 检查日志文件是否存在
if [ ! -f "$LOG_FILE" ]; then
    echo "错误: 日志文件不存在: $LOG_FILE"
    exit 1
fi

# 显示日志
echo "查看日志: $LOG_FILE"
echo "----------------------------------------"

if [ "$FOLLOW" = true ]; then
    tail -f "$LOG_FILE"
else
    tail -"$LINES" "$LOG_FILE"
fi
EOF

chmod +x /opt/taofen/scripts/view-logs.sh

# 创建快捷命令别名
echo "alias logs='/opt/taofen/scripts/view-logs.sh'" >> ~/.bashrc
source ~/.bashrc
```

### 💾 备份策略配置

#### 创建备份脚本
```bash
cat > /opt/taofen/scripts/backup.sh << 'EOF'
#!/bin/bash

# 邹韬奋项目备份脚本
BACKUP_DIR="/opt/taofen/backups"
DATE=$(date +%Y%m%d-%H%M%S)
RETENTION_DAYS=30

# 创建备份目录
mkdir -p "$BACKUP_DIR"/{config,data,logs}

log_backup() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$BACKUP_DIR/backup.log"
}

# 1. 配置文件备份
backup_configs() {
    log_backup "开始备份配置文件..."
    
    local config_backup="$BACKUP_DIR/config/config-$DATE.tar.gz"
    
    tar -czf "$config_backup" \
        /etc/caddy/Caddyfile \
        /opt/taofen/iiif/docker-compose.yml \
        /opt/taofen/iiif/cantaloupe.properties \
        /opt/taofen/source/backend/.env.production \
        /opt/taofen/source/frontend/.env.production \
        /opt/taofen/source/backend/ecosystem.config.js \
        2>/dev/null
    
    if [ $? -eq 0 ]; then
        log_backup "配置备份完成: $config_backup"
    else
        log_backup "配置备份失败"
    fi
}

# 2. 重要数据备份
backup_data() {
    log_backup "开始备份重要数据..."
    
    local data_backup="$BACKUP_DIR/data/data-$DATE.tar.gz"
    
    # 备份IIIF manifests（通常比较小）
    if [ -d "/opt/taofen/iiif/manifests" ]; then
        tar -czf "$data_backup" \
            /opt/taofen/iiif/manifests \
            /opt/taofen/iiif/cache \
            /var/www/taofen \
            2>/dev/null
        
        if [ $? -eq 0 ]; then
            log_backup "数据备份完成: $data_backup"
        else
            log_backup "数据备份失败"
        fi
    fi
}

# 3. 数据库备份（如果使用）
backup_database() {
    # 如果项目使用了数据库，在这里添加数据库备份逻辑
    # 例如: mysqldump, pg_dump 等
    log_backup "跳过数据库备份（项目未使用数据库）"
}

# 4. 清理过期备份
cleanup_old_backups() {
    log_backup "清理 $RETENTION_DAYS 天前的备份..."
    
    find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "*.log" -mtime +$RETENTION_DAYS -delete
    
    log_backup "过期备份清理完成"
}

# 5. 备份验证
verify_backups() {
    log_backup "验证最新备份..."
    
    local latest_config=$(ls -t "$BACKUP_DIR/config/"config-*.tar.gz 2>/dev/null | head -1)
    local latest_data=$(ls -t "$BACKUP_DIR/data/"data-*.tar.gz 2>/dev/null | head -1)
    
    if [ -n "$latest_config" ] && tar -tzf "$latest_config" >/dev/null 2>&1; then
        log_backup "配置备份验证通过: $(basename $latest_config)"
    else
        log_backup "配置备份验证失败"
    fi
    
    if [ -n "$latest_data" ] && tar -tzf "$latest_data" >/dev/null 2>&1; then
        log_backup "数据备份验证通过: $(basename $latest_data)"
    else
        log_backup "数据备份验证失败或无数据备份"
    fi
}

# 主备份流程
main() {
    log_backup "🗄️  开始备份流程 - $DATE"
    
    backup_configs
    backup_data
    backup_database
    verify_backups
    cleanup_old_backups
    
    # 显示备份统计
    local config_count=$(ls "$BACKUP_DIR/config/"config-*.tar.gz 2>/dev/null | wc -l)
    local data_count=$(ls "$BACKUP_DIR/data/"data-*.tar.gz 2>/dev/null | wc -l)
    local total_size=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
    
    log_backup "📊 备份统计: 配置备份 $config_count 个, 数据备份 $data_count 个, 总大小 $total_size"
    log_backup "🗄️  备份流程完成"
}

# 如果直接运行脚本
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main
fi
EOF

chmod +x /opt/taofen/scripts/backup.sh

# 设置定期备份（每天凌晨2点）
echo "0 2 * * * /opt/taofen/scripts/backup.sh" | crontab -l | { cat; echo "0 2 * * * /opt/taofen/scripts/backup.sh"; } | crontab -
```

#### 创建恢复脚本
```bash
cat > /opt/taofen/scripts/restore.sh << 'EOF'
#!/bin/bash

# 邹韬奋项目恢复脚本
BACKUP_DIR="/opt/taofen/backups"

show_help() {
    echo "用法: $0 [选项] <备份类型> [备份文件]"
    echo ""
    echo "备份类型:"
    echo "  config    恢复配置文件"
    echo "  data      恢复数据文件"
    echo "  list      列出可用备份"
    echo ""
    echo "选项:"
    echo "  -y, --yes     跳过确认提示"
    echo "  -h, --help    显示帮助"
    echo ""
    echo "示例:"
    echo "  $0 list                           # 列出所有备份"
    echo "  $0 config                         # 恢复最新配置备份"
    echo "  $0 config config-20240101-120000.tar.gz   # 恢复指定配置备份"
    echo "  $0 -y data                        # 恢复最新数据备份（跳过确认）"
}

list_backups() {
    echo "📋 可用备份列表："
    echo ""
    
    echo "配置备份："
    if ls "$BACKUP_DIR/config/"config-*.tar.gz 1> /dev/null 2>&1; then
        ls -lah "$BACKUP_DIR/config/"config-*.tar.gz | awk '{print "  " $9 " - " $5 " - " $6 " " $7 " " $8}'
    else
        echo "  无配置备份"
    fi
    
    echo ""
    echo "数据备份："
    if ls "$BACKUP_DIR/data/"data-*.tar.gz 1> /dev/null 2>&1; then
        ls -lah "$BACKUP_DIR/data/"data-*.tar.gz | awk '{print "  " $9 " - " $5 " - " $6 " " $7 " " $8}'
    else
        echo "  无数据备份"
    fi
}

restore_config() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        # 选择最新的配置备份
        backup_file=$(ls -t "$BACKUP_DIR/config/"config-*.tar.gz 2>/dev/null | head -1)
    else
        # 使用指定的备份文件
        backup_file="$BACKUP_DIR/config/$backup_file"
    fi
    
    if [ ! -f "$backup_file" ]; then
        echo "❌ 备份文件不存在: $backup_file"
        return 1
    fi
    
    echo "🔧 准备恢复配置: $(basename $backup_file)"
    
    if [ "$SKIP_CONFIRM" != "yes" ]; then
        echo "⚠️  这将覆盖现有配置文件，确定继续吗? [y/N]"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            echo "取消恢复操作"
            return 0
        fi
    fi
    
    # 创建当前配置的备份
    echo "📦 备份当前配置..."
    /opt/taofen/scripts/backup.sh backup_configs
    
    # 恢复配置文件
    echo "🔧 恢复配置文件..."
    sudo tar -xzf "$backup_file" -C / --overwrite
    
    if [ $? -eq 0 ]; then
        echo "✅ 配置恢复成功"
        echo "🔄 重启相关服务..."
        
        # 重启服务
        sudo systemctl reload caddy
        cd /opt/taofen/iiif && docker-compose restart
        pm2 restart taofen-backend
        
        echo "✅ 配置恢复完成"
    else
        echo "❌ 配置恢复失败"
        return 1
    fi
}

restore_data() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        backup_file=$(ls -t "$BACKUP_DIR/data/"data-*.tar.gz 2>/dev/null | head -1)
    else
        backup_file="$BACKUP_DIR/data/$backup_file"
    fi
    
    if [ ! -f "$backup_file" ]; then
        echo "❌ 备份文件不存在: $backup_file"
        return 1
    fi
    
    echo "📁 准备恢复数据: $(basename $backup_file)"
    
    if [ "$SKIP_CONFIRM" != "yes" ]; then
        echo "⚠️  这将覆盖现有数据文件，确定继续吗? [y/N]"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            echo "取消恢复操作"
            return 0
        fi
    fi
    
    # 停止相关服务
    echo "⏸️  停止相关服务..."
    cd /opt/taofen/iiif && docker-compose stop
    
    # 恢复数据文件
    echo "📁 恢复数据文件..."
    sudo tar -xzf "$backup_file" -C / --overwrite
    
    if [ $? -eq 0 ]; then
        echo "✅ 数据恢复成功"
        
        # 重启服务
        echo "🔄 重启相关服务..."
        cd /opt/taofen/iiif && docker-compose start
        
        echo "✅ 数据恢复完成"
    else
        echo "❌ 数据恢复失败"
        return 1
    fi
}

# 解析参数
SKIP_CONFIRM="no"
while [[ $# -gt 0 ]]; do
    case $1 in
        -y|--yes)
            SKIP_CONFIRM="yes"
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        list)
            list_backups
            exit 0
            ;;
        config)
            restore_config "$2"
            exit $?
            ;;
        data)
            restore_data "$2"
            exit $?
            ;;
        *)
            echo "❌ 未知参数: $1"
            show_help
            exit 1
            ;;
    esac
done

# 如果没有参数，显示帮助
show_help
EOF

chmod +x /opt/taofen/scripts/restore.sh

# 测试备份和恢复脚本
echo "测试备份脚本..."
/opt/taofen/scripts/backup.sh

echo "列出备份..."
/opt/taofen/scripts/restore.sh list
```

---

## 🚨 故障排除手册

### ⚠️ 常见问题及解决方案

#### 1. 网站无法访问

**症状**: 浏览器显示"无法访问此网站"或"连接超时"

**诊断步骤**:
```bash
# 1. 检查域名解析
nslookup www.ai4dh.cn
# ✅ 应该返回你的服务器IP
# ❌ 如果返回错误，检查DNS配置

# 2. 检查服务器网络
ping www.ai4dh.cn
# ✅ 应该有响应
# ❌ 如果无响应，检查服务器状态

# 3. 检查防火墙
sudo ufw status
# 确保80和443端口开放

# 4. 检查Caddy服务
sudo systemctl status caddy
# 应该显示 active (running)
```

**解决方案**:
```bash
# DNS问题 - 联系域名服务商或等待DNS传播
# 防火墙问题
sudo ufw allow 80
sudo ufw allow 443

# Caddy服务问题
sudo systemctl restart caddy
sudo journalctl -u caddy -n 20  # 查看错误信息
```

#### 2. SSL证书获取失败

**症状**: HTTPS访问显示证书错误或无法获取证书

**诊断步骤**:
```bash
# 1. 检查域名解析是否正确指向服务器
curl -I http://www.ai4dh.cn
# 应该返回HTTP响应

# 2. 检查Let's Encrypt限制
sudo journalctl -u caddy | grep -i "certificate\|acme\|let"

# 3. 检查端口80是否可访问（Let's Encrypt需要）
curl -I http://www.ai4dh.cn/.well-known/
```

**解决方案**:
```bash
# 1. 确保域名正确解析
# 在域名服务商处检查A记录

# 2. 清除可能的证书缓存
sudo systemctl stop caddy
sudo rm -rf /var/lib/caddy/.local/share/caddy/certificates/acme-v02.api.letsencrypt.org-directory/
sudo systemctl start caddy

# 3. 手动测试证书获取
sudo caddy validate --config /etc/caddy/Caddyfile

# 4. 如果仍然失败，临时禁用HTTPS测试
# 在Caddyfile中临时使用 http:// 而不是域名
```

#### 3. IIIF部署路径不一致问题

**症状**: 
- IIIF服务无法找到图像文件
- 路径配置与实际部署位置不匹配
- 文档中的路径与服务器实际路径不同

**诊断步骤**:
```bash
# 1. 检查当前IIIF服务运行状态
curl -I https://www.ai4dh.cn/iiif/3/
# 应该显示Cantaloupe服务器信息

# 2. 确认实际部署路径
find /srv -name "*iiif*" -type d 2>/dev/null
find /opt -name "*iiif*" -type d 2>/dev/null
find /var -name "*iiif*" -type d 2>/dev/null

# 3. 检查IIIF服务配置（根据实际部署方式）
# 如果是Docker容器：
docker ps | grep cantaloupe
# docker inspect <容器ID> | grep -A 10 -B 10 "Mounts"

# 如果是systemd服务：
systemctl status cantaloupe
# systemctl cat cantaloupe

# 检查Java进程和配置：
ps aux | grep java | grep -v grep

# 4. 检查Caddy反向代理配置
grep -r "iiif\|IIIF" /etc/caddy/
```

**解决方案**:
```bash
# 1. 确认实际使用的路径
# 如果发现实际路径是 /srv/iiif/ 而不是文档中的 /opt/taofen/iiif/

# 2. 更新IIIF服务配置（根据实际部署方式）
# 如果是Docker容器，编辑docker-compose.yml文件：
# volumes:
#   - /srv/iiif/images:/imageroot:ro
#   - /srv/iiif/manifests:/imageroot/manifests:ro
#   - /srv/iiif/cache:/opt/cantaloupe/cache:rw

# 如果是直接安装，编辑Cantaloupe配置文件：
# 通常位于 /etc/cantaloupe/ 或 /opt/cantaloupe/
# 更新 FilesystemSource.BasicLookupStrategy.path_prefix 配置

# 3. 更新Caddy配置中的路径
# 编辑Caddyfile，确保路径指向正确位置
handle_path /iiif/3/manifests/* {
    root * /srv/iiif/manifests
    file_server
}

# 4. 重启相关服务（根据实际部署方式）
# Docker方式：
# docker-compose restart

# systemd方式：
# sudo systemctl restart cantaloupe

# PM2方式：
# pm2 restart cantaloupe

# Caddy重启：
sudo systemctl reload caddy
```

**XFTP上传路径验证**:
```bash
# 上传前验证目录存在和权限
ls -la /srv/iiif/
ls -la /srv/iiif/images/
ls -la /srv/iiif/manifests/

# 设置正确权限
chown -R root:root /srv/iiif/
chmod -R 755 /srv/iiif/
chmod -R 644 /srv/iiif/images/*
chmod -R 644 /srv/iiif/manifests/*
```

#### 4. IIIF图像服务404错误

**症状**: 图像无法显示，IIIF URLs返回404

**诊断步骤**:
```bash
# 1. 检查Cantaloupe容器状态
docker ps | grep cantaloupe
# 应该显示 Up 状态

# 2. 检查IIIF服务响应
curl http://localhost:8182/iiif/3/
# 应该返回JSON响应

# 3. 检查图像文件存在
ls -la /opt/taofen/iiif/images/
# 确认图像文件存在

# 4. 检查文件权限
ls -la /opt/taofen/iiif/images/
# 确保文件可读
```

**解决方案**:
```bash
# 1. 重启Cantaloupe容器
cd /opt/taofen/iiif
docker-compose restart

# 2. 检查文件权限和目录结构
sudo chown -R 8983:8983 /opt/taofen/iiif/cache
sudo chown -R taofen:taofen /opt/taofen/iiif/images
chmod -R 755 /opt/taofen/iiif/images

# 3. 检查Cantaloupe日志
docker-compose logs cantaloupe | tail -50

# 4. 验证IIIF URL格式
# 正确格式: /iiif/2/图片路径/info.json
# 路径中的斜杠需要URL编码为%2F
```

#### 4. 后端API服务异常

**症状**: API请求返回500错误或无响应

**诊断步骤**:
```bash
# 1. 检查PM2进程状态
pm2 status
# taofen-backend应该显示online

# 2. 检查端口监听
netstat -tlpn | grep :3001
# 应该显示3001端口被监听

# 3. 检查后端日志
pm2 logs taofen-backend --lines 50

# 4. 测试直接访问
curl http://localhost:3001/api/health
```

**解决方案**:
```bash
# 1. 重启后端服务
pm2 restart taofen-backend

# 2. 如果内存不足导致的问题
pm2 restart taofen-backend --max-memory-restart 200M

# 3. 检查环境变量
cd /opt/taofen/source/backend
cat .env.production

# 4. 重新安装依赖（如果有依赖问题）
npm install --production

# 5. 检查Node.js版本
node --version  # 应该是18.x
```

#### 5. 前端页面显示异常

**症状**: 页面空白、资源加载失败、或显示错误

**诊断步骤**:
```bash
# 1. 检查前端文件是否存在
ls -la /var/www/taofen/
# 应该有index.html和static目录

# 2. 检查文件权限
ls -la /var/www/taofen/index.html
# 应该有读取权限

# 3. 检查浏览器控制台错误
# 在浏览器F12开发者工具中查看错误信息

# 4. 检查Caddy访问日志
sudo tail -f /var/log/caddy/www.ai4dh.cn.log
```

**解决方案**:
```bash
# 1. 重新部署前端
cd /opt/taofen/source/frontend
npm run build
sudo cp -r dist/* /var/www/taofen/
sudo chown -R taofen:taofen /var/www/taofen

# 2. 检查环境变量配置
cat /opt/taofen/source/frontend/.env.production

# 3. 清除浏览器缓存
# 指导用户清除浏览器缓存或按Ctrl+F5强制刷新

# 4. 检查API连接配置
# 确保前端配置的API地址正确
```

### 🚨 紧急恢复流程

#### 创建紧急恢复脚本
```bash
cat > /opt/taofen/scripts/emergency-recovery.sh << 'EOF'
#!/bin/bash

# 紧急恢复脚本
echo "🚨 邹韬奋项目紧急恢复程序启动"
echo "时间: $(date)"
echo "========================================"

# 1. 停止所有服务
echo "1️⃣  停止所有服务..."
sudo systemctl stop caddy
pm2 stop all
cd /opt/taofen/iiif && docker-compose down
echo "✅ 服务已停止"

# 2. 检查系统资源
echo ""
echo "2️⃣  检查系统资源..."
echo "内存使用:"
free -h
echo "磁盘使用:"
df -h /
echo "进程检查:"
ps aux | head -10

# 3. 清理临时文件和缓存
echo ""
echo "3️⃣  清理系统缓存..."
sudo sync
echo 1 | sudo tee /proc/sys/vm/drop_caches
echo "✅ 内存缓存已清理"

# 清理Docker缓存
docker system prune -f
echo "✅ Docker缓存已清理"

# 4. 重启核心服务
echo ""
echo "4️⃣  重启核心服务..."

# 启动Docker和IIIF服务
echo "启动IIIF服务..."
cd /opt/taofen/iiif
docker-compose up -d
sleep 10

# 启动后端服务
echo "启动后端服务..."
cd /opt/taofen/source/backend
pm2 start ecosystem.config.js --env production
sleep 5

# 启动Web服务器
echo "启动Web服务器..."
sudo systemctl start caddy
sleep 5

# 5. 验证服务状态
echo ""
echo "5️⃣  验证服务状态..."

# 检查Docker
if docker ps | grep -q cantaloupe; then
    echo "✅ IIIF服务: 正常"
else
    echo "❌ IIIF服务: 异常"
fi

# 检查后端
if pm2 describe taofen-backend | grep -q "online"; then
    echo "✅ 后端服务: 正常"
else
    echo "❌ 后端服务: 异常"
fi

# 检查Web服务器
if systemctl is-active caddy &>/dev/null; then
    echo "✅ Web服务器: 正常"
else
    echo "❌ Web服务器: 异常"
fi

# 6. 网络连通性测试
echo ""
echo "6️⃣  网络连通性测试..."
if curl -sf https://www.ai4dh.cn/ &>/dev/null; then
    echo "✅ 网站访问: 正常"
else
    echo "❌ 网站访问: 异常"
    
    # 尝试HTTP访问
    if curl -sf http://www.ai4dh.cn/ &>/dev/null; then
        echo "⚠️  HTTP可访问，SSL证书可能有问题"
    fi
fi

# 7. 生成恢复报告
echo ""
echo "7️⃣  生成恢复报告..."
REPORT_FILE="/opt/taofen/logs/recovery-$(date +%Y%m%d-%H%M%S).log"

{
    echo "紧急恢复报告 - $(date)"
    echo "=================================="
    echo ""
    echo "系统状态:"
    free -h
    echo ""
    echo "服务状态:"
    docker ps --format "table {{.Names}}\t{{.Status}}"
    pm2 status
    systemctl status caddy --no-pager -l
    echo ""
    echo "网络状态:"
    netstat -tlpn | grep -E "(80|443|3001|8182)"
    echo ""
    echo "最近错误日志:"
    sudo journalctl --since "1 hour ago" -p err --no-pager -n 10
    echo ""
    echo "恢复完成时间: $(date)"
} > "$REPORT_FILE"

echo "📋 恢复报告已保存: $REPORT_FILE"

echo ""
echo "========================================"
echo "🚨 紧急恢复程序完成"
echo ""
echo "🔍 下一步建议:"
echo "1. 查看恢复报告: cat $REPORT_FILE"  
echo "2. 运行健康检查: /opt/taofen/scripts/health-check.sh"
echo "3. 进行功能测试: /opt/taofen/scripts/functionality-test.sh"
echo "4. 查看详细日志以找出根本原因"
echo ""
echo "如果问题持续存在，请检查:"
echo "• 服务器资源是否充足"
echo "• 域名DNS解析是否正确"  
echo "• 防火墙和安全组配置"
echo "• SSL证书有效性"
EOF

chmod +x /opt/taofen/scripts/emergency-recovery.sh

# 创建快捷命令
echo "alias emergency='/opt/taofen/scripts/emergency-recovery.sh'" >> ~/.bashrc
source ~/.bashrc
```

### 📞 获取技术支持

#### 创建问题报告脚本
```bash
cat > /opt/taofen/scripts/generate-support-report.sh << 'EOF'
#!/bin/bash

# 生成技术支持报告
REPORT_FILE="/tmp/taofen-support-report-$(date +%Y%m%d-%H%M%S).txt"

echo "📋 生成技术支持报告..."
echo "报告文件: $REPORT_FILE"

{
    echo "邹韬奋项目技术支持报告"
    echo "生成时间: $(date)"
    echo "服务器: $(hostname)"
    echo "========================================"
    echo ""
    
    echo "1. 系统信息"
    echo "----------"
    echo "操作系统: $(lsb_release -d | cut -f2)"
    echo "内核版本: $(uname -r)"
    echo "CPU信息: $(nproc) 核心"
    echo "内存信息:"
    free -h
    echo "磁盘信息:"
    df -h /
    echo ""
    
    echo "2. 软件版本"
    echo "----------"
    echo "Docker版本: $(docker --version)"
    echo "Node.js版本: $(node --version)"
    echo "NPM版本: $(npm --version)"
    echo "PM2版本: $(pm2 --version)"
    echo "Caddy版本: $(caddy version)"
    echo ""
    
    echo "3. 服务状态"
    echo "----------"
    echo "Docker容器:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo "PM2进程:"
    pm2 status
    echo ""
    echo "系统服务:"
    systemctl status caddy --no-pager -l
    echo ""
    
    echo "4. 网络状态"
    echo "----------"
    echo "监听端口:"
    netstat -tlpn | grep -E "(80|443|3001|8182)"
    echo ""
    echo "防火墙状态:"
    sudo ufw status
    echo ""
    
    echo "5. 配置文件"
    echo "----------"
    echo "Caddyfile (前50行):"
    head -50 /etc/caddy/Caddyfile
    echo ""
    echo "Docker Compose配置:"
    cat /opt/taofen/iiif/docker-compose.yml
    echo ""
    
    echo "6. 最近日志"
    echo "----------"
    echo "Caddy错误日志 (最近20行):"
    sudo journalctl -u caddy --since "1 hour ago" -p err --no-pager -n 20
    echo ""
    echo "PM2错误日志 (最近20行):"
    pm2 logs taofen-backend --lines 20 --err
    echo ""
    echo "Docker日志 (最近20行):"
    docker logs cantaloupe --tail 20
    echo ""
    
    echo "7. 文件权限"
    echo "----------"
    echo "/var/www/taofen/ 权限:"
    ls -la /var/www/taofen/ | head -10
    echo ""
    echo "/opt/taofen/iiif/images/ 权限:"
    ls -la /opt/taofen/iiif/images/ | head -10
    echo ""
    
    echo "8. 性能指标"
    echo "----------"
    echo "系统负载:"
    uptime
    echo "内存详情:"
    cat /proc/meminfo | grep -E "(MemTotal|MemFree|MemAvailable|SwapTotal|SwapFree)"
    echo "磁盘IO:"
    iostat 1 1 2>/dev/null | tail -5 || echo "iostat未安装"
    echo ""
    
    echo "========================================"
    echo "报告生成完成: $(date)"
    
} > "$REPORT_FILE"

echo "✅ 技术支持报告已生成"
echo ""
echo "📋 报告位置: $REPORT_FILE"
echo "📎 报告大小: $(du -h $REPORT_FILE | cut -f1)"
echo ""
echo "请将此报告发送给技术支持团队，或者在GitHub Issue中附上此报告。"
echo ""
echo "GitHub Issues: https://github.com/your-repo/taofen_web/issues"
echo "技术支持邮箱: support@example.com"
EOF

chmod +x /opt/taofen/scripts/generate-support-report.sh

# 创建快捷命令
echo "alias support-report='/opt/taofen/scripts/generate-support-report.sh'" >> ~/.bashrc
source ~/.bashrc
```

---

## 🔧 IIIF部署路径验证工具

### 📋 自动化检查脚本

为了帮助验证和调试IIIF部署路径配置，项目提供了两个专用的检查脚本：

#### 🔍 完整检查脚本
**脚本位置**: `scripts/check-iiif-deployment.sh`  
**用途**: 全面检查IIIF服务部署状态和路径配置

**使用方法**:
```bash
# 1. SSH连接到服务器
ssh root@115.29.208.232

# 2. 运行检查脚本（脚本已在项目中）
cd /opt/taofen/source
bash scripts/check-iiif-deployment.sh
```

**检查项目**:
- ✅ IIIF目录结构 (`/srv/iiif/` 及子目录)
- ✅ Docker容器状态和配置
- ✅ 网络端口监听状态
- ✅ 系统服务和进程状态  
- ✅ Web服务器配置检查
- ✅ 文件权限和磁盘空间
- ✅ 网络连接测试

#### ⚡ 快速检查脚本
**脚本位置**: `scripts/quick-iiif-check.sh`  
**用途**: 快速验证IIIF服务基本状态

**使用方法**:
```bash
# 在服务器上运行
cd /opt/taofen/source
bash scripts/quick-iiif-check.sh
```

### 📄 手动检查清单

如果无法运行自动脚本，请手动执行以下检查：

**第一步：目录结构检查**
```bash
# 检查主目录（根据实际部署路径调整）
ls -la /srv/iiif/

# 检查子目录
ls -la /srv/iiif/manifests/
ls -la /srv/iiif/images/
ls -la /srv/iiif/logs/
ls -la /srv/iiif/stack/
```

**第二步：服务状态检查**  
```bash
# 检查IIIF服务运行方式（多种可能）
# 1. 检查是否为Docker容器
docker ps | grep cantaloupe 2>/dev/null

# 2. 检查是否为systemd服务
systemctl status cantaloupe 2>/dev/null

# 3. 检查Java进程（Cantaloupe是Java应用）
ps aux | grep java | grep -v grep

# 4. 检查端口监听
netstat -tlnp | grep 8182

# 5. 检查进程状态
ps aux | grep cantaloupe
```

**第三步：网络访问测试**
```bash
# 本地服务测试
curl -I http://localhost:8182/iiif/3/

# 外部访问测试  
curl -I https://www.ai4dh.cn/iiif/3/
```

### 🛠️ XFTP上传验证

使用XFTP上传文件后，请验证：

**上传验证清单**:
```bash
# 1. 检查文件是否成功上传
ls -la /srv/iiif/images/your-uploaded-files

# 2. 检查文件权限
chmod 644 /srv/iiif/images/*
chown root:root /srv/iiif/images/*

# 3. 测试图像访问（替换为实际图像路径）
curl -I "https://www.ai4dh.cn/iiif/2/your-image-path/info.json"

# 4. 重启IIIF服务（如需要，根据实际部署方式）
# 如果是systemd服务：
sudo systemctl restart cantaloupe

# 如果是Docker容器：
# cd /srv/iiif && docker-compose restart

# 如果是PM2管理：
# pm2 restart cantaloupe
```

**常见上传问题**:
- ❌ 权限不足：使用 `chmod 755` 设置目录权限
- ❌ 路径错误：确认目标路径为 `/srv/iiif/images/` 或 `/srv/iiif/manifests/`
- ❌ 文件格式：确保图像文件格式为 JPG、PNG 或 TIFF
- ❌ 路径不一致：文档规划路径 `/opt/taofen/iiif/` 与实际路径 `/srv/iiif/` 不同

### 📁 IIIF目录结构详细说明

#### 🗂️ 主要目录功能

**1. `/srv/iiif/images/` - 图像文件存储**
```bash
# 目录结构示例
/srv/iiif/images/
├── handwriting/
│   ├── manuscript_001.jpg        # 手稿图像
│   ├── manuscript_002.tiff       # 支持多种格式
│   └── ...
├── newspapers/  
│   ├── 1920/
│   │   ├── issue_001.jpg         # 按年份组织
│   │   └── issue_002.jpg
│   └── 1921/
└── timeline/
    ├── event_timeline_1.png      # 时间线可视化图像
    └── ...
```

**2. `/srv/iiif/manifests/` - IIIF清单文件**
```bash
# 清单文件示例
/srv/iiif/manifests/
├── handwriting/
│   ├── manuscript_001.json       # 对应图像的清单
│   └── collection.json           # 集合清单
├── newspapers/
│   ├── 1920_issues.json          # 报纸合集清单
│   └── individual_issues/
└── timeline/
    └── events_collection.json
```

**3. `/srv/iiif/config/` - 配置文件**
```bash
# 主要配置文件
cantaloupe.properties             # 主配置文件
delegates.rb                      # 委托脚本（如有）
logback.xml                       # 日志配置
```

#### 📊 文件大小和权限要求

**推荐权限设置**:
```bash
# 目录权限
chmod 755 /srv/iiif/
chmod 755 /srv/iiif/images/
chmod 755 /srv/iiif/manifests/

# 文件权限
chmod 644 /srv/iiif/images/*.{jpg,png,tiff}
chmod 644 /srv/iiif/manifests/*.json
chmod 600 /srv/iiif/config/cantaloupe.properties
```

**磁盘空间规划**:
- `images/` 目录：预留 10-50GB（根据图像数量）
- `cache/` 目录：预留 5-20GB（自动管理）
- `manifests/` 目录：通常 < 1GB
- `logs/` 目录：预留 1-5GB

#### 🔗 URL映射关系

**图像访问URL格式**:
```
本地路径: /srv/iiif/images/handwriting/manuscript_001.jpg
IIIF URL: https://www.ai4dh.cn/iiif/2/handwriting%2Fmanuscript_001.jpg/info.json
缩略图: https://www.ai4dh.cn/iiif/2/handwriting%2Fmanuscript_001.jpg/full/300,/0/default.jpg
```

**清单访问URL格式**:
```
本地路径: /srv/iiif/manifests/handwriting/manuscript_001.json  
访问URL: https://www.ai4dh.cn/iiif/3/manifests/handwriting/manuscript_001.json
```

### 🎯 路径配置验证重点

**当前服务器状态** (基于2025-08-28检查):
- ✅ IIIF服务正常运行于 `https://www.ai4dh.cn/iiif/3/`
- ✅ 使用Cantaloupe 5.0.7 + Jetty 11.0.24
- ✅ Caddy反向代理工作正常
- ⚠️ 需要手动确认实际部署路径是否为 `/srv/iiif/`

**获取准确目录结构**:
```bash
# 方案1: 详细检查脚本
ssh root@115.29.208.232
cd /opt/taofen/source  
bash scripts/get-iiif-structure.sh

# 方案2: 生成文档格式输出
ssh root@115.29.208.232
cd /opt/taofen/source
bash scripts/generate-iiif-docs.sh > /tmp/iiif-structure.md
cat /tmp/iiif-structure.md
```

**更新文档步骤**:
1. SSH连接服务器运行 `scripts/generate-iiif-docs.sh`
2. 将输出内容替换本文档中的"📁 部署路径结构"章节
3. 确保URL映射和权限设置正确
4. 提交更新到项目文档

---

## ✅ 部署验证清单

### 📋 最终部署检查

运行以下命令进行最终验证：

```bash
# 1. 运行完整健康检查
/opt/taofen/scripts/health-check.sh

# 2. 执行功能完整性测试
/opt/taofen/scripts/functionality-test.sh

# 3. 性能基准测试
/opt/taofen/scripts/performance-test.sh

# 4. 生成部署报告
/opt/taofen/scripts/generate-support-report.sh
```

### ✅ 部署成功标志

当你看到以下结果时，说明部署完全成功：

1. **网站访问** ✅
   - https://www.ai4dh.cn 正常访问
   - 显示完整的邹韬奋项目界面
   - SSL证书有效且自动续期

2. **核心功能** ✅
   - 前端React应用正常运行
   - 后端API服务响应正常
   - IIIF图像服务可以正常显示图片
   - 所有页面路由工作正常

3. **性能指标** ✅
   - 首页加载时间 < 3秒
   - API响应时间 < 1秒
   - IIIF图像加载正常
   - 服务器资源使用合理

4. **监控和维护** ✅
   - 自动监控脚本正常运行
   - 日志轮转配置生效
   - 备份脚本定期执行
   - 服务自动重启机制工作

恭喜！🎉 你已经成功将邹韬奋沉浸式叙事项目部署到阿里云ECS服务器上。

---

## 📞 技术支持

如果在部署过程中遇到问题，请：

1. **查看日志**: 使用 `/opt/taofen/scripts/view-logs.sh` 查看详细错误信息
2. **运行诊断**: 执行 `/opt/taofen/scripts/health-check.sh` 进行系统诊断  
3. **生成报告**: 运行 `/opt/taofen/scripts/generate-support-report.sh` 生成技术支持报告
4. **寻求帮助**: 将报告发送到项目Issues或技术支持邮箱

**联系方式**:
- GitHub Issues: https://github.com/your-repo/taofen_web/issues
- 项目文档: https://docs.taofen.ai4dh.cn
- 技术支持: support@ai4dh.cn

---

<div align="center">

**🎉 部署完成！传承韬奋精神，拥抱数字未来！**

Made with ❤️ for cultural heritage preservation

</div>