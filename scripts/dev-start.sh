#!/bin/bash

# 韬奋文库本地开发环境启动脚本
# 使用方法: ./scripts/dev-start.sh

set -e

echo "🚀 启动韬奋文库本地开发环境..."

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker未运行，请先启动Docker"
    exit 1
fi

# 检查端口是否被占用
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "❌ 端口 $port 已被占用"
        return 1
    fi
    return 0
}

# 检查必要端口
ports=(5173 3001 3002 6379 5540 8282)
for port in "${ports[@]}"; do
    if ! check_port $port; then
        echo "请先停止占用端口 $port 的服务"
        exit 1
    fi
done

# 创建必要的目录
echo "📁 创建必要的目录..."
mkdir -p logs
mkdir -p cache-service/logs
mkdir -p backend/logs

# 创建日志目录（如果不存在）
mkdir -p /tmp/taofen-logs

# 启动开发环境
echo "🐳 启动Docker容器..."
docker-compose -f docker-compose.dev.yml up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
check_service() {
    local service_name=$1
    local url=$2
    local max_attempts=30
    local attempt=1
    
    echo "🔍 检查 $service_name 服务..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            echo "✅ $service_name 服务启动成功"
            return 0
        fi
        
        echo "⏳ 等待 $service_name 服务启动... ($attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ $service_name 服务启动失败"
    return 1
}

# 检查各个服务
services=(
    "Redis" "http://localhost:6379/ping"
    "缓存服务" "http://localhost:3002/api/health"
    "AI后端" "http://localhost:3001/api/health"
    "Redis Insight" "http://localhost:5540"
)

for ((i=0; i<${#services[@]}; i+=2)); do
    service_name="${services[i]}"
    service_url="${services[i+1]}"
    
    if ! check_service "$service_name" "$service_url"; then
        echo "❌ 部分服务启动失败，请检查日志"
        echo "📋 查看日志: docker-compose -f docker-compose.dev.yml logs"
        exit 1
    fi
done

# 启动前端开发服务器
echo "🎯 启动前端开发服务器..."
cd frontend
npm run dev &
FRONTEND_PID=$!

# 等待前端服务启动
sleep 5

# 检查前端服务
if check_service "前端开发服务器" "http://localhost:5173"; then
    echo "✅ 前端开发服务器启动成功"
else
    echo "❌ 前端开发服务器启动失败"
    kill $FRONTEND_PID 2>/dev/null || true
    exit 1
fi

# 显示服务信息
echo ""
echo "🎉 韬奋文库本地开发环境启动成功！"
echo ""
echo "📋 服务访问地址："
echo "  🌐 前端开发服务器: http://localhost:5173"
echo "  🔧 缓存服务: http://localhost:3002"
echo "  🤖 AI后端服务: http://localhost:3001"
echo "  🔍 Redis Insight: http://localhost:5540"
echo "  🖼️ IIIF服务: http://localhost:8282"
echo ""
echo "📊 缓存服务API："
echo "  GET  /api/health - 健康检查"
echo "  GET  /api/cache/iiif/info/:identifier - 获取IIIF信息"
echo "  GET  /api/cache/stats - 获取缓存统计"
echo "  POST /api/cache/set - 设置缓存"
echo "  GET  /api/cache/get/:key - 获取缓存"
echo ""
echo "🛠️ 开发工具："
echo "  Redis Insight: http://localhost:5540"
echo "  前端热重载: http://localhost:5173"
echo ""
echo "📝 管理命令："
echo "  查看日志: docker-compose -f docker-compose.dev.yml logs -f"
echo "  停止服务: docker-compose -f docker-compose.dev.yml down"
echo "  重启服务: docker-compose -f docker-compose.dev.yml restart"
echo ""
echo "按 Ctrl+C 停止开发环境"

# 等待用户中断
trap 'echo "🛑 正在停止开发环境..."; kill $FRONTEND_PID 2>/dev/null || true; docker-compose -f docker-compose.dev.yml down; exit 0' INT

# 保持脚本运行
wait $FRONTEND_PID