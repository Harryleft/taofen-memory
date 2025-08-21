/**
 * 数据流调试脚本
 * 用于追踪从数据源到UI的完整数据流向
 */

// 模拟数据源中的空字符串描述
const testDataWithEmptyDesc = {
  id: 123,
  name: "测试人物",
  category: "新闻出版",
  image_url: "",
  description: "",  // 空字符串
  sources: ["测试源"],
  links: []
};

// 模拟数据源中的数字0描述
const testDataWithZeroDesc = {
  id: 124,
  name: "测试人物2",
  category: "新闻出版",
  image_url: "",
  description: 0,  // 数字0
  sources: ["测试源"],
  links: []
};

// 模拟数据源中的字符串"0"描述
const testDataWithStringZeroDesc = {
  id: 125,
  name: "测试人物3",
  category: "新闻出版",
  image_url: "",
  description: "0",  // 字符串"0"
  sources: ["测试源"],
  links: []
};

// 复制sanitizeDescription函数的逻辑
const sanitizeDescription = (desc) => {
  console.log('[sanitizeDescription] 输入:', { desc, type: typeof desc });
  
  // 增强的类型检查
  if (desc === null || desc === undefined) {
    console.log('[sanitizeDescription] 返回undefined - null或undefined');
    return undefined;
  }
  
  // 处理数字0的情况
  if (desc === 0) {
    console.log('[sanitizeDescription] 返回undefined - 数字0');
    return undefined;
  }
  
  // 转换为字符串
  let strDesc;
  try {
    strDesc = String(desc);
    console.log('[sanitizeDescription] 转换为字符串:', strDesc);
  } catch {
    console.log('[sanitizeDescription] 返回undefined - 转换失败');
    return undefined;
  }
  
  const trimmed = strDesc.trim();
  console.log('[sanitizeDescription] 去除空格:', trimmed);
  
  // 更全面的无效值检查
  const invalidValues = [
    '', '0', 'null', 'undefined', 'false', 'true', 
    'NaN', 'Infinity', '-Infinity', 'none', 'None', 'NONE'
  ];
  
  if (invalidValues.includes(trimmed)) {
    console.log('[sanitizeDescription] 返回undefined - 无效值:', trimmed);
    return undefined;
  }
  
  // 防止纯数字或符号被意外显示
  if (/^[\d\s\W]+$/.test(trimmed) && trimmed.length < 2) {
    console.log('[sanitizeDescription] 返回undefined - 纯数字/符号');
    return undefined;
  }
  
  console.log('[sanitizeDescription] 返回有效描述:', trimmed);
  return trimmed;
};

// 复制renderSafeDescription函数的逻辑
const renderSafeDescription = (description, maxLength) => {
  console.log('[renderSafeDescription] 输入:', { description, type: typeof description });
  
  // 首先检查是否为 undefined 或 null
  if (description === undefined || description === null) {
    console.log('[renderSafeDescription] 返回null - undefined或null');
    return null;
  }
  
  // 处理可能的非字符串值（防御性编程）
  if (typeof description !== 'string') {
    // 如果是数字0，直接过滤
    if (description === 0) {
      console.log('[renderSafeDescription] 返回null - 数字0');
      return null;
    }
    // 尝试转换为字符串，但保持防御性
    try {
      description = String(description);
      console.log('[renderSafeDescription] 转换为字符串:', description);
    } catch {
      console.log('[renderSafeDescription] 返回null - 转换失败');
      return null;
    }
  }
  
  // 四重保护，确保万无一失
  const desc = description || '';
  const trimmed = desc.trim();
  console.log('[renderSafeDescription] 去除空格:', trimmed);
  
  // 更全面的无效值检查
  const invalidValues = [
    '', '0', 'null', 'undefined', 'false', 'true', 
    'NaN', 'Infinity', '-Infinity', 'none', 'None', 'NONE'
  ];
  
  if (invalidValues.includes(trimmed)) {
    console.log('[renderSafeDescription] 返回null - 无效值:', trimmed);
    return null;
  }
  
  // 防止纯数字或符号被意外显示
  if (/^[\d\s\W]+$/.test(trimmed) && trimmed.length < 2) {
    console.log('[renderSafeDescription] 返回null - 纯数字/符号');
    return null;
  }
  
  if (maxLength && trimmed.length > maxLength) {
    const result = `${trimmed.substring(0, maxLength)}...`;
    console.log('[renderSafeDescription] 返回截断描述:', result);
    return result;
  }
  
  console.log('[renderSafeDescription] 返回有效描述:', trimmed);
  return trimmed;
};

// 测试数据流
console.log('=== 测试1: 空字符串描述 ===');
console.log('原始数据:', testDataWithEmptyDesc);
const sanitized1 = sanitizeDescription(testDataWithEmptyDesc.description);
console.log('sanitizeDescription结果:', sanitized1);
const rendered1 = renderSafeDescription(sanitized1);
console.log('renderSafeDescription结果:', rendered1);
console.log('UI显示:', rendered1 || '无描述');

console.log('\n=== 测试2: 数字0描述 ===');
console.log('原始数据:', testDataWithZeroDesc);
const sanitized2 = sanitizeDescription(testDataWithZeroDesc.description);
console.log('sanitizeDescription结果:', sanitized2);
const rendered2 = renderSafeDescription(sanitized2);
console.log('renderSafeDescription结果:', rendered2);
console.log('UI显示:', rendered2 || '无描述');

console.log('\n=== 测试3: 字符串"0"描述 ===');
console.log('原始数据:', testDataWithStringZeroDesc);
const sanitized3 = sanitizeDescription(testDataWithStringZeroDesc.description);
console.log('sanitizeDescription结果:', sanitized3);
const rendered3 = renderSafeDescription(sanitized3);
console.log('renderSafeDescription结果:', rendered3);
console.log('UI显示:', rendered3 || '无描述');

// 测试可能的边界情况
console.log('\n=== 测试4: undefined描述 ===');
const sanitized4 = sanitizeDescription(undefined);
console.log('sanitizeDescription结果:', sanitized4);
const rendered4 = renderSafeDescription(sanitized4);
console.log('renderSafeDescription结果:', rendered4);
console.log('UI显示:', rendered4 || '无描述');

console.log('\n=== 测试5: null描述 ===');
const sanitized5 = sanitizeDescription(null);
console.log('sanitizeDescription结果:', sanitized5);
const rendered5 = renderSafeDescription(sanitized5);
console.log('renderSafeDescription结果:', rendered5);
console.log('UI显示:', rendered5 || '无描述');

console.log('\n=== 测试6: 直接传递空字符串到renderSafeDescription ===');
const rendered6 = renderSafeDescription('');
console.log('renderSafeDescription结果:', rendered6);
console.log('UI显示:', rendered6 || '无描述');

console.log('\n=== 测试7: 直接传递数字0到renderSafeDescription ===');
const rendered7 = renderSafeDescription(0);
console.log('renderSafeDescription结果:', rendered7);
console.log('UI显示:', rendered7 || '无描述');

console.log('\n=== 测试8: 直接传递字符串"0"到renderSafeDescription ===');
const rendered8 = renderSafeDescription('0');
console.log('renderSafeDescription结果:', rendered8);
console.log('UI显示:', rendered8 || '无描述');