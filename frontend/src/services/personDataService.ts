import { PersonData, PersonTimelineEvent, TimelineEvent } from '../types/personTypes';

// 提取事件标题
const extractTitle = (event: PersonTimelineEvent, year: number): string => {
  const description = event.sub;
  
  // 按句号分割，取第一句作为标题
  const firstSentence = description.split('。')[0];
  
  // 如果第一句太长，尝试提取关键信息
  if (firstSentence.length > 30) {
    // 查找关键动词
    const keyActions = ['出生', '考入', '毕业', '创办', '担任', '发表', '出版', '逝世', '组织', '参加'];
    
    for (const action of keyActions) {
      if (firstSentence.includes(action)) {
        const parts = firstSentence.split(action);
        if (parts.length >= 2) {
          return `${action}${parts[1].substring(0, 15)}`;
        }
      }
    }
    
    // 如果没有找到关键动词，截取前20个字符
    return firstSentence.substring(0, 20) + '...';
  }
  
  return firstSentence;
};

// 提取事件位置
const extractLocation = (description: string): string => {
  const locations = ['上海', '北京', '福建', '福州', '永安', '广州', '重庆', '汉口', '香港', '南京', '杭州'];
  
  for (const location of locations) {
    if (description.includes(location)) {
      return location;
    }
  }
  
  return '未知';
};

// 提取详细信息
const extractDetails = (description: string): string[] => {
  // 按句号分割，过滤空字符串
  const sentences = description.split('。').filter(s => s.trim().length > 0);
  
  // 如果只有一句话，返回空数组
  if (sentences.length <= 1) {
    return [];
  }
  
  // 返回除第一句外的其他句子，最多3句
  return sentences.slice(1, 4).map(s => s.trim() + '。');
};

// 数据转换服务
export const personDataService = {
  // 加载邹韬奋数据
  async loadZouTaofenData(): Promise<PersonData> {
    const response = await fetch('/data/persons_clean.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch person data: ${response.status}`);
    }
    return response.json();
  },

  // 转换为时间线事件
  convertToTimelineEvents(personData: PersonData): TimelineEvent[] {
    const events: TimelineEvent[] = [];
    
    personData.data.forEach((yearData) => {
      yearData.items.forEach((event) => {
        // 过滤掉没有实质内容的事件
        if (!event.sub || event.sub.trim().length < 10) {
          return;
        }
        
        const title = extractTitle(event, yearData.year);
        const location = extractLocation(event.sub);
        const details = extractDetails(event.sub);
        
        events.push({
          id: event.id,
          year: yearData.year,
          date: event.redater || `${yearData.year}年`,
          title,
          description: event.sub.split('。')[0] + '。',
          location,
          details
        });
      });
    });
    
    // 按年份排序
    return events.sort((a, b) => a.year - b.year);
  },

  // 获取人物基本信息
  getPersonInfo(personData: PersonData) {
    const { extend } = personData;
    return {
      name: extend.name,
      penname: extend.penname,
      wordname: extend.wordname,
      birthDate: extend.stimer,
      deathDate: extend.etimer,
      birthPlace: extend.bornaddress,
      organization: extend.orgs,
      appraise: extend.appraise,
      biography: extend.sub,
      avatar: extend.pic
    };
  }
};