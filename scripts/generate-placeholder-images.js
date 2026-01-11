#!/usr/bin/env node

/**
 * 占位图片生成脚本
 * 用于生成示例占位图片，方便开源项目使用
 *
 * 使用方法:
 * node scripts/generate-placeholder-images.js
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  outputDir: path.join(__dirname, '../data-example/images'),
  imageTypes: [
    { type: 'books', count: 10, width: 400, height: 600, color: '#E8D5C4' },
    { type: 'manuscripts', count: 10, width: 600, height: 800, color: '#F5F5DC' },
    { type: 'timeline_images', count: 15, width: 800, height: 600, color: '#D4C4B0' },
    { type: 'newspapers', count: 8, width: 800, height: 1000, color: '#F0E68C' }
  ]
};

/**
 * 创建SVG占位图片
 */
function createPlaceholderSVG(width, height, text, color) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${color}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="#333"
        text-anchor="middle" dominant-baseline="middle" transform="rotate(-45 ${width/2} ${height/2})">
    ${text}
  </text>
  <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="16" fill="#666"
        text-anchor="middle" dominant-baseline="middle">
    ${width} x ${height}
  </text>
</svg>`;

  return svg;
}

/**
 * 生成占位图片
 */
function generatePlaceholderImages() {
  console.log('🎨 开始生成占位图片...\n');

  // 创建输出目录
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  CONFIG.imageTypes.forEach(({ type, count, width, height, color }) => {
    const typeDir = path.join(CONFIG.outputDir, type);

    // 创建类型目录
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir, { recursive: true });
    }

    console.log(`📁 生成 ${type} 类型图片 (${count}张, ${width}x${height})`);

    // 生成图片
    for (let i = 1; i <= count; i++) {
      const filename = `${type}_placeholder_${i}.svg`;
      const filepath = path.join(typeDir, filename);
      const svg = createPlaceholderSVG(width, height, `${type.toUpperCase()} ${i}`, color);

      fs.writeFileSync(filepath, svg);
      console.log(`  ✓ ${filename}`);
    }

    console.log('');
  });

  console.log('✅ 占位图片生成完成!');
  console.log(`📂 输出目录: ${CONFIG.outputDir}`);
  console.log('');
  console.log('💡 提示: 这些SVG占位图片可以直接用于开发和演示。');
  console.log('   生产环境建议替换为真实的图片资源。');
}

/**
 * 创建README说明文件
 */
function createReadme() {
  const readmeContent = `# 示例图片说明

本目录包含用于开发和演示的占位图片。

## 图片类型

- **books**: 书籍封面占位图 (400x600)
- **manuscripts**: 手迹文献占位图 (600x800)
- **timeline_images**: 时间轴事件图片 (800x600)
- **newspapers**: 报刊文章占位图 (800x1000)

## 使用方法

这些SVG占位图片可以直接用于开发环境。生产环境建议:

1. 替换为真实的图片资源
2. 使用优化后的图片格式(WebP等)
3. 配置CDN加速

## 自定义占位图片

如需生成更多占位图片,运行:

\`\`\`bash
node scripts/generate-placeholder-images.js
\`\`\`

---

**注意**: 这些占位图片仅用于开发和演示目的，不应用于生产环境。
`;

  const readmePath = path.join(CONFIG.outputDir, 'README.md');
  fs.writeFileSync(readmePath, readmeContent);
  console.log('📄 创建说明文件: data-example/images/README.md');
}

// 主函数
function main() {
  try {
    generatePlaceholderImages();
    createReadme();
  } catch (error) {
    console.error('❌ 生成失败:', error.message);
    process.exit(1);
  }
}

// 运行
if (require.main === module) {
  main();
}

module.exports = { generatePlaceholderImages };
