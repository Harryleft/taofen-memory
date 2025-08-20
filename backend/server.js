const express = require('express');
const cors = require('cors');
const https = require('https');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// AI API配置
const AI_API_CONFIG = {
  url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  apiKey: process.env.AI_API_KEY || '2cdde2240d0a446b9bd7962a8c5a25fe.suOORlOs7kv84ZEF',
  model: 'glm-4.5'
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
    const prompt = `角色：你是一名优秀的邹韬奋事迹讲解员，擅长将当时邹韬奋写的手稿信息转换为让现代人容易理解的语言。

任务：请对以下手稿内容进行通俗易懂的解读。

上下文信息：
- 时间：${time || '未知'}
- 标题：${title || '无标题'}
- 原文：${content}
- 注释：${notes || '无注释'}

输出要求：
1. 用现代白话文重新表述原文含义
2. 解释重要的时代、文化背景
3. 保持语言生动有趣，避免学术化表达
4. 解读长度控制在原文的1.5倍以内

请直接开始解读，不需要额外说明：`;

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
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
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
      });

      req.on('error', reject);
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
app.listen(PORT, () => {
  console.log(`AI代理服务器运行在端口 ${PORT}`);
});

module.exports = app;