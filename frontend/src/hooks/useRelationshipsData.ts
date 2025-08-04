import { useState, useEffect } from 'react';
import { Person } from '../types/Person';

interface RelationshipsData {
  persons: Person[];
}

// 韬奋先生的ID，用于从关系数据中过滤掉他本人
const TAOFEN_ID = 499;

export function useRelationshipsData() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/relationships.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: RelationshipsData = await response.json();
        // 过滤掉邹韬奋本人，只保留其他人脉关系
        const filteredPersons = data.persons.filter(person => person.id !== TAOFEN_ID);
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