import React, { useState, useRef, useCallback } from 'react';
import { Users, Heart, BookOpen, GraduationCap, Building } from 'lucide-react';

interface Person {
  id: string;
  name: string;
  avatar: string;
  category: 'family' | 'publishing' | 'academic' | 'political';
  relationship: string;
  description: string;
  connections?: string[]; // IDs of connected people
}

interface TreeNode {
  person: Person;
  children: TreeNode[];
  x: number;
  y: number;
  level: number;
}

const mockPersons: Person[] = [
  // 亲人家属
  {
    id: 'family-1',
    name: '邹母',
    avatar: '/api/placeholder/80/80',
    category: 'family',
    relationship: '母亲',
    description: '慈祥的母亲，对韬奋的成长影响深远'
  },
  {
    id: 'family-2', 
    name: '沈粹缜',
    avatar: '/api/placeholder/80/80',
    category: 'family',
    relationship: '妻子',
    description: '贤内助，支持韬奋的事业发展'
  },
  {
    id: 'family-3',
    name: '邹嘉骊',
    avatar: '/api/placeholder/80/80', 
    category: 'family',
    relationship: '长子',
    description: '继承父志，从事新闻出版工作'
  },
  
  // 新闻出版界
  {
    id: 'publishing-1',
    name: '胡愈之',
    avatar: '/api/placeholder/80/80',
    category: 'publishing',
    relationship: '同事',
    description: '生活书店重要合作伙伴'
  },
  {
    id: 'publishing-2',
    name: '艾思奇',
    avatar: '/api/placeholder/80/80',
    category: 'publishing',
    relationship: '作者',
    description: '哲学家，生活书店重要作者'
  },
  {
    id: 'publishing-3',
    name: '茅盾',
    avatar: '/api/placeholder/80/80',
    category: 'publishing',
    relationship: '文友',
    description: '著名作家，文学界挚友'
  },
  
  // 学术文化界
  {
    id: 'academic-1',
    name: '蔡元培',
    avatar: '/api/placeholder/80/80',
    category: 'academic',
    relationship: '前辈',
    description: '教育家，思想启蒙者'
  },
  {
    id: 'academic-2',
    name: '鲁迅',
    avatar: '/api/placeholder/80/80',
    category: 'academic',
    relationship: '师友',
    description: '文学巨匠，思想导师'
  },
  {
    id: 'academic-3',
    name: '巴金',
    avatar: '/api/placeholder/80/80',
    category: 'academic',
    relationship: '文友',
    description: '作家，文学界好友'
  },
  
  // 政治社会界
  {
    id: 'political-1',
    name: '宋庆龄',
    avatar: '/api/placeholder/80/80',
    category: 'political',
    relationship: '同志',
    description: '革命家，共同理想的战友'
  },
  {
    id: 'political-2',
    name: '史良',
    avatar: '/api/placeholder/80/80',
    category: 'political',
    relationship: '同志',
    description: '法学家，民主人士'
  },
  {
    id: 'political-3',
    name: '沈钧儒',
    avatar: '/api/placeholder/80/80',
    category: 'political',
    relationship: '同志',
    description: '法学家，救国会领袖'
  }
];

const categories = [
  { id: 'all', name: '全部关系', icon: Users, color: 'bg-charcoal' },
  { id: 'family', name: '亲人家属', icon: Heart, color: 'bg-seal' },
  { id: 'publishing', name: '新闻出版', icon: BookOpen, color: 'bg-gold' },
  { id: 'academic', name: '学术文化', icon: GraduationCap, color: 'bg-charcoal' },
  { id: 'political', name: '政治社会', icon: Building, color: 'bg-seal' }
];

