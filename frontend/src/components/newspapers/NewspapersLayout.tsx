import React, { useState, useEffect } from 'react';
import AppHeader from '@/components/layout/header/AppHeader.tsx';
import NewspapersBreadcrumb from './NewspapersBreadcrumb.tsx';
import { IssueItem, PublicationItem } from './services';
import { VerticalNewspaperCard } from './VerticalNewspaperCard.tsx';

// 本地报纸数据接口
interface LocalNewspaperData {
  title: string;
  founding_date: string;
  total_issues: number;
  description: string;
  image: string;
}

interface NewspapersLayoutProps {
  children: React.ReactNode;
  publications: PublicationItem[];
  selectedPublication: PublicationItem | null;
  selectedIssue: IssueItem | null;
  onPublicationSelect: (publication: PublicationItem) => void;
  onIssueSelect: (issue: IssueItem) => void;
  onRootSelect: () => void;
  isMobile: boolean;
  sidebarContent?: React.ReactNode;
  issues: IssueItem[];
  loading: boolean;
}

/**
 * 新的Grid布局组件 - 渐进式重构第一阶段
 * 
 * 这个组件实现了真正的左右布局，符合原型图要求：
 * - 左侧：导航栏（320px固定宽度）
 * - 右侧：主内容区（弹性布局）
 * - 顶部：Header和面包屑导航
 * 
 * 特点：
 * - 使用CSS Grid实现布局
 * - 响应式设计，移动端自动隐藏侧边栏
 * - 性能优化，使用contain属性
 * - 支持侧边栏内容自定义
 */
