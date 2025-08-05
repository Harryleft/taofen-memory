import { Users, Home, BookOpen, GraduationCap, Landmark } from 'lucide-react';

// 关系页面配置常量
export const RELATIONSHIPS_CONFIG = {
  // 人物相关配置
  person: {
    TAOFEN_ID: 499 // 邹韬奋的唯一标识ID，用于过滤和定义
  },
  
  // UI尺寸配置
  ui: {
    // 图标尺寸配置
    iconSizes: {
      CATEGORY_BUTTON: 18, // 分类按钮中的图标尺寸
      DETAIL_SECTION: 18,  // 详情页面章节标题图标尺寸
      CATEGORY_BADGE: 16   // 人物分类徽章图标尺寸
    },
    
    // 头像尺寸配置
    avatarSizes: {
      DETAIL_AVATAR: 20,      // 详情页面头像尺寸 (w-20 h-20)
      PLACEHOLDER_AVATAR: 20, // 无头像时占位符尺寸 (w-24 h-24)
      CATEGORY_BADGE: 8       // 分类徽章尺寸 (w-8 h-8)
    },
    
    // 间距配置
    spacing: {
      SMALL: 2,    // 小间距，用于紧密元素间距 (mb-2)
      MEDIUM: 4,   // 中等间距，用于按钮内边距和一般间距 (p-4, gap-4)
      LARGE: 6,    // 大间距，用于章节间距 (py-6, mb-6)
      XLARGE: 8,   // 超大间距，用于内容区域内边距 (p-8)
      XXLARGE: 12  // 最大间距，用于页面级别间距 (py-12)
    },
    
    // 边框宽度配置
    borders: {
      AVATAR_BORDER: 2, // 头像边框宽度 (border-4)
      BADGE_BORDER: 3   // 分类徽章边框宽度 (border-3)
    },
    
    // 位置偏移配置
    positioning: {
      BADGE_OFFSET: 2,    // 分类徽章位置偏移 (-bottom-2 -right-2)
      BUTTON_POSITION: 4  // 关闭按钮位置偏移 (top-4 right-4)
    }
  },
  
  // 动画配置
  animation: {
    TRANSITION_DURATION: 300, // 标准过渡动画时长 (duration-300)
    HOVER_DURATION: 200,      // 悬停动画时长 (duration-200)
    HOVER_SCALE: 110          // 悬停缩放比例 (hover:scale-110)
  },
  
  // 布局配置
  layout: {
    // Z-index层级配置
    zIndex: {
      HEADER: 40, // 页面头部固定层级 (z-40)
      MODAL: 50   // 模态框层级 (z-50)
    },
    
    // 透明度配置
    opacity: {
      HEADER_BG: 90,       // 头部背景透明度 (bg-cream/90)
      MODAL_BACKDROP: 60,  // 模态框背景遮罩透明度 (bg-black/60)
      BUTTON_BG: 80,       // 按钮背景透明度 (bg-white/80)
      GRADIENT_START: 50,  // 渐变起始透明度 (from-cream/50)
      GRADIENT_END: 20,    // 渐变结束透明度 (to-gold/20)
      CONTENT_BG: 30       // 内容区域背景透明度 (bg-cream/30)
    },
    
    // 视口相关配置
    viewport: {
      MODAL_MAX_HEIGHT: 90 // 模态框最大高度占视口比例 (max-h-[90vh])
    }
  }
};

// 分类配置
export const RELATIONSHIPS_CATEGORIES = [
  { id: 'all', name: '全部关系', icon: Users, color: 'bg-charcoal' },
  { id: '亲人家属', name: '亲人家属', icon: Home, color: 'bg-rose-400' },
  { id: '新闻出版', name: '新闻出版', icon: BookOpen, color: 'bg-gold' },
  { id: '学术文化', name: '学术文化', icon: GraduationCap, color: 'bg-heritage-blue' },
  { id: '政治社会', name: '政治社会', icon: Landmark, color: 'bg-sage-green' }
];

