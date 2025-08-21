/**
 * 前端调试方案：追踪"0"显示问题
 * 用于在浏览器控制台中执行，追踪数据流向
 */

console.log('=== 开始数据流调试 ===');

// 1. 检查当前使用的React hooks函数
console.log('1. 检查useRelationshipsData hook...');
const persons = window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.values()?.next()?.value?.getFiberRoots(1)?.values()?.next()?.value?.current?.child?.child?.child?.memoizedProps?.value?.persons;
if (persons) {
  console.log('找到persons数据:', persons.length, '条记录');
  
  // 检查每个person的description
  const problematicPersons = persons.filter(p => {
    const desc = p.description;
    return desc === 0 || desc === '0' || desc === '';
  });
  
  console.log('可能有问题的人物:', problematicPersons.length, '条');
  problematicPersons.forEach(p => {
    console.log(`- ${p.name} (ID: ${p.id}): description =`, p.description, typeof p.description);
  });
} else {
  console.log('无法直接访问persons数据，请使用React DevTools');
}

// 2. 检查PersonDescription组件的处理
console.log('\n2. 测试PersonDescription组件的renderSafeDescription函数...');
// 模拟各种可能的输入
const testCases = [
  { value: '', label: '空字符串' },
  { value: 0, label: '数字0' },
  { value: '0', label: '字符串0' },
  { value: null, label: 'null' },
  { value: undefined, label: 'undefined' },
  { value: '正常描述文本', label: '正常描述' }
];

// 复制renderSafeDescription函数的逻辑
const renderSafeDescription = (description, maxLength) => {
  if (description === undefined || description === null) {
    return null;
  }
  
  if (typeof description !== 'string') {
    if (description === 0) {
      return null;
    }
    try {
      description = String(description);
    } catch {
      return null;
    }
  }
  
  const desc = description || '';
  const trimmed = desc.trim();
  
  const invalidValues = [
    '', '0', 'null', 'undefined', 'false', 'true', 
    'NaN', 'Infinity', '-Infinity', 'none', 'None', 'NONE'
  ];
  
  if (invalidValues.includes(trimmed)) {
    return null;
  }
  
  if (/^[\d\s\W]+$/.test(trimmed) && trimmed.length < 2) {
    return null;
  }
  
  if (maxLength && trimmed.length > maxLength) {
    return `${trimmed.substring(0, maxLength)}...`;
  }
  
  return trimmed;
};

testCases.forEach(test => {
  const result = renderSafeDescription(test.value);
  console.log(`${test.label}:`, test.value, '=>', result, typeof result);
});

// 3. 检查是否在开发环境
console.log('\n3. 环境检查...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('是否为开发环境:', process.env.NODE_ENV === 'development');

// 4. 提供调试建议
console.log('\n=== 调试建议 ===');
console.log('1. 在浏览器中打开开发者工具');
console.log('2. 切换到Sources标签页，找到PersonDescription.tsx文件');
console.log('3. 在renderSafeDescription函数中添加断点');
console.log('4. 刷新页面，观察函数调用情况');
console.log('5. 检查传递给函数的参数值');
console.log('');
console.log('或者，可以在控制台中执行以下代码来添加调试日志：');
console.log(`
// 重写renderSafeDescription函数以添加调试日志
const originalRenderSafeDescription = window.renderSafeDescription;
window.renderSafeDescription = function(description, maxLength) {
  console.log('[DEBUG] renderSafeDescription called with:', description, typeof description);
  const result = originalRenderSafeDescription(description, maxLength);
  console.log('[DEBUG] renderSafeDescription returned:', result, typeof result);
  return result;
};
`);

// 5. 检查数据加载优先级
console.log('\n5. 数据加载优先级检查...');
console.log('当前应用是否使用了新数据文件？');
console.log('- 如果relationships_new.json存在且可访问，应该使用新数据');
console.log('- 否则回退到relationships.json');
console.log('');
console.log('可以通过检查网络请求来确认：');
console.log('1. 打开开发者工具的Network标签页');
console.log('2. 刷新页面');
console.log('3. 查看对relationships_new.json的请求状态');
console.log('4. 如果请求失败，会看到对relationships.json的请求');

console.log('\n=== 调试完成 ===');