/**
 * 瀑布流图片缓存模块
 * 专门用于缓存瀑布流布局中的图片数据和元信息
 */

const RedisCache = require('./redis-cache');
const logger = require('./logger');

class ImageCache {
    constructor() {
        this.redis = new RedisCache();
        this.cachePrefix = 'image';
    }

    /**
     * 缓存图片元数据
     * @param {string} imageId - 图片ID
     * @param {Object} metadata - 图片元数据
     * @param {number} ttl - 缓存时间（秒）
     */
    async cacheImageMetadata(imageId, metadata, ttl = 86400) {
        try {
            const key = `${this.cachePrefix}:meta:${imageId}`;
            await this.redis.set(key, metadata, ttl);
            logger.info(`Cached image metadata for ${imageId}`, { imageId, ttl });
            return true;
        } catch (error) {
            logger.error(`Failed to cache image metadata for ${imageId}`, { error: error.message });
            return false;
        }
    }

    /**
     * 获取图片元数据
     * @param {string} imageId - 图片ID
     */
    async getImageMetadata(imageId) {
        try {
            const key = `${this.cachePrefix}:meta:${imageId}`;
            const metadata = await this.redis.get(key);
            return metadata;
        } catch (error) {
            logger.error(`Failed to get image metadata for ${imageId}`, { error: error.message });
            return null;
        }
    }

    /**
     * 缓存图片尺寸信息
     * @param {string} imageId - 图片ID
     * @param {Object} dimensions - 图片尺寸
     * @param {number} ttl - 缓存时间（秒）
     */
    async cacheImageDimensions(imageId, dimensions, ttl = 2592000) {
        try {
            const key = `${this.cachePrefix}:dimensions:${imageId}`;
            await this.redis.set(key, dimensions, ttl);
            logger.info(`Cached image dimensions for ${imageId}`, { imageId, dimensions, ttl });
            return true;
        } catch (error) {
            logger.error(`Failed to cache image dimensions for ${imageId}`, { error: error.message });
            return false;
        }
    }

    /**
     * 获取图片尺寸信息
     * @param {string} imageId - 图片ID
     */
    async getImageDimensions(imageId) {
        try {
            const key = `${this.cachePrefix}:dimensions:${imageId}`;
            const dimensions = await this.redis.get(key);
            return dimensions;
        } catch (error) {
            logger.error(`Failed to get image dimensions for ${imageId}`, { error: error.message });
            return null;
        }
    }

    /**
     * 缓存瀑布流布局计算结果
     * @param {string} layoutKey - 布局键
     * @param {Object} layout - 布局数据
     * @param {number} ttl - 缓存时间（秒）
     */
    async cacheLayout(layoutKey, layout, ttl = 300) {
        try {
            const key = `${this.cachePrefix}:layout:${layoutKey}`;
            await this.redis.set(key, layout, ttl);
            logger.info(`Cached layout for ${layoutKey}`, { layoutKey, ttl });
            return true;
        } catch (error) {
            logger.error(`Failed to cache layout for ${layoutKey}`, { error: error.message });
            return false;
        }
    }

    /**
     * 获取瀑布流布局计算结果
     * @param {string} layoutKey - 布局键
     */
    async getLayout(layoutKey) {
        try {
            const key = `${this.cachePrefix}:layout:${layoutKey}`;
            const layout = await this.redis.get(key);
            return layout;
        } catch (error) {
            logger.error(`Failed to get layout for ${layoutKey}`, { error: error.message });
            return null;
        }
    }

    /**
     * 缓存预加载队列
     * @param {string} queueId - 队列ID
     * @param {Object} queue - 预加载队列数据
     * @param {number} ttl - 缓存时间（秒）
     */
    async cachePreloadQueue(queueId, queue, ttl = 60) {
        try {
            const key = `${this.cachePrefix}:preload:${queueId}`;
            await this.redis.set(key, queue, ttl);
            logger.info(`Cached preload queue for ${queueId}`, { queueId, ttl });
            return true;
        } catch (error) {
            logger.error(`Failed to cache preload queue for ${queueId}`, { error: error.message });
            return false;
        }
    }

    /**
     * 获取预加载队列
     * @param {string} queueId - 队列ID
     */
    async getPreloadQueue(queueId) {
        try {
            const key = `${this.cachePrefix}:preload:${queueId}`;
            const queue = await this.redis.get(key);
            return queue;
        } catch (error) {
            logger.error(`Failed to get preload queue for ${queueId}`, { error: error.message });
            return null;
        }
    }

    /**
     * 批量获取图片尺寸信息
     * @param {string[]} imageIds - 图片ID数组
     */
    async batchGetImageDimensions(imageIds) {
        try {
            const keys = imageIds.map(id => `${this.cachePrefix}:dimensions:${id}`);
            const results = await this.redis.mget(keys);
            
            const dimensionsMap = {};
            imageIds.forEach((id, index) => {
                if (results[index]) {
                    dimensionsMap[id] = results[index];
                }
            });
            
            return dimensionsMap;
        } catch (error) {
            logger.error('Failed to batch get image dimensions', { error: error.message });
            return {};
        }
    }

    /**
     * 清除图片相关缓存
     * @param {string} imageId - 图片ID
     */
    async clearImageCache(imageId) {
        try {
            const keys = [
                `${this.cachePrefix}:meta:${imageId}`,
                `${this.cachePrefix}:dimensions:${imageId}`
            ];
            
            await this.redis.delete(keys);
            logger.info(`Cleared image cache for ${imageId}`, { imageId });
            return true;
        } catch (error) {
            logger.error(`Failed to clear image cache for ${imageId}`, { error: error.message });
            return false;
        }
    }

    /**
     * 清除布局缓存
     * @param {string} layoutKey - 布局键
     */
    async clearLayoutCache(layoutKey) {
        try {
            const key = `${this.cachePrefix}:layout:${layoutKey}`;
            await this.redis.delete(key);
            logger.info(`Cleared layout cache for ${layoutKey}`, { layoutKey });
            return true;
        } catch (error) {
            logger.error(`Failed to clear layout cache for ${layoutKey}`, { error: error.message });
            return false;
        }
    }

    /**
     * 获取缓存统计信息
     */
    async getCacheStats() {
        try {
            const stats = await this.redis.getStats();
            return {
                ...stats,
                prefix: this.cachePrefix,
                type: 'image'
            };
        } catch (error) {
            logger.error('Failed to get image cache stats', { error: error.message });
            return null;
        }
    }
}

module.exports = ImageCache;