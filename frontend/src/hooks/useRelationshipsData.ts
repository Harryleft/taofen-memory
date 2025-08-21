import { useState, useEffect } from 'react';
import { Person } from '@/types/Person';
import { tagMatcher } from '@/utils/tagMatcher';
import { RELATIONSHIPS_CONFIG } from '@/constants/relationshipsConstants';

// 数据清理函数：统一处理各种无效描述情况
const sanitizeDescription = (desc: unknown): string | undefined => {
  // 增强的类型检查
  if (desc === null || desc === undefined) return undefined;
  
  // 处理数字0的情况
  if (desc === 0) return undefined;
  
  // 转换为字符串
  let strDesc: string;
  try {
    strDesc = String(desc);
  } catch {
    return undefined;
  }
  
  const trimmed = strDesc.trim();
  
  // 更全面的无效值检查
  const invalidValues = [
    '', '0', 'null', 'undefined', 'false', 'true', 
    'NaN', 'Infinity', '-Infinity', 'none', 'None', 'NONE'
  ];
  
  if (invalidValues.includes(trimmed)) {
    // 添加调试日志
    if (process.env.NODE_ENV === 'development') {
      console.log('[sanitizeDescription] 过滤无效描述:', { 
        original: desc, 
        trimmed,
        reason: 'invalid_value' 
      });
    }
    return undefined;
  }
  
  // 防止纯数字或符号被意外显示
  if (/^[\d\s\W]+$/.test(trimmed) && trimmed.length < 2) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[sanitizeDescription] 过滤纯数字/符号:', { 
        original: desc, 
        trimmed,
        reason: 'pure_number_or_symbol' 
      });
    }
    return undefined;
  }
  
  return trimmed;
};

// 验证人物名称的有效性
const validatePersonName = (name: unknown): string => {
  if (!name || name === null || name === undefined) {
    return '未知人物';
  }
  
  // 处理数字0的情况
  if (name === 0) {
    return '未知人物';
  }
  
  // 转换为字符串
  let strName: string;
  try {
    strName = String(name);
  } catch {
    return '未知人物';
  }
  
  const trimmed = strName.trim();
  
  // 检查无效值
  const invalidValues = [
    '', '0', 'null', 'undefined', 'false', 'true', 
    'NaN', 'Infinity', '-Infinity', 'none', 'None', 'NONE'
  ];
  
  if (invalidValues.includes(trimmed)) {
    return '未知人物';
  }
  
  // 防止纯数字或符号被作为名称
  if (/^[\d\s\W]+$/.test(trimmed)) {
    return '未知人物';
  }
  
  return trimmed || '未知人物';
};

// 验证人物类别的有效性
const validatePersonCategory = (category: unknown): string => {
  if (!category || category === null || category === undefined) {
    return '未知';
  }
  
  // 处理数字0的情况
  if (category === 0) {
    return '未知';
  }
  
  // 转换为字符串
  let strCategory: string;
  try {
    strCategory = String(category);
  } catch {
    return '未知';
  }
  
  const trimmed = strCategory.trim();
  
  // 检查无效值
  const invalidValues = [
    '', '0', 'null', 'undefined', 'false', 'true', 
    'NaN', 'Infinity', '-Infinity', 'none', 'None', 'NONE'
  ];
  
  if (invalidValues.includes(trimmed)) {
    return '未知';
  }
  
  return trimmed || '未知';
};

// 统一默认配置，避免魔法数字
const DEFAULTS = {
  centerId: 499, // 若新数据未提供 meta.centerId，则回退
};

// 旧数据原始类型定义（简化版）

// 新数据原始类型定义（relationships_new.json）
interface NewRawNode {
  id: number;
  name: string;
  category: string;
  image_url?: string;
  description?: string;
  sources?: string[];
  links?: string[];
  tier?: string;
  importance?: number;
  relationships?: Array<{
    relationshipType?: string;
    relationshipSubtype?: string;
    confidence?: number;
    strength?: string;
    emotionalTone?: string;
    significance?: string;
    aspects?: string[];
    evidence?: unknown[];
  }>;
  [key: string]: unknown;
}

interface NewPayload {
  meta?: {
    centerId?: number;
    descPreviewLen?: number;
    [key: string]: unknown;
  };
  nodes?: NewRawNode[];
}

