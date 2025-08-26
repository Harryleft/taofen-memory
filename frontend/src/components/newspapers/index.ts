/**
 * 数字报刊模块统一导出文件
 * 
 * Linus设计原则：
 * - 单一职责
 * - 简单直接
 * - 避免过度抽象
 */

// ==================== 主要组件 ====================
export { NewspapersIntegratedLayout } from './NewspapersIntegratedLayout';
export { NewspapersLayout } from './NewspapersLayout';
export { VerticalNewspaperCard } from './VerticalNewspaperCard';
export { NewspapersGuideArea } from './NewspapersGuideArea';
export { GuideState } from './GuideState';
export { EmptyState } from './EmptyState';
export { WelcomeState } from './WelcomeState';

// ==================== 类型定义 ====================
export type { 
  IIIFCollection,
  IIIFCollectionItem,
  IIIFManifest,
  IIIFSequence,
  IIIFCanvas,
  IIIFImage,
  IIIFResource,
  IIIFService
} from '../iiif/iiifTypes.ts';

export type { PublicationItem, IssueItem } from './services';

// ==================== 服务 ====================
export { NewspaperService } from './services';

// ==================== 常量 ====================
export const NEWSPAPERS_MODULE_NAME = '数字报刊模块';
export const NEWSPAPERS_VERSION = '3.0.0';

