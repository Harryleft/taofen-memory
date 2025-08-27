import { searchKeywordMap } from '@/constants/bookConstants';

// 通用模糊搜索函数
export const fuzzyMatch = (searchTerm: string, targetText: string): boolean => {
  const lowerSearchTerm = searchTerm.toLowerCase();
  const lowerTargetText = targetText.toLowerCase();
  
  if (lowerTargetText.includes(lowerSearchTerm)) {
    return true;
  }
  
  const mappedKeywords = searchKeywordMap[searchTerm];
  if (mappedKeywords) {
    return mappedKeywords.some(keyword => 
      lowerTargetText.includes(keyword.toLowerCase())
    );
  }
  
  if (searchTerm.length > 1) {
    const chars = searchTerm.split('');
    let lastIndex = -1;
    const allCharsFound = chars.every(char => {
      const index = lowerTargetText.indexOf(char, lastIndex + 1);
      if (index > lastIndex) {
        lastIndex = index;
        return true;
      }
      return false;
    });
    if (allCharsFound) return true;
  }
  
  return false;
};
