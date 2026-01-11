const axios = require('axios');
const logger = require('./logger');

class IIIFCache {
  constructor(redisCache) {
    this.redisCache = redisCache;
    this.baseURL = process.env.IIIF_BASE_URL || 'https://www.ai4dh.cn/iiif/3';
    this.defaultTTL = 86400; // IIIF缓存24小时
  }

  async getIIIFInfo(identifier) {
    try {
      const cacheKey = `iiif:info:${identifier}`;
      
      // 先尝试从缓存获取
      const cached = await this.redisCache.get(cacheKey);
      if (cached) {
        logger.debug(`IIIF信息缓存命中: ${identifier}`);
        return {
          source: 'cache',
          data: cached
        };
      }

      // 缓存未命中，从远程获取
      logger.debug(`IIIF信息缓存未命中，从远程获取: ${identifier}`);
      const remoteURL = `${this.baseURL}/manifests/${identifier}/info.json`;
      
      const response = await axios.get(remoteURL, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Taofen-Cache-Service/1.0'
        }
      });

      const info = response.data;
      
      // 存入缓存
      await this.redisCache.set(cacheKey, info, this.defaultTTL);
      
      logger.info(`IIIF信息缓存更新成功: ${identifier}`);
      return {
        source: 'remote',
        data: info
      };
      
    } catch (error) {
      logger.error(`获取IIIF信息失败: ${identifier}`, error);
      
      // 如果是网络错误，尝试返回过期的缓存
      if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') {
        logger.warn(`网络错误，尝试返回过期缓存: ${identifier}`);
        const staleKey = `iiif:info:${identifier}:stale`;
        const staleData = await this.redisCache.get(staleKey);
        
        if (staleData) {
          logger.info(`返回过期缓存: ${identifier}`);
          return {
            source: 'stale',
            data: staleData
          };
        }
      }
      
      throw error;
    }
  }

  async getIIIFImage(identifier, params) {
    try {
      const { region, size, rotation, quality } = params;
      const cacheKey = `iiif:image:${identifier}:${region}:${size}:${rotation}:${quality}`;
      
      // 先尝试从缓存获取
      const cached = await this.redisCache.get(cacheKey);
      if (cached) {
        logger.debug(`IIIF图像缓存命中: ${identifier} ${region}/${size}/${rotation}/${quality}`);
        return {
          source: 'cache',
          data: cached
        };
      }

      // 缓存未命中，从远程获取
      logger.debug(`IIIF图像缓存未命中，从远程获取: ${identifier}`);
      const remoteURL = `${this.baseURL}/${identifier}/${region}/${size}/${rotation}/${quality}.jpg`;
      
      const response = await axios.get(remoteURL, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Taofen-Cache-Service/1.0'
        }
      });

      const imageData = {
        buffer: response.data,
        contentType: response.headers['content-type'],
        size: response.data.byteLength
      };
      
      // 存入缓存（图像数据缓存时间较短）
      await this.redisCache.set(cacheKey, imageData, 7200); // 2小时
      
      logger.info(`IIIF图像缓存更新成功: ${identifier} ${region}/${size}/${rotation}/${quality}`);
      return {
        source: 'remote',
        data: imageData
      };
      
    } catch (error) {
      logger.error(`获取IIIF图像失败: ${identifier}`, error);
      throw error;
    }
  }

  async prefetchIIIFInfo(identifiers) {
    try {
      const results = {};
      
      for (const identifier of identifiers) {
        try {
          const result = await this.getIIIFInfo(identifier);
          results[identifier] = result;
        } catch (error) {
          logger.error(`预取IIIF信息失败: ${identifier}`, error);
          results[identifier] = { error: error.message };
        }
      }
      
      return results;
    } catch (error) {
      logger.error('批量预取IIIF信息失败:', error);
      throw error;
    }
  }

  async clearIIIFCache(identifier = null) {
    try {
      if (identifier) {
        // 清除特定identifier的缓存
        const patterns = [
          `iiif:info:${identifier}`,
          `iiif:image:${identifier}:*`
        ];
        
        let totalCleared = 0;
        for (const pattern of patterns) {
          const cleared = await this.redisCache.clear(pattern);
          totalCleared += cleared;
        }
        
        logger.info(`清除IIIF缓存成功: ${identifier}, 清除数量: ${totalCleared}`);
        return totalCleared;
      } else {
        // 清除所有IIIF缓存
        const patterns = ['iiif:info:*', 'iiif:image:*'];
        let totalCleared = 0;
        
        for (const pattern of patterns) {
          const cleared = await this.redisCache.clear(pattern);
          totalCleared += cleared;
        }
        
        logger.info(`清除所有IIIF缓存成功, 清除数量: ${totalCleared}`);
        return totalCleared;
      }
    } catch (error) {
      logger.error('清除IIIF缓存失败:', error);
      throw error;
    }
  }

  async getCacheStats() {
    try {
      const patterns = ['iiif:info:*', 'iiif:image:*'];
      const stats = {
        infoCache: 0,
        imageCache: 0,
        totalCache: 0
      };
      
      for (const pattern of patterns) {
        const keys = await this.redisCache.client.keys(pattern);
        if (pattern.startsWith('iiif:info:')) {
          stats.infoCache = keys.length;
        } else if (pattern.startsWith('iiif:image:')) {
          stats.imageCache = keys.length;
        }
        stats.totalCache += keys.length;
      }
      
      return stats;
    } catch (error) {
      logger.error('获取IIIF缓存统计失败:', error);
      throw error;
    }
  }

  async warmUpCache(identifiers) {
    try {
      logger.info(`开始预热缓存，identifier数量: ${identifiers.length}`);
      
      const results = {
        success: 0,
        failed: 0,
        errors: []
      };
      
      for (const identifier of identifiers) {
        try {
          await this.getIIIFInfo(identifier);
          results.success++;
          
          // 预取几个常用尺寸的图像
          const commonSizes = [
            { region: 'full', size: '300,300', rotation: '0', quality: 'default' },
            { region: 'full', size: '800,800', rotation: '0', quality: 'default' },
            { region: 'full', size: 'full', rotation: '0', quality: 'default' }
          ];
          
          for (const sizeParams of commonSizes) {
            try {
              await this.getIIIFImage(identifier, sizeParams);
            } catch (error) {
              logger.warn(`预取图像失败: ${identifier} ${sizeParams.size}`, error);
            }
          }
          
          // 避免请求过于频繁
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          results.failed++;
          results.errors.push({ identifier, error: error.message });
        }
      }
      
      logger.info(`缓存预热完成，成功: ${results.success}, 失败: ${results.failed}`);
      return results;
      
    } catch (error) {
      logger.error('缓存预热失败:', error);
      throw error;
    }
  }
}

module.exports = IIIFCache;