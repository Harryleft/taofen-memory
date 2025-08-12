// 统一的时间线数据类型定义

// 基础时间线事件接口
export interface BaseTimelineEvent {
  id: string | number;
  time: string;           // 时间显示文本
  date?: string;          // 标准化日期
  title?: string;         // 事件标题
  experience: string;     // 事件描述
  location: string;       // 地点
  image?: string;         // 图片路径
  timespot?: number;      // 1表示背景事件，0或undefined表示主要事件
  details?: string[];     // 详细信息数组
}

// 核心事件分组
export interface CoreEventGroup {
  id: string;
  core_event: string;     // 核心事件标题
  timeline: BaseTimelineEvent[];
}

// 完整的时间线数据
export interface TimelineData {
  groups: CoreEventGroup[];
  metadata?: {
    totalEvents: number;
    timeRange: {
      start: string;
      end: string;
    };
    lastUpdated?: string;
  };
}

// 数据源类型枚举
export enum DataSourceType {
  STATIC_JSON = 'static_json',
  PERSON_API = 'person_api',
  MIXED = 'mixed'
}

// 数据加载配置
export interface DataLoadConfig {
  sourceType: DataSourceType;
  staticJsonPath?: string;
  personApiEndpoint?: string;
  enableCache?: boolean;
  cacheExpiry?: number;
}

// 数据转换器接口
export interface DataTransformer<T> {
  transform(rawData: T): TimelineData;
  validate(data: TimelineData): boolean;
}

// 错误类型
export interface TimelineError {
  code: string;
  message: string;
  details?: unknown;
}

// 加载状态
export interface LoadingState {
  isLoading: boolean;
  error: TimelineError | null;
  progress?: number;
}