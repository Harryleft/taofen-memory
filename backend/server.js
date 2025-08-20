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