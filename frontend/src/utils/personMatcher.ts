import { Person } from '../types/Person';

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
    
    try {
      const response = await fetch('/data/relationships.json');
      const data: { persons: Person[] } = await response.json();
      
      // 过滤掉邹韬奋本人（ID: 499）
      this.personsCache = data.persons.filter(person => person.id !== 499);
      
      // 创建姓名到人物的映射
      this.personsCache.forEach(person => {
        this.personsMap.set(person.name, person);
      });
      
      this.isLoaded = true;
    } catch (error) {
      console.error('Failed to load persons data:', error);
      throw error;
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
      console.warn('Persons data not loaded. Call loadPersons() first.');
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
   * 从文本中提取可能的人名并进行匹配
   * @param text 要分析的文本
   * @param maxDistance 最大允许的编辑距离
   * @returns 匹配结果数组，包含人名、位置和匹配到的人物对象
   */
  extractPersonsFromText(text: string, maxDistance: number = 2): Array<{
    name: string;
    startIndex: number;
    endIndex: number;
    person: Person;
  }> {
    if (!this.isLoaded) {
      console.warn('Persons data not loaded. Call loadPersons() first.');
      return [];
    }
    
    const results: Array<{
      name: string;
      startIndex: number;
      endIndex: number;
      person: Person;
    }> = [];
    
    // 简单的中文姓名提取规则：2-4个连续的中文字符
    const namePattern = /[\u4e00-\u9fa5]{2,4}/g;
    let match;
    
    while ((match = namePattern.exec(text)) !== null) {
      const potentialName = match[0];
      const person = this.findPersonByName(potentialName, maxDistance);
      
      if (person) {
        results.push({
          name: potentialName,
          startIndex: match.index,
          endIndex: match.index + potentialName.length,
          person
        });
      }
    }
    
    // 按照首次出现的位置排序
    return results.sort((a, b) => a.startIndex - b.startIndex);
  }
}

// 创建全局单例实例
export const personMatcher = new PersonMatcher();