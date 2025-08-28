# 邹韬奋项目 - 简化Docker部署指南

## 🎯 部署概述

将整个项目统一使用Docker部署，包括：
- **前端**: React应用 (静态文件)
- **后端**: Node.js API服务
- **IIIF**: Cantaloupe图像服务 (仅报纸)
- **Web服务器**: Caddy (反向代理 + SSL)

## 📋 当前配置总结

### 🐳 Docker容器架构
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   用户请求      │───▶│   Caddy容器      │───▶│  前端静态文件    │
│ ai4dh.cn       │    │  (端口80/443)    │    │   /dist/       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ├─────▶ Backend容器 (API /api/*)
                              │         (端口3001)
                              │
                              └─────▶ Cantaloupe容器 (IIIF /iiif/*)
                                       (端口8282->8182)
```

### 📁 目录映射关系
```
宿主机路径                    容器内路径                  用途
/srv/iiif/images/           → /imageroot/images/         报纸刊物图片
/srv/iiif/manifests/        → /srv/iiif/manifests/      IIIF清单文件
/srv/iiif/stack/Caddyfile   → /etc/caddy/Caddyfile      Web配置
/var/www/taofen/            → /usr/share/caddy/         前端静态文件
/opt/taofen/source/backend/ → /app/                     后端代码
```

## 🚀 部署步骤

### 1️⃣ 本地构建前端
```bash
cd /mnt/s/vibe_coding/taofen_web/frontend
npm run build
```

### 2️⃣ 使用XFTP上传文件
**上传清单**:
```
本地路径                           服务器目标路径
frontend/dist/                 → /var/www/taofen/
backend/                       → /opt/taofen/source/backend/
docker-compose.full.yml        → /srv/iiif/stack/docker-compose.yml
Caddyfile.full                 → /srv/iiif/stack/Caddyfile
报纸图片文件                    → /srv/iiif/images/newspapers/
```

### 3️⃣ 服务器上执行部署
```bash
# SSH连接服务器
ssh root@115.29.208.232

# 停止当前服务
cd /srv/iiif/stack/
docker-compose down

# 启动完整服务
docker-compose up -d

# 检查状态
docker-compose ps
```

## 🔧 配置文件说明

### 📋 docker-compose.yml 主要变化
- **新增**: backend服务容器
- **优化**: Caddy配置支持前端静态文件
- **网络**: 统一Docker网络管理
- **环境**: 环境变量统一配置

### 📋 Caddyfile 主要功能
- **前端**: SPA路由支持，静态文件缓存
- **API代理**: `/api/*` → backend:3001
- **IIIF代理**: `/iiif/*` → cantaloupe:8182
- **清单服务**: `/iiif/3/manifests/*` → 直接静态文件

## 📊 服务管理命令

### 🔄 常用操作
```bash
cd /srv/iiif/stack/

# 启动所有服务
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f backend
docker-compose logs -f cantaloupe

# 重启特定服务
docker-compose restart backend
docker-compose restart caddy

# 停止所有服务
docker-compose down
```

### 📈 健康检查
```bash
# 前端检查
curl -I https://www.ai4dh.cn/

# 后端API检查
curl https://www.ai4dh.cn/api/health

# IIIF服务检查
curl https://www.ai4dh.cn/iiif/3/
```

## 🎯 部署优势

### ✅ 简化的优点
- **统一管理**: 一个docker-compose.yml管理所有服务
- **环境一致**: 开发、测试、生产环境完全一致
- **快速部署**: 一键启动/停止所有服务
- **服务隔离**: 各服务独立运行，故障不相互影响
- **简单扩展**: 需要新服务时直接添加到compose文件

### 🔒 安全优化
- 只有Caddy暴露外部端口
- Backend和Cantaloupe仅内网访问
- SSL自动管理和更新
- 统一的访问日志和监控

## ⚡ 快速上手

**最简部署流程**:
```bash
# 1. 本地构建
npm run build

# 2. XFTP上传 (参考上面的上传清单)

# 3. 服务器部署
ssh root@115.29.208.232
cd /srv/iiif/stack/
docker-compose down && docker-compose up -d
```

这样部署后，您只需要关注：
- **报纸图片** → `/srv/iiif/images/newspapers/` (XFTP上传)
- **代码更新** → 构建后上传dist和backend (XFTP上传)