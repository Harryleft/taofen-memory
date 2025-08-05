// 人物链接渲染组件 - 专注于文本中的人物链接处理

import React, { useState, useEffect, useMemo } from 'react';
import { personMatcher } from '../../../utils/personMatcher';
import { Person } from '../../../types/Person';
import styles from '../styles/timelineStyles.module.css';

interface PersonLinkRendererProps {
  text: string;
  className?: string;
  onPersonClick?: (person: Person) => void;
}

interface PersonLink {
  person: Person;
  startIndex: number;
  endIndex: number;
  name: string;
}

const PersonLinkRenderer: React.FC<PersonLinkRendererProps> = ({ 
  text, 
  className = '',
  onPersonClick
}) => {
  const [isPersonDataLoaded, setIsPersonDataLoaded] = useState(false);
  const [personLinks, setPersonLinks] = useState<PersonLink[]>([]);

  // 初始化人物数据
  useEffect(() => {
    const loadPersonData = async () => {
      try {
        await personMatcher.loadPersons();
        setIsPersonDataLoaded(true);
      } catch (error) {
        console.error('Failed to load person data:', error);
      }
    };
    
    loadPersonData();
  }, []);

  // 提取人物链接
  useEffect(() => {
    if (!isPersonDataLoaded || !text) {
      setPersonLinks([]);
      return;
    }

    const extractPersonLinks = (): PersonLink[] => {
      const links: PersonLink[] = [];
      const processedIndices = new Set<number>();

      // 使用personMatcher提取人名
      const extractedNames = personMatcher.extractPersonsFromText(text);
      
      extractedNames.forEach(({ name, person }: { name: string; person: Person }) => {
        // 查找所有匹配的位置
        let startIndex = 0;
        while (true) {
          const index = text.indexOf(name, startIndex);
          if (index === -1) break;
          
          const endIndex = index + name.length;
          
          // 检查是否与已处理的区域重叠
          let hasOverlap = false;
          for (let i = index; i < endIndex; i++) {
            if (processedIndices.has(i)) {
              hasOverlap = true;
              break;
            }
          }
          
          if (!hasOverlap) {
            links.push({
              person,
              startIndex: index,
              endIndex,
              name
            });
            
            // 标记已处理的索引
            for (let i = index; i < endIndex; i++) {
              processedIndices.add(i);
            }
          }
          
          startIndex = index + 1;
        }
      });

      // 按位置排序
      return links.sort((a, b) => a.startIndex - b.startIndex);
    };

    setPersonLinks(extractPersonLinks());
  }, [isPersonDataLoaded, text]);

  // 渲染带有人物链接的文本
  const renderTextWithLinks = useMemo(() => {
    if (!isPersonDataLoaded || personLinks.length === 0) {
      return <span>{text}</span>;
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    personLinks.forEach((link, index) => {
      // 添加链接前的普通文本
      if (link.startIndex > lastIndex) {
        elements.push(
          <span key={`text-${index}`}>
            {text.substring(lastIndex, link.startIndex)}
          </span>
        );
      }

      // 添加人物链接
      elements.push(
        <PersonLinkComponent
          key={`link-${index}`}
          person={link.person}
          name={link.name}
          onClick={onPersonClick}
        />
      );

      lastIndex = link.endIndex;
    });

    // 添加最后剩余的文本
    if (lastIndex < text.length) {
      elements.push(
        <span key="text-end">
          {text.substring(lastIndex)}
        </span>
      );
    }

    return <>{elements}</>;
  }, [isPersonDataLoaded, personLinks, text, onPersonClick]);

  return (
    <span className={className}>
      {renderTextWithLinks}
    </span>
  );
};

// 单个人物链接组件
interface PersonLinkComponentProps {
  person: Person;
  name: string;
  onClick?: (person: Person) => void;
}

const PersonLinkComponent: React.FC<PersonLinkComponentProps> = ({ 
  person, 
  name, 
  onClick 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.(person);
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <span className="relative inline-block">
      <button
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`${styles.personLink} bg-transparent border-none p-0 font-inherit`}
        title={`点击查看${name}的详细信息`}
      >
        {name}
      </button>
      
      {/* 悬浮提示 */}
      {isHovered && (
        <div className={styles.personTooltip}>
          <div className={styles.personName}>{person.name}</div>
          {person.description && (
            <div className={styles.personDescription}>
              {person.description.substring(0, 50)}...
            </div>
          )}
          {/* 小箭头 */}
          <div className={styles.personTooltipArrow}></div>
        </div>
      )}
    </span>
  );
};

export default PersonLinkRenderer;