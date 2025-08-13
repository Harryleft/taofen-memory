import React from 'react';

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

// 外部资源链接组件
const ExternalResourcesSection: React.FC<{ 
  title: string;
  resources: ExternalResource[];
}> = ({ title, resources }) => {
  return (
    <section className="external-resources">
      <h3 className="resources-title text-lg font-semibold mb-4 text-amber-500">
        {title}
      </h3>
      <div className="resources-grid grid grid-cols-1 md:grid-cols-3 gap-4">
        {resources.map((resource, index) => (
          <a
            key={index}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="resource-link bg-gray-800 bg-opacity-50 hover:bg-gray-700 hover:bg-opacity-70 p-4 rounded-lg transition-all duration-200 group"
          >
            {resource.icon && (
              <span className="resource-icon text-amber-500 mr-2">
                {resource.icon}
              </span>
            )}
            <span className="resource-label text-gray-300 group-hover:text-white text-sm">
              {resource.label}
            </span>
            {resource.description && (
              <p className="resource-description text-gray-400 text-xs mt-1">
                {resource.description}
              </p>
            )}
          </a>
        ))}
      </div>
    </section>
  );
};

// 版权与法律信息组件
const LegalSection: React.FC<{ 
  copyright: string;
  competitionInfo: string;
  teamName: string;
}> = ({ copyright, competitionInfo, teamName }) => {
  return (
    <footer className="legal-section">
      <div className="legal-content text-center space-y-2">
        <p className="copyright text-gray-400 text-sm">
          {copyright}
        </p>
        <p className="team-name text-amber-500 text-sm font-medium">
          {teamName}
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

  const themeColorClasses = {
    gold: 'text-amber-500',
    blue: 'text-blue-500',
    green: 'text-green-500',
    red: 'text-red-500'
  };

  const backgroundColorClass = backgroundColorClasses[style?.backgroundColor || 'dark'];
  const textColorClass = textColorClasses[style?.textColor || 'light'];
  const themeColorClass = themeColorClasses[style?.themeColor || 'gold'];

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
        {/* 主要内容区域 - 两列布局 */}
        <div className="footer-content grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* 左侧：栏目导航 */}
          <section className="categories-section">
            <h2 className="section-title text-xl font-bold mb-6 text-amber-500">栏目导航</h2>
            <div className="categories-grid grid grid-cols-1 md:grid-cols-2 gap-6">
              {primaryNavigation.categories.map((category) => (
                <div key={category.id} className="nav-category">
                  <h3 className="nav-category-title text-lg font-semibold mb-4 text-amber-500">
                    {category.title}
                  </h3>
                  <ul className="nav-links space-y-2">
                    {category.links.map((link, index) => (
                      <li key={index}>
                        <a
                          href={link.to}
                          target={link.external ? '_blank' : '_self'}
                          rel={link.external ? 'noopener noreferrer' : ''}
                          className="nav-link text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200 text-sm"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
          
          {/* 右侧：外部资源链接 */}
          <section className="external-resources-section">
            <h2 className="section-title text-xl font-bold mb-6 text-amber-500">相关链接</h2>
            <ExternalResourcesSection 
              title={externalResources.title}
              resources={externalResources.resources}
            />
          </section>
        </div>
        
        {/* 版权与法律信息 */}
        <section className="legal-section-section border-t border-gray-700 pt-8 mt-12">
          <LegalSection 
            copyright={legal.copyright}
            competitionInfo={legal.competitionInfo}
            teamName={legal.teamName}
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
      categories: [
        {
          id: 'life-journey',
          title: '岁月行履',
          links: [
            { label: '生平简介', to: '/life-journey/biography', external: false },
            { label: '重要时刻', to: '/life-journey/moments', external: false },
            { label: '成长历程', to: '/life-journey/growth', external: false },
            { label: '历史足迹', to: '/life-journey/footprints', external: false }
          ]
        },
        {
          id: 'books-times',
          title: '时光书影',
          links: [
            { label: '代表作品', to: '/books-times/works', external: false },
            { label: '出版历程', to: '/books-times/publications', external: false },
            { label: '读书笔记', to: '/books-times/notes', external: false },
            { label: '文化影响', to: '/books-times/influence', external: false }
          ]
        },
        {
          id: 'writing-style',
          title: '笔下风骨',
          links: [
            { label: '写作风格', to: '/writing-style/style', external: false },
            { label: '思想精髓', to: '/writing-style/philosophy', external: false },
            { label: '语言特色', to: '/writing-style/language', external: false },
            { label: '创作方法', to: '/writing-style/methods', external: false }
          ]
        },
        {
          id: 'contemporary-figures',
          title: '同行群像',
          links: [
            { label: '同时代人', to: '/contemporary-figures/peers', external: false },
            { label: '师友往来', to: '/contemporary-figures/friends', external: false },
            { label: '文化圈', to: '/contemporary-figures/circle', external: false },
            { label: '社会影响', to: '/contemporary-figures/impact', external: false }
          ]
        }
      ]
    },
    externalResources: {
      title: '相关链接',
      resources: [
        {
          label: '韬奋纪念馆',
          url: 'https://zoutaofen.com',
          icon: '🏛️',
          description: '官方网站'
        },
        {
          label: '上海图书馆',
          url: 'https://data.library.sh.cn',
          icon: '📚',
          description: '开放数据平台'
        },
        {
          label: '维基百科',
          url: 'https://zh.wikipedia.org/wiki/邹韬奋',
          icon: '📖',
          description: '百科资料'
        }
      ]
    },
    legal: {
      copyright: '© 2025 不知道起什么名字团队',
      competitionInfo: '本作品为第十届上海图书馆开放数据竞赛作品',
      teamName: '不知道起什么名字团队'
    },
    style: {
      backgroundColor: 'dark',
      textColor: 'light',
      themeColor: 'gold'
    }
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
      categories: [
        {
          id: 'core-categories',
          title: '核心内容',
          links: [
            { label: '岁月行履', to: '/life-journey', external: false },
            { label: '时光书影', to: '/books-times', external: false },
            { label: '笔下风骨', to: '/writing-style', external: false },
            { label: '同行群像', to: '/contemporary-figures', external: false }
          ]
        }
      ]
    },
    externalResources: {
      title: '资源链接',
      resources: [
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
      ]
    },
    legal: {
      copyright: '© 2025 不知道起什么名字团队',
      competitionInfo: '第十届上海图书馆开放数据竞赛作品',
      teamName: '不知道起什么名字团队'
    },
    style: {
      backgroundColor: 'dark',
      textColor: 'light',
      themeColor: 'gold'
    }
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
      categories: [
        {
          id: 'life-journey',
          title: '岁月行履',
          links: [
            { label: '生平简介', to: '/life-journey/biography', external: false },
            { label: '重要时刻', to: '/life-journey/moments', external: false },
            { label: '成长历程', to: '/life-journey/growth', external: false },
            { label: '历史足迹', to: '/life-journey/footprints', external: false },
            { label: '家族背景', to: '/life-journey/family', external: false },
            { label: '教育经历', to: '/life-journey/education', external: false }
          ]
        },
        {
          id: 'books-times',
          title: '时光书影',
          links: [
            { label: '代表作品', to: '/books-times/works', external: false },
            { label: '出版历程', to: '/books-times/publications', external: false },
            { label: '读书笔记', to: '/books-times/notes', external: false },
            { label: '文化影响', to: '/books-times/influence', external: false },
            { label: '文学成就', to: '/books-times/achievements', external: false },
            { label: '思想传播', to: '/books-times/dissemination', external: false }
          ]
        },
        {
          id: 'writing-style',
          title: '笔下风骨',
          links: [
            { label: '写作风格', to: '/writing-style/style', external: false },
            { label: '思想精髓', to: '/writing-style/philosophy', external: false },
            { label: '语言特色', to: '/writing-style/language', external: false },
            { label: '创作方法', to: '/writing-style/methods', external: false },
            { label: '文学技巧', to: '/writing-style/techniques', external: false },
            { label: '艺术特色', to: '/writing-style/artistry', external: false }
          ]
        },
        {
          id: 'contemporary-figures',
          title: '同行群像',
          links: [
            { label: '同时代人', to: '/contemporary-figures/peers', external: false },
            { label: '师友往来', to: '/contemporary-figures/friends', external: false },
            { label: '文化圈', to: '/contemporary-figures/circle', external: false },
            { label: '社会影响', to: '/contemporary-figures/impact', external: false },
            { label: '合作者', to: '/contemporary-figures/collaborators', external: false },
            { label: '追随者', to: '/contemporary-figures/followers', external: false }
          ]
        }
      ]
    },
    externalResources: {
      title: '相关链接',
      resources: [
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
        },
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
      ]
    },
    legal: {
      copyright: '© 2025 不知道起什么名字团队. 保留所有权利.',
      competitionInfo: '本作品为第十届上海图书馆开放数据竞赛参赛作品，基于开放数据平台构建',
      teamName: '不知道起什么名字团队'
    },
    style: {
      backgroundColor: 'dark',
      textColor: 'light',
      themeColor: 'gold'
    }
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