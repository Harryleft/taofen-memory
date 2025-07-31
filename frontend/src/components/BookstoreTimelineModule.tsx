import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

// D3 远读山峦数据结构 - 简化版本
interface MountainDataPoint {
  id: number;
  year: number;
  month: number;
  title: string;
  imagePath: string;
}

// 使用真实图片数据 - 3年测试时间范围 (1934-1936)
const generateMountainData = (): MountainDataPoint[] => {
  const data: MountainDataPoint[] = [];
  
  // 真实图片文件名数组 - 从public/images/books目录
  const realImages = [
    'book_23416_-4998639186942255748.jpg', 'book_23417_-3852244789965758496.jpg', 'book_23418_4462283b97413ab9.jpg',
    'book_23419_-5632022676287629273.jpg', 'book_23420_-1855791942358398657.jpg', 'book_23421_-2042169621397586150.jpg',
    'book_23422_-7115342089587619670.jpg', 'book_23423_-8373031078909513017.jpg', 'book_23424_-2604910119916886782.jpg',
    'book_23425_-1785525125771768182.jpg', 'book_23426_-159901723489253475.jpg', 'book_23427_-3844244803203524888.jpg',
    'book_23428_-3837940625291627111.jpg', 'book_23429_-1477639427932003088.jpg', 'book_23430_-5562129265642608756.jpg',
    'book_23431_-7892229097442701058.jpg', 'book_23432_-2581749817470159686.jpg', 'book_23433_-3470636951303014949.jpg',
    'book_23434_-4623327514967615735.jpg', 'book_23435_-2087955644272572478.jpg', 'book_23436_-7714621659299364889.jpg',
    'book_23437_-3360823350712026630.jpg', 'book_23438_-2232596915751383319.jpg', 'book_23439_-1368073078858966529.jpg',
    'book_23440_-3658158069634473578.jpg', 'book_23441_-3916099362726884917.jpg', 'book_23442_-1255433671954459195.jpg',
    'book_23443_-4910439981153704181.jpg', 'book_23444_-2195130034922510191.jpg', 'book_23445_-2400332830789112399.jpg',
    'book_23446_-2224633863020081482.jpg', 'book_23447_-1075169616984349866.jpg', 'book_23448_-614297641780091019.jpg',
    'book_23450_-206594605777767237.jpg', 'book_23451_-1203391813805897094.jpg', 'book_23452_-3392186564342118941.jpg',
    'book_23453_-8880444755985866078.jpg', 'book_23454_2218799157042891040.jpg', 'book_23455_-1762059586010719922.jpg',
    'book_23456_1ce7a45c9c64e7f4.jpg', 'book_23457_-1262639379820779836.jpg', 'book_23458_-7405423048627670781.jpg',
    'book_23459_-1023150637824470312.jpg', 'book_23460_-4390334948177620911.jpg', 'book_23461_-3933660030092891077.jpg',
    'book_23462_-5613829804670559247.jpg', 'book_23463_-2427818215605441259.jpg', 'book_23464_-2873368441043783992.jpg',
    'book_23465_-4562298341534676269.jpg', 'book_23466_-5843245027255920579.jpg', 'book_23467_-2617235280630217202.jpg',
    'book_23468_-2671334620773387670.jpg', 'book_23469_-2187776683781714513.jpg', 'book_23470_-602075659643498126.jpg'
  ];

  const titles = [
    '生活周刊', '大众生活', '读书生活', '新生活', '文学月刊', '青年界',
    '妇女生活', '儿童世界', '科学画报', '教育杂志', '时事周报', '民众教育',
    '新华日报', '文汇报', '救国时报', '抗战文艺', '战时文化', '民主报',
    '社会科学', '自然科学', '医学常识', '农业技术', '工业发展', '商业指南'
  ];

  // 3年测试数据分布 (1934-1936)
  const yearlyDistribution = {
    1934: 15, // 发展期
    1935: 25, // 高峰期
    1936: 12  // 调整期
  };

  let id = 1;
  let imageIndex = 0;
  
  // 为每年生成相应数量的数据点
  Object.entries(yearlyDistribution).forEach(([yearStr, count]) => {
    const year = parseInt(yearStr);
    
    for (let i = 0; i < count; i++) {
      data.push({
        id: id++,
        year,
        month: Math.floor(Math.random() * 12) + 1,
        title: titles[Math.floor(Math.random() * titles.length)],
        imagePath: `/images/books/${realImages[imageIndex % realImages.length]}`
      });
      imageIndex++;
    }
  });

  console.log(`📊 生成真实图片数据: ${data.length}条记录 (1934-1936)`);
  console.log('📈 年度分布:', Object.entries(yearlyDistribution).map(([year, count]) => 
    `${year}年: ${count}本`).join(', '));

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

    // 创建SVG
    const svg = d3.select(svgRef.current)
      .attr('width', containerWidth)
      .attr('height', containerHeight);

    // 创建固定的背景层（X轴等不缩放元素）
    const fixedLayer = svg.append('g')
      .attr('class', 'fixed-layer')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 创建可缩放的内容层（图片）
    const zoomableLayer = svg.append('g')
      .attr('class', 'zoomable-layer')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 处理数据：按年份分组
    const dataByYear = d3.group(mountainData, d => d.year);
    const years = Array.from(dataByYear.keys()).sort();

    // 设置比例尺 - 3年测试范围
    const xScale = d3.scaleLinear()
      .domain([1934, 1936])
      .range([0, width]);

    const yearWidth = width / (1936 - 1934 + 1) * 0.8; // 每年可用宽度
    const imageBaseSize = 40; // 基础图片尺寸
    const imageGap = 2; // 图片间隔

    // 绘制真实图片山峦
    years.forEach(year => {
      const yearData = dataByYear.get(year) || [];
      const yearX = xScale(year);
      
      // 计算图片排列：优先垂直堆叠形成山峦效果
      const imagesPerRow = Math.ceil(Math.sqrt(yearData.length));
      const totalRows = Math.ceil(yearData.length / imagesPerRow);

      // 居中排列
      const totalStackWidth = imagesPerRow * (imageBaseSize + imageGap) - imageGap;
      const startX = yearX - totalStackWidth / 2;

      // 为每年的数据创建真实图片堆叠
      yearData.forEach((d, index) => {
        const row = Math.floor(index / imagesPerRow);
        const col = index % imagesPerRow;
        
        const x = startX + col * (imageBaseSize + imageGap);
        const y = height - imageBaseSize - (row * (imageBaseSize + imageGap));

        // 创建图片元素
        zoomableLayer.append('image')
          .attr('x', x)
          .attr('y', y)
          .attr('width', imageBaseSize)
          .attr('height', imageBaseSize)
          .attr('href', d.imagePath)
          .attr('preserveAspectRatio', 'xMidYMid slice') // 保持比例并裁剪
          .style('opacity', 0.9)
          .style('cursor', 'pointer')
          .on('mouseover', function() {
            d3.select(this).style('opacity', 1);
          })
          .on('mouseout', function() {
            d3.select(this).style('opacity', 0.9);
          });
      });

      // 在固定层添加每年的数量标签
      if (yearData.length > 0) {
        fixedLayer.append('text')
          .attr('x', yearX)
          .attr('y', height - totalRows * (imageBaseSize + imageGap) - 10)
          .attr('text-anchor', 'middle')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .attr('fill', '#666')
          .text(`${yearData.length}本`);
      }
    });

    // 在固定层添加X轴 - 不会被缩放
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => (d as number).toString() + '年')
      .tickValues([1934, 1935, 1936]);

    fixedLayer.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '14px')
      .style('fill', '#666')
      .style('font-weight', 'bold')
      .style('text-anchor', 'middle');

    // 添加年份分割线 - 固定不缩放
    years.forEach(year => {
      const yearX = xScale(year);
      fixedLayer.append('line')
        .attr('x1', yearX)
        .attr('y1', 0)
        .attr('x2', yearX)
        .attr('y2', height)
        .attr('stroke', '#ddd')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3')
        .style('opacity', 0.5);
    });

    // 添加缩放功能 - 只缩放图片层，X轴保持固定
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5]) // 合理的缩放范围
      .on('zoom', (event) => {
        // 只对可缩放层应用变换，固定层保持不变
        zoomableLayer.attr('transform', 
          `translate(${margin.left + event.transform.x},${margin.top + event.transform.y}) scale(${event.transform.k})`
        );
      });

    svg.call(zoom)
      .on('dblclick.zoom', null);

  }, []);

  return (
    <section className={`py-20 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-charcoal mb-6 font-serif">远读山峦时间轴</h2>
          <p className="text-xl text-charcoal/70 max-w-3xl mx-auto leading-relaxed">
            1934-1936年出版物分布可视化，真实图书封面垂直堆叠形成山峦，支持缩放查看细节
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
            <div className="text-3xl font-bold text-gold mb-2">52</div>
            <div className="text-charcoal/70">真实封面</div>
          </div>
          <div className="text-center p-6 bg-cream rounded-lg">
            <div className="text-3xl font-bold text-gold mb-2">3</div>
            <div className="text-charcoal/70">测试年份</div>
          </div>
          <div className="text-center p-6 bg-cream rounded-lg">
            <div className="text-3xl font-bold text-gold mb-2">固定轴线</div>
            <div className="text-charcoal/70">独立缩放</div>
          </div>
          <div className="text-center p-6 bg-cream rounded-lg">
            <div className="text-3xl font-bold text-gold mb-2">可交互</div>
            <div className="text-charcoal/70">山峦浏览</div>
          </div>
        </div>
      </div>
    </section>
  );
}