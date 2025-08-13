import React from 'react';
import '../../../styles/ZoutaofenFooter.css';

// 导入新的ZoutaofenFooter组件和类型
import { 
  ZoutaofenFooterResponsive,
  ZoutaofenFooterMinimal,
  ZoutaofenFooter,
  NavigationLink,
  NavigationCategory,
  ExternalResource,
  FooterConfig,
  FooterProps
} from './ZoutaofenFooter';

// ================ 主要 Footer 组件导出 ================

// 便捷组件 - 使用新的ZoutaofenFooterResponsive
const AppFooter = () => {
  return <ZoutaofenFooterResponsive />;
};

// 导出所有组件
export { 
  ZoutaofenFooterResponsive,
  ZoutaofenFooterMinimal,
  ZoutaofenFooter,
  AppFooter
};

// 导出类型定义
export type {
  NavigationLink,
  NavigationCategory,
  ExternalResource,
  FooterConfig,
  FooterProps
};

// 默认导出响应式版本（推荐使用）
export default ZoutaofenFooterResponsive;
