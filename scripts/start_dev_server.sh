#!/bin/bash

# 启动前端开发服务器并监控错误
echo "🚀 启动前端开发服务器..."
cd "$(dirname "$0")/../frontend"

# 启动开发服务器
npm run dev &
DEV_PID=$!

# 等待服务器启动
echo "⏳ 等待服务器启动..."
sleep 5

# 检查服务器是否在运行
if curl -s http://localhost:5175/ > /dev/null; then
    echo "✅ 服务器已启动在 http://localhost:5175/"
    echo "🔍 请检查浏览器控制台是否有 JavaScript 错误"
    echo "💡 按 Ctrl+C 停止服务器"
    
    # 等待用户中断
    wait $DEV_PID
else
    echo "❌ 服务器启动失败"
    kill $DEV_PID 2>/dev/null
    exit 1
fi