// 样式工具函数
export const relationshipsStyles = {
  // 页面容器样式
  pageContainer: 'min-h-screen bg-white',
  
  // 头部样式 - 现代化设计
  header: {
    container: 'relative bg-gradient-to-br from-cream via-white to-cream/50 backdrop-blur-xl border-b border-gray-100/50 sticky top-0 z-40 shadow-sm',
    wrapper: 'max-w-7xl mx-auto px-6 py-12',
    titleSection: 'text-center mb-12 relative',
    title: 'text-5xl md:text-6xl font-bold bg-gradient-to-r from-charcoal via-gray-700 to-charcoal bg-clip-text text-transparent mb-4 tracking-tight',
    subtitle: 'text-lg text-gray-600 font-light max-w-2xl mx-auto leading-relaxed',
    decorativeLine: 'w-24 h-1 bg-gradient-to-r from-gold/60 via-gold to-gold/60 mx-auto mt-6 rounded-full',
    filterContainer: 'flex flex-wrap justify-center gap-4 mt-12',
    backgroundPattern: 'absolute inset-0 bg-noise opacity-[0.02] pointer-events-none',
    statsContainer: 'flex justify-center gap-8 mt-8',
    statItem: 'text-center',
    statNumber: 'block text-2xl font-bold text-charcoal',
    statLabel: 'text-sm text-gray-600 mt-1'
  },
  
  // 主内容区域样式
  mainContent: {
    container: 'max-w-7xl mx-auto px-6 py-12',
    emptyState: {
      container: 'text-center py-12',
      title: 'text-gray-400 text-lg mb-2',
      subtitle: 'text-gray-500 text-sm'
    }
  },
  
  // 加载状态样式
  loading: {
    container: 'min-h-screen bg-white flex items-center justify-center',
    content: 'text-center',
    spinner: 'animate-spin rounded-full h-32 w-32 border-b-2 border-charcoal mx-auto mb-4',
    text: 'text-gray-600'
  },
  
  // 错误状态样式
  error: {
    container: 'min-h-screen bg-white flex items-center justify-center',
    content: 'text-center text-red-500',
    message: 'text-sm text-gray-500'
  }
};

// 分类按钮样式生成函数 - 现代化设计
export const getCategoryButtonClass = (isSelected: boolean, categoryColor: string) => {
  const baseClass = 'group relative flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-300 font-medium text-sm backdrop-blur-sm overflow-hidden';
  
  if (isSelected) {
    return `${baseClass} ${categoryColor} text-white shadow-lg shadow-black/10 scale-105 ring-2 ring-white/20`;
  }
  
  return `${baseClass} bg-white/80 text-gray-700 hover:bg-white hover:shadow-md hover:shadow-black/5 hover:scale-105 border border-gray-200/60 hover:border-gray-300/60`;
};

// 获取分类颜色的工具函数
export const getCategoryColor = (category: string) => {
  const categoryInfo = RELATIONSHIPS_CATEGORIES.find(cat => cat.id === category);
  return categoryInfo?.color || 'bg-gray-500';
};

// PersonDetailModal 样式
export const modalStyles = {
  // 模态框容器
  backdrop: 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4',
  container: 'bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto',
  
  // 头部样式
  header: {
    container: 'relative bg-gradient-to-br from-cream/50 to-gold/20 rounded-t-3xl p-8 text-center',
    closeButton: 'absolute top-4 right-4 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110',
    closeIcon: 'text-gray-600 text-lg leading-none',
    avatarContainer: 'relative inline-block',
    avatar: 'w-20 h-20 rounded-full mx-auto object-cover border-2 border-white shadow-lg',
    avatarPlaceholder: 'w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg',
    avatarPlaceholderText: 'text-white font-bold text-2xl',
    categoryBadge: 'absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-3 border-white flex items-center justify-center',
    categoryBadgeText: 'text-white text-xs font-bold',
    name: 'text-2xl font-bold text-charcoal mt-4 mb-2',
    categoryTag: 'inline-block px-4 py-1 rounded-full text-sm font-medium text-white'
  },
  
  // 内容区域样式
  content: {
    container: 'p-8',
    section: 'mb-6',
    sectionTitle: 'text-lg font-semibold text-charcoal mb-2 flex items-center gap-2',
    sectionIcon: 'text-gold',
    description: 'text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4 indent-8',
    sourcesList: 'space-y-2',
    sourceItem: 'bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors',
    sourceLink: 'flex items-center justify-between text-gray-700 hover:text-gold transition-colors group',
    sourceLinkText: 'flex-1',
    sourceLinkIcon: 'text-gray-400 group-hover:text-gold ml-2',
    sourceText: 'text-gray-700'
  }
};

// 头像容器样式生成函数
export const getAvatarContainerClass = (category: string) => {
  const categoryColor = getCategoryColor(category);
  return `${modalStyles.header.avatarPlaceholder} ${categoryColor}`;
};

// 分类徽章样式生成函数
export const getCategoryBadgeClass = (category: string) => {
  const categoryColor = getCategoryColor(category);
  return `${modalStyles.header.categoryBadge} ${categoryColor}`;
};

