import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

// D3 远读山峦数据结构
interface MountainDataPoint {
  id: number;
  year: number;
  month: number;
  title: string;
  type: 'book' | 'magazine' | 'newspaper' | 'pamphlet';
  category: string;
}

// 生成1000条Mock数据 - 远读山峦时间轴 (1930-1950)
const generateMountainData = (): MountainDataPoint[] => {
  const data: MountainDataPoint[] = [];
  const types: MountainDataPoint['type'][] = ['book', 'magazine', 'newspaper', 'pamphlet'];
  const categories = [
    '文学作品', '政治读物', '科学普及', '教育材料', '新闻时事', 
    '历史传记', '哲学思辨', '艺术文化', '经济论著', '社会评论'
  ];

  const titles = [
    '新青年', '生活周刊', '大众生活', '读书生活', '抗战文艺', '救国时报',
    '文学月刊', '科学画报', '教育杂志', '妇女生活', '儿童世界', '青年界',
    '新华日报', '解放日报', '光明日报', '文汇报', '民主报', '时事新报',
    '社会科学', '自然科学', '医学常识', '农业技术', '工业发展', '商业指南'
  ];

  // 模拟真实的历史出版分布规律
  const yearlyWeights: Record<number, number> = {
    1930: 0.3, 1931: 0.4, 1932: 0.5, 1933: 0.6, 1934: 0.8, // 初期发展
    1935: 1.0, 1936: 1.2, 1937: 1.5, 1938: 1.8, 1939: 2.0, // 抗战前后高峰
    1940: 1.9, 1941: 1.7, 1942: 1.5, 1943: 1.3, 1944: 1.1, // 战时萧条
    1945: 1.4, 1946: 1.8, 1947: 2.2, 1948: 2.5, 1949: 3.0, // 解放前后复兴
    1950: 2.8 // 新中国成立后
  };

  let id = 1;
  
  // 为每年生成相应数量的数据点
  for (let year = 1930; year <= 1950; year++) {
    const weight = yearlyWeights[year] || 1.0;
    const baseCount = 25; // 基础每年25条
    const yearCount = Math.floor(baseCount * weight + Math.random() * 15); // 加入随机性

    for (let i = 0; i < yearCount; i++) {
      data.push({
        id: id++,
        year,
        month: Math.floor(Math.random() * 12) + 1,
        title: titles[Math.floor(Math.random() * titles.length)],
        type: types[Math.floor(Math.random() * types.length)],
        category: categories[Math.floor(Math.random() * categories.length)]
      });
    }
  }

  console.log(`📊 生成远读山峦数据: ${data.length}条记录 (1930-1950)`);
  console.log('📈 年度分布:', Object.entries(yearlyWeights).map(([year, weight]) => 
    `${year}: ${data.filter(d => d.year === parseInt(year)).length}条`).join(', '));

  return data;
};

// 生成山峦数据
const mountainData: MountainDataPoint[] = generateMountainData();

interface BookstoreTimelineModuleProps {
  className?: string;
}

export default function BookstoreTimelineModule({ className = '' }: BookstoreTimelineModuleProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // 清除之前的内容
    d3.select(svgRef.current).selectAll("*").remove();

    // 设置画布尺寸和边距
    const containerWidth = svgRef.current.clientWidth || 1200;
    const containerHeight = 600;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    // 创建SVG和主群组
    const svg = d3.select(svgRef.current)
      .attr('width', containerWidth)
      .attr('height', containerHeight);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 处理数据：按年份分组
    const dataByYear = d3.group(mountainData, d => d.year);
    const years = Array.from(dataByYear.keys()).sort();

    // 设置比例尺
    const xScale = d3.scaleLinear()
      .domain([1930, 1950])
      .range([0, width]);

    const blockWidth = width / (1950 - 1930 + 1) * 0.8; // 每年的宽度，留一些间隔
    const blockSize = 4; // 每个小方块的大小
    const blockGap = 1; // 方块间的间隔

    // 颜色比例尺
    const colorScale = d3.scaleOrdinal<string>()
      .domain(['book', 'magazine', 'newspaper', 'pamphlet'])
      .range(['#F59E0B', '#EF4444', '#3B82F6', '#10B981']);

    // 绘制山峦
    years.forEach(year => {
      const yearData = dataByYear.get(year) || [];
      const yearX = xScale(year);
      const blocksPerRow = Math.floor(blockWidth / (blockSize + blockGap));
      const totalRows = Math.ceil(yearData.length / blocksPerRow);

      // 为每年的数据创建小方块堆叠
      yearData.forEach((d, index) => {
        const row = Math.floor(index / blocksPerRow);
        const col = index % blocksPerRow;
        
        const x = yearX - blockWidth/2 + col * (blockSize + blockGap);
        const y = height - blockSize - (row * (blockSize + blockGap));

        g.append('rect')
          .attr('x', x)
          .attr('y', y)
          .attr('width', blockSize)
          .attr('height', blockSize)
          .attr('fill', colorScale(d.type))
          .attr('opacity', 0.8)
          .attr('stroke', '#fff')
          .attr('stroke-width', 0.5)
          .on('mouseover', function(event) {
            // 创建tooltip
            const tooltip = d3.select('body').append('div')
              .attr('class', 'mountain-tooltip')
              .style('position', 'absolute')
              .style('background', 'rgba(0,0,0,0.8)')
              .style('color', 'white')
              .style('padding', '8px')
              .style('border-radius', '4px')
              .style('font-size', '12px')
              .style('pointer-events', 'none')
              .style('z-index', '1000')
              .html(`
                <strong>${d.title}</strong><br/>
                ${d.year}年${d.month}月<br/>
                类型: ${d.type}<br/>
                分类: ${d.category}
              `);

            tooltip.style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY - 10) + 'px');
          })
          .on('mouseout', function() {
            d3.selectAll('.mountain-tooltip').remove();
          });
      });

      // 添加年份标签
      g.append('text')
        .attr('x', yearX)
        .attr('y', height + 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', '#666')
        .text(year.toString());

      // 添加每年的数量标签
      g.append('text')
        .attr('x', yearX)
        .attr('y', height - totalRows * (blockSize + blockGap) - 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '8px')
        .attr('fill', '#999')
        .text(`${yearData.length}本`);
    });

    // 添加X轴
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => d.toString() + '年')
      .ticks(10);

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '12px');

    // 添加图例
    const legend = g.append('g')
      .attr('transform', `translate(${width - 200}, 20)`);

    const legendData = [
      { type: 'book', label: '书籍', color: '#F59E0B' },
      { type: 'magazine', label: '杂志', color: '#EF4444' },
      { type: 'newspaper', label: '报纸', color: '#3B82F6' },
      { type: 'pamphlet', label: '小册子', color: '#10B981' }
    ];

    legendData.forEach((item, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      legendItem.append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', item.color);

      legendItem.append('text')
        .attr('x', 16)
        .attr('y', 9)
        .attr('font-size', '12px')
        .attr('fill', '#333')
        .text(item.label);
    });

    // 添加缩放和平移功能
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 10])
      .on('zoom', (event) => {
        g.attr('transform', 
          `translate(${margin.left + event.transform.x},${margin.top + event.transform.y}) scale(${event.transform.k})`
        );
      });

    svg.call(zoom);

  }, []);

  return (
    <section className={`py-20 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-charcoal mb-6 font-serif">远读山峦时间轴</h2>
          <p className="text-xl text-charcoal/70 max-w-3xl mx-auto leading-relaxed">
            1930-1950年出版物分布可视化，每个方块代表一份出版物，垂直堆叠形成时代山峦
          </p>
        </div>

        {/* D3 远读山峦可视化 */}
        <div className="w-full border border-amber-200 rounded-lg bg-amber-50 p-4">
          <svg
            ref={svgRef}
            className="w-full"
            style={{ minHeight: '600px' }}
          />
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16">
          <div className="text-center p-6 bg-cream rounded-lg">
            <div className="text-3xl font-bold text-gold mb-2">1000+</div>
            <div className="text-charcoal/70">出版物数据</div>
          </div>
          <div className="text-center p-6 bg-cream rounded-lg">
            <div className="text-3xl font-bold text-gold mb-2">21</div>
            <div className="text-charcoal/70">历史年份</div>
          </div>
          <div className="text-center p-6 bg-cream rounded-lg">
            <div className="text-3xl font-bold text-gold mb-2">D3.js</div>
            <div className="text-charcoal/70">纯净实现</div>
          </div>
          <div className="text-center p-6 bg-cream rounded-lg">
            <div className="text-3xl font-bold text-gold mb-2">远读山峦</div>
            <div className="text-charcoal/70">视觉隐喻</div>
          </div>
        </div>
      </div>
    </section>
  );
}