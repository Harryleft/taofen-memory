import React, { useState, useEffect } from 'react';
import MasonryGrid from '../components/MasonryGrid';
import PersonDetailModal from '../components/PersonDetailModal';
import { Person } from '../types/Person';
import { useRelationshipsData } from '../hooks/useRelationshipsData';
import { 
  RELATIONSHIPS_CONFIG, 
  RELATIONSHIPS_CATEGORIES, 
  relationshipsStyles, 
  getCategoryButtonClass, 
  getCategoryColor 
} from '../styles/relationships';

export default function RelationshipsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const { persons, loading, error } = useRelationshipsData();

  // ESC键关闭详情卡片
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedPerson) {
        setSelectedPerson(null);
      }
    };

    if (selectedPerson) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedPerson]);

  // 过滤后的人物列表
  const filteredPersons = selectedCategory === 'all' 
    ? persons 
    : persons.filter(person => person.category === selectedCategory);

  if (loading) {
    return (
      <div className={relationshipsStyles.loading.container}>
        <div className={relationshipsStyles.loading.content}>
          <div className={relationshipsStyles.loading.spinner}></div>
          <p className={relationshipsStyles.loading.text}>加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={relationshipsStyles.error.container}>
        <div className={relationshipsStyles.error.content}>
          <p>数据加载失败，请稍后重试。</p>
          <p className={relationshipsStyles.error.message}>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={relationshipsStyles.pageContainer}>
      {/* Header */}
      <div className={relationshipsStyles.header.container}>
        {/* Background Pattern */}
        <div className={relationshipsStyles.header.backgroundPattern}></div>
        
        <div className={relationshipsStyles.header.wrapper}>
          {/* Title Section */}
          <div className={relationshipsStyles.header.titleSection}>
            <h1 className={relationshipsStyles.header.title}>邹韬奋人脉网络</h1>
            <p className={relationshipsStyles.header.subtitle}>
              探索中国现代新闻出版事业先驱的人际关系网络，感受那个时代知识分子的精神风貌与社会担当
            </p>
            <div className={relationshipsStyles.header.decorativeLine}></div>
          </div>
          
          {/* Category Filter */}
          <div className={relationshipsStyles.header.filterContainer}>
            {RELATIONSHIPS_CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={getCategoryButtonClass(isSelected, category.color)}
                >
                  <Icon 
                    size={RELATIONSHIPS_CONFIG.ui.iconSizes.CATEGORY_BUTTON} 
                    className={`transition-transform duration-200 ${
                      isSelected ? 'scale-110' : 'group-hover:scale-110'
                    }`}
                  />
                  <span className="relative z-10">{category.name}</span>
                  {/* Hover effect background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={relationshipsStyles.mainContent.container}>
        {/* 人物关系瀑布流 */}
        {filteredPersons.length === 0 ? (
          <div className={relationshipsStyles.mainContent.emptyState.container}>
            <div className={relationshipsStyles.mainContent.emptyState.title}>暂无相关人物</div>
            <div className={relationshipsStyles.mainContent.emptyState.subtitle}>请尝试选择其他分类</div>
          </div>
        ) : (
          <MasonryGrid
            items={filteredPersons}
            onItemClick={setSelectedPerson}
            categories={RELATIONSHIPS_CATEGORIES}
          />
        )}
      </div>
      
      {/* Person Detail Modal */}
      <PersonDetailModal
        person={selectedPerson}
        isOpen={!!selectedPerson}
        onClose={() => setSelectedPerson(null)}
      />
    </div>
  );
}