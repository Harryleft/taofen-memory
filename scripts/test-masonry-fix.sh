#!/bin/bash

# 测试Masonry修复效果的脚本
echo "开始测试Masonry修复效果..."

# 等待服务器启动
sleep 3

# 使用curl检查页面是否正常加载
echo "检查页面加载状态..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:5175/relationships

if [ $? -eq 0 ]; then
    echo "✅ 页面可以正常访问"
    
    # 检查浏览器控制台是否有错误
    echo "🔍 请在浏览器中访问 http://localhost:5175/relationships"
    echo "🔍 查看浏览器控制台，应该能看到 'Masonry Debug' 开头的调试信息"
    echo "🔍 预期应该能看到卡片正常显示"
    
    echo ""
    echo "测试要点："
    echo "1. 页面应该显示498位人物的统计信息"
    echo "2. 应该能看到人物卡片正常排列"
    echo "3. 控制台应该显示容器宽度信息"
    echo "4. 卡片应该有背景色和边框，不是透明的"
    
else
    echo "❌ 页面无法访问"
fi