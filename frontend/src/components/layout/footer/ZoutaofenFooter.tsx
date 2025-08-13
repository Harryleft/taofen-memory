import React from 'react';

// ================ 常量配置 ================

// 通用的导航分类配置
const COMMON_NAVIGATION_CATEGORIES: NavigationCategory[] = [
  {
    id: 'life-journey',
    title: '岁月行履',
    links: [{ label: '岁月行履', to: '/timeline', external: false }]
  },
  {
    id: 'books-times',
    title: '时光书影',
    links: [{ label: '时光书影', to: '/bookstore-timeline', external: false }]
  },
  {
    id: 'writing-style',
    title: '笔下风骨',
    links: [{ label: '笔下风骨', to: '/handwriting', external: false }]
  },
  {
    id: 'contemporary-figures',
    title: '同行群像',
    links: [{ label: '同行群像', to: '/relationships', external: false }]
  }
];

// 桌面端版本使用的导航分类（使用不同的路径）
const DESKTOP_NAVIGATION_CATEGORIES: NavigationCategory[] = [
  {
    id: 'life-journey',
    title: '岁月行履',
    links: [{ label: '岁月行履', to: '/life-journey', external: false }]
  },
  {
    id: 'books-times',
    title: '时光书影',
    links: [{ label: '时光书影', to: '/books-times', external: false }]
  },
  {
    id: 'writing-style',
    title: '笔下风骨',
    links: [{ label: '笔下风骨', to: '/writing-style', external: false }]
  },
  {
    id: 'contemporary-figures',
    title: '同行群像',
    links: [{ label: '同行群像', to: '/contemporary-figures', external: false }]
  }
];

// 通用的外部资源配置
const COMMON_EXTERNAL_RESOURCES: ExternalResource[] = [
  {
    label: '韬奋纪念馆',
    url: 'https://zoutaofen.com',
    icon: '🏛️',
    description: '官方网站与数字档案'
  },
  {
    label: '上海图书馆',
    url: 'https://data.library.sh.cn',
    icon: '📚',
    description: '开放数据平台与研究资源'
  },
  {
    label: '维基百科',
    url: 'https://zh.wikipedia.org/wiki/邹韬奋',
    icon: '📖',
    description: '百科资料与参考文献'
  }
];

// 完整版本的外部资源配置
const FULL_EXTERNAL_RESOURCES: ExternalResource[] = [
  ...COMMON_EXTERNAL_RESOURCES,
  {
    label: '国家图书馆',
    url: 'https://www.nlc.cn',
    icon: '🏛️',
    description: '数字资源与古籍档案'
  },
  {
    label: '学术研究',
    url: 'https://scholar.google.com',
    icon: '🎓',
    description: '学术论文与研究资料'
  }
];

// 简化版本的外部资源配置
const MINIMAL_EXTERNAL_RESOURCES: ExternalResource[] = [
  {
    label: '韬奋纪念馆',
    url: 'https://zoutaofen.com',
    icon: '🏛️'
  },
  {
    label: '上海图书馆',
    url: 'https://data.library.sh.cn',
    icon: '📚'
  }
];

// 默认样式配置
const DEFAULT_STYLE = {
  backgroundColor: 'dark' as const,
  textColor: 'light' as const,
  themeColor: 'gold' as const
};

// 默认法律信息配置
const DEFAULT_LEGAL_CONFIG = {
  copyright: '© 2025 不知道起什么名字团队',
  competitionInfo: '第十届上海图书馆开放数据竞赛作品',
  teamName: '不知道起什么名字团队'
};

// 默认显示配置
const DEFAULT_SECTIONS: FooterSection[] = [
  {
    id: 'categories',
    title: '栏目导航',
    visible: true,
    order: 1
  },
  {
    id: 'external-resources',
    title: '外部资源',
    visible: true,
    order: 2
  },
  {
    id: 'legal',
    title: '法律信息',
    visible: true,
    order: 3
  }
];

// ================ 类型定义 ================

// 导航链接配置
export interface NavigationLink {
  label: string;
  to: string;
  external?: boolean;
}

// 主导航栏目配置
export interface NavigationCategory {
  id: string;
  title: string;
  links: NavigationLink[];
}

// 外部资源链接配置
export interface ExternalResource {
  label: string;
  url: string;
  icon?: string;
  description?: string;
}

// Footer 区域配置
export interface FooterSection {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

// 完整的 Footer 配置接口
export interface FooterConfig {
  // 主导航栏目
  primaryNavigation: {
    categories: NavigationCategory[];
  };
  
  // 外部资源链接
  externalResources: {
    title: string;
    resources: ExternalResource[];
  };
  
  // 版权与法律信息
  legal: {
    copyright: string;
    competitionInfo: string;
    teamName: string;
  };
  
  // 显示配置
  sections: FooterSection[];
  
