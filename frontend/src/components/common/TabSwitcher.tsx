import React from 'react';

interface TabSwitcherProps {
  tabs: {
    id: string;
    label: string;
    content: React.ReactNode;
  }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TabSwitcher: React.FC<TabSwitcherProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange 
}) => {
  return (
    <div className="w-full">
      {/* 标签导航 */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`
              px-6 py-3 text-sm font-medium transition-colors duration-200
              ${activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }
            `}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 标签内容 */}
      <div className="mt-6">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={activeTab === tab.id ? 'block' : 'hidden'}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};