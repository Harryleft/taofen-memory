/**
 * 标签模糊语义匹配工具
 * 提供归一化、多算法组合评分、同义词映射与缓存功能
 */

// LRU 缓存实现
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // 重新插入以更新顺序
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // 删除最旧的项
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }
}

// 配置接口
interface TagMatcherConfig {
  thresholds: {
    strong: number;
    weak: number;
  };
  weights: {
    jaroWinkler: number;
    bigramJaccard: number;
    trigramCosine: number;
  };
  synonyms: Record<string, string>;
  stopWords: string[];
  enableSimplifiedTraditional: boolean;
  cacheSize: number;
}

// 默认配置
const DEFAULT_CONFIG: TagMatcherConfig = {
  thresholds: {
    strong: 0.92,
    weak: 0.85,
  },
  weights: {
    jaroWinkler: 0.5,
    bigramJaccard: 0.3,
    trigramCosine: 0.2,
  },
  synonyms: {
    // 关系类型同义词
    '专业合作': '专业合作',
    '出版关联': '专业合作',
    '合作': '专业合作',
    '联合出版': '专业合作',
    '学术合作': '学术关联',
    '学术关联': '学术关联',
    '师生关系': '学术关联',
    '思想影响': '思想启发',
    '思想启发': '思想启发',
    '影响': '思想启发',
    '启发': '思想启发',
    // 维度同义词
    '职业选择': '职业选择',
    '职业发展': '职业选择',
    '择业': '职业选择',
    '出版事业': '出版事业',
    '出版工作': '出版事业',
    '新闻工作': '出版事业',
    '时代背景': '时代背景',
    '历史背景': '时代背景',
    '社会背景': '时代背景',
  },
  stopWords: ['的', '之', '与', '和', '及', '或'],
  enableSimplifiedTraditional: false, // 暂时关闭简繁转换
  cacheSize: 1000,
};

class TagMatcher {
  private config: TagMatcherConfig;
  private cache: LRUCache<string, number>;

  constructor(config?: Partial<TagMatcherConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cache = new LRUCache(this.config.cacheSize);
  }

  /**
   * 归一化标签
   */
  private normalizeTag(tag: string): string {
    let normalized = tag
      .toLowerCase()
      .trim()
      // 全角转半角
      .replace(/[\uff01-\uff5e]/g, (char) => 
        String.fromCharCode(char.charCodeAt(0) - 0xfee0))
      // 去除标点符号
      .replace(/[^\w\u4e00-\u9fff]/g, '');

    // 去除停用词
    for (const stopWord of this.config.stopWords) {
      normalized = normalized.replace(new RegExp(stopWord, 'g'), '');
    }

    return normalized;
  }

  /**
   * Jaro-Winkler 相似度算法
   */
  private jaroWinkler(s1: string, s2: string): number {
    if (s1 === s2) return 1.0;
    if (!s1 || !s2) return 0.0;

    const len1 = s1.length;
    const len2 = s2.length;
    const matchWindow = Math.max(len1, len2) / 2 - 1;

    if (matchWindow < 0) return 0.0;

    const s1Matches = new Array(len1).fill(false);
    const s2Matches = new Array(len2).fill(false);

    let matches = 0;
    let transpositions = 0;

    // 寻找匹配字符
    for (let i = 0; i < len1; i++) {
      const start = Math.max(0, i - matchWindow);
      const end = Math.min(i + matchWindow + 1, len2);

      for (let j = start; j < end; j++) {
        if (s2Matches[j] || s1[i] !== s2[j]) continue;
        s1Matches[i] = true;
        s2Matches[j] = true;
        matches++;
        break;
      }
    }

    if (matches === 0) return 0.0;

    // 计算转位
    let k = 0;
    for (let i = 0; i < len1; i++) {
      if (!s1Matches[i]) continue;
      while (!s2Matches[k]) k++;
      if (s1[i] !== s2[k]) transpositions++;
      k++;
    }

    const jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;

    // Winkler 前缀加权
    let prefix = 0;
    const maxPrefix = Math.min(4, Math.min(len1, len2));
    for (let i = 0; i < maxPrefix; i++) {
      if (s1[i] === s2[i]) prefix++;
      else break;
    }

    return jaro + (0.1 * prefix * (1 - jaro));
  }

