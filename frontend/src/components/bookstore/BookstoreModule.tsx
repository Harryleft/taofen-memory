/**
 * @file BookstoreModule.tsx
 * @description 书店页面的核心业务逻辑和状态管理中心。
 * @module components/bookstore/BookstoreModule
 * @summary
 * 该组件是书店功能的顶层容器，负责整合所有子组件和自定义 Hooks，以实现一个功能完整的书籍展示页面。
 * - **状态管理**: 使用 `useState` 管理筛选条件（搜索词、年份、分类）。
 * - **数据获取**: 通过自定义 Hook `useBookData` 获取、筛选和分页书籍数据。
 * - **响应式布局**: 通过 `useResponsiveColumns` 动态计算瀑布流的列数。
 * - **无限滚动**: 通过 `useInfiniteScroll` 实现滚动加载更多数据和卡片懒加载。
 * - **详情展示**: 通过 `useLightbox` 管理书籍详情弹窗的显示和导航。
 * - **组件协调**: 将状态和回调函数传递给 `BookFiltersPanel`、`BookGrid` 和 `BookDetailModal` 等子组件。
 * - **性能优化**: 使用 `useMemo` 计算瀑布流布局，并通过防抖（debouncing）处理筛选输入。
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { BookItem } from '@/types/bookTypes';
import { downloadCSV } from '@/utils/bookUtils';
import { NewspaperService, PublicationItem } from '@/components/newspapers/services';
import { IIIFCollectionItem } from '@/components/newspapers/iiifTypes';

import BookFiltersPanel from './BookFiltersPanel.tsx';
import BookGrid from './BookGridContainer.tsx';
import BookDetailModal from './BookDetailModal.tsx';
import { BookstoreCoverCard } from '@/components/common/CoverCard.tsx';

// 简单的报刊卡片组件
const NewspaperCard: React.FC<{ publication: IIIFCollectionItem; onClick: () => void }> = ({ publication, onClick }) => (
  <div 
    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-4"
    onClick={onClick}
  >
    <div className="aspect-[3/4] bg-gray-200 rounded mb-3 flex items-center justify-center">
      <span className="text-4xl">📰</span>
    </div>
    <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
      {publication.label?.zh?.[0] || publication.label?.en?.[0] || '未知刊物'}
    </h3>
  </div>
);

// 简单的期数卡片组件
const IssueCard: React.FC<{ issue: IIIFCollectionItem; onClick: () => void }> = ({ issue, onClick }) => (
  <div 
    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-4"
    onClick={onClick}
  >
    <div className="aspect-[3/4] bg-gray-200 rounded mb-3 flex items-center justify-center">
      <span className="text-4xl">📄</span>
    </div>
    <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
      {issue.label?.zh?.[0] || issue.label?.en?.[0] || '未知期数'}
    </h3>
  </div>
);

// 简单的查看器组件
const ViewerPage: React.FC<{ publicationId: string; issueId: string }> = ({ publicationId, issueId }) => {
  const manifestUrl = NewspaperService.getProxyUrl(`https://www.ai4dh.cn/iiif/3/manifests/${publicationId}/${issueId}/manifest.json`);

  return (
    <div className="h-full">
      <iframe
        src={`/uv_simple.html?v=${Date.now()}#?iiifManifestId=${encodeURIComponent(manifestUrl)}&embedded=true`}
        className="w-full h-full border-0"
        title="报刊查看器"
        allowFullScreen
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
      />
    </div>
  );
};

import { useBookData } from '@/hooks/useBookData';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useLightbox } from '@/hooks/useLightbox';
import { useResponsiveColumns } from '@/hooks/useResponsiveColumns';

// 使用配置常量
const SEARCH_DEBOUNCE_DELAY = 300; // ms
const COLUMN_GAP = 16; // px
const LOAD_MORE_INDICATOR_HEIGHT = 80; // px

interface BookstoreTimelineModuleProps {
  className?: string;
}

/**
 * @component BookstoreTimelineModule
 * @description 书店页面的主组件，整合了所有功能模块。
 * @param {BookstoreTimelineModuleProps} props - 组件的 props。
 * @returns {JSX.Element} - 渲染出的书店页面。
 */
