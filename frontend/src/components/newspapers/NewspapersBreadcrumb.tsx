import React from 'react';
import { PublicationItem, IssueItem } from './services';

interface BreadcrumbItem {
  id: string;
  label: string;
  type: 'root' | 'publication' | 'issue';
  data?: PublicationItem | IssueItem;
}

interface NewspapersBreadcrumbProps {
  publications: PublicationItem[];
  selectedPublication?: PublicationItem | null;
  selectedIssue?: IssueItem | null;
  onPublicationSelect?: (publication: PublicationItem) => void;
  onIssueSelect?: (issue: IssueItem) => void;
  onRootSelect?: () => void;
  isMobile?: boolean;
}

export const NewspapersBreadcrumb: React.FC<NewspapersBreadcrumbProps> = ({
  selectedPublication,
  selectedIssue,
  onPublicationSelect,
  onIssueSelect,
  onRootSelect,
  isMobile = false
}) => {
  // 构建面包屑数据
  const buildBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [
      {
        id: 'root',
        label: '数字报刊',
        type: 'root'
      }
    ];

    if (selectedPublication) {
      breadcrumbs.push({
        id: selectedPublication.id,
        label: selectedPublication.title,
        type: 'publication',
        data: selectedPublication
      });

      if (selectedIssue) {
        breadcrumbs.push({
          id: selectedIssue.manifest,
          label: selectedIssue.title,
          type: 'issue',
          data: selectedIssue
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  // 处理面包屑点击
  const handleBreadcrumbClick = (item: BreadcrumbItem) => {
    switch (item.type) {
      case 'root':
        onRootSelect?.();
        break;
      case 'publication':
        if (item.data && onPublicationSelect) {
          onPublicationSelect(item.data as PublicationItem);
        }
        break;
      case 'issue':
        if (item.data && onIssueSelect && selectedPublication) {
          onIssueSelect(item.data as IssueItem);
        }
        break;
    }
  };

  // 移动端简化显示
  if (isMobile) {
    return (
      <div className="newspapers-breadcrumb newspapers-breadcrumb--mobile">
        <div className="newspapers-breadcrumb__content">
          {selectedIssue ? (
            <div className="newspapers-breadcrumb__mobile-current">
              <button
                onClick={() => handleBreadcrumbClick(breadcrumbs[breadcrumbs.length - 2])}
                className="newspapers-breadcrumb__mobile-back"
                aria-label="返回"
              >
                ←
              </button>
              <span className="newspapers-breadcrumb__mobile-text">
                {selectedIssue.title}
              </span>
            </div>
          ) : selectedPublication ? (
            <div className="newspapers-breadcrumb__mobile-current">
              <button
                onClick={() => handleBreadcrumbClick(breadcrumbs[0])}
                className="newspapers-breadcrumb__mobile-back"
                aria-label="返回"
              >
                ←
              </button>
              <span className="newspapers-breadcrumb__mobile-text">
                {selectedPublication.title}
              </span>
            </div>
          ) : (
            <div className="newspapers-breadcrumb__mobile-current">
              <span className="newspapers-breadcrumb__mobile-text">
                数字报刊
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 桌面端完整面包屑
  return (
    <nav className="newspapers-breadcrumb" aria-label="面包屑导航">
      <ol className="newspapers-breadcrumb__list">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isClickable = !isLast && (item.type === 'root' || item.data);

          return (
            <li key={item.id} className="newspapers-breadcrumb__item">
              {isClickable ? (
                <button
                  onClick={() => handleBreadcrumbClick(item)}
                  className="newspapers-breadcrumb__link"
                  aria-label={`导航到${item.label}`}
                >
                  {item.label}
                </button>
              ) : (
                <span className="newspapers-breadcrumb__text newspapers-breadcrumb__text--current">
                  {item.label}
                </span>
              )}
              
              {!isLast && (
                <span className="newspapers-breadcrumb__separator" aria-hidden="true">
                  ›
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default NewspapersBreadcrumb;