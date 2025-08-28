/**
 * 最终验证脚本 - 测试修复后的URL编码逻辑
 */

const testCases = [
    {
        name: "标准JPG格式",
        input: "https://www.ai4dh.cn/iiif/3/dazhongshenghuozhoukan/1-16-chuangkanhao/42.jpg",
        expected: "https://www.ai4dh.cn/iiif/3/dazhongshenghuozhoukan%2F1-16-chuangkanhao%2F42.jpg/full/1024,/0/default.jpg"
    },
    {
        name: "00.jpg文件名",
        input: "https://www.ai4dh.cn/iiif/3/dazhongshenghuozhoukan/1-16-chuangkanhao/00.jpg",
        expected: "https://www.ai4dh.cn/iiif/3/dazhongshenghuozhoukan%2F1-16-chuangkanhao%2F00.jpg/full/1024,/0/default.jpg"
    },
    {
        name: "已经是IIIF格式",
        input: "https://www.ai4dh.cn/iiif/3/dazhongshenghuozhoukan/1-16-chuangkanhao/page_1/full/1024,/0/default.jpg",
        expected: "https://www.ai4dh.cn/iiif/3/dazhongshenghuozhoukan/1-16-chuangkanhao/page_1/full/1024,/0/default.jpg"
    }
];

console.log('🧪 === 最终验证测试 ===\n');

// 修复后的convertToIIIFUrl函数
function convertToIIIFUrl(imageUrl) {
    console.log('🔧 [UV] 开始转换图像URL:', imageUrl);
    
    // 检查是否已经是 IIIF Image API 格式
    if (imageUrl.includes('/full/') && imageUrl.includes('/default.jpg')) {
        console.log('🔧 [UV] 已经是IIIF Image API格式，直接返回:', imageUrl);
        return imageUrl;
    }
    
    // 处理相对路径 - 如果不是完整的URL，跳过处理
    if (!imageUrl.startsWith('http')) {
        console.log('🔧 [UV] 检测到相对路径，跳过处理:', imageUrl);
        return imageUrl;
    }
    
    try {
        const urlObj = new URL(imageUrl);
        const baseUrl = urlObj.origin;
        const fullPath = urlObj.pathname.replace(/^\/iiif\/3\//, '');
        const encodedPath = encodeURIComponent(fullPath);
        const iiifUrl = `${baseUrl}/iiif/3/${encodedPath}/full/1024,/0/default.jpg`;
        console.log('✅ [UV] 图像URL转换完成:', iiifUrl);
        return iiifUrl;
    } catch (error) {
        console.error('❌ [UV] URL解析失败:', error);
        console.error('❌ [UV] 原始URL:', imageUrl);
        
        // 回退到旧的解析方法
        console.log('🔧 [UV] 使用回退解析方法...');
        const baseUrl = imageUrl.split('/iiif/3/')[0];
        const imagePath = imageUrl.split('/iiif/3/')[1];
        const encodedPath = encodeURIComponent(imagePath);
        const iiifUrl = `${baseUrl}/iiif/3/${encodedPath}/full/1024,/0/default.jpg`;
        
        console.log('🔧 [UV] 回退方法结果:', iiifUrl);
        return iiifUrl;
    }
}

let successCount = 0;
testCases.forEach((testCase, index) => {
    console.log(`\\n🧪 测试 ${index + 1}: ${testCase.name}`);
    console.log(`📝 输入: ${testCase.input}`);
    console.log(`📝 期望: ${testCase.expected}`);
    
    const result = convertToIIIFUrl(testCase.input);
    console.log(`📝 结果: ${result}`);
    
    if (result === testCase.expected) {
        console.log(`✅ 测试通过！`);
        successCount++;
    } else {
        console.log(`❌ 测试失败！`);
    }
});

console.log(`\\n🎯 === 验证总结 ===`);
console.log(`✅ 成功: ${successCount}/${testCases.length}`);
console.log(`📊 成功率: ${((successCount / testCases.length) * 100).toFixed(1)}%`);

if (successCount === testCases.length) {
    console.log('🎉 所有测试通过！修复成功！');
    console.log('🚀 现在图像URL中的斜杠会被正确编码为%2F');
} else {
    console.log('⚠️ 部分测试失败，需要进一步检查');
}