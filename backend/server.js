const express = require('express');
const cors = require('cors');
const https = require('https');
const path = require('path');
const { createClient } = require('redis');
require('dotenv').config();

// 启动时验证环境变量
function validateEnv() {
  const requiredVars = [];
  if (!process.env.AI_API_KEY) {
    requiredVars.push('AI_API_KEY');
  }
  if (!process.env.REDIS_URL) {
    // Redis URL是可选的,有内存后备方案
    console.warn('⚠️  未设置REDIS_URL,将使用内存缓存');
  }

  if (requiredVars.length > 0) {
    throw new Error(`缺少必要的环境变量: ${requiredVars.join(', ')}`);
  }

  console.log('✅ 环境变量验证通过');
}

// 输入验证和清理中间件
const validateAIInput = (req, res, next) => {
  const { content, title, notes } = req.body;

  // 验证必要参数
  if (!content) {
    return res.status(400).json({ error: '缺少必要参数：content' });
  }

  // 验证类型
  if (typeof content !== 'string') {
    return res.status(400).json({ error: 'content必须是字符串' });
  }

  // 验证长度
  if (content.length > 5000) {
    return res.status(400).json({ error: 'content长度不能超过5000字符' });
  }

  // HTML实体编码函数
  const escapeHtml = (text) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };
    return text.replace(/[&<>"'/]/g, m => map[m]);
  };

  // 清理和验证输入
  const cleanContent = escapeHtml(content.trim());
  const cleanTitle = title ? escapeHtml(title.trim()) : '';
  const cleanNotes = notes ? escapeHtml(notes.trim()) : '';

  // 检测潜在的prompt injection (清理后)
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /data:text/i,
    /onload=/i,
    /onerror=/i,
    /ignore.*all.*instructions/i,
    /disregard.*everything/i,
    /system.*prompt/i,
    /角色.*扮演/i
  ];

  const combinedInput = `${cleanContent} ${cleanTitle} ${cleanNotes}`;
  for (const pattern of dangerousPatterns) {
    if (pattern.test(combinedInput)) {
      return res.status(400).json({ error: '输入内容包含不合法字符' });
    }
  }

  // 将清理后的数据挂载到req对象上
  req.sanitizedInput = {
    title: cleanTitle,
    content: cleanContent,
    notes: cleanNotes
  };

  next();
};

// AI API速率限制（内存实现，修复内存泄漏）
const aiRateLimiter = (() => {
  const requests = new Map();
  const WINDOW_MS = 60000; // 1分钟
  const MAX_REQUESTS = 10;  // 每分钟最多10次
  const CLEANUP_INTERVAL = 300000; // 5分钟清理一次

  // 定期清理过期IP条目，防止内存泄漏
  setInterval(() => {
    const now = Date.now();
    for (const [ip, userRequests] of requests.entries()) {
      // 清理过期的请求时间戳
      const validRequests = userRequests.filter(time => now - time < WINDOW_MS);
      if (validRequests.length === 0) {
        // 删除没有活跃请求的IP
        requests.delete(ip);
      } else {
        // 更新有效请求
        requests.set(ip, validRequests);
      }
    }
  }, CLEANUP_INTERVAL);

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const userRequests = requests.get(ip) || [];

    // 清理过期请求
    const validRequests = userRequests.filter(time => now - time < WINDOW_MS);

    if (validRequests.length >= MAX_REQUESTS) {
      // 计算实际需要等待的时间
      const oldestRequest = validRequests[0];
      const waitTime = oldestRequest + WINDOW_MS - now;
      return res.status(429).json({
        error: 'AI调用过于频繁，请稍后重试',
        retryAfter: Math.ceil(Math.max(0, waitTime) / 1000)
      });
    }

    validRequests.push(now);
    requests.set(ip, validRequests);
    next();
  };
})();

const app = express();
const PORT = process.env.PORT || 3001;

// 立即验证环境变量
try {
  validateEnv();
} catch (error) {
  console.error('❌ 启动失败:', error.message);
  console.error('请检查.env文件配置');
  process.exit(1);
}

// Redis客户端配置 - 快速失败模式
let redisClient = null;
let isRedisConnecting = false;

async function connectRedis() {
  // 如果已经连接成功，直接返回
  if (redisClient && redisClient.isReady) {
    return;
  }
  
  // 如果正在连接中，避免重复连接
  if (isRedisConnecting) {
    return;
  }
  
  isRedisConnecting = true;
  
  try {
    console.log('正在连接Redis...');
    
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 3000, // 3秒连接超时
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('Redis重连次数过多，停止重连');
            return new Error('Redis重连次数过多');
          }
          // 指数退避: 100ms, 200ms, 400ms, ..., 最大5秒
          return Math.min(retries * 100, 5000);
        }
      }
    });
    
    redisClient.on('error', (err) => {
      console.error('Redis客户端错误:', err.message);
    });
    
    redisClient.on('connect', () => {
      console.log('Redis客户端连接成功');
    });
    
    // 快速连接测试
    await redisClient.connect();
    console.log('Redis连接已建立');
    
  } catch (error) {
    console.error('Redis连接失败:', error.message);
    
    // 清理失败的客户端
    if (redisClient) {
      try {
        if (redisClient.isOpen) {
          await redisClient.quit();
        }
      } catch (e) {
        // 忽略清理错误
      }
      redisClient = null;
    }
    
    console.log('Redis不可用，将使用内存缓存');
  } finally {
    isRedisConnecting = false;
  }
}

