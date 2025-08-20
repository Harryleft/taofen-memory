import { useState, useEffect } from 'react';
import { Person } from '@/types/Person';
import { tagMatcher, hasValidDescription } from '@/utils/tagMatcher';
import { RELATIONSHIPS_CONFIG } from '@/constants/relationshipsConstants';

// 统一默认配置，避免魔法数字
const DEFAULTS = {
  centerId: 499, // 若新数据未提供 meta.centerId，则回退
};

// 旧数据原始类型定义
interface LegacyRawPerson {
  id: number;
  name: string;
  desc: string;
  sources?: string[];
  link?: string[];
  [key: string]: unknown;
}

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
    aspects?: string[];
    confidence?: number;
    significance?: string;
    strength?: string;
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
          relationshipSubtype: (rel as any)?.relationshipSubtype,
          confidence: typeof rel?.confidence === 'number' ? rel?.confidence : undefined,
          strength: (rel as any)?.strength,
          emotionalTone: (rel as any)?.emotionalTone,
          significance: (rel as any)?.significance,
          aspects: Array.isArray(rel?.aspects) ? rel?.aspects : undefined,
          evidence: Array.isArray((rel as any)?.evidence) ? (rel as any)?.evidence : undefined,
        });
      });
    }
    return {
      id: node.id,
      name: node.name,
      category: node.category,
      img: node.image_url || '',
      description: hasValidDescription(node.description) ? node.description : undefined,
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

  const transformLegacyToPersons = (rawData: { persons: LegacyRawPerson[] }): Person[] => {
    return rawData.persons.map((rawPerson: LegacyRawPerson) => ({
      id: rawPerson.id,
      name: rawPerson.name,
      category: (rawPerson as unknown as { category?: string }).category || '未知',
      img: (rawPerson as unknown as { img?: string }).img || '',
      description: hasValidDescription(rawPerson.desc) ? rawPerson.desc : undefined,
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
        setMeta({ centerId: centerId, palette: (newData.meta as any)?.palette });
        
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
        const palette = (newData.meta as any)?.palette as Record<string, string> | undefined;
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
  }, []);

  return { persons, loading, error, refetch: loadData, meta, tagIndex };
}
