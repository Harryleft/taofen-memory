#!/bin/bash
# 
# 邹韬奋项目 - IIIF部署路径检查脚本
# 使用方法：在服务器上执行此脚本来检查IIIF部署情况
# ssh root@115.29.208.232，然后运行此脚本
#
# 作者: Claude Code Assistant
# 日期: 2025-08-28
# 版本: 1.0
#

echo "================================================================================"
echo "邹韬奋项目 - IIIF部署路径完整检查"
echo "检查时间: $(date)"
echo "服务器IP: $(curl -s ifconfig.me)"
echo "================================================================================"
echo

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查函数
check_directory() {
    local dir=$1
    local name=$2
    
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✅ $name: $dir 存在${NC}"
        ls -la "$dir" | head -10
        echo -e "${BLUE}目录大小: $(du -sh "$dir" 2>/dev/null)${NC}"
        echo
    else
        echo -e "${RED}❌ $name: $dir 不存在${NC}"
        echo
    fi
}

# 1. 检查基础目录结构
echo -e "${BLUE}=== 1. 检查IIIF部署路径 ===${NC}"
check_directory "/srv/iiif" "主IIIF目录"
check_directory "/srv/iiif/manifests" "清单文件目录"  
check_directory "/srv/iiif/images" "图像文件目录"
check_directory "/srv/iiif/logs" "日志目录"
check_directory "/srv/iiif/stack" "Docker配置目录"

# 2. 检查其他可能的IIIF路径
echo -e "${BLUE}=== 2. 检查其他可能的IIIF路径 ===${NC}"
echo "搜索系统中所有的IIIF相关目录..."
find /opt -name "*iiif*" -type d 2>/dev/null | head -10 | while read dir; do
    echo -e "${YELLOW}发现: $dir${NC}"
done
find /var -name "*iiif*" -type d 2>/dev/null | head -10 | while read dir; do
    echo -e "${YELLOW}发现: $dir${NC}"
done
echo

# 3. 检查IIIF服务部署方式
echo -e "${BLUE}=== 3. 检查IIIF服务部署方式 ===${NC}"

# 3.1 检查Docker容器（如果使用Docker）
if command -v docker &> /dev/null; then
    echo "检查Docker容器:"
    if docker ps | grep -E "(cantaloupe|iiif)" &> /dev/null; then
        echo -e "${GREEN}✅ 发现Docker容器中的IIIF服务${NC}"
        docker ps | grep -E "(cantaloupe|iiif)"
    else
        echo -e "${YELLOW}⚠️ 未发现Docker容器中的IIIF服务${NC}"
    fi
    echo
else
    echo -e "${YELLOW}⚠️ Docker未安装，可能使用其他部署方式${NC}"
    echo
fi

# 3.2 检查systemd服务
echo "检查systemd服务:"
if systemctl list-units --type=service 2>/dev/null | grep -E "(cantaloupe|iiif)" &> /dev/null; then
    echo -e "${GREEN}✅ 发现systemd服务中的IIIF服务${NC}"
    systemctl list-units --type=service | grep -E "(cantaloupe|iiif)"
else
    echo -e "${YELLOW}⚠️ 未发现systemd服务中的IIIF服务${NC}"
fi
echo

# 3.3 检查Java进程（Cantaloupe通常是Java应用）
echo "检查Java进程:"
if pgrep -f java &> /dev/null; then
    echo -e "${GREEN}✅ 发现Java进程${NC}"
    ps aux | grep java | grep -v grep | head -5
    echo "检查是否为Cantaloupe:"
    ps aux | grep -E "(cantaloupe|iiif)" | grep -v grep || echo -e "${YELLOW}⚠️ Java进程中未明确标识为Cantaloupe${NC}"
else
    echo -e "${YELLOW}⚠️ 未发现Java进程${NC}"
fi
echo

# 3.4 检查PM2进程管理
if command -v pm2 &> /dev/null; then
    echo "检查PM2管理的进程:"
    if pm2 list | grep -E "(cantaloupe|iiif)" &> /dev/null; then
        echo -e "${GREEN}✅ 发现PM2管理的IIIF服务${NC}"
        pm2 list | grep -E "(cantaloupe|iiif)"
    else
        echo -e "${YELLOW}⚠️ PM2中未发现IIIF服务${NC}"
    fi
    echo
fi

