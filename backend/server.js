const express = require('express');
const cors = require('cors');
const https = require('https');
const path = require('path');
const { createClient } = require('redis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Redis客户端配置
let redisClient;
let redisConnectionRetries = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5秒重试间隔

async function connectRedis() {
  // 如果已经连接成功，直接返回
  if (redisClient && redisClient.isReady) {
    return;
  }
  
  try {
    console.log(`尝试连接Redis (第${redisConnectionRetries + 1}次)...`);
    
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > MAX_RETRIES) {
            console.log('Redis重连次数超过限制，停止重连');
            return false; // 停止重连
          }
          return Math.min(retries * 1000, 30000); // 指数退避，最大30秒
        }
      }
    });
    
    redisClient.on('error', (err) => {
      console.error('Redis客户端错误:', err.message);
    });
    
    redisClient.on('connect', () => {
      console.log('Redis客户端连接成功');
      redisConnectionRetries = 0; // 重置重试计数
    });
    
    redisClient.on('reconnecting', () => {
      console.log('Redis客户端正在重连...');
    });
    
    redisClient.on('end', () => {
      console.log('Redis客户端连接断开，5秒后尝试重连...');
      setTimeout(() => {
        connectRedis().catch(() => {
          console.log('Redis重连失败，继续使用内存缓存');
        });
      }, 5000);
    });
    
    await redisClient.connect();
    console.log('Redis连接已建立');
    redisConnectionRetries = 0; // 重置重试计数
    
  } catch (error) {
    console.error('Redis连接失败:', error.message);
    
    // 清理失败的客户端
    if (redisClient) {
      try {
        redisClient.quit();
      } catch (e) {
        // 忽略清理错误
      }
      redisClient = null;
    }
    
    // 重试逻辑
    if (redisConnectionRetries < MAX_RETRIES) {
      redisConnectionRetries++;
      console.log(`将在${RETRY_DELAY/1000}秒后重试连接Redis...`);
      
      // 延迟重试
      return new Promise((resolve) => {
        setTimeout(() => {
          connectRedis().then(resolve).catch(resolve);
        }, RETRY_DELAY);
      });
    } else {
      console.log('Redis连接重试次数达到上限，使用内存缓存');
      redisClient = null;
    }
  }
}

// 内存缓存后备方案
const memoryCache = new Map();

// 缓存操作函数
async function getFromCache(key) {
  try {
    if (redisClient) {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } else {
      return memoryCache.get(key);
    }
  } catch (error) {
    console.error('获取缓存失败:', error);
    return null;
  }
}

async function setToCache(key, value, ttl = 3600) {
  try {
    const serializedValue = JSON.stringify(value);
    if (redisClient) {
      await redisClient.setEx(key, ttl, serializedValue);
    } else {
      memoryCache.set(key, value);
      // 内存缓存设置过期时间
      setTimeout(() => memoryCache.delete(key), ttl * 1000);
    }
    return true;
  } catch (error) {
    console.error('设置缓存失败:', error);
    return false;
  }
}

async function deleteFromCache(key) {
  try {
    if (redisClient) {
      await redisClient.del(key);
    } else {
      memoryCache.delete(key);
    }
    return true;
  } catch (error) {
    console.error('删除缓存失败:', error);
    return false;
  }
}

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件服务 - 为前端构建文件提供服务
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// 为根路径提供index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// AI API配置
const AI_API_CONFIG = {
  url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  apiKey: process.env.AI_API_KEY || '2cdde2240d0a446b9bd7962a8c5a25fe.suOORlOs7kv84ZEF',
  model: 'glm-4.5-air'
};

// AI解读接口
app.post('/api/ai/interpret', async (req, res) => {
  try {
    const { title, content, notes, time } = req.body;

    if (!content) {
      return res.status(400).json({ 
        error: '缺少必要参数：content' 
      });
    }

    // 构建提示词
    const prompt = `角色：你是一名深谙邹韬奋思想的金牌讲解员，擅长用生活化比喻和当代语境还原历史手稿的灵魂。

任务：将以下邹韬奋手稿转化为现代人一听就懂的解读，像讲朋友的故事一样自然。

上下文信息：

时间：${time || '未知'}
标题：${title || '无标题'}
原文：${content}
注释：${notes || '无注释'}
输出要求：

白话金句：用1-2个短句直击原文核心，像发朋友圈文案般简洁有力。
背景快闪：用1句话点明时代背景（如“当时正值抗战烽火，百姓苦不堪言”），避免长篇大论。
鲜活表达：用“就像…比如…”类比复杂概念；把抽象理念转化为具体场景（如“爱国不是口号，是街头卖报时多分给难民半块饼干的行动”）；杜绝“之乎者也”“综上所述”等学术腔。
篇幅控制：解读字数严格≤原文1.5倍，删减冗余，留白引发思考。
必须使用自然语言段落的形式输出。不需要按照白话金句、背景快闪、鲜活表达的格式输出。`;

    // 调用AI API
    const postData = JSON.stringify({
      model: AI_API_CONFIG.model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const requestOptions = {
      hostname: 'open.bigmodel.cn',
      port: 443,
      path: '/api/paas/v4/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_CONFIG.apiKey}`,
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Node.js-App'
      }
    };

    const response = await new Promise((resolve, reject) => {
      const req = https.request(requestOptions, (res) => {
        let data = '';
        
        // 添加超时机制，防止内存泄漏
        const timeout = setTimeout(() => {
          req.destroy();
          reject(new Error('AI API请求超时'));
        }, 30000); // 30秒超时
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          clearTimeout(timeout);
          try {
            resolve({
              ok: res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              json: () => Promise.resolve(JSON.parse(data))
            });
          } catch (parseError) {
            reject(parseError);
          }
        });
        
        // 处理响应错误
        res.on('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });

      req.on('error', (error) => {
        reject(error);
      });
      
      // 设置请求超时
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('AI API请求超时'));
      });
      
      req.write(postData);
      req.end();
    });

    if (!response.ok) {
      throw new Error(`AI API调用失败: ${response.status}`);
    }

    const data = await response.json();
    
    // 提取AI回复内容
    const interpretation = data.choices?.[0]?.message?.content || '';

    res.json({
      success: true,
      interpretation: interpretation.trim(),
      usage: data.usage
    });

  } catch (error) {
    console.error('AI解读错误:', error);
    res.status(500).json({
      success: false,
      error: 'AI解读服务暂时不可用，请稍后重试'
    });
  }
});