  // 样式配置
  style?: {
    backgroundColor?: 'white' | 'gray' | 'cream' | 'dark';
    textColor?: 'light' | 'dark';
    themeColor?: 'gold' | 'blue' | 'green' | 'red';
  };
}

// Footer 组件属性接口
export interface FooterProps {
  config: FooterConfig;
  className?: string;
  version?: 'responsive' | 'minimal' | 'full';
}

// ================ 子组件定义 ================

// 版权与法律信息组件
const LegalSection: React.FC<{ 
  copyright: string;
  competitionInfo: string;
}> = ({ copyright, competitionInfo }) => {
  return (
    <footer className="legal-section">
      <div className="legal-content text-center space-y-2">
        <p className="copyright text-gray-400 text-sm">
          {copyright}
        </p>
        <p className="competition-info text-gray-500 text-xs">
          {competitionInfo}
        </p>
      </div>
    </footer>
  );
};

// ================ 主要 Footer 组件 ================

const Footer: React.FC<FooterProps> = ({ 
  config, 
  className = '', 
  version = 'responsive' 
}) => {
  const {
    primaryNavigation,
    externalResources,
    legal,
    style
  } = config;

  // 样式配置
  const backgroundColorClasses = {
    white: 'bg-white',
    gray: 'bg-gray-100',
    cream: 'bg-amber-50',
    dark: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
  };

  const textColorClasses = {
    light: 'text-gray-100',
    dark: 'text-gray-900'
  };

  const backgroundColorClass = backgroundColorClasses[style?.backgroundColor || 'dark'];
  const textColorClass = textColorClasses[style?.textColor || 'light'];
  
  // 版本特定的类名
  const versionClasses = {
    responsive: 'py-12 px-4',
    minimal: 'py-8 px-4',
    full: 'py-16 px-6'
  };

  const footerClassName = `footer zoutaofen-footer version-${version} ${backgroundColorClass} ${textColorClass} ${versionClasses[version]} ${className}`.trim();

  return (
    <footer 
      className={footerClassName} 
      role="contentinfo" 
      aria-label="网站页脚"
    >
      <div className="footer-container max-w-7xl mx-auto">
        {/* 主要内容区域 - 两列竖栏布局 */}
        <div className="footer-content grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* 左侧：栏目导航 - 竖向文字布局 */}
          <section className="categories-section">
            <h2 className="section-title text-xl font-bold mb-6 text-amber-500">栏目导航</h2>
            <div className="categories-list space-y-3">
              {primaryNavigation.categories.map((category) => (
                <a
                  key={category.id}
                  href={category.links[0]?.to || '#'}
                  className="category-link text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  {category.title}
                </a>
              ))}
            </div>
          </section>
          
          {/* 右侧：外部资源链接 - 纯文字链接 */}
          <section className="external-resources-section">
            <h2 className="section-title text-xl font-bold mb-6 text-amber-500">外部资源</h2>
            <div className="resources-list space-y-3">
              {externalResources.resources.map((resource, index) => (
                <a
                  key={index}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="resource-link text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  {resource.label}
                </a>
              ))}
            </div>
          </section>
        </div>
        
        {/* 版权与法律信息 */}
        <section className="legal-section-section border-t border-gray-700 pt-8 mt-12">
          <LegalSection 
            copyright={legal.copyright}
            competitionInfo={legal.competitionInfo}
          />
        </section>
      </div>
    </footer>
  );
};

// ================ 便捷组件 ================

interface AppFooterProps {
  className?: string;
  version?: 'responsive' | 'minimal' | 'full';
}

// 响应式版本
const ZoutaofenFooterResponsive: React.FC<AppFooterProps> = ({ 
  className = '',
  version = 'responsive'
}) => {
  const config: FooterConfig = {
    primaryNavigation: {
      categories: COMMON_NAVIGATION_CATEGORIES
    },
    externalResources: {
      title: '相关链接',
      resources: COMMON_EXTERNAL_RESOURCES
    },
    legal: DEFAULT_LEGAL_CONFIG,
    sections: DEFAULT_SECTIONS,
    style: DEFAULT_STYLE
  };

  return <Footer config={config} className={className} version={version} />;
};

// 桌面端极简版本
const ZoutaofenFooterMinimal: React.FC<AppFooterProps> = ({ 
  className = '',
  version = 'minimal'
}) => {
  const config: FooterConfig = {
    primaryNavigation: {
      categories: DESKTOP_NAVIGATION_CATEGORIES
    },
    externalResources: {
      title: '资源链接',
      resources: MINIMAL_EXTERNAL_RESOURCES
    },
    legal: {
      ...DEFAULT_LEGAL_CONFIG,
      competitionInfo: '第十届上海图书馆开放数据竞赛作品'
    },
    sections: DEFAULT_SECTIONS,
    style: DEFAULT_STYLE
  };

  return <Footer config={config} className={className} version={version} />;
};

// 完整版本
const ZoutaofenFooter: React.FC<AppFooterProps> = ({ 
  className = '',
  version = 'full'
}) => {
  const config: FooterConfig = {
    primaryNavigation: {
      categories: DESKTOP_NAVIGATION_CATEGORIES
    },
    externalResources: {
      title: '相关链接',
      resources: FULL_EXTERNAL_RESOURCES
    },
    legal: {
      ...DEFAULT_LEGAL_CONFIG,
      copyright: '© 2025 不知道起什么名字团队. 保留所有权利.',
      competitionInfo: '本作品为第十届上海图书馆开放数据竞赛参赛作品，基于开放数据平台构建'
    },
    sections: DEFAULT_SECTIONS,
    style: DEFAULT_STYLE
  };

  return <Footer config={config} className={className} version={version} />;
};

// ================ 导出 ================

export { 
  ZoutaofenFooterResponsive,
  ZoutaofenFooterMinimal,
  ZoutaofenFooter
};

export default Footer;
