// 测试网络请求和数据获取
console.log('🔍 开始测试网络请求...');

async function testNetworkRequests() {
  try {
    // 测试原始URL
    console.log('🔍 [1] 测试原始URL...');
    const originalUrl = 'https://www.ai4dh.cn/iiif/3/manifests/collection.json';
    console.log('🔍 请求URL:', originalUrl);
    
    const response = await fetch(originalUrl);
    console.log('🔍 响应状态:', response.status);
    console.log('🔍 响应头:', response.headers);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('🔍 数据结构:', {
      '@context': data['@context'],
      type: data.type,
      itemsCount: data.items?.length || 0,
      firstItem: data.items?.[0]
    });
    
    // 测试代理URL
    console.log('🔍 [2] 测试代理URL...');
    const proxyUrl = `/proxy?url=${encodeURIComponent(originalUrl)}`;
    console.log('🔍 代理URL:', proxyUrl);
    
    const proxyResponse = await fetch(proxyUrl);
    console.log('🔍 代理响应状态:', proxyResponse.status);
    
    if (proxyResponse.ok) {
      const proxyData = await proxyResponse.json();
      console.log('🔍 代理数据结构:', {
        '@context': proxyData['@context'],
        type: proxyData.type,
        itemsCount: proxyData.items?.length || 0
      });
    } else {
      console.warn('🔍 代理请求失败:', proxyResponse.statusText);
    }
    
    return data;
  } catch (error) {
    console.error('🔍 网络请求测试失败:', error);
    throw error;
  }
}

// 模拟数据处理
function processData(data) {
  console.log('🔍 [3] 测试数据处理...');
  
  if (!data.items || !Array.isArray(data.items)) {
    console.warn('🔍 数据中没有items数组');
    return [];
  }
  
  const publications = data.items.map((it, i) => {
    const collectionId = it.id.match(/([^/]+)\/collection\.json$/)?.[1] || it.id;
    
    return {
      i, 
      id: collectionId,
      collection: it.id,
      title: (it.label?.zh?.[0]) || (it.label?.['zh-CN']?.[0]) || (it.label?.en?.[0]) || '未知刊物',
      name: (it.label?.zh?.[0]) || (it.label?.['zh-CN']?.[0]) || (it.label?.en?.[0]) || '未知刊物',
      issueCount: 0,
      lastUpdated: null
    };
  });
  
  console.log('🔍 处理后的刊物数据:', publications);
  return publications;
}

// 主测试函数
async function main() {
  try {
    console.log('🔍 === 开始网络请求测试 ===');
    
    const rawData = await testNetworkRequests();
    const publications = processData(rawData);
    
    console.log('🔍 === 测试结果 ===');
    console.log('✅ 原始URL请求成功');
    console.log('✅ 数据处理成功');
    console.log(`✅ 获取到 ${publications.length} 个刊物`);
    
    if (publications.length > 0) {
      console.log('🔍 示例刊物:', publications[0]);
    }
    
  } catch (error) {
    console.error('🔍 === 测试失败 ===');
    console.error('❌ 错误:', error.message);
    console.log('🔍 [建议] 检查网络连接和代理配置');
  }
}

// 运行测试
main().catch(console.error);