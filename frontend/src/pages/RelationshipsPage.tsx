import { useState, useEffect } from 'react';
import MasonryGrid from '../components/MasonryGrid';
import PersonDetailModal from '../components/PersonDetailModal';
import MinimalRelationshipsHeader from '../components/relationships/MinimalRelationshipsHeader';
import { Person } from '../types/Person';
import { useRelationshipsData } from '../hooks/useRelationshipsData';
import {
  RELATIONSHIPS_CONFIG,
  RELATIONSHIPS_CATEGORIES,
  getCategoryColor
} from '../constants/relationshipsConstants';

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

  // 获取分类按钮样式
  const getCategoryButtonClass = (isSelected: boolean) => {
    const baseClasses = "group relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 font-medium";

    if (isSelected) {
      return `${baseClasses} text-white shadow-lg transform scale-105`;
    }
    return `${baseClasses} text-gray-600 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md`;
  };

  // 类型适配：将 LucideIcon 转换为 MasonryGrid 期望的组件类型
  const adaptedCategories = RELATIONSHIPS_CATEGORIES.map(category => ({
    ...category,
    icon: (props: { size?: number; className?: string }) => {
      const IconComponent = category.icon;
      return <IconComponent size={props.size} className={props.className} />;
    }
  }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <p className="text-red-600 mb-2">数据加载失败，请稍后重试。</p>
          <p className="text-sm text-gray-500">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalRelationshipsHeader />

      {/* Category Filter */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {RELATIONSHIPS_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={getCategoryButtonClass(isSelected)}
                style={isSelected ? { backgroundColor: getCategoryColor(category.color) } : undefined}
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
        <div className="flex items-center justify-center gap-8 mb-8">
          <div className="text-center">
            <span className="block text-2xl font-bold text-gray-900">{persons.length}</span>
            <span className="text-sm text-gray-600">位人物</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-bold text-gray-900">{filteredPersons.length}</span>
            <span className="text-sm text-gray-600">当前显示</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        {filteredPersons.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-xl font-medium text-gray-900 mb-2">暂无相关人物</div>
            <div className="text-gray-500">请尝试选择其他分类</div>
          </div>
        ) : (
          <MasonryGrid
            items={filteredPersons}
            onItemClick={setSelectedPerson}
            categories={adaptedCategories}
          />
        )}
      </div>

      <PersonDetailModal
        person={selectedPerson}
        isOpen={!!selectedPerson}
        onClose={() => setSelectedPerson(null)}
      />
    </div>
  );
}
