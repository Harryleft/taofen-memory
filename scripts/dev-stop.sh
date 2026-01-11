#!/bin/bash

# 韬奋文库本地开发环境停止脚本
# 使用方法: ./scripts/dev-stop.sh

set -e

echo "🛑 停止韬奋文库本地开发环境..."

# 停止Docker容器
echo "🐳 停止Docker容器..."
docker-compose -f docker-compose.dev.yml down

# 清理进程
echo "🧹 清理相关进程..."
pkill -f "vite" || true
pkill -f "node.*frontend" || true
pkill -f "node.*backend" || true
pkill -f "node.*cache-service" || true

# 等待进程完全停止
sleep 3

echo "✅ 开发环境已停止"

# 显示清理后的状态
echo ""
echo "📊 端口状态："
ports=(5173 3001 3002 6379 5540 8282)
for port in "${ports[@]}"; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "  ❌ 端口 $port 仍被占用"
    else
        echo "  ✅ 端口 $port 已释放"
    fi
done

echo ""
echo "💡 如需重新启动，请运行: ./scripts/dev-start.sh"