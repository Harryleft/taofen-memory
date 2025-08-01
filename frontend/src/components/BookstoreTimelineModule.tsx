import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

// 书籍数据结构
interface BookData {
  id: number;
  year: number;
  bookname: string;
  writer: string;
  publisher: string;
  image: string;
}

// 时间轴数据点
interface MountainDataPoint {
  id: number;
  year: number;
  title: string;
  imagePath: string;
  writer: string;
  publisher: string;
}

// 加载书籍数据
const loadBooksData = async (): Promise<MountainDataPoint[]> => {
  const response = await fetch('/data/books_clean.json');
  const booksData: BookData[] = await response.json();
  
  return booksData
    .filter(book => book.image && book.publisher?.includes('生活书店') && book.year >= 1900 && book.year <= 1949)
    .map(book => ({
      id: book.id,
      year: book.year,
      title: book.bookname,
      imagePath: book.image,
      writer: book.writer || '',
      publisher: book.publisher || ''
    }))
    .sort((a, b) => a.year - b.year);
};

const MARGIN = { top: 40, right: 40, bottom: 60, left: 60 };

const drawTimelineChart = (svgNode: SVGSVGElement, tooltipNode: HTMLDivElement, data: MountainDataPoint[]) => {
  if (data.length === 0) return () => {};

  d3.select(svgNode).selectAll('*').remove();
  d3.select(svgNode).on('.zoom', null);

  const containerWidth = svgNode.clientWidth || 1200;
  const width = containerWidth - MARGIN.left - MARGIN.right;
  const height = 600 - MARGIN.top - MARGIN.bottom;

  const svg = d3.select(svgNode)
    .attr('width', containerWidth)
    .attr('height', 600)
    .style('background-color', '#fffbef');

  const outer = svg.append('g')
    .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

  const zoomLayer = outer.append('g');

  const years = [...new Set(data.map(d => d.year))].sort();
  const xScale = d3.scaleLinear()
    .domain([years[0] - 0.5, years[years.length - 1] + 0.5])
    .range([0, width]);

  const xAxis = d3.axisBottom(xScale)
    .tickValues(years)
    .tickFormat(d3.format('d'));

  const xAxisG = outer.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(xAxis);

  xAxisG.selectAll('text').style('font-size', '14px').style('fill', '#666');

  const grouped = d3.group(data, d => d.year);
  const tooltip = d3.select(tooltipNode);

  grouped.forEach((yearData, year) => {
    const centerX = xScale(year);
    const maxPerRow = Math.max(1, Math.floor(width / years.length / 42));

    yearData.forEach((d, i) => {
      const row = Math.floor(i / maxPerRow);
      const col = i % maxPerRow;
      const offsetX = (col - maxPerRow / 2) * 42;

      zoomLayer.append('image')
        .datum(d)
        .attr('href', d.imagePath)
        .attr('width', 40)
        .attr('height', 40)
        .attr('x', centerX + offsetX - 20)
        .attr('y', height - (row + 1) * 42)
        .style('cursor', 'pointer')
        .on('mouseover', function (event, d) {
          d3.select(this).raise().transition().duration(150)
            .attr('width', 44).attr('height', 44);
          tooltip.style('opacity', 1)
            .html(`<strong>${d.title}</strong><br/>作者：${d.writer}<br/>出版：${d.publisher}<br/>年份：${d.year}`)
            .style('left', `${event.pageX + 15}px`)
            .style('top', `${event.pageY}px`);
        })
        .on('mouseout', function () {
          d3.select(this).transition().duration(150)
            .attr('width', 40).attr('height', 40);
          tooltip.style('opacity', 0);
        });
    });
  });

  const zoomed = (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
    const { k, x } = event.transform;
    zoomLayer.attr('transform', `translate(${x},0) scale(${k},1)`);
    xAxisG.call(xAxis.scale(event.transform.rescaleX(xScale)));
  };

  svg.call(
    d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 8])
      .on('zoom', zoomed)
  );

  return () => d3.select(svgNode).on('.zoom', null);
};

interface BookstoreTimelineModuleProps {
  className?: string;
}

export default function BookstoreTimelineModule({ className = '' }: BookstoreTimelineModuleProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<MountainDataPoint[]>([]);

  useEffect(() => {
    loadBooksData().then(setData);
  }, []);

  useEffect(() => {
    if (svgRef.current && tooltipRef.current && data.length > 0) {
      const cleanup = drawTimelineChart(svgRef.current, tooltipRef.current, data);
      return cleanup;
    }
  }, [data]);

  const yearRange = data.length > 0 
    ? `${Math.min(...data.map(d => d.year))}-${Math.max(...data.map(d => d.year))}`
    : '';

  return (
    <section className={`relative py-20 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-charcoal mb-6 font-serif">
            远读山峦时间轴
          </h2>
          <p className="text-xl text-charcoal/70 max-w-3xl mx-auto leading-relaxed">
            {yearRange && `${yearRange} 年出版物分布可视化：共 ${data.length} 本书籍，滚轮缩放、拖拽平移`}
          </p>
        </div>

        <div className="w-full border border-amber-200 rounded-lg bg-amber-50 p-4 relative">
          <svg ref={svgRef} className="w-full" style={{ minHeight: 600 }} />
          <div
            ref={tooltipRef}
            className="absolute bg-slate-800 text-white text-sm rounded-md px-3 py-2 pointer-events-none"
            style={{ opacity: 0 }}
          />
        </div>
      </div>
    </section>
  );
}
