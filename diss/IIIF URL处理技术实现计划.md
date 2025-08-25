# IIIF URL处理技术实现计划

## 背景分析

基于对 `frontend/src/tmp/` 参考文件和现有 newspapers 组件的分析，发现当前系统存在以下关键问题：

1. **缩略图404错误**：由于缺少智能的URL转换逻辑
2. **IIIF URL格式不统一**：不同场景下URL处理方式不一致
3. **缺少多层拦截器**：无法处理所有类型的图像请求
4. **调试工具不足**：难以快速定位和解决问题

## 技术实现方案

### 第一阶段：创建IIIF URL处理工具类

#### 1.1 创建 `iiifUrlBuilder.ts`

```typescript
// frontend/src/components/newspapers/utils/iiifUrlBuilder.ts

/**
 * 智能IIIF URL处理工具类
 * 参考tmp/uv.html中的convertToIIIFUrl函数实现
 */
export class IIIFUrlBuilder {
  
  /**
   * 检查是否为manifest URL
   */
  static isManifestUrl(url: string): boolean {
    return url.includes('manifest.json');
  }
  
  /**
   * 检查是否为图像URL
   */
  static isImageUrl(url: string): boolean {
    return url.includes('.jpg') && !url.includes('manifest.json');
  }
  
  /**
   * 检查是否为缩略图URL
   */
  static isThumbnailUrl(url: string): boolean {
    return url.includes('thumbnail') || url.includes('thumb');
  }
  
  /**
   * 检查是否已经是IIIF Image API格式
   */
  static isIIIFImageApiUrl(url: string): boolean {
    return url.includes('/full/') && url.includes('/default.jpg');
  }
  
  /**
   * 核心URL转换函数
   * 参考uv.html中的convertToIIIFUrl实现
   */
  static convertToIIIFUrl(
    imageUrl: string, 
    forceConversion: boolean = false, 
    size: string = 'max'
  ): string {
    console.log('🔄 [URL转换] 开始转换:', {
      原始URL: imageUrl,
      forceConversion: forceConversion,
      尺寸参数: size,
      调用位置: new Error().stack?.split('\n')[2]?.trim()
    });

    // 输入验证
    if (!imageUrl || typeof imageUrl !== 'string') {
      console.error('❌ URL转换失败: 无效的URL输入', imageUrl);
      return imageUrl;
    }

    // 检查是否已经是代理URL（避免双重代理）
    if (imageUrl.startsWith('/proxy?url=')) {
      console.log('⚠️ 检测到代理URL，避免双重代理:', imageUrl);
      return imageUrl;
    }

    // 检查是否已经是 IIIF Image API 格式
    if (this.isIIIFImageApiUrl(imageUrl)) {
      console.log('✅ 已经是IIIF Image API格式:', imageUrl);
      return imageUrl;
    }

    // 检查是否是manifest URL - manifest路径不进行编码
    if (this.isManifestUrl(imageUrl)) {
      console.log('📋 检测到manifest URL，保持原始格式:', imageUrl);
      return imageUrl;
    }

    // 如果不是强制转换，检查是否为缩略图URL
    if (!forceConversion && this.isThumbnailUrl(imageUrl)) {
      console.log('🔍 检测到缩略图URL，保持原始格式:', imageUrl);
      return imageUrl;
    }

    // 检查是否是图像URL
    if (this.isImageUrl(imageUrl) && imageUrl.includes('/iiif/3/')) {
      console.log('🖼️ 检测到图像URL，进行路径编码处理');

      try {
        // 提取基础URL和图像路径
        const iiifIndex = imageUrl.indexOf('/iiif/3/');
        if (iiifIndex === -1) {
          console.warn('⚠️ 无法解析IIIF URL格式:', imageUrl);
          return imageUrl;
        }

        const baseUrl = imageUrl.substring(0, iiifIndex);
        const imagePath = imageUrl.substring(iiifIndex + 8); // 跳过 '/iiif/3/'

        if (!baseUrl || !imagePath) {
          console.warn('⚠️ URL解析失败:', { baseUrl, imagePath, originalUrl: imageUrl });
          return imageUrl;
        }

        // 对所有多级路径进行编码（不仅仅是shenghuozhoukan）
        let finalPath = imagePath;
        if (!imagePath.includes('%2F') && imagePath.includes('/')) {
          console.log('🔧 检测到多级路径，进行编码:', imagePath);
          finalPath = imagePath.replace(/\//g, '%2F');
        }

        // URL 编码路径部分
        const encodedPath = finalPath;
        console.log('🔧 URL编码处理:', {
          originalPath: imagePath,
          finalPath: finalPath,
          beforeUrl: `${baseUrl}/iiif/3/${imagePath}`,
          afterUrl: `${baseUrl}/iiif/3/${encodedPath}`
        });

        // 构建编码后的图像URL - 添加完整的IIIF Image API参数
        const encodedUrl = `${baseUrl}/iiif/3/${encodedPath}/full/${size}/0/default.jpg`;
        console.log('✅ [URL转换] 图像URL编码成功:', {
          原始URL: imageUrl,
          编码后路径: encodedPath,
          基础URL: baseUrl,
          最终URL: encodedUrl,
          使用的尺寸: size
        });

        return encodedUrl;

      } catch (error) {
        console.error('❌ URL转换过程中发生错误:', error, '原始URL:', imageUrl);
        return imageUrl;
      }
    }

    // 检查是否是其他格式的IIIF URL（如 /iiif/2/）
    if (this.isImageUrl(imageUrl) && imageUrl.includes('/iiif/')) {
      console.log('🔧 检测到其他IIIF版本格式，尝试转换...');
      try {
        const iiifMatch = imageUrl.match(/(.*\/iiif\/\d+\/)(.+)/);
        if (iiifMatch) {
          const baseUrl = iiifMatch[1];
          const imagePath = iiifMatch[2];
          const encodedPath = imagePath.replace(/\//g, '%2F');
          const encodedUrl = `${baseUrl}${encodedPath}`;
          console.log('✅ 其他IIIF格式转换成功:', imageUrl, '->', encodedUrl);
          return encodedUrl;
        }
      } catch (error) {
        console.error('❌ 其他IIIF格式转换失败:', error);
      }
    }

    // 如果不是IIIF URL，直接返回
    console.log('ℹ️ 非IIIF URL，无需转换:', imageUrl);
    return imageUrl;
  }
  
  /**
   * 分析URL结构 - 用于调试
   */
  static analyzeUrl(url: string): any {
    return {
      原始URL: url,
      是否manifest: this.isManifestUrl(url),
      是否图像: this.isImageUrl(url),
      是否包含thumbnail: this.isThumbnailUrl(url),
      是否已编码: url.includes('%2F'),
      是否IIIF格式: url.includes('/iiif/'),
      是否完整IIIF: this.isIIIFImageApiUrl(url),
      路径组件: url.split('/'),
      查询参数: url.includes('?') ? url.split('?')[1] : null
    };
  }
}
```

