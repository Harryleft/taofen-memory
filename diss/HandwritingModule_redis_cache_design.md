# 手稿组件Redis缓存层设计方案

## 1. 概述

本文档基于之前的缓存层设计，进一步探讨使用Redis作为核心缓存层的架构方案。Redis作为高性能内存数据库，可以为手稿组件提供更强大的缓存能力和更好的多用户体验。

## 2. Redis缓存层优势分析

### 2.1 性能优势

- **读写速度**：Redis内存数据库，读写速度可达100K ops/s
- **低延迟**：网络延迟通常在1-5ms，相比前端计算仍具优势
- **高并发**：支持数千并发连接，适合多用户场景

### 2.2 功能优势

- **丰富数据结构**：String、Hash、List、Set、Sorted Set等
- **原子操作**：支持事务和原子操作，保证数据一致性
- **持久化**：RDB和AOF持久化，数据安全性高
- **分布式**：支持集群模式，可横向扩展

### 2.3 运维优势

- **集中管理**：统一的缓存管理界面
- **监控完善**：成熟的监控和告警机制
- **生态丰富**：大量管理工具和客户端库

## 3. Redis vs 前端缓存对比

### 3.1 性能对比

| 缓存类型 | 访问速度 | 容量限制 | 多用户共享 | 离线支持 |
|---------|---------|---------|-----------|---------|
| 前端内存缓存 | ~0.1ms | 50-100MB | ❌ | ✅ |
| Redis缓存 | ~1-5ms | 内存大小 | ✅ | ❌ |
| 前端持久化缓存 | ~5-10ms | 浏览器限制 | ❌ | ✅ |

### 3.2 适用场景对比

| 缓存类型 | 适用场景 | 数据类型 | 生命周期 |
|---------|---------|---------|---------|
| 前端内存缓存 | 热点数据、计算结果 | 临时数据 | 会话级别 |
| Redis缓存 | 共享数据、原始数据 | 持久数据 | 应用级别 |
| 前端持久化缓存 | 离线数据、用户偏好 | 用户数据 | 长期 |

## 4. 混合缓存架构设计

### 4.1 三层缓存架构

```
用户请求 → 前端内存缓存 → Redis缓存 → 前端持久化缓存 → API
```

### 4.2 缓存策略分层

#### L1缓存 - 前端内存缓存
- **存储介质**：JavaScript Map + LRU
- **容量限制**：50MB
- **缓存内容**：最热数据、计算结果
- **过期时间**：5-10分钟

#### L2缓存 - Redis缓存
- **存储介质**：Redis服务器
- **容量限制**：服务器内存
- **缓存内容**：原始数据、搜索结果、元数据
- **过期时间**：1-24小时

#### L3缓存 - 前端持久化缓存
- **存储介质**：IndexedDB
- **容量限制**：浏览器限制
- **缓存内容**：离线数据、用户偏好
- **过期时间**：永久或手动失效

## 5. Redis缓存具体实现

### 5.1 数据结构设计

#### 5.1.1 原始数据缓存
```redis
# 手稿原始数据 - String类型
SET handwriting:raw:data:v1 "{...}" EX 86400

# 数据版本控制
SET handwriting:version:data "v1"

# 数据元信息
HSET handwriting:metadata:data v1:count 74 v1:last_update "2024-01-01"
```

#### 5.1.2 元数据索引缓存
```redis
# 年份索引 - Set类型
SADD handwriting:index:years 1937 1938 1939

# 来源索引 - Set类型
SADD handwriting:index:sources "韬奋纪念馆" "私人收藏"

# 标签索引 - Set类型
SADD handwriting:index:tags "题词" "文稿" "书信"

# 分类统计 - Hash类型
HSET handwriting:stats:category 题词 25 文稿 30 书信 19
```

