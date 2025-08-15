import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import BaseHeader, { HeaderConfig } from './BaseHeader';
import { headerConfigs } from '@/constants/header.configs.tsx';

interface AppHeaderProps {
  moduleId: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ moduleId }) => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  
  // 获取基础配置
  const baseConfig: HeaderConfig = headerConfigs[moduleId] || headerConfigs.default;
  
  // 监听滚动（只在首页）
  useEffect(() => {
    if (location.pathname === '/') {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 100);
      };
      
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [location.pathname]);
  
  // 动态计算背景色
  const effectiveConfig = useMemo(() => {
    if (location.pathname === '/') {
      return {
        ...baseConfig,
        backgroundColor: (isScrolled ? 'white' : 'transparent') as 'white' | 'transparent'
      };
    }
    return {
      ...baseConfig,
      backgroundColor: 'white' as const
    };
  }, [baseConfig, location.pathname, isScrolled]);

  return <BaseHeader config={effectiveConfig} />;
};

export default AppHeader;