export const NewspapersLayout: React.FC<NewspapersLayoutProps> = ({
  children,
  publications,
  selectedPublication,
  selectedIssue,
  onPublicationSelect,
  onIssueSelect,
  onRootSelect,
  isMobile,
  sidebarContent,
  issues,
  loading
}) => {
  const [localNewspapers, setLocalNewspapers] = useState<LocalNewspaperData[]>([]);
  const [matchingLoading, setMatchingLoading] = useState(true);

  // 加载本地报纸数据并与远程数据匹配
  useEffect(() => {
    const loadAndMatchNewspapers = async () => {
      setMatchingLoading(true);
      
      try {
        // 加载本地数据
        const localResponse = await fetch('/data/json/newspapers_info.json');
        if (!localResponse.ok) {
          console.error('无法加载本地报纸数据');
          return;
        }
        const localData = await localResponse.json();
        
        // 更智能的匹配算法：只保留在远程数据中存在的报刊
        const matchedNewspapers = localData.filter(localNewspaper => {
          const cleanLocalTitle = localNewspaper.title
            .replace(/[《》\s]/g, '') // 移除书名号和空格
            .trim();
          
          return publications.some(remotePub => {
            const cleanRemoteTitle = remotePub.title
              .replace(/[《》\s]/g, '') // 移除书名号和空格
              .trim();
            
            // 精确匹配（不移除报刊类型后缀，避免过度标准化）
            if (cleanRemoteTitle === cleanLocalTitle) {
              return true;
            }
            
            // 包含匹配（检查核心关键词）- 仅用于精确匹配失败后的备选方案
            const localKeywords = cleanLocalTitle.split(/[\u4e00-\u9fa5]+/).filter(k => k.length > 1);
            const remoteKeywords = cleanRemoteTitle.split(/[\u4e00-\u9fa5]+/).filter(k => k.length > 1);
            
            // 检查是否有足够的关键词匹配
            const matchingKeywords = localKeywords.filter(keyword => 
              remoteKeywords.some(remoteKeyword => 
                remoteKeyword.includes(keyword) || keyword.includes(remoteKeyword)
              )
            );
            
            // 严格的关键词匹配条件
            return matchingKeywords.length >= 2 && 
                   matchingKeywords.length === localKeywords.length && 
                   matchingKeywords.length === remoteKeywords.length;
          });
        });
        
        setLocalNewspapers(matchedNewspapers);
      } catch (error) {
        console.error('加载本地报纸数据失败:', error);
      } finally {
        setMatchingLoading(false);
      }
    };

    loadAndMatchNewspapers();
  }, [publications]); // 保持依赖项不变，这是正确的
  // 动态渲染侧边栏内容
  const renderSidebarContent = () => {
    if (sidebarContent) {
      return sidebarContent;
    }

    if (selectedPublication) {
      // 显示期数列表 (界面2)
      return (
        <>
          {/* 返回按钮和刊物标题 */}
          <div className="newspapers-issue-list__header">
            <button
              onClick={onRootSelect}
              className="newspapers-issue-list__back"
              aria-label="返回刊物列表"
            >
              ← 返回
            </button>
            <h2 className="newspapers-issue-list__title">
              {selectedPublication.title}
            </h2>
          </div>
          
          {/* 期数列表 */}
          <div className="newspapers-issue-list">
            {loading ? (
              <div className="newspapers-issue-list__loading">
                <div className="newspapers-loading__spinner"></div>
                <p>加载期数...</p>
              </div>
            ) : issues.length === 0 ? (
              <div className="newspapers-issue-list__empty">
                <div className="newspapers-issue-list__empty-icon">📄</div>
                <p>暂无期数</p>
              </div>
            ) : (
              issues.map((issue) => (
                <div
                  key={issue.manifest}
                  className={`newspapers-issue-item ${
                    selectedIssue?.manifest === issue.manifest
                      ? 'newspapers-issue-item--selected'
                      : ''
                  }`}
                  onClick={() => onIssueSelect(issue)}
                >
                  <div className="newspapers-issue-item__title">
                    {issue.title}
                    {selectedIssue?.manifest === issue.manifest && (
                      <span className="newspapers-issue-item__current">●</span>
                    )}
                  </div>
                  <div className="newspapers-issue-item__summary">
                    {issue.summary}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      );
    } else {
      // 显示刊物列表 - 使用匹配的本地数据
      return (
        <>
          <h2 className="newspapers-sidebar__title">报刊列表</h2>
          <div className="newspapers-vertical-list">
            {matchingLoading ? (
              <div className="newspapers-loading-matching">
                <div className="newspapers-loading__spinner"></div>
                <p>正在匹配报刊数据...</p>
              </div>
            ) : localNewspapers.length === 0 ? (
              <div className="newspapers-no-matches">
                <div className="newspapers-no-matches__icon">📭</div>
                <p>没有找到匹配的报刊数据</p>
                <p className="newspapers-no-matches__hint">
                  请检查本地数据与远程数据的匹配情况
                </p>
              </div>
            ) : (
              localNewspapers.map((newspaper, index) => {
                const matchedRemotePub = publications.find(p => p.title === newspaper.title);
                return (
                  <VerticalNewspaperCard
                    key={index}
                    publication={{
                      ...matchedRemotePub || {
                        id: newspaper.title,
                        title: newspaper.title,
                        name: newspaper.title,
                        issueCount: newspaper.total_issues,
                        collection: '',
                        lastUpdated: null
                      },
                      // 添加本地数据字段
                      founding_date: newspaper.founding_date,
                      description: newspaper.description,
                      image: newspaper.image
                    }}
                    isSelected={selectedPublication?.title === newspaper.title}
                    onClick={onPublicationSelect}
                  />
                );
              })
            )}
          </div>
        </>
      );
    }
  };

  return (
    <div className="newspapers-layout">
      {/* Header区域 - 包含AppHeader和面包屑导航 */}
      <div className="newspapers-layout__header">
        <AppHeader moduleId="newspapers" />
        <NewspapersBreadcrumb
          publications={publications}
          selectedPublication={selectedPublication}
          selectedIssue={selectedIssue}
          onPublicationSelect={onPublicationSelect}
          onIssueSelect={onIssueSelect}
          onRootSelect={onRootSelect}
          isMobile={isMobile}
        />
      </div>

      {/* 侧边栏区域 - 动态内容 */}
      <div className="newspapers-layout__sidebar">
        {renderSidebarContent()}
      </div>

      {/* 主内容区域 - 查看器和内容 */}
      <div className="newspapers-layout__main">
        {children}
      </div>
    </div>
  );
};

export default NewspapersLayout;