#### 5.1.3 搜索结果缓存
```redis
# 搜索结果 - String类型(JSON)
SET handwriting:search:a1b2c3 "[{...}]" EX 300

# 搜索历史 - List类型
LPUSH handwriting:user:123:search "韬奋题词"
LTRIM handwriting:user:123:search 0 9

# 热门搜索 - Sorted Set类型
ZADD handwriting:popular:searches 150 "韬奋" 120 "题词" 100 "1937"
```

#### 5.1.4 用户个性化缓存
```redis
# 用户过滤器偏好 - Hash类型
HSET handwriting:user:123:filters category "题词" year "1937" source "韬奋纪念馆"

# 用户浏览历史 - List类型
LPUSH handwriting:user:123:viewed "item_001"
LTRIM handwriting:user:123:viewed 0 19

# 用户收藏 - Set类型
SADD handwriting:user:123:favorites "item_001" "item_002"
```

### 5.2 缓存键设计规范

```typescript
class RedisCacheKey {
  // 原始数据
  static rawData(version: string): string {
    return `handwriting:raw:data:${version}`;
  }
  
  // 元数据索引
  static index(type: string): string {
    return `handwriting:index:${type}`;
  }
  
  // 搜索结果
  static search(hash: string): string {
    return `handwriting:search:${hash}`;
  }
  
  // 用户相关
  static user(userId: string, type: string): string {
    return `handwriting:user:${userId}:${type}`;
  }
  
  // 统计数据
  static stats(type: string): string {
    return `handwriting:stats:${type}`;
  }
}
```

### 5.3 缓存操作封装

```typescript
class RedisCacheManager {
  private redis: Redis;
  
  constructor(redisClient: Redis) {
    this.redis = redisClient;
  }
  
  // 获取原始数据
  async getRawData(): Promise<TransformedHandwritingItem[]> {
    const version = await this.redis.get('handwriting:version:data');
    const cached = await this.redis.get(RedisCacheKey.rawData(version));
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    // 从API获取数据
    const data = await fetchHandwritingData();
    const transformed = transformData(data);
    
    // 缓存到Redis
    await this.redis.setex(
      RedisCacheKey.rawData(version),
      86400, // 24小时
      JSON.stringify(transformed)
    );
    
    return transformed;
  }
  
  // 获取搜索结果
  async getSearchResult(filters: FilterState): Promise<HandwritingItem[]> {
    const hash = hashFilters(filters);
    const cached = await this.redis.get(RedisCacheKey.search(hash));
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    // 计算搜索结果
    const result = await computeSearchResult(filters);
    
    // 缓存结果
    await this.redis.setex(
      RedisCacheKey.search(hash),
      300, // 5分钟
      JSON.stringify(result)
    );
    
    return result;
  }
  
  // 记录用户搜索历史
  async addUserSearchHistory(userId: string, searchTerm: string): Promise<void> {
    const key = RedisCacheKey.user(userId, 'search');
    await this.redis.lpush(key, searchTerm);
    await this.redis.ltrim(key, 0, 9); // 保留最近10条
    await this.redis.expire(key, 86400 * 30); // 30天过期
  }
  
  // 获取热门搜索
  async getPopularSearches(limit: number = 10): Promise<string[]> {
    return await this.redis.zrevrange(
      'handwriting:popular:searches',
      0,
      limit - 1
    );
  }
  
  // 更新搜索热度
  async incrementSearchPopularity(searchTerm: string): Promise<void> {
    await this.redis.zincrby('handwriting:popular:searches', 1, searchTerm);
  }
}
```

## 6. 缓存更新和失效策略

### 6.1 主动失效机制

