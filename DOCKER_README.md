# Docker部署指南

## 项目概述

本项目使用Docker进行容器化部署，包含以下服务：

- **Frontend**: React静态网站
- **Backend**: Express.js API服务
- **Cantaloupe**: IIIF图像服务器
- **Nginx**: 反向代理和静态文件服务

## 快速开始

### 1. 环境准备

```bash
# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. 项目配置

```bash
# 克隆项目或创建项目目录
mkdir -p /opt/ai4dh-docker
cd /opt/ai4dh-docker

# 复制项目文件
cp -r your-frontend/dist ./frontend/
cp -r your-backend ./backend/

# 复制Docker配置
# 配置文件已在项目中准备好
```

### 3. 环境配置

```bash
# 复制环境配置文件
cp docker/.env.example .env

# 编辑环境变量
nano .env
```

### 4. 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 5. 测试部署

```bash
# 测试各个服务
curl http://localhost/api/health
curl http://localhost:8182/iiif/2/info.json
curl -I http://localhost
```

## 服务说明

### Nginx (端口 80, 443)
- 反向代理所有请求
- 提供静态文件服务
- SSL证书配置

### Backend (端口 3001)
- Express.js API服务
- AI解读功能
- 健康检查接口

### Cantaloupe (端口 8182)
- IIIF图像服务
- 图像处理和缓存
- 支持缩放和裁剪

### Redis (可选)
- API响应缓存
- 会话存储
- 使用 `docker-compose --profile with-redis up -d` 启动

## 管理命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart [service_name]

# 查看日志
docker-compose logs -f [service_name]

# 进入容器
docker-compose exec [service_name] sh

# 更新服务
docker-compose pull
docker-compose up -d --build

# 清理资源
docker system prune -a
docker volume prune
```

## 文件结构

```
/opt/ai4dh-docker/
├── frontend/              # 前端静态文件
│   └── dist/
├── backend/               # 后端代码
│   ├── server.js
│   ├── package.json
│   └── .env
├── docker/                # Docker配置
│   ├── nginx/
│   │   ├── nginx.conf
│   │   └── conf.d/
│   ├── cantaloupe/
│   │   └── cantaloupe.properties
│   └── app/
│       └── Dockerfile
├── docker-compose.yml
├── .env                   # 环境变量
└── DOCKER_README.md
```

## 备份和恢复

### 备份

```bash
# 备份数据卷
docker run --rm -v ai4dh_docker_cantaloupe_cache:/source -v $(pwd)/backup:/backup alpine tar czf /backup/cantaloupe_cache.tar.gz -C /source .

# 备份配置文件
tar -czf backup/config_backup.tar.gz docker-compose.yml .env docker/
```

### 恢复

```bash
# 恢复数据卷
docker run --rm -v ai4dh_docker_cantaloupe_cache:/target -v $(pwd)/backup:/backup alpine tar xzf /backup/cantaloupe_cache.tar.gz -C /target
```

## 故障排除

### 常见问题

1. **端口占用**
   ```bash
   # 检查端口
   netstat -tlnp | grep :80
   netstat -tlnp | grep :443

   # 停止冲突服务或修改端口
   ```

2. **内存不足**
   ```bash
   # 检查内存使用
   docker stats

   # 调整Cantaloupe内存配置
   nano docker/cantaloupe/cantaloupe.properties
   ```

3. **服务无法启动**
   ```bash
   # 查看详细日志
   docker-compose logs [service_name]

   # 检查配置文件
   docker-compose config
   ```

## 性能优化

### 资源限制

```yaml
# 在docker-compose.yml中添加资源限制
services:
  cantaloupe:
    deploy:
      resources:
        limits:
          memory: 1.5G
          cpus: '1.5'
        reservations:
          memory: 1G
          cpus: '1.0'
```

### 监控

```bash
# 实时监控
docker stats

# 查看容器日志
docker-compose logs -f --tail=100

# 健康检查
curl http://localhost/api/health
```

## 生产环境注意事项

1. **SSL配置**: 确保SSL证书正确配置
2. **防火墙**: 配置UFW或云服务器安全组
3. **日志轮转**: 配置日志轮转避免磁盘满
4. **监控告警**: 设置系统监控和告警
5. **定期备份**: 定期备份数据和配置
6. **更新策略**: 定期更新Docker镜像和依赖

## 联系支持

如遇部署问题，请提供：
- Docker版本信息
- docker-compose版本
- 服务日志
- 系统资源使用情况