// 分类标签样式生成函数
export const getCategoryTagClass = (category: string) => {
  const categoryColor = getCategoryColor(category);
  return `${modalStyles.header.categoryTag} ${categoryColor}`;
};

// MasonryGrid 配置和样式
export const MASONRY_CONFIG = {
  layout: {
    CARD_WIDTH: 140,
    GAP: 24,
    VERTICAL_GAP: 65,
    MIN_COLUMNS: 1,
    MAX_COLUMNS: 4,
    BASE_HEIGHT: 280,
    HEIGHT_PER_CHAR: 0.6,
    MIN_HEIGHT: 240,
    MAX_HEIGHT: 320
  },
  lazyLoad: {
    INITIAL_ITEMS: 20,
    LOAD_THRESHOLD: 200,
    ITEMS_PER_LOAD: 10,
    LOAD_DELAY: 300
  },
  ui: {
    ICON_SIZE: 12,
    DESC_MAX_LENGTH: 100
  },
  avatar: {
    CONTAINER_SIZE: 'w-18 h-18',
    INNER_SIZE: 'w-14 h-14',
    BORDER_WIDTH: 'border-2',
    CATEGORY_ICON: {
      SIZE: 'p-1.5',
      BORDER: 'border-2',
      POSITION: '-bottom-1 -right-1'
    },
    FONT_SIZE: 'text-base',
    SHADOW: 'shadow-md'
  }
};

export const masonryStyles = {
  // 容器样式
  container: 'w-full',
  gridContainer: 'relative',
  
  // 卡片样式
  card: {
    base: 'absolute bg-gradient-to-br from-cream to-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gold/10 hover:border-gold/30 group hover:bg-gradient-to-br hover:from-gold/8 hover:to-cream hover:scale-105',
    content: 'flex flex-col items-center text-center',
    avatarContainer: 'relative mb-4',
    avatarWrapper: 'relative',
    avatarBg: 'rounded-full bg-white group-hover:bg-gold/20 border-white group-hover:border-gold/30 transition-all duration-300 flex items-center justify-center',
    avatarImg: 'rounded-full object-cover',
    avatarPlaceholder: 'rounded-full flex items-center justify-center text-white font-bold',
    categoryIcon: 'absolute rounded-full border-white',
    name: 'text-lg font-semibold text-charcoal mb-2 group-hover:text-gold transition-colors',
    description: 'text-sm text-gray-600 mb-3 px-1 leading-relaxed',
    categoryTag: 'px-3 py-1.5 rounded-full text-xs font-medium text-white'
  },
  
  // 加载状态样式
  loading: {
    container: 'flex justify-center py-8',
    spinner: 'animate-spin rounded-full h-8 w-8 border-b-2 border-gold'
  },
  
  // 完成状态样式
  complete: {
    container: 'text-center py-8 text-gray-500'
  }
};

// MasonryGrid 工具函数
export const getMasonryAvatarBgClass = () => {
  return `${MASONRY_CONFIG.avatar.CONTAINER_SIZE} ${masonryStyles.card.avatarBg} ${MASONRY_CONFIG.avatar.BORDER_WIDTH} ${MASONRY_CONFIG.avatar.SHADOW}`;
};

export const getMasonryAvatarImgClass = () => {
  return `${MASONRY_CONFIG.avatar.INNER_SIZE} ${masonryStyles.card.avatarImg}`;
};

export const getMasonryAvatarPlaceholderClass = (category: string) => {
  const categoryColor = getCategoryColor(category);
  return `${MASONRY_CONFIG.avatar.INNER_SIZE} ${masonryStyles.card.avatarPlaceholder} ${categoryColor} ${MASONRY_CONFIG.avatar.FONT_SIZE}`;
};

export const getMasonryCategoryIconClass = (category: string) => {
  const categoryColor = getCategoryColor(category);
  return `${MASONRY_CONFIG.avatar.CATEGORY_ICON.POSITION} ${categoryColor} ${masonryStyles.card.categoryIcon} ${MASONRY_CONFIG.avatar.CATEGORY_ICON.SIZE} ${MASONRY_CONFIG.avatar.CATEGORY_ICON.BORDER} ${MASONRY_CONFIG.avatar.SHADOW}`;
};

export const getMasonryCategoryTagClass = (category: string) => {
  const categoryColor = getCategoryColor(category);
  return `${masonryStyles.card.categoryTag} ${categoryColor}`;
};