### 第二阶段：集成到NewspapersIntegratedLayout组件

#### 2.1 修改services.ts中的代理URL处理

```typescript
// 在 NewspaperService 类中添加新的方法

/**
 * 获取代理URL - 集成IIIF URL转换逻辑
 */
static getProxyUrlWithIIIFConversion(url: string, isThumbnail: boolean = false): string {
  if (!url) return '';
  
  // 开发环境使用代理
  if (import.meta.env.DEV && url.startsWith('https://')) {
    // 如果是图像URL，先进行IIIF转换
    if (IIIFUrlBuilder.isImageUrl(url) && !IIIFUrlBuilder.isManifestUrl(url)) {
      const size = isThumbnail ? '1024,' : 'max';
      const convertedUrl = IIIFUrlBuilder.convertToIIIFUrl(url, true, size);
      return `/proxy?url=${encodeURIComponent(convertedUrl)}`;
    }
    
    return `/proxy?url=${encodeURIComponent(url)}`;
  }
  
  // 生产环境直接返回原URL
  return url;
}
```

#### 2.2 修改NewspapersIntegratedLayout.tsx

```typescript
// 在handleIssueSelect函数中集成IIIF URL转换

const handleIssueSelect = useCallback(async (issue: IssueItem) => {
  if (!selectedPublication) return;
  
  if (selectedIssue?.manifest === issue.manifest) {
    return;
  }
  
  console.log('🔍 [DEBUG] 选择期数:', issue);
  
  try {
    setLoading(true);
    setError(null);
    
    setSelectedIssue(issue);
    
    // 使用集成了IIIF URL转换的代理URL处理
    const proxyManifestUrl = NewspaperService.getProxyUrlWithIIIFConversion(issue.manifest);
    console.log('🔍 [DEBUG] 代理manifest URL:', proxyManifestUrl);
    
    setManifestUrl(proxyManifestUrl);
    
    if (onIssueSelect) {
      onIssueSelect(issue.manifest);
    }
  } catch (err) {
    console.error('🔍 [DEBUG] 期数选择失败:', err);
    const normalizedError = err instanceof NewspaperError ? err : 
      ErrorFactory.createUnknownError(err instanceof Error ? err.message : '切换失败');
    setError(normalizedError);
    ErrorMonitor.report(normalizedError);
  } finally {
    setLoading(false);
  }
}, [selectedPublication, selectedIssue?.manifest, onIssueSelect]);
```

