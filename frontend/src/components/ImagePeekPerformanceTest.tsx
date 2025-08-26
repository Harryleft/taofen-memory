import React, { useState, useEffect, useRef } from 'react';

/**
 * 图片预览性能测试组件
 * 用于对比三种实现方案的性能差异
 */
export const ImagePeekPerformanceTest: React.FC = () => {
  const [testResults, setTestResults] = useState<{
    clipPath: number;
    overflow: number;
    scale: number;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [imageCount, setImageCount] = useState(50);
  
  const testContainerRef = useRef<HTMLDivElement>(null);

  const generateTestImages = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      src: `https://picsum.photos/seed/perf-${i}/300/400.jpg`,
      alt: `测试图片 ${i + 1}`,
    }));
  };

  const measurePerformance = async () => {
    setIsTesting(true);
    const results = {
      clipPath: 0,
      overflow: 0,
      scale: 0,
    };

    // 清空容器
    if (testContainerRef.current) {
      testContainerRef.current.innerHTML = '';
    }

    // 测试clip-path方案
    const clipPathImages = generateTestImages(imageCount);
    const clipPathContainer = document.createElement('div');
    clipPathContainer.className = 'grid grid-cols-5 gap-4 mb-8';
    clipPathContainer.innerHTML = clipPathImages.map(img => `
      <div class="image-peek-container image-peek-performance" style="height: 150px;">
        <img src="${img.src}" alt="${img.alt}" class="image-peek-clip" style="clip-path: inset(0 0 80% 0);" />
      </div>
    `).join('');
    
    if (testContainerRef.current) {
      testContainerRef.current.appendChild(clipPathContainer);
    }

    // 测量clip-path性能
    const clipPathStartTime = performance.now();
    await new Promise(resolve => setTimeout(resolve, 100));
    const clipPathElements = clipPathContainer.querySelectorAll('.image-peek-container');
    clipPathElements.forEach(el => {
      el.classList.add('hover');
    });
    const clipPathEndTime = performance.now();
    results.clipPath = clipPathEndTime - clipPathStartTime;

    // 测试overflow方案
    const overflowImages = generateTestImages(imageCount);
    const overflowContainer = document.createElement('div');
    overflowContainer.className = 'grid grid-cols-5 gap-4 mb-8';
    overflowContainer.innerHTML = overflowImages.map(img => `
      <div class="image-peek-overflow" style="height: 120px;">
        <img src="${img.src}" alt="${img.alt}" style="transform: translateY(0);" />
      </div>
    `).join('');
    
    if (testContainerRef.current) {
      testContainerRef.current.appendChild(overflowContainer);
    }

    // 测量overflow性能
    const overflowStartTime = performance.now();
    await new Promise(resolve => setTimeout(resolve, 100));
    const overflowElements = overflowContainer.querySelectorAll('.image-peek-overflow');
    overflowElements.forEach(el => {
      el.style.height = 'auto';
      const img = el.querySelector('img');
      if (img) {
        img.style.transform = 'translateY(0)';
      }
    });
    const overflowEndTime = performance.now();
    results.overflow = overflowEndTime - overflowStartTime;

    // 测试scale方案
    const scaleImages = generateTestImages(imageCount);
    const scaleContainer = document.createElement('div');
    scaleContainer.className = 'grid grid-cols-5 gap-4 mb-8';
    scaleContainer.innerHTML = scaleImages.map(img => `
      <div class="image-peek-scale" style="height: 120px;">
        <img src="${img.src}" alt="${img.alt}" style="height: 600px;" />
      </div>
    `).join('');
    
    if (testContainerRef.current) {
      testContainerRef.current.appendChild(scaleContainer);
    }

    // 测量scale性能
    const scaleStartTime = performance.now();
    await new Promise(resolve => setTimeout(resolve, 100));
    const scaleElements = scaleContainer.querySelectorAll('.image-peek-scale');
    scaleElements.forEach(el => {
      el.style.height = 'auto';
      const img = el.querySelector('img');
      if (img) {
        img.style.height = 'auto';
      }
    });
    const scaleEndTime = performance.now();
    results.scale = scaleEndTime - scaleStartTime;

    setTestResults(results);
    setIsTesting(false);
  };

  const getPerformanceGrade = (time: number) => {
    if (time < 50) return { grade: 'A', color: 'text-green-600', description: '优秀' };
    if (time < 100) return { grade: 'B', color: 'text-yellow-600', description: '良好' };
    if (time < 200) return { grade: 'C', color: 'text-orange-600', description: '一般' };
    return { grade: 'D', color: 'text-red-600', description: '较差' };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">图片预览性能测试</h1>
      
      {/* 测试控制面板 */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">测试设置</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="imageCount" className="text-sm font-medium">图片数量:</label>
            <select
              id="imageCount"
              value={imageCount}
              onChange={(e) => setImageCount(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-1"
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
          <button
            onClick={measurePerformance}
            disabled={isTesting}
            className={`px-4 py-2 rounded font-medium ${
              isTesting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isTesting ? '测试中...' : '开始性能测试'}
          </button>
        </div>
      </div>

      {/* 测试结果 */}
      {testResults && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">测试结果</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(testResults).map(([method, time]) => {
              const grade = getPerformanceGrade(time);
              return (
                <div key={method} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2 capitalize">{method}</h3>
                  <div className="text-2xl font-bold mb-2">{time.toFixed(2)}ms</div>
                  <div className={`text-lg font-semibold ${grade.color}`}>
                    等级: {grade.grade}
                  </div>
                  <div className="text-sm text-gray-600">{grade.description}</div>
                </div>
              );
            })}
          </div>
          
          {/* 性能分析 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">性能分析</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Clip-path方案：{testResults.clipPath < testResults.overflow ? '✅' : '❌'} 性能{testResults.clipPath < testResults.overflow ? '最优' : '较差'}</li>
              <li>• Overflow方案：{testResults.overflow < testResults.scale ? '✅' : '❌'} 性能{testResults.overflow < testResults.scale ? '较好' : '较差'}</li>
              <li>• Scale方案：{testResults.scale > testResults.clipPath ? '❌' : '✅'} 性能{testResults.scale > testResults.clipPath ? '较差' : '最优'}</li>
            </ul>
          </div>
        </div>
      )}

      {/* 技术说明 */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">技术说明</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Clip-path方案</h3>
            <p className="text-sm text-gray-600">
              使用CSS clip-path属性，只显示图片的顶部20%区域。这是最现代和性能最佳的方案，
              支持GPU加速，不会引起重排，只影响元素的可见部分。
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Overflow方案</h3>
            <p className="text-sm text-gray-600">
              使用overflow:hidden和容器高度控制。兼容性最好，但在展开时可能引起重排，
              性能略低于clip-path。
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Scale方案</h3>
            <p className="text-sm text-gray-600">
              使用transform scale和图片高度控制。视觉效果独特，但性能最差，
              因为需要处理更大的图片尺寸。
            </p>
          </div>
        </div>
      </div>

      {/* 测试容器 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">测试可视化</h2>
        <div ref={testContainerRef} className="min-h-[400px]">
          {!testResults && (
            <div className="text-center text-gray-500 py-20">
              点击"开始性能测试"查看性能对比
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImagePeekPerformanceTest;