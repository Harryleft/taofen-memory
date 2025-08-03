import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Users, Heart, BookOpen, GraduationCap, Building } from 'lucide-react';
import * as d3 from 'd3';

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
  vx?: number; // D3 force simulation velocity
  vy?: number;
  fx?: number; // Fixed position
  fy?: number;
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
  const [zoomTransform, setZoomTransform] = useState({ x: 0, y: 0, k: 1 });
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<TreeNode, undefined> | null>(null);

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

  // 构建混合布局节点数据
  const buildHybridNodes = useCallback((persons: Person[]): TreeNode[] => {
    const nodes: TreeNode[] = [];
    
    // 邹韬奋作为根节点，固定在中心
    const root: TreeNode = {
      person: { id: 'root', name: '邹韬奋', avatar: '', category: 'family', relationship: '核心', description: '文化先驱' },
      children: [],
      x: 0,
      y: 0,
      level: 0,
      fx: 0, // 固定位置
      fy: 0
    };
    nodes.push(root);

    // 按关系分类
    const familyPersons = persons.filter(p => p.category === 'family');
    const parents = familyPersons.filter(p => p.relationship.includes('母') || p.relationship.includes('父'));
    const spouse = familyPersons.filter(p => p.relationship.includes('妻') && !p.relationship.includes('母'));
    const children = familyPersons.filter(p => (p.relationship.includes('子') || p.relationship.includes('女')) && !p.relationship.includes('妻') && !p.relationship.includes('母'));
    const nonFamily = persons.filter(p => p.category !== 'family');

    // 父母层（固定层级布局）
    parents.forEach((parent, index) => {
      nodes.push({
        person: parent,
        children: [],
        x: (index - (parents.length - 1) / 2) * 150,
        y: -200,
        level: -1,
        fx: (index - (parents.length - 1) / 2) * 150, // 固定位置
        fy: -200
      });
    });

    // 配偶层（固定层级布局）
    spouse.forEach((s, index) => {
      nodes.push({
        person: s,
        children: [],
        x: (index - (spouse.length - 1) / 2) * 150 + 100,
        y: 0,
        level: 0.5,
        fx: (index - (spouse.length - 1) / 2) * 150 + 100,
        fy: 0
      });
    });

    // 子女层（固定层级布局）
    children.forEach((child, index) => {
      nodes.push({
        person: child,
        children: [],
        x: (index - (children.length - 1) / 2) * 150,
        y: 200,
        level: 1,
        fx: (index - (children.length - 1) / 2) * 150,
        fy: 200
      });
    });

    // 非家庭关系（自由布局，由D3力导向控制）
    nonFamily.forEach((other, index) => {
      const angle = (index / nonFamily.length) * 2 * Math.PI;
      const radius = 300;
      nodes.push({
        person: other,
        children: [],
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        level: 2
        // 不设置fx/fy，让D3自由布局
      });
    });

    return nodes;
  }, []);

  // 初始化D3力导向布局
  const initializeForceSimulation = useCallback((nodes: TreeNode[]) => {
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    // 创建连接关系（所有非家庭节点都连接到根节点）
    const links = nodes
      .filter(node => node.person.id !== 'root' && node.level === 2)
      .map(node => ({ source: 'root', target: node.person.id }));

    // 创建力导向模拟
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.person.id).distance(150).strength(0.3))
      .force('charge', d3.forceManyBody().strength(-300).distanceMax(400))
      .force('center', d3.forceCenter(0, 0))
      .force('collision', d3.forceCollide().radius(60).strength(0.7))
      .force('x', d3.forceX().strength(0.1))
      .force('y', d3.forceY().strength(0.1))
      .alphaDecay(0.02)
      .velocityDecay(0.3);

    // 监听模拟更新
    simulation.on('tick', () => {
      setNodes([...nodes]); // 触发重新渲染
    });

    simulationRef.current = simulation;
    return simulation;
  }, []);

  // 计算布局边界
  const calculateBounds = useCallback((nodes: TreeNode[]) => {
    if (nodes.length === 0) return { width: 800, height: 600, minY: -300 };
    
    const xs = nodes.map(n => n.x);
    const ys = nodes.map(n => n.y);
    const minX = Math.min(...xs) - 100;
    const maxX = Math.max(...xs) + 100;
    const minY = Math.min(...ys) - 100;
    const maxY = Math.max(...ys) + 100;
    
    return {
      width: Math.max(maxX - minX, 800),
      height: Math.max(maxY - minY, 600),
      minY
    };
  }, []);

  // 初始化和更新布局
  useEffect(() => {
    const newNodes = buildHybridNodes(filteredPersons);
    setNodes(newNodes);
    initializeForceSimulation(newNodes);
    
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [filteredPersons, buildHybridNodes, initializeForceSimulation]);

  const { width: treeWidth, height: treeHeight, minY } = calculateBounds(nodes);

  // 节点拖拽处理
  const handleNodeDragStart = useCallback((node: TreeNode, e: React.MouseEvent) => {
    e.stopPropagation();
    if (simulationRef.current && node.level === 2) { // 只允许拖拽非家庭节点
      simulationRef.current.alphaTarget(0.3).restart();
      node.fx = node.x;
      node.fy = node.y;
    }
  }, []);

  const handleNodeDrag = useCallback((node: TreeNode, e: React.MouseEvent) => {
    if (node.level === 2 && node.fx !== undefined && node.fy !== undefined) {
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        const transform = zoomTransform;
        node.fx = (e.clientX - rect.left - rect.width / 2 - transform.x) / transform.k;
        node.fy = (e.clientY - rect.top - rect.height / 2 - transform.y) / transform.k;
      }
    }
  }, [zoomTransform]);

  const handleNodeDragEnd = useCallback((node: TreeNode) => {
    if (simulationRef.current && node.level === 2) {
      simulationRef.current.alphaTarget(0);
      node.fx = null;
      node.fy = null;
    }
  }, []);

  // 缩放和平移处理
  useEffect(() => {
    if (!svgRef.current) return;

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        const { x, y, k } = event.transform;
        setZoomTransform({ x, y, k });
      });

    d3.select(svgRef.current).call(zoom);

    return () => {
      d3.select(svgRef.current).on('.zoom', null);
    };
  }, []);

  // 双击重置视图
  const handleDoubleClick = useCallback(() => {
    if (svgRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(750)
        .call(
          d3.zoom<SVGSVGElement, unknown>().transform,
          d3.zoomIdentity
        );
    }
  }, []);

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
          
          <div className="relative overflow-hidden bg-gray-800 rounded-lg" style={{ height: '600px' }}>
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              viewBox={`${-treeWidth / 2} ${minY} ${treeWidth} ${treeHeight}`}
              className="cursor-grab active:cursor-grabbing"
              onDoubleClick={handleDoubleClick}
            >
              <g transform={`translate(${zoomTransform.x}, ${zoomTransform.y}) scale(${zoomTransform.k})`}>
              {/* 渐变定义 */}
              <defs>
                <radialGradient id="familyGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#6B7280" />
                  <stop offset="100%" stopColor="#374151" />
                </radialGradient>
                <radialGradient id="publishingGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#D97706" />
                </radialGradient>
                <radialGradient id="academicGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#374151" />
                  <stop offset="100%" stopColor="#1F2937" />
                </radialGradient>
                <radialGradient id="politicalGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#6B7280" />
                  <stop offset="100%" stopColor="#4B5563" />
                </radialGradient>
                <radialGradient id="rootGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FCD34D" />
                  <stop offset="100%" stopColor="#D97706" />
                </radialGradient>
              </defs>
                {/* 渲染连接线 */}
                {nodes.map(node => {
                  if (node.person.id === 'root') return null;
                  
                  const rootNode = nodes.find(n => n.person.id === 'root');
                  if (!rootNode) return null;
                  
                  const radius = 52.5;
                  const dx = node.x - rootNode.x;
                  const dy = node.y - rootNode.y;
                  const distance = Math.sqrt(dx * dx + dy * dy);
                  
                  if (distance === 0) return null;
                  
                  const startX = rootNode.x + (dx / distance) * radius;
                  const startY = rootNode.y + (dy / distance) * radius;
                  const endX = node.x - (dx / distance) * radius;
                  const endY = node.y - (dy / distance) * radius;
                  
                  // 家庭关系用直角连线，其他关系用直线
                  if (node.level < 2) {
                    const midY = (startY + endY) / 2;
                    return (
                      <g key={`line-${rootNode.person.id}-${node.person.id}`}>
                        <polyline
                          points={`${startX},${startY} ${startX},${midY} ${endX},${midY} ${endX},${endY}`}
                          stroke="#FFFFFF"
                          strokeWidth="3"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                          }}
                        />
                      </g>
                    );
                  } else {
                    return (
                      <line
                        key={`line-${rootNode.person.id}-${node.person.id}`}
                        x1={startX}
                        y1={startY}
                        x2={endX}
                        y2={endY}
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        strokeOpacity="0.6"
                        strokeDasharray="5,5"
                        style={{
                          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                        }}
                      />
                    );
                  }
                })}
              </g>

                {/* 渲染节点 */}
                {nodes.map(node => {
                  const isRoot = node.person.id === 'root';
                  const isDraggable = node.level === 2; // 只有非家庭成员可拖拽
                  
                  const getGradientId = (category: string, isRoot: boolean) => {
                    if (isRoot) return 'url(#rootGradient)';
                    switch (category) {
                      case 'family': return 'url(#familyGradient)';
                      case 'publishing': return 'url(#publishingGradient)';
                      case 'academic': return 'url(#academicGradient)';
                      case 'political': return 'url(#politicalGradient)';
                      default: return 'url(#familyGradient)';
                    }
                  };
                  
                  return (
                    <g 
                      key={`node-${node.person.id}-${node.level}`} 
                      transform={`translate(${node.x}, ${node.y})`}
                      className={isDraggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}
                      onMouseDown={isDraggable ? (e) => handleNodeDragStart(e, node) : undefined}
                    >
                      {/* 主要圆形节点 */}
                      <circle
                         cx="0"
                         cy="0"
                         r="52.5"
                         fill={getGradientId(node.person.category, isRoot)}
                         stroke="#FFFFFF"
                         strokeWidth="5"
                         strokeLinejoin="square"
                         className="hover:opacity-90 transition-all duration-300 ease-out hover:stroke-yellow-300"
                         style={{
                           filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                           transition: isDraggable ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                         }}
                         onClick={() => !isRoot && setSelectedPerson(node.person)}
                       />
                      {/* 混合模式覆盖层 */}
                      <circle
                         cx="0"
                         cy="0"
                         r="52.5"
                         fill={isRoot ? '#D4AF37' : getCategoryColorHex(node.person.category)}
                         fillOpacity="0.15"
                         style={{ mixBlendMode: 'multiply' }}
                         pointerEvents="none"
                       />
                      
                      {/* 姓名 */}
                      <text
                        x="0"
                        y="5"
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="16"
                        fontWeight="600"
                        fontFamily="'Segoe UI', system-ui, sans-serif"
                        style={{
                          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                          letterSpacing: '0.5px',
                          pointerEvents: 'none'
                        }}
                      >
                        {node.person.name}
                      </text>
                      
                      {/* 关系标签 */}
                      <text
                        x="0"
                        y="78"
                        textAnchor="middle"
                        fill="#E6394E"
                        fontSize="14"
                        fontWeight="500"
                        fontFamily="'Segoe UI', system-ui, sans-serif"
                        style={{
                          textShadow: '0 1px 2px rgba(255,255,255,0.8)',
                          pointerEvents: 'none'
                        }}
                      >
                        {node.person.relationship}
                      </text>
                      
                      {/* 可拖拽节点的提示图标 */}
                      {isDraggable && (
                        <circle
                          cx="35"
                          cy="35"
                          r="6"
                          fill="#10B981"
                          stroke="#FFFFFF"
                          strokeWidth="1"
                          style={{
                            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                          }}
                        />
                      )}
                    </g>
                  );
                })}
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