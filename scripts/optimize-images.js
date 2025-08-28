#!/usr/bin/env node

/**
 * 图片优化脚本
 * 生成WebP版本和缩略图，保持原始文件不变
 * 
 * 使用方法:
 * node scripts/optimize-images.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const glob = require('glob');

// 配置
const config = {
  // 图片目录
  imageDir: path.join(__dirname, '../frontend/public/images/taofen_handwriting'),
  // 缩略图宽度
  thumbnailWidth: 200,
  // WebP质量 (0-100)
  webpQuality: 80,
  // 缩略图质量
  thumbnailQuality: 60,
  // 并发处理数
  concurrency: 4,
  // 支持的图片格式
  supportedFormats: ['.png', '.jpg', '.jpeg']
};

// 检查依赖
function checkDependencies() {
  try {
    execSync('npx sharp --version', { stdio: 'ignore' });
    console.log('✓ sharp 已安装');
  } catch (error) {
    console.error('✗ sharp 未安装，请先安装:');
    console.error('npm install --save-dev sharp');
    process.exit(1);
  }
}

// 获取所有图片文件
function getImageFiles() {
  const pattern = path.join(config.imageDir, '**/*.{png,jpg,jpeg}');
  return glob.sync(pattern);
}

// 处理单个图片
async function processImage(imagePath) {
  const relativePath = path.relative(config.imageDir, imagePath);
  const ext = path.extname(imagePath).toLowerCase();
  const baseName = path.basename(imagePath, ext);
  const dirName = path.dirname(imagePath);

  console.log(`处理: ${relativePath}`);

  try {
    // 生成WebP版本
    const webpPath = path.join(dirName, `${baseName}.webp`);
    if (!fs.existsSync(webpPath)) {
      const webpCommand = `npx sharp "${imagePath}" -o "${webpPath}" -q ${config.webpQuality} --webp`;
      execSync(webpCommand, { stdio: 'ignore' });
      console.log(`  ✓ 生成WebP: ${baseName}.webp`);
    } else {
      console.log(`  - WebP已存在: ${baseName}.webp`);
    }

    // 生成缩略图
    const thumbPath = path.join(dirName, `${baseName}.thumb.webp`);
    if (!fs.existsSync(thumbPath)) {
      const thumbCommand = `npx sharp "${imagePath}" -o "${thumbPath}" -q ${config.thumbnailQuality} --webp -resize ${config.thumbnailWidth}`;
      execSync(thumbCommand, { stdio: 'ignore' });
      console.log(`  ✓ 生成缩略图: ${baseName}.thumb.webp`);
    } else {
      console.log(`  - 缩略图已存在: ${baseName}.thumb.webp`);
    }

    // 获取文件大小信息
    const originalSize = fs.statSync(imagePath).size;
    const webpSize = fs.existsSync(webpPath) ? fs.statSync(webpPath).size : 0;
    const thumbSize = fs.existsSync(thumbPath) ? fs.statSync(thumbPath).size : 0;

    return {
      original: { path: relativePath, size: originalSize },
      webp: { path: relativePath + '.webp', size: webpSize },
      thumbnail: { path: relativePath + '.thumb.webp', size: thumbSize }
    };
  } catch (error) {
    console.error(`  ✗ 处理失败: ${relativePath}`, error.message);
    return null;
  }
}

// 并发处理图片
async function processImagesConcurrently(imageFiles) {
  const results = [];
  const chunks = [];

  // 分组处理
  for (let i = 0; i < imageFiles.length; i += config.concurrency) {
    chunks.push(imageFiles.slice(i, i + config.concurrency));
  }

  for (const chunk of chunks) {
    const promises = chunk.map(processImage);
    const chunkResults = await Promise.all(promises);
    results.push(...chunkResults.filter(Boolean));
  }

  return results;
}

// 生成统计报告
function generateReport(results) {
  let totalOriginalSize = 0;
  let totalWebpSize = 0;
  let totalThumbSize = 0;

  console.log('\n=== 优化统计 ===');
  
  results.forEach(result => {
    totalOriginalSize += result.original.size;
    totalWebpSize += result.webp.size;
    totalThumbSize += result.thumbnail.size;
  });

  const webpReduction = ((totalOriginalSize - totalWebpSize) / totalOriginalSize * 100).toFixed(1);
  const thumbReduction = ((totalOriginalSize - totalThumbSize) / totalOriginalSize * 100).toFixed(1);

  console.log(`原始图片总数: ${results.length}`);
  console.log(`原始总大小: ${(totalOriginalSize / 1024 / 1024).toFixed(1)} MB`);
  console.log(`WebP总大小: ${(totalWebpSize / 1024 / 1024).toFixed(1)} MB (减少 ${webpReduction}%)`);
  console.log(`缩略图总大小: ${(totalThumbSize / 1024 / 1024).toFixed(1)} MB (减少 ${thumbReduction}%)`);
  console.log(`预计加载时间减少: ${Math.round((1 - totalThumbSize / totalOriginalSize) * 100)}%`);
}

// 主函数
async function main() {
  console.log('🚀 开始图片优化...\n');

  // 检查依赖
  checkDependencies();

  // 检查图片目录
  if (!fs.existsSync(config.imageDir)) {
    console.error(`图片目录不存在: ${config.imageDir}`);
    process.exit(1);
  }

  // 获取图片文件
  const imageFiles = getImageFiles();
  if (imageFiles.length === 0) {
    console.log('没有找到需要处理的图片文件');
    return;
  }

  console.log(`找到 ${imageFiles.length} 个图片文件\n`);

  // 处理图片
  const results = await processImagesConcurrently(imageFiles);

  // 生成报告
  generateReport(results);

  console.log('\n✅ 图片优化完成！');
  console.log('💡 提示: 原始文件保持不变，新文件已添加到相同目录');
}

// 运行
main().catch(error => {
  console.error('优化过程中发生错误:', error);
  process.exit(1);
});