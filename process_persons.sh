#!/bin/bash

# 邹韬奋人物数据清洗脚本
# 用于从原始persons.json中提取和清洗关键信息，生成简化的JSON格式

# 脚本配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INPUT_FILE="$SCRIPT_DIR/public/data/persons.json"
OUTPUT_FILE="$SCRIPT_DIR/public/data/persons_clean.json"
BACKUP_DIR="$SCRIPT_DIR/data_backup"

# 颜色输出配置
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# 检查必要工具
check_dependencies() {
    print_message $BLUE "🔍 检查依赖工具..."
    
    # 检查jq
    if ! command -v jq &> /dev/null; then
        print_message $RED "❌ 未找到jq工具，请先安装："
        print_message $YELLOW "  Ubuntu/Debian: sudo apt-get install jq"
        print_message $YELLOW "  macOS: brew install jq"
        print_message $YELLOW "  CentOS/RHEL: sudo yum install jq"
        exit 1
    fi
    
    print_message $GREEN "✅ jq工具已安装: $(jq --version)"
}

# 检查输入文件
check_input_file() {
    print_message $BLUE "📁 检查输入文件..."
    
    if [[ ! -f "$INPUT_FILE" ]]; then
        print_message $RED "❌ 输入文件不存在: $INPUT_FILE"
        print_message $YELLOW "请确保persons.json文件在public/data/目录下"
        exit 1
    fi
    
    # 获取文件大小
    local file_size=$(du -h "$INPUT_FILE" | cut -f1)
    print_message $GREEN "✅ 输入文件存在: $INPUT_FILE ($file_size)"
    
    # 验证JSON格式
    if ! jq empty "$INPUT_FILE" 2>/dev/null; then
        print_message $RED "❌ 输入文件不是有效的JSON格式"
        exit 1
    fi
    
    print_message $GREEN "✅ JSON格式验证通过"
}

# 创建备份
create_backup() {
    print_message $BLUE "💾 创建数据备份..."
    
    # 创建备份目录
    mkdir -p "$BACKUP_DIR"
    
    # 备份原始文件（如果输出文件已存在）
    if [[ -f "$OUTPUT_FILE" ]]; then
        local timestamp=$(date "+%Y%m%d_%H%M%S")
        local backup_file="$BACKUP_DIR/persons_clean_$timestamp.json"
        cp "$OUTPUT_FILE" "$backup_file"
        print_message $GREEN "✅ 已备份现有文件: $backup_file"
    fi
}

