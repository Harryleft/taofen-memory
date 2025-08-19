import { useState, useEffect } from 'react';
import { Person } from '@/types/Person';

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

  const transformNewNodeToPerson = (node: NewRawNode): Person => {
    const relationshipTypes = new Set<string>();
    const aspects = new Set<string>();
    if (Array.isArray(node.relationships)) {
      node.relationships.forEach(rel => {
        if (rel?.relationshipType) relationshipTypes.add(rel.relationshipType);
        if (Array.isArray(rel?.aspects)) {
          rel.aspects.forEach(a => a && aspects.add(a));
        }
      });
    }
    return {
      id: node.id,
      name: node.name,
      category: node.category,
      img: node.image_url || '',
      description: node.description || '',
      sources: node.sources || [],
      link: node.links || [],
      extra: {
        tags: {
          relationshipTypes: Array.from(relationshipTypes),
          aspects: Array.from(aspects),
        },
        tier: node.tier,
        importance: typeof node.importance === 'number' ? node.importance : undefined,
      },
    };
  };

  const transformLegacyToPersons = (rawData: { persons: LegacyRawPerson[] }): Person[] => {
    return rawData.persons.map((rawPerson: LegacyRawPerson) => ({
      id: rawPerson.id,
      name: rawPerson.name,
      category: (rawPerson as unknown as { category?: string }).category || '未知',
      img: (rawPerson as unknown as { img?: string }).img || '',
      description: rawPerson.desc,
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
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { persons, loading, error, refetch: loadData };
}