// 内存缓存后备方案 - 修复泄漏
const memoryCache = new Map();
const cacheTimers = new Map(); // 存储定时器引用

// 缓存操作函数
async function getFromCache(key) {
  try {
    if (redisClient && redisClient.isReady) {
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
    if (redisClient && redisClient.isReady) {
      await redisClient.setEx(key, ttl, serializedValue);
      // 清除旧的定时器
      if (cacheTimers.has(key)) {
        clearTimeout(cacheTimers.get(key));
        cacheTimers.delete(key);
      }
    } else {
      memoryCache.set(key, value);
      // 存储定时器引用，允许取消
      const timer = setTimeout(() => {
        memoryCache.delete(key);
        cacheTimers.delete(key);
      }, ttl * 1000);
      cacheTimers.set(key, timer);
    }
    return true;
  } catch (error) {
    console.error('设置缓存失败:', error);
    return false;
  }
}

async function deleteFromCache(key) {
  try {
    if (redisClient && redisClient.isReady) {
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

// 静态文件服务 - 为图片文件提供服务
app.use('/images', express.static(path.join(__dirname, '../images')));

// 静态文件服务 - 为前端构建文件提供服务
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// 为根路径提供index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// AI API配置 - 强制要求环境变量
const AI_API_CONFIG = {
  url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  get apiKey() {
    const key = process.env.AI_API_KEY;
    if (!key) {
      throw new Error('AI_API_KEY environment variable is required');
    }
    return key;
  },
  get model() {
    // 从环境变量读取模型，默认使用 glm-4.7
    return process.env.AI_MODEL || 'glm-4.7';
  }
};

// AI解读接口 - 添加速率限制和输入验证
app.post('/api/ai/interpret', aiRateLimiter, validateAIInput, async (req, res) => {
  try {
    // 使用清理后的输入
    const { title, content, notes } = req.sanitizedInput;
    const { time } = req.body;

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
背景快闪：用1句话点明时代背景（如"当时正值抗战烽火，百姓苦不堪言"），避免长篇大论。
鲜活表达：用"就像…比如…"类比复杂概念；把抽象理念转化为具体场景（如"爱国不是口号，是街头卖报时多分给难民半块饼干的行动"）；杜绝"之乎者也""综上所述"等学术腔。
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
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${AI_API_CONFIG.apiKey}`,
        'Content-Length': Buffer.byteLength(postData, 'utf8'),
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
    
    // 提取AI回复内容 - 优先使用reasoning_content，其次使用content
    const interpretation = data.choices?.[0]?.message?.content ||
                          data.choices?.[0]?.message?.reasoning_content || '';

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
    const isConnected = redisClient && redisClient.isReady;
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

    if (keys.length === 0) {
      return res.json({ success: true, data: [], results: [], count: 0, found: 0 });
    }

    let results;

    if (redisClient && redisClient.isReady) {
      // 使用 Redis MGET 一次性查询所有键
      const values = await redisClient.mGet(keys);
      results = keys.map((key, index) => ({
        key,
        value: values[index] ? JSON.parse(values[index]) : null,
        found: values[index] !== null
      }));
    } else {
      // 内存缓存逐个查询
      results = keys.map(key => ({
        key,
        value: memoryCache.get(key) || null,
        found: memoryCache.has(key)
      }));
    }

    // 按照原始keys顺序返回数据
    const data = results.map(r => r.value);

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
    if (redisClient && redisClient.isReady) {
      await redisClient.flushDb();
    } else {
      memoryCache.clear();
    }
    
    res.json({ 
      success: true, 
      message: '缓存清空成功',
      cache_type: redisClient && redisClient.isReady ? 'redis' : 'memory'
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
      connected: redisClient && redisClient.isReady,
      cache_type: redisClient && redisClient.isReady ? 'redis' : 'memory',
      memory_cache_size: memoryCache.size
    };
    
    if (redisClient && redisClient.isReady) {
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
    console.log(`缓存服务初始化完成: ${redisClient && redisClient.isReady ? 'Redis' : '内存缓存'}`);
  }).catch((error) => {
    console.error('Redis连接失败，使用内存缓存:', error.message);
  });
  
  return server;
}

// 启动服务器
const server = startServer();

module.exports = app;
