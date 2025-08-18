import { Person } from '@/types/Person';

/**
 * 计算两个字符串之间的Levenshtein距离
 * @param str1 第一个字符串
 * @param str2 第二个字符串
 * @returns 编辑距离
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * 人物匹配器类，用于缓存和匹配人物数据
 */
export class PersonMatcher {
  private personsMap: Map<string, Person> = new Map();
  private personsCache: Person[] = [];
  private isLoaded = false;
  
  /**
   * 加载人物数据
   */
  async loadPersons(): Promise<void> {
    if (this.isLoaded) return;
    
    const base = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL || '/';
    const normalizedBase = base.replace(/\/$/, '');
    const candidates = [
      `${normalizedBase}/data/json/relationships.json`, // 实际存在
      `${normalizedBase}/data/relationships.json`        // 兼容旧路径
    ];

    let lastError: Error | null = null;
    for (const url of candidates) {
      try {
        const response = await fetch(url, { cache: 'no-cache' });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} when GET ${url}`);
        }

        const contentType = response.headers.get('content-type') || '';
        const text = await response.text();
        if (!contentType.includes('application/json')) {
          const snippet = text.slice(0, 180);
          throw new Error(`Invalid content-type: ${contentType}. Snippet: ${snippet}`);
        }

        const data: { persons: Person[] } = JSON.parse(text);
        if (!data || !Array.isArray(data.persons)) {
          throw new Error('Invalid persons payload structure');
        }

        // 过滤掉邹韬奋本人（ID: 499）
        this.personsCache = data.persons.filter(person => person.id !== 499);
        
        // 创建姓名到人物的映射
        this.personsMap.clear();
        this.personsCache.forEach(person => {
          this.personsMap.set(person.name, person);
        });
        
        this.isLoaded = true;
        lastError = null;
        break;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    if (lastError) {
      throw lastError;
    }
  }
  
  /**
   * 强制刷新数据缓存
   */
  async forceRefresh(): Promise<void> {
    this.isLoaded = false;
    this.personsMap.clear();
    this.personsCache = [];
    await this.loadPersons();
  }
  
  /**
   * 根据姓名模糊匹配人物
   * @param name 要匹配的姓名
   * @param maxDistance 最大允许的编辑距离，默认为2
   * @returns 匹配到的人物对象，如果没有匹配则返回null
   */
  findPersonByName(name: string, maxDistance: number = 2): Person | null {
    if (!this.isLoaded) {
      // Persons data not loaded
      return null;
    }
    
    // 首先尝试精确匹配
    if (this.personsMap.has(name)) {
      return this.personsMap.get(name)!;
    }
    
    // 模糊匹配
    let bestMatch: Person | null = null;
    let bestDistance = maxDistance + 1;
    let bestLength = Infinity;
    
    for (const person of this.personsCache) {
      const distance = levenshteinDistance(name, person.name);
      
      if (distance <= maxDistance) {
        // 优先选择距离最小的，如果距离相同则选择字数最短的
        if (distance < bestDistance || 
            (distance === bestDistance && person.name.length < bestLength)) {
          bestMatch = person;
          bestDistance = distance;
          bestLength = person.name.length;
        }
      }
    }
    
    return bestMatch;
  }
  
  /**
   * 检查是否为词边界（避免匹配到词汇中间的部分）
   */
  private isWordBoundary(text: string, startIndex: number, endIndex: number): boolean {
    const prevChar = startIndex > 0 ? text[startIndex - 1] : '';
    const nextChar = endIndex < text.length ? text[endIndex] : '';
    
    const boundaryChars = /[\s，。！？；：、（）【】《》""'']/;
    
    const isPrevBoundary = !prevChar || boundaryChars.test(prevChar);
    const isNextBoundary = !nextChar || boundaryChars.test(nextChar);
    
    return isPrevBoundary || isNextBoundary;
  }

  /**
   * 使用模糊包含匹配从文本中提取人名
   */
  extractPersonsFromText(text: string): Array<{
    name: string;
    startIndex: number;
    endIndex: number;
    person: Person;
  }> {
    if (!this.isLoaded) {
      // Persons data not loaded
      return [];
    }

    if (!text || typeof text !== 'string') {
      // Invalid text provided
      return [];
    }

    const results: Array<{
      name: string;
      startIndex: number;
      endIndex: number;
      person: Person;
      matchLength: number;
    }> = [];

    // 遍历所有人物，进行包含匹配
    for (const person of this.personsCache) {
      const personName = person.name;
      
      // 1. 完整匹配
      let index = text.indexOf(personName);
      while (index !== -1) {
        if (this.isWordBoundary(text, index, index + personName.length)) {
          results.push({
            name: personName,
            startIndex: index,
            endIndex: index + personName.length,
            person,
            matchLength: personName.length
          });
        }
        index = text.indexOf(personName, index + 1);
      }
      
      // 2. 部分匹配（去掉第一个字符）
      if (personName.length > 2) {
        const partialName = personName.substring(1);
        let partialIndex = text.indexOf(partialName);
        while (partialIndex !== -1) {
          if (this.isWordBoundary(text, partialIndex, partialIndex + partialName.length)) {
            const hasLongerMatch = results.some(r => 
              r.startIndex <= partialIndex && r.endIndex >= partialIndex + partialName.length
            );
            
            if (!hasLongerMatch) {
              results.push({
                name: partialName,
                startIndex: partialIndex,
                endIndex: partialIndex + partialName.length,
                person,
                matchLength: partialName.length
              });
            }
          }
          partialIndex = text.indexOf(partialName, partialIndex + 1);
        }
      }
    }

    // 去重处理：优先保留最长的匹配
    const finalResults: Array<{
      name: string;
      startIndex: number;
      endIndex: number;
      person: Person;
    }> = [];

    const sortedResults = results.sort((a, b) => {
      if (b.matchLength !== a.matchLength) {
        return b.matchLength - a.matchLength;
      }
      return a.startIndex - b.startIndex;
    });

    for (const result of sortedResults) {
      const hasOverlap = finalResults.some(existing => 
        !(result.endIndex <= existing.startIndex || result.startIndex >= existing.endIndex)
      );
      
      if (!hasOverlap) {
        finalResults.push({
          name: result.name,
          startIndex: result.startIndex,
          endIndex: result.endIndex,
          person: result.person
        });
      }
    }

    return finalResults.sort((a, b) => a.startIndex - b.startIndex);
  }
}

// 创建全局单例实例
export const personMatcher = new PersonMatcher();