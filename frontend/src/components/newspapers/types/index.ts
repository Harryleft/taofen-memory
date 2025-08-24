/**
 * 数字报刊模块统一的类型定义
 * 
 * Linus设计原则：
 * - 类型应该反映数据结构，而不是实现细节
 * - 避免过度抽象，保持简单明了
 * - 类型安全性应该来自清晰的模型，而不是复杂的泛型
 */

import { IIIFManifest, IIIFCollectionItem } from '../iiifTypes';

// ==================== 基础数据类型 ====================

/**
 * 刊物信息
 * 
 * 注意：这里使用扁平化设计，避免不必要的嵌套
 */
export interface Publication {
  /** 唯一标识符 */
  id: string;
  /** 刊物标题 */
  title: string;
  /** 刊物名称（可能与标题相同） */
  name: string;
  /** 集合URL */
  collectionUrl: string;
  /** 期数数量 */
  issueCount: number;
  /** 最后更新时间 */
  lastUpdated: string | null;
  /** 索引位置 */
  index: number;
}

/**
 * 期数信息
 * 
 * 设计原则：只包含必要信息，避免数据冗余
 */
export interface Issue {
  /** 唯一标识符 */
  id: string;
  /** Manifest URL */
  manifestUrl: string;
  /** 期数标题 */
  title: string;
  /** 期数摘要 */
  summary: string;
  /** 索引位置 */
  index: number;
}

// ==================== 服务层类型 ====================

/**
 * API响应包装器
 * 
 * 统一处理成功和失败的情况
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  timestamp: number;
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

/**
 * 排序选项
 */
export interface SortOptions {
  field: 'title' | 'date' | 'issueCount';
  direction: 'asc' | 'desc';
}

/**
 * 搜索过滤器
 */
export interface SearchFilter {
  term: string;
  fields: ('title' | 'name' | 'summary')[];
}

// ==================== 状态管理类型 ====================

/**
 * 加载状态
 * 
 * 设计原则：使用联合类型而不是布尔值+字符串的组合
 */
export type LoadingState = 
  | { status: 'idle' }
  | { status: 'loading'; operation: string }
  | { status: 'success'; operation: string }
  | { status: 'error'; operation: string; error: string };

/**
 * 应用状态
 * 
 * 集中管理所有应用状态，避免分散在多个Context中
 */
export interface AppState {
  // 数据状态
  publications: Publication[];
  issues: Issue[];
  
  // 选择状态
  selectedPublicationId: string | null;
  selectedIssueId: string | null;
  
  // UI状态
  loadingState: LoadingState;
  currentView: 'catalog' | 'viewer';
  searchTerm: string;
  sortOptions: SortOptions;
  sidebarCollapsed: boolean;
  
  // 查看器状态
  manifestUrl: string;
  viewerReady: boolean;
  
  // 用户设置
  settings: UserSettings;
  
  // 缓存状态
  cache: CacheState;
}

/**
 * 用户设置
 */
export interface UserSettings {
  theme: 'light' | 'dark';
  zoomLevel: number;
  viewMode: 'single' | 'double' | 'grid';
  autoRotate: boolean;
  language: 'zh-CN' | 'en';
}

/**
 * 缓存状态
 * 
 * 简单的内存缓存实现
 */
export interface CacheState {
  publications: Map<string, Publication[]>;
  issues: Map<string, Issue[]>;
  manifests: Map<string, IIIFManifest>;
  lastUpdated: Map<string, number>;
}

// ==================== 派生状态类型 ====================

/**
 * 计算属性 - 从基础状态派生
 * 
 * 设计原则：不存储可计算的数据
 */
export interface DerivedState {
  // 过滤后的刊物列表
  filteredPublications: Publication[];
  
  // 当前选中的刊物
  selectedPublication: Publication | null;
  
  // 当前选中的期数
  selectedIssue: Issue | null;
  
  // 导航状态
  navigation: {
    canGoBack: boolean;
    canGoForward: boolean;
    historyLength: number;
  };
  
  // 加载状态
  isLoading: boolean;
  errorMessage: string | null;
}

// ==================== 事件类型 ====================

/**
 * 用户操作事件
 * 
 * 设计原则：使用明确的类型而不是字符串常量
 */