  /**
   * Bigram Jaccard 相似度
   */
  private bigramJaccard(s1: string, s2: string): number {
    if (s1 === s2) return 1.0;
    if (!s1 || !s2) return 0.0;

    const getBigrams = (str: string): Set<string> => {
      const bigrams = new Set<string>();
      for (let i = 0; i < str.length - 1; i++) {
        bigrams.add(str.slice(i, i + 2));
      }
      return bigrams;
    };

    const bigrams1 = getBigrams(s1);
    const bigrams2 = getBigrams(s2);

    const intersection = new Set([...bigrams1].filter(x => bigrams2.has(x)));
    const union = new Set([...bigrams1, ...bigrams2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Trigram Cosine 相似度
   */
  private trigramCosine(s1: string, s2: string): number {
    if (s1 === s2) return 1.0;
    if (!s1 || !s2) return 0.0;

    const getTrigrams = (str: string): Map<string, number> => {
      const trigrams = new Map<string, number>();
      for (let i = 0; i < str.length - 2; i++) {
        const trigram = str.slice(i, i + 3);
        trigrams.set(trigram, (trigrams.get(trigram) || 0) + 1);
      }
      return trigrams;
    };

    const trigrams1 = getTrigrams(s1);
    const trigrams2 = getTrigrams(s2);

    const allTrigrams = new Set([...trigrams1.keys(), ...trigrams2.keys()]);

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (const trigram of allTrigrams) {
      const count1 = trigrams1.get(trigram) || 0;
      const count2 = trigrams2.get(trigram) || 0;

      dotProduct += count1 * count2;
      norm1 += count1 * count1;
      norm2 += count2 * count2;
    }

    if (norm1 === 0 || norm2 === 0) return 0;

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * 计算两个标签的语义相似度
   */
  semanticSimilarity(tag1: string, tag2: string): number {
    // 生成缓存键
    const key = `${tag1}|${tag2}`;
    const cached = this.cache.get(key);
    if (cached !== undefined) {
      return cached;
    }

    // 归一化
    const norm1 = this.normalizeTag(tag1);
    const norm2 = this.normalizeTag(tag2);

    // 同义词映射
    const syn1 = this.config.synonyms[norm1] || norm1;
    const syn2 = this.config.synonyms[norm2] || norm2;

    // 同义词完全匹配
    if (syn1 === syn2) {
      this.cache.set(key, 1.0);
      return 1.0;
    }

    // 计算多种相似度
    const jw = this.jaroWinkler(syn1, syn2);
    const jaccard = this.bigramJaccard(syn1, syn2);
    const cosine = this.trigramCosine(syn1, syn2);

    // 根据长度调整权重
    const avgLength = (syn1.length + syn2.length) / 2;
    const weights = { ...this.config.weights };

    if (avgLength < 5) {
      // 短标签增强 Jaro-Winkler
      weights.jaroWinkler += 0.2;
      weights.bigramJaccard -= 0.1;
      weights.trigramCosine -= 0.1;
    }

    // 加权计算最终相似度
    const similarity = 
      weights.jaroWinkler * jw +
      weights.bigramJaccard * jaccard +
      weights.trigramCosine * cosine;

    this.cache.set(key, similarity);
    return similarity;
  }

  /**
   * 在标签集合中查找相似标签
   */
  findSimilarTags(query: string, candidates: string[]): Array<{
    tag: string;
    similarity: number;
    matchType: 'strong' | 'weak' | 'none';
  }> {
    const results: Array<{
      tag: string;
      similarity: number;
      matchType: 'strong' | 'weak' | 'none';
    }> = [];

    for (const candidate of candidates) {
      const similarity = this.semanticSimilarity(query, candidate);
      
      let matchType: 'strong' | 'weak' | 'none' = 'none';
      if (similarity >= this.config.thresholds.strong) {
        matchType = 'strong';
      } else if (similarity >= this.config.thresholds.weak) {
        matchType = 'weak';
      }

      if (matchType !== 'none') {
        results.push({ tag: candidate, similarity, matchType });
      }
    }

    // 按相似度降序排序
    return results.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * 批量匹配标签
   */
  matchTags(query: string, candidates: string[], includeWeak = true): string[] {
    const matches = this.findSimilarTags(query, candidates);
    return matches
      .filter(match => match.matchType === 'strong' || (includeWeak && match.matchType === 'weak'))
      .map(match => match.tag);
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<TagMatcherConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.cache.clear(); // 清除缓存以应用新配置
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// 导出单例实例
export const tagMatcher = new TagMatcher();

// 导出类型和配置
export type { TagMatcherConfig };
export { TagMatcher };
