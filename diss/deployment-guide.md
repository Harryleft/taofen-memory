# 邹韬奋数字人文网站完整部署方案

## 🚀 部署方式选择

本项目提供两种部署方式：

### 方式一：Docker部署（推荐）
- **优势**: 环境一致性、易于管理、快速部署
- **适用场景**: 开发环境、测试环境、小型生产环境
- **要求**: Docker和Docker Compose

### 方式二：传统部署
- **优势**: 更精细的系统级控制、更好的性能优化
- **适用场景**: 大型生产环境、需要深度定制的环境
- **要求**: Ubuntu服务器、系统管理权限

---

## 📋 项目架构概述

本项目包含三个主要服务组件：

1. **前端应用**: React静态网站（已构建完成）
2. **后端API**: Express.js服务器（AI解读服务）
3. **IIIF图像服务器**: Cantaloupe图像服务

### 🏗️ 系统架构图

```
Internet (80/443)
       ↓
    Nginx 负载均衡器
    ┌─────────────────┐
    │                 │
    │ 静态前端服务    │  ← / (根路径)
    │ 静态文件缓存    │
    │                 │
    └─────────────────┘
            │
            ↓
    ┌─────────────────┐
    │                 │
    │    后端API      │  ← /api/*
    │ Express.js      │
    │ AI解读服务      │
    │                 │
    └─────────────────┘
            │
            ↓
    ┌─────────────────┐
    │                 │
    │ IIIF图像服务    │  ← /iiif/*
    │ Cantaloupe      │
    │ 图像处理        │
    │                 │
    └─────────────────┘
```

## 🐳 Docker部署方案

### Docker环境要求

```bash
# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 启动Docker服务
sudo systemctl start docker
sudo systemctl enable docker

# 将当前用户加入docker组（避免每次使用sudo）
sudo usermod -aG docker $USER
# 重新登录或运行：newgrp docker
```

### Docker项目结构

```
project/
├── frontend/          # 前端构建文件
│   └── dist/         # 静态文件
├── backend/          # 后端代码
│   ├── server.js
│   ├── package.json
│   └── .env
├── docker/
│   ├── nginx/
│   │   └── nginx.conf
│   ├── cantaloupe/
│   │   └── cantaloupe.properties
│   └── app/           # 后端Dockerfile
├── docker-compose.yml
└── .env
```

### Docker部署步骤

#### 1. 准备项目文件

```bash
# 创建项目目录
mkdir -p /opt/ai4dh-docker
cd /opt/ai4dh-docker

# 创建目录结构
mkdir -p docker/nginx docker/cantaloupe docker/app
```

#### 2. 创建Docker Compose配置

```bash
nano docker-compose.yml
```

```yaml
version: '3.8'

services:
  # Nginx 反向代理
  nginx:
    image: nginx:1.24-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./docker/nginx/conf.d:/etc/nginx/conf.d:ro
      - ./frontend/dist:/var/www/ai4dh.com:ro
      - ./ssl:/etc/letsencrypt:ro
      - nginx_cache:/var/cache/nginx
    depends_on:
      - backend
      - cantaloupe
    restart: unless-stopped
    networks:
      - ai4dh-network

  # 后端API服务
  backend:
    build:
      context: .
      dockerfile: docker/app/Dockerfile
    environment:
      - NODE_ENV=production
      - PORT=3001
    env_file:
      - .env
    volumes:
      - ./backend:/app
    restart: unless-stopped
    networks:
      - ai4dh-network

  # Cantaloupe IIIF服务
  cantaloupe:
    image: uclalibrary/cantaloupe:5.0.6
    volumes:
      - ./docker/cantaloupe/cantaloupe.properties:/etc/cantaloupe/cantaloupe.properties:ro
      - cantaloupe_cache:/var/cache/cantaloupe
      - ./images:/var/local/images:ro  # 图像文件目录
    environment:
      - JAVA_OPTS=-Xmx1.5g -Xms1g
    restart: unless-stopped
    networks:
      - ai4dh-network

  # Redis缓存（可选，用于AI API响应缓存）
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - ai4dh-network
    profiles:
      - with-redis

volumes:
  nginx_cache:
  cantaloupe_cache:
  redis_data:

networks:
  ai4dh-network:
    driver: bridge
```

#### 3. 创建后端Dockerfile

```bash
nano docker/app/Dockerfile
```

