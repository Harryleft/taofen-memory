import React from 'react';
import BaseHeader, { HeaderConfig } from './BaseHeader';
import { headerConfigs } from '@/constants/header.configs.tsx';

interface AppHeaderProps {
  moduleId: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ moduleId }) => {
  // 根据 moduleId 查找配置，如果找不到则使用默认配置
  const config: HeaderConfig = headerConfigs[moduleId] || headerConfigs.default;

  return <BaseHeader config={config} />;
};

export default AppHeader;
