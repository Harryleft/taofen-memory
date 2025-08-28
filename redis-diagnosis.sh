#!/bin/bash

# Redis配置诊断脚本
# 用于诊断生产环境Redis配置问题

echo "🔍 开始Redis配置诊断..."
echo "================================"

# 1. 检查Redis容器状态
echo "1. 检查Redis容器状态..."
docker ps | grep redis

# 2. 检查Redis容器日志
echo -e "\n2. 检查Redis容器日志..."
docker logs redis --tail 20

# 3. 检查Redis配置文件挂载
echo -e "\n3. 检查Redis配置文件挂载..."
docker exec redis ls -la /etc/redis/

# 4. 检查Redis实际配置
echo -e "\n4. 检查Redis实际配置..."
docker exec redis redis-cli config get requirepass
docker exec redis redis-cli config get bind
docker exec redis redis-cli config get port

# 5. 测试Redis连接
echo -e "\n5. 测试Redis连接..."
docker exec redis redis-cli ping
docker exec redis redis-cli -a dev_redis_password_2024 ping

# 6. 检查缓存服务连接
echo -e "\n6. 检查缓存服务状态..."
docker ps | grep cache-service
if docker ps | grep -q cache-service; then
    echo "缓存服务容器正在运行"
    docker logs cache-service --tail 10
else
    echo "❌ 缓存服务容器未运行"
fi

echo -e "\n✅ 诊断完成!"