import React from 'react';
import BaseFooter from './BaseFooter';
import { FooterConfig } from './types';
import { footerConfigs } from '@/constants/footer.configs';

interface AppFooterProps {
  moduleId?: string;
  className?: string;
}

const AppFooter: React.FC<AppFooterProps> = ({ 
  moduleId = 'default', 
  className = '' 
}) => {
  // 根据 moduleId 查找配置，如果找不到则使用默认配置
  const config: FooterConfig = footerConfigs[moduleId] || footerConfigs.default;

  return <BaseFooter config={config} className={className} />;
};

export default AppFooter;