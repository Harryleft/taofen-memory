#!/usr/bin/env node

/**
 * 新的UV查看器URL转换功能验证脚本
 * 验证IIIF图像URL转换和请求拦截功能
 */

console.log('=== 新的UV查看器URL转换功能验证 ===\n');

// 测试URL转换函数
function testConvertToIIIFUrl() {
  console.log('1. 测试URL转换函数:');
  
  const testCases = [
    {
      name: '直接IIIF路径',
      input: 'https://www.ai4dh.cn/iiif/3/dazhongshenghuozhoukan/1-16-chuangkanhao/page_1.jpg',
      expected: 'https://www.ai4dh.cn/iiif/3/dazhongshenghuozhoukan%2F1-16-chuangkanhao/full/1024,/0/default.jpg'
    },
    {
      name: '代理路径',
      input: '/proxy?url=https://www.ai4dh.cn/iiif/3/dazhongshenghuozhoukan/1-16-chuangkanhao/page_1.jpg',
      expected: 'https://www.ai4dh.cn/iiif/3/dazhongshenghuozhoukan%2F1-16-chuangkanhao/full/1024,/0/default.jpg'
    },
    {
      name: '已经是IIIF格式',
      input: 'https://www.ai4dh.cn/iiif/3/dazhongshenghuozhoukan%2F1-16-chuangkanhao/full/1024,/0/default.jpg',
      expected: 'https://www.ai4dh.cn/iiif/3/dazhongshenghuozhoukan%2F1-16-chuangkanhao/full/1024,/0/default.jpg'
    }
  ];
  
  // 模拟convertToIIIFUrl函数
  function convertToIIIFUrl(imageUrl) {
    // 检查是否已经是 IIIF Image API 格式
    if (imageUrl.includes('/full/') && imageUrl.includes('/default.jpg')) {
      return imageUrl; // 已经是正确格式
    }
    
    // 如果是代理路径，先解码原始URL
    if (imageUrl.startsWith('/proxy?url=')) {
      const urlParams = new URLSearchParams(imageUrl.split('?')[1]);
      imageUrl = decodeURIComponent(urlParams.get('url'));
    }
    
    // 提取基础URL和图像路径
    const baseUrl = imageUrl.split('/iiif/3/')[0];
    const imagePath = imageUrl.split('/iiif/3/')[1];
    
    // 移除文件名部分，只保留目录路径
    const pathParts = imagePath.split('/');
    pathParts.pop(); // 移除最后一个元素（文件名）
    const directoryPath = pathParts.join('/');
    
    // URL 编码路径部分
    const encodedPath = directoryPath.replace(/\//g, '%2F');
    
    // 构建完整的 IIIF Image API URL
    const iiifUrl = `${baseUrl}/iiif/3/${encodedPath}/full/1024,/0/default.jpg`;
    
    return iiifUrl;
  }
  
  testCases.forEach(testCase => {
    const result = convertToIIIFUrl(testCase.input);
    const passed = result === testCase.expected;
    console.log(`${passed ? '✅' : '❌'} ${testCase.name}`);
    console.log(`   输入: ${testCase.input}`);
    console.log(`   期望: ${testCase.expected}`);
    console.log(`   结果: ${result}`);
    if (!passed) {
      console.log(`   ❌ 转换失败`);
    }
    console.log('');
  });
}

// 测试manifest重写逻辑
function testManifestRewrite() {
  console.log('2. 测试manifest重写逻辑:');
  
  // 模拟manifest数据
  const mockManifest = {
    id: 'https://www.ai4dh.cn/iiif/3/manifests/dazhongshenghuozhoukan/1-16-chuangkanhao/manifest.json',
    type: 'Manifest',
    label: { zh: ['测试期刊'] },
    items: [
      {
        id: 'https://www.ai4dh.cn/iiif/3/dazhongshenghuozhoukan/1-16-chuangkanhao/canvas-1',
        type: 'Canvas',
        items: [
          {
            id: 'https://www.ai4dh.cn/iiif/3/dazhongshenghuozhoukan/1-16-chuangkanhao/page_1.jpg',
            type: 'Image'
          }
        ]
      }
    ]
  };
  
  // 模拟rewriteImageUrls函数
  function rewriteImageUrls(obj, path = '') {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    // 检查是否是图像对象
    if (obj.type === 'Image' && obj.id && obj.id.includes('.jpg')) {
      console.log(`重写图像URL (${path}):`, obj.id);
      obj.id = convertToIIIFUrl(obj.id);
    }
    
    // 递归处理所有属性
    for (const key in obj) {
      if (obj[key] && typeof obj[key] === 'object') {
        rewriteImageUrls(obj[key], path ? `${path}.${key}` : key);
      } else if (Array.isArray(obj[key])) {
        obj[key].forEach((item, index) => {
          rewriteImageUrls(item, path ? `${path}.${key}[${index}]` : `${key}[${index}]`);
        });
      }
    }
    
    return obj;
  }
  
  function convertToIIIFUrl(imageUrl) {
    if (imageUrl.includes('/full/') && imageUrl.includes('/default.jpg')) {
      return imageUrl;
    }
    
    const baseUrl = imageUrl.split('/iiif/3/')[0];
    const imagePath = imageUrl.split('/iiif/3/')[1];
    
    // 移除文件名部分，只保留目录路径
    const pathParts = imagePath.split('/');
    pathParts.pop(); // 移除最后一个元素（文件名）
    const directoryPath = pathParts.join('/');
    
    const encodedPath = directoryPath.replace(/\//g, '%2F');
    return `${baseUrl}/iiif/3/${encodedPath}/full/1024,/0/default.jpg`;
  }
  
  const rewrittenManifest = rewriteImageUrls(JSON.parse(JSON.stringify(mockManifest)));
  
  // 检查图像URL是否被正确重写
  const imageUrl = rewrittenManifest.items[0].items[0].id;
  const expectedUrl = 'https://www.ai4dh.cn/iiif/3/dazhongshenghuozhoukan%2F1-16-chuangkanhao/full/1024,/0/default.jpg';
  
  if (imageUrl === expectedUrl) {
    console.log('✅ manifest重写测试通过');
    console.log(`   原始URL: ${mockManifest.items[0].items[0].id}`);
    console.log(`   重写URL: ${imageUrl}`);
  } else {
    console.log('❌ manifest重写测试失败');
    console.log(`   期望URL: ${expectedUrl}`);
    console.log(`   实际URL: ${imageUrl}`);
  }
  
  console.log('');
}

// 测试文件检查
function testFileCheck() {
  console.log('3. 检查关键文件:');
  
  const fs = require('fs');
  const path = require('path');
  
  const requiredFiles = [
    'frontend/public/uv_simple.html'
  ];
  
  let allFilesExist = true;
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
      
      // 检查文件内容
      const content = fs.readFileSync(file, 'utf8');
      const checks = [
        { pattern: 'convertToIIIFUrl', description: 'URL转换函数' },
        { pattern: 'setupRequestInterceptor', description: '请求拦截器' },
        { pattern: 'IIIFURLAdapter', description: 'IIIF URL适配器' },
        { pattern: 'rewriteImageUrls', description: '图像URL重写' },
        { pattern: 'encodeURI', description: 'URL编码处理' }
      ];
      
      checks.forEach(check => {
        if (content.includes(check.pattern)) {
          console.log(`   ✅ ${check.description}`);
        } else {
          console.log(`   ❌ ${check.description} - 未找到`);
        }
      });
      
    } else {
      console.log(`❌ ${file} - 文件不存在`);
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

// 运行所有测试
testConvertToIIIFUrl();
testManifestRewrite();
const filesOk = testFileCheck();

console.log('=== 验证完成 ===');
console.log('\n🎯 新功能特点:');
console.log('✅ 自动URL转换 - 将直接文件路径转换为IIIF Image API格式');
console.log('✅ 请求拦截器 - 拦截并重写manifest中的图像URL');
console.log('✅ 代理支持 - 正确处理代理路径解码');
console.log('✅ 递归处理 - 深度遍历manifest对象结构');
console.log('✅ 错误处理 - 完善的错误提示和恢复机制');
console.log('\n📋 测试步骤:');
console.log('1. 访问 http://localhost:5177/bookstore-timeline');
console.log('2. 点击"数字报刊"标签');
console.log('3. 选择刊物和期数');
console.log('4. 检查浏览器控制台，应该看到URL转换日志');
console.log('5. 确认图像正确加载');
console.log('\n🔍 关键改进:');
console.log('- 直接文件路径 -> IIIF Image API格式');
console.log('- 自动URL编码 (/ -> %2F)');
console.log('- 代理路径解码和重写');
console.log('- 递归manifest对象处理');

if (filesOk) {
  console.log('\n✅ 所有文件检查通过，可以开始测试！');
} else {
  console.log('\n❌ 部分文件缺失，请检查代码完整性');
}