export default function RelationshipsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const filteredPersons = selectedCategory === 'all' 
    ? mockPersons 
    : mockPersons.filter(person => person.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    const categoryInfo = categories.find(cat => cat.id === category);
    return categoryInfo?.color || 'bg-gray-500';
  };

  const getCategoryColorHex = (category: string) => {
    const colorMap: { [key: string]: string } = {
      'bg-charcoal': '#2D3748',
      'bg-seal': '#4A5568',
      'bg-gold': '#D4AF37',
      'bg-gray-500': '#6B7280'
    };
    const bgColor = getCategoryColor(category);
    return colorMap[bgColor] || '#6B7280';
  };

  // 构建家庭树结构
  const buildFamilyTree = useCallback((persons: Person[]): TreeNode => {
    // 邹韬奋作为根节点
    const root: TreeNode = {
      person: { id: 'root', name: '邹韬奋', avatar: '', category: 'family', relationship: '核心', description: '文化先驱' },
      children: [],
      x: 0,
      y: 0,
      level: 0
    };

    // 按关系分层，确保每个person只出现在一个层级
    const familyPersons = persons.filter(p => p.category === 'family');
    const parents = familyPersons.filter(p => p.relationship.includes('母') || p.relationship.includes('父'));
    const spouse = familyPersons.filter(p => p.relationship.includes('妻') && !p.relationship.includes('母'));
    const children = familyPersons.filter(p => (p.relationship.includes('子') || p.relationship.includes('女')) && !p.relationship.includes('妻') && !p.relationship.includes('母'));
    const otherFamily = familyPersons.filter(p => !parents.includes(p) && !spouse.includes(p) && !children.includes(p));
    const nonFamily = persons.filter(p => p.category !== 'family');

    // 父母层（第-1层）
    parents.forEach((parent, index) => {
      root.children.push({
        person: parent,
        children: [],
        x: 0,
        y: 0,
        level: -1
      });
    });

    // 配偶层（第0层，与邹韬奋同级）
    spouse.forEach((s, index) => {
      root.children.push({
        person: s,
        children: [],
        x: 0,
        y: 0,
        level: 0
      });
    });

    // 子女层（第1层）
    children.forEach((child, index) => {
      root.children.push({
        person: child,
        children: [],
        x: 0,
        y: 0,
        level: 1
      });
    });

    // 其他家庭成员（第1.5层）
    otherFamily.forEach((other, index) => {
      root.children.push({
        person: other,
        children: [],
        x: 0,
        y: 0,
        level: 1.5
      });
    });

    // 非家庭关系（第2层）
    nonFamily.forEach((other, index) => {
      root.children.push({
        person: other,
        children: [],
        x: 0,
        y: 0,
        level: 2
      });
    });

    return root;
  }, []);

  // 计算树形布局
  const calculateLayout = useCallback((tree: TreeNode): { tree: TreeNode; width: number; height: number } => {
    const nodeWidth = 120;
    const nodeHeight = 120; // 圆形节点直径约105px，增加高度
    const levelHeight = 180; // 增加层级间距
    const minNodeSpacing = 30; // 增加节点间距

    // 按层级分组
    const levels: { [key: number]: TreeNode[] } = {};
    const traverse = (node: TreeNode) => {
      if (!levels[node.level]) levels[node.level] = [];
      levels[node.level].push(node);
      node.children.forEach(traverse);
    };
    traverse(tree);

    // 计算每层的布局
    let maxWidth = 0;
    Object.keys(levels).forEach(levelKey => {
      const level = parseInt(levelKey);
      const nodes = levels[level];
      const levelWidth = nodes.length * nodeWidth + (nodes.length - 1) * minNodeSpacing;
      maxWidth = Math.max(maxWidth, levelWidth);

      // 水平居中分布
      const startX = -levelWidth / 2;
      nodes.forEach((node, index) => {
        node.x = startX + index * (nodeWidth + minNodeSpacing) + nodeWidth / 2;
        node.y = level * levelHeight;
      });
    });

    // 调整根节点位置
    tree.x = 0;
    tree.y = 0;

    const height = Math.max(...Object.keys(levels).map(k => parseInt(k))) * levelHeight + nodeHeight;
    const width = maxWidth + nodeWidth;

    return { tree, width, height };
  }, []);

  const tree = buildFamilyTree(filteredPersons);
  const { tree: layoutTree, width: treeWidth, height: treeHeight } = calculateLayout(tree);

  // 拖拽处理
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (e.buttons === 1) { // 左键按下
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        const newX = e.clientX - rect.left - dragOffset.x;
        const newY = e.clientY - rect.top - dragOffset.y;
        if (svgRef.current) {
          svgRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
        }
      }
    }
  }, [dragOffset]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-cream/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">邹韬奋人脉网络</h1>
            <p className="text-gray-600">探索一位文化先驱的社会关系图谱</p>
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                    selectedCategory === category.id
                      ? `${category.color} text-white shadow-lg`
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <Icon size={18} />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Network Visualization */}
        <div className="bg-cream/30 rounded-3xl p-8 mb-8 shadow-xl border border-gray-200">
          <h2 className="text-2xl font-bold text-charcoal mb-6 text-center">
            {selectedCategory === 'all' ? '完整关系网络' : categories.find(cat => cat.id === selectedCategory)?.name}
          </h2>
          
          <div className="relative overflow-auto bg-white rounded-lg" style={{ height: '600px' }}>
            <svg
              ref={svgRef}
              width={Math.max(treeWidth + 200, 800)}
              height={Math.max(treeHeight + 200, 600)}
              viewBox={`${-treeWidth/2 - 100} ${-150} ${treeWidth + 200} ${treeHeight + 300}`}
              className="cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
            >
              {/* 渲染连接线 */}
              {(() => {
                const lines: JSX.Element[] = [];
                const traverse = (node: TreeNode) => {
                  node.children.forEach(child => {
                    // 直角折线连接 - 从圆形边缘开始
                    const midY = (node.y + child.y) / 2;
                    const pathData = `M ${node.x} ${node.y + 52.5} L ${node.x} ${midY} L ${child.x} ${midY} L ${child.x} ${child.y - 52.5}`;
                    
                    lines.push(
                      <path
                        key={`line-${node.person.id}-${child.person.id}`}
                        d={pathData}
                        stroke="#6B7280"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    );
                    traverse(child);
                  });
                };
                traverse(layoutTree);
                return lines;
              })()}

              {/* 渲染节点 */}
              {(() => {
                const nodes: JSX.Element[] = [];
                const traverse = (node: TreeNode) => {
                  const isRoot = node.person.id === 'root';
                  
                  nodes.push(
                    <g key={`node-${node.person.id}-${node.level}`} transform={`translate(${node.x}, ${node.y})`}>
                      {/* 主要圆形节点 */}
                      <circle
                        cx="0"
                        cy="0"
                        r="52.5"
                        fill={isRoot ? '#D4AF37' : getCategoryColorHex(node.person.category)}
                        stroke="#FFFFFF"
                        strokeWidth="5"
                        strokeLinejoin="square"
                        className="cursor-pointer hover:opacity-80 transition-all duration-700 ease-out"
                        style={{
                          transition: 'stroke 0.8s cubic-bezier(0, 0.7, 0.4, 1)'
                        }}
                        onClick={() => !isRoot && setSelectedPerson(node.person)}
                      />
                      
                      {/* 姓名首字 */}
                      <text
                        x="0"
                        y="-10"
                        textAnchor="middle"
                        fill="white"
                        fontSize="16"
                        fontWeight="bold"
                      >
                        {node.person.name.charAt(node.person.name.length - 1)}
                      </text>
                      
                      {/* 姓名 */}
                      <text
                        x="0"
                        y="10"
                        textAnchor="middle"
                        fill="white"
                        fontSize="14"
                        fontWeight="semibold"
                      >
                        {node.person.name}
                      </text>
                      
                      {/* 关系 */}
                      <text
                        x="0"
                        y="30"
                        textAnchor="middle"
                        fill="rgba(255, 255, 255, 0.8)"
                        fontSize="12"
                      >
                        {node.person.relationship}
                      </text>
                    </g>
                  );
                  
                  node.children.forEach(traverse);
                };
                traverse(layoutTree);
                return nodes;
              })()}
            </svg>
          </div>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.slice(1).map((category) => {
            const count = mockPersons.filter(person => person.category === category.id).length;
            const Icon = category.icon;
            return (
              <div key={category.id} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg">
                <div className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <Icon className="text-white" size={24} />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{category.name}</h3>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-600">位重要人物</p>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Person Detail Modal */}
      {selectedPerson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="text-center">
              <div className={`w-20 h-20 ${getCategoryColor(selectedPerson.category)} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <span className="text-white font-medium">{selectedPerson.name}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">{selectedPerson.name}</h2>
              <p className="text-gray-600 mb-4">{selectedPerson.relationship}</p>
              <p className="text-gray-700 mb-6">{selectedPerson.description}</p>
              <button 
                onClick={() => setSelectedPerson(null)}
                className="bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}