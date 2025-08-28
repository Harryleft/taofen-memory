#!/bin/bash
#
# 生成IIIF目录结构的文档格式输出
# 用于直接更新到部署文档中
#

IIIF_BASE="/srv/iiif"

echo "# 服务器实际IIIF目录结构"
echo ""
echo "**检查时间**: $(date)"
echo "**服务器IP**: $(curl -s ifconfig.me 2>/dev/null || echo "未知")"
echo ""

if [ ! -d "$IIIF_BASE" ]; then
    echo "❌ **错误**: 目录 $IIIF_BASE 不存在"
    echo ""
    echo "请检查实际的IIIF部署路径。"
    exit 1
fi

echo "## 📁 实际目录结构"
echo ""
echo "\`\`\`"
if command -v tree >/dev/null 2>&1; then
    tree -L 3 "$IIIF_BASE/"
else
    echo "$IIIF_BASE/"
    find "$IIIF_BASE" -maxdepth 3 -type d | sort | sed 's|^'$IIIF_BASE'||' | sed 's|^/||' | sed 's|^|├── |' | sed 's|/| /|g'
fi
echo "\`\`\`"
echo ""

echo "## 📊 目录统计信息"
echo ""
echo "| 目录 | 大小 | 文件数 | 最后修改 |"
echo "|------|------|--------|----------|"

for subdir in "$IIIF_BASE"/*; do
    if [ -d "$subdir" ]; then
        dirname=$(basename "$subdir")
        size=$(du -sh "$subdir" 2>/dev/null | cut -f1)
        filecount=$(find "$subdir" -type f 2>/dev/null | wc -l)
        lastmod=$(stat -c %y "$subdir" 2>/dev/null | cut -d' ' -f1)
        echo "| $dirname | $size | $filecount | $lastmod |"
    fi
done

echo ""
echo "## 🔧 主要配置文件"
echo ""

# 查找配置文件
find "$IIIF_BASE" -name "*.properties" -o -name "*.yml" -o -name "*.yaml" -o -name "*.conf" -o -name "cantaloupe.*" -o -name "docker-compose.*" 2>/dev/null | while read file; do
    relpath=$(echo "$file" | sed "s|$IIIF_BASE/||")
    size=$(stat -c %s "$file" 2>/dev/null | numfmt --to=iec 2>/dev/null || echo "unknown")
    echo "- **$relpath** ($size)"
done

echo ""
echo "## 📋 各目录详细信息"
echo ""

for subdir in manifests images logs stack cache config data; do
    full_path="$IIIF_BASE/$subdir"
    if [ -d "$full_path" ]; then
        echo "### $subdir/ 目录"
        echo ""
        echo "- **路径**: \`$full_path\`"
        echo "- **大小**: $(du -sh "$full_path" 2>/dev/null | cut -f1)"
        echo "- **文件数**: $(find "$full_path" -type f 2>/dev/null | wc -l)"
        echo "- **权限**: $(stat -c %A "$full_path" 2>/dev/null)"
        
        # 显示子目录结构
        subdirs=$(find "$full_path" -maxdepth 1 -type d 2>/dev/null | grep -v "^$full_path$" | wc -l)
        if [ $subdirs -gt 0 ]; then
            echo "- **子目录**:"
            find "$full_path" -maxdepth 1 -type d 2>/dev/null | grep -v "^$full_path$" | sort | while read subsubdir; do
                name=$(basename "$subsubdir")
                count=$(find "$subsubdir" -type f 2>/dev/null | wc -l)
                echo "  - \`$name/\` ($count 个文件)"
            done
        fi
        
        # 显示示例文件
        samplefiles=$(find "$full_path" -maxdepth 2 -type f 2>/dev/null | head -3)
        if [ -n "$samplefiles" ]; then
            echo "- **示例文件**:"
            echo "$samplefiles" | while read file; do
                relfile=$(echo "$file" | sed "s|$full_path/||")
                echo "  - \`$relfile\`"
            done
        fi
        
        echo ""
    fi
done

echo "## 🌐 URL访问测试"
echo ""
echo "**IIIF服务状态检查**:"
echo ""
if curl -s -I http://localhost:8182/iiif/3/ >/dev/null 2>&1; then
    echo "- ✅ 本地服务: http://localhost:8182/iiif/3/ (正常)"
else
    echo "- ❌ 本地服务: http://localhost:8182/iiif/3/ (无响应)"
fi

if curl -s -I https://www.ai4dh.cn/iiif/3/ >/dev/null 2>&1; then
    echo "- ✅ 外部访问: https://www.ai4dh.cn/iiif/3/ (正常)"
else
    echo "- ❌ 外部访问: https://www.ai4dh.cn/iiif/3/ (无响应)"
fi

echo ""
echo "---"
echo ""
echo "*此报告由脚本自动生成，请复制粘贴到部署文档的相应章节中。*"