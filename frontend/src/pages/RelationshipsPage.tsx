import React, { useState, useEffect, useRef } from 'react';
import RelationshipPageMasonry from '@/components/relationships/RelationshipPageMasonry.tsx';
import RelationshipPagePersonModal from '@/components/relationships/RelationshipPagePersonModal.tsx';
import RelationshipsCoverCard from '@/components/relationships/RelationshipsCoverCard.tsx';
import AppHeader from '@/components/layout/header/AppHeader.tsx';
import { AppFooter } from '@/components/layout/footer';
import BackToTop from '@/components/relationships/BackToTop.tsx';
import PullToRefresh from '@/components/relationships/PullToRefresh.tsx';
import { Person } from '@/types/Person';
import { useRelationshipsData } from '@/hooks/useRelationshipsData';
import {
  RELATIONSHIPS_CONFIG,
  RELATIONSHIPS_CATEGORIES,
  getCategoryBgClass
} from '@/constants/relationshipsConstants';
import '@/styles/relationships.css';

export default function RelationshipsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAspects, setSelectedAspects] = useState<string[]>([]);
  const { persons, loading, error, refetch } = useRelationshipsData();
  const filterContainerRef = useRef<HTMLDivElement>(null);
  // 处理下拉刷新
  const handleRefresh = async () => {
    await refetch();
  };

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
  const categoryFiltered = selectedCategory === 'all'
    ? persons
    : persons.filter(person => person.category === selectedCategoryInData);

  const filteredPersons = categoryFiltered.filter((person) => {
    const t = person.extra?.tags?.relationshipTypes || [];
    const a = person.extra?.tags?.aspects || [];
    const typeOk = selectedTypes.length === 0 || t.some(v => selectedTypes.includes(v));
    const aspectOk = selectedAspects.length === 0 || a.some(v => selectedAspects.includes(v));
    return typeOk && aspectOk;
  });

  const handleTagClick = (tag: { kind: 'type' | 'aspect'; value: string }) => {
    if (tag.kind === 'type') {
      setSelectedTypes(prev => prev.includes(tag.value)
        ? prev.filter(v => v !== tag.value)
        : [...prev, tag.value]
      );
    } else {
      setSelectedAspects(prev => prev.includes(tag.value)
        ? prev.filter(v => v !== tag.value)
        : [...prev, tag.value]
      );
    }
  };

  const clearAllTags = () => {
    setSelectedTypes([]);
    setSelectedAspects([]);
  };

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
      
      {/* 移动端导航优化 */}
      <div className="md:hidden">
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-800">人物关系</h1>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-500">
                {filteredPersons.length} / {persons.length}
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 封面卡片 */}
      <div className="bg-cream pt-20 pb-1">
        <div className="max-w-7xl mx-auto px-6">
          <RelationshipsCoverCard
            totalPersons={persons.length}
            totalCategories={RELATIONSHIPS_CATEGORIES.length - 1} 
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="relationships-main-content-container mb-8">
        {/* 移动端筛选器头部 */}
        <div className="md:hidden mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">人物分类</h2>
            <div className="text-sm text-gray-500">
              {filteredPersons.length} / {persons.length}
            </div>
          </div>
        </div>
        
        {/* 桌面端筛选器 */}
        <div className="hidden md:block">
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
        </div>
        
        {/* 移动端横向滚动筛选器 */}
        <div className="md:hidden">
          <div 
            ref={filterContainerRef}
            className="relationships-filter-container-mobile overflow-x-auto scrollbar-hide -mx-6 px-6"
            style={{
              // 移动端滚动优化
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'smooth'
            } as React.CSSProperties}
          >
            <div className="flex gap-2 pb-2">
              {RELATIONSHIPS_CATEGORIES.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      // 滚动到选中项
                      setTimeout(() => {
                        const container = filterContainerRef.current;
                        if (container) {
                          const buttons = container.querySelectorAll('button');
                          const selectedButton = buttons[category.id === 'all' ? 0 : 
                            category.id === 'family' ? 1 :
                            category.id === 'media' ? 2 :
                            category.id === 'academic' ? 3 : 4];
                          if (selectedButton) {
                            selectedButton.scrollIntoView({
                              behavior: 'smooth',
                              block: 'nearest',
                              inline: 'center'
                            });
                          }
                        }
                      }, 100);
                    }}
                    className={`relationships-category-button-mobile flex-shrink-0 ${isSelected ? 'selected' : 'not-selected'} ${isSelected ? getCategoryBgClass(category.color) : ''}`}
                  >
                    <Icon
                      size={16}
                      className={`transition-transform duration-200 ${
                        isSelected ? 'scale-110' : ''
                      }`}
                    />
                    <span className="relative z-10 text-sm">{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relationships-main-content-container flex-1 pt-0">
        {(selectedTypes.length > 0 || selectedAspects.length > 0) && (
          <div className="max-w-7xl mx-auto px-6 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              {selectedTypes.map((t) => (
                <button
                  key={`sel-type-${t}`}
                  className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                  onClick={() => handleTagClick({ kind: 'type', value: t })}
                >
                  {t} ×
                </button>
              ))}
              {selectedAspects.map((a) => (
                <button
                  key={`sel-aspect-${a}`}
                  className="px-2 py-0.5 text-xs rounded-full bg-gray-50 text-gray-600 hover:bg-gray-200"
                  onClick={() => handleTagClick({ kind: 'aspect', value: a })}
                >
                  {a} ×
                </button>
              ))}
              <button
                className="ml-auto text-xs text-blue-600 hover:underline"
                onClick={clearAllTags}
              >
                清空标签筛选
              </button>
            </div>
          </div>
        )}
        <PullToRefresh onRefresh={handleRefresh}>
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
              onTagClick={handleTagClick}
            />
          )}
        </PullToRefresh>
      </div>

      <RelationshipPagePersonModal
        person={selectedPerson}
        isOpen={!!selectedPerson}
        onClose={() => setSelectedPerson(null)}
      />
      
      {/* Footer */}
      <AppFooter />
      
      {/* 移动端功能组件 */}
      <BackToTop />
    </div>
  );
}
