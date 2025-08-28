# 图片加载Redis缓存设计方案

## 📋 设计概述

### 核心目标
为韬奋文库项目的图片加载系统引入Redis缓存，提升性能和用户体验，防止过度工程化。

### 设计原则
- **简洁实用**：最小化代码变更，复用现有架构
- **渐进式实施**：分阶段部署，降低风险
- **失效安全**：Redis故障时自动降级到直接访问
- **开发友好**：本地和生产环境统一配置

## 🎯 现有架构分析

### 当前图片加载流程
```
前端应用 → Vite代理 → IIIF服务器(ai4dh.cn)
    ↓         ↓         ↓
 React    Caddy     Universal Viewer
```

### 关键文件位置
- **前端服务**: `frontend/src/components/newspapers/services.ts`
- **IIIF查看器**: `uv_simple.html` (根目录版本已修复)
- **代理配置**: `frontend/vite.config.ts`
- **部署文件**: `frontend/public/uv_simple.html` (需要同步)

### 现有问题
1. **重复请求**：相同图片重复加载
2. **网络延迟**：每次都要访问外部服务器
3. **服务器压力**：IIIF服务器负载较高
4. **带宽消耗**：重复传输相同数据

## 🔧 缓存架构设计

### 整体架构
```
前端应用 → 缓存中间件 → Redis → IIIF服务器
    ↓         ↓         ↓       ↓
 React    Express   Redis   ai4dh.cn
```

### 缓存策略
1. **多级缓存**：
   - 浏览器缓存 (HTTP缓存)
   - Redis缓存 (服务器端)
   - 源服务器 (最终保障)

2. **缓存键设计**：
   ```
   iiif:manifest:{manifestId} → IIIF manifest信息
   iiif:image:{imageId}:{region}:{size}:{rotation} → 图像数据
   iiif:info:{imageId} → IIIF图像信息
   ```

3. **TTL策略**：
   - Manifest信息: 24小时
   - 图像数据: 2小时
   - 图像信息: 1小时

## 📁 文件夹和代码结构

### 新增文件夹
```
cache-service/          # Redis缓存服务
├── server.js           # Express服务器主文件
├── lib/
│   ├── redis-cache.js  # Redis缓存类
│   ├── iiif-cache.js   # IIIF专用缓存
│   └── logger.js       # 日志工具
├── middleware/
│   └── error-handler.js # 错误处理中间件
├── .env                # 环境变量
└── package.json        # 依赖配置
```

### 修改现有文件
```
frontend/src/
├── services/
│   ├── cache/          # 新增
│   │   ├── cache-service.ts    # 缓存API客户端
│   │   └── cache.types.ts      # 类型定义
│   └── components/
│       └── newspapers/
│           └── services.ts     # 修改：集成缓存
```

### 配置文件
```
docker-compose.dev.yml   # 开发环境Redis配置
docker-compose.yml        # 生产环境Redis配置
redis.conf               # Redis服务器配置
```

## 💻 核心实现方案

### 1. 缓存服务 (cache-service/server.js)
```javascript
const express = require('express');
const RedisCache = require('./lib/redis-cache');
const IIIFCache = require('./lib/iiif-cache');

const app = express();
const redisCache = new RedisCache();
const iiifCache = new IIIFCache(app);

// IIIF manifest缓存
app.get('/cache/iiif/manifest/:id', async (req, res) => {
    const cacheKey = `iiif:manifest:${req.params.id}`;
    const cached = await redisCache.get(cacheKey);
    
    if (cached) {
        return res.json(cached);
    }
    
    // 从源服务器获取并缓存
    const manifest = await fetchFromSource(req.params.id);
    await redisCache.set(cacheKey, manifest, 24 * 3600); // 24小时
    res.json(manifest);
});

// IIIF图像缓存
app.get('/cache/iiif/image/*', async (req, res) => {
    const imagePath = req.path.replace('/cache/iiif/image/', '');
    const cacheKey = `iiif:image:${imagePath}`;
    
    const cached = await redisCache.get(cacheKey);
    if (cached) {
        return res.redirect(cached);
    }
    
    // 代理请求并缓存结果
    const imageUrl = await iiifCache.processImageRequest(imagePath);
    await redisCache.set(cacheKey, imageUrl, 2 * 3600); // 2小时
    res.redirect(imageUrl);
});
```

### 2. 前端集成 (frontend/src/services/cache/cache-service.ts)
```typescript
export class CacheService {
    private baseUrl: string;
    
    constructor() {
        this.baseUrl = process.env.NODE_ENV === 'development' 
            ? 'http://localhost:3002' 
            : '/cache';
    }
    
    async getCachedManifest(manifestId: string): Promise<IIIFManifest> {
        const response = await fetch(`${this.baseUrl}/iiif/manifest/${manifestId}`);
        return response.json();
    }
    
    async getCachedImageUrl(imageId: string, params: IIIFImageParams): Promise<string> {
        const cacheKey = this.buildImageCacheKey(imageId, params);
        const response = await fetch(`${this.baseUrl}/iiif/image/${cacheKey}`);
        return response.text();
    }
    
    private buildImageCacheKey(imageId: string, params: IIIFImageParams): string {
        return `${imageId}/${params.region}/${params.size}/${params.rotation}`;
    }
}
```

