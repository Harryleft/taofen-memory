const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const RedisCache = require('./lib/redis-cache');
const IIIFCache = require('./lib/iiif-cache');
const ImageCache = require('./lib/image-cache');
const logger = require('./lib/logger');
const errorHandler = require('./middleware/error-handler');

const app = express();
const PORT = process.env.PORT || 3002;

// 中间件
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 1000, // 限制每个IP最多1000个请求
  message: {
    error: '请求过于频繁，请稍后重试'
  }
});
app.use('/api/', limiter);

// 初始化缓存
let redisCache;
let iiifCache;
let imageCache;

async function initializeCache() {
  try {
    redisCache = new RedisCache();
    await redisCache.connect();
    
    iiifCache = new IIIFCache(redisCache);
    imageCache = new ImageCache();
    
    logger.info('缓存服务初始化成功');
  } catch (error) {
    logger.error('缓存服务初始化失败:', error);
    process.exit(1);
  }
}

// 路由
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'taofen-cache-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// IIIF缓存相关路由
app.get('/api/cache/iiif/info/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const result = await iiifCache.getIIIFInfo(identifier);
    res.json(result);
  } catch (error) {
    logger.error('获取IIIF信息失败:', error);
    res.status(500).json({ error: '获取IIIF信息失败' });
  }
});

app.get('/api/cache/iiif/region/:identifier/:region/:size/:rotation/:quality', async (req, res) => {
  try {
    const { identifier, region, size, rotation, quality } = req.params;
    const result = await iiifCache.getIIIFImage(identifier, { region, size, rotation, quality });
    res.json(result);
  } catch (error) {
    logger.error('获取IIIF图像失败:', error);
    res.status(500).json({ error: '获取IIIF图像失败' });
  }
});

// 通用缓存路由
app.post('/api/cache/set', async (req, res) => {
  try {
    const { key, value, ttl } = req.body;
    
    if (!key || value === undefined) {
      return res.status(400).json({ error: '缺少必要参数: key, value' });
    }
    
    const result = await redisCache.set(key, value, ttl);
    res.json({ success: true, result });
  } catch (error) {
    logger.error('设置缓存失败:', error);
    res.status(500).json({ error: '设置缓存失败' });
  }
});

app.get('/api/cache/get/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const result = await redisCache.get(key);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('获取缓存失败:', error);
    res.status(500).json({ error: '获取缓存失败' });
  }
});

app.delete('/api/cache/delete/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const result = await redisCache.delete(key);
    res.json({ success: true, result });
  } catch (error) {
    logger.error('删除缓存失败:', error);
    res.status(500).json({ error: '删除缓存失败' });
  }
});

// 批量操作
app.post('/api/cache/mget', async (req, res) => {
  try {
    const { keys } = req.body;
    
    if (!Array.isArray(keys) || keys.length === 0) {
      return res.status(400).json({ error: 'keys必须是非空数组' });
    }
    
    const result = await redisCache.mget(keys);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('批量获取缓存失败:', error);
    res.status(500).json({ error: '批量获取缓存失败' });
  }
});

app.post('/api/cache/clear', async (req, res) => {
  try {
    const { pattern } = req.body;
    const result = await redisCache.clear(pattern);
    res.json({ success: true, result });
  } catch (error) {
    logger.error('清空缓存失败:', error);
    res.status(500).json({ error: '清空缓存失败' });
  }
});

// 图片缓存相关路由

// 缓存图片元数据
app.post('/api/cache/image/metadata', async (req, res) => {
  try {
    const { imageId, metadata, ttl } = req.body;
    
    if (!imageId || !metadata) {
      return res.status(400).json({ error: '缺少必要参数: imageId, metadata' });
    }
    
    const result = await imageCache.cacheImageMetadata(imageId, metadata, ttl);
    res.json({ success: true, result });
  } catch (error) {
    logger.error('缓存图片元数据失败:', error);
    res.status(500).json({ error: '缓存图片元数据失败' });
  }
});

// 获取图片元数据
app.get('/api/cache/image/metadata/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    const metadata = await imageCache.getImageMetadata(imageId);
    res.json({ success: true, data: metadata });
  } catch (error) {
    logger.error('获取图片元数据失败:', error);
    res.status(500).json({ error: '获取图片元数据失败' });
  }
});

// 缓存图片尺寸
app.post('/api/cache/image/dimensions', async (req, res) => {
  try {
    const { imageId, dimensions, ttl } = req.body;
    
    if (!imageId || !dimensions) {
      return res.status(400).json({ error: '缺少必要参数: imageId, dimensions' });
    }
    
    const result = await imageCache.cacheImageDimensions(imageId, dimensions, ttl);
    res.json({ success: true, result });
  } catch (error) {
    logger.error('缓存图片尺寸失败:', error);
    res.status(500).json({ error: '缓存图片尺寸失败' });
  }
});