```dockerfile
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY backend/package*.json ./

# 安装依赖
RUN npm ci --only=production && npm cache clean --force

# 复制应用代码
COPY backend/ .

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 更改文件所有权
RUN chown -R nextjs:nodejs /app
USER nextjs

# 暴露端口
EXPOSE 3001

# 启动命令
CMD ["node", "server.js"]
```

#### 4. 创建Nginx Docker配置

```bash
nano docker/nginx/nginx.conf
```

```nginx
user nginx;
worker_processes auto;
worker_cpu_affinity auto;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # 基础优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # 缓存优化
    open_file_cache max=1000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;

    # 缓冲区优化
    client_body_buffer_size 128k;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;
    output_buffers 1 32k;
    postpone_output 1460;

    # 超时优化
    client_header_timeout 12;
    client_body_timeout 12;
    send_timeout 10;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    # 访问日志
    access_log /var/log/nginx/access.log main;

    include /etc/nginx/conf.d/*.conf;
}
```

#### 5. 创建站点配置

```bash
nano docker/nginx/conf.d/ai4dh.com.conf
```

```nginx
# 主服务器配置（HTTP重定向到HTTPS）
server {
    listen 80;
    server_name ai4dh.com www.ai4dh.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS主服务器
server {
    listen 443 ssl http2;
    server_name ai4dh.com www.ai4dh.com;

    # SSL配置
    ssl_certificate /etc/letsencrypt/live/ai4dh.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ai4dh.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;

    # 根目录和索引文件
    root /var/www/ai4dh.com;
    index index.html;

    # 静态文件缓存配置
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;

        # 安全头
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
    }

    # API代理到后端服务
    location /api/ {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时配置
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;

        # 缓冲区配置
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    # IIIF代理配置
    location /iiif/ {
        proxy_pass http://cantaloupe:8182;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # IIIF图片缓存（1年）
        proxy_cache iiif_cache;
        proxy_cache_valid 200 302 1y;
        proxy_cache_valid 404 1m;
        proxy_cache_key "$scheme$proxy_host$request_uri$is_args$args";

        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # 缓冲区配置（适合大图片）
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }

    # React路由支持（SPA）
    location / {
        try_files $uri $uri/ /index.html;

        # 安全头
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
}

# IIIF缓存配置
proxy_cache_path /var/cache/nginx/iiif
    levels=1:2
    keys_zone=iiif_cache:10m
    max_size=1g
    inactive=60m
    use_temp_path=off;
```

#### 6. 创建环境配置文件

```bash
nano .env
```

```env
# AI API配置
AI_API_KEY=your_ai_api_key_here

# 数据库配置（如果需要）
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ai4dh
DB_USER=postgres
DB_PASSWORD=password

# Redis配置（可选）
REDIS_HOST=redis
REDIS_PORT=6379

# 其他配置
NODE_ENV=production
```

#### 7. 创建Cantaloupe配置

```bash
nano docker/cantaloupe/cantaloupe.properties
```

```properties
# 网络配置
http.host=0.0.0.0
http.port=8182

# 内存配置（Docker容器内优化）
heap.size=1g
heap.max_size=1.5g

# 图片处理限制
processor.fallback.max_pixels=50000000
processor.fallback.max_scale=1.0

# 缓存配置
cache.server=FilesystemCache
cache.server.filesystem.dir=/var/cache/cantaloupe
cache.server.filesystem.capacity=1g

# 线程配置
http.min_threads=2
http.max_threads=4

# 日志配置
log.level=INFO
log.console.level=WARN
log.application.level=INFO
```

#### 8. 启动Docker服务

```bash
# 复制项目文件
# cp -r /path/to/your/frontend/dist ./frontend/
# cp -r /path/to/your/backend ./backend/

# 启动服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 测试服务
curl http://localhost/api/health
curl http://localhost:8182/iiif/2/info.json
```

### Docker管理命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f [service_name]

# 进入容器
docker-compose exec [service_name] sh

# 更新服务
docker-compose pull
docker-compose up -d --build

# 清理未使用的资源
docker system prune -a
docker volume prune
```

### Docker备份和恢复

```bash
# 备份数据卷
docker run --rm -v ai4dh_docker_cantaloupe_cache:/source -v $(pwd)/backup:/backup alpine tar czf /backup/cantaloupe_cache.tar.gz -C /source .

