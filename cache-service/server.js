const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const RedisCache = require('./lib/redis-cache');
const IIIFCache = require('./lib/iiif-cache');
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

async function initializeCache() {
  try {
    redisCache = new RedisCache();
    await redisCache.connect();
    
    iiifCache = new IIIFCache(redisCache);
    
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