```typescript
class CacheInvalidation {
  private redis: Redis;
  
  // 数据更新时失效相关缓存
  async invalidateOnDataUpdate(): Promise<void> {
    // 更新版本号
    const newVersion = `v${Date.now()}`;
    await this.redis.set('handwriting:version:data', newVersion);
    
    // 清理搜索结果缓存
    const keys = await this.redis.keys('handwriting:search:*');
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
    
    // 发送缓存失效通知
    await this.redis.publish('cache:invalidation', JSON.stringify({
      type: 'data_update',
      version: newVersion,
      timestamp: Date.now()
    }));
  }
  
  // 定期清理过期缓存
  async cleanupExpiredCache(): Promise<void> {
    // Redis会自动清理过期键，这里可以做一些额外的清理工作
    const keys = await this.redis.keys('handwriting:user:*:search');
    for (const key of keys) {
      const ttl = await this.redis.ttl(key);
      if (ttl === -1) { // 没有过期时间
        await this.redis.expire(key, 86400 * 30); // 设置30天过期
      }
    }
  }
}
```

### 6.2 缓存预热策略

```typescript
class CacheWarmup {
  private redis: Redis;
  
  // 预热基础数据
  async warmupBasicData(): Promise<void> {
    // 预热原始数据
    const rawData = await this.getRawData();
    
    // 预热元数据索引
    const metadata = await this.extractMetadata(rawData);
    await this.cacheMetadata(metadata);
    
    // 预热热门搜索结果
    const popularSearches = await this.getPopularSearches();
    for (const search of popularSearches) {
      await this.getSearchResult({ searchTerm: search });
    }
  }
  
  // 定时预热
  async scheduleWarmup(): Promise<void> {
    // 每天凌晨预热
    setInterval(() => {
      this.warmupBasicData();
    }, 24 * 60 * 60 * 1000);
  }
}
```

## 7. 前端适配器设计

### 7.1 混合缓存管理器

```typescript
class HybridCacheManager {
  private memoryCache: LRUCache<string, any>;
  private redisCache: RedisCacheManager;
  private persistentCache: IndexedDBCache;
  
  constructor() {
    this.memoryCache = new LRUCache({ max: 50 });
    this.redisCache = new RedisCacheManager(redisClient);
    this.persistentCache = new IndexedDBCache();
  }
  
  async get<T>(key: string): Promise<T | null> {
    // L1: 内存缓存
    const memoryResult = this.memoryCache.get(key);
    if (memoryResult) {
      return memoryResult;
    }
    
    // L2: Redis缓存
    const redisResult = await this.redisCache.get(key);
    if (redisResult) {
      this.memoryCache.set(key, redisResult);
      return redisResult;
    }
    
    // L3: 持久化缓存
    const persistentResult = await this.persistentCache.get(key);
    if (persistentResult) {
      this.memoryCache.set(key, persistentResult);
      return persistentResult;
    }
    
    return null;
  }
  
  async set<T>(key: string, value: T, strategy: CacheStrategy): Promise<void> {
    // 根据策略决定缓存级别
    if (strategy.level === 'memory' || strategy.level === 'both') {
      this.memoryCache.set(key, value, strategy.ttl);
    }
    
    if (strategy.level === 'redis' || strategy.level === 'both') {
      await this.redisCache.set(key, value, strategy);
    }
    
    if (strategy.level === 'persistent') {
      await this.persistentCache.set(key, value, strategy);
    }
  }
}
```

### 7.2 React Hooks适配

```typescript
// 使用Redis缓存的React Hook
export function useHandwritingDataWithRedis() {
  const cache = useHybridCache();
  
  return useQuery({
    queryKey: ['handwriting-data-redis'],
    queryFn: async () => {
      // 尝试从混合缓存获取
      const cached = await cache.get<TransformedHandwritingItem[]>(
        'handwriting_transformed_data'
      );
      
      if (cached) {
        return cached;
      }
      
      // 从API获取
      const data = await fetchHandwritingData();
      const transformed = transformData(data);
      
      // 缓存到多层
      await cache.set('handwriting_transformed_data', transformed, {
        level: 'both',
        ttl: 24 * 60 * 60 * 1000
      });
      
      return transformed;
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000
  });
}
```

## 8. 性能监控和统计

### 8.1 Redis监控指标

