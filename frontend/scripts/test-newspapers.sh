#!/bin/bash

# 数字报刊模块测试脚本

echo "🧪 开始数字报刊模块测试..."

# 1. 运行单元测试
echo "📝 运行单元测试..."
npm run test:coverage -- --testPathPattern=newspapers --verbose

# 2. 运行E2E测试
echo "🌐 运行端到端测试..."
npm run test:e2e

# 3. 运行性能测试
echo "⚡ 运行性能测试..."
npm run test:performance

# 4. 生成测试报告
echo "📊 生成测试报告..."
npm run test:report

# 5. 检查测试覆盖率
echo "📈 检查测试覆盖率..."
if [ -f "coverage/lcov.info" ]; then
    echo "测试覆盖率报告已生成"
    echo "请查看 coverage/ 目录"
else
    echo "⚠️  警告：测试覆盖率报告未生成"
fi

echo "✅ 测试完成！"