export default function BookstoreTimelineModule({ className = '' }: BookstoreTimelineModuleProps) {
  // 标签页状态管理
  const [activeTab, setActiveTab] = useState<'books' | 'newspapers'>('books');
  
  // 筛选状态管理
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // 报刊数据状态
  const [publications, setPublications] = useState<PublicationItem[]>([]);
  const [newspapersLoading, setNewspapersLoading] = useState(true);
  const [newspapersError, setNewspapersError] = useState<string | null>(null);
  
  // 期数列表状态
  const [selectedPublication, setSelectedPublication] = useState<PublicationItem | null>(null);
  const [issues, setIssues] = useState<IIIFCollectionItem[]>([]);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [issuesError, setIssuesError] = useState<string | null>(null);
  
  // 查看器状态
  const [selectedIssue, setSelectedIssue] = useState<IIIFCollectionItem | null>(null);
  const [currentView, setCurrentView] = useState<'catalog' | 'viewer'>('catalog');
  
  // 构建筛选条件对象
  const filters = useMemo(() => ({ searchTerm, category: selectedCategory, year: selectedYear }), [searchTerm, selectedCategory, selectedYear]);
  
  // 数据管理：书籍数据获取、分页、筛选
  const {
    allData,
    displayedData,
    hasMore,
    isLoading,
    isInitialLoading,
    uniqueYears,
    uniqueCategories,
    loadMoreData,
    resetAndReload
  } = useBookData(filters);
  
  // 响应式布局：根据屏幕宽度计算列数
  const { columns } = useResponsiveColumns();
  
  // 无限滚动：可见性检测、性能优化
  const {
    visibleItems,
    loadMoreRef,
    setInitialVisibleItems
  } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: loadMoreData,
    displayedDataLength: displayedData.length
  });
  
  // 灯箱控制：书籍详情预览、导航
  const {
    selectedItem,
    currentIndex,
    openLightbox,
    closeLightbox,
    nextItem,
    prevItem
  } = useLightbox();

  // 【修复】使用 useRef 追踪上一次的 isInitialLoading 状态，用于精确判断重置加载何时完成
  const prevIsInitialLoading = useRef(isInitialLoading);

  // 报刊数据加载
  useEffect(() => {
    const loadNewspapers = async () => {
      try {
        setNewspapersLoading(true);
        setNewspapersError(null);
        const data = await NewspaperService.getPublications();
        setPublications(data);
      } catch (err) {
        setNewspapersError(err instanceof Error ? err.message : '加载报刊失败');
      } finally {
        setNewspapersLoading(false);
      }
    };

    loadNewspapers();
  }, []);

  // 加载期数列表
  const loadIssues = async (publication: PublicationItem) => {
    try {
      setIssuesLoading(true);
      setIssuesError(null);
      setSelectedPublication(publication);
      
      // 调试信息：检查publication数据的实际内容
      console.log('🔍 [调试] publication.id:', publication.id);
      console.log('🔍 [调试] publication.collection:', publication.collection);
      console.log('🔍 [调试] publication.title:', publication.title);
      
      // publication.collection 应该是完整的 collection URL
      const collectionUrl = publication.collection;
      console.log('🔍 [调试] 使用的collectionUrl:', collectionUrl);
      
      const issuesData = await NewspaperService.getIssuesForPublication(collectionUrl);
      
      // 转换为 IIIFCollectionItem 格式
      const issuesCollection: IIIFCollectionItem[] = issuesData.map(issue => ({
        id: issue.id,
        manifest: issue.manifest,
        type: "Manifest",
        label: {
          zh: [issue.title],
          en: [issue.title]
        }
      }));
      
      console.log('🔍 [调试] 加载的期数数量:', issuesCollection.length);
      setIssues(issuesCollection);
    } catch (err) {
      console.error('🔍 [调试] 加载期数失败:', err);
      setIssuesError(err instanceof Error ? err.message : '加载期数失败');
    } finally {
      setIssuesLoading(false);
    }
  };

  // 返回报刊列表
  const handleBackToPublications = () => {
    setSelectedPublication(null);
    setIssues([]);
    setIssuesError(null);
  };

  // 处理期数点击
  const handleIssueClick = (issue: IIIFCollectionItem) => {
    setSelectedIssue(issue);
    setCurrentView('viewer');
  };

  // 返回期数列表
  const handleBackToIssues = () => {
    setCurrentView('catalog');
    setSelectedIssue(null);
  };

  // 防抖处理：筛选条件变化时重新加载数据
  useEffect(() => {
    // isInitialLoading 会在 resetAndReload 开始时变为 true，这里用它来防止在加载期间再次触发
    if (isInitialLoading) return;
    
    const debounceTimer = setTimeout(() => {
      resetAndReload(filters);
    }, SEARCH_DEBOUNCE_DELAY);

    return () => clearTimeout(debounceTimer);
  }, [filters, isInitialLoading, resetAndReload]); // 【优化】依赖项简化为只包含筛选条件

  
  // 【修复】这个新的 useEffect 只在“筛选/重置”加载完成后执行一次，而不会在“加载更多”时执行
  useEffect(() => {
    // 条件：只有当 `isInitialLoading` 从 `true` 变为 `false` 时，才执行
    if (prevIsInitialLoading.current && !isInitialLoading && displayedData.length > 0) {
      setInitialVisibleItems(displayedData);
    }
    // 在每次渲染后，同步 ref 的值为当前状态，供下一次渲染判断
    prevIsInitialLoading.current = isInitialLoading;
  }, [isInitialLoading, displayedData, setInitialVisibleItems]);
  

  // 瀑布流布局算法：将书籍分配到最短的列中
  const columnArrays = useMemo(() => {
    const arrays: BookItem[][] = Array.from({ length: columns }, () => []);
    const heights = new Array(columns).fill(0);

    displayedData.forEach((item) => {
      const shortestColumnIndex = heights.indexOf(Math.min(...heights));
      arrays[shortestColumnIndex].push(item);
      heights[shortestColumnIndex] += item.dimensions.height + COLUMN_GAP;
    });

    return arrays;
  }, [displayedData, columns]);

  // 灯箱事件处理器
  const handleOpenLightbox = (item: BookItem) => {
    openLightbox(item, displayedData);
  };
  
  const handleNextItem = () => {
    nextItem(displayedData);
  };
  
  const handlePrevItem = () => {
    prevItem(displayedData);
  };
  
  // 【修复】为搜索/筛选场景增加判断逻辑
  // 如果 hasMore 为 false，说明是搜索/筛选的最终结果，我们应该展示所有项。
  // 否则，我们才使用 useInfiniteScroll 提供的 visibleItems。
  const itemsToDisplay = !hasMore 
    ? new Set(displayedData.map(item => item.id)) 
    : visibleItems;

  // 查看器视图
  if (currentView === 'viewer' && selectedPublication && selectedIssue) {
    const publicationId = selectedPublication.id;
    const issueId = selectedIssue.id;
    
    return (
      <div className="h-screen">
        <button
          onClick={handleBackToIssues}
          className="fixed top-4 left-4 z-50 bg-white text-blue-500 px-4 py-2 rounded-lg shadow-lg hover:bg-gray-50"
        >
          ← 返回期刊目录
        </button>
        <ViewerPage publicationId={publicationId} issueId={issueId} />
      </div>
    );
  }

  // 初始加载状态渲染
  if (isInitialLoading && displayedData.length === 0) {
    return (
      <section className={`relative py-20 ${className}`}>
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-500 rounded-full animate-spin"></div>
            <span className="mt-4 text-lg text-gray-600 font-song">正在加载书籍数据...</span>
          </div>
        </div>
      </section>
    );
  }

  // 书籍标签内容
  const booksContent = (
    <>
      {/* 书店封面卡 */}
      <BookstoreCoverCard 
        totalBooks={allData.length} 
        featuredCategories={uniqueCategories.length} 
      />
      
      {/* 筛选控件 */}
      <BookFiltersPanel
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        uniqueCategories={uniqueCategories}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        uniqueYears={uniqueYears}
        onDownload={() => downloadCSV(allData)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* 书籍网格 - 瀑布流布局 */}
      <BookGrid
        columnArrays={columnArrays}
        visibleItems={itemsToDisplay}
        onOpenLightbox={handleOpenLightbox}
      />

      {/* 加载更多 */}
      {hasMore && (
        <>
          <div ref={loadMoreRef} className={`w-full h-${LOAD_MORE_INDICATOR_HEIGHT}`} />
          {isLoading && (
            <div className="flex items-center justify-center w-full py-4">
               <div className="flex items-center text-gray-500">
                 <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
                 <span className="ml-3 font-song">正在加载更多...</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* 空状态提示 */}
      {displayedData.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-bold text-charcoal mb-2" style={{fontFamily: "'KaiTi', 'STKaiti', '华文楷体', serif"}}>未找到相关书籍</h3>
          <p className="text-charcoal/60" style={{fontFamily: "'SimSun', '宋体', 'NSimSun', serif"}}>请尝试调整搜索条件</p>
        </div>
      )}
    </>
  );

  // 报刊标签内容
  const newspapersContent = (
    <>
      {/* 报刊内容头部 */}
      <div className="mb-8">
        <button 
          onClick={() => setActiveTab('books')}
          className="text-blue-500 hover:text-blue-600 mb-4 inline-block"
        >
          ← 返回书籍
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">数字报刊</h1>
        <p className="text-gray-600">浏览历史报刊资料</p>
      </div>

      {selectedPublication ? (
        <>
          {/* 期数列表头部 */}
          <div className="mb-6">
            <button 
              onClick={handleBackToPublications}
              className="text-blue-500 hover:text-blue-600 mb-4 inline-block"
            >
              ← 返回刊物列表
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedPublication.title}</h2>
            <p className="text-gray-600">选择期数进行浏览</p>
          </div>

          {/* 期数列表 */}
          {issuesLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-500 rounded-full animate-spin"></div>
              <span className="mt-4 text-lg text-gray-600 font-song">正在加载期数数据...</span>
            </div>
          ) : issuesError ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-bold text-charcoal mb-2">加载失败</h3>
              <p className="text-charcoal/60 mb-4">{issuesError}</p>
              <button 
                onClick={() => loadIssues(selectedPublication)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                重试
              </button>
            </div>
          ) : issues.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-bold text-charcoal mb-2">暂无期数数据</h3>
              <p className="text-charcoal/60">请稍后再试</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {issues.map((issue) => (
                <div key={issue.id} className="block">
                  <IssueCard 
                    issue={issue} 
                    onClick={() => handleIssueClick(issue)} 
                  />
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* 报刊网格 */}
          {newspapersLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-500 rounded-full animate-spin"></div>
              <span className="mt-4 text-lg text-gray-600 font-song">正在加载报刊数据...</span>
            </div>
          ) : newspapersError ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📰</div>
              <h3 className="text-xl font-bold text-charcoal mb-2">加载失败</h3>
              <p className="text-charcoal/60 mb-4">{newspapersError}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                重试
              </button>
            </div>
          ) : publications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📰</div>
              <h3 className="text-xl font-bold text-charcoal mb-2">暂无报刊数据</h3>
              <p className="text-charcoal/60">请稍后再试</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {publications.map((publication) => {
                // 将 PublicationItem 转换为 IIIFCollectionItem 格式
                const iiifPublication: IIIFCollectionItem = {
                  id: publication.id,
                  type: "Collection",
                  label: {
                    zh: [publication.title],
                    en: [publication.title]
                  }
                };
                
                return (
                  <div key={publication.id} className="block">
                    <NewspaperCard 
                      publication={iiifPublication} 
                      onClick={() => loadIssues(publication)} 
                    />
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </>
  );

  
  return (
    <section className={`relative py-20 ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        {/* 根据当前标签显示对应内容 */}
        {activeTab === 'books' ? booksContent : newspapersContent}
      </div>

      {/* 书籍详情灯箱 */}
      <BookDetailModal
        selectedItem={selectedItem}
        currentIndex={currentIndex}
        totalCount={displayedData.length}
        onClose={closeLightbox}
        onNext={handleNextItem}
        onPrev={handlePrevItem}
      />
    </section>
  );
}
