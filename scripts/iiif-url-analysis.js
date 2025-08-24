// IIIF URL构建问题分析脚本
// 用于验证当前的URL构建逻辑和识别问题

console.log('=== IIIF URL构建问题分析 ===\n');

// 模拟当前的数据结构
const mockData = {
  // 第一层collection.json - 包含不同newspapers的collection
  rootCollection: {
    id: 'https://www.ai4dh.cn/iiif/3/manifests/collection.json',
    items: [
      {
        id: 'https://www.ai4dh.cn/iiif/3/manifests/DGWB/collection.json',
        label: { zh: ['大公报'] }
      },
      {
        id: 'https://www.ai4dh.cn/iiif/3/manifests/SB/collection.json', 
        label: { zh: ['申报'] }
      }
    ]
  },
  
  // 第二层collection.json - 包含具体期数manifest URL
  dgwbCollection: {
    id: 'https://www.ai4dh.cn/iiif/3/manifests/DGWB/collection.json',
    items: [
      {
        id: 'https://www.ai4dh.cn/iiif/3/manifests/DGWB/1945-01-01/manifest.json',
        label: { 'zh-CN': ['1945年1月1日'] },
        summary: { 'zh-CN': ['第1期'] }
      },
      {
        id: 'https://www.ai4dh.cn/iiif/3/manifests/DGWB/1945-01-02/manifest.json',
        label: { 'zh-CN': ['1945年1月2日'] },
        summary: { 'zh-CN': ['第2期'] }
      }
    ]
  }
};

// 模拟当前的extractPublicationId函数
function extractPublicationId(collectionUrl) {
  const match = collectionUrl.match(/([^/]+)\/collection\.json$/);
  return match ? match[1] : '';
}

// 模拟当前的extractIssueId函数
function extractIssueId(manifestUrl) {
  if (manifestUrl.includes('/manifest.json')) {
    const match = manifestUrl.match(/([^/]+)\/manifest\.json$/);
    return match ? match[1] : '';
  }
  
  const parts = manifestUrl.split('/');
  return parts[parts.length - 1] || '';
}

// 模拟当前的getProxyUrl函数
function getProxyUrl(url) {
  if (!url) return '';
  
  if (url.includes('manifest.json')) {
    return `/proxy?url=${encodeURIComponent(url)}`;
  }
  
  if (url.includes('collection.json')) {
    return `/proxy?url=${encodeURIComponent(url)}`;
  }
  
  const manifestUrl = url.endsWith('/manifest.json') ? url : `${url}/manifest.json`;
  return `/proxy?url=${encodeURIComponent(manifestUrl)}`;
}

console.log('1. 数据结构分析：');
console.log('   根Collection:', mockData.rootCollection.id);
console.log('   大公报Collection:', mockData.dgwbCollection.id);
console.log('   大公报期数Manifest:', mockData.dgwbCollection.items[0].id);

console.log('\n2. 当前extractPublicationId测试：');
const pubId = extractPublicationId(mockData.dgwbCollection.id);
console.log(`   输入: ${mockData.dgwbCollection.id}`);
console.log(`   输出: ${pubId}`);

console.log('\n3. 当前extractIssueId测试：');
const issueId = extractIssueId(mockData.dgwbCollection.items[0].id);
console.log(`   输入: ${mockData.dgwbCollection.items[0].id}`);
console.log(`   输出: ${issueId}`);

console.log('\n4. 问题识别：');
console.log('   ❌ 问题1: extractIssueId对于完整的manifest URL返回日期部分');
console.log('   ❌ 问题2: loadViewer函数中存在逻辑错误');
console.log('   ❌ 问题3: URL构建过程过于复杂');

console.log('\n5. 正确的URL应该是：');
console.log(`   期望: https://www.ai4dh.cn/iiif/3/manifests/DGWB/1945-01-01/manifest.json`);
console.log(`   当前构建逻辑可能产生错误: https://www.ai4dh.cn/iiif/3/manifests/DGWB/1945-01-01/manifest.json/manifest.json`);

console.log('\n6. 根本原因分析：');
console.log('   - 没有正确识别manifest URL的类型');
console.log('   - extractIssueId函数逻辑错误');
console.log('   - loadViewer函数的URL构建逻辑有问题');

// 模拟修复后的逻辑
console.log('\n=== 修复方案 ===');

function extractIssueIdFixed(manifestUrl) {
  // 如果是完整的manifest URL，提取日期部分
  if (manifestUrl.includes('/manifest.json')) {
    const match = manifestUrl.match(/([^/]+)\/manifest\.json$/);
    return match ? match[1] : '';
  }
  
  // 如果是collection.json URL，这不是issue，返回空
  if (manifestUrl.includes('collection.json')) {
    return '';
  }
  
  // 如果是相对路径，直接返回
  return manifestUrl;
}

function buildManifestUrlFixed(issueManifest, publicationId) {
  // 如果issueManifest已经是完整的manifest URL，直接使用
  if (issueManifest.startsWith('http') && issueManifest.includes('manifest.json')) {
    return issueManifest;
  }
  
  // 如果issueManifest是collection.json URL，这是错误的
  if (issueManifest.includes('collection.json')) {
    console.error('Error: Expected manifest URL but got collection URL');
    return '';
  }
  
  // 如果issueManifest是相对路径（日期），构建完整URL
  if (issueManifest && !issueManifest.includes('/')) {
    return `https://www.ai4dh.cn/iiif/3/manifests/${publicationId}/${issueManifest}/manifest.json`;
  }
  
  // 其他情况，直接返回
  return issueManifest;
}

console.log('\n7. 修复后的逻辑测试：');
const fixedIssueId = extractIssueIdFixed(mockData.dgwbCollection.items[0].id);
console.log(`   修复后的extractIssueId: ${fixedIssueId}`);

const fixedManifestUrl = buildManifestUrlFixed(mockData.dgwbCollection.items[0].id, 'DGWB');
console.log(`   修复后的manifest URL: ${fixedManifestUrl}`);

console.log('\n8. 关键洞察：');
console.log('   ✅ IIIF数据结构是两层collection.json结构');
console.log('   ✅ 第二层collection中的items直接包含manifest URL');
console.log('   ✅ 不需要复杂的URL构建，直接使用items中的manifest URL');
console.log('   ✅ 当前的extractIssueId和loadViewer逻辑过度复杂');

console.log('\n9. Linus式解决方案：');
console.log('   "好的程序员担心数据结构，差的程序员担心代码"');
console.log('   - 简化数据结构理解');
console.log('   - 消除特殊情况处理');
console.log('   - 直接使用API返回的数据');