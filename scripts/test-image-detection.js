/**
 * 测试不同格式的图像URL处理
 * 验证当前代码是否能正确处理各种图像格式
 */

const testImageUrls = [
    // 标准JPG格式
    'https://www.ai4dh.cn/iiif/3/dazhongshenghuozhoukan/1-16-chuangkanhao/page_1.jpg',
    'https://www.ai4dh.cn/iiif/3/dazhongshenghuozhoukan/1-16-chuangkanhao/00.jpg',
    
    // 其他图像格式
    'https://www.ai4dh.cn/iiif/3/dazhongshenghuozhoukan/1-16-chuangkanhao/page_1.jpeg',
    'https://www.ai4dh.cn/iiif/3/dazhongshenghuozhoukan/1-16-chuangkanhao/page_1.png',
    'https://www.ai4dh.cn/iiif/3/dazhongshenghuozhoukan/1-16-chuangkanhao/page_1.tif',
    'https://www.ai4dh.cn/iiif/3/dazhongshenghuozhoukan/1-16-chuangkanhao/page_1.tiff',
    
    // 相对路径
    '/iiif/3/dazhongshenghuozhoukan/1-16-chuangkanhao/page_1.jpg',
    'dazhongshenghuozhoukan/1-16-chuangkanhao/page_1.jpg',
    
    // 已经是IIIF Image API格式
    'https://www.ai4dh.cn/iiif/3/dazhongshenghuozhoukan/1-16-chuangkanhao/page_1/full/1024,/0/default.jpg',
];

console.log('🧪 === 图像URL处理测试 ===\n');

// 模拟当前的检测逻辑
function currentImageDetection(obj) {
    return obj.type === 'Image' && obj.id && obj.id.includes('.jpg');
}

// 改进的检测逻辑
function improvedImageDetection(obj) {
    if (!obj.type === 'Image' || !obj.id) return false;
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.tif', '.tiff', '.jp2', '.jpx', '.webp'];
    const url = obj.id.toLowerCase();
    
    // 检查文件扩展名
    return imageExtensions.some(ext => url.includes(ext)) ||
           // 检查IIIF Image API模式
           (url.includes('/iiif/') && url.includes('/full/'));
}

// 测试每个URL
testImageUrls.forEach((url, index) => {
    console.log(`\\n🧪 测试 ${index + 1}: ${url}`);
    
    // 模拟manifest中的图像对象
    const imageObj = {
        type: 'Image',
        id: url,
        format: 'image/jpeg'
    };
    
    // 当前逻辑检测结果
    const currentResult = currentImageDetection(imageObj);
    console.log(`📝 [当前逻辑] 检测结果: ${currentResult ? '✅ 会处理' : '❌ 会忽略'}`);
    
    // 改进逻辑检测结果
    const improvedResult = improvedImageDetection(imageObj);
    console.log(`📝 [改进逻辑] 检测结果: ${improvedResult ? '✅ 会处理' : '❌ 会忽略'}`);
    
    // 分析差异
    if (currentResult !== improvedResult) {
        console.log('🔍 [分析] 两种逻辑检测结果不同，改进逻辑能处理更多格式');
    }
});

console.log('\\n🎯 === 测试总结 ===');
console.log('❌ 当前逻辑问题：');
console.log('   - 只能处理包含.jpg的URL');
console.log('   - 无法处理.jpeg、.png、.tif等其他格式');
console.log('   - 对于"00.jpg"这样的文件名可能处理不稳定');

console.log('\\n✅ 改进逻辑优势：');
console.log('   - 支持多种图像格式');
console.log('   - 能识别IIIF Image API格式');
console.log('   - 更好的兼容性');

console.log('\\n🚀 建议：更新图像检测逻辑以支持更多格式');