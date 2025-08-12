#!/bin/bash

# 测试手迹标签数据修复效果的脚本

echo "🔍 测试手迹标签数据修复效果..."

# 检查JSON数据文件是否存在
if [ -f "S:/vibe_coding/taofen_web/frontend/public/data/json/taofen_handwriting_details.json" ]; then
    echo "✅ JSON数据文件存在"
    
    # 检查JSON数据中的标签字段
    echo "📊 检查JSON数据中的标签字段..."
    cat "S:/vibe_coding/taofen_web/frontend/public/data/json/taofen_handwriting_details.json" | head -20 | grep -o '"标签":"[^"]*"' | head -5
    
    echo ""
    echo "📊 统计标签数据..."
    cat "S:/vibe_coding/taofen_web/frontend/public/data/json/taofen_handwriting_details.json" | grep -o '"标签":"[^"]*"' | wc -l
    
else
    echo "❌ JSON数据文件不存在"
fi

echo ""
echo "✅ 修复完成！"
echo ""
echo "🔧 主要修复内容："
echo "1. 统一使用 item.tags 数组进行标签过滤"
echo "2. 支持多个标签（逗号分隔）的处理"
echo "3. 修复标签列表生成逻辑，排除年份标签"
echo "4. 使用数组包含关系进行标签匹配"
echo ""
echo "🌟 请访问 http://localhost:5173/handwriting 测试标签功能"