# 邹韬奋项目阿里云ECS部署完整教程

## 📋 部署前准备

### 服务器要求检查

**最低硬件要求：**
- CPU: 2核心
- 内存: 2GB (推荐4GB)
- 存储: 40GB SSD
- 网络: 1Mbps带宽

**操作系统要求：**
- Ubuntu 20.04 LTS 或更高版本
- CentOS 8 或更高版本

**阿里云ECS实例选择建议：**
```
实例规格: ecs.t5-lc1m2.small (2核2GB)
系统盘: 40GB 高效云盘
网络: 专有网络VPC
安全组: 开放22, 80, 443端口
```

### 本地开发环境准备

**必需工具：**
1. SSH客户端 (Windows推荐PuTTY或MobaXterm)
2. 代码编辑器 (VS Code)
3. Git客户端

**项目代码准备：**
```bash
# 本地克隆项目代码
git clone https://github.com/your-repo/taofen_web.git
cd taofen_web

# 检查项目结构
ls -la
```

预期输出：
```
drwxr-xr-x  backend/
drwxr-xr-x  frontend/
drwxr-xr-x  scripts/
drwxr-xr-x  docs/
-rw-r--r--  package.json
-rw-r--r--  docker-compose.yml
```

### 域名和DNS配置

**域名解析设置：**
```
主域名: yourdomain.com → 服务器IP
CNAME: www.yourdomain.com → yourdomain.com
```

**阿里云DNS解析设置：**
1. 登录阿里云控制台
2. 进入域名解析DNS
3. 添加A记录：
   - 记录类型：A
   - 主机记录：@
   - 记录值：你的ECS公网IP

## 🚀 服务器基础环境搭建

### SSH连接和安全配置

**连接服务器：**
```bash
# 使用SSH连接服务器
ssh root@你的服务器IP

# 或使用密钥文件
ssh -i /path/to/your-key.pem root@你的服务器IP
```

**更新系统：**
```bash
# Ubuntu系统
sudo apt update && sudo apt upgrade -y

# CentOS系统
sudo yum update -y
```

**创建非root用户：**
```bash
# 创建新用户
sudo useradd -m -s /bin/bash taofen
sudo usermod -aG sudo taofen

# 设置密码
sudo passwd taofen

# 切换到新用户
su - taofen
```

**配置SSH安全：**
```bash
# 编辑SSH配置
sudo nano /etc/ssh/sshd_config

# 修改以下配置：
Port 22
PermitRootLogin no
PasswordAuthentication yes
PubkeyAuthentication yes

# 重启SSH服务
sudo systemctl restart sshd
```

**配置防火墙：**
```bash
# Ubuntu (UFW)
sudo ufw enable
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 8080
sudo ufw allow 8182
sudo ufw status

# CentOS (firewalld)
sudo systemctl start firewalld
sudo systemctl enable firewalld
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --permanent --add-port=8182/tcp
sudo firewall-cmd --reload
```

### Docker环境安装

**安装Docker：**
```bash
# Ubuntu系统
# 移除旧版本
sudo apt-get remove docker docker-engine docker.io containerd runc

# 安装依赖
sudo apt-get update
sudo apt-get install -y \
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

# 安装Docker CE
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io
```

**验证Docker安装：**
```bash
# 启动Docker服务
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
sudo docker --version
sudo docker run hello-world
```

预期输出：
```
Docker version 20.10.x, build xxxxx
Hello from Docker!
```

**安装Docker Compose：**
```bash
# 下载Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 设置执行权限
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker-compose --version
```

**配置Docker用户权限：**
```bash
# 添加用户到docker组
sudo usermod -aG docker $USER

# 重新登录或执行
newgrp docker

# 验证权限
docker run hello-world
```

### 项目目录结构创建

**创建项目目录：**
```bash
# 创建主目录
sudo mkdir -p /opt/taofen
sudo chown -R taofen:taofen /opt/taofen
cd /opt/taofen

# 创建子目录
mkdir -p {backend,frontend,iiif,caddy,logs,data}

# 查看目录结构
tree -L 2
```

预期输出：
```
/opt/taofen
├── backend/
├── frontend/
├── iiif/
├── caddy/
├── logs/
└── data/
```

## 🏗️ IIIF图像服务部署

### Cantaloupe配置优化

**创建Cantaloupe配置目录：**
```bash
cd /opt/taofen/iiif
mkdir -p {config,images,cache,logs}
```

