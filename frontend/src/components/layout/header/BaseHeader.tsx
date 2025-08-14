import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// 导航菜单项配置
export interface NavigationItem {
  label: string;
  to: string;
  onClick?: () => void;
}

// Logo 配置
export interface LogoConfig {
  showText: boolean;
  showIcon: boolean;
  onClick?: () => void;
  className?: string;
}

// 布局模式配置 - 简化为只有一种布局
export type HeaderLayout = 'hero';

// 统一的 Header 配置接口
export interface HeaderConfig {
  moduleId: string;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
  accentColor?: 'gold' | 'blue' | 'green' | 'red';
  // 新增配置项
  layout?: HeaderLayout;
  navigation?: NavigationItem[];
  logo?: LogoConfig;
  showNavigation?: boolean;
  showMobileMenu?: boolean;
  backgroundColor?: 'transparent' | 'white' | 'gradient';
}

interface BaseHeaderProps {
  config: HeaderConfig;
}

// Logo 组件
function SiteLogo({ config, onClick }: { config: HeaderConfig['logo']; onClick?: () => void }) {
  if (!config?.showText && !config?.showIcon) return null;

  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-2 focus:outline-none rounded-lg p-2 transition-transform duration-200 hover:scale-105 active:scale-100 border-0 ${config.className || ''}`}
      aria-label="韬奋纪念"
    >
      {config.showIcon && (
          <div
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300">
            <img 
              src="/images/logo/logo.png" 
              alt="韬奋纪念" 
              className="w-full h-full object-contain"
            />
          </div>
      )}
      {config.showText && (
          <div className="flex flex-col items-start">
          <span
              className="font-bold text-xl text-black transition-all duration-300 group-hover:text-black">
            韬奋 · 纪念
          </span>
            <span
                className="text-xs text-black leading-none mt-0.5 transition-all duration-300 font-medium tracking-wide group-hover:text-black">
            TAOFEN MEMORIAL
          </span>
          </div>
      )}
    </button>
  );
}

// 桌面端导航组件
function DesktopNavigation({items, onNavigate}: {
  items: NavigationItem[];
  onNavigate: (path: string) => void
}) {
  return (
      <nav className="hidden md:flex items-center gap-8" aria-label="主导航">
      {items.map((item) => (
        <button
          key={item.to}
          onClick={() => onNavigate(item.to)}
          className="px-4 py-2 font-medium text-gray-700 focus:outline-none rounded-lg transition-transform duration-200 hover:scale-105 active:scale-100 border-0"
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

// 移动端菜单按钮组件
function MobileMenuButton({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  const lineBaseClasses = "block w-6 h-0.5 bg-gray-700 transition-all duration-300";

  return (
    <button
      onClick={onToggle}
      className="md:hidden relative w-10 h-10 flex flex-col items-center justify-center space-y-1.5 focus:outline-none rounded-lg transition-transform duration-200 hover:scale-105 active:scale-100 border-0"
      aria-label="菜单"
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
    >
      <span className={`${lineBaseClasses} ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
      <span className={`${lineBaseClasses} ${isOpen ? 'opacity-0' : ''}`} />
      <span className={`${lineBaseClasses} ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
    </button>
  );
}

// 移动端菜单组件
function MobileMenu({ isOpen, items, onClose, onNavigate }: { 
  isOpen: boolean; 
  items: NavigationItem[]; 
  onClose: () => void;
  onNavigate: (path: string) => void;
}) {
  // 阻止菜单打开时的背景滚动
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div
      id="mobile-menu"
      className={`md:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xl transition-all duration-300 ${
        isOpen 
          ? 'transform translate-y-0 opacity-100' 
          : 'transform -translate-y-full opacity-0 pointer-events-none'
      }`}
      style={{ paddingTop: '64px' }}
    >
      <nav className="px-6 py-8" aria-label="移动端导航">
        <div className="space-y-6">
          {items.map((item, index) => (
            <button
              key={item.to}
              onClick={() => {
                onNavigate(item.to);
                onClose();
              }}
              className="block w-full text-left py-3 px-4 rounded-lg focus:outline-none transition-transform duration-200 hover:scale-105 active:scale-100 border-0"
              style={{
                animationDelay: `${index * 50}ms`,
                animation: isOpen ? 'slideInFromRight 0.3s ease-out forwards' : 'none'
              }}
            >
              <span className="text-lg font-medium text-gray-700">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

// Hero布局组件 - 现在是唯一的布局
function HeroLayout({ config, onLogoClick, onNavigation, onMenuToggle, isMenuOpen }: { 
  config: HeaderConfig; 
  onLogoClick?: () => void;
  onNavigation?: (path: string) => void;
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}) {
  return (
    <div className="w-full h-full px-4 md:px-8 flex items-center justify-between">
      <SiteLogo config={config.logo} onClick={onLogoClick} />
      {config.navigation && config.showNavigation && (
        <DesktopNavigation items={config.navigation} onNavigate={onNavigation || (() => {})} />
      )}
      {config.showMobileMenu && <MobileMenuButton isOpen={isMenuOpen || false} onToggle={onMenuToggle || (() => {})} />}
    </div>
  );
}

const BaseHeader: React.FC<BaseHeaderProps> = ({ config }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const {
    navigation,
    showMobileMenu = false,
    backgroundColor = 'transparent'
  } = config;

  const backgroundColorVariants = {
    transparent: 'bg-transparent',
    white: 'bg-white',
    gradient: 'bg-gradient-to-r from-amber-50 to-amber-100/20',
  };

  const backgroundColorClass = backgroundColorVariants[backgroundColor] || 'bg-transparent';

  const handleNavigation = useCallback((path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  }, [navigate]);

  const handleLogoClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const headerClassName = useMemo(() => {
    const baseClasses = 'fixed top-0 left-0 right-0 z-50 transition-all duration-700';
    return `${baseClasses} ${backgroundColorClass}`;
  }, [backgroundColorClass]);

  return (
    <>
      <header className={headerClassName}>
        <HeroLayout 
          config={config} 
          onLogoClick={handleLogoClick}
          onNavigation={handleNavigation}
          onMenuToggle={toggleMenu}
          isMenuOpen={isMenuOpen}
        />
      </header>

      {/* 移动端菜单 */}
      {navigation && showMobileMenu && (
        <MobileMenu
          isOpen={isMenuOpen}
          items={navigation}
          onClose={closeMenu}
          onNavigate={handleNavigation}
        />
      )}
    </>
  );
};

export default BaseHeader;
