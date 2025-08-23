#!/usr/bin/env node

/**
 * 新的数字报刊模块验证脚本
 * 验证基于iframe的UV查看器实现
 */

const fs = require('fs');
const path = require('path');

console.log('=== 新的数字报刊模块验证 ===\n');

// 1. 检查关键文件是否存在
const requiredFiles = [
  'frontend/public/uv_simple.html',
  'frontend/src/components/newspapers/ViewerPage.tsx',
  'frontend/src/components/newspapers/NewspapersModule.tsx',
  'frontend/src/components/newspapers/services.ts',
  'frontend/src/pages/BookstoreTimelinePage.tsx'
];

console.log('1. 检查关键文件...');
let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - 文件不存在`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ 部分关键文件缺失，请检查代码完整性');
  process.exit(1);
}

// 2. 检查uv_simple.html内容
console.log('\n2. 检查uv_simple.html内容...');
const uvSimpleContent = fs.readFileSync('frontend/public/uv_simple.html', 'utf8');

const uvSimpleChecks = [
  { pattern: 'Universal Viewer', description: 'UV标题' },
  { pattern: 'universalviewer@4.2.1', description: 'UV CDN资源' },
  { pattern: 'UV.js', description: 'UV JavaScript文件' },
  { pattern: 'getManifestId()', description: 'Manifest ID获取函数' },
  { pattern: 'UV.init', description: 'UV初始化方法' },
  { pattern: 'iiifManifestId', description: 'Manifest参数处理' }
];

uvSimpleChecks.forEach(check => {
  if (uvSimpleContent.includes(check.pattern)) {
    console.log(`✅ ${check.description}`);
  } else {
    console.log(`❌ ${check.description} - 未找到`);
  }
});

// 3. 检查ViewerPage中的iframe实现
console.log('\n3. 检查ViewerPage中的iframe实现...');
const viewerPageContent = fs.readFileSync('frontend/src/components/newspapers/ViewerPage.tsx', 'utf8');

const viewerPageChecks = [
  { pattern: 'iframe', description: 'iframe元素' },
  { pattern: 'uv_simple.html', description: 'uv_simple.html引用' },
  { pattern: 'iiifManifestId', description: 'Manifest参数传递' },
  { pattern: 'getProxyUrl', description: '代理URL处理' },
  { pattern: 'allowFullScreen', description: '全屏支持' },
  { pattern: 'reloadViewer', description: '重新加载功能' }
];

viewerPageChecks.forEach(check => {
  if (viewerPageContent.includes(check.pattern)) {
    console.log(`✅ ${check.description}`);
  } else {
    console.log(`❌ ${check.description} - 未找到`);
  }
});

// 4. 检查NewspapersModule的新结构
console.log('\n4. 检查NewspapersModule的新结构...');
const moduleContent = fs.readFileSync('frontend/src/components/newspapers/NewspapersModule.tsx', 'utf8');

const moduleChecks = [
  { pattern: 'currentView', description: '视图状态管理' },
  { pattern: 'catalog|viewer', description: '双视图模式' },
  { pattern: 'handleBackToCatalog', description: '返回目录功能' },
  { pattern: 'search-container', description: '搜索容器' },
  { pattern: 'sort-controls', description: '排序控件' },
  { pattern: 'debounce', description: '防抖搜索' },
  { pattern: 'ViewerPage', description: 'ViewerPage组件引用' }
];

moduleChecks.forEach(check => {
  const regex = new RegExp(check.pattern);
  if (regex.test(moduleContent)) {
    console.log(`✅ ${check.description}`);
  } else {
    console.log(`❌ ${check.description} - 未找到`);
  }
});

// 5. 检查NewspaperService的新功能
console.log('\n5. 检查NewspaperService的新功能...');
const serviceContent = fs.readFileSync('frontend/src/components/newspapers/services.ts', 'utf8');

const serviceChecks = [
  { pattern: 'PublicationItem', description: '刊物项接口' },
  { pattern: 'IssueItem', description: '期数项接口' },
  { pattern: 'getPublications', description: '获取刊物列表方法' },
  { pattern: 'getIssuesForPublication', description: '获取刊物期数方法' },
  { pattern: 'filterPublications', description: '搜索过滤方法' },
  { pattern: 'getProxyUrl', description: '代理URL方法' },
  { pattern: 'fetchWithProxy', description: '代理获取函数' }
];

serviceChecks.forEach(check => {
  if (serviceContent.includes(check.pattern)) {
    console.log(`✅ ${check.description}`);
  } else {
    console.log(`❌ ${check.description} - 未找到`);
  }
});

// 6. 检查样式和布局
console.log('\n6. 检查样式和布局...');
const styleChecks = [
  { pattern: 'search-container', description: '搜索容器样式' },
  { pattern: 'catalog-item', description: '目录项样式' },
  { pattern: 'uv-frame-wrap', description: 'UV框架样式' },
  { pattern: 'grid grid-cols', description: '网格布局' },
  { pattern: 'hover:shadow-md', description: '悬停效果' }
];

styleChecks.forEach(check => {
  if (moduleContent.includes(check.pattern)) {
    console.log(`✅ ${check.description}`);
  } else {
    console.log(`❌ ${check.description} - 未找到`);
  }
});

console.log('\n=== 验证完成 ===');
console.log('\n🎯 新功能特点:');
console.log('✅ 基于iframe的UV查看器，避免JavaScript冲突');
console.log('✅ 完整的搜索和排序功能');
console.log('✅ 改进的用户界面和交互体验');
console.log('✅ 更好的错误处理和恢复机制');
console.log('✅ 响应式设计，适配不同屏幕尺寸');
console.log('\n📋 测试步骤:');
console.log('1. 访问 http://localhost:5177/bookstore-timeline');
console.log('2. 点击"数字报刊"标签');
console.log('3. 使用搜索框搜索刊物');
console.log('4. 使用排序功能排列刊物');
console.log('5. 选择刊物查看期数列表');
console.log('6. 点击期数进入UV查看器');
console.log('7. 测试返回功能');
console.log('\n🔍 如果遇到问题，请检查浏览器控制台的错误信息。');