```typescript
interface RedisCacheMetrics {
  // 基础指标
  hitRate: number;
  totalRequests: number;
  hits: number;
  misses: number;
  
  // 性能指标
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  
  // 资源使用
  memoryUsage: number;
  keyCount: number;
  connectionCount: number;
  
  // 按数据类型统计
  byDataType: {
    rawData: { hits: number; misses: number; size: number };
    searchResults: { hits: number; misses: number; size: number };
    userData: { hits: number; misses: number; size: number };
  };
}
```

### 8.2 监控实现

```typescript
class RedisCacheMonitor {
  private redis: Redis;
  private metrics: RedisCacheMetrics;
  
  async collectMetrics(): Promise<RedisCacheMetrics> {
    const info = await this.redis.info('memory');
    const stats = await this.redis.info('stats');
    
    return {
      hitRate: this.calculateHitRate(),
      totalRequests: this.metrics.totalRequests,
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      averageResponseTime: this.calculateAverageResponseTime(),
      p95ResponseTime: this.calculatePercentile(95),
      p99ResponseTime: this.calculatePercentile(99),
      memoryUsage: this.parseMemoryInfo(info),
      keyCount: await this.redis.dbsize(),
      connectionCount: this.parseConnectionInfo(stats),
      byDataType: this.metrics.byDataType
    };
  }
}
```

## 9. 部署和运维

### 9.1 Redis配置建议

```redis
# redis.conf
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
timeout 300
tcp-keepalive 60
```

### 9.2 容器化部署

```dockerfile
# Dockerfile
FROM redis:7-alpine

COPY redis.conf /etc/redis/redis.conf

EXPOSE 6379

CMD ["redis-server", "/etc/redis/redis.conf"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  redis:
    build: .
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    environment:
      - REDIS_PASSWORD=your_password
    restart: unless-stopped

volumes:
  redis_data:
```

## 10. 实现计划

### 10.1 第一阶段：Redis基础设施

**任务**：
1. 部署Redis服务
2. 实现Redis缓存管理器
3. 实现缓存键设计和数据结构
4. 集成到现有数据获取流程

**预期收益**：
- 建立Redis缓存基础设施
- 多用户共享缓存数据
- 为后续功能奠定基础

### 10.2 第二阶段：混合缓存优化

**任务**：
1. 实现三层混合缓存架构
2. 优化缓存策略和失效机制
3. 实现缓存预热和清理
4. 添加性能监控

**预期收益**：
- 进一步提升性能
- 更好的用户体验
- 完善的缓存管理

### 10.3 第三阶段：高级功能

**任务**：
1. 实现用户个性化功能
2. 实现实时数据同步
3. 实现分布式缓存
4. 完善监控和告警

**预期收益**：
- 个性化用户体验
- 高可用性
- 生产级可用性

## 11. 风险评估

### 11.1 技术风险

**风险1：Redis单点故障**
- **影响**：缓存服务不可用
- **缓解**：Redis集群、主从复制

**风险2：网络延迟**
- **影响**：缓存响应变慢
- **缓解**：前端缓存兜底、连接池优化

**风险3：内存溢出**
- **影响**：Redis服务崩溃
- **缓解**：内存限制、监控告警

### 11.2 运维风险

**风险1：部署复杂度**
- **影响**：开发运维成本增加
- **缓解**：容器化部署、自动化运维

**风险2：监控难度**
- **影响**：问题排查困难
- **缓解**：完善监控体系、日志记录

## 12. 总结

Redis作为缓存层为手稿组件提供了更强大的缓存能力和更好的多用户体验。通过三层混合缓存架构，可以在保持前端缓存优势的同时，充分利用Redis的高性能和丰富的数据结构。

**主要优势**：
- 多用户共享缓存数据
- 集中化的缓存管理
- 丰富的数据结构支持
- 完善的监控和运维工具

**建议实施策略**：
1. 先建立Redis基础设施
2. 逐步迁移核心缓存功能
3. 持续优化和监控

这种混合架构在手稿组件场景下能够提供最佳的性能和用户体验。