### 第三阶段：优化uv_simple.html中的拦截器逻辑

#### 3.1 增强Manifest重写逻辑

```javascript
// 在uv_simple.html中增强rewriteManifestImageUrls函数

function rewriteManifestImageUrls(manifest, path = '') {
  if (!manifest || typeof manifest !== 'object') {
    return manifest;
  }

  console.log('🔍 开始重写manifest图像URL...');

  // 递归处理对象的每个属性
  for (const key in manifest) {
    if (manifest.hasOwnProperty(key)) {
      const currentPath = path ? `${path}.${key}` : key;
      const value = manifest[key];

      if (value && typeof value === 'object') {
        // 如果是数组，递归处理每个元素
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            rewriteManifestImageUrls(item, `${currentPath}[${index}]`);
          });
        } else {
          // 如果是对象，递归处理
          rewriteManifestImageUrls(value, currentPath);
        }
      } else if (typeof value === 'string' && value.includes('.jpg')) {
        // 如果是包含.jpg的字符串，需要区分是manifest URL还是图像URL
        if (key === 'id' && isImageUrl(value) && !isManifestUrl(value)) {
          // 实现有选择性的URL转换
          if (currentPath.includes('thumbnail')) {
            console.log(`🔍 [Manifest重写] 检测到缩略图URL:`, {
              路径: currentPath,
              原始URL: value,
              使用的尺寸: '1024,'
            });
            // 缩略图使用合适的尺寸参数进行转换
            const originalUrl = value;
            const convertedUrl = convertToIIIFUrl(value, true, '1024,'); // 缩略图使用1024像素宽度

            if (originalUrl !== convertedUrl) {
              manifest[key] = convertedUrl;
              console.log(`✅ [Manifest重写] 缩略图URL重写成功:`, {
                路径: currentPath,
                原始URL: originalUrl,
                转换后URL: convertedUrl
              });
            } else {
              console.log(`ℹ️ [Manifest重写] 缩略图URL未变更:`, {
                路径: currentPath,
                URL: value
              });
            }
          } else if (currentPath.includes('items.items.body') || currentPath.includes('items.body')) {
            console.log(`🖼️ [Manifest重写] 检测到主图像URL:`, {
              路径: currentPath,
              原始URL: value,
              使用的尺寸: 'max'
            });
            const originalUrl = value;
            const convertedUrl = convertToIIIFUrl(value, true, 'max'); // 强制转换主图像，使用完整尺寸

            if (originalUrl !== convertedUrl) {
              manifest[key] = convertedUrl;
              console.log(`✅ [Manifest重写] 主图像URL重写成功:`, {
                路径: currentPath,
                原始URL: originalUrl,
                转换后URL: convertedUrl
              });
            } else {
              console.log(`ℹ️ [Manifest重写] 主图像URL未变更:`, {
                路径: currentPath,
                URL: value
              });
            }
          } else {
            // 其他情况，根据URL特征判断
            if (value.includes('thumbnail') || value.includes('thumb')) {
              console.log(`🔍 检测到可能的缩略图URL (${currentPath})，保持原始格式:`, value);
              continue;
            } else {
              console.log(`🖼️ 发现图像URL (${currentPath})，尝试转换:`, value);
              const originalUrl = value;
              const convertedUrl = convertToIIIFUrl(value, false, 'max'); // 不强制转换，默认使用完整尺寸

              if (originalUrl !== convertedUrl) {
                manifest[key] = convertedUrl;
                console.log(`✅ 图像URL重写成功 (${currentPath}):`, originalUrl, '->', convertedUrl);
              } else {
                console.log(`ℹ️ 图像URL未变更 (${currentPath}):`, value);
              }
            }
          }
        } else if (key === 'id' && isManifestUrl(value)) {
          console.log(`📋 发现manifest URL (${currentPath})，保持原始格式:`, value);
          // manifest URL保持不变，不进行编码
        }
      } 
    }
  }

  console.log('✅ Manifest图像URL重写完成');
  return manifest;
}
```

