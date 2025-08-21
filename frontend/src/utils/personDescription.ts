/**
 * 人物描述处理工具
 * 统一处理所有人物描述的验证、清理和显示逻辑
 * 确保不会显示"0"或其他无效值
 */

/**
 * 验证描述是否有效
 * @param description 要验证的描述文本
 * @returns 是否为有效的描述（非空、非"0"、有实际内容）
 */
export const hasValidDescription = (description: unknown): boolean => {
  if (typeof description !== 'string') {
    return false;
  }
  
  // 处理特殊情况：数字0、字符串"0"、null、undefined等
  const trimmed = description.trim();
  if (trimmed === '0' || trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
    return false;
  }
  
  // 防止纯数字或符号被意外显示
  if (/^[\d\s\W]+$/.test(trimmed) && trimmed.length < 2) {
    return false;
  }
  
  return trimmed.length > 0;
};

/**
 * 增强的显示值验证函数 - 用于SafeDisplay组件
 */
export const isValidDisplayValue = (value: unknown): boolean => {
  // 基本类型检查
  if (value === null || value === undefined) {
    return false;
  }
  
  // 数字0检查
  if (value === 0) {
    return false;
  }
  
  // 转换为字符串
  let strValue: string;
  try {
    strValue = String(value);
  } catch {
    return false;
  }
  
  const trimmed = strValue.trim();
  
  // 无效值检查
  const invalidValues = [
    '', '0', 'null', 'undefined', 'false', 'true',
    'NaN', 'Infinity', '-Infinity', 'none', 'None', 'NONE'
  ];
  
  if (invalidValues.includes(trimmed)) {
    return false;
  }
  
  // 防止纯数字或符号被意外显示
  if (/^[\d\s\W]+$/.test(trimmed) && trimmed.length < 2) {
    return false;
  }
  
  return trimmed.length > 0;
};

/**
 * 安全地渲染描述文本
 * 确保不会显示"0"或其他无效值
 * @param description 原始描述文本
 * @param maxLength 最大长度限制（可选）
 * @returns 清理后的描述文本，如果无效则返回null
 */
export const renderSafeDescription = (description: unknown, maxLength?: number): string | null => {
  // 首先检查是否为 undefined 或 null
  if (description === undefined || description === null) {
    return null;
  }
  
  // 处理可能的非字符串值（防御性编程）
  if (typeof description !== 'string') {
    // 如果是数字0，直接过滤
    if (description === 0) {
      return null;
    }
    // 尝试转换为字符串，但保持防御性
    try {
      description = String(description);
    } catch {
      return null;
    }
  }
  
  // 然后使用 hasValidDescription 进行验证
  if (!hasValidDescription(description)) {
    return null;
  }
  
  // 四重保护，确保万无一失
  const desc = description || '';
  const trimmed = desc.trim();
  
  // 更全面的无效值检查
  const invalidValues = [
    '', '0', 'null', 'undefined', 'false', 'true', 
    'NaN', 'Infinity', '-Infinity', 'none', 'None', 'NONE'
  ];
  
  if (invalidValues.includes(trimmed)) {
    // 添加调试日志
    if (process.env.NODE_ENV === 'development') {
      console.log('[renderSafeDescription] 过滤无效描述:', { 
        original: description, 
        trimmed,
        reason: 'invalid_value' 
      });
    }
    return null;
  }
  
  // 防止纯数字或符号被意外显示
  if (/^[\d\s\W]+$/.test(trimmed) && trimmed.length < 2) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[renderSafeDescription] 过滤纯数字/符号:', { 
        original: description, 
        trimmed,
        reason: 'pure_number_or_symbol' 
      });
    }
    return null;
  }
  
  if (maxLength && trimmed.length > maxLength) {
    return `${trimmed.substring(0, maxLength)}...`;
  }
  
  return trimmed;
};

/**
 * 计算描述文本的长度（安全版本）
 * 用于布局计算，避免空指针错误
 * @param description 描述文本
 * @returns 安全的长度值
 */
export const getSafeDescriptionLength = (description: unknown): number => {
  if (!hasValidDescription(description) || !description) {
    return 0;
  }
  
  return String(description).length;
};

/**
 * 获取描述文本的预览（用于工具提示等场景）
 * @param description 原始描述文本
 * @param previewLength 预览长度
 * @returns 预览文本，如果无效则返回默认文本
 */
export const getDescriptionPreview = (description: unknown, previewLength: number = 50): string => {
  const safeDesc = renderSafeDescription(description, previewLength);
  return safeDesc || '暂无描述';
};

/**
 * 检查描述是否需要截断
 * @param description 描述文本
 * @param maxLength 最大长度
 * @returns 是否需要截断
 */
export const isDescriptionTooLong = (description: unknown, maxLength: number): boolean => {
  if (!hasValidDescription(description)) {
    return false;
  }
  
  return String(description).length > maxLength;
};