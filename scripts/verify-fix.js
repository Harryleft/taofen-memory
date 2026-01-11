/**
 * 验证修复后的图像URL处理逻辑
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

console.log('🧪 === 修复后的图像URL处理验证 ===\n');

// 修复后的检测逻辑
function fixedImageDetection(obj) {
    if (!obj.type === 'Image' || !obj.id) return false;
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.tif', '.tiff', '.jp2', '.jpx', '.webp'];
    const url = obj.id.toLowerCase();
    
    // 检查文件扩展名
    return imageExtensions.some(ext => url.includes(ext)) ||
           // 检查IIIF Image API模式
           (url.includes('/iiif/') && url.includes('/full/'));
}

// 模拟convertToIIIFUrl函数 - 修复版本
function convertToIIIFUrl(imageUrl) {
    if (imageUrl.includes('/full/') && imageUrl.includes('/default.jpg')) {
        return imageUrl;
    }
    
    try {
        const urlObj = new URL(imageUrl);
        const baseUrl = urlObj.origin;
        const fullPath = urlObj.pathname.replace(/^\/iiif\/3\//, '');
        const encodedPath = encodeURIComponent(fullPath);
        const iiifUrl = `${baseUrl}/iiif/3/${encodedPath}/full/1024,/0/default.jpg`;
        return iiifUrl;
    } catch (error) {
        const baseUrl = imageUrl.split('/iiif/3/')[0];
        const imagePath = imageUrl.split('/iiif/3/')[1];
        const encodedPath = encodeURIComponent(imagePath);
        const iiifUrl = `${baseUrl}/iiif/3/${encodedPath}/full/1024,/0/default.jpg`;
        return iiifUrl;
    }
}

// 测试每个URL
let successCount = 0;
testImageUrls.forEach((url, index) => {
    console.log(`\\n🧪 测试 ${index + 1}: ${url}`);
    
    // 模拟manifest中的图像对象
    const imageObj = {
        type: 'Image',
        id: url,
        format: 'image/jpeg'
    };
    
    // 修复后逻辑检测结果
    const detectionResult = fixedImageDetection(imageObj);
    console.log(`📝 [修复后逻辑] 检测结果: ${detectionResult ? '✅ 会处理' : '❌ 会忽略'}`);
    
    if (detectionResult) {
        // 测试URL转换
        try {
            const convertedUrl = convertToIIIFUrl(url);
            console.log(`📝 [URL转换] 转换结果: ${convertedUrl}`);
            
            // 验证转换结果
            const hasCorrectStructure = convertedUrl.includes('/full/1024,/0/default.jpg');
            const hasCorrectEncoding = convertedUrl.includes('%2F'); // 应该有编码的斜杠
            
            if (hasCorrectStructure && hasCorrectEncoding) {
                console.log(`📝 [验证] ✅ 转换成功`);
                successCount++;
            } else {
                console.log(`📝 [验证] ❌ 转换失败 - 结构: ${hasCorrectStructure ? '✅' : '❌'}, 编码: ${hasCorrectEncoding ? '✅' : '❌'}`);
            }
        } catch (error) {
            console.log(`📝 [URL转换] ❌ 转换失败: ${error.message}`);
        }
    }
});

console.log(`\\n🎯 === 验证总结 ===`);
console.log(`✅ 成功处理: ${successCount}/${testImageUrls.length} 个URL`);
console.log(`📊 成功率: ${((successCount / testImageUrls.length) * 100).toFixed(1)}%`);

if (successCount === testImageUrls.length) {
    console.log('🎉 所有测试通过！修复成功！');
} else {
    console.log('⚠️ 部分测试失败，需要进一步检查');
}