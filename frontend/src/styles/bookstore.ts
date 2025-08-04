/**
 * 邹韬奋纪念网站 - 书店模块样式配置
 * 提取可复用的样式常量和配置
 */

// 字体配置
export const BOOKSTORE_FONTS = {
  // 宋体 - 用于正文内容
  song: "'SimSun', '宋体', 'NSimSun', serif",
  // 楷体 - 用于标题和重要文本
  kai: "'KaiTi', 'STKaiti', '华文楷体', serif",
  // 仿宋 - 用于主标题
  fangsong: "'FangSong', 'STFangSong', '华文仿宋', serif"
} as const;

// 动画配置
export const BOOKSTORE_ANIMATIONS = {
  // 卡片进入动画延迟
  cardEnterDelay: (columnIndex: number) => `${columnIndex * 100}ms`,
  // 过渡时长
  transition: {
    fast: 'duration-300',
    normal: 'duration-500',
    slow: 'duration-700'
  }
} as const;

// 布局配置
export const BOOKSTORE_LAYOUT = {
  // 瀑布流配置
  waterfall: {
    columnGap: 20, // px
    cardGap: 'gap-5' // tailwind class
  },
  // 容器配置
  container: {
    maxWidth: 'max-w-7xl',
    padding: 'px-6',
    section: 'py-20'
  },
  // 加载指示器
  loadIndicator: {
    height: 4 // tailwind单位
  }
} as const;

// 颜色和主题配置
export const BOOKSTORE_THEME = {
  // 主色调
  primary: {
    gold: 'gold',
    charcoal: 'charcoal'
  },
  // 透明度
  opacity: {
    light: '/60',
    medium: '/70',
    heavy: '/80',
    overlay: '/90'
  }
} as const;

// 组件样式类名配置
export const BOOKSTORE_STYLES = {
  // 页面容器
  pageContainer: `relative ${BOOKSTORE_LAYOUT.container.section} bg-white`,
  
  // 内容容器
  contentContainer: `${BOOKSTORE_LAYOUT.container.maxWidth} mx-auto ${BOOKSTORE_LAYOUT.container.padding}`,
  
  // 标题样式
  header: {
    container: 'text-center mb-16',
    title: `text-5xl font-bold text-${BOOKSTORE_THEME.primary.charcoal} mb-6`,
    subtitle: `text-lg text-${BOOKSTORE_THEME.primary.charcoal}${BOOKSTORE_THEME.opacity.medium} mb-2`
  },
  
  // 筛选器样式
  filters: {
    container: 'flex flex-wrap gap-4 mb-8 justify-center',
    searchInput: {
      container: 'relative',
      icon: `absolute left-3 top-1/2 transform -translate-y-1/2 text-${BOOKSTORE_THEME.primary.charcoal}${BOOKSTORE_THEME.opacity.light}`,
      input: `pl-10 pr-4 py-2 bg-white border border-${BOOKSTORE_THEME.primary.gold}/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-${BOOKSTORE_THEME.primary.gold}/50 w-80`
    },
    select: `px-4 py-2 bg-white border border-${BOOKSTORE_THEME.primary.gold}/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-${BOOKSTORE_THEME.primary.gold}/50`,
    downloadButton: `flex items-center gap-2 px-4 py-2 bg-white border-2 border-${BOOKSTORE_THEME.primary.gold}/30 text-${BOOKSTORE_THEME.primary.charcoal} rounded-lg hover:bg-${BOOKSTORE_THEME.primary.gold}/5 hover:border-${BOOKSTORE_THEME.primary.gold}/60 focus:outline-none focus:ring-2 focus:ring-${BOOKSTORE_THEME.primary.gold}/30 transition-all ${BOOKSTORE_ANIMATIONS.transition.fast} shadow-sm hover:shadow-md`
  },
  
  // 网格布局
  grid: {
    container: `flex ${BOOKSTORE_LAYOUT.waterfall.cardGap}`,
    column: `flex-1 flex flex-col ${BOOKSTORE_LAYOUT.waterfall.cardGap}`
  },
  
  // 卡片样式
  card: {
    container: (isVisible: boolean) => `group cursor-pointer transform transition-all ${BOOKSTORE_ANIMATIONS.transition.normal} ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
    }`,
    wrapper: `bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow ${BOOKSTORE_ANIMATIONS.transition.fast}`,
    imageContainer: 'relative aspect-[3/4] overflow-hidden',
    image: (loaded: boolean) => `w-full h-full object-cover transition-all ${BOOKSTORE_ANIMATIONS.transition.normal} ${
      loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
    }`,
    imagePlaceholder: 'absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center',
    imageOverlay: `absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all ${BOOKSTORE_ANIMATIONS.transition.fast}`,
    content: 'p-4',
    title: `font-semibold text-gray-900 mb-2 line-clamp-2 text-sm leading-tight`,
    details: 'space-y-1 text-xs text-gray-600'
  },
  
  // 灯箱样式
  lightbox: {
    overlay: 'fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4',
    container: 'relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden',
    navigation: {
      close: 'absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors',
      prev: 'absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors',
      next: 'absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors'
    },
    content: 'flex flex-col lg:flex-row max-h-[90vh]',
    imageSection: 'flex-1 flex items-center justify-center bg-amber-50 p-4',
    image: 'max-w-full max-h-full object-contain',
    detailsSection: 'w-full lg:w-96 p-6 overflow-y-auto bg-white',
    title: `text-2xl font-bold text-${BOOKSTORE_THEME.primary.charcoal} mb-4`,
    details: 'space-y-3 mb-6',
    detailItem: `text-${BOOKSTORE_THEME.primary.charcoal}${BOOKSTORE_THEME.opacity.heavy}`,
    counter: `mt-4 text-sm text-${BOOKSTORE_THEME.primary.charcoal}${BOOKSTORE_THEME.opacity.light} text-center`
  },
  
  // 加载状态
  loading: {
    container: 'flex items-center justify-center py-12',
    spinner: `animate-spin rounded-full h-8 w-8 border-b-2 border-${BOOKSTORE_THEME.primary.gold}`,
    text: `ml-3 text-${BOOKSTORE_THEME.primary.charcoal}${BOOKSTORE_THEME.opacity.light}`,
    loadMore: {
      container: 'text-center py-8',
      wrapper: 'flex items-center justify-center',
      spinner: `animate-spin rounded-full h-6 w-6 border-b-2 border-${BOOKSTORE_THEME.primary.gold} mr-3`,
      text: `text-${BOOKSTORE_THEME.primary.charcoal}${BOOKSTORE_THEME.opacity.light}`
    }
  },
  
  // 空状态
  empty: {
    container: 'text-center py-12',
    icon: 'text-6xl mb-4',
    title: `text-xl font-bold text-${BOOKSTORE_THEME.primary.charcoal} mb-2`,
    description: `text-${BOOKSTORE_THEME.primary.charcoal}${BOOKSTORE_THEME.opacity.light}`
  }
} as const;

// 常量配置
export const BOOKSTORE_CONSTANTS = {
  // 搜索防抖延迟
  searchDebounceDelay: 300,
  // 瀑布流列间距
  columnGap: BOOKSTORE_LAYOUT.waterfall.columnGap,
  // 加载指示器高度
  loadMoreIndicatorHeight: BOOKSTORE_LAYOUT.loadIndicator.height
} as const;