export type UserAction =
  | { type: 'SELECT_PUBLICATION'; payload: { publicationId: string } }
  | { type: 'SELECT_ISSUE'; payload: { issueId: string } }
  | { type: 'SEARCH'; payload: { term: string } }
  | { type: 'SORT'; payload: { options: SortOptions } }
  | { type: 'CHANGE_VIEW'; payload: { view: 'catalog' | 'viewer' } }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'UPDATE_SETTINGS'; payload: { settings: Partial<UserSettings> } }
  | { type: 'CLEAR_CACHE' }
  | { type: 'RESET_STATE' };

/**
 * 系统事件
 */
export type SystemEvent =
  | { type: 'DATA_LOADED'; payload: { dataType: 'publications' | 'issues' | 'manifest' } }
  | { type: 'ERROR_OCCURRED'; payload: { error: string; operation: string } }
  | { type: 'CACHE_UPDATED'; payload: { key: string; value: unknown } }
  | { type: 'STATE_RESET' };

// ==================== 工具类型 ====================

/**
 * 可选字段类型
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * 只读字段类型
 */
export type Readonly<T, K extends keyof T> = T & { readonly [P in K]: T[P] };

/**
 * 深度Partial类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ==================== 兼容性类型 ====================

/**
 * 向后兼容的PublicationItem类型
 * 
 * 用于平滑迁移现有代码
 * @deprecated 使用 Publication 替代
 */
export type LegacyPublicationItem = Omit<Publication, 'index'> & {
  i: number;
  collection: string;
};

/**
 * 向后兼容的IssueItem类型
 * 
 * 用于平滑迁移现有代码
 * @deprecated 使用 Issue 替代
 */
export type LegacyIssueItem = Omit<Issue, 'index'> & {
  i: number;
  manifest: string;
};

// ==================== 验证类型 ====================

/**
 * 类型守卫：检查是否为Publication
 */
export function isPublication(item: unknown): item is Publication {
  return typeof item === 'object' && item !== null &&
    'id' in item && typeof item.id === 'string' &&
    'title' in item && typeof item.title === 'string' &&
    'collectionUrl' in item && typeof item.collectionUrl === 'string';
}

/**
 * 类型守卫：检查是否为Issue
 */
export function isIssue(item: unknown): item is Issue {
  return typeof item === 'object' && item !== null &&
    'id' in item && typeof item.id === 'string' &&
    'manifestUrl' in item && typeof item.manifestUrl === 'string' &&
    'title' in item && typeof item.title === 'string';
}

/**
 * 类型守卫：检查是否为有效的IIIF集合项
 */
export function isIIIFCollectionItem(item: unknown): item is IIIFCollectionItem {
  return typeof item === 'object' && item !== null &&
    'id' in item && typeof item.id === 'string' &&
    'label' in item && typeof item.label === 'object';
}

// ==================== 转换函数 ====================

/**
 * 将旧版PublicationItem转换为新版Publication
 */
export function toPublication(item: LegacyPublicationItem): Publication {
  return {
    id: item.id,
    title: item.title,
    name: item.name,
    collectionUrl: item.collection,
    issueCount: item.issueCount,
    lastUpdated: item.lastUpdated,
    index: item.i
  };
}

/**
 * 将旧版IssueItem转换为新版Issue
 */
export function toIssue(item: LegacyIssueItem): Issue {
  return {
    id: item.manifest,
    manifestUrl: item.manifest,
    title: item.title,
    summary: item.summary,
    index: item.i
  };
}

/**
 * 将IIIF集合项转换为Publication
 */
export function publicationFromIIIF(item: IIIFCollectionItem, index: number): Publication {
  // 从完整的collection URL中提取刊物ID
  const collectionId = item.id.match(/([^/]+)\/collection\.json$/)?.[1] || item.id;
  
  return {
    id: collectionId,
    title: (item.label?.zh?.[0]) || (item.label?.['zh-CN']?.[0]) || (item.label?.en?.[0]) || '未知刊物',
    name: (item.label?.zh?.[0]) || (item.label?.['zh-CN']?.[0]) || (item.label?.en?.[0]) || '未知刊物',
    collectionUrl: item.id,
    issueCount: 0, // 将在后续加载时填充
    lastUpdated: null, // 将在后续加载时填充
    index
  };
}

/**
 * 将IIIF集合项转换为Issue
 */
export function issueFromIIIF(item: IIIFCollectionItem, index: number): Issue {
  return {
    id: item.id,
    manifestUrl: item.id,
    title: (item.label?.['zh-CN']?.[0]) || (item.label?.zh?.[0]) || (item.label?.en?.[0]) || '未知期刊',
    summary: (item.summary?.['zh-CN']?.[0]) || (item.summary?.zh?.[0]) || (item.summary?.en?.[0]) || '',
    index
  };
}