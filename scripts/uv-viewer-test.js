#!/usr/bin/env node

/**
 * UV查看器功能验证脚本
 * 用于验证Universal Viewer集成是否正常工作
 */

const fs = require('fs');
const path = require('path');

console.log('=== UV查看器功能验证 ===\n');

// 1. 检查关键文件是否存在
const requiredFiles = [
  'frontend/src/components/newspapers/ViewerPage.tsx',
  'frontend/src/components/newspapers/NewspapersModule.tsx',
  'frontend/src/pages/BookstoreTimelinePage.tsx',
  'frontend/src/components/common/TabSwitcher.tsx'
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

// 2. 检查ViewerPage中的UV初始化代码
console.log('\n2. 检查UV初始化代码...');
const viewerPageContent = fs.readFileSync('frontend/src/components/newspapers/ViewerPage.tsx', 'utf8');

const uvChecks = [
  { pattern: 'window.UV.init', description: 'UV.init方法调用' },
  { pattern: 'universalviewer@4.2.1', description: 'UV CDN资源' },
  { pattern: 'uv.css', description: 'UV样式文件' },
  { pattern: 'UV.js', description: 'UV JavaScript文件' },
  { pattern: 'manifestUrl', description: 'Manifest URL处理' },
  { pattern: 'uvInitialized', description: '初始化状态跟踪' }
];

uvChecks.forEach(check => {
  if (viewerPageContent.includes(check.pattern)) {
    console.log(`✅ ${check.description}`);
  } else {
    console.log(`❌ ${check.description} - 未找到`);
  }
});

// 3. 检查NewspapersModule的集成
console.log('\n3. 检查NewspapersModule集成...');
const moduleContent = fs.readFileSync('frontend/src/components/newspapers/NewspapersModule.tsx', 'utf8');

const moduleChecks = [
  { pattern: 'ViewerPage', description: 'ViewerPage组件引用' },
  { pattern: 'currentView === \'viewer\'', description: '查看器视图切换' },
  { pattern: 'handleIssueClick', description: '期数点击处理' },
  { pattern: 'NewspaperService', description: '报刊服务调用' }
];

moduleChecks.forEach(check => {
  if (moduleContent.includes(check.pattern)) {
    console.log(`✅ ${check.description}`);
  } else {
    console.log(`❌ ${check.description} - 未找到`);
  }
});

// 4. 检查页面集成
console.log('\n4. 检查页面集成...');
const pageContent = fs.readFileSync('frontend/src/pages/BookstoreTimelinePage.tsx', 'utf8');

const pageChecks = [
  { pattern: 'NewspapersModule', description: 'NewspapersModule组件引用' },
  { pattern: 'TabSwitcher', description: 'TabSwitcher组件引用' },
  { pattern: '数字报刊', description: '报刊标签配置' },
  { pattern: 'activeTab', description: '标签状态管理' }
];

pageChecks.forEach(check => {
  if (pageContent.includes(check.pattern)) {
    console.log(`✅ ${check.description}`);
  } else {
    console.log(`❌ ${check.description} - 未找到`);
  }
});

// 5. 检查Vite代理配置
console.log('\n5. 检查Vite代理配置...');
const viteConfigContent = fs.readFileSync('frontend/vite.config.ts', 'utf8');

if (viteConfigContent.includes('/iiif')) {
  console.log('✅ IIIF代理配置');
} else {
  console.log('❌ IIIF代理配置 - 未找到');
}

// 6. 检查服务配置
console.log('\n6. 检查NewspaperService...');
try {
  const serviceContent = fs.readFileSync('frontend/src/components/newspapers/services.ts', 'utf8');
  
  const serviceChecks = [
    { pattern: 'getPublications', description: '获取刊物列表方法' },
    { pattern: 'getIssues', description: '获取期数列表方法' },
    { pattern: 'getManifest', description: '获取Manifest方法' },
    { pattern: 'extractPublicationId', description: '刊物ID提取方法' },
    { pattern: 'extractIssueId', description: '期数ID提取方法' }
  ];

  serviceChecks.forEach(check => {
    if (serviceContent.includes(check.pattern)) {
      console.log(`✅ ${check.description}`);
    } else {
      console.log(`❌ ${check.description} - 未找到`);
    }
  });
} catch (error) {
  console.log('❌ NewspaperService文件未找到');
}

console.log('\n=== 验证完成 ===');
console.log('\n📋 使用说明:');
console.log('1. 访问 http://localhost:5177/bookstore-timeline');
console.log('2. 点击"数字报刊"标签');
console.log('3. 选择刊物（大众生活周刊/生活周刊）');
console.log('4. 选择期数查看UV查看器');
console.log('\n🔍 如果遇到问题，请检查浏览器控制台的错误信息。');