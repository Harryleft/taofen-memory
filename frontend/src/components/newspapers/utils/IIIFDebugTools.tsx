import React, { useState, useEffect } from 'react';

interface IIIFDebugToolsProps {
  isVisible: boolean;
  onClose: () => void;
}

export const IIIFDebugTools: React.FC<IIIFDebugToolsProps> = ({ isVisible, onClose }) => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [networkRequests, setNetworkRequests] = useState<any[]>([]);
  const [manifestData, setManifestData] = useState<any>(null);

  useEffect(() => {
    if (isVisible) {
      refreshDebugInfo();
    }
  }, [isVisible]);

  const refreshDebugInfo = () => {
    // 获取调试信息
    const info = {
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      uvLoaded: typeof (window as any).UV !== 'undefined',
      uvAdapterLoaded: typeof (window as any).UV?.IIIFURLAdapter !== 'undefined',
      proxyAvailable: typeof fetch !== 'undefined',
    };
    setDebugInfo(info);

    // 获取网络请求历史
    setNetworkRequests((window as any).networkRequests || []);

    // 获取manifest数据
    setManifestData((window as any).debugManifest || null);
  };

  const analyzeThumbnailIssue = () => {
    console.log('🔍 开始分析缩略图问题...');
    
    // 检查网络请求历史
    console.log('📡 网络请求历史:');
    if (networkRequests.length > 0) {
      networkRequests.forEach((req, index) => {
        console.log(`  ${index + 1}. [${req.type}] ${req.url}`);
        if (req.url.includes('1024,')) {
          console.log(`     ✅ 包含1024尺寸参数`);
        } else if (req.url.includes('thumbnail') || req.url.includes('thumb')) {
          console.log(`     ⚠️ 可能是缩略图URL，但没有1024尺寸参数`);
        }
      });
    } else {
      console.log('  暂无网络请求记录');
    }
    
    // 检查manifest数据
    console.log('📋 Manifest数据分析:');
    if (manifestData) {
      console.log(`  - 类型: ${manifestData.type}`);
      console.log(`  - 总页数: ${manifestData.items?.length || 0}`);
      
      if (manifestData.items && manifestData.items.length > 0) {
        const firstPage = manifestData.items[0];
        console.log(`  - 第一页缩略图数量: ${firstPage.thumbnail?.length || 0}`);
        console.log(`  - 第一页主图像数量: ${firstPage.items?.length || 0}`);
        
        // 分析缩略图URL
        if (firstPage.thumbnail && firstPage.thumbnail.length > 0) {
          const thumbnailUrl = firstPage.thumbnail[0].id;
          console.log(`  - 第一页缩略图URL: ${thumbnailUrl}`);
          console.log(`  - 缩略图包含1024尺寸: ${thumbnailUrl.includes('1024,')}`);
          console.log(`  - 缩略图是完整IIIF URL: ${thumbnailUrl.includes('/full/') && thumbnailUrl.includes('/default.jpg')}`);
        }
        
        // 分析主图像URL
        if (firstPage.items && firstPage.items.length > 0) {
          const mainImageUrl = firstPage.items[0].items[0].body.id;
          console.log(`  - 第一页主图像URL: ${mainImageUrl}`);
          console.log(`  - 主图像包含max尺寸: ${mainImageUrl.includes('max')}`);
          console.log(`  - 主图像是完整IIIF URL: ${mainImageUrl.includes('/full/') && mainImageUrl.includes('/default.jpg')}`);
        }
      }
    } else {
      console.log('  暂无manifest数据');
    }
    
    // 测试URL转换
    testUrlConversion();
    
    console.log('✅ 缩略图问题分析完成');
  };

  const testUrlConversion = () => {
    console.log('🧪 测试URL转换函数...');
    const testUrls = [
      'https://www.ai4dh.cn/iiif/3/shenghuozhoukan/di01juandi003qi/00.jpg',
      'https://www.ai4dh.cn/iiif/3/dazhongshenghuozhoukan/1-16-chuangkanhao/00.jpg'
    ];
    
    testUrls.forEach((url, index) => {
      console.log(`\\n🔍 测试URL ${index + 1}:`, url);
      
      // 测试缩略图转换
      const thumbnailConverted = (window as any).convertToIIIFUrl ? 
        (window as any).convertToIIIFUrl(url, true, '1024,') : url;
      console.log(`  缩略图转换: ${thumbnailConverted}`);
      console.log(`  包含1024尺寸: ${thumbnailConverted.includes('1024,')}`);
      
      // 测试主图像转换
      const mainConverted = (window as any).convertToIIIFUrl ? 
        (window as any).convertToIIIFUrl(url, true, 'max') : url;
      console.log(`  主图像转换: ${mainConverted}`);
      console.log(`  包含max尺寸: ${mainConverted.includes('max')}`);
    });
  };

  const clearConsole = () => {
    console.clear();
  };

  const exportDebugData = () => {
    const data = {
      debugInfo,
      networkRequests,
      manifestData,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iiif-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isVisible) return null;

  return (
    <div className="iiif-debug-tools" style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.95)',
      color: 'white',
      padding: '20px',
      borderRadius: '12px',
      zIndex: 10000,
      maxWidth: '400px',
      maxHeight: '80vh',
      overflowY: 'auto',
      fontSize: '13px',
      fontFamily: 'Monaco, Consolas, monospace',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
          🔧 IIIF调试工具
        </h4>
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '0',
            lineHeight: '1'
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button 
          onClick={analyzeThumbnailIssue}
          style={{
            padding: '8px 12px',
            background: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            textAlign: 'left'
          }}
        >
          🔍 分析缩略图问题
        </button>
        
        <button 
          onClick={testUrlConversion}
          style={{
            padding: '8px 12px',
            background: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            textAlign: 'left'
          }}
        >
          🧪 测试URL转换
        </button>
        
        <button 
          onClick={refreshDebugInfo}
          style={{
            padding: '8px 12px',
            background: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            textAlign: 'left'
          }}
        >
          🔄 刷新调试信息
        </button>
        
        <button 
          onClick={clearConsole}
          style={{
            padding: '8px 12px',
            background: '#9c27b0',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            textAlign: 'left'
          }}
        >
          🧹 清空控制台
        </button>
        
        <button 
          onClick={exportDebugData}
          style={{
            padding: '8px 12px',
            background: '#607d8b',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            textAlign: 'left'
          }}
        >
          📥 导出调试数据
        </button>
        
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 12px',
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            textAlign: 'left'
          }}
        >
          🔄 重新加载页面
        </button>
      </div>

      {debugInfo && (
        <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #555' }}>
          <h5 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>📊 系统信息</h5>
          <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
            <div>UV加载: {debugInfo.uvLoaded ? '✅' : '❌'}</div>
            <div>适配器加载: {debugInfo.uvAdapterLoaded ? '✅' : '❌'}</div>
            <div>代理可用: {debugInfo.proxyAvailable ? '✅' : '❌'}</div>
            <div>时间戳: {new Date(debugInfo.timestamp).toLocaleString()}</div>
          </div>
        </div>
      )}

      {networkRequests.length > 0 && (
        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #555' }}>
          <h5 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>📡 网络请求 ({networkRequests.length})</h5>
          <div style={{ fontSize: '10px', maxHeight: '100px', overflowY: 'auto' }}>
            {networkRequests.slice(-5).map((req, index) => (
              <div key={index} style={{ marginBottom: '4px', paddingBottom: '4px', borderBottom: '1px solid #333' }}>
                <div>[{req.type}] {req.url}</div>
                <div style={{ color: '#aaa', fontSize: '9px' }}>
                  {new Date(req.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '15px', fontSize: '10px', color: '#aaa', textAlign: 'center' }}>
        💡 在控制台中使用 window.UVDebugTools 访问更多功能
      </div>
    </div>
  );
};