# 执行数据清洗
run_cleaning() {
    print_message $BLUE "🚀 开始执行数据清洗..."
    echo "=================================================="
    
    # 使用jq处理JSON，提取简化的字段结构
    print_message $BLUE "📊 处理数据结构..."
    
    # 检查输入数据结构
    local data_type=$(jq -r 'type' "$INPUT_FILE")
    print_message $BLUE "原始数据类型: $data_type"
    
    if [[ "$data_type" == "array" ]]; then
        # 如果是数组，直接处理每个元素
        jq '[.[] | {
            id: (.id // (.序号 // (.index // (. | keys | .[0])))),
            date: (.date // (.time // (.年份 // (.year // "")))),
            content: (.content // (.description // (.desc // (.text // (.事件 // (.标题 // (.title // "")))))))
        } | select(.id != null and .content != null and .content != "")]' "$INPUT_FILE" > "$OUTPUT_FILE"
    elif [[ "$data_type" == "object" ]]; then
        # 如果是对象，尝试提取events或data字段
        if jq -e '.events' "$INPUT_FILE" &>/dev/null; then
            jq '[.events[] | {
                id: (.id // (.序号 // (.index // (. | keys | .[0])))),
                date: (.date // (.time // (.年份 // (.year // "")))),
                content: (.content // (.description // (.desc // (.text // (.事件 // (.标题 // (.title // "")))))))
            } | select(.id != null and .content != null and .content != "")]' "$INPUT_FILE" > "$OUTPUT_FILE"
        elif jq -e '.data' "$INPUT_FILE" &>/dev/null; then
            jq '[.data[] | {
                id: (.id // (.序号 // (.index // (. | keys | .[0])))),
                date: (.date // (.time // (.年份 // (.year // "")))),
                content: (.content // (.description // (.desc // (.text // (.事件 // (.标题 // (.title // "")))))))
            } | select(.id != null and .content != null and .content != "")]' "$INPUT_FILE" > "$OUTPUT_FILE"
        else
            # 如果是单个对象，将其包装成数组
            jq '[. | {
                id: (.id // (.序号 // (.index // "1"))),
                date: (.date // (.time // (.年份 // (.year // "")))),
                content: (.content // (.description // (.desc // (.text // (.事件 // (.标题 // (.title // "")))))))
            } | select(.id != null and .content != null and .content != "")]' "$INPUT_FILE" > "$OUTPUT_FILE"
        fi
    else
        print_message $RED "❌ 不支持的数据类型: $data_type"
        exit 1
    fi
    
    if [[ $? -eq 0 ]]; then
        print_message $GREEN "✅ 数据清洗完成！"
        
        # 显示输出文件信息
        if [[ -f "$OUTPUT_FILE" ]]; then
            local output_size=$(du -h "$OUTPUT_FILE" | cut -f1)
            local record_count=$(jq 'length' "$OUTPUT_FILE")
            print_message $GREEN "📄 输出文件: $OUTPUT_FILE ($output_size)"
            print_message $GREEN "📊 处理结果: 共 $record_count 条记录"
            
            # 显示前3条记录作为预览
            print_message $BLUE "🔍 数据预览 (前3条):"
            jq -r '.[:3][] | "  • ID: \(.id) | 时间: \(.date) | 内容: \(.content[:50])..."' "$OUTPUT_FILE" 2>/dev/null || echo "  预览生成失败"
        fi
    else
        print_message $RED "❌ 数据清洗失败！"
        exit 1
    fi
}

# 验证输出数据
validate_output() {
    print_message $BLUE "🔍 验证输出数据..."
    
    if [[ ! -f "$OUTPUT_FILE" ]]; then
        print_message $RED "❌ 输出文件不存在"
        return 1
    fi
    
    # 验证JSON格式
    if jq empty "$OUTPUT_FILE" 2>/dev/null; then
        print_message $GREEN "✅ JSON格式验证通过"
    else
        print_message $RED "❌ JSON格式验证失败"
        return 1
    fi
    
    # 验证数据结构
    local is_array=$(jq -r 'type' "$OUTPUT_FILE")
    if [[ "$is_array" != "array" ]]; then
        print_message $RED "❌ 输出数据格式错误：应为数组"
        return 1
    fi
    
    local record_count=$(jq 'length' "$OUTPUT_FILE")
    if [[ "$record_count" -eq 0 ]]; then
        print_message $RED "❌ 输出数据为空"
        return 1
    fi
    
    # 检查前几条记录的字段完整性
    local validation_failed=false
    for i in {0..2}; do
        if jq -e ".[$i]" "$OUTPUT_FILE" &>/dev/null; then
            local has_id=$(jq -e ".[$i].id" "$OUTPUT_FILE" &>/dev/null && echo "true" || echo "false")
            local has_content=$(jq -e ".[$i].content" "$OUTPUT_FILE" &>/dev/null && echo "true" || echo "false")
            
            if [[ "$has_id" != "true" ]] || [[ "$has_content" != "true" ]]; then
                print_message $RED "❌ 记录$((i+1))缺少必要字段"
                validation_failed=true
            fi
        fi
    done
    
    if [[ "$validation_failed" == "true" ]]; then
        return 1
    fi
    
    print_message $GREEN "✅ 数据完整性验证通过"
}

# 显示使用帮助
show_help() {
    echo "邹韬奋人物数据清洗工具"
    echo "=========================="
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示此帮助信息"
    echo "  -v, --verbose  显示详细输出"
    echo "  --no-backup   不创建备份文件"
    echo ""
    echo "文件路径:"
    echo "  输入文件: $INPUT_FILE"
    echo "  输出文件: $OUTPUT_FILE"
    echo "  备份目录: $BACKUP_DIR"
    echo ""
    echo "功能:"
    echo "  • 从原始persons.json提取人物相关事件"
    echo "  • 清洗和简化数据结构"
    echo "  • 生成仅包含id、date、content三个字段的简化JSON"
    echo "  • 适合前端直接使用的轻量级数据格式"
    echo ""
    echo "依赖:"
    echo "  • jq - JSON处理工具"
}

# 主函数
main() {
    local create_backup_flag=true
    local verbose_flag=false
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -v|--verbose)
                verbose_flag=true
                shift
                ;;
            --no-backup)
                create_backup_flag=false
                shift
                ;;
            *)
                print_message $RED "未知选项: $1"
                print_message $YELLOW "使用 -h 或 --help 查看帮助"
                exit 1
                ;;
        esac
    done
    
    print_message $BLUE "📚 邹韬奋人物数据清洗工具"
    echo "=================================================="
    
    # 执行清洗流程
    check_dependencies
    check_input_file
    
    if [[ "$create_backup_flag" == true ]]; then
        create_backup
    fi
    
    run_cleaning
    validate_output
    
    echo "=================================================="
    print_message $GREEN "🎉 数据清洗流程完成！"
    print_message $BLUE "💡 清洗后的数据已保存到: $OUTPUT_FILE"
    print_message $BLUE "💡 现在可以在React组件中使用这个文件了"
}

# 错误处理
set -e
trap 'print_message $RED "❌ 脚本执行出错，请检查错误信息"; exit 1' ERR

# 执行主函数
main "$@"