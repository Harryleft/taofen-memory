#!/bin/bash

# Redis配置修复脚本
# 用于修复生产环境Redis配置问题

echo "🔧 开始Redis配置修复..."
echo "================================"

# 1. 备份当前配置
echo "1. 备份当前配置..."
docker exec redis sh -c "if [ -f /etc/redis/redis.conf ]; then cp /etc/redis/redis.conf /etc/redis/redis.conf.backup; echo '配置文件已备份'; else echo '配置文件不存在'; fi"

# 2. 重新挂载配置文件
echo -e "\n2. 重新挂载配置文件..."
docker-compose stop redis
docker-compose rm -f redis
docker-compose up -d redis

# 3. 等待Redis启动
echo -e "\n3. 等待Redis启动..."
sleep 10

# 4. 验证配置
echo -e "\n4. 验证Redis配置..."
docker exec redis redis-cli config get requirepass
docker exec redis redis-cli -a dev_redis_password_2024 ping

# 5. 重启缓存服务
echo -e "\n5. 重启缓存服务..."
if docker ps | grep -q cache-service; then
    docker-compose restart cache-service
    echo "缓存服务已重启"
else
    echo "启动缓存服务..."
    docker-compose up -d cache-service
fi

# 6. 验证缓存服务
echo -e "\n6. 验证缓存服务状态..."
sleep 5
if docker ps | grep -q cache-service; then
    echo "✅ 缓存服务运行正常"
    docker logs cache-service --tail 5
else
    echo "❌ 缓存服务启动失败"
fi

echo -e "\n✅ 修复完成!"
echo "请运行 ./redis-diagnosis.sh 验证修复结果"