### 3. 修改现有服务 (frontend/src/components/newspapers/services.ts)
```typescript
// 在 NewspaperDataService 类中添加缓存支持
static async getManifest(manifestId: string): Promise<IIIFManifest> {
    try {
        // 优先使用缓存
        if (this.cacheService) {
            return await this.cacheService.getCachedManifest(manifestId);
        }
        
        // 回退到原有逻辑
        const manifestUrl = this.buildProxyUrl(`https://www.ai4dh.cn/iiif/3/manifests/${manifestId}/manifest.json`);
        const response = await fetchWithProxy(manifestUrl);
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch manifest:', error);
        throw error;
    }
}
```

## 🚀 部署配置

### 本地开发环境
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
  
  cache-service:
    build: ./cache-service
    ports:
      - "3002:3000"
    environment:
      - REDIS_URL=redis://redis:6379
      - NODE_ENV=development
    depends_on:
      - redis

volumes:
  redis_data:
```

### 生产环境
```yaml
# docker-compose.yml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    restart: unless-stopped
  
  cache-service:
    build: ./cache-service
    ports:
      - "3002:3000"
    environment:
      - REDIS_URL=redis://redis:6379
      - NODE_ENV=production
    depends_on:
      - redis
    restart: unless-stopped

volumes:
  redis_data:
```

## 📊 性能优化策略

### 1. 预取机制
```typescript
// 在页面加载时预取相关图像
useEffect(() => {
    const prefetchImages = async () => {
        const visibleItems = getVisibleItems();
        for (const item of visibleItems) {
            cacheService.prefetchImage(item.imageId);
        }
    };
    prefetchImages();
}, [currentPage]);
```

### 2. 批量操作
```typescript
// 批量获取多个manifest，减少网络请求
async function getBatchManifests(manifestIds: string[]): Promise<IIIFManifest[]> {
    const promises = manifestIds.map(id => 
        cacheService.getCachedManifest(id)
    );
    return Promise.all(promises);
}
```

### 3. 智能失效
```typescript
// 数据更新时清除相关缓存
async function invalidateCache(manifestId: string) {
    await cacheService.delete(`iiif:manifest:${manifestId}`);
    // 清除相关图像缓存
    const relatedImages = await getRelatedImages(manifestId);
    for (const image of relatedImages) {
        await cacheService.delete(`iiif:image:${image}`);
    }
}
```

## 🛠️ 开发和运维

### 环境变量配置
```bash
# .env
REDIS_URL=redis://localhost:6379
CACHE_SERVICE_URL=http://localhost:3002
NODE_ENV=development
CACHE_ENABLED=true
CACHE_TTL_MANIFEST=86400    # 24小时
CACHE_TTL_IMAGE=7200         # 2小时
```

### 监控和日志
```javascript
// 缓存命中率监控
const cacheStats = {
    hits: 0,
    misses: 0,
    get hitRate() {
        return this.hits / (this.hits + this.misses);
    }
};

// 定期上报统计
setInterval(() => {
    console.log(`缓存命中率: ${(cacheStats.hitRate * 100).toFixed(2)}%`);
}, 60000); // 每分钟
```

### 故障降级
```javascript
// Redis连接失败时的降级策略
class CacheService {
    async get(key: string) {
        try {
            return await redis.get(key);
        } catch (error) {
            console.warn('Redis连接失败，降级到直接访问:', error);
            return null; // 触发降级逻辑
        }
    }
}
```

## 📈 实施计划

### 第一阶段：基础设施 (1-2天)
1. [ ] 部署Redis服务器
2. [ ] 创建缓存服务基础框架
3. [ ] 配置开发环境

### 第二阶段：核心功能 (2-3天)
1. [ ] 实现IIIF manifest缓存
2. [ ] 实现图像URL缓存
3. [ ] 集成前端服务

### 第三阶段：优化和监控 (1-2天)
1. [ ] 添加预取和批量操作
2. [ ] 实现监控和日志
3. [ ] 性能调优

### 第四阶段：生产部署 (1天)
1. [ ] 生产环境配置
2. [ ] 压力测试
3. [ ] 上线部署

## 🎯 预期效果

### 性能提升
- **首次加载**: 减少50-70%的网络请求
- **重复访问**: 90%+ 命中率，响应时间 < 100ms
- **服务器负载**: 减少60-80%的外部请求

### 用户体验
- **加载速度**: 显著提升，特别是重复访问
- **离线能力**: 部分支持（已缓存内容）
- **稳定性**: Redis故障时自动降级，不影响使用

### 运维效益
- **带宽成本**: 减少50-70%的外部带宽使用
- **服务器成本**: 降低IIIF服务器负载
- **监控能力**: 完整的缓存性能监控

## 🔍 风险控制

### 技术风险
- **缓存一致性**: 通过合理的TTL和手动失效机制控制
- **内存使用**: Redis配置LRU策略和内存限制
- **单点故障**: Redis故障时自动降级到直接访问

### 业务风险
- **数据滞后**: 通过适中的TTL平衡性能和实时性
- **用户体验**: 降级机制确保基本功能可用
- **维护成本**: 最小化代码变更，降低维护复杂度

## 📝 总结

这个设计方案提供了：

1. **简洁实用的架构**：基于现有技术栈，最小化变更
2. **渐进式实施**：分阶段部署，降低风险
3. **完善的降级机制**：确保系统稳定性
4. **良好的开发体验**：统一的环境配置和调试工具

通过引入Redis缓存，可以显著提升图片加载性能，改善用户体验，同时保持系统的可维护性和稳定性。

---

**文档状态**: 设计方案完成  
**下一步**: 开始第一阶段实施  
**预计时间**: 1周内完成核心功能