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
    '生活周刊', '大众生活', '读书生活', '新生活', '文学月刊', '青年界', '妇女生活', '儿童世界',
    '科学画报', '教育杂志', '时事周报', '民众教育', '新华日报', '文汇报', '救国时报',
  ];
  const yearlyDistribution: Record<number, number> = { 1934: 15, 1935: 25, 1936: 12 };

  let id = 1;
  let imgIdx = 0;
  // const data: MountainDataPoint[] = [];

  Object.entries(yearlyDistribution).forEach(([y, count]) => {
    const year = +y;
    for (let i = 0; i < count; i += 1) {
      data.push({
        id: id++,
        year,
        month: Math.floor(Math.random() * 12) + 1,
        title: titles[Math.floor(Math.random() * titles.length)],
        imagePath: `/images/books/${realImages[imgIdx++ % realImages.length]}`,
      });
    }
  });
  return data;
};

const mountainData = generateMountainData();

/* ---------- 组件 ---------- */
interface BookstoreTimelineModuleProps {
  className?: string;
}

export default function BookstoreTimelineModule({ className = '' }: BookstoreTimelineModuleProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;            // 早退时返回 void

    const svgNode = svgRef.current;

    /* ---------- 基础设置（与上一版一致，略） ---------- */
    d3.select(svgNode).selectAll('*').remove();
    d3.select(svgNode).on('.zoom', null);

    const containerWidth = svgNode.clientWidth || 1200;
    const containerHeight = 600;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;
    const bgColor = '#fffbef';
    const imageSize = 40;
    const gap = 2;

    const svg = d3
      .select(svgNode)
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .style('background-color', bgColor);

    svg.append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', width)
      .attr('height', height);

    const outer = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const zoomLayer = outer.append('g')
      .attr('clip-path', 'url(#clip)');

    const years = Array.from(new Set(mountainData.map(d => d.year))).sort();
    const minYear = d3.min(years)! - 0.5;
    const maxYear = d3.max(years)! + 0.5;

    const xScaleLinear = d3.scaleLinear()
      .domain([minYear, maxYear])
      .range([0, width]);

    const xAxis = d3.axisBottom(xScaleLinear)
      .tickValues(years)
      .tickFormat(d3.format('d'));

    const xAxisG = outer.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis);

    xAxisG.selectAll('text').style('font-size', '14px').style('fill', '#666');
    xAxisG.select('.domain').style('stroke', '#ccc');

    const grouped = d3.group(mountainData, d => d.year);

    grouped.forEach((yearData, year) => {
      const centerX = xScaleLinear(year);
      const maxPerRow = Math.floor((width / years.length) / (imageSize + gap));

      yearData.forEach((d, i) => {
        const row = Math.floor(i / maxPerRow);
        const col = i % maxPerRow;
        const offsetX = (col - maxPerRow / 2) * (imageSize + gap) + (imageSize + gap) / 2;

        zoomLayer.append('image')
          .datum(d)
          .attr('href', d.imagePath)
          .attr('width', imageSize)
          .attr('height', imageSize)
          .attr('x', centerX + offsetX - imageSize / 2)
          .attr('y', height - (row + 1) * (imageSize + gap))
          .attr('preserveAspectRatio', 'xMidYMid slice')
          .attr('class', 'book-img')
          .style('cursor', 'pointer');
      });
    });

    const tooltip = d3.select(tooltipRef.current!);      // non-null 断言

    zoomLayer.selectAll<SVGImageElement, MountainDataPoint>('.book-img')
      .on('mouseover', function (event, d) {
        d3.select(this).raise().transition().duration(150)
          .attr('width', imageSize * 1.1)
          .attr('height', imageSize * 1.1);

        tooltip
          .style('opacity', 1)
          .html(`<strong>${d.title}</strong><br/>${d.year} 年`)
          .style('left', `${event.pageX + 15}px`)
          .style('top', `${event.pageY}px`);
      })
      .on('mouseout', function () {
        d3.select(this).transition().duration(150)
          .attr('width', imageSize)
          .attr('height', imageSize);

        tooltip.style('opacity', 0);
      });

    const zoomed = (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
      const { k, x } = event.transform;
      zoomLayer.attr('transform', `translate(${x},0) scale(${k},1)`);
      xAxisG.call(xAxis.scale(event.transform.rescaleX(xScaleLinear)));
    };

    svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.5, 8])
        .translateExtent([[-width, -Infinity], [width * 2, Infinity]])
        .extent([[0, 0], [width, height]])
        .on('zoom', zoomed),
    );

    /* ---------- 关键：清理函数返回 void ---------- */
    return () => {
      d3.select(svgNode).on('.zoom', null); // 移除监听，丢弃返回值
    };
  }, []);

  /* ---------- JSX ---------- */
  return (
    <section className={`relative py-20 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-charcoal mb-6 font-serif">
            远读山峦时间轴
          </h2>
          <p className="text-xl text-charcoal/70 max-w-3xl mx-auto leading-relaxed">
            1934-1936 年出版物分布可视化：滚轮缩放、拖拽平移，查看山峦般的书籍年景
          </p>
        </div>

        <div className="w-full border border-amber-200 rounded-lg bg-amber-50 p-4 relative">
          <svg ref={svgRef} className="w-full" style={{ minHeight: 600 }} />
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