**创建优化的cantaloupe.properties配置：**
```bash
cat > config/cantaloupe.properties << 'EOF'
# HTTP配置
http.enabled = true
http.host = 0.0.0.0
http.port = 8182
http.http2.enabled = false

# HTTPS配置
https.enabled = false

# Base URI
base_uri = 
print_stack_trace_on_error_pages = false

# 源配置
source.static = FilesystemSource
FilesystemSource.lookup_strategy = BasicLookupStrategy
FilesystemSource.BasicLookupStrategy.path_prefix = /imageroot/
FilesystemSource.BasicLookupStrategy.path_suffix = 

# 处理器配置
processor.selection_strategy = AutomaticSelectionStrategy
processor.fallback = Java2dProcessor

# 缓存配置
cache.server.enabled = true
cache.server = FilesystemCache
FilesystemCache.pathname = /var/cache/cantaloupe
cache.server.worker.enabled = true
cache.server.worker.interval = 3600

# 客户端缓存
cache.client.enabled = true
cache.client.max_age = 2592000
cache.client.shared_max_age = 2592000
cache.client.public = true
cache.client.private = false
cache.client.no_cache = false
cache.client.no_store = false
cache.client.must_revalidate = false
cache.client.proxy_revalidate = false
cache.client.no_transform = true

# 内存管理(针对2GB服务器优化)
max_pixels = 400000000
max_scale = 5.0

# 日志配置
log.application.level = warn
log.application.ConsoleAppender.enabled = true
log.application.FileAppender.enabled = true
log.application.FileAppender.pathname = /var/log/cantaloupe/application.log
log.application.RollingFileAppender.enabled = false

# 安全配置
print_stack_trace_on_error_pages = false
EOF
```

**创建Docker Compose配置：**
```bash
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  cantaloupe:
    image: uclalibrary/cantaloupe:5.0.5
    container_name: taofen-iiif
    ports:
      - "8182:8182"
    volumes:
      - ./config/cantaloupe.properties:/etc/cantaloupe/cantaloupe.properties:ro
      - ./images:/imageroot:ro
      - ./cache:/var/cache/cantaloupe
      - ./logs:/var/log/cantaloupe
    environment:
      - JAVA_OPTS=-Xms128m -Xmx512m -Djava.awt.headless=true
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8182/iiif/2/"]
      interval: 30s
      timeout: 10s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
EOF
```

**启动IIIF服务：**
```bash
# 创建必要的目录权限
sudo chown -R 8983:8983 cache logs

# 启动服务
docker-compose up -d

# 检查服务状态
docker-compose ps
docker-compose logs cantaloupe
```

预期输出：
```
Name                State   Ports
taofen-iiif         Up      0.0.0.0:8182->8182/tcp
```

### 图像数据上传和组织

**准备图像目录结构：**
```bash
cd /opt/taofen/iiif/images

# 创建按类型分类的目录
mkdir -p {handwriting,newspapers,relationships,timeline}

# 设置权限
sudo chown -R taofen:taofen .
```

**上传图像文件：**
```bash
# 使用scp上传图像文件
scp -r /local/path/to/images/* taofen@your-server:/opt/taofen/iiif/images/

# 或使用rsync
rsync -avz /local/path/to/images/ taofen@your-server:/opt/taofen/iiif/images/
```

**验证IIIF服务：**
```bash
# 测试IIIF信息端点
curl -s http://localhost:8182/iiif/2/ | jq .

# 测试具体图像(假设有test.jpg)
curl -I http://localhost:8182/iiif/2/handwriting%2Ftest.jpg/info.json
```

预期输出应包含IIIF图像信息JSON。

## 💻 前端应用构建和部署

### 项目代码上传

**上传前端代码：**
```bash
cd /opt/taofen
git clone https://github.com/your-repo/taofen_web.git temp_repo
cp -r temp_repo/frontend/* frontend/
rm -rf temp_repo

# 或使用scp直接上传
scp -r /local/path/taofen_web/frontend/* taofen@your-server:/opt/taofen/frontend/
```

### Node.js环境配置

**安装Node.js：**
```bash
# 使用NodeSource仓库安装Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

预期输出：
```
v18.x.x
9.x.x
```

### 生产环境构建

**安装依赖并构建：**
```bash
cd /opt/taofen/frontend

# 创建生产环境配置
cat > .env.production << 'EOF'
VITE_API_BASE_URL=https://yourdomain.com/api
VITE_IIIF_BASE_URL=https://yourdomain.com/iiif
VITE_APP_TITLE=邹韬奋数字人文项目
VITE_ENVIRONMENT=production
EOF

# 安装依赖
npm ci --only=production

# 构建生产版本
npm run build

# 检查构建结果
ls -la dist/
```

预期输出：
```
drwxr-xr-x  assets/
-rw-r--r--  index.html
-rw-r--r--  manifest.json
```

**构建优化检查：**
```bash
# 检查构建大小
du -sh dist/
find dist/ -name "*.js" -exec ls -lh {} \; | head -10