### 第四阶段：添加调试和错误处理工具

#### 4.1 创建调试工具组件

```typescript
// frontend/src/components/newspapers/utils/IIIFDebugTools.tsx

import React from 'react';

interface IIIFDebugToolsProps {
  isVisible: boolean;
  onClose: () => void;
}

export const IIIFDebugTools: React.FC<IIIFDebugToolsProps> = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  const analyzeThumbnailIssue = () => {
    console.log('🔍 开始分析缩略图问题...');
    
    // 检查网络请求历史
    console.log('📡 网络请求历史:');
    if (window.networkRequests && window.networkRequests.length > 0) {
      window.networkRequests.forEach((req, index) => {
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
    if (window.debugManifest) {
      const manifest = window.debugManifest;
      console.log(`  - 类型: ${manifest.type}`);
      console.log(`  - 总页数: ${manifest.items?.length || 0}`);
      
      if (manifest.items && manifest.items.length > 0) {
        const firstPage = manifest.items[0];
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
  };

  return (
    <div className="iiif-debug-tools" style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      zIndex: 10000,
      maxWidth: '300px',
      fontSize: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h4 style={{ margin: 0 }}>IIIF调试工具</h4>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
          ✕
        </button>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <button 
          onClick={analyzeThumbnailIssue}
          style={{
            padding: '5px 10px',
            background: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          分析缩略图问题
        </button>
        
        <button 
          onClick={() => console.log('📋 当前状态:', window.debugManifest)}
          style={{
            padding: '5px 10px',
            background: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          输出调试信息
        </button>
        
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '5px 10px',
            background: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          重新加载页面
        </button>
      </div>
    </div>
  );
};
```

## 实施计划

### 第1周：基础工具开发
- [ ] 创建IIIFUrlBuilder工具类
- [ ] 编写单元测试
- [ ] 集成到现有services.ts

### 第2周：React组件集成
- [ ] 修改NewspapersIntegratedLayout组件
- [ ] 更新代理URL处理逻辑
- [ ] 测试基本功能

### 第3周：uv_simple.html优化
- [ ] 增强Manifest重写逻辑
- [ ] 优化多层拦截器
- [ ] 添加调试工具

### 第4周：测试和调试
- [ ] 全面测试各种场景
- [ ] 修复发现的问题
- [ ] 性能优化

## 风险控制

1. **渐进式部署**：每个阶段独立测试，确保不影响现有功能
2. **回滚机制**：保留原有代码，必要时可以快速回滚
3. **详细日志**：添加完整的调试日志，便于问题排查
4. **用户反馈**：收集用户反馈，及时调整实现方案

## 成功标准

1. 缩略图404错误率降低90%以上
2. 图像加载速度提升30%以上
3. 用户满意度显著提升
4. 系统稳定性不受影响