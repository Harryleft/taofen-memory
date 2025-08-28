const { createClient } = require('redis');
const crypto = require('crypto');
const logger = require('./logger');

class RedisCache {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.defaultTTL = 3600; // 默认1小时
  }

  async connect() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      // 清理现有连接
      if (this.client) {
        try {
          await this.client.quit();
        } catch (e) {
          logger.warn('清理现有连接失败:', e);
        }
      }
      
      this.client = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 5) { // 降低重连次数
              logger.error('Redis重连次数过多，停止重连');
              return new Error('Redis重连次数过多');
            }
            return Math.min(retries * 100, 3000);
          }
        }
      });

      // 使用once而不是on来避免监听器泄漏
      this.client.once('error', (err) => {
        logger.error('Redis客户端错误:', err);
      });

      this.client.once('connect', () => {
        logger.info('Redis客户端连接成功');
        this.isConnected = true;
      });

      this.client.once('disconnect', () => {
        logger.warn('Redis客户端断开连接');
        this.isConnected = false;
      });

      this.client.once('reconnecting', () => {
        logger.info('Redis客户端正在重连...');
      });

      await this.client.connect();
      
      // 测试连接
      await this.client.ping();
      logger.info('Redis连接测试成功');
      
    } catch (error) {
      logger.error('Redis连接失败:', error);
      // 清理失败的连接
      if (this.client) {
        try {
          await this.client.quit();
        } catch (e) {
          // 忽略清理错误
        }
        this.client = null;
      }
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      try {
        await this.client.quit();
        this.isConnected = false;
        logger.info('Redis连接已关闭');
      } catch (error) {
        logger.error('Redis断开连接失败:', error);
      } finally {
        this.client = null;
      }
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis未连接');
      }

      const serializedValue = JSON.stringify(value);
      const result = await this.client.setEx(key, ttl, serializedValue);
      
      logger.debug(`缓存设置成功: ${key}, TTL: ${ttl}s`);
      return result;
    } catch (error) {
      logger.error(`缓存设置失败: ${key}`, error);
      throw error;
    }
  }

  async get(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis未连接');
      }

      const result = await this.client.get(key);
      
      if (result) {
        const parsedValue = JSON.parse(result);
        logger.debug(`缓存获取成功: ${key}`);
        return parsedValue;
      }
      
      logger.debug(`缓存未命中: ${key}`);
      return null;
    } catch (error) {
      logger.error(`缓存获取失败: ${key}`, error);
      throw error;
    }
  }

  async delete(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis未连接');
      }

      const result = await this.client.del(key);
      logger.debug(`缓存删除成功: ${key}, 删除数量: ${result}`);
      return result;
    } catch (error) {
      logger.error(`缓存删除失败: ${key}`, error);
      throw error;
    }
  }

  async mget(keys) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis未连接');
      }

      const results = await this.client.mGet(keys);
      const parsedResults = results.map(result => 
        result ? JSON.parse(result) : null
      );
      
      logger.debug(`批量获取缓存成功，key数量: ${keys.length}`);
      return parsedResults;
    } catch (error) {
      logger.error('批量获取缓存失败:', error);
      throw error;
    }
  }

  async clear(pattern = '*') {
    try {
      if (!this.isConnected) {
        throw new Error('Redis未连接');
      }

      // 限制批量删除的数量，避免阻塞
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        // 分批删除，每次最多1000个key
        const batchSize = 1000;
        let totalDeleted = 0;
        
        for (let i = 0; i < keys.length; i += batchSize) {
          const batch = keys.slice(i, i + batchSize);
          const result = await this.client.del(batch);
          totalDeleted += result;
          
          // 批次间短暂暂停，避免阻塞
          if (i + batchSize < keys.length) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }
        
        logger.info(`清空缓存成功，模式: ${pattern}, 删除数量: ${totalDeleted}`);
        return totalDeleted;
      }
      
      logger.info(`清空缓存完成，模式: ${pattern}, 未找到匹配的key`);
      return 0;
    } catch (error) {
      logger.error('清空缓存失败:', error);
      throw error;
    }
  }

  async exists(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis未连接');
      }

      const result = await this.client.exists(key);
      return result > 0;
    } catch (error) {
      logger.error(`检查key存在性失败: ${key}`, error);
      throw error;
    }
  }

  async ttl(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis未连接');
      }

      const result = await this.client.ttl(key);
      return result;
    } catch (error) {
      logger.error(`获取TTL失败: ${key}`, error);
      throw error;
    }
  }

  async expire(key, ttl) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis未连接');
      }

      const result = await this.client.expire(key, ttl);
      logger.debug(`设置TTL成功: ${key}, TTL: ${ttl}s`);
      return result;
    } catch (error) {
      logger.error(`设置TTL失败: ${key}`, error);
      throw error;
    }
  }

  generateHash(data) {
    return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
  }

  async getStats() {
    try {
      if (!this.isConnected) {
        throw new Error('Redis未连接');
      }

      const info = await this.client.info('memory');
      const stats = {
        connected: this.isConnected,
        memory_used: this.parseMemoryInfo(info),
        keyspace: await this.client.info('keyspace'),
        uptime: await this.client.info('server')
      };
      
      return stats;
    } catch (error) {
      logger.error('获取缓存统计失败:', error);
      throw error;
    }
  }

  parseMemoryInfo(info) {
    const lines = info.split('\n');
    const memoryInfo = {};
    
    for (const line of lines) {
      if (line.startsWith('used_memory:')) {
        memoryInfo.used = line.split(':')[1].trim();
      } else if (line.startsWith('used_memory_peak:')) {
        memoryInfo.peak = line.split(':')[1].trim();
      } else if (line.startsWith('used_memory_lua:')) {
        memoryInfo.lua = line.split(':')[1].trim();
      }
    }
    
    return memoryInfo;
  }
}

module.exports = RedisCache;