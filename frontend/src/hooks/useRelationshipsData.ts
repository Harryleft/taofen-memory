import { useState, useEffect } from 'react';
import { Person } from '../types/Person';

// 韬奋先生的ID，用于从关系数据中过滤掉他本人
const TAOFEN_ID = 499;

// 原始数据类型定义
interface RawPerson {
  id: number;
  name: string;
  desc: string;
  sources?: string[];
  link?: string[];
  [key: string]: unknown;
}

export function useRelationshipsData() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/json/relationships.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rawData = await response.json();
        // 转换数据格式，将原始数据转换为组件期望的格式
        const transformedPersons: Person[] = rawData.persons.map((rawPerson: RawPerson) => ({
          ...rawPerson,
          description: rawPerson.desc, // 将desc转换为description
          sources: rawPerson.sources || [], // 保持sources为字符串数组
          link: rawPerson.link || [] // 确保link字段被正确传递
        }));
        // 过滤掉邹韬奋本人，只保留其他人脉关系
        const filteredPersons = transformedPersons.filter(person => person.id !== TAOFEN_ID);
        setPersons(filteredPersons);
      } catch (e) {
        if (e instanceof Error) {
          setError(e);
        } else {
          setError(new Error('An unknown error occurred'));
        }
        console.error('Failed to load relationships data:', e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { persons, loading, error };
}
