#!/usr/bin/env node

/**
 * 测试URL转换修复
 * 验证IIIF图像URL转换逻辑
 */

console.log('=== URL转换修复验证 ===\n');

// 模拟修复后的convertToIIIFUrl函数
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
  
  // 保留完整路径，包括文件名和扩展名
  const fullPath = imagePath;
  
  // URL 编码路径部分
  const encodedPath = fullPath.replace(/\//g, '%2F');
  
  // 构建完整的 IIIF Image API URL
  const iiifUrl = `${baseUrl}/iiif/3/${encodedPath}/full/1024,/0/default.jpg`;
  
  return iiifUrl;
}

// 测试用例
const testCases = [
  {
    name: '您的例子',
    input: 'https://www.ai4dh.cn/iiif/3/shenghuozhoukan/di01juandi001qi/00.jpg',
    expected: 'https://www.ai4dh.cn/iiif/3/shenghuozhoukan%2Fdi01juandi001qi%2F00.jpg/full/1024,/0/default.jpg'
  },
  {
    name: '原来的例子',
    input: 'https://www.ai4dh.cn/iiif/3/dazhongshenghuozhoukan/1-16-chuangkanhao/page_1.jpg',
    expected: 'https://www.ai4dh.cn/iiif/3/dazhongshenghuozhoukan%2F1-16-chuangkanhao%2Fpage_1.jpg/full/1024,/0/default.jpg'
  },
  {
    name: '已经是IIIF格式',
    input: 'https://www.ai4dh.cn/iiif/3/shenghuozhoukan%2Fdi01juandi001qi%2F07/full/1024,/0/default.jpg',
    expected: 'https://www.ai4dh.cn/iiif/3/shenghuozhoukan%2Fdi01juandi001qi%2F07/full/1024,/0/default.jpg'
  }
];

console.log('测试URL转换函数:');
console.log('');

let allPassed = true;

testCases.forEach(testCase => {
  const result = convertToIIIFUrl(testCase.input);
  const passed = result === testCase.expected;
  
  console.log(`${passed ? '✅' : '❌'} ${testCase.name}`);
  console.log(`   输入: ${testCase.input}`);
  console.log(`   期望: ${testCase.expected}`);
  console.log(`   结果: ${result}`);
  
  if (!passed) {
    console.log(`   ❌ 转换失败`);
    allPassed = false;
  }
  console.log('');
});

console.log('=== 验证完成 ===');
if (allPassed) {
  console.log('✅ 所有测试通过！URL转换修复成功。');
} else {
  console.log('❌ 部分测试失败，需要进一步调试。');
}

console.log('');
console.log('🔧 关键修复:');
console.log('- 保留完整路径，包括文件名和扩展名');
console.log('- 正确处理路径分隔符编码');
console.log('- 符合IIIF Image API标准格式');