#!/bin/bash
# 项目清理脚本
# 用于清理临时文件、缓存和优化项目空间

set -e

echo "🧹 邹韬奋数字叙事平台 - 项目清理工具"
echo "========================================"
echo ""

# 显示当前空间使用
echo "📊 当前空间使用情况:"
echo "  node_modules/: $(du -sh frontend/node_modules 2>/dev/null | cut -f1)"
echo "  .vite缓存: $(du -sh frontend/node_modules/.vite 2>/dev/null | cut -f1)"
echo "  coverage/: $(du -sh frontend/coverage 2>/dev/null | cut -f1)"
echo "  logs/: $(du -sh logs 2>/dev/null | cut -f1)"
echo "  .git/: $(du -sh .git 2>/dev/null | cut -f1)"
echo ""

# 检查被追踪的临时文件
echo "🔍 检查Git追踪的临时文件..."
TEMP_FILES=$(git ls-files | grep -E "(check-.*\.cjs|test-.*\.cjs)" || true)
if [ -n "$TEMP_FILES" ]; then
  echo "⚠️  发现被追踪的临时文件:"
  echo "$TEMP_FILES"
  echo ""
  read -p "是否从Git移除这些文件? (y/N) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "$TEMP_FILES" | xargs git rm --cached
    echo "✅ 已移除临时文件的Git追踪"
  fi
else
  echo "✅ 未发现被追踪的临时文件"
fi
echo ""

# 清理Vite缓存
echo "🗑️  清理Vite缓存..."
if [ -d "frontend/node_modules/.vite" ]; then
  rm -rf frontend/node_modules/.vite
  echo "✅ Vite缓存已清理"
else
  echo "ℹ️  无需清理Vite缓存"
fi
echo ""

# 清理测试覆盖率报告
echo "🗑️  清理测试覆盖率报告..."
if [ -d "frontend/coverage" ]; then
  rm -rf frontend/coverage
  echo "✅ 测试覆盖率报告已清理"
else
  echo "ℹ️  无需清理覆盖率报告"
fi
echo ""

# 清理构建产物
echo "🗑️  清理构建产物..."
if [ -d "frontend/dist" ]; then
  rm -rf frontend/dist
  echo "✅ dist目录已清理"
fi
if [ -d "frontend/build" ]; then
  rm -rf frontend/build
  echo "✅ build目录已清理"
fi
echo ""

# 清理旧日志（保留最近7天）
echo "🗑️  清理旧日志文件（保留7天内的）..."
if [ -d "logs" ]; then
  find logs -name "*.log" -mtime +7 -delete 2>/dev/null || true
  echo "✅ 旧日志已清理"
else
  echo "ℹ️  logs目录不存在"
fi
echo ""

# 更新.gitignore（如果需要）
echo "📝 检查.gitignore配置..."
if ! grep -q "check-\*\.cjs" .gitignore 2>/dev/null; then
  echo "📝 更新.gitignore以忽略临时测试脚本..."
  cat >> .gitignore << 'EOF'

# 临时测试脚本（自动生成）
check-*.cjs
test-*.cjs

# 进度文件
progress.json
status.json
EOF
  echo "✅ .gitignore已更新"
else
  echo "✅ .gitignore配置完善"
fi
echo ""

# 显示清理后的空间使用
echo "📊 清理后空间使用:"
echo "  node_modules/: $(du -sh frontend/node_modules 2>/dev/null | cut -f1)"
echo "  .vite缓存: $(du -sh frontend/node_modules/.vite 2>/dev/null | cut -f1 || echo '0')"
echo "  coverage/: $(du -sh frontend/coverage 2>/dev/null | cut -f1 || echo '0')"
echo "  logs/: $(du -sh logs 2>/dev/null | cut -f1)"
echo ""

echo "========================================"
echo "✅ 项目清理完成！"
echo ""
echo "建议的后续步骤:"
echo "  1. 检查清理结果: git status"
echo "  2. 如果有更改，提交: git add . && git commit -m 'chore: 清理临时文件和缓存'"
echo "  3. 定期运行此脚本以保持项目整洁"
echo ""
