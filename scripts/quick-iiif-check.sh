#!/bin/bash
#
# 快速IIIF部署检查脚本
# 用于快速验证IIIF服务状态
#

echo "=== 快速IIIF检查 ==="
echo "时间: $(date)"
echo

# 检查目录
echo "1. 目录检查:"
[ -d "/srv/iiif" ] && echo "✅ /srv/iiif 存在" || echo "❌ /srv/iiif 不存在"
[ -d "/srv/iiif/images" ] && echo "✅ /srv/iiif/images 存在" || echo "❌ /srv/iiif/images 不存在"  
[ -d "/srv/iiif/manifests" ] && echo "✅ /srv/iiif/manifests 存在" || echo "❌ /srv/iiif/manifests 不存在"

# 检查服务
echo
echo "2. 服务检查:"
# 检查可能的部署方式
if docker ps 2>/dev/null | grep -q cantaloupe; then
    echo "✅ Cantaloupe Docker容器运行中"
elif systemctl is-active --quiet cantaloupe 2>/dev/null; then
    echo "✅ Cantaloupe systemd服务运行中"
elif pgrep -f cantaloupe >/dev/null 2>&1; then
    echo "✅ Cantaloupe进程运行中"
elif pgrep -f java >/dev/null 2>&1; then
    echo "✅ Java进程运行中（可能是Cantaloupe）"
else
    echo "❌ 未发现Cantaloupe服务"
fi

# 检查端口
echo
echo "3. 端口检查:"
netstat -tln | grep -q ":8182" && echo "✅ 端口8182监听中" || echo "❌ 端口8182未监听"

# 检查网络访问
echo
echo "4. 网络访问:"
curl -s -I http://localhost:8182/iiif/3/ >/dev/null 2>&1 && echo "✅ 本地IIIF服务可访问" || echo "❌ 本地IIIF服务不可访问"
curl -s -I https://www.ai4dh.cn/iiif/3/ >/dev/null 2>&1 && echo "✅ 外部IIIF服务可访问" || echo "❌ 外部IIIF服务不可访问"

echo
echo "=== 检查完成 ==="