# 备份配置文件
tar -czf backup/config_backup.tar.gz docker-compose.yml .env docker/

# 恢复数据卷
docker run --rm -v ai4dh_docker_cantaloupe_cache:/target -v $(pwd)/backup:/backup alpine tar xzf /backup/cantaloupe_cache.tar.gz -C /target
```

---

## 🖥️ 服务器配置要求

### 硬件配置

| 组件 | CPU | 内存 | 存储 | 推荐配置 |
|------|-----|------|------|----------|
| 静态前端 | 0.5核 | 100MB | 100MB | Nginx静态服务 |
| 后端API | 0.5核 | 200MB | 50MB | Node.js Express |
| IIIF服务 | 1.5核 | 1.5GB | 2GB+ | Java应用 + 缓存 |
| 系统预留 | 0.5核 | 500MB | 10GB | 系统运行 |
| **总计** | **2核** | **2.3GB** | **12.15GB** | **2核2G配置可行** |

### 软件环境

```bash
# 操作系统
Ubuntu 22.04 LTS (推荐)

# 运行时环境
Node.js 18+ (后端)
OpenJDK 11+ (IIIF)
Nginx 1.18+ (反向代理)

# 其他工具
Git, wget, unzip, curl, htop
```

## 🚀 详细部署步骤

### 1. 环境准备

```bash
# 系统更新
sudo apt update && sudo apt upgrade -y

# 安装基础工具
sudo apt install -y curl wget git unzip htop iotop

# 安装Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装Java 11
sudo apt install -y openjdk-11-jdk

# 安装Nginx
sudo apt install -y nginx

# 验证安装
node --version
java --version
nginx --version
```

### 2. 创建项目目录结构

```bash
# 创建项目目录
sudo mkdir -p /var/www/ai4dh.com
sudo mkdir -p /opt/cantaloupe
sudo mkdir -p /var/log/ai4dh
sudo mkdir -p /backup

# 设置权限
sudo chown -R www-data:www-data /var/www/ai4dh.com
sudo chown -R www-data:www-data /opt/cantaloupe
sudo chown -R www-data:www-data /var/log/ai4dh
```

### 3. 部署Cantaloupe IIIF服务器

#### 3.1 下载和安装

```bash
cd /opt/cantaloupe
sudo wget https://github.com/cantaloupe-project/cantaloupe/releases/download/v5.0.6/cantaloupe-5.0.6.zip
sudo unzip cantaloupe-5.0.6.zip
cd cantaloupe-5.0.6
```

#### 3.2 配置Cantaloupe

```bash
sudo cp cantaloupe.properties.sample cantaloupe.properties
sudo nano cantaloupe.properties
```

**关键配置参数：**

```properties
# 网络配置
http.host=127.0.0.1
http.port=8987

# 内存配置（2G内存优化）
heap.size=1g
heap.max_size=1.5g

# 图片处理限制
processor.fallback.max_pixels=50000000
processor.fallback.max_scale=1.0

# 缓存配置
cache.server=FilesystemCache
cache.server.filesystem.dir=/tmp/cantaloupe-cache
cache.server.filesystem.capacity=1g

# 线程配置（2核CPU优化）
http.min_threads=2
http.max_threads=4

# 日志配置
log.level=INFO
log.console.level=WARN
```

#### 3.3 创建Systemd服务

```bash
sudo nano /etc/systemd/system/cantaloupe.service
```

```ini
[Unit]
Description=Cantaloupe IIIF Image Server
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/cantaloupe/cantaloupe-5.0.6
ExecStart=/usr/bin/java -Dcantaloupe.config=/opt/cantaloupe/cantaloupe-5.0.6/cantaloupe.properties -Xmx1.5g -Xms1g -jar cantaloupe-5.0.6.jar
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=cantaloupe

[Install]
WantedBy=multi-user.target
```

#### 3.4 启动IIIF服务

```bash
sudo systemctl daemon-reload
sudo systemctl start cantaloupe
sudo systemctl enable cantaloupe
sudo systemctl status cantaloupe
```

### 4. 部署后端API服务器

#### 4.1 安装依赖

```bash
cd /var/www/ai4dh.com
sudo mkdir backend
cd backend

# 复制后端代码（假设已上传）
# scp backend/* user@server:/var/www/ai4dh.com/backend/

