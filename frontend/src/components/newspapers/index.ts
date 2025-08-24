/**
 * 数字报刊模块统一导出文件
 * 
 * Linus设计原则：
 * - 单一入口点
 * - 清晰的模块边界
 * - 避免循环依赖
 */

// ==================== 主要Context ====================
export { NewspapersAppProvider, useNewspapersApp, useNewspapersState, useNewspapersDerived, useNewspapersActions } from './context/NewspapersAppContext';

// ==================== 类型定义 ====================
export type {
  Publication,
  Issue,
  ApiResponse,
  PaginationParams,
  SortOptions,
  SearchFilter,
  LoadingState,
  AppState,
  UserSettings,
  CacheState,
  DerivedState,
  UserAction,
  SystemEvent,
  Optional,
  Readonly,
  DeepPartial
} from './types';

export {
  isPublication,
  isIssue,
  isIIIFCollectionItem,
  toPublication,
  toIssue,
  publicationFromIIIF,
  issueFromIIIF
} from './types';

// ==================== API服务 ====================
export {
  NewspapersApiService,
  LegacyNewspaperService
} from './services/api';

// ==================== 向后兼容性 ====================
export {
  NewspapersProvider,
  useNewspapers
} from './NewspapersContext';

export {
  ViewerProvider,
  useViewerContext
} from './context/ViewerContext';

// ==================== IIIF类型 ====================
export type {
  IIIFManifest,
  IIIFCollectionItem,
  IIIFSequence,
  IIIFCanvas,
  IIIFImageService,
  IIIFAnnotation,
  IIIFAnnotationPage
} from './iiifTypes';

// ==================== 工具函数 ====================
export { IIIFUrlBuilder } from './utils/iiifUrlBuilder';
export { IIIFErrorHandler } from './utils/errorHandler';

// ==================== Hooks ====================
export { useUniversalViewer } from './hooks/useUniversalViewer';

// ==================== 常量 ====================
export const NEWSPAPERS_MODULE_NAME = '数字报刊模块';
export const NEWSPAPERS_VERSION = '2.0.0';
export const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

// ==================== 配置 ====================
export interface NewspapersConfig {
  apiUrl?: string;
  enableCache?: boolean;
  cacheTtl?: number;
  enableDebug?: boolean;
  autoLoadPublications?: boolean;
  defaultView?: 'catalog' | 'viewer';
  defaultSettings?: Partial<{
    theme: 'light' | 'dark';
    zoomLevel: number;
    viewMode: 'single' | 'double' | 'grid';
    autoRotate: boolean;
  }>;
}

// ==================== 工厂函数 ====================
/**
 * 创建数字报刊模块配置
 */
export function createNewspapersConfig(config: NewspapersConfig = {}): Required<NewspapersConfig> {
  return {
    apiUrl: config.apiUrl || (import.meta.env.DEV ? '/iiif' : 'https://www.ai4dh.cn/iiif'),
    enableCache: config.enableCache ?? true,
    cacheTtl: config.cacheTtl || CACHE_TTL,
    enableDebug: config.enableDebug ?? import.meta.env.DEV,
    autoLoadPublications: config.autoLoadPublications ?? true,
    defaultView: config.defaultView || 'catalog',
    defaultSettings: {
      theme: 'light',
      zoomLevel: 1,
      viewMode: 'double',
      autoRotate: false,
      ...config.defaultSettings
    }
  };
}

// ==================== 工具函数 ====================
/**
 * 检查是否为有效的刊物ID
 */
export function isValidPublicationId(id: string): boolean {
  return typeof id === 'string' && id.length > 0 && id !== 'null' && id !== 'undefined';
}

/**
 * 检查是否为有效的期数ID
 */
export function isValidIssueId(id: string): boolean {
  return typeof id === 'string' && id.length > 0 && id !== 'null' && id !== 'undefined';
}

/**
 * 格式化日期显示
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return '未知日期';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

/**
 * 生成刊物封面URL
 */
export function getPublicationCoverUrl(publicationId: string): string {
  return `${import.meta.env.DEV ? '/iiif' : 'https://www.ai4dh.cn/iiif'}/assets/covers/${publicationId}.jpg`;
}

// ==================== 调试工具 ====================
/**
 * 调试日志函数
 */
export function debugLog(component: string, message: string, data?: any): void {
  if (import.meta.env.DEV) {
    console.log(`🔍 [${component}] ${message}`, data || '');
  }
}

/**
 * 性能监控函数
 */
export function performanceMetric(name: string, startTime: number): void {
  if (import.meta.env.DEV) {
    const duration = Date.now() - startTime;
    console.log(`⏱️ [性能] ${name}: ${duration}ms`);
  }
}

// ==================== 默认导出 ====================
export default {
  NewspapersAppProvider,
  useNewspapersApp,
  NewspapersApiService,
  createNewspapersConfig,
  isValidPublicationId,
  isValidIssueId,
  formatDate,
  getPublicationCoverUrl,
  debugLog,
  performanceMetric
};