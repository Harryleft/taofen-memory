// 真实数据接口定义
export interface PersonData {
  records: number;
  extend: {
    sub: string;          // 人物简介
    stimer: string;       // 出生日期（短格式）
    sex: string;          // 性别
    wordname: string;     // 字号
    stime: string;        // 出生日期（完整）
    pic: string;          // 头像图片
    etimer: string;       // 逝世日期（短格式）
    penname: string;      // 笔名
    appraise: string;     // 评价
    etime: string;        // 逝世日期（完整）
    name: string;         // 姓名
    ID: number;           // 人物ID
    orgs: string;         // 相关组织
    namer: string;        // 别名
    bornaddress: string;  // 出生地
  };
  page: number;
  data: PersonTimelineYear[];
}

export interface PersonTimelineYear {
  year: number;
  items: PersonTimelineEvent[];
}

export interface PersonTimelineEvent {
  redater: string;      // 事件日期（中文格式）
  redate: string;       // 事件日期（ISO格式）
  type: number;         // 事件类型
  data: string;         // 数据类型
  child: any[];         // 子事件
  text: string;         // 事件文本
  pic: string;          // 事件图片
  sub: string;          // 事件详细描述
  id: number;           // 事件ID
}

// 简化的时间线事件接口（用于展示）
export interface TimelineEvent {
  id: number;
  year: number;
  date: string;
  title: string;
  description: string;
  location: string;
  details: string[];
}