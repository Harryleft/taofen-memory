#!/usr/bin/env node

/**
 * 简化版图片优化脚本
 * 使用系统工具或在线服务进行图片优化
 * 
 * 使用方法:
 * node scripts/simple-optimize-images.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 配置
const config = {
  // 图片目录
  imageDir: path.join(__dirname, '../frontend/public/images/taofen_handwriting'),
  // 缩略图宽度
  thumbnailWidth: 200,
  // 支持的图片格式
  supportedFormats: ['.png', '.jpg', '.jpeg'],
  // 输出目录
  outputDir: path.join(__dirname, '../frontend/public/images/taofen_handwriting_optimized')
};

// 创建输出目录
function createOutputDir() {
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
    console.log(`✓ 创建输出目录: ${config.outputDir}`);
  }
}

// 获取所有图片文件
function getImageFiles() {
  const pattern = path.join(config.imageDir, '**/*.{png,jpg,jpeg}');
  return glob.sync(pattern);
}

// 生成优化指南
function generateOptimizationGuide(imageFiles) {
  console.log('\n=== 图片优化指南 ===\n');
  
  console.log('1. 使用在线工具批量优化图片:');
  console.log('   - Squoosh: https://squoosh.app/');
  console.log('   - TinyPNG: https://tinypng.com/');
  console.log('   - ImageOptim: https://imageoptim.com/');
  
  console.log('\n2. 推荐优化设置:');
  console.log('   - WebP 格式: 质量设置 80-85');
  console.log('   - 缩略图: 宽度 200px, 质量 60-70');
  console.log('   - 保持原始宽高比');
  
  console.log('\n3. 文件命名规则:');
  console.log('   - 原始文件: R00646_00.png');
  console.log('   - WebP版本: R00646_00.webp');
  console.log('   - 缩略图: R00646_00.thumb.webp');
  
  console.log('\n4. 批量处理脚本:');
  
  // 生成批处理文件
  const batchFile = `@echo off
echo 开始图片优化...

REM 创建WebP版本
for %%f in (*.png *.jpg *.jpeg) do (
    echo 处理: %%f
    ffmpeg -i "%%f" -q:v 80 "%%~nf.webp"
)

REM 创建缩略图
for %%f in (*.png *.jpg *.jpeg) do (
    echo 创建缩略图: %%f
    ffmpeg -i "%%f" -q:v 60 -vf "scale=200:-1" "%%~nf.thumb.webp"
)

echo 优化完成！
pause
`;
  
  fs.writeFileSync(path.join(config.outputDir, 'optimize-images.bat'), batchFile);
  console.log('✓ 已生成批处理文件: optimize-images.bat');
  
  // 生成Shell脚本
  const shellScript = `#!/bin/bash
echo "开始图片优化..."

# 创建WebP版本
for file in *.png *.jpg *.jpeg; do
    if [ -f "$file" ]; then
        echo "处理: $file"
        ffmpeg -i "$file" -q:v 80 "\${file%.*}.webp"
    fi
done

# 创建缩略图
for file in *.png *.jpg *.jpeg; do
    if [ -f "$file" ]; then
        echo "创建缩略图: $file"
        ffmpeg -i "$file" -q:v 60 -vf "scale=200:-1" "\${file%.*}.thumb.webp"
    fi
done

echo "优化完成！"
`;
  
  fs.writeFileSync(path.join(config.outputDir, 'optimize-images.sh'), shellScript);
  console.log('✓ 已生成Shell脚本: optimize-images.sh');
  
  // 生成Python脚本
  const pythonScript = `#!/usr/bin/env python3
import os
import subprocess
from PIL import Image

def optimize_images():
    print("开始图片优化...")
    
    # 支持的格式
    extensions = ['.png', '.jpg', '.jpeg']
    
    for file in os.listdir('.'):
        if any(file.lower().endswith(ext) for ext in extensions):
            print(f"处理: {file}")
            
            # 打开图片
            with Image.open(file) as img:
                # 创建WebP版本
                webp_path = os.path.splitext(file)[0] + '.webp'
                img.save(webp_path, 'WEBP', quality=80)
                print(f"  ✓ 创建WebP: {webp_path}")
                
                # 创建缩略图
                thumb_path = os.path.splitext(file)[0] + '.thumb.webp'
                # 计算缩略图尺寸，保持宽高比
                width, height = img.size
                new_width = 200
                new_height = int(height * (new_width / width))
                
                thumb_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                thumb_img.save(thumb_path, 'WEBP', quality=60)
                print(f"  ✓ 创建缩略图: {thumb_path}")
    
    print("优化完成！")

if __name__ == "__main__":
    optimize_images()
`;
  
  fs.writeFileSync(path.join(config.outputDir, 'optimize-images.py'), pythonScript);
  console.log('✓ 已生成Python脚本: optimize-images.py');
  
  console.log('\n5. 手动优化步骤:');
  console.log('   1. 复制原始图片到优化目录');
  console.log('   2. 运行适合的脚本');
  console.log('   3. 将优化后的文件复制回原目录');
  
  console.log('\n6. 验证优化效果:');
  console.log('   - 检查文件大小减少情况');
  console.log('   - 验证图片显示质量');
  console.log('   - 测试网页加载速度');
}

// 生成图片列表
function generateImageList(imageFiles) {
  console.log('\n=== 需要优化的图片文件 ===');
  
  const imageList = imageFiles.map(file => {
    const relativePath = path.relative(config.imageDir, file);
    const stats = fs.statSync(file);
    const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
    return `${relativePath} (${sizeInMB} MB)`;
  });
  
  console.log(imageList.slice(0, 10).join('\n'));
  
  if (imageFiles.length > 10) {
    console.log(`... 还有 ${imageFiles.length - 10} 个文件`);
  }
  
  // 保存完整列表
  fs.writeFileSync(
    path.join(config.outputDir, 'image-list.txt'),
    imageFiles.map(file => {
      const relativePath = path.relative(config.imageDir, file);
      return relativePath;
    }).join('\n')
  );
  console.log(`\n✓ 完整图片列表已保存到: image-list.txt`);
}

// 主函数
function main() {
  console.log('🚀 图片优化助手\n');

  // 创建输出目录
  createOutputDir();

  // 检查图片目录
  if (!fs.existsSync(config.imageDir)) {
    console.error(`图片目录不存在: ${config.imageDir}`);
    return;
  }

  // 获取图片文件
  const imageFiles = getImageFiles();
  if (imageFiles.length === 0) {
    console.log('没有找到需要处理的图片文件');
    return;
  }

  console.log(`找到 ${imageFiles.length} 个图片文件`);
  
  // 计算总大小
  let totalSize = 0;
  imageFiles.forEach(file => {
    totalSize += fs.statSync(file).size;
  });
  
  console.log(`原始总大小: ${(totalSize / 1024 / 1024).toFixed(1)} MB`);
  
  // 生成图片列表
  generateImageList(imageFiles);
  
  // 生成优化指南
  generateOptimizationGuide(imageFiles);
  
  console.log('\n✅ 优化指南生成完成！');
  console.log('💡 请查看 outputDir 目录中的脚本和指南');
}

// 运行
main();