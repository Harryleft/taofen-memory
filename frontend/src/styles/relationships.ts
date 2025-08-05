import { Users, Heart, BookOpen, Building, Globe } from 'lucide-react';

// 关系类型配置
export const RELATIONSHIPS_CONFIG = {
  ui: {
    iconSizes: {
      CATEGORY_BUTTON: 18
    }
  }
};

// 关系分类
export const RELATIONSHIPS_CATEGORIES = [
  {
    id: 'all',
    name: '全部',
    icon: Globe,
    color: 'gray'
  },
  {
    id: 'family',
    name: '家族',
    icon: Heart,
    color: 'red'
  },
  {
    id: 'colleague',
    name: '同事',
    icon: Users,
    color: 'blue'
  },
  {
    id: 'friend',
    name: '朋友',
    icon: Users,
    color: 'green'
  },
  {
    id: 'mentor',
    name: '师长',
    icon: BookOpen,
    color: 'purple'
  },
  {
    id: 'organization',
    name: '机构',
    icon: Building,
    color: 'orange'
  }
];

// 样式对象
export const relationshipsStyles = {
  pageContainer: 'relationships-page-container',
  loading: {
    container: 'relationships-loading-container',
    content: 'relationships-loading-content',
    spinner: 'relationships-loading-spinner',
    text: 'relationships-loading-text'
  },
  error: {
    container: 'relationships-error-container',
    content: 'relationships-error-content',
    message: 'relationships-error-message'
  },
  header: {
    filterContainer: 'relationships-filter-container',
    statsContainer: 'relationships-stats-container',
    statItem: 'relationships-stat-item',
    statNumber: 'relationships-stat-number',
    statLabel: 'relationships-stat-label'
  },
  mainContent: {
    container: 'relationships-main-content-container',
    emptyState: {
      container: 'relationships-empty-state-container',
      title: 'relationships-empty-state-title',
      subtitle: 'relationships-empty-state-subtitle'
    }
  }
};

// 模态框样式
export const modalStyles = {
  backdrop: 'relationships-modal-backdrop',
  container: 'relationships-modal-container',
  header: {
    container: 'relationships-modal-header-container',
    closeButton: 'relationships-modal-close-button',
    closeIcon: 'relationships-modal-close-icon'
  },
  avatar: {
    container: 'relationships-modal-avatar-container',
    image: 'relationships-modal-avatar',
    placeholder: 'relationships-modal-avatar-placeholder',
    placeholderText: 'relationships-modal-avatar-placeholder-text'
  },
  categoryBadge: {
    container: 'relationships-modal-category-badge',
    text: 'relationships-modal-category-badge-text'
  },
  name: 'relationships-modal-name',
  categoryTag: 'relationships-modal-category-tag',
  content: {
    container: 'relationships-modal-content-container',
    section: 'relationships-modal-section',
    sectionTitle: 'relationships-modal-section-title',
    sectionIcon: 'relationships-modal-section-icon'
  },
  description: 'relationships-modal-description',
  sources: {
    list: 'relationships-modal-sources-list',
    item: 'relationships-modal-source-item',
    link: 'relationships-modal-source-link',
    linkText: 'relationships-modal-source-link-text',
    linkIcon: 'relationships-modal-source-link-icon',
    text: 'relationships-modal-source-text'
  }
};

// 获取分类按钮样式
export const getCategoryButtonClass = (isSelected: boolean, color: string) => {
  const baseClass = 'relationships-category-button';
  if (isSelected) {
    return `${baseClass} selected`;
  }
  return `${baseClass} not-selected`;
};

// 获取分类颜色
export const getCategoryColor = (color: string) => {
  const colorMap: Record<string, string> = {
    gray: '#6b7280',
    red: '#ef4444',
    blue: '#3b82f6',
    green: '#10b981',
    purple: '#8b5cf6',
    orange: '#f97316'
  };
  return colorMap[color] || colorMap.gray;
};

// 获取头像容器样式
export const getAvatarContainerClass = () => {
  return modalStyles.avatar.container;
};

// 获取分类徽章样式
export const getCategoryBadgeClass = (color: string) => {
  return modalStyles.categoryBadge.container;
};

// 获取分类标签样式
export const getCategoryTagClass = (color: string) => {
  return modalStyles.categoryTag;
};