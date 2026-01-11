#!/usr/bin/env node

/**
 * IIIF API快速修复验证脚本
 * 验证修复方案是否正确工作
 */

const https = require('https');

console.log('=== IIIF API快速修复验证 ===\n');

// 测试修复后的URL构建逻辑
function testFixedUrlBuilding() {
  console.log('1. 测试修复后的URL构建逻辑:');
  
  const testUrls = [
    {
      original: 'https://www.ai4dh.cn/iiif/3/iiif/manifests/dazhongshenghuofukan/collection.json',
      fixed: 'https://www.ai4dh.cn/iiif/3/manifests/dazhongshenghuofukan/collection.json'
    },
    {
      original: 'https://www.ai4dh.cn/iiif/3/iiif/manifests/shenghuozhoukan/collection.json',
      fixed: 'https://www.ai4dh.cn/iiif/3/manifests/shenghuozhoukan/collection.json'
    }
  ];
  
  testUrls.forEach(({ original, fixed }) => {
    console.log(`   原始URL: ${original}`);
    console.log(`   修复URL: ${fixed}`);
    console.log(`   状态: ${fixed === original ? '无需修复' : '需要修复'}\n`);
  });
}

// 测试根collection
function testRootCollection() {
  console.log('2. 测试根collection:');
  
  const url = 'https://www.ai4dh.cn/iiif/3/manifests/collection.json';
  
  https.get(url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const collection = JSON.parse(data);
        console.log(`   ✅ 根collection响应正常`);
        console.log(`   标签: ${collection.label?.zh?.[0]}`);
        console.log(`   项目数量: ${collection.items?.length || 0}`);
        
        // 检查子collection状态
        const brokenCollections = collection.items?.filter(item => {
          return !item.id.includes('manifests/collection.json');
        }) || [];
        
        console.log(`   ❌ 需要修复的子collection: ${brokenCollections.length}`);
        
        if (brokenCollections.length > 0) {
          brokenCollections.forEach(item => {
            console.log(`     - ${item.id}`);
          });
        }
      } catch (error) {
        console.log(`   ❌ 解析失败: ${error.message}`);
      }
    });
  }).on('error', (error) => {
    console.log(`   ❌ 请求失败: ${error.message}`);
  });
}

// 测试修复后的URL
function testFixedUrls() {
  console.log('\n3. 测试修复后的URL:');
  
  const fixedUrls = [
    'https://www.ai4dh.cn/iiif/3/manifests/dazhongshenghuofukan/collection.json',
    'https://www.ai4dh.cn/iiif/3/manifests/shenghuozhoukan/collection.json',
    'https://www.ai4dh.cn/iiif/3/manifests/kangzhansanrikan/collection.json'
  ];
  
  fixedUrls.forEach(url => {
    console.log(`   测试: ${url}`);
    
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        console.log(`   ✅ 响应正常`);
      } else if (res.statusCode === 404) {
        console.log(`   ❌ 404 Not Found`);
      } else {
        console.log(`   ❌ 状态码: ${res.statusCode}`);
      }
    }).on('error', (error) => {
      console.log(`   ❌ 请求失败: ${error.message}`);
    });
  });
}

// 模拟修复后的服务逻辑
function simulateFixedService() {
  console.log('\n4. 模拟修复后的服务逻辑:');
  
  // 模拟根collection数据
  const mockRootCollection = {
    items: [
      {
        id: 'https://www.ai4dh.cn/iiif/3/iiif/manifests/dazhongshenghuofukan/collection.json',
        label: { zh: ['大众生活复刊'] }
      },
      {
        id: 'https://www.ai4dh.cn/iiif/3/iiif/manifests/shenghuozhoukan/collection.json',
        label: { zh: ['生活周刊'] }
      }
    ]
  };
  
  // 修复逻辑
  function fixCollectionItems(items) {
    return items.map(item => {
      // 移除多余的iiif路径段
      const fixedId = item.id.replace('/iiif/manifests', '/manifests');
      return {
        ...item,
        id: fixedId
      };
    });
  }
  
  const fixedItems = fixCollectionItems(mockRootCollection.items);
  
  console.log(`   原始项目数量: ${mockRootCollection.items.length}`);
  console.log(`   修复后项目数量: ${fixedItems.length}`);
  
  fixedItems.forEach((item, index) => {
    console.log(`   ${index + 1}. ${item.label?.zh?.[0]} -> ${item.id}`);
  });
}

// 主函数
function main() {
  testFixedUrlBuilding();
  
  setTimeout(() => {
    testRootCollection();
    
    setTimeout(() => {
      testFixedUrls();
      
      setTimeout(() => {
        simulateFixedService();
        
        console.log('\n=== 修复验证完成 ===');
        console.log('\n🎯 关键修复点:');
        console.log('1. 移除URL中的多余iiif路径段');
        console.log('2. 处理404错误并提供用户友好提示');
        console.log('3. 使用后备机制确保应用可用性');
        console.log('\n🔧 推荐实施步骤:');
        console.log('1. 修改NewspaperService中的URL构建逻辑');
        console.log('2. 添加错误处理和边界情况处理');
        console.log('3. 实现监控和报警机制');
        
      }, 2000);
    }, 2000);
  }, 1000);
}

// 运行主函数
main();