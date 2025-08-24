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
} from './iiifTypes';

export type { PublicationItem, IssueItem } from './services';

// ==================== 服务 ====================
export { NewspaperService } from './services';

// ==================== 常量 ====================
export const NEWSPAPERS_MODULE_NAME = '数字报刊模块';
export const NEWSPAPERS_VERSION = '3.0.0';

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

// ==================== 默认导出 ====================
export default {
  NewspapersIntegratedLayout,
  NewspaperService,
  isValidPublicationId,
  isValidIssueId
};