# 安装依赖
sudo npm init -y
sudo npm install express cors dotenv
```

#### 4.2 环境配置

```bash
sudo nano .env
```

```env
# 后端环境配置
PORT=3001
NODE_ENV=production

# AI API配置
AI_API_KEY=your_ai_api_key_here
```

#### 4.3 创建后端Systemd服务

```bash
sudo nano /etc/systemd/system/backend.service
```

```ini
[Unit]
Description=邹韬奋网站后端API服务
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/ai4dh.com/backend
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=backend

[Install]
WantedBy=multi-user.target
```

#### 4.4 启动后端服务

```bash
sudo systemctl start backend
sudo systemctl enable backend
sudo systemctl status backend
```

### 5. 部署前端静态文件

```bash
# 上传前端构建文件
# scp -r frontend/dist/* user@server:/var/www/ai4dh.com/

# 设置权限
sudo chown -R www-data:www-data /var/www/ai4dh.com
sudo chmod -R 755 /var/www/ai4dh.com
```

### 6. Nginx配置（核心配置）

```bash
# 创建Nginx配置文件
sudo nano /etc/nginx/sites-available/ai4dh.com
```

**完整的Nginx配置：**

```nginx
# 主服务器配置（HTTP重定向到HTTPS）
server {
    listen 80;
    server_name ai4dh.com www.ai4dh.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS主服务器
server {
    listen 443 ssl http2;
    server_name ai4dh.com www.ai4dh.com;

    # SSL配置
    ssl_certificate /etc/letsencrypt/live/ai4dh.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ai4dh.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;

    # 根目录和索引文件
    root /var/www/ai4dh.com;
    index index.html;

    # 静态文件缓存配置
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;

        # 安全头
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
    }

    # API代理到后端服务
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时配置
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;

        # 缓冲区配置
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    # IIIF代理配置
    location /iiif/ {
        proxy_pass http://127.0.0.1:8987/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # IIIF图片缓存（1年）
        proxy_cache iiif_cache;
        proxy_cache_valid 200 302 1y;
        proxy_cache_valid 404 1m;
        proxy_cache_key "$scheme$proxy_host$request_uri$is_args$args";

        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # 缓冲区配置（适合大图片）
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }

    # React路由支持（SPA）
    location / {
        try_files $uri $uri/ /index.html;

        # 安全头
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # 访问日志
    access_log /var/log/nginx/ai4dh.com.access.log;
    error_log /var/log/nginx/ai4dh.com.error.log;
}

# IIIF缓存配置
proxy_cache_path /tmp/nginx_iiif_cache
    levels=1:2
    keys_zone=iiif_cache:10m
    max_size=1g
    inactive=60m
    use_temp_path=off;
```

#### 6.1 Nginx性能优化

```bash
sudo nano /etc/nginx/nginx.conf
```

```nginx
user www-data;
worker_processes auto;
worker_cpu_affinity auto;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # 基础优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # 缓存优化
    open_file_cache max=1000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;

    # 缓冲区优化
    client_body_buffer_size 128k;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;
    output_buffers 1 32k;
    postpone_output 1460;

    # 超时优化
    client_header_timeout 12;
    client_body_timeout 12;
    send_timeout 10;

    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
```

### 7. SSL证书配置

```bash
# 安装Certbot
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# 获取SSL证书
sudo certbot --nginx -d ai4dh.com -d www.ai4dh.com

# 设置自动续期
sudo systemctl enable snap.certbot.renew.timer
```

### 8. 启动和测试

#### 8.1 启动服务

```bash
# 启用Nginx配置
sudo ln -s /etc/nginx/sites-available/ai4dh.com /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重载配置
sudo systemctl reload nginx
sudo systemctl restart nginx

# 检查服务状态
sudo systemctl status nginx
sudo systemctl status backend
sudo systemctl status cantaloupe
```

#### 8.2 服务测试

```bash
# 测试各个服务
curl http://localhost:3001/api/health
curl http://localhost:8987/iiif/2/info.json
curl -I https://ai4dh.com

# 查看日志
sudo journalctl -u backend -f
sudo journalctl -u cantaloupe -f
sudo tail -f /var/log/nginx/ai4dh.com.access.log
```

### 9. 监控和维护

#### 9.1 系统监控

```bash
# 安装监控工具
sudo apt install -y htop iotop ncdu

# 实时监控
htop

# 磁盘使用情况
df -h

# 内存使用情况
free -h

# 服务状态监控
sudo systemctl status nginx backend cantaloupe --no-pager
```

#### 9.2 日志监控

```bash
# Nginx日志
sudo tail -f /var/log/nginx/ai4dh.com.access.log
sudo tail -f /var/log/nginx/ai4dh.com.error.log

# 应用日志
sudo journalctl -u backend -f
sudo journalctl -u cantaloupe -f

# 系统日志
sudo tail -f /var/log/syslog
```

#### 9.3 备份策略

```bash
# 创建备份脚本
sudo nano /usr/local/bin/backup-site.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backup"
DATE=$(date +%Y%m%d_%H%M%S)

# 备份网站文件
tar -czf $BACKUP_DIR/site_$DATE.tar.gz /var/www/ai4dh.com

# 备份配置
tar -czf $BACKUP_DIR/config_$DATE.tar.gz /etc/nginx /opt/cantaloupe

# 删除7天前的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# 设置定时备份
sudo chmod +x /usr/local/bin/backup-site.sh
sudo echo "0 2 * * * /usr/local/bin/backup-site.sh" | crontab -
```

### 10. 安全加固

#### 10.1 防火墙配置

```bash
# 配置UFW防火墙
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22
sudo ufw --force enable

# 查看状态
sudo ufw status
```

#### 10.2 安全头配置

已在Nginx配置中包含：
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Content-Security-Policy: 限制资源加载

#### 10.3 定期更新

```bash
# 设置自动更新
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### 11. 故障排除

#### 11.1 常见问题

**问题1: 502 Bad Gateway**
```bash
# 检查后端服务状态
sudo systemctl status backend
sudo journalctl -u backend --no-pager | tail -20

# 检查端口占用
netstat -tlnp | grep :3001
```

**问题2: IIIF服务无法访问**
```bash
# 检查Cantaloupe状态
sudo systemctl status cantaloupe
sudo journalctl -u cantaloupe --no-pager | tail -20

# 测试本地访问
curl http://localhost:8987/iiif/2/info.json
```

**问题3: 内存不足**
```bash
# 监控内存使用
free -h

# 调整Cantaloupe内存配置
sudo nano /opt/cantaloupe/cantaloupe-5.0.6/cantaloupe.properties
# 降低 heap.size 和 heap.max_size
```

**问题4: 访问慢**
```bash
# 检查资源使用
top

# 清理缓存
sudo rm -rf /tmp/cantaloupe-cache/*
sudo systemctl restart cantaloupe
```

#### 11.2 紧急恢复

```bash
# 重启所有服务
sudo systemctl restart nginx
sudo systemctl restart backend
sudo systemctl restart cantaloupe

# 清除缓存
sudo rm -rf /tmp/nginx_iiif_cache/*
sudo systemctl reload nginx
```

### 12. 性能监控指标

| 指标 | 正常范围 | 警告阈值 | 紧急阈值 |
|------|----------|----------|----------|
| CPU使用率 | <60% | >70% | >90% |
| 内存使用 | <80% | >85% | >90% |
| 磁盘使用 | <70% | >80% | >90% |
| 响应时间 | <2s | >5s | >10s |

### 13. 扩展建议

#### 13.1 性能扩展

1. **内存升级**: 考虑升级到4GB内存
2. **CDN加速**: 使用阿里云CDN加速静态资源
3. **Redis缓存**: 添加Redis缓存AI API响应
4. **负载均衡**: 多实例部署

#### 13.2 功能扩展

1. **监控告警**: 配置阿里云云监控
2. **日志分析**: 使用阿里云日志服务
3. **备份恢复**: 定期备份到阿里云OSS

---

## 📞 联系和支持

如遇部署问题，请提供以下信息：
1. 错误信息和日志
2. 当前服务状态
3. 系统资源使用情况

**最后检查清单：**
- [ ] Nginx配置正确
- [ ] SSL证书安装完成
- [ ] 后端API服务正常
- [ ] IIIF服务正常
- [ ] 域名解析正确
- [ ] 防火墙配置正确
- [ ] 备份策略已设置
- [ ] 监控已配置

部署完成后，通过以下URL验证：
- 主站：https://ai4dh.com
- API：https://ai4dh.com/api/health
- IIIF：https://ai4dh.com/iiif/2/info.json
