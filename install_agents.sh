#!/bin/bash

# 获取所有 .md 文件并提取 agent 名称
echo "正在获取 agents 列表..."

agents=$(curl -s https://api.github.com/repos/wshobson/agents/contents/ | grep -E '"name":.*\.md"' | sed 's/.*"name": "\([^"]*\)".*/\1/' | sed 's/\.md$//')

echo "发现的 agents:"
echo "$agents"

# 检查已安装的 agents
echo ""
echo "已安装的 agents:"
claude mcp list | grep -E '^[^:]+:' | sed 's/:.*$//' | sort

echo ""
echo "开始安装新的 agents..."

# 安装每个 agent
for agent in $agents; do
    echo "正在安装 $agent..."
    
    # 获取 agent 内容
    content=$(curl -s "https://raw.githubusercontent.com/wshobson/agents/main/$agent.md")
    
    if [ $? -eq 0 ] && [ -n "$content" ]; then
        # 尝试提取安装命令
        install_cmd=$(echo "$content" | grep -i "claude mcp add" | head -1)
        
        if [ -n "$install_cmd" ]; then
            echo "找到安装命令: $install_cmd"
            eval "$install_cmd"
            sleep 2
        else
            echo "未找到安装命令，尝试手动安装..."
            # 检查是否包含 npx 命令
            npx_cmd=$(echo "$content" | grep -i "npx" | head -1)
            if [ -n "$npx_cmd" ]; then
                echo "找到 npx 命令，尝试添加..."
                claude mcp add "$agent" "$npx_cmd"
                sleep 2
            else
                echo "无法找到安装命令，跳过 $agent"
            fi
        fi
    else
        echo "无法获取 $agent 的内容，跳过"
    fi
    
    echo "----------------------------------------"
done

echo "安装完成！"