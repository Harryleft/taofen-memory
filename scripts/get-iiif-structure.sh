#!/bin/bash
#
# 获取 /srv/iiif 目录的详细结构脚本
# 用于更新部署文档
#
# 使用方法：
# ssh root@115.29.208.232
# bash this_script.sh
#

echo "================================================================================"
echo "邹韬奋项目 - /srv/iiif 目录结构详细分析"
echo "执行时间: $(date)"
echo "================================================================================"
echo

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

IIIF_BASE="/srv/iiif"

# 检查主目录是否存在
if [ ! -d "$IIIF_BASE" ]; then
    echo -e "${RED}❌ 目录 $IIIF_BASE 不存在${NC}"
    echo "请确认实际的IIIF部署路径"
    exit 1
fi

echo -e "${BLUE}=== 1. 主目录基本信息 ===${NC}"
echo "目录路径: $IIIF_BASE"
ls -la "$IIIF_BASE/"
echo
echo "目录大小统计:"
du -sh "$IIIF_BASE" 2>/dev/null
echo "各子目录大小:"
du -sh "$IIIF_BASE"/*/ 2>/dev/null
echo

echo -e "${BLUE}=== 2. 完整目录树结构 ===${NC}"
echo "目录树视图 (深度3级):"
if command -v tree >/dev/null 2>&1; then
    tree -L 3 "$IIIF_BASE/"
else
    echo "使用find命令显示目录结构:"
    find "$IIIF_BASE" -maxdepth 3 -type d | sort | sed 's/^/  /'
fi
echo

echo -e "${BLUE}=== 3. 各子目录详细分析 ===${NC}"

# 检查各个预期的子目录
for subdir in "manifests" "images" "logs" "stack" "cache" "config" "data"; do
    full_path="$IIIF_BASE/$subdir"
    echo -e "${YELLOW}--- $subdir 目录 ---${NC}"
    
    if [ -d "$full_path" ]; then
        echo -e "${GREEN}✅ 存在: $full_path${NC}"
        echo "权限信息:"
        ls -ld "$full_path"
        
        echo "内容概览:"
        ls -la "$full_path" 2>/dev/null | head -10
        
        echo "文件统计:"
        echo "  - 目录数: $(find "$full_path" -type d 2>/dev/null | wc -l)"
        echo "  - 文件数: $(find "$full_path" -type f 2>/dev/null | wc -l)"
        echo "  - 总大小: $(du -sh "$full_path" 2>/dev/null | cut -f1)"
        
        # 特殊检查
        case $subdir in
            "images")
                echo "图像文件类型统计:"
                find "$full_path" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.tiff" -o -name "*.tif" \) 2>/dev/null | head -5 | while read file; do
                    echo "  示例: $(basename "$file")"
                done
                ;;
            "manifests")
                echo "清单文件统计:"
                find "$full_path" -name "*.json" 2>/dev/null | head -5 | while read file; do
                    echo "  清单: $(basename "$file")"
                done
                ;;
            "logs")
                echo "日志文件:"
                find "$full_path" -name "*.log" 2>/dev/null | head -5 | while read file; do
                    echo "  日志: $(basename "$file") ($(stat -c %s "$file" 2>/dev/null | numfmt --to=iec 2>/dev/null || echo "unknown") bytes)"
                done
                ;;
            "config")
                echo "配置文件:"
                find "$full_path" -type f 2>/dev/null | head -5 | while read file; do
                    echo "  配置: $(basename "$file")"
                done
                ;;
        esac
    else
        echo -e "${YELLOW}⚠️  不存在: $full_path${NC}"
    fi
    echo
done

echo -e "${BLUE}=== 4. 重要配置文件检查 ===${NC}"

# 查找可能的配置文件
echo "查找可能的IIIF配置文件:"
find "$IIIF_BASE" -name "*.properties" -o -name "*.yml" -o -name "*.yaml" -o -name "*.conf" -o -name "*.json" -o -name "docker-compose.*" 2>/dev/null | while read file; do
    echo -e "${GREEN}配置文件: $file${NC}"
    echo "  大小: $(stat -c %s "$file" 2>/dev/null | numfmt --to=iec 2>/dev/null || echo "unknown")"
    echo "  修改时间: $(stat -c %y "$file" 2>/dev/null || echo "unknown")"
    echo "  权限: $(stat -c %A "$file" 2>/dev/null || echo "unknown")"
    
    # 显示文件前几行（避免敏感信息）
    echo "  内容预览:"
    head -5 "$file" 2>/dev/null | sed 's/^/    /'
    echo
done

echo -e "${BLUE}=== 5. 权限和所有者分析 ===${NC}"
echo "目录权限总览:"
find "$IIIF_BASE" -maxdepth 2 -exec ls -ld {} \; | sort

echo
echo -e "${BLUE}=== 6. 磁盘使用分析 ===${NC}"
echo "各子目录磁盘使用:"
du -h --max-depth=2 "$IIIF_BASE" 2>/dev/null | sort -hr

echo
echo "================================================================================"
echo -e "${GREEN}目录结构分析完成！${NC}"
echo "请将以上完整输出发送给开发人员，以便更新部署文档。"
echo "================================================================================"