// 获取图片尺寸
app.get('/api/cache/image/dimensions/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    const dimensions = await imageCache.getImageDimensions(imageId);
    res.json({ success: true, data: dimensions });
  } catch (error) {
    logger.error('获取图片尺寸失败:', error);
    res.status(500).json({ error: '获取图片尺寸失败' });
  }
});

// 批量获取图片尺寸
app.post('/api/cache/image/dimensions/batch', async (req, res) => {
  try {
    const { imageIds } = req.body;
    
    if (!Array.isArray(imageIds) || imageIds.length === 0) {
      return res.status(400).json({ error: 'imageIds必须是非空数组' });
    }
    
    const dimensions = await imageCache.batchGetImageDimensions(imageIds);
    res.json({ success: true, data: dimensions });
  } catch (error) {
    logger.error('批量获取图片尺寸失败:', error);
    res.status(500).json({ error: '批量获取图片尺寸失败' });
  }
});

// 缓存瀑布流布局
app.post('/api/cache/image/layout', async (req, res) => {
  try {
    const { layoutKey, layout, ttl } = req.body;
    
    if (!layoutKey || !layout) {
      return res.status(400).json({ error: '缺少必要参数: layoutKey, layout' });
    }
    
    const result = await imageCache.cacheLayout(layoutKey, layout, ttl);
    res.json({ success: true, result });
  } catch (error) {
    logger.error('缓存瀑布流布局失败:', error);
    res.status(500).json({ error: '缓存瀑布流布局失败' });
  }
});

// 获取瀑布流布局
app.get('/api/cache/image/layout/:layoutKey', async (req, res) => {
  try {
    const { layoutKey } = req.params;
    const layout = await imageCache.getLayout(layoutKey);
    res.json({ success: true, data: layout });
  } catch (error) {
    logger.error('获取瀑布流布局失败:', error);
    res.status(500).json({ error: '获取瀑布流布局失败' });
  }
});

// 缓存预加载队列
app.post('/api/cache/image/preload', async (req, res) => {
  try {
    const { queueId, queue, ttl } = req.body;
    
    if (!queueId || !queue) {
      return res.status(400).json({ error: '缺少必要参数: queueId, queue' });
    }
    
    const result = await imageCache.cachePreloadQueue(queueId, queue, ttl);
    res.json({ success: true, result });
  } catch (error) {
    logger.error('缓存预加载队列失败:', error);
    res.status(500).json({ error: '缓存预加载队列失败' });
  }
});

// 获取预加载队列
app.get('/api/cache/image/preload/:queueId', async (req, res) => {
  try {
    const { queueId } = req.params;
    const queue = await imageCache.getPreloadQueue(queueId);
    res.json({ success: true, data: queue });
  } catch (error) {
    logger.error('获取预加载队列失败:', error);
    res.status(500).json({ error: '获取预加载队列失败' });
  }
});

// 清除图片缓存
app.delete('/api/cache/image/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    const result = await imageCache.clearImageCache(imageId);
    res.json({ success: true, result });
  } catch (error) {
    logger.error('清除图片缓存失败:', error);
    res.status(500).json({ error: '清除图片缓存失败' });
  }
});

// 清除布局缓存
app.delete('/api/cache/image/layout/:layoutKey', async (req, res) => {
  try {
    const { layoutKey } = req.params;
    const result = await imageCache.clearLayoutCache(layoutKey);
    res.json({ success: true, result });
  } catch (error) {
    logger.error('清除布局缓存失败:', error);
    res.status(500).json({ error: '清除布局缓存失败' });
  }
});

// 图片缓存统计
app.get('/api/cache/image/stats', async (req, res) => {
  try {
    const stats = await imageCache.getCacheStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('获取图片缓存统计失败:', error);
    res.status(500).json({ error: '获取图片缓存统计失败' });
  }
});

// 缓存统计
app.get('/api/cache/stats', async (req, res) => {
  try {
    const stats = await redisCache.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('获取缓存统计失败:', error);
    res.status(500).json({ error: '获取缓存统计失败' });
  }
});

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
async function startServer() {
  await initializeCache();
  
  app.listen(PORT, () => {
    logger.info(`缓存服务启动成功，端口: ${PORT}`);
    logger.info(`Redis Insight: http://localhost:5540`);
    logger.info(`健康检查: http://localhost:${PORT}/api/health`);
  });
}

// 优雅关闭
process.on('SIGTERM', async () => {
  logger.info('收到SIGTERM信号，开始优雅关闭...');
  if (redisCache) {
    await redisCache.disconnect();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('收到SIGINT信号，开始优雅关闭...');
  if (redisCache) {
    await redisCache.disconnect();
  }
  process.exit(0);
});

// 启动服务
startServer();

module.exports = app;