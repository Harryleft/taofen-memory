import { adaptTimelineData, validateAdaptedData } from './timelineDataAdapter';
import { TimelineData } from './useTimelineData';

// 测试数据 - 模拟timeline.json的结构
const mockTimelineData: TimelineData = [
  {
    core_event: "1. 幼年生活",
    timeline: [
      {
        time: "1895年",
        experience: "11月5日，邹韬奋出生于福建省永安市。",
        image: "/images/timeline_images/taofen_children.jpg",
        location: "福建, 永安"
      },
      {
        time: "1900年",
        experience: "父亲去福州任候补，全家迁往。",
        image: "/images/timeline_images/taofen_father.jpg",
        location: "福建, 福州"
      },
      {
        time: "1900年",
        experience: "八国联军侵华战争爆发，清政府与11国签订《辛丑条约》。",
        image: "/images/timeline_images/xinchoutiqoyue.jpg",
        location: "中国, 北京",
        timespot: 1 // 背景事件，应该被过滤
      }
    ]
  },
  {
    core_event: "2. 求学时期",
    timeline: [
      {
        time: "1915年",
        experience: "考入上海圣约翰大学文科。",
        image: "/images/timeline_images/shenyuehandaxue.jpg",
        location: "上海"
      },
      {
        time: "1922年",
        experience: "创办《生活》周刊，开启了新闻出版事业的辉煌历程。",
        image: "/images/timeline_images/shenghuo_first.jpg",
        location: "上海"
      }
    ]
  }
];

describe('TimelineDataAdapter', () => {
  test('应该正确展平嵌套结构', () => {
    const result = adaptTimelineData(mockTimelineData);
    
    // 应该过滤掉背景事件，所以只有4个事件而不是5个
    expect(result).toHaveLength(4);
    
    // 应该包含所有非背景事件
    expect(result.map(e => e.year)).toEqual([1895, 1900, 1915, 1922]);
  });

  test('应该正确提取年份', () => {
    const result = adaptTimelineData(mockTimelineData);
    
    // 测试不同格式的年份提取
    expect(result[0].year).toBe(1895); // "1895年"
    expect(result[1].year).toBe(1900); // "1900年"
    expect(result[2].year).toBe(1915); // "1915年"
  });

  test('应该正确分配时期', () => {
    const result = adaptTimelineData(mockTimelineData);
    
    expect(result[0].period).toBe('early');   // 1895
    expect(result[1].period).toBe('early');   // 1900
    expect(result[2].period).toBe('early');   // 1915
    expect(result[3].period).toBe('middle');  // 1922
  });

  test('应该正确分割标题和描述', () => {
    const result = adaptTimelineData(mockTimelineData);
    
    const firstEvent = result[0];
    expect(firstEvent.title).toContain('邹韬奋出生于福建省永安市');
    expect(firstEvent.description).toBe('11月5日，邹韬奋出生于福建省永安市。');
  });

  test('应该正确处理图片URL', () => {
    const result = adaptTimelineData(mockTimelineData);
    
    const firstEvent = result[0];
    expect(firstEvent.imageUrl).toBe('/images/timeline_images/taofen_children.jpg');
  });

  test('应该正确生成ID', () => {
    const result = adaptTimelineData(mockTimelineData);
    
    // ID应该是年份和索引的组合
    expect(result[0].id).toBe('1895-0');
    expect(result[1].id).toBe('1900-1');
    expect(result[2].id).toBe('1915-2');
  });

  test('应该包含地点信息', () => {
    const result = adaptTimelineData(mockTimelineData);
    
    const firstEvent = result[0];
    expect(firstEvent.location).toBe('福建, 永安');
    // details数组现在为空，因为地点信息有专门的字段
    expect(firstEvent.details).toEqual([]);
  });

  test('应该按年份排序', () => {
    const result = adaptTimelineData(mockTimelineData);
    
    // 检查是否按年份升序排列
    for (let i = 1; i < result.length; i++) {
      expect(result[i].year).toBeGreaterThan(result[i - 1].year);
    }
  });

  test('应该通过数据验证', () => {
    const result = adaptTimelineData(mockTimelineData);
    
    expect(validateAdaptedData(result)).toBe(true);
  });

  test('应该处理空数据', () => {
    const result = adaptTimelineData([]);
    
    expect(result).toHaveLength(0);
    expect(validateAdaptedData(result)).toBe(true);
  });

  test('应该处理无效数据', () => {
    const result = adaptTimelineData([null as unknown as TimelineData]);
    
    expect(result).toHaveLength(0);
  });
});

// 如果在浏览器环境中运行，导出测试函数
if (typeof window !== 'undefined') {
  (window as Record<string, unknown>).runTimelineAdapterTests = () => {
    console.group('🧪 时间线适配器测试');
    
    try {
      const result = adaptTimelineData(mockTimelineData);
      console.log('✅ 适配成功:', result);
      
      const isValid = validateAdaptedData(result);
      console.log('✅ 数据验证:', isValid);
      
      console.log('✅ 所有测试通过');
    } catch (error) {
      console.error('❌ 测试失败:', error);
    }
    
    console.groupEnd();
  };
}