export function useRelationshipsData() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [meta, setMeta] = useState<{ centerId?: number; palette?: Record<string, string> } | null>(null);
  const [tagIndex, setTagIndex] = useState<{ types: Set<string>; aspects: Set<string> } | null>(null);

  const transformNewNodeToPerson = (node: NewRawNode): Person => {
    const relationshipTypes = new Set<string>();
    const aspects = new Set<string>();
    const relationshipsNormalized: NonNullable<Person['extra']>['relationships'] = [];
    if (Array.isArray(node.relationships)) {
      node.relationships.forEach(rel => {
        if (rel?.relationshipType) relationshipTypes.add(rel.relationshipType);
        if (Array.isArray(rel?.aspects)) {
          rel.aspects.forEach(a => a && aspects.add(a));
        }
        relationshipsNormalized.push({
          relationshipType: rel?.relationshipType,
          relationshipSubtype: (rel as { relationshipSubtype?: string })?.relationshipSubtype,
          confidence: typeof rel?.confidence === 'number' ? rel?.confidence : undefined,
          strength: (rel as { strength?: string })?.strength,
          emotionalTone: (rel as { emotionalTone?: string })?.emotionalTone,
          significance: (rel as { significance?: string })?.significance,
          aspects: Array.isArray(rel?.aspects) ? rel?.aspects : undefined,
          evidence: Array.isArray((rel as { evidence?: unknown[] })?.evidence) ? (rel as { evidence?: unknown[] })?.evidence : undefined,
        });
      });
    }
    return {
      id: node.id,
      name: validatePersonName(node.name),
      category: validatePersonCategory(node.category),
      img: node.image_url || '',
      description: sanitizeDescription(node.description),
      sources: node.sources || [],
      link: node.links || [],
      extra: {
        tags: {
          relationshipTypes: Array.from(relationshipTypes),
          aspects: Array.from(aspects),
        },
        tier: node.tier,
        importance: typeof node.importance === 'number' ? node.importance : undefined,
        relationships: relationshipsNormalized,
      },
    };
  };

  const transformLegacyToPersons = (rawData: unknown): Person[] => {
    // 处理 relationships.json 格式：{ records, extend, page, data: [...] }
    // 其中 data[0].data 才是真正的人物数组
    const data = rawData as { data?: Array<{ data?: unknown[] }>; persons?: unknown[] };
    const personData = data.data?.[0]?.data || data.persons || [];
    
    return (personData as Array<{ id: number; name: string; desc?: string; category?: string; pic?: string; img?: string; sources?: string[]; link?: string[] }>).map((rawPerson) => ({
      id: rawPerson.id,
      name: validatePersonName(rawPerson.name),
      category: validatePersonCategory(rawPerson.category),
      img: rawPerson.pic || rawPerson.img || '',
      // 关键修复：将 "desc" 字段映射到 description
      description: sanitizeDescription(rawPerson.desc),
      sources: rawPerson.sources || [],
      link: rawPerson.link || [],
    }));
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 优先尝试读取新数据文件
      const newRes = await fetch('/data/json/relationships_new.json?' + Date.now(), {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });

      if (newRes.ok) {
        const text = await newRes.text();
        const newData: NewPayload = JSON.parse(text);
        const centerId = newData?.meta?.centerId ?? DEFAULTS.centerId;
        const nodes = Array.isArray(newData.nodes) ? newData.nodes : [];
        const transformed = nodes.map(transformNewNodeToPerson);
        const filtered = transformed.filter(p => p.id !== centerId);
        setPersons(filtered);
        setMeta({ centerId: centerId, palette: (newData.meta as { palette?: Record<string, string> })?.palette });
        
        // 构建标签索引
        const allTypes = new Set<string>();
        const allAspects = new Set<string>();
        filtered.forEach(person => {
          person.extra?.tags?.relationshipTypes?.forEach(t => allTypes.add(t));
          person.extra?.tags?.aspects?.forEach(a => allAspects.add(a));
        });
        setTagIndex({ types: allTypes, aspects: allAspects });
        
        // 初始化标签匹配器
        tagMatcher.updateConfig(RELATIONSHIPS_CONFIG.tagMatcher);
        
        // 动态注入 CSS 变量
        const palette = (newData.meta as { palette?: Record<string, string> })?.palette;
        if (palette && typeof document !== 'undefined') {
          const root = document.documentElement;
          const setVar = (key: string, val?: string) => {
            if (val) root.style.setProperty(key, val);
          };
          
          // 主色变量
          setVar('--rel-family', palette['亲人家属']);
          setVar('--rel-media', palette['新闻出版']);
          setVar('--rel-academic', palette['学术文化']);
          setVar('--rel-political', palette['政治社会']);
          setVar('--rel-all', palette['邹韬奋']);
          
          // 深色变体（用于悬浮和激活状态）- 使用稍深的颜色
          setVar('--rel-family-dark', palette['亲人家属']);
          setVar('--rel-media-dark', palette['新闻出版']);
          setVar('--rel-academic-dark', palette['学术文化']);
          setVar('--rel-political-dark', palette['政治社会']);
          setVar('--rel-all-dark', palette['邹韬奋']);
          
          // 浅色变体（用于背景和边框）- 使用稍浅的颜色
          setVar('--rel-family-light', palette['亲人家属']);
          setVar('--rel-media-light', palette['新闻出版']);
          setVar('--rel-academic-light', palette['学术文化']);
          setVar('--rel-political-light', palette['政治社会']);
          setVar('--rel-all-light', palette['邹韬奋']);
        }
        return; // 成功使用新数据后返回
      }

      // 若新数据不可用，回退旧数据
      const legacyRes = await fetch('/data/json/relationships.json?' + Date.now(), {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      if (!legacyRes.ok) {
        throw new Error(`HTTP error! status: ${legacyRes.status}`);
      }
      const legacy = await legacyRes.json();
      const personsLegacy = transformLegacyToPersons(legacy);
      const filteredLegacy = personsLegacy.filter(p => p.id !== DEFAULTS.centerId);
      setPersons(filteredLegacy);
      setMeta({ centerId: DEFAULTS.centerId });
      setTagIndex({ types: new Set(), aspects: new Set() }); // 旧数据无标签索引
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { persons, loading, error, refetch: loadData, meta, tagIndex };
}
