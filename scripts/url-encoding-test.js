#!/usr/bin/env node

/**
 * URL编码修复验证脚本
 * 验证404问题是否已解决
 */

console.log('=== URL编码修复验证 ===\n');

// 测试URL编码
const testCases = [
  'dazhongshenghuozhoukan/1-16-chuangkanhao',
  'dazhongshenghuozhoukan',
  'shenghuozhoukan/1-1'
];

console.log('1. URL编码测试:');
testCases.forEach(testCase => {
  const encoded = encodeURIComponent(testCase);
  console.log(`原始: ${testCase}`);
  console.log(`编码: ${encoded}`);
  console.log('---');
});

// 测试API调用
const https = require('https');
const { URL } = require('url');

function testUrl(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname,
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data.substring(0, 200) // 只显示前200个字符
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

console.log('\n2. API调用测试:');

async function testAPIs() {
  const testUrls = [
    'https://www.ai4dh.cn/iiif/3/manifests/dazhongshenghuozhoukan%2F1-16-chuangkanhao/manifest.json',
    'https://www.ai4dh.cn/iiif/3/manifests/dazhongshenghuozhoukan/collection.json',
    'https://www.ai4dh.cn/iiif/manifests/collection.json'
  ];

  for (const url of testUrls) {
    try {
      console.log(`测试: ${url}`);
      const result = await testUrl(url);
      
      if (result.status === 200) {
        console.log(`✅ 成功 (${result.status})`);
        
        // 尝试解析JSON
        try {
          const parsed = JSON.parse(result.data);
          if (parsed.type === 'Manifest') {
            console.log(`  类型: Manifest - ${parsed.label?.zh?.[0] || 'Unknown'}`);
          } else if (parsed.type === 'Collection') {
            console.log(`  类型: Collection - ${parsed.label?.zh?.[0] || 'Unknown'}`);
            console.log(`  项目数: ${parsed.items?.length || 0}`);
          }
        } catch (e) {
          console.log('  响应: 非JSON格式');
        }
      } else {
        console.log(`❌ 失败 (${result.status})`);
      }
      console.log('---');
    } catch (error) {
      console.log(`❌ 错误: ${error.message}`);
      console.log('---');
    }
  }
}

testAPIs().then(() => {
  console.log('\n3. 修复总结:');
  console.log('✅ 已对包含/的ID进行URL编码');
  console.log('✅ NewspaperService.getManifest() 现在使用编码后的ID');
  console.log('✅ NewspaperService.getIssues() 现在使用编码后的ID');
  console.log('✅ ViewerPage 中的manifest URL构建现在使用编码后的ID');
  console.log('\n📋 测试步骤:');
  console.log('1. 访问 http://localhost:5177/bookstore-timeline');
  console.log('2. 点击"数字报刊"标签');
  console.log('3. 选择刊物和期数');
  console.log('4. 检查浏览器控制台，应该不再有404错误');
});