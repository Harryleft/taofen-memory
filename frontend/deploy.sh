#!/bin/bash

# 服务器部署上传脚本示例
# 请根据您的实际情况修改以下变量

SERVER_USER="your_username"
SERVER_HOST="your_server_ip"
SERVER_PATH="/var/www/your-domain.com"
LOCAL_DIST_PATH="./dist"

echo "=== 开始上传文件到服务器 ==="
echo "目标服务器: $SERVER_HOST"
echo "目标路径: $SERVER_PATH"
echo "本地路径: $LOCAL_DIST_PATH"
echo

# 检查本地dist目录是否存在
if [ ! -d "$LOCAL_DIST_PATH" ]; then
    echo "❌ 错误: 本地dist目录不存在"
    echo "请先执行: npm run build"
    exit 1
fi

# 显示文件统计
echo "📊 文件统计:"
echo "- 总文件数: $(find $LOCAL_DIST_PATH -type f | wc -l)"
echo "- 总大小: $(du -sh $LOCAL_DIST_PATH | cut -f1)"
echo

# 确认上传
read -p "确认要上传这些文件到服务器吗? (y/N): " confirm
if [[ $confirm != [yY] ]]; then
    echo "❌ 上传已取消"
    exit 1
fi

echo "🚀 开始上传文件..."
echo

# 使用rsync上传文件（推荐）
rsync -avz --progress \
    --exclude='*.log' \
    --exclude='*.tmp' \
    --exclude='test-iiif.sh' \
    --exclude='iiif-test.html' \
    --exclude='uv_simple.html' \
    $LOCAL_DIST_PATH/ \
    $SERVER_USER@$SERVER_HOST:$SERVER_PATH/

echo "✅ 文件上传完成!"
echo
echo "🔍 部署验证建议:"
echo "1. 访问 https://your-domain.com 验证主页面"
echo "2. 检查浏览器开发者工具确保所有资源正常加载"
echo "3. 测试IIIF服务连接是否正常"
echo "4. 验证所有页面功能是否正常工作"