# 4. 检查网络端口
echo -e "${BLUE}=== 4. 检查IIIF服务端口 ===${NC}"
echo "检查常用IIIF端口监听状态:"
netstat -tlnp 2>/dev/null | grep -E ":(8182|8080|8000|3000)" && echo -e "${GREEN}✅ 发现IIIF相关端口监听${NC}" || echo -e "${YELLOW}⚠️ 未发现IIIF标准端口监听${NC}"
echo

# 5. 检查进程
echo -e "${BLUE}=== 5. 检查IIIF相关进程 ===${NC}"
ps aux | grep -E "(cantaloupe|iiif)" | grep -v grep && echo -e "${GREEN}✅ 发现IIIF相关进程${NC}" || echo -e "${YELLOW}⚠️ 未发现IIIF进程${NC}"
echo

# 6. 检查系统服务
echo -e "${BLUE}=== 6. 检查系统服务 ===${NC}"
systemctl list-units --type=service 2>/dev/null | grep -E "(cantaloupe|iiif)" && echo -e "${GREEN}✅ 发现IIIF相关系统服务${NC}" || echo -e "${YELLOW}⚠️ 未发现IIIF系统服务${NC}"
echo

# 7. 检查Web服务器配置  
echo -e "${BLUE}=== 7. 检查Web服务器配置 ===${NC}"
echo "检查Caddy配置:"
if [ -d "/etc/caddy" ]; then
    grep -r "iiif\|IIIF" /etc/caddy/ 2>/dev/null | head -5 && echo -e "${GREEN}✅ 在Caddy配置中发现IIIF相关配置${NC}" || echo -e "${YELLOW}⚠️ Caddy配置中未发现IIIF配置${NC}"
else
    echo -e "${RED}❌ 未找到Caddy配置目录${NC}"
fi

echo "检查Nginx配置:"
if [ -d "/etc/nginx" ]; then
    grep -r "iiif\|IIIF" /etc/nginx/ 2>/dev/null | head -5 && echo -e "${GREEN}✅ 在Nginx配置中发现IIIF相关配置${NC}" || echo -e "${YELLOW}⚠️ Nginx配置中未发现IIIF配置${NC}"
else
    echo -e "${YELLOW}⚠️ 未找到Nginx配置目录${NC}"
fi
echo

# 8. 检查Docker Compose文件
echo -e "${BLUE}=== 8. 检查Docker Compose文件 ===${NC}"
find /srv /opt /var -name "docker-compose.yml" 2>/dev/null | while read file; do
    echo -e "${BLUE}发现Compose文件: $file${NC}"
    if grep -q "cantaloupe\|iiif" "$file"; then
        echo -e "${GREEN}✅ 包含IIIF相关配置${NC}"
        echo "相关配置片段:"
        grep -A 5 -B 5 "cantaloupe\|iiif" "$file"
    else
        echo -e "${YELLOW}⚠️ 不包含IIIF配置${NC}"
    fi
    echo "---"
done
echo

# 9. 检查磁盘空间
echo -e "${BLUE}=== 9. 检查磁盘空间 ===${NC}"
df -h | grep -E "(srv|opt|var)"
echo

# 10. 网络连接测试
echo -e "${BLUE}=== 10. IIIF服务网络测试 ===${NC}"
echo "测试本地IIIF服务:"
curl -s -I http://localhost:8182/iiif/3/ 2>/dev/null && echo -e "${GREEN}✅ 本地8182端口IIIF服务响应正常${NC}" || echo -e "${YELLOW}⚠️ 本地8182端口无响应${NC}"

echo "测试通过域名访问IIIF服务:"
curl -s -I https://www.ai4dh.cn/iiif/3/ 2>/dev/null && echo -e "${GREEN}✅ 域名IIIF服务响应正常${NC}" || echo -e "${RED}❌ 域名IIIF服务无响应${NC}"
echo

# 11. 文件权限检查
echo -e "${BLUE}=== 11. 文件权限检查 ===${NC}"
for dir in "/srv/iiif" "/srv/iiif/images" "/srv/iiif/manifests"; do
    if [ -d "$dir" ]; then
        echo "目录: $dir"
        ls -ld "$dir"
        echo "所有者和权限:"
        stat "$dir" 2>/dev/null | grep -E "(Uid|Gid|Access.*[0-9])"
        echo "---"
    fi
done

echo
echo "================================================================================"
echo -e "${GREEN}IIIF部署检查完成！${NC}"
echo "请将以上完整输出发送给开发人员，以便更新部署文档。"
echo "================================================================================"