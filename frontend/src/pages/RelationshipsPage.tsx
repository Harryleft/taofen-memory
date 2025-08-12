import { useState, useEffect } from 'react';
import RelationshipPageMasonry from '../components/relationships/RelationshipPageMasonry.tsx';
import RelationshipPagePersonModal from '../components/relationships/RelationshipPagePersonModal.tsx';
import AppHeader from '../components/layout/header/AppHeader.tsx';
import { AppFooter } from '../components/layout/footer';
import { Person } from '../types/Person';
import { useRelationshipsData } from '../hooks/useRelationshipsData';
import {
  RELATIONSHIPS_CONFIG,
  RELATIONSHIPS_CATEGORIES,
  getCategoryBgClass
} from '../constants/relationshipsConstants';
import '../styles/relationships.css';

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

  // 获取当前选中分类在数据中对应的名称
  const selectedCategoryInData = RELATIONSHIPS_CATEGORIES.find(
    cat => cat.id === selectedCategory
  )?.nameInData || 'all';

  // 过滤后的人物列表
  const filteredPersons = selectedCategory === 'all'
    ? persons
    : persons.filter(person => person.category === selectedCategoryInData);

  // 类型适配：将 LucideIcon 转换为 RelationshipPageMasonry 期望的组件类型
  const adaptedCategories = RELATIONSHIPS_CATEGORIES.map(category => ({
    ...category,
    icon: (props: { size?: number; className?: string }) => {
      const IconComponent = category.icon;
      return <IconComponent size={props.size} className={props.className} />;
    }
  }));

  if (loading) {
    return (
      <div className="relationships-loading-container">
        <div className="relationships-loading-content">
          <div className="relationships-loading-spinner"></div>
          <p className="relationships-loading-text">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relationships-error-container">
        <div className="relationships-error-content">
          <p>数据加载失败，请稍后重试。</p>
          <p className="relationships-error-message">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relationships-page-container flex flex-col min-h-screen">
      <AppHeader moduleId="relationships" />

      {/* Category Filter */}
      <div className="relationships-main-content-container">
        <div className="relationships-filter-container">
          {RELATIONSHIPS_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`relationships-category-button ${isSelected ? 'selected' : 'not-selected'} ${isSelected ? getCategoryBgClass(category.color) : ''}`}
              >
                <Icon
                  size={RELATIONSHIPS_CONFIG.ui.iconSizes.CATEGORY_BUTTON}
                  className={`transition-transform duration-200 ${
                    isSelected ? 'scale-110' : 'group-hover:scale-110'
                  }`}
                />
                <span className="relative z-10">{category.name}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
              </button>
            );
          })}
        </div>

        {/* Statistics */}
        <div className="relationships-stats-container">
          <div className="relationships-stat-item">
            <span className="relationships-stat-number">{persons.length}</span>
            <span className="relationships-stat-label">位人物</span>
          </div>
          <div className="relationships-stat-item">
            <span className="relationships-stat-number">{filteredPersons.length}</span>
            <span className="relationships-stat-label">当前显示</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relationships-main-content-container">
        {filteredPersons.length === 0 ? (
          <div className="relationships-empty-state-container">
            <div className="relationships-empty-state-title">暂无相关人物</div>
            <div className="relationships-empty-state-subtitle">请尝试选择其他分类</div>
          </div>
        ) : (
          <RelationshipPageMasonry
            items={filteredPersons}
            onItemClick={setSelectedPerson}
            categories={adaptedCategories}
          />
        )}
      </div>

      <RelationshipPagePersonModal
        person={selectedPerson}
        isOpen={!!selectedPerson}
        onClose={() => setSelectedPerson(null)}
      />
      
      {/* Footer */}
      <AppFooter />
    </div>
  );
}
