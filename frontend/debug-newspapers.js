// 调试报纸卡片组件数据显示问题
console.log('🔍 开始调试报纸卡片组件数据显示问题...');

// 模拟 NewspaperService.getPublications() 调用
async function debugGetPublications() {
  console.log('🔍 [DEBUG] 开始调用 NewspaperService.getPublications()');
  
  try {
    // 模拟 collection URL
    const collectionUrl = 'https://www.ai4dh.cn/iiif/3/manifests/collection.json';
    console.log('🔍 [DEBUG] Collection URL:', collectionUrl);
    
    // 检查网络请求
    console.log('🔍 [DEBUG] 开始网络请求...');
    const response = await fetch(collectionUrl);
    console.log('🔍 [DEBUG] HTTP 状态:', response.status);
    console.log('🔍 [DEBUG] 响应头:', response.headers);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('🔍 [DEBUG] 响应数据结构:', {
      '@context': data['@context'],
      type: data.type,
      itemsCount: data.items?.length || 0,
      firstItem: data.items?.[0]
    });
    
    // 模拟数据处理
    if (data.items && Array.isArray(data.items)) {
      console.log('🔍 [DEBUG] 开始处理刊物数据...');
      const publications = data.items.map((it, i) => {
        const collectionId = it.id.match(/([^/]+)\/collection\.json$/)?.[1] || it.id;
        console.log(`🔍 [DEBUG] 处理刊物 ${i}:`, {
          id: collectionId,
          title: it.label?.zh?.[0] || it.label?.['zh-CN']?.[0] || it.label?.en?.[0] || '未知刊物',
          originalId: it.id
        });
        
        return {
          i, 
          id: collectionId,
          collection: it.id,
          title: (it.label?.zh?.[0]) || (it.label?.['zh-CN']?.[0]) || (it.label?.en?.[0]) || '未知刊物',
          name: (it.label?.zh?.[0]) || (it.label?.['zh-CN']?.0]) || (it.label?.en?.[0]) || '未知刊物',
          issueCount: 0,
          lastUpdated: null
        };
      });
      
      console.log('🔍 [DEBUG] 处理后的刊物数据:', publications);
      return publications;
    } else {
      console.warn('🔍 [DEBUG] 响应中没有 items 数组');
      return [];
    }
  } catch (error) {
    console.error('🔍 [DEBUG] 获取刊物列表失败:', error);
    return [];
  }
}

// 检查代理设置
function checkProxySetup() {
  console.log('🔍 [DEBUG] 检查代理设置...');
  console.log('🔍 [DEBUG] 当前环境:', import.meta.env.MODE);
  console.log('🔍 [DEBUG] 是否为开发环境:', import.meta.env.DEV);
  
  // 检查 Vite 代理配置
  const proxyUrl = '/proxy?url=https://www.ai4dh.cn/iiif/3/manifests/collection.json';
  console.log('🔍 [DEBUG] 代理URL:', proxyUrl);
}

// 检查组件渲染
function checkComponentRendering() {
  console.log('🔍 [DEBUG] 检查组件渲染...');
  
  // 模拟组件数据
  const mockPublication = {
    i: 0,
    id: 'test-publication',
    collection: 'https://www.ai4dh.cn/iiif/3/manifests/test-publication/collection.json',
    title: '测试刊物',
    name: '测试刊物',
    issueCount: 10,
    lastUpdated: '2023-01-01'
  };
  
  console.log('🔍 [DEBUG] 模拟刊物数据:', mockPublication);
  console.log('🔍 [DEBUG] VerticalNewspaperCard 应该显示:', {
    title: mockPublication.title,
    issueCount: mockPublication.issueCount,
    foundingDate: mockPublication.title.includes('全民抗战') ? '1938年7月7日' : '1938年',
    description: mockPublication.title.includes('全民抗战') ? 
      '1938年在汉口创刊，主编邹韬奋、柳湜，是当时国民党统治区影响最广的刊物。' :
      '历史报刊文献，珍贵的历史资料。'
  });
}

// 主调试函数
async function main() {
  console.log('🔍 === 开始调试 ===');
  
  // 1. 检查代理设置
  checkProxySetup();
  
  // 2. 检查网络请求
  const publications = await debugGetPublications();
  
  // 3. 检查组件渲染
  checkComponentRendering();
  
  console.log('🔍 === 调试完成 ===');
  console.log('🔍 [总结] 可能的问题点:');
  console.log('1. 网络请求失败 - CORS或代理问题');
  console.log('2. 数据处理错误 - JSON结构不符合预期');
  console.log('3. 组件渲染问题 - CSS样式或数据传递');
  console.log('4. 状态管理问题 - React状态更新');
  
  return publications;
}

// 运行调试
main().catch(console.error);