# 检查是否包含source maps(生产环境不应有)
find dist/ -name "*.map" | wc -l
```

### 静态文件部署

**创建静态文件服务目录：**
```bash
sudo mkdir -p /var/www/taofen
sudo cp -r dist/* /var/www/taofen/
sudo chown -R www-data:www-data /var/www/taofen
sudo chmod -R 755 /var/www/taofen
```

## 🔧 后端API服务部署

### 项目代码准备

**部署后端代码：**
```bash
cd /opt/taofen
cp -r temp_repo/backend/* backend/
cd backend

# 安装生产依赖
npm ci --only=production
```

**创建生产环境配置：**
```bash
cat > .env.production << 'EOF'
NODE_ENV=production
PORT=8080
CORS_ORIGIN=https://yourdomain.com
IIIF_BASE_URL=https://yourdomain.com/iiif

# 数据库配置(如果需要)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=taofen
DB_USER=taofen
DB_PASS=your_secure_password

# 会话密钥
SESSION_SECRET=your_very_secure_session_secret_key_here_make_it_long_and_random

# 日志级别
LOG_LEVEL=info
LOG_FILE=/opt/taofen/logs/backend.log
EOF

chmod 600 .env.production
```

### PM2进程管理安装配置

**安装PM2：**
```bash
sudo npm install -g pm2

# 验证安装
pm2 --version
```

**创建PM2配置文件：**
```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'taofen-backend',
    script: './server.js',
    cwd: '/opt/taofen/backend',
    env_production: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '512M',
    error_file: '/opt/taofen/logs/backend-error.log',
    out_file: '/opt/taofen/logs/backend-out.log',
    log_file: '/opt/taofen/logs/backend.log',
    time: true,
    autorestart: true,
    max_restarts: 5,
    min_uptime: '10s',
    restart_delay: 4000,
    env: {
      NODE_ENV: 'production'
    }
  }],

  deploy: {
    production: {
      user: 'taofen',
      host: 'localhost',
      ref: 'origin/master',
      repo: 'git@github.com:your-repo/taofen_web.git',
      path: '/opt/taofen',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
EOF
```

**启动后端服务：**
```bash
# 启动应用
pm2 start ecosystem.config.js --env production

# 保存PM2配置
pm2 save

# 设置开机自启
pm2 startup
# 按提示执行返回的sudo命令

# 检查服务状态
pm2 status
pm2 logs taofen-backend
```

预期输出：
```
┌─────┬──────────────────┬─────────────┬─────────┬─────────┬──────────┐
│ id  │ name             │ namespace   │ version │ mode    │ pid      │
├─────┼──────────────────┼─────────────┼─────────┼─────────┼──────────┤
│ 0   │ taofen-backend   │ default     │ 1.0.0   │ fork    │ 1234     │
└─────┴──────────────────┴─────────────┴─────────┴─────────┴──────────┘
```

**测试后端API：**
```bash
# 测试健康检查端点
curl -s http://localhost:8080/api/health | jq .

# 测试具体API端点
curl -s http://localhost:8080/api/handwriting?limit=5 | jq .
```

## 🌐 Caddy Web服务器配置

### 安装Caddy

**安装Caddy服务器：**
```bash
# 添加Caddy官方仓库
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list

# 安装Caddy
sudo apt update
sudo apt install caddy

# 验证安装
caddy version
```

### 完整Caddyfile配置

**创建Caddyfile配置：**
```bash
sudo nano /etc/caddy/Caddyfile
```

**完整的Caddyfile内容：**
```
# 邹韬奋项目 Caddyfile 配置
# 主域名配置

yourdomain.com, www.yourdomain.com {
    # 启用压缩
    encode gzip zstd

    # 安全头
    header {
        # HSTS
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        # 内容安全策略
        Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-src 'self'; object-src 'none'; base-uri 'self';"
        # 其他安全头
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "camera=(), microphone=(), location=()"
        # 移除服务器信息
        -Server
    }

    # API 路由 - 代理到后端服务
    handle_path /api/* {
        reverse_proxy localhost:8080 {
            # 健康检查
            health_uri /api/health
            health_interval 30s
            health_timeout 5s
            
            # 请求头传递
            header_up Host {http.reverse_proxy.upstream.hostport}
            header_up X-Real-IP {http.request.remote.host}
            header_up X-Forwarded-For {http.request.remote.host}
            header_up X-Forwarded-Proto {http.request.scheme}
            header_up X-Forwarded-Host {http.request.host}
            
            # 错误处理
            fail_duration 30s
            max_fails 3
            unhealthy_status 5xx
            unhealthy_latency 10s
            
            # 响应缓存
            @cacheable method GET HEAD
            header @cacheable Cache-Control "public, max-age=300"
        }
    }

    # IIIF 图像服务 - 代理到Cantaloupe
    handle_path /iiif/* {
        reverse_proxy localhost:8182 {
            # IIIF健康检查
            health_uri /iiif/2/
            health_interval 60s
            health_timeout 10s
            
            # 请求头传递
            header_up Host {http.reverse_proxy.upstream.hostport}
            header_up X-Real-IP {http.request.remote.host}
            header_up X-Forwarded-For {http.request.remote.host}
            header_up X-Forwarded-Proto {http.request.scheme}
            header_up X-Forwarded-Host {http.request.host}
            
            # IIIF特定头
            header_up Accept-Encoding identity
            header_down Access-Control-Allow-Origin *
            header_down Access-Control-Allow-Methods "GET, OPTIONS"
            header_down Access-Control-Allow-Headers "Content-Type, Authorization"
            
            # 错误处理
            fail_duration 60s
            max_fails 2
            unhealthy_status 5xx
            unhealthy_latency 15s
            
            # 缓存设置 - IIIF资源缓存时间较长
            @iiif_images path *.jpg *.jpeg *.png *.tiff *.tif
            @iiif_info path */info.json
            header @iiif_images Cache-Control "public, max-age=86400"
            header @iiif_info Cache-Control "public, max-age=3600"
        }
        
        # CORS预检请求处理
        @options method OPTIONS
        respond @options 204 {
            header Access-Control-Allow-Origin *
            header Access-Control-Allow-Methods "GET, OPTIONS"
            header Access-Control-Allow-Headers "Content-Type, Authorization"
            header Access-Control-Max-Age 86400
        }
    }

    # 静态资源处理
    handle_path /assets/* {
        root * /var/www/taofen
        file_server {
            precompressed gzip br
        }
        
        # 静态资源长期缓存
        header Cache-Control "public, max-age=31536000, immutable"
        header Vary "Accept-Encoding"
    }

    # manifest.json 和其他根级文件
    handle /manifest.json {
        root * /var/www/taofen
        file_server
        header Cache-Control "public, max-age=86400"
    }

    handle /favicon.ico {
        root * /var/www/taofen
        file_server
        header Cache-Control "public, max-age=86400"
    }

    handle /robots.txt {
        root * /var/www/taofen
        file_server
        header Cache-Control "public, max-age=86400"
    }

    # SPA路由处理 - 所有其他请求返回index.html
    handle {
        root * /var/www/taofen
        try_files {path} /index.html
        file_server
        
        # HTML文件缓存策略
        @html path *.html
        header @html Cache-Control "public, max-age=3600, must-revalidate"
        header @html Vary "Accept-Encoding"
    }

    # 访问日志
    log {
        output file /var/log/caddy/access.log {
            roll_size 100MiB
            roll_keep 5
        }
        format json {
            time_format "2006-01-02T15:04:05Z07:00"
        }
        level INFO
    }

    # 错误日志
    handle_errors {
        respond "服务暂时不可用，请稍后重试" 503
    }
}

# 开发和测试域名配置（可选）
test.yourdomain.com {
    reverse_proxy localhost:5173
}

# HTTP重定向到HTTPS（自动处理）
# Caddy会自动重定向HTTP到HTTPS

# 全局配置
{
    # 邮箱用于Let's Encrypt证书
    email your-email@yourdomain.com
    
    # 管理端口
    admin localhost:2019
    
    # 全局日志
    log {
        level INFO
    }
    
    # 服务器配置
    servers {
        metrics
    }
    
    # 自动HTTPS
    auto_https on
    
    # OCSP装订
    ocsp_stapling on
}
```

**验证配置文件：**
```bash
# 检查配置语法
sudo caddy validate --config /etc/caddy/Caddyfile

# 格式化配置文件
sudo caddy fmt --overwrite /etc/caddy/Caddyfile
```

### SSL证书自动获取

**启动Caddy服务：**
```bash
# 启动Caddy
sudo systemctl start caddy
sudo systemctl enable caddy

# 检查服务状态
sudo systemctl status caddy

# 查看日志
sudo journalctl -u caddy -f
```

**验证SSL证书：**
```bash
# 检查证书状态
curl -I https://yourdomain.com

# 使用openssl检查证书详情
echo | openssl s_client -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

预期输出应显示Let's Encrypt证书，有效期约3个月。

## 🔍 部署验证和测试

### 服务健康检查

**创建健康检查脚本：**
```bash
cat > /opt/taofen/scripts/health-check.sh << 'EOF'
#!/bin/bash

# 健康检查脚本
echo "=== 邹韬奋项目健康检查 $(date) ==="

# 检查服务状态
echo "1. 检查服务状态..."
echo "- Caddy: $(sudo systemctl is-active caddy)"
echo "- Docker: $(sudo systemctl is-active docker)"
echo "- PM2 Backend: $(pm2 jlist | jq -r '.[0].pm2_env.status' 2>/dev/null || echo 'unknown')"

# 检查端口监听
echo ""
echo "2. 检查端口监听..."
netstat -tlpn | grep -E ':80|:443|:8080|:8182' | while read line; do
    echo "- $line"
done

# 检查HTTP响应
echo ""
echo "3. 检查HTTP响应..."

# 检查主页
MAIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/)
echo "- 主页响应: $MAIN_STATUS"

# 检查API健康
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/health)
echo "- API健康检查: $API_STATUS"

# 检查IIIF服务
IIIF_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8182/iiif/2/)
echo "- IIIF服务: $IIIF_STATUS"

# 检查HTTPS
if command -v dig >/dev/null; then
    PUBLIC_IP=$(dig +short myip.opendns.com @resolver1.opendns.com)
    echo "- 公网IP: $PUBLIC_IP"
fi

# 检查磁盘空间
echo ""
echo "4. 系统资源..."
df -h / | tail -1 | while read fs size used avail percent mount; do
    echo "- 磁盘使用: $used/$size ($percent)"
done

# 检查内存使用
free -h | grep Mem: | while read mem total used free shared buff cache available; do
    echo "- 内存使用: $used/$total"
done

# 检查CPU负载
echo "- CPU负载: $(uptime | awk -F'load average:' '{print $2}')"

echo ""
echo "=== 健康检查完成 ==="
EOF

chmod +x /opt/taofen/scripts/health-check.sh
```

**运行健康检查：**
```bash
/opt/taofen/scripts/health-check.sh
```

预期输出示例：
```
=== 邹韬奋项目健康检查 2024-01-01 10:00:00 ===
1. 检查服务状态...
- Caddy: active
- Docker: active
- PM2 Backend: online

2. 检查端口监听...
- tcp  0.0.0.0:80   LISTEN  12345/caddy
- tcp  0.0.0.0:443  LISTEN  12345/caddy
- tcp  127.0.0.1:8080  LISTEN  23456/node
- tcp  0.0.0.0:8182  LISTEN  34567/docker-proxy

3. 检查HTTP响应...
- 主页响应: 200
- API健康检查: 200
- IIIF服务: 200
```

### 功能完整性测试

**创建功能测试脚本：**
```bash
cat > /opt/taofen/scripts/functionality-test.sh << 'EOF'
#!/bin/bash

BASE_URL="https://yourdomain.com"
API_URL="$BASE_URL/api"
IIIF_URL="$BASE_URL/iiif"

echo "=== 功能完整性测试 $(date) ==="

# 测试前端页面
echo "1. 测试前端页面..."
FRONTEND_TEST=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL)
echo "- 主页状态: $FRONTEND_TEST"

# 测试API端点
echo ""
echo "2. 测试API端点..."

# 测试健康检查
HEALTH_TEST=$(curl -s -w "%{http_code}" $API_URL/health -o /dev/null)
echo "- 健康检查: $HEALTH_TEST"

# 测试数据API
HANDWRITING_TEST=$(curl -s -w "%{http_code}" "$API_URL/handwriting?limit=1" -o /dev/null)
echo "- 手稿数据: $HANDWRITING_TEST"

NEWSPAPERS_TEST=$(curl -s -w "%{http_code}" "$API_URL/newspapers?limit=1" -o /dev/null)
echo "- 报纸数据: $NEWSPAPERS_TEST"

RELATIONSHIPS_TEST=$(curl -s -w "%{http_code}" "$API_URL/relationships?limit=1" -o /dev/null)
echo "- 关系数据: $RELATIONSHIPS_TEST"

TIMELINE_TEST=$(curl -s -w "%{http_code}" "$API_URL/timeline?limit=1" -o /dev/null)
echo "- 时间线数据: $TIMELINE_TEST"

# 测试IIIF服务
echo ""
echo "3. 测试IIIF服务..."
IIIF_INFO_TEST=$(curl -s -w "%{http_code}" "$IIIF_URL/2/" -o /dev/null)
echo "- IIIF信息端点: $IIIF_INFO_TEST"

# 如果有测试图像，测试图像API
if [ ! -z "$TEST_IMAGE" ]; then
    IIIF_IMAGE_TEST=$(curl -s -w "%{http_code}" "$IIIF_URL/2/$TEST_IMAGE/info.json" -o /dev/null)
    echo "- IIIF图像信息: $IIIF_IMAGE_TEST"
fi

# 测试静态资源
echo ""
echo "4. 测试静态资源..."
ASSETS_TEST=$(curl -s -w "%{http_code}" "$BASE_URL/favicon.ico" -o /dev/null)
echo "- Favicon: $ASSETS_TEST"

MANIFEST_TEST=$(curl -s -w "%{http_code}" "$BASE_URL/manifest.json" -o /dev/null)
echo "- Manifest: $MANIFEST_TEST"

echo ""
echo "=== 功能测试完成 ==="
EOF

chmod +x /opt/taofen/scripts/functionality-test.sh
```

**运行功能测试：**
```bash
/opt/taofen/scripts/functionality-test.sh
```

### 性能基准测试

**安装性能测试工具：**
```bash
# 安装Apache Benchmark
sudo apt install apache2-utils

# 安装wrk (可选)
sudo apt install wrk
```

**创建性能测试脚本：**
```bash
cat > /opt/taofen/scripts/performance-test.sh << 'EOF'
#!/bin/bash

BASE_URL="https://yourdomain.com"
TEST_DURATION=10
CONCURRENT_USERS=5

echo "=== 性能基准测试 $(date) ==="
echo "测试参数: $CONCURRENT_USERS 并发用户, $TEST_DURATION 秒"
echo ""

# 测试主页
echo "1. 主页性能测试..."
ab -n 50 -c $CONCURRENT_USERS -t $TEST_DURATION $BASE_URL/ | grep -E "Requests per second|Time per request|Transfer rate"

# 测试API
echo ""
echo "2. API性能测试..."
ab -n 50 -c $CONCURRENT_USERS -t $TEST_DURATION $BASE_URL/api/handwriting?limit=10 | grep -E "Requests per second|Time per request|Transfer rate"

# 测试IIIF
echo ""
echo "3. IIIF性能测试..."
ab -n 20 -c 2 -t $TEST_DURATION $BASE_URL/iiif/2/ | grep -E "Requests per second|Time per request|Transfer rate"

echo ""
echo "=== 性能测试完成 ==="
EOF

chmod +x /opt/taofen/scripts/performance-test.sh
```

## 📊 监控和维护

### 日志管理

**创建日志管理脚本：**
```bash
cat > /opt/taofen/scripts/log-manager.sh << 'EOF'
#!/bin/bash

LOG_RETENTION_DAYS=30
LOG_DIR="/opt/taofen/logs"
CADDY_LOG_DIR="/var/log/caddy"

echo "=== 日志管理 $(date) ==="

# 清理旧日志
echo "清理 $LOG_RETENTION_DAYS 天前的日志..."

# 清理应用日志
find $LOG_DIR -name "*.log" -type f -mtime +$LOG_RETENTION_DAYS -delete
find $LOG_DIR -name "*.log.*" -type f -mtime +$LOG_RETENTION_DAYS -delete

# 清理Caddy日志
sudo find $CADDY_LOG_DIR -name "*.log" -type f -mtime +$LOG_RETENTION_DAYS -delete

# 压缩较旧的日志
find $LOG_DIR -name "*.log" -type f -mtime +7 -exec gzip {} \;

# 显示当前日志大小
echo ""
echo "当前日志大小:"
du -sh $LOG_DIR
sudo du -sh $CADDY_LOG_DIR

echo ""
echo "=== 日志管理完成 ==="
EOF

chmod +x /opt/taofen/scripts/log-manager.sh
```

**设置日志轮转：**
```bash
# 创建logrotate配置
sudo cat > /etc/logrotate.d/taofen << 'EOF'
/opt/taofen/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    copytruncate
    create 0644 taofen taofen
}

/var/log/caddy/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    copytruncate
    create 0644 caddy caddy
    postrotate
        systemctl reload caddy
    endscript
}
EOF

# 测试logrotate配置
sudo logrotate -d /etc/logrotate.d/taofen
```

### 性能监控

**创建监控脚本：**
```bash
cat > /opt/taofen/scripts/monitor.sh << 'EOF'
#!/bin/bash

ALERT_EMAIL="admin@yourdomain.com"
ALERT_THRESHOLD_CPU=80
ALERT_THRESHOLD_MEMORY=85
ALERT_THRESHOLD_DISK=90

# 获取系统状态
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1 | cut -d'u' -f1)
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | cut -d'%' -f1)

# 检查服务状态
CADDY_STATUS=$(systemctl is-active caddy)
DOCKER_STATUS=$(systemctl is-active docker)
BACKEND_STATUS=$(pm2 jlist | jq -r '.[0].pm2_env.status' 2>/dev/null)

# 记录监控数据
MONITOR_LOG="/opt/taofen/logs/monitor.log"
echo "$(date '+%Y-%m-%d %H:%M:%S'),CPU:$CPU_USAGE%,Memory:$MEMORY_USAGE%,Disk:$DISK_USAGE%,Caddy:$CADDY_STATUS,Docker:$DOCKER_STATUS,Backend:$BACKEND_STATUS" >> $MONITOR_LOG

# 检查阈值并发送告警
send_alert() {
    local subject="$1"
    local message="$2"
    echo "$message" | mail -s "$subject" $ALERT_EMAIL 2>/dev/null || echo "Alert: $subject - $message" >> /opt/taofen/logs/alerts.log
}

# CPU使用率告警
if (( $(echo "$CPU_USAGE > $ALERT_THRESHOLD_CPU" | bc -l) )); then
    send_alert "CPU使用率过高" "CPU使用率: $CPU_USAGE%"
fi

# 内存使用率告警
if [ $MEMORY_USAGE -gt $ALERT_THRESHOLD_MEMORY ]; then
    send_alert "内存使用率过高" "内存使用率: $MEMORY_USAGE%"
fi

# 磁盘使用率告警
if [ $DISK_USAGE -gt $ALERT_THRESHOLD_DISK ]; then
    send_alert "磁盘使用率过高" "磁盘使用率: $DISK_USAGE%"
fi

# 服务状态告警
if [ "$CADDY_STATUS" != "active" ]; then
    send_alert "Caddy服务异常" "Caddy状态: $CADDY_STATUS"
fi

if [ "$DOCKER_STATUS" != "active" ]; then
    send_alert "Docker服务异常" "Docker状态: $DOCKER_STATUS"
fi

if [ "$BACKEND_STATUS" != "online" ]; then
    send_alert "后端服务异常" "后端状态: $BACKEND_STATUS"
fi
EOF

chmod +x /opt/taofen/scripts/monitor.sh
```

**设置定时监控：**
```bash
# 添加到crontab
(crontab -l 2>/dev/null; echo "# 邹韬奋项目监控") | crontab -
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/taofen/scripts/monitor.sh") | crontab -
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/taofen/scripts/log-manager.sh") | crontab -
(crontab -l 2>/dev/null; echo "0 6 * * * /opt/taofen/scripts/health-check.sh > /opt/taofen/logs/daily-health.log") | crontab -

# 查看设置的定时任务
crontab -l
```

### 备份策略

**创建备份脚本：**
```bash
cat > /opt/taofen/scripts/backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/taofen/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

echo "=== 备份开始 $(date) ==="

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份配置文件
echo "备份配置文件..."
tar -czf $BACKUP_DIR/configs_$DATE.tar.gz \
    /etc/caddy/Caddyfile \
    /opt/taofen/iiif/config/ \
    /opt/taofen/backend/.env.production \
    /opt/taofen/backend/ecosystem.config.js \
    /opt/taofen/frontend/.env.production

# 备份数据库(如果有)
if [ -d "/var/lib/mysql" ]; then
    echo "备份数据库..."
    mysqldump --all-databases > $BACKUP_DIR/database_$DATE.sql
    gzip $BACKUP_DIR/database_$DATE.sql
fi

# 备份重要日志
echo "备份日志..."
tar -czf $BACKUP_DIR/logs_$DATE.tar.gz /opt/taofen/logs/

# 清理旧备份
echo "清理旧备份..."
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

# 显示备份大小
echo "备份完成，当前备份大小:"
du -sh $BACKUP_DIR

echo "=== 备份完成 $(date) ==="
EOF

chmod +x /opt/taofen/scripts/backup.sh

# 设置定时备份
(crontab -l 2>/dev/null; echo "0 3 * * * /opt/taofen/scripts/backup.sh >> /opt/taofen/logs/backup.log 2>&1") | crontab -
```

## 🚨 故障排除手册

### 常见错误及解决方案

#### 1. 服务无法启动

**Caddy启动失败：**
```bash
# 检查配置语法
sudo caddy validate --config /etc/caddy/Caddyfile

# 检查端口占用
sudo netstat -tlpn | grep :80
sudo netstat -tlpn | grep :443

# 查看详细错误日志
sudo journalctl -u caddy -n 50

# 常见解决方法：
# 1. 检查域名DNS解析是否正确
# 2. 确保80/443端口未被占用
# 3. 检查防火墙设置
```

**IIIF服务启动失败：**
```bash
# 查看Docker容器状态
docker-compose ps
docker-compose logs cantaloupe

# 常见问题：
# 1. 内存不足 - 调整JAVA_OPTS
# 2. 权限问题 - 检查目录权限
sudo chown -R 8983:8983 /opt/taofen/iiif/cache
sudo chown -R 8983:8983 /opt/taofen/iiif/logs

# 3. 端口冲突
sudo netstat -tlpn | grep :8182
```

**后端服务启动失败：**
```bash
# 检查PM2状态
pm2 status
pm2 logs taofen-backend

# 常见问题：
# 1. 端口被占用
sudo netstat -tlpn | grep :8080

# 2. 环境变量错误
cd /opt/taofen/backend
cat .env.production

# 3. Node.js版本不匹配
node --version
npm --version

# 重启服务
pm2 restart taofen-backend
```

#### 2. 性能问题

**内存使用过高：**
```bash
# 查看内存使用情况
free -h
ps aux --sort=-%mem | head -10

# IIIF服务内存优化
# 修改docker-compose.yml中的JAVA_OPTS
JAVA_OPTS: "-Xms64m -Xmx256m"

# 后端服务内存限制
# 修改ecosystem.config.js
max_memory_restart: '256M'
```

**磁盘空间不足：**
```bash
# 查看磁盘使用
df -h
du -sh /opt/taofen/* | sort -hr

# 清理Docker镜像
docker system prune -a

# 清理日志
/opt/taofen/scripts/log-manager.sh

# 清理缓存
rm -rf /opt/taofen/iiif/cache/*
```

**响应速度慢：**
```bash
# 检查网络延迟
ping yourdomain.com

# 检查服务响应时间
curl -w "%{time_total}" -s -o /dev/null https://yourdomain.com

# 优化建议：
# 1. 启用Caddy压缩(已配置)
# 2. 优化IIIF缓存设置
# 3. 增加服务器带宽
```

#### 3. SSL证书问题

**证书获取失败：**
```bash
# 检查域名解析
dig yourdomain.com
nslookup yourdomain.com

# 检查80端口可访问性
curl -I http://yourdomain.com

# 手动获取证书
sudo caddy stop
sudo caddy start --config /etc/caddy/Caddyfile

# 查看证书日志
sudo journalctl -u caddy | grep -i certificate
```

**证书过期：**
```bash
# 检查证书有效期
echo | openssl s_client -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates

# 强制更新证书
sudo caddy reload --config /etc/caddy/Caddyfile
```

### 性能优化建议

#### 1. 服务器级别优化

**内核参数优化：**
```bash
# 创建系统优化配置
sudo cat > /etc/sysctl.d/99-taofen.conf << 'EOF'
# 网络优化
net.core.rmem_default = 262144
net.core.rmem_max = 16777216
net.core.wmem_default = 262144
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 65536 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216

# 文件句柄限制
fs.file-max = 65535

# 内存管理
vm.swappiness = 10
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5
EOF

# 应用配置
sudo sysctl -p /etc/sysctl.d/99-taofen.conf
```

**文件描述符限制：**
```bash
# 修改limits.conf
sudo cat >> /etc/security/limits.conf << 'EOF'
taofen soft nofile 65535
taofen hard nofile 65535
caddy soft nofile 65535
caddy hard nofile 65535
EOF
```

#### 2. 应用级别优化

**Caddy优化：**
```bash
# 在Caddyfile中已包含的优化：
# - gzip/brotli压缩
# - 静态资源缓存
# - 连接复用
# - 预压缩支持
```

**IIIF优化：**
```bash
# 修改cantaloupe.properties
# 增加以下配置：

cat >> /opt/taofen/iiif/config/cantaloupe.properties << 'EOF'
# 内存管理优化
java.awt.headless = true
processor.limit_to_8_bits = false
processor.jpg.quality = 0.8
processor.tif.compression = LZW

# 并发处理优化
http.http2.enabled = true
http.accept_queue_limit = 0

# 缓存优化
cache.source = FilesystemCache
cache.derivative.enabled = true
FilesystemCache.ttl_seconds = 2592000
EOF
```

### 紧急恢复流程

#### 1. 服务完全宕机

```bash
# 紧急恢复脚本
cat > /opt/taofen/scripts/emergency-recovery.sh << 'EOF'
#!/bin/bash

echo "=== 紧急恢复开始 $(date) ==="

# 1. 停止所有服务
echo "停止所有服务..."
sudo systemctl stop caddy
pm2 stop all
docker-compose -f /opt/taofen/iiif/docker-compose.yml stop

# 2. 检查磁盘空间
echo "检查磁盘空间..."
df -h

# 3. 清理临时文件
echo "清理临时文件..."
sudo apt-get clean
docker system prune -f

# 4. 重启基础服务
echo "重启Docker..."
sudo systemctl restart docker
sleep 10

# 5. 启动IIIF服务
echo "启动IIIF服务..."
cd /opt/taofen/iiif
docker-compose up -d
sleep 15

# 6. 启动后端服务
echo "启动后端服务..."
cd /opt/taofen/backend
pm2 start ecosystem.config.js --env production
sleep 10

# 7. 启动Caddy
echo "启动Caddy..."
sudo systemctl start caddy
sleep 5

# 8. 运行健康检查
echo "运行健康检查..."
/opt/taofen/scripts/health-check.sh

echo "=== 紧急恢复完成 $(date) ==="
EOF

chmod +x /opt/taofen/scripts/emergency-recovery.sh
```

#### 2. 数据恢复

```bash
# 数据恢复脚本
cat > /opt/taofen/scripts/restore-backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/taofen/backups"
RESTORE_DATE="$1"

if [ -z "$RESTORE_DATE" ]; then
    echo "用法: $0 <备份日期，格式：YYYYMMDD_HHMMSS>"
    echo "可用备份："
    ls -la $BACKUP_DIR/configs_*.tar.gz | tail -5
    exit 1
fi

echo "=== 数据恢复开始 $(date) ==="
echo "恢复日期: $RESTORE_DATE"

# 停止服务
sudo systemctl stop caddy
pm2 stop all
docker-compose -f /opt/taofen/iiif/docker-compose.yml stop

# 恢复配置文件
echo "恢复配置文件..."
if [ -f "$BACKUP_DIR/configs_$RESTORE_DATE.tar.gz" ]; then
    cd /
    sudo tar -xzf $BACKUP_DIR/configs_$RESTORE_DATE.tar.gz
    echo "配置文件恢复完成"
else
    echo "错误: 找不到配置备份文件"
    exit 1
fi

# 恢复数据库(如果有)
if [ -f "$BACKUP_DIR/database_$RESTORE_DATE.sql.gz" ]; then
    echo "恢复数据库..."
    zcat $BACKUP_DIR/database_$RESTORE_DATE.sql.gz | mysql
    echo "数据库恢复完成"
fi

# 重启服务
echo "重启服务..."
/opt/taofen/scripts/emergency-recovery.sh

echo "=== 数据恢复完成 $(date) ==="
EOF

chmod +x /opt/taofen/scripts/restore-backup.sh
```

## 📈 部署后维护建议

### 定期维护任务

**每日任务：**
- 检查服务状态
- 查看错误日志
- 监控系统资源使用

**每周任务：**
- 运行完整功能测试
- 检查SSL证书状态
- 清理旧日志文件

**每月任务：**
- 系统安全更新
- 备份验证和测试
- 性能基准测试对比

### 监控告警设置

**推荐监控指标：**
- CPU使用率 > 80%
- 内存使用率 > 85%
- 磁盘使用率 > 90%
- 服务响应时间 > 5秒
- 错误率 > 5%

### 扩容建议

**垂直扩容(单服务器)：**
- 升级到4GB内存实例
- 增加SSD存储容量
- 升级CPU核心数

**水平扩容(多服务器)：**
- 负载均衡器配置
- 数据库主从复制
- CDN内容分发

---

## 🎯 总结

本教程提供了邹韬奋项目在阿里云ECS上的完整部署方案，包括：

✅ **完整的基础环境搭建**
✅ **优化的服务配置**  
✅ **自动化的监控和维护**
✅ **详尽的故障排除指南**
✅ **性能优化建议**

按照本教程操作后，你将拥有一个稳定、高性能、易维护的生产环境。

**重要提醒：**
1. 及时更新域名和邮箱信息
2. 定期检查和更新配置
3. 监控系统运行状态
4. 保持数据备份习惯

如有问题，请查看故障排除章节或查看相关日志文件。