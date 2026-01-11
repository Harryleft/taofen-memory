/**
 * 环境判断工具
 * 用于区分开发环境和生产环境
 */

// 检查是否为生产环境 - 更严格的判断
export const isProduction = (): boolean => {
  // 在构建时，Vite会设置这些环境变量
  return import.meta.env.PROD === true || 
         import.meta.env.MODE === 'production' ||
         process.env.NODE_ENV === 'production';
};

// 检查是否为开发环境
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV === true || 
         import.meta.env.MODE === 'development' ||
         process.env.NODE_ENV === 'development';
};

// 检查是否为测试环境
export const isTest = (): boolean => {
  return import.meta.env.MODE === 'test' || 
         process.env.NODE_ENV === 'test';
};

// 获取环境名称
export const getEnvironment = (): string => {
  if (isProduction()) return 'production';
  if (isDevelopment()) return 'development';
  if (isTest()) return 'test';
  return import.meta.env.MODE || 'unknown';
};

// 生产环境日志
export const logProduction = (message: string, ...args: unknown[]) => {
  if (isProduction()) {
    console.log(`🚀 [生产环境] ${message}`, ...args);
  }
};

// 开发环境日志
export const logDevelopment = (message: string, ...args: unknown[]) => {
  if (isDevelopment()) {
    console.log(`🛠️ [开发环境] ${message}`, ...args);
  }
};

// 环境通用日志
export const logEnvironment = (message: string, ...args: unknown[]) => {
  const env = getEnvironment();
  console.log(`🌍 [${env}] ${message}`, ...args);
};