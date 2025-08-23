/**
 * @file TabSwitcher.tsx
 * @description 标签页切换组件，用于在书店和报刊功能之间切换
 * @module components/common/TabSwitcher
 */

import React, { useState } from 'react';

interface TabSwitcherProps {
  children: React.ReactNode;
  className?: string;
}

interface TabItem {
  id: string;
  label: string;
  icon?: string;
}

const TabSwitcher: React.FC<TabSwitcherProps> = ({ children, className = '' }) => {
  const [activeTab, setActiveTab] = useState<'bookstore' | 'newspapers'>('bookstore');

  const tabs: TabItem[] = [
    { id: 'bookstore', label: '时光书影', icon: '📚' },
    { id: 'newspapers', label: '数字报刊', icon: '📰' }
  ];

  return (
    <div className={`tab-switcher ${className}`}>
      {/* 标签页导航 */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'bookstore' | 'newspapers')}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-colors
                ${activeTab === tab.id 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              {tab.icon && <span className="text-lg">{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 标签页内容 */}
      <div className="tab-content">
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            const tabId = tabs[index]?.id;
            return tabId === activeTab ? child : null;
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default TabSwitcher;