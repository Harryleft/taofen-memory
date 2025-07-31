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

  const yearlyDistribution = { 1934: 15, 1935: 25, 1936: 12 };
  const data: MountainDataPoint[] = [];
  let id = 1;
  let imageIndex = 0;

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
  return data;
};

const mountainData: MountainDataPoint[] = generateMountainData();

interface BookstoreTimelineModuleProps {
  className?: string;
}

export default function BookstoreTimelineModule({ className = '' }: BookstoreTimelineModuleProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const containerWidth = svgRef.current.clientWidth || 1200;
    const containerHeight = 600;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', containerWidth)
      .attr('height', containerHeight);

    // ✅ **修改1: 修正D3图层结构和缩放目标**
    // 创建一个总的上下文（Context）图层，用于应用边距
    // 所有的可视化元素（山峦、坐标轴）都在这个图层里
    // 我们将对这个`context`图层进行缩放和平移
    // 分离图层：imageContext(可缩放) + xAxisGroup(固定)
    const rootG = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const imageContext = rootG.append('g').attr('class', 'image-context');
    const xAxisGroup = rootG.append('g').attr('class', 'x-axis-group');
    
    // 按年份对数据进行分组
    const dataByYear = d3.group(mountainData, d => d.year);
    const years = Array.from(dataByYear.keys()).sort();

    // ✅ **修改2: 使用scaleBand，它更适合离散的年份数据**
    // `padding(0.2)`会在山峰之间留出一些空隙，形成山谷
    const xScale = d3.scaleBand()
      .domain(years.map(String))
      .range([0, width])
      .padding(0.2);

    const imageBaseSize = 40; // 图片基础尺寸
    const imageGap = 2; // 堆叠图片之间的缝隙

    // 绘制坐标轴
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d => d + '年');

    xAxisGroup.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '14px')
      .style('fill', '#666');
    
    // ✅ **修改3: 实现“金字塔”堆叠布局算法，形成山峰**
    years.forEach(year => {
      const yearData = dataByYear.get(year) || [];
      const yearX = xScale(String(year))!; // scaleBand的中心点
      const yearBandwidth = xScale.bandwidth(); // 当前年份可用的总宽度
      
      let placedCount = 0;
      let row = 0;
      // 从下往上堆叠
      while (placedCount < yearData.length) {
        // 动态计算当前行能放多少图片
        const maxImagesInRow = Math.floor(yearBandwidth / (imageBaseSize + imageGap));
        const imagesInThisRow = Math.min(yearData.length - placedCount, maxImagesInRow);
        
        // 计算当前行的总宽度，并使其在年份的Bandwidth内居中
        const rowWidth = imagesInThisRow * (imageBaseSize + imageGap) - imageGap;
        const startX = yearX + (yearBandwidth - rowWidth) / 2;
        
        // 获取当前行需要放置的数据
        const rowData = yearData.slice(placedCount, placedCount + imagesInThisRow);

        rowData.forEach((d, index) => {
                     imageContext.append('image')
            .datum(d) // 绑定完整数据到元素上
            .attr('x', startX + index * (imageBaseSize + imageGap))
            .attr('y', height - (row + 1) * (imageBaseSize + imageGap))
            .attr('width', imageBaseSize)
            .attr('height', imageBaseSize)
            .attr('href', d.imagePath)
            .attr('preserveAspectRatio', 'xMidYMid slice')
            .attr('class', 'book-image') // 添加class方便统一样式
            .style('cursor', 'pointer');
        });
        
        placedCount += imagesInThisRow;
        row++;
      }
    });
    
    // ✅ **修改4: 增加工具提示（Tooltip）和交互效果**
    const tooltip = d3.select(tooltipRef.current);
    
    context.selectAll('.book-image')
      .on('mouseover', function(event, d: any) {
        d3.select(this)
          .transition().duration(150)
          .attr('transform', `scale(1.1)`)
          .style('outline', '2px solid #fbbF24'); // 高亮边框
        
        tooltip
          .style('opacity', 1)
          .html(`<strong>${d.title}</strong><br/>${d.year}年`)
          .style('left', `${event.pageX + 15}px`)
          .style('top', `${event.pageY}px`);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition().duration(150)
          .attr('transform', 'scale(1)')
          .style('outline', 'none');
          
        tooltip.style('opacity', 0);
      });

    // ✅ **修改5: 修正缩放和平移功能**
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 8])
      .translateExtent([[0, 0], [width, height]]) // 限制平移范围
      .on('zoom', (event) => {
        const newXScale = event.transform.rescaleX(xScale);
        // 只缩放/平移图片层
        imageContext.attr('transform', `translate(${event.transform.x},0) scale(${event.transform.k})`);
        // 更新坐标轴刻度
        xAxisGroup.selectAll('g.x-axis').call(xAxis.scale(newXScale));
      });

    // 将缩放行为应用到SVG上，并设置初始位置和缩放
    svg.call(zoom)
       .call(zoom.transform, d3.zoomIdentity.translate(margin.left, margin.top));

  }, []);

  return (
    <section className={`relative py-20 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-charcoal mb-6 font-serif">远读山峦时间轴</h2>
          <p className="text-xl text-charcoal/70 max-w-3xl mx-auto leading-relaxed">
            1934-1936年出版物分布可视化，真实图书封面紧密堆叠形成山峦，滚轮缩放、拖拽平移查看细节
          </p>
        </div>

        <div className="w-full border border-amber-200 rounded-lg bg-amber-50 p-4 relative">
          <svg
            ref={svgRef}
            className="w-full"
            style={{ minHeight: '600px' }}
          />
          {/* 工具提示 DIV */}
          <div
            ref={tooltipRef}
            className="absolute bg-slate-800 text-white text-sm rounded-md px-3 py-2 pointer-events-none transition-opacity duration-200"
            style={{ opacity: 0 }}
          />
        </div>
      </div>
    </section>
  );
}