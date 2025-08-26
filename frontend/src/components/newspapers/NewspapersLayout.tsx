import React from 'react';
import AppHeader from '@/components/layout/header/AppHeader.tsx';
import NewspapersBreadcrumb from './NewspapersBreadcrumb.tsx';
import { IssueItem, PublicationItem } from './services';
import { VerticalNewspaperCard } from './VerticalNewspaperCard.tsx';
import { NewspapersGuideArea } from './NewspapersGuideArea.tsx';

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
  // 动态渲染侧边栏内容
  const renderSidebarContent = () => {
    if (sidebarContent) {
      return sidebarContent;
    }

    if (selectedPublication) {
      // 显示期数列表 (界面2)
      return (
        <div className="newspapers-sidebar__content">
          <div className="newspapers-sidebar__header">
            <button
              onClick={onRootSelect}
              className="newspapers-sidebar__back"
              aria-label="返回刊物列表"
            >
              ←
            </button>
            <h2 className="newspapers-sidebar__title">
              {selectedPublication.title}
            </h2>
          </div>
          <div className="newspapers-issue-list">
            {loading ? (
              <div className="newspapers-loading__spinner"></div>
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
                  </div>
                  <div className="newspapers-issue-item__summary">
                    {issue.summary}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    } else {
      // 显示刊物列表 - 简化的单列布局
      return (
        <>
          <h2 className="newspapers-sidebar__title">报刊列表</h2>
          <div className="newspapers-vertical-list">
            {publications.map((publication) => (
              <VerticalNewspaperCard
                key={publication.id}
                publication={publication}
                isSelected={selectedPublication?.id === publication.id}
                onClick={onPublicationSelect}
              />
            ))}
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