// 缓存服务接口
app.get('/api/cache/health', async (req, res) => {
  try {
    const isConnected = redisClient !== null;
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      redis_connected: isConnected,
      cache_type: isConnected ? 'redis' : 'memory'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: '缓存健康检查失败',
      error: error.message 
    });
  }
});

app.post('/api/cache/set', async (req, res) => {
  try {
    const { key, value, ttl } = req.body;
    
    if (!key || value === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少必要参数：key和value' 
      });
    }
    
    const success = await setToCache(key, value, ttl || 3600);
    
    if (success) {
      res.json({ 
        success: true, 
        message: '缓存设置成功',
        key: key,
        ttl: ttl || 3600
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: '缓存设置失败' 
      });
    }
  } catch (error) {
    console.error('缓存设置错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '缓存设置失败',
      error: error.message 
    });
  }
});

app.get('/api/cache/get/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const data = await getFromCache(key);
    
    res.json({ 
      success: true, 
      data: data,
      key: key,
      found: data !== null
    });
  } catch (error) {
    console.error('获取缓存错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取缓存失败',
      error: error.message 
    });
  }
});

app.delete('/api/cache/delete/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const success = await deleteFromCache(key);
    
    if (success) {
      res.json({ 
        success: true, 
        message: '缓存删除成功',
        key: key
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: '缓存删除失败' 
      });
    }
  } catch (error) {
    console.error('删除缓存错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '删除缓存失败',
      error: error.message 
    });
  }
});

app.post('/api/cache/mget', async (req, res) => {
  try {
    const { keys } = req.body;
    
    if (!keys || !Array.isArray(keys)) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少必要参数：keys（数组）' 
      });
    }
    
    // 批量获取缓存数据
    const results = await Promise.all(
      keys.map(async (key) => {
        try {
          const value = await getFromCache(key);
          return { key, value, found: value !== null };
        } catch (error) {
          console.error(`获取缓存 ${key} 失败:`, error);
          return { key, value: null, found: false, error: error.message };
        }
      })
    );
    
    // 按照原始keys顺序返回数据
    const data = keys.map(key => {
      const result = results.find(r => r.key === key);
      return result ? result.value : null;
    });
    
    res.json({ 
      success: true, 
      data: data,
      results: results,
      count: keys.length,
      found: results.filter(r => r.found).length
    });
  } catch (error) {
    console.error('批量获取缓存错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '批量获取缓存失败',
      error: error.message 
    });
  }
});

app.post('/api/cache/clear', async (req, res) => {
  try {
    if (redisClient) {
      await redisClient.flushDb();
    } else {
      memoryCache.clear();
    }
    
    res.json({ 
      success: true, 
      message: '缓存清空成功',
      cache_type: redisClient ? 'redis' : 'memory'
    });
  } catch (error) {
    console.error('清空缓存错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '清空缓存失败',
      error: error.message 
    });
  }
});

app.get('/api/cache/stats', async (req, res) => {
  try {
    let stats = {
      connected: redisClient !== null,
      cache_type: redisClient ? 'redis' : 'memory',
      memory_cache_size: memoryCache.size
    };
    
    if (redisClient) {
      try {
        const info = await redisClient.info('memory');
        const usedMemory = info.match(/used_memory_human:([^\r\n]+)/);
        const keyCount = await redisClient.dbSize();
        
        stats.redis_used_memory = usedMemory ? usedMemory[1] : 'unknown';
        stats.redis_key_count = keyCount;
      } catch (error) {
        console.error('获取Redis统计信息失败:', error);
      }
    }
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('获取缓存统计错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取缓存统计失败',
      error: error.message 
    });
  }
});

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

// 启动服务器
function startServer() {
  // 立即启动服务器，不等待Redis连接
  const server = app.listen(PORT, () => {
    console.log(`AI代理服务器运行在端口 ${PORT}`);
    console.log('服务器启动成功，正在连接Redis...');
  });
  
  // 后台连接Redis，不阻塞服务器启动
  connectRedis().then(() => {
    console.log(`缓存服务初始化完成: ${redisClient ? 'Redis' : '内存缓存'}`);
  }).catch((error) => {
    console.error('Redis连接失败，使用内存缓存:', error.message);
  });
  
  return server;
}

// 启动服务器
const server = startServer();

// 优雅关闭处理
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    if (redisClient) {
      redisClient.quit();
    }
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    if (redisClient) {
      redisClient.quit();
    }
    process.exit(0);
  });
});

module.exports = app;