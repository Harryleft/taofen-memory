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
      <div className="flex border-b-2 border-gray-300 mb-6 bg-white">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`
              px-8 py-4 text-base font-bold transition-all duration-200 relative
              ${activeTab === tab.id
                ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600 -mb-0.5'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }
            `}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>
        ))}
      </div>

      {/* 标签内容 */}
      <div className="mt-6 min-h-[400px]">
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